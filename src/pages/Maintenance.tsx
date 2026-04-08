import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Tool, MaintenanceLog } from '../types';
import { Wrench, Plus, X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Maintenance() {
  const { currentUser, hasPermission, isSuperAdmin } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    toolId: '',
    issueDescription: '',
    technician: '',
    cost: 0,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const toolsSnapshot = await getDocs(collection(db, 'tools'));
      const toolsData = toolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tool));
      setTools(toolsData);

      const logsSnapshot = await getDocs(collection(db, 'maintenance_logs'));
      const logsData = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        completedDate: doc.data().completedDate?.toDate(),
      } as MaintenanceLog));
      setLogs(logsData.sort((a, b) => b.date.getTime() - a.date.getTime()));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !currentUser) return;

    try {
      const log = {
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        issueDescription: formData.issueDescription,
        date: new Date(),
        technician: formData.technician,
        cost: formData.cost,
        status: 'Under Maintenance',
        notes: formData.notes,
      };

      await addDoc(collection(db, 'maintenance_logs'), log);

      await updateDoc(doc(db, 'tools', selectedTool.id), {
        condition: 'Under Maintenance',
        updatedAt: new Date(),
      });

      setShowModal(false);
      setSelectedTool(null);
      setFormData({
        toolId: '',
        issueDescription: '',
        technician: '',
        cost: 0,
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error sending to maintenance:', error);
    }
  };

  const handleCompleteMaintenance = async (log: MaintenanceLog, newStatus: 'Fixed' | 'Scrap') => {
    try {
      await updateDoc(doc(db, 'maintenance_logs', log.id), {
        status: newStatus,
        completedDate: new Date(),
      });

      await updateDoc(doc(db, 'tools', log.toolId), {
        condition: newStatus === 'Fixed' ? 'Good' : 'Damaged',
        updatedAt: new Date(),
      });

      fetchData();
    } catch (error) {
      console.error('Error completing maintenance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Maintenance': return 'bg-orange-100 text-orange-700';
      case 'Fixed': return 'bg-green-100 text-green-700';
      case 'Scrap': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-800">Maintenance</h2>
        {(hasPermission('maintenanceAccess') || isSuperAdmin()) && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus className="w-5 h-5" />
            Send to Maintenance
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Under Maintenance</p>
              <p className="text-2xl font-bold text-orange-700">
                {logs.filter(l => l.status === 'Under Maintenance').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Fixed This Month</p>
              <p className="text-2xl font-bold text-green-700">
                {logs.filter(l => l.status === 'Fixed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Scrapped</p>
              <p className="text-2xl font-bold text-red-700">
                {logs.filter(l => l.status === 'Scrap').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Logs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Maintenance History</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No maintenance records</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tool</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Issue</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Technician</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 font-medium text-gray-800">{log.toolName}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.issueDescription}</td>
                    <td className="px-4 py-3 text-gray-600">{log.technician}</td>
                    <td className="px-4 py-3 text-gray-600">${log.cost}</td>
                    <td className="px-4 py-3 text-gray-600">{log.date?.toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.status === 'Under Maintenance' && (hasPermission('maintenanceAccess') || isSuperAdmin()) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCompleteMaintenance(log, 'Fixed')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                          >
                            Fixed
                          </button>
                          <button
                            onClick={() => handleCompleteMaintenance(log, 'Scrap')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                          >
                            Scrap
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send to Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Send to Maintenance</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSendToMaintenance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Tool</label>
                  <select
                    required
                    value={formData.toolId}
                    onChange={(e) => {
                      const tool = tools.find(t => t.id === e.target.value);
                      setSelectedTool(tool || null);
                      setFormData({...formData, toolId: e.target.value});
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Choose a tool...</option>
                    {tools.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name} ({tool.condition})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <textarea
                    required
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Describe the issue..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                  <input
                    type="text"
                    required
                    value={formData.technician}
                    onChange={(e) => setFormData({...formData, technician: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Technician name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedTool}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    Send to Maintenance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
