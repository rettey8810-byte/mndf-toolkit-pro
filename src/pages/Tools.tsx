import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Tool } from '../types';
import { Plus, Search, Edit2, Trash2, X, ArrowRightLeft, CheckCircle } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { logAction } from '../scripts/auditLog';

interface ToolFormData {
  name: string;
  category: 'IT Equipment' | 'Carpentry Tools';
  quantity: number;
  condition: 'Good' | 'Damaged' | 'Under Maintenance';
  location: string;
  imageUrl?: string;
}

export default function Tools() {
  const { hasPermission, isSuperAdmin, currentUser } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [viewingTool, setViewingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    category: 'IT Equipment',
    quantity: 1,
    condition: 'Good',
    location: '',
  });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const q = query(collection(db, 'tools'), orderBy('name'));
      const snapshot = await getDocs(q);
      const toolsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Tool));
      setTools(toolsData);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTool = {
        ...formData,
        toolId: `TOOL-${Date.now()}`,
        availableQuantity: formData.quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = await addDoc(collection(db, 'tools'), newTool);
      
      // Log audit action
      await logAction({
        action: 'TOOL_CREATED',
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || currentUser?.email || 'Unknown',
        userEmail: currentUser?.email || 'unknown',
        targetId: docRef.id,
        targetName: formData.name,
        targetType: 'tool',
        details: { category: formData.category, quantity: formData.quantity },
      });
      
      setShowAddModal(false);
      setFormData({
        name: '',
        category: 'IT Equipment',
        quantity: 1,
        condition: 'Good',
        location: '',
      });
      fetchTools();
    } catch (error) {
      console.error('Error adding tool:', error);
    }
  };

  const handleEditTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;
    
    try {
      const diff = formData.quantity - editingTool.quantity;
      const updatedTool = {
        ...formData,
        availableQuantity: Math.max(0, editingTool.availableQuantity + diff),
        updatedAt: new Date(),
      };
      await updateDoc(doc(db, 'tools', editingTool.id), updatedTool);
      
      // Log audit action
      await logAction({
        action: 'TOOL_UPDATED',
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'Unknown',
        userEmail: currentUser?.email || 'unknown',
        targetId: editingTool.id,
        targetName: formData.name,
        targetType: 'tool',
        details: { category: formData.category, quantity: formData.quantity },
        oldValues: { quantity: editingTool.quantity, condition: editingTool.condition },
        newValues: { quantity: formData.quantity, condition: formData.condition },
      });
      
      setShowEditModal(false);
      setEditingTool(null);
      fetchTools();
    } catch (error) {
      console.error('Error updating tool:', error);
    }
  };

  const handleDeleteTool = async (tool: Tool) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    try {
      await deleteDoc(doc(db, 'tools', tool.id));
      
      // Log audit action
      await logAction({
        action: 'TOOL_DELETED',
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'Unknown',
        userEmail: currentUser?.email || 'unknown',
        targetId: tool.id,
        targetName: tool.name,
        targetType: 'tool',
        details: { category: tool.category },
      });
      
      fetchTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  };

  const openEditModal = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      category: tool.category,
      quantity: tool.quantity,
      condition: tool.condition,
      location: tool.location,
      imageUrl: tool.imageUrl,
    });
    setShowEditModal(true);
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.toolId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || tool.category === filterCategory;
    const matchesCondition = filterCondition === 'all' || tool.condition === filterCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Good': return 'bg-green-100 text-green-700';
      case 'Damaged': return 'bg-red-100 text-red-700';
      case 'Under Maintenance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
        <h2 className="text-lg font-bold text-gray-800">Tool Inventory</h2>
        {(hasPermission('addTools') || isSuperAdmin()) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Tool
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
        >
          <option value="all">All Categories</option>
          <option value="IT Equipment">IT Equipment</option>
          <option value="Carpentry Tools">Carpentry Tools</option>
        </select>
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
        >
          <option value="all">All Conditions</option>
          <option value="Good">Good</option>
          <option value="Damaged">Damaged</option>
          <option value="Under Maintenance">Under Maintenance</option>
        </select>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <div key={tool.id} onClick={() => setViewingTool(tool)} className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{tool.name}</h3>
                <p className="text-sm text-gray-500">{tool.toolId}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getConditionColor(tool.condition)}`}>
                  {tool.condition}
                </span>
              </div>
              {(hasPermission('editTools') || hasPermission('deleteTools') || isSuperAdmin()) && (
                <div className="flex gap-2">
                  {(hasPermission('editTools') || isSuperAdmin()) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(tool); }}
                      className="p-2 text-gray-400 hover:text-olive-600 hover:bg-olive-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {(hasPermission('deleteTools') || isSuperAdmin()) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTool(tool); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {tool.imageUrl && (
              <div className="mt-4">
                <img 
                  src={tool.imageUrl} 
                  alt={tool.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium text-gray-800">{tool.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium text-gray-800">{tool.location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-medium text-gray-800">{tool.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500">Available</p>
                  <p className={`font-medium ${tool.availableQuantity < 3 ? 'text-red-600' : 'text-green-600'}`}>
                    {tool.availableQuantity}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tools found matching your criteria.</p>
        </div>
      )}

      {/* Add Tool Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Add New Tool</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddTool} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Carpentry Tools">Carpentry Tools</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  >
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                    placeholder="e.g., Storage Room A"
                  />
                </div>
                <ImageUpload
                  onImageUpload={(url) => setFormData({...formData, imageUrl: url})}
                  currentImage={formData.imageUrl}
                />
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700"
                  >
                    Add Tool
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tool Modal */}
      {showEditModal && editingTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Edit Tool</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditTool} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Carpentry Tools">Carpentry Tools</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  >
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 outline-none"
                  />
                </div>
                <ImageUpload
                  onImageUpload={(url) => setFormData({...formData, imageUrl: url})}
                  currentImage={formData.imageUrl}
                />
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tool Details Modal */}
      {viewingTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">{viewingTool.name}</h2>
                <button onClick={() => setViewingTool(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {viewingTool.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={viewingTool.imageUrl} 
                    alt={viewingTool.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Tool ID</p>
                  <p className="font-medium text-gray-800">{viewingTool.toolId}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-800">{viewingTool.category}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Condition</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getConditionColor(viewingTool.condition)}`}>
                    {viewingTool.condition}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-800">{viewingTool.location}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Total Quantity</p>
                  <p className="font-medium text-gray-800">{viewingTool.quantity}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Available</p>
                  <p className={`font-medium ${viewingTool.availableQuantity < 3 ? 'text-red-600' : 'text-green-600'}`}>
                    {viewingTool.availableQuantity}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {viewingTool.availableQuantity > 0 && (hasPermission('lendTools') || isSuperAdmin()) && (
                  <Link
                    to="/lending"
                    state={{ selectedTool: viewingTool }}
                    onClick={() => setViewingTool(null)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Issue Tool
                  </Link>
                )}
                {viewingTool.quantity - viewingTool.availableQuantity > 0 && (hasPermission('returnTools') || isSuperAdmin()) && (
                  <Link
                    to="/lending"
                    state={{ selectedTool: viewingTool, action: 'receive' }}
                    onClick={() => setViewingTool(null)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Receive Back
                  </Link>
                )}
                <button
                  onClick={() => { setViewingTool(null); openEditModal(viewingTool); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
