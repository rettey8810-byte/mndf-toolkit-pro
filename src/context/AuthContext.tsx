import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { User, UserPermissions } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (email: string, password: string, name: string, permissions?: Partial<UserPermissions>) => Promise<void>;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  isSuperAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const defaultPermissions: UserPermissions = {
  viewInventory: true,
  addTools: false,
  editTools: false,
  deleteTools: false,
  lendTools: false,
  returnTools: false,
  maintenanceAccess: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: uid,
        email: data.email,
        name: data.name,
        role: data.role,
        permissions: data.permissions || defaultPermissions,
        createdAt: data.createdAt?.toDate(),
      } as User;
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    try {
      const userData = await fetchUserData(result.user.uid);
      if (!userData) {
        throw new Error('User account not found in database. Please contact an administrator.');
      }
      setCurrentUser(userData);
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code?.includes('permission')) {
        throw new Error('Firestore permission denied. Please ask the admin to set up security rules.');
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const createUser = async (
    email: string,
    password: string,
    name: string,
    permissions?: Partial<UserPermissions>
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: Omit<User, 'id'> = {
      email,
      name,
      role: 'user',
      permissions: { ...defaultPermissions, ...permissions },
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', result.user.uid), newUser);
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    return currentUser.permissions[permission] || false;
  };

  const isSuperAdmin = (): boolean => {
    return currentUser?.role === 'super_admin';
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userData = await fetchUserData(auth.currentUser.uid);
      setCurrentUser(userData);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    logout,
    createUser,
    hasPermission,
    isSuperAdmin,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
