import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  User, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  School,
  BookOpen,
  Briefcase,
  Calendar,
  Phone,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { STANDARD_DEPARTMENTS } from '../data/geoData';

export default function LoginView() {
  const { login } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register_teacher' | 'register_student'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active colleges fetched from backend
  const [publicColleges, setPublicColleges] = useState([]);
  const [selectedCollegeData, setSelectedCollegeData] = useState(null);

  // Teacher Registration Form State
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeId: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. / M.Tech',
    experience: '5 Years',
    specialization: 'Artificial Intelligence & Systems',
    employeeId: '',
    phone: ''
  });

  // Student Registration Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeId: '',
    department: '',
    course: '',
    semester: '1st Sem',
    rollNo: '',
    registrationNumber: '',
    phone: '',
    academicYear: '2025-2026',
    address: ''
  });

  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Fetch active colleges for registration dropdowns
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.getPublicColleges();
        if (res && res.colleges) {
          setPublicColleges(res.colleges);
          if (res.colleges.length > 0) {
            setTeacherForm((prev) => ({ ...prev, collegeId: res.colleges[0]._id }));
            setStudentForm((prev) => ({
              ...prev,
              collegeId: res.colleges[0]._id,
              department: res.colleges[0].departments?.[0] || 'Computer Science & Engineering',
              course: res.colleges[0].courses?.[0] || 'B.Tech Computer Science'
            }));
            setSelectedCollegeData(res.colleges[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load public colleges list:', err.message);
      }
    };
    fetchColleges();
  }, []);

  // Handle student college selection change to update department and course options dynamically
  const handleStudentCollegeChange = (colId) => {
    const col = publicColleges.find((c) => c._id === colId);
    setSelectedCollegeData(col || null);
    setStudentForm((prev) => ({
      ...prev,
      collegeId: colId,
      department: col?.departments?.[0] || 'Computer Science & Engineering',
      course: col?.courses?.[0] || 'B.Tech Computer Science'
    }));
  };

  const handleQuickFill = (idVal, pwdVal) => {
    setIdentifier(idVal);
    setPassword(pwdVal);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(identifier, password);
      toast.success('Authentication verified. Welcome!');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    setError('');
    setRegSuccessMessage('');

    if (teacherForm.password !== teacherForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.registerTeacher(teacherForm);
      setRegSuccessMessage(
        res.message || 'Teacher registration submitted successfully! Awaiting administrator approval.'
      );
      toast.success('Registration submitted for administrator review.');
      setActiveTab('login');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setError('');
    setRegSuccessMessage('');

    if (studentForm.password !== studentForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.registerStudent(studentForm);
      setRegSuccessMessage(
        res.message || 'Student registration submitted successfully! Awaiting institutional approval.'
      );
      toast.success('Student registration submitted for institutional review.');
      setActiveTab('login');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="w-14 h-14 rounded-3xl sky-gradient-primary mx-auto flex items-center justify-center text-white shadow-sky-glow font-extrabold text-2xl tracking-wider mb-4 animate-slide-up">
          Ω
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Apex Higher Education Suite
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium">
          Enterprise Multi-Tenant College Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-premium rounded-3xl border border-slate-100">
          
          {/* Tabs Navigation */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Portal Login
            </button>
            <button
              onClick={() => { setActiveTab('register_teacher'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                activeTab === 'register_teacher'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Teacher Registration
            </button>
            <button
              onClick={() => { setActiveTab('register_student'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                activeTab === 'register_student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Student Admission
            </button>
          </div>

          {/* Success Banner */}
          {regSuccessMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
                {regSuccessMessage}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-rose-700 font-medium leading-relaxed">
                {error}
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username / Institutional Email / Roll No
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. usman or dr.sharma@nits.edu.in"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm bg-brand-600 hover:bg-brand-700 active:scale-[0.99] shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Fill Demo Credentials */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                  Quick Authentication Demo Presets
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('usman', 'Wsxcfty@9009')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-left transition-all"
                  >
                    <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Super Admin
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">usman</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('dr.sharma@nits.edu.in', 'Teacher@123')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-left transition-all"
                  >
                    <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                      <School className="w-3.5 h-3.5" />
                      Teacher
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">dr.sharma@nits</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('aarav.patel@student.nits.edu.in', 'Student@123')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-left transition-all"
                  >
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Student
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">aarav.patel</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEACHER REGISTRATION */}
          {activeTab === 'register_teacher' && (
            <form onSubmit={handleTeacherRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    placeholder="dr.sharma@college.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Active College Campus *
                </label>
                <select
                  required
                  value={teacherForm.collegeId}
                  onChange={(e) => setTeacherForm({ ...teacherForm, collegeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  {publicColleges.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code}) — {c.city}, {c.state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department *
                  </label>
                  <select
                    value={teacherForm.department}
                    onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  >
                    {STANDARD_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherForm.designation}
                    onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                    placeholder="e.g. Associate Professor"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={teacherForm.employeeId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, employeeId: e.target.value })}
                    placeholder="EMP-CSE-102"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={teacherForm.confirmPassword}
                    onChange={(e) => setTeacherForm({ ...teacherForm, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm bg-brand-600 hover:bg-brand-700 active:scale-[0.99] shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? 'Submitting Application...' : 'Submit Faculty Registration'}
                <FileCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: STUDENT REGISTRATION */}
          {activeTab === 'register_student' && (
            <form onSubmit={handleStudentRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="e.g. Aarav Patel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="aarav.patel@student.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Enrolling College Campus *
                </label>
                <select
                  required
                  value={studentForm.collegeId}
                  onChange={(e) => handleStudentCollegeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  {publicColleges.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code}) — {c.city}, {c.state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department *
                  </label>
                  <select
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  >
                    {(selectedCollegeData?.departments || STANDARD_DEPARTMENTS).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Degree Program / Course *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Roll / Enrollment Number
                  </label>
                  <input
                    type="text"
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    placeholder="CS26-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Semester *
                  </label>
                  <select
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  >
                    {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={studentForm.confirmPassword}
                    onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm bg-brand-600 hover:bg-brand-700 active:scale-[0.99] shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? 'Submitting Application...' : 'Submit Student Admission Application'}
                <GraduationCap className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
