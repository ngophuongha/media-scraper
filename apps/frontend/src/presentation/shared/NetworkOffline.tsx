import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "../../utils/useNetworkStatus";

export const NetworkOffline = ({ children }: { children: React.ReactNode }) => {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4">
        <div className="bg-white/90 backdrop-blur-md text-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-100 p-2 rounded-xl">
            <WifiOff className="w-5 h-5 text-gray-500" />
          </div>
          <p className="font-semibold text-sm tracking-tight">You are currently offline</p>
        </div>
      </div>
    );
  }

  return children;
};
