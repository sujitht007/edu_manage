# Course Management System (EduManage)

A comprehensive full-stack web application built with the MERN stack for managing courses, assignments, attendance, and grades in educational institutions.

## Features Overview

This system provides complete functionality for three types of users with role-based access control:

### Student Features
- **Free Registration**: No cost account creation with email verification
- **Course Enrollment**: Browse and enroll in approved courses with capacity validation
- **Course Content Access**: View course materials (PDFs, videos, notes) after enrollment
- **Assignment Submission**: Submit assignments with file uploads and text submissions
- **Grade Tracking**: Monitor academic performance, GPA, and course progress
- **Attendance Monitoring**: View personal attendance records and percentages
- **Messaging**: Communicate directly with instructors
- **Dashboard**: Personalized dashboard showing upcoming deadlines, recent grades, and course progress

### Instructor Features (Requires Verification)
- **Document Verification**: Upload credentials for admin approval
- **Course Management**: Create, edit, and manage course content and materials
- **Content Upload**: Upload course materials (PDFs, videos, documents)
- **Class Scheduling**: Set class schedules and manage course timelines
- **Attendance Management**: Mark and track student attendance with detailed reports
- **Assignment Creation**: Create assignments with rubrics, file restrictions, and deadlines
- **Grading System**: Grade submissions with feedback and rubric-based scoring
- **Student Communication**: Message students and provide announcements
- **Analytics Dashboard**: View course performance metrics and student analytics

### Admin Features
- **User Management**: Approve instructor accounts and manage all user roles
- **Instructor Verification**: Review and approve instructor credentials
- **Course Oversight**: Approve course listings and monitor course quality
- **System Analytics**: Comprehensive reports on platform usage and performance
- **Account Management**: Activate/deactivate accounts and manage permissions
- **Platform Analytics**: View system-wide statistics and performance metrics

## Tech Stack

### Frontend
- **React.js** - Modern UI framework with hooks
- **React Router** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Headless UI** - Accessible UI components
- **Axios** - HTTP client for API communication
- **React Hot Toast** - Toast notifications
- **Heroicons** - Beautiful SVG icons

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - ODM for MongoDB with validation
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing for security
- **Express Validator** - Input validation and sanitization
- **Multer** - File upload handling middleware

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file (.env)**:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/edumanage_db
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=7d

# Admin User (for initial setup)
ADMIN_EMAIL=admin@edumanage.com
ADMIN_PASSWORD=SecureAdminPassword123!
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator

