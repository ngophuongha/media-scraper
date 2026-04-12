import { Filter } from "lucide-react";

export const NoMediaFound = () => {
  return (
    <div className="text-center py-32 bg-white rounded-lg border border-dashed border-gray-200 mt-4">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Filter className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-xl font-bold text-gray-800">No media found</p>
      <p className="mt-2 text-gray-500 max-w-xs mx-auto">
        We couldn't find any assets matching your criteria. Try adjusting your
        search or filters.
      </p>
    </div>
  );
};
