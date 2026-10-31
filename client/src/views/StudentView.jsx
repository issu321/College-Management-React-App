import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Upload, 
  Building2, 
  Megaphone, 
  Paperclip, 
  Search, 
  Filter, 
  User, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import UserAvatar from '../components/UserAvatar';

export default function StudentView() {
  const { user, openProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'subjects' | 'attendance' | 'assignments' | 'materials' | 'timetable' | 'results' | 'announcements'

  // Data States
  const [subjects, setSubjects] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment Submission Modal
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');

  // Load all student data
  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [subjRes, attRes, asnRes, matRes, timeRes, resRes, annRes] = await Promise.all([
        api.getSubjects(),
        api.getStudentAttendanceReport(),
        api.getAssignments(),
        api.getStudyMaterials(),
        api.getTimetable(),
        api.getStudentExamResults(),
        api.getAnnouncements()
      ]);

      if (subjRes?.subjects) setSubjects(subjRes.subjects);
      if (attRes?.summary) setAttendanceReport(attRes);
      if (asnRes?.assignments) setAssignments(asnRes.assignments);
      if (matRes?.materials) setMaterials(matRes.materials);
      if (timeRes?.schedules) setTimetable(timeRes.schedules);
      if (resRes?.results) setExamResults(resRes.results);
      if (annRes?.announcements) setAnnouncements(annRes.announcements);
    } catch (err) {
      toast.error('Failed to load student academic records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  // Submit Assignment Handler
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('notes', submissionNotes);
    if (submissionFile) {
      formData.append('submissionFile', submissionFile);
    }

    try {
      await api.submitAssignment(submittingAssignment._id, formData);
      toast.success('Assignment solution uploaded and submitted for review!');
      setSubmittingAssignment(null);
      setSubmissionNotes('');
      setSubmissionFile(null);
      loadStudentData();
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSubject = filterSubject === 'ALL' || m.subjectId === filterSubject || m.subjectCode === filterSubject;
    const matchesSearch = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Calculate pending assignments
  const pendingAssignments = assignments.filter((a) => !a.mySubmission || a.mySubmission.status !== 'Graded');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <UserAvatar
            user={user}
            size="xl"
            showRoleBadge={true}
            onClick={openProfile}
            className="hover:scale-105 transition-transform cursor-pointer border-2 border-white shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user?.name || 'Student Portal'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                {user?.semester || 'Semester'} • {user?.rollNo || 'Roll No'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {user?.collegeName || 'Campus'} • {user?.course || 'Degree Program'} ({user?.department})
            </p>
          </div>
        </div>

        {/* Attendance Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Overall Attendance</p>
              <p className="text-sm font-extrabold text-slate-900">
                {attendanceReport?.summary?.overallPercentage ?? 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar border-b border-slate-200/80 mb-6 text-xs sm:text-sm font-semibold">
        {[
          { id: 'dashboard', label: 'Academic Dashboard', icon: Sparkles },
          { id: 'subjects', label: `My Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'attendance', label: 'Attendance Records', icon: CheckCircle2 },
          { id: 'assignments', label: `Assignments (${assignments.length})`, icon: FileText },
          { id: 'materials', label: `Study Notes (${materials.length})`, icon: Download },
          { id: 'timetable', label: 'Class Timetable', icon: Calendar },
          { id: 'results', label: `Exam Results (${examResults.length})`, icon: Award },
          { id: 'announcements', label: 'Notices', icon: Megaphone }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* Profile Trigger */}
        <button
          onClick={openProfile}
          className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap bg-white text-brand-700 hover:bg-brand-50 border border-brand-200 font-bold transition-all ml-auto shadow-sm"
          title="Open Scholar Profile"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          My Profile
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DASHBOARD */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">
                  {attendanceReport?.summary?.overallPercentage ?? 0}%
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {attendanceReport?.summary?.totalPresent || 0} Present
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Out of {attendanceReport?.summary?.totalClasses || 0} Total Sessions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Subjects</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{subjects.length}</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">{user?.semester} Curriculum</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{pendingAssignments.length}</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Active assignment deadlines</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Grades</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{examResults.length}</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Verified semester scores</p>
            </div>
          </div>

          {/* Quick Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upcoming Deadlines */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Assignment Deadlines</h3>
                <button onClick={() => setActiveTab('assignments')} className="text-xs font-bold text-brand-600 hover:text-brand-800">
                  View All ({assignments.length})
                </button>
              </div>

              {assignments.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Pending Assignments"
                  description="All coursework is currently up to date."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {assignments.slice(0, 4).map((a) => (
                    <div key={a._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] px-2 py-0.5 bg-brand-50 text-brand-700 rounded">
                            {a.subjectCode}
                          </span>
                          <span className="font-bold text-slate-800 line-clamp-1">{a.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Due: {a.dueDate} • {a.maxMarks} Marks</p>
                      </div>

                      <div>
                        {a.mySubmission ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {a.mySubmission.status}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSubmittingAssignment(a);
                              setSubmissionNotes('');
                              setSubmissionFile(null);
                            }}
                            className="px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest Study Materials */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Recent Lecture Notes & Slides</h3>
                <button onClick={() => setActiveTab('materials')} className="text-xs font-bold text-brand-600 hover:text-brand-800">
                  View All
                </button>
              </div>

              {materials.length === 0 ? (
                <EmptyState
                  icon={Download}
                  title="No Study Notes Available"
                  description="When professors upload course slides, they will appear here."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {materials.slice(0, 4).map((m) => (
                    <div key={m._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{m.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {m.subjectCode} • {(m.fileSize / 1024).toFixed(0)} KB • {m.category}
                        </p>
                      </div>
                      <button
                        onClick={() => api.downloadFile('material', m._id, m.originalName)}
                        className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MY SUBJECTS */}
      {/* ======================================================== */}
      {activeTab === 'subjects' && (
        <div className="space-y-6 animate-fade-in">
          {subjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Subjects Enrolled"
              description="Your enrolled courses will appear here as soon as curriculum is registered."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((sub) => (
                <div key={sub._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">
                        {sub.code}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{sub.credits} Credits</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{sub.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{sub.department} • {sub.semester}</p>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 mb-4">
                      <p className="font-semibold text-slate-700 mb-1">Course Syllabus:</p>
                      <p className="line-clamp-3 leading-relaxed">{sub.syllabus || 'Comprehensive course syllabus outline.'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Teacher: <strong className="text-slate-800">{sub.teacherId?.name || sub.teacherName || 'Faculty'}</strong></span>
                    <span className="text-slate-400">Room: {sub.room}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ATTENDANCE (READ-ONLY) */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Verified Attendance Record</h3>
              <p className="text-xs text-slate-400 mt-1">Official institutional attendance ledger</p>
            </div>

            <div className="flex items-center gap-6 text-center text-xs">
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block">
                  {attendanceReport?.summary?.overallPercentage ?? 0}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Overall</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-xl font-bold text-emerald-600 block">
                  {attendanceReport?.summary?.totalPresent || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Present</span>
              </div>
              <div>
                <span className="text-xl font-bold text-rose-600 block">
                  {attendanceReport?.summary?.totalAbsent || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Absent</span>
              </div>
              <div>
                <span className="text-xl font-bold text-amber-600 block">
                  {attendanceReport?.summary?.totalLate || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Late</span>
              </div>
            </div>
          </div>

          {/* Subject-wise breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Subject-Wise Attendance Breakdown</h4>
            </div>

            {!attendanceReport?.subjects || attendanceReport.subjects.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No Attendance Records Yet"
                description="Attendance records will be published here as faculty logs lectures."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Present</th>
                      <th className="py-3 px-4">Absent</th>
                      <th className="py-3 px-4">Late</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attendanceReport.subjects.map((s) => (
                      <tr key={s.subjectId} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {s.subjectCode} - {s.subjectTitle}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-600 font-bold">{s.present}</td>
                        <td className="py-3.5 px-4 text-rose-600 font-bold">{s.absent}</td>
                        <td className="py-3.5 px-4 text-amber-600 font-bold">{s.late}</td>
                        <td className="py-3.5 px-4 text-slate-600">{s.total}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            s.percentage >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {s.percentage}%
                          </span>
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

      {/* ======================================================== */}
      {/* TAB 4: ASSIGNMENTS & SUBMISSION */}
      {/* ======================================================== */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-fade-in">
          {assignments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Assignments Published"
              description="Coursework and lab tasks will be shown here."
            />
          ) : (
            <div className="space-y-5">
              {assignments.map((asn) => (
                <div key={asn._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">
                          {asn.subjectCode}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">{asn.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Due: <strong className="text-slate-700">{asn.dueDate}</strong> • Max Marks: {asn.maxMarks}
                      </p>
                    </div>

                    <div>
                      {asn.mySubmission ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            asn.mySubmission.status === 'Graded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {asn.mySubmission.status}
                          </span>
                          {asn.mySubmission.grade !== null && (
                            <span className="px-3 py-1 bg-brand-50 text-brand-700 font-extrabold text-xs rounded-full border border-brand-200">
                              Grade: {asn.mySubmission.grade} / {asn.maxMarks}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSubmittingAssignment(asn);
                            setSubmissionNotes('');
                            setSubmissionFile(null);
                          }}
                          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md"
                        >
                          Submit Solution
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">{asn.description}</p>

                  {/* Attachment if any */}
                  {asn.attachmentName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-3">
                      <Paperclip className="w-3.5 h-3.5 text-brand-600" />
                      <span>{asn.attachmentName}</span>
                      <button
                        onClick={() => api.downloadFile('assignment', asn._id, asn.attachmentName)}
                        className="text-brand-600 hover:text-brand-800 font-bold ml-2"
                      >
                        Download Spec
                      </button>
                    </div>
                  )}

                  {/* Feedback from teacher if graded */}
                  {asn.mySubmission?.feedback && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs">
                      <p className="font-bold text-sky-900 mb-1">Faculty Feedback:</p>
                      <p className="text-sky-800 leading-relaxed">{asn.mySubmission.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: STUDY MATERIALS & NOTES */}
      {/* ======================================================== */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, files, syllabus..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <EmptyState
              icon={Download}
              title="No Study Materials Found"
              description="No resources match the current search term."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMaterials.map((m) => (
                <div key={m._id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-premium flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">
                        {m.subjectCode}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {(m.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{m.title}</h4>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{m.description || 'Course resource'}</p>
                    <div className="text-[11px] text-slate-400 mb-4">{m.category}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => api.downloadFile('material', m._id, m.originalName)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Resource
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: CLASS TIMETABLE */}
      {/* ======================================================== */}
      {activeTab === 'timetable' && (
        <div className="space-y-6 animate-fade-in">
          {timetable.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Timetable Published"
              description="Classroom schedule will appear once posted by your department."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {timetable.map((t) => (
                <div key={t._id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-premium">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-brand-700 px-2.5 py-0.5 bg-brand-50 rounded-md">
                      {t.dayOfWeek}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{t.classroom}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{t.subjectTitle}</h4>
                  <p className="text-[11px] text-slate-400 mb-3 font-mono">{t.subjectCode} • Prof. {t.teacherName}</p>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {t.startTime} - {t.endTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: EXAMINATION RESULTS */}
      {/* ======================================================== */}
      {activeTab === 'results' && (
        <div className="space-y-6 animate-fade-in">
          {examResults.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No Results Published Yet"
              description="Evaluated examination marks and computed letter grades will appear here."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Official Semester Transcript</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Examination</th>
                      <th className="py-3 px-4">Marks Obtained</th>
                      <th className="py-3 px-4">Max Marks</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4 text-right">Computed Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {examResults.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {r.subjectCode} - {r.subjectTitle}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{r.examinationId?.title || 'Exam'}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{r.marksObtained}</td>
                        <td className="py-3.5 px-4 text-slate-500">{r.maxMarks}</td>
                        <td className="py-3.5 px-4 text-slate-700">{r.percentage}%</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2.5 py-1 rounded-lg font-extrabold text-xs ${
                            r.grade.startsWith('A') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            r.grade.startsWith('B') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {r.grade}
                          </span>
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

      {/* ======================================================== */}
      {/* TAB 8: CAMPUS NOTICES */}
      {/* ======================================================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-fade-in">
          {announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No Notices" description="No bulletins posted." />
          ) : (
            announcements.map((a) => (
              <div key={a._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-700">{a.category}</span>
                  <span className="text-[11px] text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">{a.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{a.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBMISSION MODAL */}
      {/* ======================================================== */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Submit Assignment Solution</h3>
                <p className="text-xs text-slate-400">{submittingAssignment.title}</p>
              </div>
              <button onClick={() => setSubmittingAssignment(null)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Solution File (PDF, DOC, ZIP, CODE) *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Explanation for Professor</label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Explain your approach or summarize test results..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setSubmittingAssignment(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold">
                  {isSubmitting ? 'Uploading...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
