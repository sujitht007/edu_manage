import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';

const ConfigurationManagement = () => {
  const [configurations, setConfigurations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'string',
    category: 'system',
    description: '',
    isPublic: false,
    isEditable: true,
    validation: {},
    defaultValue: '',
    tags: []
  });

  useEffect(() => {
    fetchConfigurations();
    fetchCategories();
  }, [currentPage, selectedCategory, searchTerm, showPublicOnly]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (showPublicOnly) params.append('isPublic', 'true');

      const response = await axios.get(`/api/configurations?${params}`);
      setConfigurations(response.data.configurations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast.error('Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/configurations/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateConfig = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/configurations', formData);
      toast.success('Configuration created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchConfigurations();
    } catch (error) {
      console.error('Error creating configuration:', error);
      toast.error(error.response?.data?.message || 'Failed to create configuration');
    }
  };

  const handleUpdateConfig = async (key, value) => {
    try {
      await axios.put(`/api/configurations/${key}`, { value });
      toast.success('Configuration updated successfully');
      fetchConfigurations();
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error(error.response?.data?.message || 'Failed to update configuration');
    }
  };

  const handleDeleteConfig = async (key) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      await axios.delete(`/api/configurations/${key}`);
      toast.success('Configuration deleted successfully');
      fetchConfigurations();
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast.error(error.response?.data?.message || 'Failed to delete configuration');
    }
  };

  const handleResetConfig = async (key) => {
    try {
      await axios.post(`/api/configurations/reset/${key}`);
      toast.success('Configuration reset to default value');
      fetchConfigurations();
    } catch (error) {
      console.error('Error resetting configuration:', error);
      toast.error(error.response?.data?.message || 'Failed to reset configuration');
    }
  };

  const handleBulkUpdate = async () => {
    const updates = configurations
      .filter(config => config.isEditable)
      .map(config => ({
        key: config.key,
        value: config.value
      }));

    try {
      await axios.post('/api/configurations/bulk-update', { configurations: updates });
      toast.success('Bulk update completed successfully');
      fetchConfigurations();
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error(error.response?.data?.message || 'Failed to bulk update configurations');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await axios.get(`/api/configurations/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'configurations.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Configurations exported successfully');
    } catch (error) {
      console.error('Error exporting configurations:', error);
      toast.error('Failed to export configurations');
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      type: 'string',
      category: 'system',
      description: '',
      isPublic: false,
      isEditable: true,
      validation: {},
      defaultValue: '',
      tags: []
    });
  };

  const renderValueInput = (config) => {
    const { key, value, type, validation } = config;
    
    switch (type) {
      case 'boolean':
        return (
          <select
            value={value}
            onChange={(e) => handleUpdateConfig(key, e.target.value === 'true')}
            className="form-input"
            disabled={!config.isEditable}
          >
            <option value={true}>True</option>
            <option value={false}>False</option>
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleUpdateConfig(key, Number(e.target.value))}
            className="form-input"
            disabled={!config.isEditable}
            min={validation?.min}
            max={validation?.max}
          />
        );
      
      case 'array':
        return (
          <div className="space-y-2">
            <textarea
              value={Array.isArray(value) ? value.join(', ') : value}
              onChange={(e) => {
                const arrayValue = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                handleUpdateConfig(key, arrayValue);
              }}
              className="form-input"
              disabled={!config.isEditable}
              placeholder="Enter values separated by commas"
            />
            {validation?.options && (
              <div className="text-xs text-gray-500">
                Options: {validation.options.join(', ')}
              </div>
            )}
          </div>
        );
      
      case 'json':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                const jsonValue = JSON.parse(e.target.value);
                handleUpdateConfig(key, jsonValue);
              } catch (err) {
                // Don't update if invalid JSON
              }
            }}
            className="form-input font-mono text-sm"
            disabled={!config.isEditable}
            rows={3}
          />
        );
      
      case 'string':
      default:
        return (
          <div className="relative">
            <input
              type={key.toLowerCase().includes('password') ? (showPassword[key] ? 'text' : 'password') : 'text'}
              value={value}
              onChange={(e) => handleUpdateConfig(key, e.target.value)}
              className="form-input pr-10"
              disabled={!config.isEditable}
              minLength={validation?.min}
              maxLength={validation?.max}
            />
            {key.toLowerCase().includes('password') && (
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, [key]: !prev[key] }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword[key] ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            )}
          </div>
        );
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      system: 'bg-blue-100 text-blue-800',
      course: 'bg-green-100 text-green-800',
      user: 'bg-purple-100 text-purple-800',
      assignment: 'bg-yellow-100 text-yellow-800',
      attendance: 'bg-orange-100 text-orange-800',
      notification: 'bg-pink-100 text-pink-800',
      email: 'bg-indigo-100 text-indigo-800',
      file_upload: 'bg-gray-100 text-gray-800',
      security: 'bg-red-100 text-red-800',
      ui: 'bg-teal-100 text-teal-800',
      analytics: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading && configurations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Management</h1>
          <p className="mt-2 text-gray-600">
            Manage system configurations and settings
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="btn btn-secondary"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Configuration
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
                placeholder="Search configurations..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.displayName} ({category.count})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPublicOnly}
                onChange={(e) => setShowPublicOnly(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm text-gray-700">Public only</span>
            </label>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleBulkUpdate}
              className="btn btn-secondary w-full"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Bulk Update
            </button>
          </div>
        </div>
      </div>

      {/* Configurations Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configurations.map((config) => (
                <tr key={config._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{config.key}</div>
                    <div className="text-xs text-gray-500">v{config.version}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {renderValueInput(config)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {config.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(config.category)}`}>
                      {config.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {config.description}
                    </div>
                    {config.tags && config.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {config.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {config.isPublic && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Public
                        </span>
                      )}
                      {!config.isEditable && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Read-only
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {config.isEditable && config.defaultValue !== undefined && (
                        <button
                          onClick={() => handleResetConfig(config.key)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Reset to default"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
                      {config.isEditable && (
                        <button
                          onClick={() => handleDeleteConfig(config.key)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 20, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Configuration Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Configuration</h3>
              <form onSubmit={handleCreateConfig} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key *
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="form-input"
                    required
                    placeholder="e.g., site_name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="form-input"
                    required
                    placeholder="Configuration value"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-input"
                      required
                    >
                      {categories.map(category => (
                        <option key={category.name} value={category.name}>
                          {category.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    required
                    rows={3}
                    placeholder="Describe what this configuration does"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700">Public</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isEditable}
                      onChange={(e) => setFormData({ ...formData, isEditable: e.target.checked })}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700">Editable</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationManagement;