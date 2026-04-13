import { useNetworkStatus } from "../../utils/useNetworkStatus";

export const NetworkOffline = ({ children }: { children: React.ReactNode }) => {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <p className="text-center">You are offline</p>
        </div>
      </div>
    );
  }

  return children;
};
