import { AlertCircle, CheckCircle, Cloud, HardDrive } from 'lucide-react';

interface DatabaseStatusBannerProps {
  isOnline: boolean;
}

export function DatabaseStatusBanner({ isOnline }: DatabaseStatusBannerProps) {
  if (isOnline) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">
            Cloud Sync Active
          </p>
          <p className="text-xs text-green-700">
            Your progress is being saved to the cloud and will sync across all your devices
          </p>
        </div>
        <Cloud className="w-5 h-5 text-green-600 flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">
          Local Storage Mode
        </p>
        <p className="text-xs text-amber-700">
          Data is saved locally on this device only. To enable cross-device sync, set up the database tables (see DATABASE_SETUP.md)
        </p>
      </div>
      <HardDrive className="w-5 h-5 text-amber-600 flex-shrink-0" />
    </div>
  );
}
