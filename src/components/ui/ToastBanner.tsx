import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useEnquiryStore } from '../../store/enquiryStore';

export function ToastBanner() {
  const toast = useEnquiryStore((s) => s.toast);
  const dismissToast = useEnquiryStore((s) => s.dismissToast);
  const count = useEnquiryStore((s) => s.items.length);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dismissToast(), 4500);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-[6px] border border-[#C9A24B]/40 bg-[#141418] p-4 shadow-2xl sm:left-6 sm:right-auto"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1F7A4D]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#F7F1E6]">{toast.title}</p>
          {toast.subtitle && (
            <p className="mt-0.5 truncate text-xs text-[#F3EDE2]/75">{toast.subtitle}</p>
          )}
          <div className="mt-2 flex items-center gap-4">
            <Link
              to="/enquiry"
              onClick={dismissToast}
              className="text-xs font-semibold text-[#C9A24B] underline underline-offset-4 hover:text-[#F7F1E6]"
            >
              View Enquiry List ({count})
            </Link>
            <Link
              to="/enquiry/submit"
              onClick={dismissToast}
              className="text-xs font-medium text-[#F3EDE2]/80 hover:text-[#F7F1E6]"
            >
              Submit Bulk Quote
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Close notification"
          className="rounded p-1 text-[#F3EDE2]/60 hover:text-[#F7F1E6]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
