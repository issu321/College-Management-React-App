import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Activity, 
  HardDrive, 
  Server, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BarChart3, 
  Megaphone, 
  FileText, 
  Check, 
  X,
  ExternalLink,
  MapPin,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import UserAvatar from '../components/UserAvatar';
import { COUNTRIES, STANDARD_DEPARTMENTS, ACCREDITATION_LIST } from '../data/geoData';

export default function SuperAdminView() {
  const { openProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'colleges' | 'teachers' | 'students' | 'subjects' | 'analytics' | 'announcements' | 'audit'

  // Data states
  const [stats, setStats] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCollegeId, setFilterCollegeId] = useState('ALL');

  // Modal states
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [viewingCollege, setViewingCollege] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Confirm Modal state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    onConfirm: null
  });

  // College Multi-Section Form State
  const initialCollegeForm = {
    // Section 1: Institutional Information
    name: '',
    shortName: '',
    code: '',
    collegeType: 'Autonomous Engineering',
    affiliation: 'Affiliated with State Technical University',
    accreditation: ACCREDITATION_LIST[0],
    website: 'https://',
    email: '',
    phone: '+91 ',
    
    // Section 2: Location Information
    country: 'India',
    state: 'Karnataka',
    district: '',
    city: 'Bengaluru',
    postalCode: '560100',
    address: '',

    // Section 3: Administration
    principalName: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',

    // Section 4: Academic Information
    academicYear: '2025-2026',
    programs: ['Undergraduate (B.Tech / B.E.)'],
    departments: ['Computer Science & Engineering', 'Artificial Intelligence & Data Science'],
    courses: ['B.Tech Computer Science'],
    semesterStructure: '8 Semesters (4 Years)',

    // Section 5: Additional Information
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=150&q=80',
    description: '',
    status: 'Active'
  };

  const [collegeForm, setCollegeForm] = useState(initialCollegeForm);
  const [collegeFormSection, setCollegeFormSection] = useState(1);

  // Announcement Form State
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'Administrative',
    priority: 'Normal',
    targetRole: 'ALL',
    collegeId: 'ALL'
  });

  // Fetch Dashboard Stats & Primary Data
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, collegesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getAllColleges()
      ]);
      if (statsRes && statsRes.stats) setStats(statsRes.stats);
      if (collegesRes && collegesRes.colleges) setColleges(collegesRes.colleges);
    } catch (err) {
      toast.error('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Section-Specific Data
  const loadSectionData = async () => {
    try {
      if (activeTab === 'colleges') {
        const res = await api.getAllColleges({ search: searchQuery });
        if (res && res.colleges) setColleges(res.colleges);
      } else if (activeTab === 'teachers') {
        const res = await api.getAllTeachers({ collegeId: filterCollegeId, search: searchQuery });
        if (res && res.teachers) setTeachers(res.teachers);
      } else if (activeTab === 'students') {
        const res = await api.getAllStudents({ collegeId: filterCollegeId, search: searchQuery });
        if (res && res.students) setStudents(res.students);
      } else if (activeTab === 'subjects') {
        const res = await api.getSubjects({ collegeId: filterCollegeId, search: searchQuery });
        if (res && res.subjects) setSubjects(res.subjects);
      } else if (activeTab === 'announcements') {
        const res = await api.getAnnouncements({ collegeId: filterCollegeId });
        if (res && res.announcements) setAnnouncements(res.announcements);
      } else if (activeTab === 'audit') {
        const res = await api.getAuditLogs({ search: searchQuery });
        if (res && res.logs) setAuditLogs(res.logs);
      } else if (activeTab === 'analytics') {
        const res = await api.getPlatformAnalytics();
        if (res && res.analytics) setAnalytics(res.analytics);
      }
    } catch (err) {
      console.warn('Load section data error:', err.message);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadSectionData();
  }, [activeTab, filterCollegeId]);

  // Handle Country selection change to dynamically adjust available states
  const handleCountryChange = (countryName) => {
    const selectedCountryObj = COUNTRIES.find((c) => c.name === countryName);
    const defaultState = selectedCountryObj?.states?.[0] || '';
    setCollegeForm((prev) => ({
      ...prev,
      country: countryName,
      state: defaultState
    }));
  };

  // College Creation / Edit Submit
  const handleCollegeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCollege) {
        await api.updateCollege(editingCollege._id, collegeForm);
        toast.success(`College '${collegeForm.name}' updated successfully!`);
      } else {
        await api.createCollege(collegeForm);
        toast.success(`Institutional tenant '${collegeForm.name}' created!`);
      }
      setShowCollegeModal(false);
      setEditingCollege(null);
      setCollegeForm(initialCollegeForm);
      loadDashboard();
      if (activeTab === 'colleges') loadSectionData();
    } catch (err) {
      toast.error(err.message || 'Failed to save college details.');
    }
  };

  // College Status Toggle
  const handleToggleCollegeStatus = (college) => {
    const nextStatus = college.status === 'Active' ? 'Inactive' : 'Active';
    setConfirmDialog({
      isOpen: true,
      title: `${nextStatus === 'Active' ? 'Activate' : 'Deactivate'} College`,
      message: `Are you sure you want to change status of '${college.name}' to ${nextStatus}?`,
      isDanger: nextStatus !== 'Active',
      onConfirm: async () => {
        try {
          await api.setCollegeStatus(college._id, nextStatus);
          toast.success(`College status set to ${nextStatus}.`);
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
          loadDashboard();
          loadSectionData();
        } catch (err) {
          toast.error(err.message || 'Failed to update status.');
        }
      }
    });
  };

  // College Delete with Safe Dependency Check & Cascade Wipe Option
  const handleDeleteCollege = (college) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete College: ${college.shortName || college.name}`,
      message: `Are you sure you want to delete '${college.name}' (${college.code})? Any active dependencies will trigger cascade wipe confirmation.`,
      confirmLabel: 'Delete College',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.deleteCollege(college._id, false);
          toast.success(`College '${college.name}' removed successfully.`);
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
          loadDashboard();
          loadSectionData();
        } catch (err) {
          // If dependencies exist, offer immediate 1-click Force Cascade Delete
          setConfirmDialog({
            isOpen: true,
            title: `⚠️ Active Records in ${college.shortName || college.name}`,
            message: `${err.message}\n\nDo you want to permanently FORCE DELETE this college and CASCADE WIPE all associated teachers, students, subjects, assignments, and records?`,
            confirmLabel: 'Force Delete & Cascade Wipe All',
            isDanger: true,
            onConfirm: async () => {
              try {
                await api.deleteCollege(college._id, true);
                toast.success(`College '${college.name}' and all associated records wiped permanently.`);
                setConfirmDialog((p) => ({ ...p, isOpen: false }));
                loadDashboard();
                loadSectionData();
              } catch (forceErr) {
                toast.error(forceErr.message || 'Force delete failed.');
              }
            }
          });
        }
      }
    });
  };

  // Teacher Approval & Status
  const handleSetTeacherStatus = async (teacherId, status) => {
    try {
      await api.updateTeacherStatus(teacherId, status);
      toast.success(`Teacher account status updated to ${status}.`);
      loadSectionData();
      loadDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to update teacher.');
    }
  };

  // Student Approval & Status
  const handleSetStudentStatus = async (studentId, status) => {
    try {
      await api.updateStudentStatus(studentId, status);
      toast.success(`Student admission status updated to ${status}.`);
      loadSectionData();
      loadDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to update student.');
    }
  };

  // Announcement Submit
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.createAnnouncement(announcementForm);
      toast.success('Announcement broadcasted successfully!');
      setShowAnnouncementModal(false);
      setAnnouncementForm({
        title: '',
        content: '',
        category: 'Administrative',
        priority: 'Normal',
        targetRole: 'ALL',
        collegeId: 'ALL'
      });
      loadSectionData();
    } catch (err) {
      toast.error(err.message || 'Failed to publish announcement.');
    }
  };

  // Get current state list based on selected country in form
  const currentCountryObj = COUNTRIES.find((c) => c.name === collegeForm.country) || COUNTRIES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Administration
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
              Super Admin Root
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Institutional tenant isolation, campus management, and platform analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCollege(null);
              setCollegeForm(initialCollegeForm);
              setCollegeFormSection(1);
              setShowCollegeModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Register New College
          </button>
          
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Megaphone className="w-4 h-4 text-brand-600" />
            Post Announcement
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar border-b border-slate-200/80 mb-6 text-xs sm:text-sm font-semibold">
        {[
          { id: 'dashboard', label: 'Platform Dashboard', icon: Activity },
          { id: 'colleges', label: `Colleges (${colleges.length})`, icon: Building2 },
          { id: 'teachers', label: 'Faculty Approval', icon: Users },
          { id: 'students', label: 'Student Admissions', icon: GraduationCap },
          { id: 'subjects', label: 'Curriculum & Subjects', icon: BookOpen },
          { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
          { id: 'announcements', label: 'Broadcasts', icon: Megaphone },
          { id: 'audit', label: 'Security & Audit Logs', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}

        {/* Executive Profile Trigger */}
        <button
          onClick={openProfile}
          className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap bg-white text-brand-700 hover:bg-brand-50 border border-brand-200 font-bold transition-all ml-auto shadow-sm"
          title="Open Profile Suite"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          My Profile
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Colleges</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{stats?.totalColleges || 0}</span>
                <span className="text-xs font-semibold text-emerald-600">
                  {stats?.activeColleges || 0} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Autonomous institutional tenants</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Members</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{stats?.totalTeachers || 0}</span>
                {stats?.pendingTeachers > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    {stats.pendingTeachers} Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Teaching professors & instructors</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{stats?.totalStudents || 0}</span>
                {stats?.pendingStudents > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    {stats.pendingStudents} Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Across all departments & years</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage & Cloud</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{stats?.storageStats?.totalMB || '0.00'}</span>
                <span className="text-xs font-bold text-slate-500">MB Used</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{stats?.storageStats?.totalFiles || 0} Academic files uploaded</p>
            </div>
          </div>

          {/* System Health Status */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">System Operational Status</h3>
                  <p className="text-xs text-slate-400">All multi-tenant backend clusters online</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                100% System Health
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Database Engine</span>
                <span className="font-bold text-emerald-400">{stats?.systemHealth?.database || 'MongoDB 9.0'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Server Runtime</span>
                <span className="font-bold text-slate-200">{stats?.systemHealth?.nodeVersion || 'Node.js'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Process Uptime</span>
                <span className="font-bold text-slate-200">{stats?.systemHealth?.serverUptime || 'Active'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Memory Footprint</span>
                <span className="font-bold text-slate-200">{stats?.systemHealth?.memoryUsageMB || 0} MB RSS</span>
              </div>
            </div>
          </div>

          {/* Recent Colleges and Recent User Registrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Registered Campuses */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Registered Institutional Campuses</h3>
                <button
                  onClick={() => setActiveTab('colleges')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  View All ({colleges.length})
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {colleges.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No Colleges Registered Yet"
                  description="Begin by registering the first institutional tenant in the system."
                  actionLabel="Register College"
                  onAction={() => setShowCollegeModal(true)}
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {colleges.slice(0, 5).map((col) => (
                    <div key={col._id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-brand-700 text-xs">
                          {col.code}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-slate-800">{col.name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {col.city}, {col.state}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        col.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {col.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Registrations awaiting review */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Registrations</h3>
                <span className="text-xs text-slate-400">Live MongoDB updates</span>
              </div>

              {!stats?.recentRegistrations || stats.recentRegistrations.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Registrations Yet"
                  description="When teachers or students register, their requests will appear here for review."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.recentRegistrations.map((u) => (
                    <div key={u._id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {u.role.toUpperCase()} • {u.collegeId?.code || 'Campus'} • {u.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: COLLEGE MANAGEMENT */}
      {activeTab === 'colleges' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search college name, code, state, or city..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              onClick={loadSectionData}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {colleges.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Colleges Registered Yet"
              description="Get started by registering an autonomous college tenant."
              actionLabel="Add New College"
              onAction={() => setShowCollegeModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((col) => (
                <div
                  key={col._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-premium hover:shadow-premium-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
                          {col.code}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{col.name}</h3>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {col.city}, {col.state}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        col.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {col.status}
                      </span>
                    </div>

                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <p className="line-clamp-1"><strong className="text-slate-800">Affiliation:</strong> {col.affiliation || 'Autonomous'}</p>
                      <p className="line-clamp-1"><strong className="text-slate-800">Accreditation:</strong> {col.accreditation || 'NAAC'}</p>
                      <p className="line-clamp-1"><strong className="text-slate-800">Email:</strong> {col.email}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="block font-extrabold text-slate-800 text-sm">{col.teacherCount || 0}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Faculty</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="block font-extrabold text-slate-800 text-sm">{col.studentCount || 0}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Students</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="block font-extrabold text-slate-800 text-sm">{col.subjectCount || 0}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Subjects</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
                    <button
                      onClick={() => handleToggleCollegeStatus(col)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                        col.status === 'Active'
                          ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                          : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {col.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCollege(col);
                          setCollegeForm({ ...col });
                          setCollegeFormSection(1);
                          setShowCollegeModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
                        title="Edit Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollege(col)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        title="Delete College"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEACHER MANAGEMENT & APPROVAL */}
      {activeTab === 'teachers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filterCollegeId}
                onChange={(e) => setFilterCollegeId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Colleges</option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teacher name, email..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {teachers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Faculty Records Found"
              description="No registered teachers matching the filter criteria."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Teacher Name</th>
                      <th className="py-3.5 px-4">College</th>
                      <th className="py-3.5 px-4">Department & Designation</th>
                      <th className="py-3.5 px-4">Employee ID</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={t} size="sm" />
                            <div>
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="text-[11px] text-slate-400">{t.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {t.collegeId?.name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-semibold">{t.department}</div>
                          <div className="text-[11px] text-slate-400">{t.designation}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{t.employeeId || '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            t.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            t.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {t.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {t.status === 'pending' && (
                            <button
                              onClick={() => handleSetTeacherStatus(t._id, 'active')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                            >
                              Approve
                            </button>
                          )}
                          {t.status === 'active' && (
                            <button
                              onClick={() => handleSetTeacherStatus(t._id, 'suspended')}
                              className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-[11px]"
                            >
                              Suspend
                            </button>
                          )}
                          {t.status === 'suspended' && (
                            <button
                              onClick={() => handleSetTeacherStatus(t._id, 'active')}
                              className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-lg text-[11px]"
                            >
                              Re-activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT ADMISSIONS & APPROVAL */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filterCollegeId}
                onChange={(e) => setFilterCollegeId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Colleges</option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name, roll no..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {students.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No Student Records Found"
              description="Student applications will appear here after online registration."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">College</th>
                      <th className="py-3.5 px-4">Department & Course</th>
                      <th className="py-3.5 px-4">Semester</th>
                      <th className="py-3.5 px-4">Roll Number</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={s} size="sm" />
                            <div>
                              <div className="font-bold text-slate-900">{s.name}</div>
                              <div className="text-[11px] text-slate-400">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {s.collegeId?.name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-semibold">{s.department}</div>
                          <div className="text-[11px] text-slate-400">{s.course}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{s.semester}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{s.rollNo || '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            s.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {s.status === 'pending' && (
                            <button
                              onClick={() => handleSetStudentStatus(s._id, 'active')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                            >
                              Approve
                            </button>
                          )}
                          {s.status === 'active' && (
                            <button
                              onClick={() => handleSetStudentStatus(s._id, 'suspended')}
                              className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-[11px]"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUBJECTS & CURRICULUM */}
      {activeTab === 'subjects' && (
        <div className="space-y-6 animate-fade-in">
          {subjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Subjects Created Yet"
              description="Subjects created by college faculties will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {subjects.map((sub) => (
                <div key={sub._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">
                      {sub.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{sub.credits} Credits</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{sub.title}</h4>
                  <p className="text-[11px] text-slate-400 mb-3">{sub.department} • {sub.semester}</p>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Teacher: <strong className="text-slate-800">{sub.teacherId?.name || sub.teacherName || 'Unassigned'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PLATFORM ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600" />
                Student Enrollment by Department
              </h3>
              {!analytics?.studentsByDept || analytics.studentsByDept.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No student enrollment data available.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.studentsByDept.map((item) => (
                    <div key={item._id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{item._id || 'Unassigned'}</span>
                        <span>{item.count} Students</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${Math.min(100, item.count * 20)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-600" />
                Geographical Campus Distribution
              </h3>
              {!analytics?.collegesByState || analytics.collegesByState.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No geographical data available.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.collegesByState.map((item) => (
                    <div key={item._id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{item._id || 'Other Region'}</span>
                        <span>{item.count} Campuses</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-sky-500 rounded-full"
                        style={{ width: `${Math.min(100, item.count * 25)}%` }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: BROADCAST ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 animate-fade-in">
          {announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No Platform Announcements"
              description="Broadcast notices and urgent bulletins across colleges or to specific roles."
              actionLabel="Create Announcement"
              onAction={() => setShowAnnouncementModal(true)}
            />
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                        a.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {a.priority}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Target: {a.targetRole.toUpperCase()} • Campus: {a.collegeId === 'ALL' ? 'All Colleges' : a.collegeId}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-2">{a.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: AUDIT & SECURITY LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Live Immutable System Audit Trail
              </h3>
              <span className="text-[11px] text-slate-400">Chronological Security Stream</span>
            </div>

            {auditLogs.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="No Audit Records"
                description="Administrative actions and user events will be logged here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{log.userName}</td>
                        <td className="py-3 px-4 text-slate-600">{log.entityType}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.details}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MULTI-SECTION COLLEGE REGISTRATION MODAL */}
      {showCollegeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingCollege ? 'Edit Institutional Tenant' : 'Register New College Tenant'}
                  </h3>
                  <p className="text-xs text-slate-400">Step {collegeFormSection} of 5</p>
                </div>
              </div>
              <button
                onClick={() => setShowCollegeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-100 text-xs font-bold overflow-x-auto no-scrollbar">
              {[
                '1. Institutional',
                '2. Location',
                '3. Administration',
                '4. Academic',
                '5. Settings'
              ].map((s, idx) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCollegeFormSection(idx + 1)}
                  className={`flex-1 py-3 px-3 text-center border-b-2 whitespace-nowrap transition-colors ${
                    collegeFormSection === idx + 1
                      ? 'border-brand-600 text-brand-600 bg-brand-50/30'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleCollegeSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {collegeFormSection === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official College Name *</label>
                    <input
                      type="text"
                      required
                      value={collegeForm.name}
                      onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                      placeholder="e.g. Apex National Institute of Technology"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unique College Code *</label>
                      <input
                        type="text"
                        required
                        value={collegeForm.code}
                        onChange={(e) => setCollegeForm({ ...collegeForm, code: e.target.value.toUpperCase() })}
                        placeholder="ANIT"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Name</label>
                      <input
                        type="text"
                        value={collegeForm.shortName}
                        onChange={(e) => setCollegeForm({ ...collegeForm, shortName: e.target.value })}
                        placeholder="Apex NIT"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Type</label>
                      <select
                        value={collegeForm.collegeType}
                        onChange={(e) => setCollegeForm({ ...collegeForm, collegeType: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      >
                        <option value="Autonomous Engineering">Autonomous Engineering</option>
                        <option value="University Constituent">University Constituent</option>
                        <option value="Affiliated Technical College">Affiliated Technical College</option>
                        <option value="Private University Institute">Private University Institute</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Accreditation</label>
                      <select
                        value={collegeForm.accreditation}
                        onChange={(e) => setCollegeForm({ ...collegeForm, accreditation: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      >
                        {ACCREDITATION_LIST.map((acc) => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={collegeForm.email}
                        onChange={(e) => setCollegeForm({ ...collegeForm, email: e.target.value })}
                        placeholder="registrar@apex.edu.in"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Website</label>
                      <input
                        type="url"
                        value={collegeForm.website}
                        onChange={(e) => setCollegeForm({ ...collegeForm, website: e.target.value })}
                        placeholder="https://apex.edu.in"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {collegeFormSection === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country *</label>
                      <select
                        value={collegeForm.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State / Province *</label>
                      <select
                        value={collegeForm.state}
                        onChange={(e) => setCollegeForm({ ...collegeForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      >
                        {currentCountryObj.states.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={collegeForm.city}
                        onChange={(e) => setCollegeForm({ ...collegeForm, city: e.target.value })}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">PIN / Postal Code</label>
                      <input
                        type="text"
                        value={collegeForm.postalCode}
                        onChange={(e) => setCollegeForm({ ...collegeForm, postalCode: e.target.value })}
                        placeholder="560100"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Campus Address</label>
                    <textarea
                      rows={2}
                      value={collegeForm.address}
                      onChange={(e) => setCollegeForm({ ...collegeForm, address: e.target.value })}
                      placeholder="Tech Park Innovation Boulevard, Phase 1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {collegeFormSection === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Principal / Director Name</label>
                      <input
                        type="text"
                        value={collegeForm.principalName}
                        onChange={(e) => setCollegeForm({ ...collegeForm, principalName: e.target.value })}
                        placeholder="Dr. S. K. Narayanan"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Administrator Name</label>
                      <input
                        type="text"
                        value={collegeForm.adminName}
                        onChange={(e) => setCollegeForm({ ...collegeForm, adminName: e.target.value })}
                        placeholder="Prof. Ramesh Rao"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Administrator Email</label>
                      <input
                        type="email"
                        value={collegeForm.adminEmail}
                        onChange={(e) => setCollegeForm({ ...collegeForm, adminEmail: e.target.value })}
                        placeholder="admin@apex.edu.in"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Contact Phone</label>
                      <input
                        type="tel"
                        value={collegeForm.adminPhone}
                        onChange={(e) => setCollegeForm({ ...collegeForm, adminPhone: e.target.value })}
                        placeholder="+91 98450 12345"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {collegeFormSection === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academic Year</label>
                      <input
                        type="text"
                        value={collegeForm.academicYear}
                        onChange={(e) => setCollegeForm({ ...collegeForm, academicYear: e.target.value })}
                        placeholder="2025-2026"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semester Structure</label>
                      <select
                        value={collegeForm.semesterStructure}
                        onChange={(e) => setCollegeForm({ ...collegeForm, semesterStructure: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      >
                        <option value="8 Semesters (4 Years)">8 Semesters (4 Years)</option>
                        <option value="6 Semesters (3 Years)">6 Semesters (3 Years)</option>
                        <option value="4 Semesters (2 Years)">4 Semesters (2 Years)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Active Departments</label>
                    <div className="max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1.5 text-xs">
                      {STANDARD_DEPARTMENTS.map((dept) => {
                        const isChecked = collegeForm.departments.includes(dept);
                        return (
                          <label key={dept} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const nextDepts = isChecked
                                  ? collegeForm.departments.filter((d) => d !== dept)
                                  : [...collegeForm.departments, dept];
                                setCollegeForm({ ...collegeForm, departments: nextDepts });
                              }}
                              className="rounded text-brand-600 focus:ring-brand-500"
                            />
                            <span>{dept}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {collegeFormSection === 5 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                    <select
                      value={collegeForm.status}
                      onChange={(e) => setCollegeForm({ ...collegeForm, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Campus Bio</label>
                    <textarea
                      rows={3}
                      value={collegeForm.description}
                      onChange={(e) => setCollegeForm({ ...collegeForm, description: e.target.value })}
                      placeholder="Premier institution specializing in advanced engineering & technological research."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {collegeFormSection > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCollegeFormSection((s) => s - 1)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Previous Step
                  </button>
                ) : <div />}

                {collegeFormSection < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCollegeFormSection((s) => s + 1)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    {editingCollege ? 'Save College Changes' : 'Confirm & Register College'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT CREATION MODAL */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Broadcast Announcement</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="e.g. Platform Scheduled Maintenance Notice"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  placeholder="Details of the announcement..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Audience</label>
                  <select
                    value={announcementForm.targetRole}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, targetRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="teacher">Faculty Members Only</option>
                    <option value="student">Students Only</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
