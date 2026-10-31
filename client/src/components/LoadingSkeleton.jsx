import React from 'react';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  if (type === 'table') {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 animate-pulse">
        <div className="h-6 bg-slate-100 rounded-lg w-1/4 mb-4" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-4 bg-slate-100 rounded w-1/6" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-4 bg-slate-100 rounded w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 animate-pulse shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
          </div>
          <div className="h-8 bg-slate-100 rounded-xl w-full pt-2" />
        </div>
      ))}
    </div>
  );
}

