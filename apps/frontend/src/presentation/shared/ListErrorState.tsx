export const ListErrorState = () => {
  return (
    <div className="text-center py-20 bg-red-50 rounded-lg border border-red-100">
      <p className="text-red-600 font-medium">Failed to load media.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 text-sm font-semibold text-red-700 underline"
      >
        Try again
      </button>
    </div>
  );
};
