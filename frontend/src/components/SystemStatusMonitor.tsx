import { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';

interface SystemStatusMonitorProps {
  checkInterval?: number; // interval in milliseconds
}

/**
 * A component that periodically checks system status in the background
 * Automatically detects when backend is down and activates maintenance mode
 */
const SystemStatusMonitor = ({ 
  checkInterval = 60000 // Default: check every minute
}: SystemStatusMonitorProps) => {
  const { checkMaintenanceStatus, maintenance } = useApp();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const checkMaintenanceRef = useRef(checkMaintenanceStatus);
  
  // Update ref when function changes
  useEffect(() => {
    checkMaintenanceRef.current = checkMaintenanceStatus;
  }, [checkMaintenanceStatus]);

  useEffect(() => {
    // Don't start polling immediately if already in maintenance mode
    // The retry button on the maintenance screen will be used instead
    if (!maintenance.isInMaintenance) {
      startStatusPolling();
    } else {
      stopStatusPolling();
    }

    return () => stopStatusPolling();
  }, [maintenance.isInMaintenance, checkInterval]);

  const startStatusPolling = () => {
    // Clear any existing timer
    stopStatusPolling();

    // Start a new interval timer
    timerRef.current = setInterval(() => {
      // Only check if we're not already checking and not in maintenance mode
      if (!maintenance.isChecking) {
        // Use the ref to the function to avoid stale closures
        checkMaintenanceRef.current();
      }
    }, checkInterval);
  };

  const stopStatusPolling = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // This component doesn't render anything
  return null;
};

export default SystemStatusMonitor; 