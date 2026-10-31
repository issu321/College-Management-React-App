import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Navbar from './components/Navbar';
import ConfirmModal from './components/ConfirmModal';
import ProfileModal from './components/ProfileModal';
import LoginView from './views/LoginView';
import SuperAdminView from './views/SuperAdminView';
import TeacherView from './views/TeacherView';
import StudentView from './views/StudentView';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl sky-gradient-primary animate-bounce flex items-center justify-center text-white font-extrabold text-xl shadow-sky-glow">
          Ω
        </div>
        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Initializing Institutional Portal...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onLogoutClick={() => setShowLogoutConfirm(true)} />

      {/* Main View based on Authenticated Role */}
      <main className="flex-1 pb-16">
        {user.role === 'superadmin' && <SuperAdminView />}
        {user.role === 'teacher' && <TeacherView />}
        {user.role === 'student' && <StudentView />}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Apex Higher Education Multi-Tenant Suite. All Rights Reserved.</p>
          <p className="font-medium text-slate-500">
            {user.role === 'superadmin' ? 'Root Platform Scope' : user.collegeName || 'Institutional Campus'}
          </p>
        </div>
      </footer>

      {/* Executive Profile Modal for all roles */}
      <ProfileModal />

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out Confirmation"
        message="Are you sure you want to log out of your session? You will need to sign in again to access the portal."
        confirmLabel="Sign Out"
        isDanger={true}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
