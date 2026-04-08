import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats, Tool, Transaction, Staff } from '../types';
import ImportToolsButton from '../components/ImportToolsButton';
import SessionTimeout from '../components/SessionTimeout';
import { format, subDays } from 'date-fns';
import { 
  Package, CheckCircle, ArrowRightLeft, Wrench, AlertCircle,
  TrendingUp, Clock, RotateCcw, Users, Calendar, Activity
} from 'lucide-react';

export default function EnhancedDashboard() {
  const { hasPermission, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTools: 0, availableTools: 0, borrowedTools: 0,
    underMaintenance: 0, overdueItems: 0, lowStockItems: 0,
  });
  const [tools, setTools] = useState<Tool[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [toolsSnap, transSnap, staffSnap] = await Promise.all([
        getDocs(collection(db, 'tools')),
        getDocs(query(collection(db, 'transactions'), orderBy('issueDate', 'desc'), limit(50))),
        getDocs(collection(db, 'staff'))
      ]);

      const toolsData = toolsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Tool));
      const transData = transSnap.docs.map(d => ({ 
        ...d.data(), 
        id: d.id,
        issueDate: d.data().issueDate?.toDate(),
        expectedReturnDate: d.data().expectedReturnDate?.toDate(),
        actualReturnDate: d.data().actualReturnDate?.toDate(),
      } as Transaction));
      const staffData = staffSnap.docs.map(d => ({ ...d.data(), id: d.id } as Staff));

      setTools(toolsData);
      setTransactions(transData);
      setStaff(staffData);

      // Calculate stats
      const now = new Date();
      const totalTools = toolsData.reduce((sum, t) => sum + t.quantity, 0);
      const availableTools = toolsData.reduce((sum, t) => sum + t.availableQuantity, 0);
      
      setStats({
        totalTools,
        availableTools,
        borrowedTools: totalTools - availableTools,
        underMaintenance: toolsData.filter(t => t.condition === 'Under Maintenance').length,
        overdueItems: transData.filter(t => t.status === 'Borrowed' && t.expectedReturnDate < now).length,
        lowStockItems: toolsData.filter(t => t.availableQuantity < 5).length,
      });

      // Weekly activity data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, 6 - i);
        const dayTrans = transData.filter(t => 
          t.issueDate && format(t.issueDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        return {
          day: format(date, 'EEE'),
          issued: dayTrans.filter(t => t.status === 'Borrowed').length,
          returned: dayTrans.filter(t => t.status === 'Returned').length,
        };
      });
      setWeeklyData(last7Days);

      // Category breakdown
      const categories = toolsData.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.quantity;
        return acc;
      }, {} as Record<string, number>);
      
      setCategoryData(Object.entries(categories).map(([name, value]) => ({ name, value })));

      // Recent activity
      setRecentActivity(transData.slice(0, 10));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Tools', value: stats.totalTools, icon: Package, color: 'from-olive-600 to-olive-700', border: 'border-olive-200' },
    { title: 'Available', value: stats.availableTools, icon: CheckCircle, color: 'from-green-600 to-green-700', border: 'border-green-200' },
    { title: 'Borrowed', value: stats.borrowedTools, icon: ArrowRightLeft, color: 'from-sand-500 to-sand-600', border: 'border-sand-200' },
    { title: 'Maintenance', value: stats.underMaintenance, icon: Wrench, color: 'from-amber-600 to-amber-700', border: 'border-amber-200' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-olive-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SessionTimeout />
      
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-olive-700 to-olive-600 text-white rounded-xl p-6 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-olive-100">Welcome back! Here's your overview.</p>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-olive-200">Active Staff</p>
            <p className="text-2xl font-bold">{staff.length}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-xl shadow-md border-l-4 ${stat.border} p-5 hover:shadow-lg transition-all transform hover:-translate-y-1`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - CSS Based */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-olive-600" />
            <h3 className="text-lg font-bold text-gray-800">Weekly Activity</h3>
          </div>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {weeklyData.map((day, i) => {
                const max = Math.max(...weeklyData.map(d => Math.max(d.issued, d.returned)), 1);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 justify-center" style={{ height: '80%' }}>
                      <div 
                        className="w-3 bg-olive-500 rounded-t"
                        style={{ height: `${(day.issued / max) * 100}%` }}
                        title={`Issued: ${day.issued}`}
                      />
                      <div 
                        className="w-3 bg-sand-400 rounded-t"
                        style={{ height: `${(day.returned / max) * 100}%` }}
                        title={`Returned: ${day.returned}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-olive-500 rounded"></span> Issued</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sand-400 rounded"></span> Returned</span>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-olive-600" />
            <h3 className="text-lg font-bold text-gray-800">Tools by Category</h3>
          </div>
          <div className="space-y-3">
            {categoryData.map((cat, i) => {
              const total = categoryData.reduce((s, c) => s + c.value, 0);
              const percent = total ? (cat.value / total) * 100 : 0;
              const colors = ['bg-olive-600', 'bg-sand-500', 'bg-amber-600', 'bg-blue-600', 'bg-purple-600'];
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-500">{cat.value} ({percent.toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-gray-800">Alerts</h3>
          </div>
          <div className="space-y-3">
            {stats.overdueItems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Clock className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-700">{stats.overdueItems} Overdue</p>
                  <p className="text-xs text-red-600">Items need immediate attention</p>
                </div>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-700">{stats.lowStockItems} Low Stock</p>
                  <p className="text-xs text-amber-600">Less than 5 units available</p>
                </div>
              </div>
            )}
            {!stats.overdueItems && !stats.lowStockItems && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700">All systems operational</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-olive-600" />
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Tool</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Staff</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Action</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentActivity.slice(0, 5).map((act, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 font-medium text-gray-800">{act.toolName}</td>
                    <td className="py-2 text-gray-600">{act.issuedTo}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        act.status === 'Borrowed' ? 'bg-amber-100 text-amber-700' :
                        act.status === 'Returned' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">
                      {act.issueDate ? format(act.issueDate, 'MMM dd, HH:mm') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {hasPermission('addTools') && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-4 bg-olive-600 text-white rounded-xl hover:bg-olive-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <Package className="w-5 h-5" />
              <span className="font-medium">Add New Tool</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-4 bg-sand-500 text-white rounded-xl hover:bg-sand-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <ArrowRightLeft className="w-5 h-5" />
              <span className="font-medium">Issue Tool</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <RotateCcw className="w-5 h-5" />
              <span className="font-medium">Receive Tool</span>
            </button>
          </div>
        </div>
      )}

      {/* Database Setup - Admin Only */}
      {isSuperAdmin() && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Database Setup</h3>
          <ImportToolsButton />
        </div>
      )}
    </div>
  );
}
