import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats, Tool, Transaction } from '../types';
import ImportToolsButton from '../components/ImportToolsButton';
import { 
  Package, 
  CheckCircle, 
  ArrowRightLeft, 
  Wrench, 
  AlertCircle,
  TrendingUp,
  Clock,
  RotateCcw
} from 'lucide-react';

export default function Dashboard() {
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTools: 0,
    availableTools: 0,
    borrowedTools: 0,
    underMaintenance: 0,
    overdueItems: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch tools
      const toolsSnapshot = await getDocs(collection(db, 'tools'));
      const tools = toolsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Tool));
      
      // Fetch transactions
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const transactions = transactionsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));

      const now = new Date();
      
      // Calculate stats
      const totalTools = tools.reduce((sum, tool) => sum + tool.quantity, 0);
      const availableTools = tools.reduce((sum, tool) => sum + tool.availableQuantity, 0);
      const borrowedTools = totalTools - availableTools;
      const underMaintenance = tools.filter(t => t.condition === 'Under Maintenance').length;
      
      const overdueItems = transactions.filter(t => 
        t.status === 'Borrowed' && new Date(t.expectedReturnDate) < now
      ).length;
      
      const lowStockItems = tools.filter(t => t.availableQuantity < 3).length;

      setStats({
        totalTools,
        availableTools,
        borrowedTools,
        underMaintenance,
        overdueItems,
        lowStockItems,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Tools', 
      value: stats.totalTools, 
      icon: Package, 
      bgColor: 'from-olive-600 to-olive-700',
      borderColor: 'border-olive-200'
    },
    { 
      title: 'Available', 
      value: stats.availableTools, 
      icon: CheckCircle, 
      bgColor: 'from-green-600 to-green-700',
      borderColor: 'border-green-200'
    },
    { 
      title: 'Borrowed', 
      value: stats.borrowedTools, 
      icon: ArrowRightLeft, 
      bgColor: 'from-sand-500 to-sand-600',
      borderColor: 'border-sand-200'
    },
    { 
      title: 'Maintenance', 
      value: stats.underMaintenance, 
      icon: Wrench, 
      bgColor: 'from-amber-600 to-amber-700',
      borderColor: 'border-amber-200'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-xl shadow-sm border-l-4 ${stat.borderColor} p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.bgColor} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {(stats.overdueItems > 0 || stats.lowStockItems > 0) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Alerts
          </h2>
          <div className="space-y-3">
            {stats.overdueItems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <Clock className="w-5 h-5 text-red-500" />
                <span className="text-red-700">
                  <strong>{stats.overdueItems}</strong> items are overdue and need to be returned
                </span>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-700">
                  <strong>{stats.lowStockItems}</strong> tools have low stock (less than 3 available)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {hasPermission('addTools') && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition-all shadow-sm hover:shadow">
              <Package className="w-5 h-5" />
              <span className="font-medium">Add New Tool</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-sand-500 text-white rounded-lg hover:bg-sand-600 transition-all shadow-sm hover:shadow">
              <ArrowRightLeft className="w-5 h-5" />
              <span className="font-medium">Lend Tool</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all shadow-sm hover:shadow">
              <RotateCcw className="w-5 h-5" />
              <span className="font-medium">Return Tool</span>
            </button>
          </div>
        </div>
      )}

      {/* Import Tools - Super Admin Only */}
      {hasPermission('addTools') && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Database Setup</h2>
          <ImportToolsButton />
        </div>
      )}
    </div>
  );
}
