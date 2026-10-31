import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Bell, 
  LogOut, 
  CheckCheck, 
  Clock, 
  ShieldCheck, 
  User, 
  GraduationCap, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

import UserAvatar from './UserAvatar';

export default function Navbar({ onLogoutClick }) {
  const { user, logout, openProfile } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const notifRef = useRef(null);

  // Fetch notifications
  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (e) {
      toast.error('Failed to mark all as read.');
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl sky-gradient-primary flex items-center justify-center text-white shadow-sky-glow font-extrabold text-lg tracking-wider">
            Ω
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">APEX CMS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-medium hidden sm:block">Multi-Tenant Higher Education Suite</p>
          </div>
        </div>

        {/* Institutional Tenant Badge (for non-SuperAdmin) */}
        {!isSuperAdmin && user?.collegeName && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 max-w-sm">
            <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="font-semibold truncate">{user.collegeName}</span>
            {user.collegeCode && (
              <span className="text-[10px] px-1.5 py-0.5 bg-brand-50 text-brand-700 font-bold rounded-md border border-brand-200 shrink-0">
                {user.collegeCode}
              </span>
            )}
          </div>
        )}

        {/* SuperAdmin Global Platform Scope Tag */}
        {isSuperAdmin && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="font-bold">Root Super Administrator Scope</span>
          </div>
        )}

        {/* Right Section: Notifications & User Menu */}
        <div className="flex items-center gap-3">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.read && handleMarkAsRead(n._id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !n.read ? 'bg-sky-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-xs text-slate-800">{n.title}</p>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <button
              onClick={openProfile}
              className="flex items-center gap-2.5 p-1 -m-1 rounded-2xl hover:bg-slate-100 transition-all text-left group"
              title="View & Edit Profile"
            >
              <UserAvatar
                user={user}
                size="md"
                showRoleBadge={true}
                className="group-hover:scale-105 transition-transform"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[130px] group-hover:text-brand-600 transition-colors">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                  {user?.role === 'superadmin' ? 'Super Admin' : user?.role}
                </p>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogoutClick}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all ml-1"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
