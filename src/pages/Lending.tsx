import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Tool, Transaction, Staff } from '../types';
import { Search, X, ArrowRightCircle } from 'lucide-react';

export default function IssueTools() {
  const { currentUser, hasPermission, isSuperAdmin } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    toolId: '',
    quantity: 1,
    issuedTo: '',
    expectedReturnDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tools
      const toolsSnapshot = await getDocs(collection(db, 'tools'));
      const toolsData = toolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tool));
      setTools(toolsData);

      // Fetch active transactions
      const transSnapshot = await getDocs(
        query(collection(db, 'transactions'), where('status', '==', 'Borrowed'))
      );
      const transData = transSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        issueDate: doc.data().issueDate?.toDate(),
        expectedReturnDate: doc.data().expectedReturnDate?.toDate(),
      } as Transaction));
      setTransactions(transData);

      // Fetch staff
      const staffSnapshot = await getDocs(collection(db, 'staff'));
      const staffData = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Staff));
      setStaff(staffData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !currentUser) return;

    try {
      const transaction = {
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        quantity: formData.quantity,
        issuedTo: formData.issuedTo,
        issueDate: new Date(),
        expectedReturnDate: new Date(formData.expectedReturnDate),
        status: 'Borrowed',
        issuedBy: currentUser.name,
        notes: formData.notes,
      };

      await addDoc(collection(db, 'transactions'), transaction);

      await updateDoc(doc(db, 'tools', selectedTool.id), {
        availableQuantity: selectedTool.availableQuantity - formData.quantity,
      });

      setShowModal(false);
      setSelectedTool(null);
      setFormData({
        toolId: '',
        quantity: 1,
        issuedTo: '',
        expectedReturnDate: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error lending tool:', error);
    }
  };

  const availableTools = tools.filter(t => t.availableQuantity > 0);
  const filteredTools = availableTools.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h2 className="text-lg font-bold text-gray-800">Issue Tools</h2>
        {(hasPermission('lendTools') || isSuperAdmin()) && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700"
          >
            <ArrowRightCircle className="w-5 h-5" />
            Issue Tool
          </button>
        )}
      </div>

      {/* Active Issued Tools */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Issues</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active loans</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tool</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Issued To</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Issue Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Expected Return</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((trans) => (
                  <tr key={trans.id}>
                    <td className="px-4 py-3 font-medium text-gray-800">{trans.toolName}</td>
                    <td className="px-4 py-3 text-gray-600">{trans.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{trans.issuedTo}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {trans.issueDate?.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {trans.expectedReturnDate?.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Borrowed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available Tools */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Tools</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search available tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <h3 className="font-medium text-gray-800">{tool.name}</h3>
              <p className="text-sm text-gray-500">{tool.toolId}</p>
              <p className="text-sm text-green-600 mt-1">
                {tool.availableQuantity} available
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lend Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Issue Tool</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleLend} className="space-y-4">
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
                    {availableTools.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name} ({tool.availableQuantity} available)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedTool && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedTool.availableQuantity}
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issue To Staff</label>
                      <select
                        required
                        value={formData.issuedTo}
                        onChange={(e) => {
                          const staffMember = staff.find(s => s.name === e.target.value);
                          setSelectedStaff(staffMember || null);
                          setFormData({...formData, issuedTo: e.target.value});
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                      >
                        <option value="">Select Staff Member</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} - {s.rank} ({s.department})
                          </option>
                        ))}
                      </select>
                      {selectedStaff && (
                        <p className="mt-1 text-xs text-gray-500">
                          Contact: {selectedStaff.phone} | {selectedStaff.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
                      <input
                        type="date"
                        required
                        value={formData.expectedReturnDate}
                        onChange={(e) => setFormData({...formData, expectedReturnDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                      />
                    </div>
                  </>
                )}
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Issue Tool
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
