export interface UserPermissions {
  viewInventory: boolean;
  addTools: boolean;
  editTools: boolean;
  deleteTools: boolean;
  lendTools: boolean;
  returnTools: boolean;
  maintenanceAccess: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'user';
  permissions: UserPermissions;
  createdAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  category: 'IT Equipment' | 'Carpentry Tools';
  toolId: string;
  quantity: number;
  availableQuantity: number;
  condition: 'Good' | 'Damaged' | 'Under Maintenance';
  location: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  toolId: string;
  toolName: string;
  quantity: number;
  issuedTo: string;
  issueDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  status: 'Borrowed' | 'Returned' | 'Overdue';
  issuedBy: string;
  returnedBy?: string;
  returnCondition?: 'Good' | 'Damaged' | 'Under Maintenance';
  returnNotes?: string;
  notes?: string;
}

export interface MaintenanceLog {
  id: string;
  toolId: string;
  toolName: string;
  issueDescription: string;
  date: Date;
  technician: string;
  cost: number;
  status: 'Under Maintenance' | 'Fixed' | 'Scrap';
  completedDate?: Date;
  notes?: string;
}

export interface DashboardStats {
  totalTools: number;
  availableTools: number;
  borrowedTools: number;
  underMaintenance: number;
  overdueItems: number;
  lowStockItems: number;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  rank: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
}
