import { useEffect, useState } from 'react';
import { subscribeToAuditLogs, formatActionName, getActionColor, type AuditLogEntry } from '../scripts/auditLog';
import { useAuth } from '../context/AuthContext';
import { Shield, History, Filter, Download, X } from 'lucide-react';

export default function AuditLogs() {
  const { isSuperAdmin } = useAuth();
  const [logs, setLogs] = useState<(AuditLogEntry & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs((newLogs) => {
      setLogs(newLogs);
      setLoading(false);
    }, 100);
    
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => 
    !filter || 
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.userName?.toLowerCase().includes(filter.toLowerCase()) ||
    log.targetName?.toLowerCase().includes(filter.toLowerCase())
  );

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'User Email', 'Target', 'Target Type', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp?.toLocaleString(),
        formatActionName(log.action),
        log.userName,
        log.userEmail,
        log.targetName || '',
        log.targetType || '',
        JSON.stringify(log.details || {})
      ].map(field => `"${String(field).replace(/"/g, '""')}"`))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isSuperAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-500">Only Super Admins can view audit logs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <History className="w-7 h-7 text-olive-600" />
          <h2 className="text-lg font-bold text-gray-800">Audit Logs</h2>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-olive-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Actions</p>
          <p className="text-2xl font-bold text-gray-800">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Creations</p>
          <p className="text-2xl font-bold text-gray-800">
            {logs.filter(l => l.action.includes('CREATED')).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Updates</p>
          <p className="text-2xl font-bold text-gray-800">
            {logs.filter(l => l.action.includes('UPDATED')).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Deletions</p>
          <p className="text-2xl font-bold text-gray-800">
            {logs.filter(l => l.action.includes('DELETED')).length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by action, user, or target..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-sm text-gray-600">
                      {log.timestamp?.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {log.timestamp?.toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {formatActionName(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{log.userName}</p>
                    <p className="text-xs text-gray-500">{log.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    {log.targetName ? (
                      <div>
                        <p className="text-sm text-gray-800">{log.targetName}</p>
                        {log.targetType && (
                          <p className="text-xs text-gray-500 capitalize">{log.targetType}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <div className="text-xs text-gray-500 space-y-1">
                        {Object.entries(log.details).slice(0, 2).map(([key, value]) => (
                          <p key={key}><span className="font-medium">{key}:</span> {String(value)}</p>
                        ))}
                        {Object.keys(log.details).length > 2 && (
                          <p className="text-gray-400">+{Object.keys(log.details).length - 2} more</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
