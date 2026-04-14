import { CheckCircle2, XCircle, X } from "lucide-react";
import { useToastStore } from "../hooks/useToastStore";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl shadow-xl w-80 max-h-48 overflow-y-auto pointer-events-auto transition-all animate-in slide-in-from-right-8 fade-in flex items-start gap-3 border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed whitespace-pre-wrap flex-1 text-sm font-medium">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-60 hover:opacity-100 flex-shrink-0 focus:outline-none transition-opacity bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Compatibility hook for existing components
export const useToast = () => {
  const showToast = useToastStore((state) => state.showToast);
  return { showToast };
};
