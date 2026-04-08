import { collection, addDoc, Timestamp, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'TOOL_CREATED'
  | 'TOOL_UPDATED'
  | 'TOOL_DELETED'
  | 'TOOL_ISSUED'
  | 'TOOL_RECEIVED'
  | 'TOOL_RESERVED'
  | 'STAFF_CREATED'
  | 'STAFF_UPDATED'
  | 'STAFF_DELETED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'MAINTENANCE_LOGGED'
  | 'MAINTENANCE_UPDATED'
  | 'PERMISSION_CHANGED'
  | 'DATA_IMPORTED';

export interface AuditLogEntry {
  action: AuditAction;
  userId: string;
  userName: string;
  userEmail: string;
  targetId?: string;
  targetName?: string;
  targetType?: 'tool' | 'staff' | 'user' | 'transaction' | 'maintenance';
  details?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export async function logAction(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      ...entry,
      timestamp: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

export async function getRecentAuditLogs(
  limit_count: number = 50
): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      timestamp: doc.data().timestamp?.toDate(),
    } as AuditLogEntry & { id: string }));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

export function formatActionName(action: AuditAction): string {
  const actionNames: Record<AuditAction, string> = {
    LOGIN: 'User Login',
    LOGOUT: 'User Logout',
    TOOL_CREATED: 'Tool Created',
    TOOL_UPDATED: 'Tool Updated',
    TOOL_DELETED: 'Tool Deleted',
    TOOL_ISSUED: 'Tool Issued',
    TOOL_RECEIVED: 'Tool Received',
    TOOL_RESERVED: 'Tool Reserved',
    STAFF_CREATED: 'Staff Created',
    STAFF_UPDATED: 'Staff Updated',
    STAFF_DELETED: 'Staff Deleted',
    USER_CREATED: 'User Created',
    USER_UPDATED: 'User Updated',
    USER_DELETED: 'User Deleted',
    MAINTENANCE_LOGGED: 'Maintenance Logged',
    MAINTENANCE_UPDATED: 'Maintenance Updated',
    PERMISSION_CHANGED: 'Permissions Changed',
    DATA_IMPORTED: 'Data Imported',
  };
  return actionNames[action] || action;
}

export function getActionColor(action: AuditAction): string {
  if (action.includes('CREATED')) return 'bg-green-100 text-green-700';
  if (action.includes('UPDATED')) return 'bg-blue-100 text-blue-700';
  if (action.includes('DELETED')) return 'bg-red-100 text-red-700';
  if (action.includes('ISSUED')) return 'bg-amber-100 text-amber-700';
  if (action.includes('RECEIVED')) return 'bg-purple-100 text-purple-700';
  if (action.includes('RESERVED')) return 'bg-cyan-100 text-cyan-700';
  if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'bg-gray-100 text-gray-700';
  return 'bg-olive-100 text-olive-700';
}
