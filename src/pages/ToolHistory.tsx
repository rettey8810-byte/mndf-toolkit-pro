import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import type { Tool, Transaction, MaintenanceLog } from '../types';
import { 
  History, Package, ArrowRightLeft, Wrench,
  User, ChevronLeft, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface ToolHistoryEvent {
  id: string;
  type: 'created' | 'issued' | 'returned' | 'maintenance' | 'updated';
  date: Date;
  description: string;
  details?: Record<string, any>;
  performedBy?: string;
}

export default function ToolHistory() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [history, setHistory] = useState<ToolHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToolHistory();
  }, [toolId]);

  const fetchToolHistory = async () => {
    if (!toolId) return;
    
    try {
      // Fetch tool details
      const toolsSnap = await getDocs(query(collection(db, 'tools'), where('__name__', '==', toolId)));
      const toolData = toolsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Tool))[0];
      setTool(toolData);

      // Fetch transactions
      const transSnap = await getDocs(
        query(collection(db, 'transactions'), where('toolId', '==', toolId), orderBy('issueDate', 'desc'))
      );
      const transactions = transSnap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        issueDate: d.data().issueDate?.toDate(),
        actualReturnDate: d.data().actualReturnDate?.toDate(),
      } as Transaction));

      // Fetch maintenance logs
      const maintSnap = await getDocs(
        query(collection(db, 'maintenance'), where('toolId', '==', toolId), orderBy('date', 'desc'))
      );
      const maintenance = maintSnap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        date: d.data().date?.toDate(),
        completedDate: d.data().completedDate?.toDate(),
      } as MaintenanceLog));

      // Build history events
      const events: ToolHistoryEvent[] = [];

      // Add creation event
      if (toolData) {
        events.push({
          id: 'created',
          type: 'created',
          date: toolData.createdAt,
          description: `Tool added to inventory`,
          details: { quantity: toolData.quantity, location: toolData.location },
        });
      }

      // Add transaction events
      transactions.forEach(t => {
        events.push({
          id: `issue-${t.id}`,
          type: 'issued',
          date: t.issueDate,
          description: `Issued to ${t.issuedTo}`,
          details: { quantity: t.quantity, expectedReturn: t.expectedReturnDate },
          performedBy: t.issuedBy,
        });

        if (t.actualReturnDate) {
          events.push({
            id: `return-${t.id}`,
            type: 'returned',
            date: t.actualReturnDate,
            description: `Returned by ${t.issuedTo}`,
            details: { condition: t.returnCondition },
            performedBy: t.returnedBy,
          });
        }
      });

      // Add maintenance events
      maintenance.forEach(m => {
        events.push({
          id: `maint-${m.id}`,
          type: 'maintenance',
          date: m.date,
          description: `Maintenance: ${m.issueDescription}`,
          details: { technician: m.technician, status: m.status, cost: m.cost },
        });
      });

      // Sort by date descending
      events.sort((a, b) => b.date.getTime() - a.date.getTime());
      setHistory(events);
      
    } catch (error) {
      console.error('Error fetching tool history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: ToolHistoryEvent['type']) => {
    switch (type) {
      case 'created': return <Package className="w-5 h-5 text-green-600" />;
      case 'issued': return <ArrowRightLeft className="w-5 h-5 text-amber-600" />;
      case 'returned': return <Package className="w-5 h-5 text-blue-600" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-purple-600" />;
      case 'updated': return <History className="w-5 h-5 text-gray-600" />;
      default: return <History className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventColor = (type: ToolHistoryEvent['type']) => {
    switch (type) {
      case 'created': return 'bg-green-50 border-green-200';
      case 'issued': return 'bg-amber-50 border-amber-200';
      case 'returned': return 'bg-blue-50 border-blue-200';
      case 'maintenance': return 'bg-purple-50 border-purple-200';
      case 'updated': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-800">Tool Not Found</h2>
        <button
          onClick={() => navigate('/tools')}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-olive-600 text-white rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tools
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tools')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Tool History</h2>
          <p className="text-gray-500">{tool.name}</p>
        </div>
      </div>

      {/* Tool Info Card */}
      <div className="bg-gradient-to-r from-olive-50 to-olive-100 rounded-xl p-6 border border-olive-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-olive-600 font-medium">Tool ID</p>
            <p className="text-lg font-bold text-gray-800">{tool.toolId}</p>
          </div>
          <div>
            <p className="text-sm text-olive-600 font-medium">Category</p>
            <p className="text-lg font-bold text-gray-800">{tool.category}</p>
          </div>
          <div>
            <p className="text-sm text-olive-600 font-medium">Available</p>
            <p className="text-lg font-bold text-gray-800">{tool.availableQuantity} / {tool.quantity}</p>
          </div>
          <div>
            <p className="text-sm text-olive-600 font-medium">Condition</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              tool.condition === 'Good' ? 'bg-green-100 text-green-700' :
              tool.condition === 'Damaged' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {tool.condition}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-olive-600" />
          Lifecycle Timeline
        </h3>

        <div className="space-y-4">
          {history.map((event, index) => (
            <div key={event.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                {index < history.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 pb-6">
                <div className={`p-4 rounded-lg border ${getEventColor(event.type)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{event.description}</p>
                      {event.performedBy && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          By: {event.performedBy}
                        </p>
                      )}
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                          {event.details.quantity && (
                            <p>Quantity: {event.details.quantity}</p>
                          )}
                          {event.details.condition && (
                            <p>Condition: {event.details.condition}</p>
                          )}
                          {event.details.technician && (
                            <p>Technician: {event.details.technician}</p>
                          )}
                          {event.details.status && (
                            <p>Status: {event.details.status}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {format(event.date, 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(event.date, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No history events found</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-200">
          <p className="text-xs text-gray-500 uppercase">Times Issued</p>
          <p className="text-2xl font-bold text-gray-800">
            {history.filter(h => h.type === 'issued').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-200">
          <p className="text-xs text-gray-500 uppercase">Times Returned</p>
          <p className="text-2xl font-bold text-gray-800">
            {history.filter(h => h.type === 'returned').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-200">
          <p className="text-xs text-gray-500 uppercase">Maintenance</p>
          <p className="text-2xl font-bold text-gray-800">
            {history.filter(h => h.type === 'maintenance').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-olive-200">
          <p className="text-xs text-gray-500 uppercase">Days in Service</p>
          <p className="text-2xl font-bold text-gray-800">
            {tool.createdAt ? Math.floor((Date.now() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
