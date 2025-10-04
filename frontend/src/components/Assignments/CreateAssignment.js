import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { PlusIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'homework',
    totalPoints: 100,
    dueDate: '',
    submissionType: 'both',
    allowedFileTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 10485760, // 10MB
    instructions: '',
    isPublished: false,
    allowLateSubmission: true,
    latePenalty: 10,
    rubric: []
  });

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const response = await axios.get(`/api/courses/instructor/${user._id}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'dueDate') {
      // Store the datetime-local value directly (YYYY-MM-DDTHH:mm format)
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                 type === 'number' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleFileTypeChange = (fileType, checked) => {
    setFormData(prev => ({
      ...prev,
      allowedFileTypes: checked 
        ? [...prev.allowedFileTypes, fileType]
        : prev.allowedFileTypes.filter(type => type !== fileType)
    }));
  };

  const handleAttachmentChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const addRubricCriteria = () => {
    setFormData(prev => ({
      ...prev,
      rubric: [...prev.rubric, { criteria: '', points: 0, description: '' }]
    }));
  };

  const removeRubricCriteria = (index) => {
    setFormData(prev => ({
      ...prev,
      rubric: prev.rubric.filter((_, i) => i !== index)
    }));
  };

  const updateRubricCriteria = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      rubric: prev.rubric.map((item, i) => 
        i === index ? { ...item, [field]: field === 'points' ? parseInt(value) || 0 : value } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate due date
    if (!formData.dueDate) {
      toast.error('Please select a due date');
      setLoading(false);
      return;
    }

    const dueDate = new Date(formData.dueDate);
    if (isNaN(dueDate.getTime()) || dueDate <= new Date()) {
      toast.error('Please select a valid future date for the due date');
      setLoading(false);
      return;
    }

    try {
      // Send data as JSON instead of FormData for better date handling
      const payload = {
        ...formData,
        dueDate: dueDate.toISOString(), // Convert to ISO string
        allowedFileTypes: formData.allowedFileTypes,
        rubric: formData.rubric
      };

      const response = await axios.post('/api/assignments', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      toast.success('Assignment created successfully!');
      navigate(`/assignments/${response.data.assignment._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const fileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'txt', label: 'TXT' },
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'zip', label: 'ZIP' }
  ];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get minimum datetime (current time + 1 hour)
  const getMinDateTime = () => {
    const minTime = new Date();
    minTime.setHours(minTime.getHours() + 1);
    return minTime.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
        <p className="mt-2 text-gray-600">
          Create a new assignment for your students
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Assignment 1: Data Structures"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                name="courseId"
                required
                value={formData.courseId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Type *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="input"
              >
                <option value="homework">Homework</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="presentation">Presentation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Points *
              </label>
              <input
                type="number"
                name="totalPoints"
                required
                min="1"
                value={formData.totalPoints}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                required
                min={getMinDateTime()}
                value={formData.dueDate}
                onChange={handleChange}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Assignment must be due at least 1 hour from now
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Describe the assignment objectives and requirements..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                name="instructions"
                rows={4}
                value={formData.instructions}
                onChange={handleChange}
                className="input"
                placeholder="Detailed instructions for completing the assignment..."
              />
            </div>
          </div>
        </div>

        {/* Submission Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Type
              </label>
              <select
                name="submissionType"
                value={formData.submissionType}
                onChange={handleChange}
                className="input"
              >
                <option value="file">File Upload Only</option>
                <option value="text">Text Submission Only</option>
                <option value="both">Both File and Text</option>
              </select>
            </div>

            {formData.submissionType !== 'text' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed File Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {fileTypes.map(type => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.allowedFileTypes.includes(type.value)}
                          onChange={(e) => handleFileTypeChange(type.value, e.target.checked)}
                          className="rounded border-gray-300 text-primary-600"
                        />
                        <span className="ml-2 text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    name="maxFileSize"
                    min="1"
                    max="100"
                    value={Math.round(formData.maxFileSize / 1024 / 1024)}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxFileSize: parseInt(e.target.value) * 1024 * 1024 
                    }))}
                    className="input"
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowLateSubmission"
                  checked={formData.allowLateSubmission}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600"
                />
                <span className="ml-2 text-sm">Allow Late Submissions</span>
              </label>

              {formData.allowLateSubmission && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Penalty per day:</label>
                  <input
                    type="number"
                    name="latePenalty"
                    min="0"
                    max="100"
                    value={formData.latePenalty}
                    onChange={handleChange}
                    className="input w-20"
                  />
                  <span className="text-sm">%</span>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600"
                />
                <span className="ml-2 text-sm">Publish immediately</span>
              </label>
            </div>
          </div>
        </div>

        {/* Assignment Files */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Files</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange}
                className="hidden"
                id="assignment-files"
              />
              <label htmlFor="assignment-files" className="btn btn-secondary cursor-pointer">
                Choose Files
              </label>
              <p className="text-sm text-gray-600 mt-2">
                Upload reference materials, templates, or instructions
              </p>
            </div>
          </div>
          
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
              <ul className="space-y-1">
                {attachments.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({Math.round(file.size / 1024)}KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Rubric */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Grading Rubric</h2>
            <button
              type="button"
              onClick={addRubricCriteria}
              className="btn btn-secondary btn-sm flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Criteria
            </button>
          </div>
          
          {formData.rubric.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No rubric criteria added. Click "Add Criteria" to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.rubric.map((criteria, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      placeholder="Criteria name"
                      value={criteria.criteria}
                      onChange={(e) => updateRubricCriteria(index, 'criteria', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      placeholder="Points"
                      value={criteria.points}
                      onChange={(e) => updateRubricCriteria(index, 'points', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={criteria.description}
                      onChange={(e) => updateRubricCriteria(index, 'description', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeRubricCriteria(index)}
                      className="btn btn-danger btn-sm w-full"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/assignments')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssignment;
