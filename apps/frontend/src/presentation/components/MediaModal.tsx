import { Check, Link, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { MediaItemData } from "./MediaItem";

interface MediaModalProps {
  item: MediaItemData;
  onClose: () => void;
}

export function MediaModal({ item, onClose }: MediaModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        onClick={handleCopy}
        className="absolute top-6 right-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all z-10"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Copied!</span>
          </>
        ) : (
          <>
            <Link className="w-4 h-4" />
            <span className="text-sm font-medium">Copy URL</span>
          </>
        )}
      </button>

      {/* Media Content */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video" ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="rounded-lg shadow-2xl max-w-full max-h-full"
          />
        ) : (
          <img
            src={item.url}
            alt="fullscreen media"
            className="rounded-lg shadow-2xl max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/60 text-sm">
        <p>
          Source:{" "}
          <span className="text-white/80">
            {new URL(item.sourceUrl).hostname}
          </span>
        </p>
      </div>
    </div>
  );
}
