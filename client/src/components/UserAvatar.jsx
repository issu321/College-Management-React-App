import React, { useState } from 'react';
import { ShieldCheck, School, GraduationCap } from 'lucide-react';

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl font-black'
};

const BADGE_MAP = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
  '2xl': 'w-6 h-6'
};

export default function UserAvatar({
  user,
  size = 'md',
  className = '',
  showRoleBadge = false,
  onClick
}) {
  const [imgError, setImgError] = useState(false);

  const name = user?.name || user?.username || 'User';
  const initial = name.trim().charAt(0).toUpperCase();
  const avatarUrl = user?.avatar;
  const role = user?.role;

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const badgeSizeClass = BADGE_MAP[size] || BADGE_MAP.md;

  // Aesthetic role gradient fallbacks
  let gradientClass = 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white';
  if (role === 'teacher') {
    gradientClass = 'bg-gradient-to-tr from-blue-600 to-indigo-700 text-white';
  } else if (role === 'student') {
    gradientClass = 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white';
  } else if (role === 'superadmin') {
    gradientClass = 'bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 text-white shadow-sky-glow';
  }

  const RoleIcon = role === 'superadmin' ? ShieldCheck : role === 'teacher' ? School : GraduationCap;
  const badgeBg = role === 'superadmin' ? 'bg-sky-500 text-white' : role === 'teacher' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl select-none ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClass} rounded-2xl object-cover border border-slate-200/80 shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClass} ${gradientClass} rounded-2xl flex items-center justify-center font-bold tracking-tight shadow-sm border border-white/20`}
        >
          {initial}
        </div>
      )}

      {showRoleBadge && (
        <span
          className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ${badgeBg} border-2 border-white shadow-sm flex items-center justify-center`}
          title={role ? role.toUpperCase() : ''}
        >
          <RoleIcon className={badgeSizeClass} />
        </span>
      )}
    </div>
  );
}

