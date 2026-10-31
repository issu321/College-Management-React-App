import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apex_cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors uniformly
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Base URL
  baseUrl: API_BASE,

  // Auth APIs
  login: (credentials) => client.post('/auth/login', credentials),
  registerTeacher: (data) => client.post('/auth/register/teacher', data),
  registerStudent: (data) => client.post('/auth/register/student', data),
  getMe: () => client.get('/auth/me'),
  updateProfile: (data) => client.put('/auth/profile', data),
  uploadAvatar: (formData) =>
    client.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  changePassword: (data) => client.post('/auth/change-password', data),

  // Public & College APIs
  getPublicColleges: () => client.get('/colleges/public'),
  getMyCollege: () => client.get('/colleges/my-college'),
  getCollegeDetails: (id) => client.get(`/colleges/${id}`),

  // Super Admin APIs
  getDashboardStats: () => client.get('/superadmin/dashboard-stats'),
  getAllColleges: (params) => client.get('/superadmin/colleges', { params }),
  createCollege: (data) => client.post('/superadmin/colleges', data),
  updateCollege: (id, data) => client.put(`/superadmin/colleges/${id}`, data),
  setCollegeStatus: (id, status) => client.patch(`/superadmin/colleges/${id}/status`, { status }),
  deleteCollege: (id, force = false) => client.delete(`/superadmin/colleges/${id}?force=${force}`),

  getAllTeachers: (params) => client.get('/superadmin/teachers', { params }),
  updateTeacherStatus: (id, status) => client.patch(`/superadmin/teachers/${id}/status`, { status }),
  deleteTeacher: (id) => client.delete(`/superadmin/teachers/${id}`),

  getAllStudents: (params) => client.get('/superadmin/students', { params }),
  updateStudentStatus: (id, status) => client.patch(`/superadmin/students/${id}/status`, { status }),
  deleteStudent: (id) => client.delete(`/superadmin/students/${id}`),

  getAuditLogs: (params) => client.get('/superadmin/audit-logs', { params }),
  getPlatformAnalytics: () => client.get('/superadmin/analytics'),

  // Subjects APIs
  getSubjects: (params) => client.get('/subjects', { params }),
  createSubject: (data) => client.post('/subjects', data),
  updateSubject: (id, data) => client.put(`/subjects/${id}`, data),
  deleteSubject: (id) => client.delete(`/subjects/${id}`),
  getEnrolledStudents: (subjectId) => client.get(`/subjects/${subjectId}/students`),

  // Attendance APIs
  getAttendance: (params) => client.get('/attendance', { params }),
  markAttendance: (data) => client.post('/attendance', data),
  getStudentAttendanceReport: (params) => client.get('/attendance/student-report', { params }),

  // Assignments APIs
  getAssignments: (params) => client.get('/assignments', { params }),
  createAssignment: (formData) =>
    client.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  submitAssignment: (assignmentId, formData) =>
    client.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  gradeSubmission: (submissionId, data) =>
    client.post(`/assignments/submissions/${submissionId}/grade`, data),
  deleteAssignment: (id) => client.delete(`/assignments/${id}`),

  // Study Materials APIs
  getStudyMaterials: (params) => client.get('/materials', { params }),
  uploadStudyMaterial: (formData) =>
    client.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteStudyMaterial: (id) => client.delete(`/materials/${id}`),

  // File Download Helper
  getFileDownloadUrl: (type, id) => `${API_BASE}/files/download/${type}/${id}`,
  downloadFile: async (type, id, filename) => {
    const token = localStorage.getItem('apex_cms_token');
    const response = await fetch(`${API_BASE}/files/download/${type}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to download file.');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Timetable APIs
  getTimetable: (params) => client.get('/timetable', { params }),
  createTimetableEntry: (data) => client.post('/timetable', data),
  deleteTimetableEntry: (id) => client.delete(`/timetable/${id}`),

  // Examination APIs
  getExams: (params) => client.get('/exams', { params }),
  createExam: (data) => client.post('/exams', data),
  enterMarks: (data) => client.post('/exams/marks', data),
  getStudentExamResults: (params) => client.get('/exams/student-results', { params }),

  // Announcements APIs
  getAnnouncements: (params) => client.get('/announcements', { params }),
  createAnnouncement: (data) => client.post('/announcements', data),
  deleteAnnouncement: (id) => client.delete(`/announcements/${id}`),

  // Notifications APIs
  getNotifications: () => client.get('/notifications'),
  markNotificationRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => client.post('/notifications/mark-all-read')
};
