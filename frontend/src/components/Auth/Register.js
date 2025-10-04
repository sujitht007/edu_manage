import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    instructorProfile: {
      qualification: '',
      experience: '',
      specialization: [],
      bio: '',
      linkedIn: '',
      portfolio: ''
    }
  });
  const [showInstructorFields, setShowInstructorFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
      setShowInstructorFields(value === 'instructor');
      setFormData({
        ...formData,
        [name]: value
      });
    } else if (name.startsWith('instructorProfile.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        instructorProfile: {
          ...formData.instructorProfile,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      if (result.needsDocuments) {
        // Redirect to document upload for instructors
        navigate('/upload-documents');
      } else {
        navigate('/dashboard');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign in here
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="input mt-1"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="input mt-1"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input mt-1"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="input mt-1"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            I am a
          </label>
          <select
            id="role"
            name="role"
            className="input mt-1"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        {/* Instructor Profile Fields */}
        {showInstructorFields && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Instructor Information</h3>
            
            <div>
              <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
                Highest Qualification *
              </label>
              <select
                id="qualification"
                name="instructorProfile.qualification"
                required={showInstructorFields}
                className="input mt-1"
                value={formData.instructorProfile.qualification}
                onChange={handleChange}
              >
                <option value="">Select Qualification</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">PhD</option>
                <option value="diploma">Diploma</option>
                <option value="certificate">Professional Certificate</option>
              </select>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Years of Teaching Experience
              </label>
              <input
                id="experience"
                name="instructorProfile.experience"
                type="number"
                min="0"
                className="input mt-1"
                value={formData.instructorProfile.experience}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio / Summary
              </label>
              <textarea
                id="bio"
                name="instructorProfile.bio"
                rows={3}
                className="input mt-1"
                placeholder="Brief description of your teaching background and expertise..."
                value={formData.instructorProfile.bio}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700">
                  LinkedIn Profile (optional)
                </label>
                <input
                  id="linkedIn"
                  name="instructorProfile.linkedIn"
                  type="url"
                  className="input mt-1"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.instructorProfile.linkedIn}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                  Portfolio Website (optional)
                </label>
                <input
                  id="portfolio"
                  name="instructorProfile.portfolio"
                  type="url"
                  className="input mt-1"
                  placeholder="https://yourwebsite.com"
                  value={formData.instructorProfile.portfolio}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Next Step:</strong> After registration, you'll need to upload documents 
                (degree certificates, ID proof, etc.) for verification before your account is approved.
              </p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className={`input pr-10 ${errors.password ? 'border-red-300' : ''}`}
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className={`input mt-1 ${errors.confirmPassword ? 'border-red-300' : ''}`}
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary py-3 text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
