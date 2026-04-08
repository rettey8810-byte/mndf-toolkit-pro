import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Tool, Transaction } from '../types';
import { RotateCcw, CheckCircle, X } from 'lucide-react';

export default function ReceiveTools() {
  const { currentUser, hasPermission, isSuperAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [returnCondition, setReturnCondition] = useState<'Good' | 'Damaged' | 'Under Maintenance'>('Good');
  const [returnNotes, setReturnNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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

      const toolsSnapshot = await getDocs(collection(db, 'tools'));
      const toolsMap: Record<string, Tool> = {};
      toolsSnapshot.docs.forEach(doc => {
        toolsMap[doc.id] = { id: doc.id, ...doc.data() } as Tool;
      });
      setTools(toolsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction || !currentUser) return;

    try {
      const tool = tools[selectedTransaction.toolId];
      if (!tool) return;

      // Update transaction
      await updateDoc(doc(db, 'transactions', selectedTransaction.id), {
        status: 'Returned',
        actualReturnDate: new Date(),
        returnedBy: currentUser.name,
        returnCondition,
        returnNotes,
      });

      // Update tool availability
      await updateDoc(doc(db, 'tools', selectedTransaction.toolId), {
        availableQuantity: tool.availableQuantity + selectedTransaction.quantity,
        condition: returnCondition,
        updatedAt: new Date(),
      });

      setShowModal(false);
      setSelectedTransaction(null);
      setReturnCondition('Good');
      setReturnNotes('');
      fetchData();
    } catch (error) {
      console.error('Error returning tool:', error);
    }
  };

  const isOverdue = (expectedDate: Date) => {
    return new Date() > expectedDate;
  };

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
        <h2 className="text-lg font-bold text-gray-800">Receive Tools</h2>
      </div>

      {/* Borrowed Items */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tools to Receive</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No items currently borrowed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions.map((trans) => {
              const overdue = isOverdue(trans.expectedReturnDate);
              return (
                <div key={trans.id} className={`border rounded-lg p-4 ${overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{trans.toolName}</h3>
                      <p className="text-sm text-gray-500">Qty: {trans.quantity}</p>
                    </div>
                    {overdue && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Overdue
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Issued to:</span> 
                      <span className="text-olive-700 font-medium">{trans.issuedTo}</span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Issue date:</span> {trans.issueDate?.toLocaleDateString()}
                    </p>
                    <p className={`${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      <span className="font-medium">Expected return:</span> {trans.expectedReturnDate?.toLocaleDateString()}
                    </p>
                  </div>
                  {(hasPermission('returnTools') || isSuperAdmin()) && (
                    <button
                      onClick={() => {
                        setSelectedTransaction(trans);
                        setShowModal(true);
                      }}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Receive Tool
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Receive Tool</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">{selectedTransaction.toolName}</p>
                <p className="text-sm text-gray-600">Quantity: {selectedTransaction.quantity}</p>
                <p className="text-sm text-gray-600">Issued to: <span className="text-olive-700 font-medium">{selectedTransaction.issuedTo}</span></p>
              </div>

              <form onSubmit={handleReturn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Condition
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Any issues or observations..."
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
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Confirm Receive
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
