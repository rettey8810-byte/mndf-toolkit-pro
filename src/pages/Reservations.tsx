import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Tool, Staff } from '../types';
import { Plus, Trash2, X, Calendar, CheckCircle, Bookmark } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface Reservation {
  id: string;
  toolId: string;
  toolName: string;
  staffId: string;
  staffName: string;
  staffRank: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export default function Reservations() {
  const { currentUser, hasPermission, isSuperAdmin } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    toolId: '',
    staffId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    purpose: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resSnap, toolsSnap, staffSnap] = await Promise.all([
        getDocs(query(collection(db, 'reservations'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'tools')),
        getDocs(collection(db, 'staff'))
      ]);

      const resData = resSnap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        startDate: d.data().startDate?.toDate(),
        endDate: d.data().endDate?.toDate(),
        createdAt: d.data().createdAt?.toDate(),
        approvedAt: d.data().approvedAt?.toDate(),
      } as Reservation));

      setReservations(resData);
      setTools(toolsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Tool)));
      setStaff(staffSnap.docs.map(d => ({ ...d.data(), id: d.id } as Staff)));
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const selectedTool = tools.find(t => t.id === formData.toolId);
    const selectedStaff = staff.find(s => s.id === formData.staffId);

    if (!selectedTool || !selectedStaff) return;

    try {
      await addDoc(collection(db, 'reservations'), {
        toolId: formData.toolId,
        toolName: selectedTool.name,
        staffId: formData.staffId,
        staffName: selectedStaff.name,
        staffRank: selectedStaff.rank,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        purpose: formData.purpose,
        notes: formData.notes,
        status: 'Pending',
        createdAt: new Date(),
        requestedBy: currentUser.name,
      });

      setShowModal(false);
      setFormData({
        toolId: '',
        staffId: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        purpose: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  const updateStatus = async (reservation: Reservation, newStatus: Reservation['status']) => {
    try {
      await updateDoc(doc(db, 'reservations', reservation.id), {
        status: newStatus,
        approvedBy: newStatus === 'Approved' ? currentUser?.name : null,
        approvedAt: newStatus === 'Approved' ? new Date() : null,
      });
      fetchData();
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isUpcoming = (res: Reservation) => isAfter(res.startDate, new Date());
  const isOverdue = (res: Reservation) => 
    (res.status === 'Approved' || res.status === 'Pending') && 
    isBefore(res.endDate, new Date());

  const upcomingReservations = reservations.filter(isUpcoming);
  const overdueReservations = reservations.filter(isOverdue);

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
          <Bookmark className="w-7 h-7 text-olive-600" />
          <h2 className="text-lg font-bold text-gray-800">Tool Reservations</h2>
        </div>
        {(hasPermission('lendTools') || isSuperAdmin()) && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700"
          >
            <Plus className="w-5 h-5" />
            New Reservation
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
          <p className="text-2xl font-bold text-gray-800">
            {reservations.filter(r => r.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Approved</p>
          <p className="text-2xl font-bold text-gray-800">
            {reservations.filter(r => r.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Upcoming</p>
          <p className="text-2xl font-bold text-gray-800">{upcomingReservations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
          <p className="text-2xl font-bold text-gray-800">{overdueReservations.length}</p>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tool</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{res.toolName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-800">{res.staffName}</p>
                    <p className="text-xs text-gray-500">{res.staffRank}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{format(res.startDate, 'MMM dd')}</span>
                      <span className="text-gray-400">→</span>
                      <span>{format(res.endDate, 'MMM dd')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 truncate max-w-xs">{res.purpose}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {res.status === 'Pending' && isSuperAdmin() && (
                        <>
                          <button
                            onClick={() => updateStatus(res, 'Approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(res, 'Rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {(res.status === 'Pending' || res.status === 'Approved') && (
                        <button
                          onClick={() => updateStatus(res, 'Cancelled')}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reservations.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reservations found</p>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">New Reservation</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tool</label>
                  <select
                    required
                    value={formData.toolId}
                    onChange={(e) => setFormData({ ...formData, toolId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  >
                    <option value="">Select Tool</option>
                    {tools.filter(t => t.availableQuantity > 0).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.availableQuantity} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
                  <select
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  >
                    <option value="">Select Staff</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - {s.rank}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <input
                    type="text"
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                    placeholder="Why is this tool needed?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                    rows={2}
                    placeholder="Any additional information..."
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
                    className="flex-1 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700"
                  >
                    Submit Request
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

