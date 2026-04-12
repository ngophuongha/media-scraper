export function MediaSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-100 shadow-sm mb-4 min-h-[280px]">
      {/* Base shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 background-animate animate-shimmer" />

      {/* Main content area */}
      <div className="w-full h-72" />

      {/* Overlay details */}
      <div className="absolute bottom-4 left-4 right-4 space-y-3">
        <div className="h-4 w-20 bg-gray-200/80 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-gray-200/60 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="flex flex-row gap-4 w-full items-start pt-4">
      {/* Mobile: 1 col, SM: 2 cols, LG: 3 cols, XL: 4 cols */}
      <div className="flex-1 flex flex-col gap-4">
        {[...Array(2)].map((_, i) => (
          <MediaSkeleton key={i} />
        ))}
      </div>
      <div className="hidden sm:flex flex-1 flex flex-col gap-4">
        {[...Array(2)].map((_, i) => (
          <MediaSkeleton key={i} />
        ))}
      </div>
      <div className="hidden lg:flex flex-1 flex flex-col gap-4">
        {[...Array(2)].map((_, i) => (
          <MediaSkeleton key={i} />
        ))}
      </div>
      <div className="hidden xl:flex flex-1 flex flex-col gap-4">
        {[...Array(2)].map((_, i) => (
          <MediaSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
