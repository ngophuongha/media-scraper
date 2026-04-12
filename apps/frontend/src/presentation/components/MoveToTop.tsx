import { ArrowUp } from "lucide-react";
import { useScrollToTop } from "../../utils/useScrollToTop";

export const MoveToTop = () => {
  const { scrollToTop, shouldShowScrollTop } = useScrollToTop();
  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 p-4 rounded-full bg-primary-gradient text-white shadow-2xl transition-all duration-300 transform z-50 hover:scale-110 active:scale-95 ${
        shouldShowScrollTop
          ? "translate-y-0 opacity-100"
          : "translate-y-20 opacity-0 pointer-events-none"
      }`}
      aria-label="Move to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};