# Email Configuration (Optional)
EMAIL_FROM=noreply@edumanage.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:3000
```

4. **Create admin user**:
```bash
npm run create-admin
```

5. **Start the backend server**:
```bash
npm run dev
```

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## System Architecture

### Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Student, Instructor, Admin)
- **Password hashing** using bcryptjs with salt rounds
- **Instructor verification system** with document upload and admin approval
- **Session management** with automatic token refresh

### Database Design
- **User Management**: Comprehensive user profiles with role-based permissions and verification status
- **Course System**: Hierarchical course structure with enrollment tracking and approval workflow
- **Assignment Workflow**: Complete assignment lifecycle from creation to grading with file handling
- **Attendance Tracking**: Detailed attendance records with percentage calculations and reporting
- **Grade Management**: Flexible grading system with GPA calculations and progress tracking

## Key Features Implementation

### User Verification System
- **Student Registration**: Free and immediate account activation
- **Instructor Verification**: Document upload requirement with admin approval process
- **Admin Oversight**: Complete control over user approval and system management

### Course Enrollment System
- **Capacity Management**: Automatic enrollment limits with real-time availability
- **Approval Workflow**: Admin approval required for course activation
- **Enrollment Validation**: Prevents duplicate enrollments and capacity overflow

### Assignment & Submission System
- **File Upload Support**: Multiple file types with size restrictions and validation
- **Text Submissions**: Rich text support for written assignments
- **Late Submission Handling**: Configurable late penalties and deadline management
- **Submission History**: Complete audit trail of all submissions with timestamps

### Attendance Management
- **Real-time Tracking**: Mark attendance with multiple status options (Present, Absent, Late, Excused)
- **Automated Calculations**: Automatic attendance percentage computation
- **Historical Records**: Complete attendance history with analytics and reporting

### Communication System
- **Internal Messaging**: Secure messaging between students and instructors
- **Role-based Communication**: Appropriate messaging permissions based on user roles
- **Notification System**: Real-time updates for important events and deadlines

## Security Features

- **Input Validation**: Comprehensive validation using Express Validator
- **File Upload Security**: Restricted file types, size limits, and secure storage
- **Authentication Middleware**: Protected routes with role verification
- **Data Encryption**: Bcrypt password hashing with secure salt rounds
- **Role-based Access**: Granular permissions based on user roles and verification status

## User Experience

### Responsive Design
- **Mobile-First Approach**: Optimized for all device sizes
- **Intuitive Navigation**: Clean and organized interface with role-based menus
- **Accessible Components**: ARIA-compliant UI elements
- **Fast Loading**: Optimized performance with efficient data loading

### Dashboard Analytics
- **Role-specific Dashboards**: Customized views for students, instructors, and admins
- **Real-time Statistics**: Live updates on course progress and performance
- **Visual Analytics**: Charts and progress indicators for better data understanding
- **Performance Metrics**: Detailed insights into academic progress and system usage

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration (students: immediate, instructors: pending approval)
- `POST /api/auth/login` - User login with role verification
- `GET /api/auth/me` - Get current user profile and verification status
- `PUT /api/auth/profile` - Update user profile information

### Course Management
- `GET /api/courses` - List courses with filtering and approval status
- `POST /api/courses` - Create new course (instructors only, requires approval)
- `GET /api/courses/:id` - Get course details with enrollment information
- `PUT /api/courses/:id/approve` - Approve course (admin only)

### Enrollment System
- `POST /api/enrollments` - Enroll in approved course
- `GET /api/enrollments/student/:id` - Get student enrollments with progress
- `DELETE /api/enrollments/:id` - Drop from course

### Assignment Management
- `GET /api/assignments` - Get user's assignments based on role
- `POST /api/assignments` - Create assignment (instructors only)
- `GET /api/assignments/:id` - Get assignment details and submission status
- `POST /api/submissions` - Submit assignment with file handling

### User Management (Admin only)
- `GET /api/users/pending-approval` - Get pending instructor verifications
- `PUT /api/users/:id/approve` - Approve instructor account
- `GET /api/admin/users` - Comprehensive user management interface

## Production Deployment

### Environment Setup
- Set up production MongoDB database with proper indexes
- Configure environment variables for production security
- Set up file storage system for uploaded content
- Configure email service for notifications and verification

### Security Checklist
- [x] Environment variables secured
- [x] Database connection with authentication
- [x] File upload directories with proper permissions
- [x] HTTPS enabled for production
- [x] Rate limiting configured
- [x] Input validation on all endpoints

## System Workflow

### Student Journey
1. **Registration**: Free account creation with email verification
2. **Course Discovery**: Browse approved courses with detailed information
3. **Enrollment**: Enroll in courses with capacity validation
4. **Learning**: Access course materials, submit assignments, track attendance
5. **Progress Tracking**: Monitor grades, GPA, and overall academic progress

### Instructor Journey
1. **Registration**: Account creation with document upload requirement
2. **Verification**: Admin review and approval of credentials
3. **Course Creation**: Build courses with materials, schedules, and requirements
4. **Teaching**: Manage enrollments, create assignments, mark attendance
5. **Assessment**: Grade submissions, provide feedback, track student progress

### Admin Workflow
1. **User Management**: Review and approve instructor applications
2. **Course Oversight**: Approve course listings and monitor quality
3. **System Monitoring**: Track platform usage and performance metrics
4. **Quality Control**: Ensure educational standards and user satisfaction

## Key Metrics

### Platform Statistics
- **User Base**: Students (unlimited free), Verified Instructors, System Administrators
- **Course Capacity**: Unlimited courses with enrollment limits
- **File Handling**: Secure upload/download with type restrictions
- **Performance**: Optimized for educational workflows
- **Scalability**: Designed for institutional growth

---

**EduManage - Complete Course Management Solution for Modern Education**

*Empowering students, supporting instructors, enabling administrators*

---