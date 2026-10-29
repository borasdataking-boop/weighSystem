import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  desc?: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

interface ToastItemProps {
  toast: ToastMessage;
  onClose?: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const content = toast.desc || toast.message || '';
  const type = toast.type || 'success';

  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, onClose]);

  const getBorderColor = () => {
    switch (type) {
      case 'error': return 'border-l-red-600';
      case 'warning': return 'border-l-amber-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-emerald-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`pointer-events-auto bg-white border border-slate-200 border-l-4 shadow-lg rounded-lg p-3.5 min-w-[320px] max-w-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${getBorderColor()}`}
    >
      {getIcon()}
      <div className="flex-1">
        <div className="text-xs font-semibold text-slate-900">{toast.title}</div>
        {content && <div className="text-[11px] text-slate-500 mt-0.5">{content}</div>}
      </div>
      {onClose && (
        <button
          onClick={() => onClose(toast.id)}
          className="text-slate-400 hover:text-slate-600 text-sm leading-none p-1 cursor-pointer"
        >
          &times;
        </button>
      )}
    </div>
  );
};

interface ToastProps {
  toast?: ToastMessage;
  toasts?: ToastMessage[];
  onClose?: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, toasts, onClose }) => {
  if (toast) {
    return <ToastItem toast={toast} onClose={onClose} />;
  }

  if (toasts && toasts.length > 0) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-50 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={onClose} />
        ))}
      </div>
    );
  }

  return null;
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-50 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};
