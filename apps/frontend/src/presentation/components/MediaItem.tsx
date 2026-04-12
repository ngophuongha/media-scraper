import { Check, Copy, Maximize2, Play } from "lucide-react";
import { useCopyToClipboard } from "../../utils/useCopyToClipboard";

export interface MediaItemData {
  id: number;
  url: string;
  type: string;
  sourceUrl: string;
  createdAt: string;
}

export type MediaItemProps = {
  item: MediaItemData;
  idx?: number;
  setSelectedMedia?: (item: MediaItemData) => void;
};

export const MediaItem = ({ item, setSelectedMedia }: MediaItemProps) => {
  return (
    <div
      onClick={() => setSelectedMedia?.(item)}
      className="break-inside-avoid relative group rounded-lg overflow-hidden bg-gray-50 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-zoom-in min-h-[200px]"
    >
      {item.type === "video" ? (
        <VideoItem item={item} />
      ) : (
        <img
          src={item.url}
          alt="scraped content"
          loading="lazy"
          className="w-full h-auto object-cover max-h-96"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
        <MediaControl id={item.id} url={item.url} />
        <MediaInfo sourceUrl={item.sourceUrl} />
      </div>
    </div>
  );
};

const VideoItem = ({ item }: MediaItemProps) => {
  return (
    <div className="relative">
      <video src={item.url} className="w-full h-auto object-cover max-h-96" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 overflow-hidden relative">
          {/* Animated background layer */}
          <div className="absolute inset-0 bg-primary-gradient -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />

          {/* Icon */}
          <Play className="w-6 h-6 text-brand-gradient-start group-hover:text-white fill-current relative z-10 ml-0.5 transition-colors duration-500" />
        </div>
      </div>
    </div>
  );
};

type MediaControlProps = {
  id: string | number;
  url: string;
};
const MediaControl = ({ id, url }: MediaControlProps) => {
  const { handleCopy, copiedId } = useCopyToClipboard();
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => handleCopy(e, id as number, url)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Copy URL"
        >
          {copiedId === id ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        <div className="p-1.5 rounded-lg bg-white/10 text-white">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

type MediaInfoProps = {
  sourceUrl: string;
};
const MediaInfo = ({ sourceUrl }: MediaInfoProps) => {
  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-white/90 hover:text-white text-xs truncate w-full flex items-center gap-1.5 transition-colors"
    >
      <span className="opacity-70">Source:</span>
      <span className="underline decoration-white/30 truncate">
        {new URL(sourceUrl).hostname}
      </span>
    </a>
  );
};
