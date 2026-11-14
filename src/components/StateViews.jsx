import React from 'react';

export function LoadingView({ message = 'Loading records from TerraTills secure server...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-100 border-t-forest animate-spin"></div>
        <span className="absolute inset-0 flex items-center justify-center text-sm">🌱</span>
      </div>
      <p className="text-xs font-semibold text-slate-600">{message}</p>
    </div>
  );
}

export function EmptyView({ icon = '🌾', title = 'No records found', description = 'There are no active items matching your criteria.', actionLabel, onAction }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-forest text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-forest-700 transition shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorView({ error = 'Failed to load records.', onRetry }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
        ⚠️
      </div>
      <h3 className="text-xs font-bold text-rose-900 mb-1">Service Error</h3>
      <p className="text-[11px] text-rose-700 mb-3">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-rose-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-rose-700 transition"
        >
          Safe Retry
        </button>
      )}
    </div>
  );
}

export function OfflineView() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-900 flex items-center justify-center space-x-2">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
      <span>You are currently working offline. Actions requiring server verification will queue until reconnection.</span>
    </div>
  );
}

export function PermissionDeniedView({ reason = 'You do not have authorization to view this record or perform this action.' }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-12">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3 text-2xl">
        🔒
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">Access Restricted</h3>
      <p className="text-xs text-slate-500 mb-4">{reason}</p>
      <button
        onClick={() => window.history.back()}
        className="bg-forest text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-forest-700 transition"
      >
        Return to Previous Page
      </button>
    </div>
  );
}

