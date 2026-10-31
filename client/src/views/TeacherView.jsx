import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  CheckSquare, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Award, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Megaphone, 
  ExternalLink, 
  Paperclip, 
  FolderSearch, 
  Save, 
  Sparkles,
  School,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import UserAvatar from '../components/UserAvatar';

export default function TeacherView() {
  const { user, openProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'subjects' | 'students' | 'attendance' | 'assignments' | 'materials' | 'timetable' | 'exams' | 'announcements'

  // Data States
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Forms
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    title: '',
    department: user?.department || 'Computer Science & Engineering',
    semester: '6th Sem',
    credits: 4,
    room: 'Hall 301',
    syllabus: 'Module 1: Fundamentals, Module 2: Advanced Design, Module 3: Implementations'
  });

  // Material Upload Modal State
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialFile, setMaterialFile] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    category: 'Lecture Slides & Notes'
  });

  // Assignment Modal State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxMarks: 100
  });

  // Grade Submission Modal State
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState({ marks: '', feedback: '' });

  // Attendance Management States
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState([]); // Array of { studentId, studentName, rollNo, status }
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Timetable Form State
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [timetableForm, setTimetableForm] = useState({
    subjectId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    classroom: 'Lab 201'
  });

  // Exam Form & Marks State
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    examType: 'Mid-Term Assessment',
    department: user?.department || 'Computer Science & Engineering',
    semester: '6th Sem',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  });
  const [enteringMarksExam, setEnteringMarksExam] = useState(null);
  const [examMarksEntries, setExamMarksEntries] = useState([]);

  // Confirm Modal State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    onConfirm: null
  });

  // Load Teacher Subjects & Core Data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [subjRes, matRes, asnRes, annRes, timeRes, examRes] = await Promise.all([
        api.getSubjects(),
        api.getStudyMaterials(),
        api.getAssignments(),
        api.getAnnouncements(),
        api.getTimetable(),
        api.getExams()
      ]);

      if (subjRes?.subjects) {
        setSubjects(subjRes.subjects);
        if (subjRes.subjects.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(subjRes.subjects[0]._id);
          setMaterialForm((p) => ({ ...p, subjectId: subjRes.subjects[0]._id }));
          setAssignmentForm((p) => ({ ...p, subjectId: subjRes.subjects[0]._id }));
          setTimetableForm((p) => ({ ...p, subjectId: subjRes.subjects[0]._id }));
        }
      }
      if (matRes?.materials) setMaterials(matRes.materials);
      if (asnRes?.assignments) setAssignments(asnRes.assignments);
      if (annRes?.announcements) setAnnouncements(annRes.announcements);
      if (timeRes?.schedules) setTimetable(timeRes.schedules);
      if (examRes?.exams) setExams(examRes.exams);
    } catch (err) {
      toast.error('Failed to load teacher data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When subject or date changes in Attendance tab, load enrolled students and any existing records
  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchAttendanceContext = async () => {
      try {
        // 1. Fetch enrolled students for this subject
        const studRes = await api.getEnrolledStudents(selectedSubjectId);
        const students = studRes?.students || [];
        setEnrolledStudents(students);

        // 2. Fetch existing attendance records for this subject and date
        const attRes = await api.getAttendance({ subjectId: selectedSubjectId, date: attendanceDate });
        const existingSession = attRes?.records?.[0];

        if (existingSession && existingSession.records && existingSession.records.length > 0) {
          // Merge existing statuses
          const merged = students.map((st) => {
            const found = existingSession.records.find((r) => r.studentId === st._id);
            return {
              studentId: st._id,
              studentName: st.name,
              rollNo: st.rollNo || '',
              status: found?.status || 'Present',
              remarks: found?.remarks || ''
            };
          });
          setAttendanceList(merged);
        } else {
          // Default all to Present
          setAttendanceList(
            students.map((st) => ({
              studentId: st._id,
              studentName: st.name,
              rollNo: st.rollNo || '',
              status: 'Present',
              remarks: ''
            }))
          );
        }
      } catch (err) {
        console.warn('Attendance load error:', err.message);
      }
    };

    fetchAttendanceContext();
  }, [selectedSubjectId, attendanceDate, activeTab]);

  // Create Subject
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createSubject(subjectForm);
      toast.success(`Subject '${res.subject.title}' created successfully!`);
      setShowSubjectModal(false);
      setSubjectForm({
        code: '',
        title: '',
        department: user?.department || 'Computer Science & Engineering',
        semester: '6th Sem',
        credits: 4,
        room: 'Hall 301',
        syllabus: ''
      });
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to create subject.');
    }
  };

  // Upload Study Material
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialFile) {
      toast.warning('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('title', materialForm.title);
    formData.append('description', materialForm.description);
    formData.append('subjectId', materialForm.subjectId || selectedSubjectId);
    formData.append('category', materialForm.category);
    formData.append('materialFile', materialFile);

    try {
      await api.uploadStudyMaterial(formData);
      toast.success('Study material uploaded and shared with students!');
      setShowMaterialModal(false);
      setMaterialFile(null);
      setMaterialForm({
        title: '',
        description: '',
        subjectId: subjects[0]?._id || '',
        category: 'Lecture Slides & Notes'
      });
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    }
  };

  // Delete Study Material
  const handleDeleteMaterial = (mat) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Study Material',
      message: `Are you sure you want to permanently delete "${mat.title}"? The uploaded file will be removed.`,
      confirmLabel: 'Delete Material',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.deleteStudyMaterial(mat._id);
          toast.success('Study material deleted successfully.');
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
          loadInitialData();
        } catch (err) {
          toast.error(err.message || 'Failed to delete material.');
        }
      }
    });
  };

  // Delete Assignment
  const handleDeleteAssignment = (asn) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Assignment',
      message: `Are you sure you want to permanently delete assignment "${asn.title}"? All student submissions, submitted files, and grade entries will be wiped.`,
      confirmLabel: 'Delete Assignment',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.deleteAssignment(asn._id);
          toast.success(`Assignment "${asn.title}" deleted successfully.`);
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
          loadInitialData();
        } catch (err) {
          toast.error(err.message || 'Failed to delete assignment.');
        }
      }
    });
  };

  // Publish Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', assignmentForm.title);
    formData.append('description', assignmentForm.description);
    formData.append('subjectId', assignmentForm.subjectId || selectedSubjectId);
    formData.append('dueDate', assignmentForm.dueDate);
    formData.append('maxMarks', assignmentForm.maxMarks);
    if (assignmentFile) {
      formData.append('attachment', assignmentFile);
    }

    try {
      await api.createAssignment(formData);
      toast.success('Assignment created and published!');
      setShowAssignmentModal(false);
      setAssignmentFile(null);
      setAssignmentForm({
        title: '',
        description: '',
        subjectId: subjects[0]?._id || '',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        maxMarks: 100
      });
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment.');
    }
  };

  // Grade Student Submission
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await api.gradeSubmission(gradingSubmission._id, {
        grade: Number(gradeInput.marks),
        feedback: gradeInput.feedback
      });
      toast.success(`Submission graded: ${gradeInput.marks} marks.`);
      setGradingSubmission(null);
      setGradeInput({ marks: '', feedback: '' });
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to grade submission.');
    }
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    if (!selectedSubjectId || attendanceList.length === 0) {
      toast.warning('No enrolled students available to mark attendance.');
      return;
    }

    setIsSavingAttendance(true);
    try {
      await api.markAttendance({
        subjectId: selectedSubjectId,
        date: attendanceDate,
        records: attendanceList
      });
      toast.success(`Attendance successfully recorded for ${attendanceDate}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance.');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Toggle student status in attendance list
  const toggleAttendanceStatus = (studentId, newStatus) => {
    setAttendanceList((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  // Mark all students Present or Absent
  const markAllAttendance = (status) => {
    setAttendanceList((prev) => prev.map((r) => ({ ...r, status })));
    toast.info(`Marked all students as ${status}.`);
  };

  // Schedule Timetable Entry
  const handleCreateTimetable = async (e) => {
    e.preventDefault();
    try {
      await api.createTimetableEntry(timetableForm);
      toast.success('Class timetable schedule saved!');
      setShowTimetableModal(false);
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to create schedule.');
    }
  };

  // Schedule Examination
  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.createExam(examForm);
      toast.success('Examination scheduled successfully!');
      setShowExamModal(false);
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to schedule exam.');
    }
  };

  // Open Marks Entry Modal
  const openMarksEntry = async (exam) => {
    setEnteringMarksExam(exam);
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0]._id);
    }

    try {
      const studRes = await api.getEnrolledStudents(selectedSubjectId || subjects[0]?._id);
      const studs = studRes?.students || [];
      setExamMarksEntries(
        studs.map((s) => ({
          studentId: s._id,
          studentName: s.name,
          rollNo: s.rollNo || '',
          marksObtained: 85,
          maxMarks: 100
        }))
      );
    } catch (e) {}
  };

  // Save Examination Marks
  const handleSaveExamMarks = async (e) => {
    e.preventDefault();
    try {
      await api.enterMarks({
        examinationId: enteringMarksExam._id,
        subjectId: selectedSubjectId || subjects[0]?._id,
        results: examMarksEntries
      });
      toast.success('Exam marks recorded and letter grades computed!');
      setEnteringMarksExam(null);
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit marks.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Faculty Academic Console
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
              {user?.designation || 'Faculty Member'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.collegeName || 'Campus'} • Department of {user?.department}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSubjectModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
          <button
            onClick={() => setShowMaterialModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <Upload className="w-4 h-4 text-brand-600" />
            Upload Notes
          </button>
          <button
            onClick={() => setShowAssignmentModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <FileText className="w-4 h-4 text-brand-600" />
            New Assignment
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar border-b border-slate-200/80 mb-6 text-xs sm:text-sm font-semibold">
        {[
          { id: 'dashboard', label: 'Faculty Dashboard', icon: School },
          { id: 'attendance', label: 'Attendance Management', icon: CheckSquare },
          { id: 'assignments', label: `Assignments (${assignments.length})`, icon: FileText },
          { id: 'materials', label: `Study Materials (${materials.length})`, icon: BookOpen },
          { id: 'subjects', label: `My Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'timetable', label: 'Class Timetable', icon: Calendar },
          { id: 'exams', label: 'Examinations & Grades', icon: Award },
          { id: 'announcements', label: 'Campus Notices', icon: Megaphone }
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
          title="Open Faculty Profile"
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
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Subjects</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{subjects.length}</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Active syllabus courses</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Notes & Files</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{materials.length}</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Published resources & slides</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Assignments</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{assignments.length}</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Homework & lab tasks</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timetable Slots</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{timetable.length}</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Weekly scheduled lectures</p>
            </div>
          </div>

          {/* Quick Actions & Pending Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Quick Attendance Launcher */}
            <div className="bg-gradient-to-br from-brand-600 to-blue-700 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Fast Attendance Marking
                </div>
                <h3 className="text-xl font-bold tracking-tight">Record Today's Class Attendance</h3>
                <p className="text-xs text-sky-100 mt-1 leading-relaxed">
                  Select your subject, verify students, and record real attendance percentages instantly.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                <span className="text-xs font-medium text-sky-100">Date: {new Date().toLocaleDateString()}</span>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="px-4 py-2 bg-white text-brand-700 hover:bg-sky-50 font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Open Attendance Register &rarr;
                </button>
              </div>
            </div>

            {/* Recent Materials */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Recent Study Materials</h3>
                <button
                  onClick={() => setActiveTab('materials')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800"
                >
                  View All
                </button>
              </div>

              {materials.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Materials Uploaded"
                  description="Share lecture notes, slides, and syllabus files with students."
                  actionLabel="Upload Notes"
                  onAction={() => setShowMaterialModal(true)}
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
      {/* TAB 2: ATTENDANCE MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-premium flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code}: {s.title} ({s.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Attendance Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Quick Bulk Marking & Save */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                type="button"
                onClick={() => markAllAttendance('Present')}
                className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => markAllAttendance('Absent')}
                className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold"
              >
                All Absent
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSavingAttendance || attendanceList.length === 0}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {/* Student Attendance Register Table */}
          {attendanceList.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Enrolled Students"
              description="No active students are currently registered in this subject's department and semester."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Enrolled Students Register ({attendanceList.length} Students)
                </span>
                <span className="text-slate-400">
                  Present: {attendanceList.filter((r) => r.status === 'Present').length} • Absent: {attendanceList.filter((r) => r.status === 'Absent').length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Roll No</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Attendance Status</th>
                      <th className="py-3.5 px-4 text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceList.map((st) => (
                      <tr key={st.studentId} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{st.rollNo || '—'}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{st.studentName}</td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                            {['Present', 'Absent', 'Late', 'Excused'].map((stat) => (
                              <button
                                key={stat}
                                type="button"
                                onClick={() => toggleAttendanceStatus(st.studentId, stat)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                                  st.status === stat
                                    ? stat === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : stat === 'Absent'
                                      ? 'bg-rose-600 text-white shadow-sm'
                                      : 'bg-amber-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {stat}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <input
                            type="text"
                            placeholder="Optional note"
                            value={st.remarks || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAttendanceList((prev) =>
                                prev.map((r) => (r.studentId === st.studentId ? { ...r, remarks: val } : r))
                              );
                            }}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-36 text-right focus:outline-none focus:border-brand-500"
                          />
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
      {/* TAB 3: ASSIGNMENT MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-fade-in">
          {assignments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Assignments Published"
              description="Create term assignments and evaluate student project solutions."
              actionLabel="Create Assignment"
              onAction={() => setShowAssignmentModal(true)}
            />
          ) : (
            <div className="space-y-6">
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
                        Due Date: <strong className="text-slate-700">{asn.dueDate}</strong> • Max Marks: {asn.maxMarks}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                        {asn.submissionCount || asn.submissions?.length || 0} Submissions
                      </span>
                      <button
                        onClick={() => handleDeleteAssignment(asn)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">{asn.description}</p>

                  {/* Attachment if present */}
                  {asn.attachmentName && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                      <Paperclip className="w-3.5 h-3.5 text-brand-600" />
                      <span>{asn.attachmentName}</span>
                      <button
                        onClick={() => api.downloadFile('assignment', asn._id, asn.attachmentName)}
                        className="text-brand-600 hover:text-brand-800 ml-2 font-bold"
                      >
                        Download
                      </button>
                    </div>
                  )}

                  {/* Student Submissions List for this assignment */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Submitted Student Work</h4>
                    {!asn.submissions || asn.submissions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No student submissions received yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                        {asn.submissions.map((subm) => (
                          <div key={subm._id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800">{subm.studentName}</span>
                                <span className="font-mono text-[10px] text-slate-400">({subm.rollNo})</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  subm.status === 'Graded' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {subm.status}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-slate-500 mt-1">{subm.notes || 'No notes provided.'}</p>
                              {subm.fileName && (
                                <p className="text-[10px] text-brand-600 font-semibold flex items-center gap-1 mt-1">
                                  <Paperclip className="w-3 h-3" />
                                  {subm.fileName}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {subm.fileName && (
                                <button
                                  onClick={() => api.downloadFile('submission', subm._id, subm.fileName)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Solution
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setGradingSubmission(subm);
                                  setGradeInput({ marks: subm.grade || '', feedback: subm.feedback || '' });
                                }}
                                className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
                              >
                                {subm.status === 'Graded' ? `Grade (${subm.grade})` : 'Grade Work'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: STUDY MATERIALS & NOTES */}
      {/* ======================================================== */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-fade-in">
          {materials.length === 0 ? (
            <EmptyState
              icon={Upload}
              title="No Study Materials Uploaded"
              description="Upload PDF slides, doc notes, and assignments for your students."
              actionLabel="Upload Material"
              onAction={() => setShowMaterialModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {materials.map((m) => (
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
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{m.description || 'Lecture material'}</p>
                    <div className="text-[11px] text-slate-400 mb-4">{m.category}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => api.downloadFile('material', m._id, m.originalName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
                      title="Delete Study Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MY SUBJECTS */}
      {/* ======================================================== */}
      {activeTab === 'subjects' && (
        <div className="space-y-6 animate-fade-in">
          {subjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Subjects Created"
              description="Create the courses and subjects you are currently teaching."
              actionLabel="Add Subject"
              onAction={() => setShowSubjectModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subjects.map((s) => (
                <div key={s._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">
                      {s.code}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{s.credits} Credits</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{s.department} • {s.semester}</p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 line-clamp-2">
                    {s.syllabus || 'Syllabus details available.'}
                  </p>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Room: {s.room}</span>
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
          <div className="flex justify-end">
            <button
              onClick={() => setShowTimetableModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Class Slot
            </button>
          </div>

          {timetable.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Timetable Entries"
              description="Schedule classroom hours and weekly lectures."
              actionLabel="Add Class Slot"
              onAction={() => setShowTimetableModal(true)}
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
                  <p className="text-[11px] text-slate-400 mb-3 font-mono">{t.subjectCode}</p>
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
      {/* TAB 7: EXAMINATIONS & MARKS */}
      {/* ======================================================== */}
      {activeTab === 'exams' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-end">
            <button
              onClick={() => setShowExamModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Schedule Exam
            </button>
          </div>

          {exams.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No Examinations Scheduled"
              description="Schedule mid-terms, final assessments, and record computed student letter grades."
              actionLabel="Schedule Exam"
              onAction={() => setShowExamModal(true)}
            />
          ) : (
            <div className="space-y-4">
              {exams.map((ex) => (
                <div key={ex._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        {ex.examType}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{ex.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {ex.department} • {ex.semester} • Window: {ex.startDate} to {ex.endDate}
                    </p>
                  </div>

                  <button
                    onClick={() => openMarksEntry(ex)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Enter Student Marks
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: CAMPUS ANNOUNCEMENTS */}
      {/* ======================================================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-fade-in">
          {announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No Announcements" description="No notices published currently." />
          ) : (
            announcements.map((a) => (
              <div key={a._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-premium">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-700">{a.category}</span>
                  <span className="text-[11px] text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">{a.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600">{a.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBJECT CREATION MODAL */}
      {/* ======================================================== */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Subject</h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    placeholder="CS602"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Credits</label>
                  <input
                    type="number"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject Title *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.title}
                  onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                  placeholder="e.g. Machine Learning & Neural Networks"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semester *</label>
                  <select
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lecture Hall / Lab</label>
                  <input
                    type="text"
                    value={subjectForm.room}
                    onChange={(e) => setSubjectForm({ ...subjectForm, room: e.target.value })}
                    placeholder="Hall 301"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Syllabus Modules</label>
                <textarea
                  rows={3}
                  value={subjectForm.syllabus}
                  onChange={(e) => setSubjectForm({ ...subjectForm, syllabus: e.target.value })}
                  placeholder="Module 1: Foundations, Module 2: Algorithms..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold">Create Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STUDY MATERIAL UPLOAD MODAL */}
      {/* ======================================================== */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Upload Study Material & Notes</h3>
              <button onClick={() => setShowMaterialModal(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUploadMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. Distributed Consensus Lecture Slides"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject *</label>
                  <select
                    value={materialForm.subjectId}
                    onChange={(e) => setMaterialForm({ ...materialForm, subjectId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>{s.code}: {s.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Lecture Slides & Notes">Lecture Slides & Notes</option>
                    <option value="Reference Book / Syllabus">Reference Book / Syllabus</option>
                    <option value="Previous Year Papers">Previous Year Papers</option>
                    <option value="Lab Manuals & Code">Lab Manuals & Code</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">File Attachment (PDF, DOC, ZIP, PPT) *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowMaterialModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold">Upload to Repository</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ASSIGNMENT CREATION MODAL */}
      {/* ======================================================== */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Publish Assignment</h3>
              <button onClick={() => setShowAssignmentModal(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="Lab Assignment 4: Raft Consensus Cluster"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject *</label>
                <select
                  value={assignmentForm.subjectId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.code}: {s.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Submission Deadline *</label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    value={assignmentForm.maxMarks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  placeholder="Enter detailed problem statement..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Optional Problem Spec Sheet (PDF/ZIP)</label>
                <input
                  type="file"
                  onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold">Publish to Students</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* GRADING MODAL */}
      {/* ======================================================== */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Grade Student Work</h3>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleGradeSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p><strong className="text-slate-800">Student:</strong> {gradingSubmission.studentName} ({gradingSubmission.rollNo})</p>
                <p><strong className="text-slate-800">Submitted Notes:</strong> {gradingSubmission.notes || 'None'}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Marks Awarded *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={gradeInput.marks}
                  onChange={(e) => setGradeInput({ ...gradeInput, marks: e.target.value })}
                  placeholder="e.g. 95"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teacher Feedback & Remarks</label>
                <textarea
                  rows={3}
                  value={gradeInput.feedback}
                  onChange={(e) => setGradeInput({ ...gradeInput, feedback: e.target.value })}
                  placeholder="Commendable code quality and fault tolerance handling."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setGradingSubmission(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TIMETABLE MODAL */}
      {/* ======================================================== */}
      {showTimetableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Schedule Lecture Slot</h3>
              <button onClick={() => setShowTimetableModal(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTimetable} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject *</label>
                <select
                  value={timetableForm.subjectId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.code}: {s.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Day of Week</label>
                  <select
                    value={timetableForm.dayOfWeek}
                    onChange={(e) => setTimetableForm({ ...timetableForm, dayOfWeek: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Classroom</label>
                  <input
                    type="text"
                    value={timetableForm.classroom}
                    onChange={(e) => setTimetableForm({ ...timetableForm, classroom: e.target.value })}
                    placeholder="Lab 201"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    value={timetableForm.startTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Time</label>
                  <input
                    type="text"
                    value={timetableForm.endTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })}
                    placeholder="10:30 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTimetableModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold">Add Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EXAM SCHEDULING MODAL */}
      {/* ======================================================== */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Schedule Examination</h3>
              <button onClick={() => setShowExamModal(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateExam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="Spring 2026 Mid-Semester Assessment"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assessment Type</label>
                <select
                  value={examForm.examType}
                  onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="Mid-Term Assessment">Mid-Term Assessment</option>
                  <option value="End-Term Semester Exam">End-Term Semester Exam</option>
                  <option value="Internal Practical Exam">Internal Practical Exam</option>
                  <option value="Class Quiz / Test">Class Quiz / Test</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={examForm.startDate}
                    onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={examForm.endDate}
                    onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowExamModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold">Schedule Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ENTER MARKS MODAL */}
      {/* ======================================================== */}
      {enteringMarksExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{enteringMarksExam.title}</h3>
                <p className="text-xs text-slate-400">Enter marks obtained out of 100</p>
              </div>
              <button onClick={() => setEnteringMarksExam(null)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveExamMarks} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="divide-y divide-slate-100">
                {examMarksEntries.map((entry, idx) => (
                  <div key={entry.studentId} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{entry.studentName}</p>
                      <p className="font-mono text-slate-400">{entry.rollNo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={entry.marksObtained}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setExamMarksEntries((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, marksObtained: val } : item))
                          );
                        }}
                        className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                      />
                      <span className="text-slate-400">/ 100</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEnteringMarksExam(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">Calculate Grades & Publish</button>
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
