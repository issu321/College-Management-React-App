import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Lock, 
  ShieldCheck, 
  Building2, 
  Check, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';

// 12 Curated Professional Avatars
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80'
];

export default function ProfileModal() {
  const { user, isProfileOpen, closeProfile, updateUserProfile } = useAuth();
  const toast = useToast();

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'avatars' | 'security'
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized with current user
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    designation: user?.designation || '',
    qualification: user?.qualification || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    address: user?.address || '',
    avatar: user?.avatar || ''
  });

  // Password Change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!isProfileOpen || !user) return null;

  // Handle local image file upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    setIsUploading(true);
    try {
      const res = await api.uploadAvatar(uploadData);
      if (res && res.user) {
        updateUserProfile(res.user);
        setFormData((prev) => ({ ...prev, avatar: res.user.avatar }));
        toast.success('Profile photo updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle picking preset avatar
  const handleSelectPreset = async (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    try {
      const res = await api.updateProfile({ avatar: url });
      if (res && res.user) {
        updateUserProfile(res.user);
        toast.success('Avatar preset applied!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to apply preset.');
    }
  };

  // Handle Saving Profile Info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProfile(formData);
      if (res && res.user) {
        updateUserProfile(res.user);
        toast.success('Profile details saved successfully.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('general');
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const roleLabel =
    user.role === 'superadmin'
      ? 'Root Super Administrator'
      : user.role === 'teacher'
      ? 'Faculty Member'
      : 'Enrolled Scholar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-slide-up my-auto">
        
        {/* Cover Banner */}
        <div className="relative h-28 sm:h-36 sky-gradient-primary flex items-end p-6">
          <button
            onClick={closeProfile}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Profile Suite
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="px-6 pb-6 pt-0 border-b border-slate-100 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            
            {/* Avatar with Camera Trigger */}
            <div className="relative group self-start">
              <UserAvatar
                user={{ ...user, avatar: formData.avatar }}
                size="2xl"
                className="border-4 border-white shadow-xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-1 right-1 p-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-2xl shadow-lg border-2 border-white transition-all flex items-center justify-center"
                title="Upload Photo"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Quick Actions / Role Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                {roleLabel}
              </span>
              {user.collegeName && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1.5 truncate max-w-[200px]">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{user.collegeName}</span>
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {user.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-2">
              <span>{user.email}</span>
              {user.employeeId && (
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-bold">
                  ID: {user.employeeId}
                </span>
              )}
              {user.rollNo && (
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-bold">
                  Roll: {user.rollNo}
                </span>
              )}
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mt-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'general'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Account Details
            </button>
            <button
              onClick={() => setActiveTab('avatars')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'avatars'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Avatar Gallery
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'security'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Security & Password
            </button>
          </div>
        </div>

        {/* Tab 1: General Details Form */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Phone / Mobile
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Designation / Role
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Associate Professor / Dean"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Qualifications
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="Ph.D. in Computer Science"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Specialization / Domain
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Distributed Systems & Cloud Computing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Address & Campus Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Campus Staff Quarters, Block B-402, Academic City"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeProfile}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-md transition-all flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Curated Avatar Gallery */}
        {activeTab === 'avatars' && (
          <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Preset Profile Pictures</h4>
                <p className="text-xs text-slate-500">
                  Select an executive studio avatar or upload your personal portrait.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {PRESET_AVATARS.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(url)}
                  className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all p-1 group ${
                    formData.avatar === url
                      ? 'border-brand-600 ring-2 ring-brand-500/20 bg-brand-50/50'
                      : 'border-slate-200 hover:border-brand-400 hover:scale-[1.03]'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar option ${idx + 1}`}
                    className="w-full aspect-square rounded-xl object-cover shadow-sm"
                  />
                  {formData.avatar === url && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Or Paste Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-avatar.png"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleSelectPreset(formData.avatar)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Change Portal Password</h4>
              <p className="text-xs text-slate-500">
                Ensure you use a strong password with at least 6 characters.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeProfile}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-md transition-all flex items-center gap-2"
              >
                {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

