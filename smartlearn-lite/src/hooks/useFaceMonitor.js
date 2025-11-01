import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

const API_URL = 'http://localhost:5000';

export const useFaceMonitor = (isVideoPlaying, onDistracted) => {
  const monitoringRef = useRef(false);
  const { setEngagementStatus, engagementStatus } = useAppStore();
  const onDistractedRef = useRef(onDistracted);

  useEffect(() => {
    onDistractedRef.current = onDistracted;
  }, [onDistracted]);

  useEffect(() => {
    let statusInterval;

    const fetchStatus = () => {
      fetch(`${API_URL}/status`)
        .then(res => res.json())
        .then(data => {
          if (data.recent_logs && data.recent_logs.length > 0) {
            const lastStatus = data.recent_logs[data.recent_logs.length - 1].status;
            setEngagementStatus(lastStatus);
          }
        })
        .catch(err => console.error('Failed to fetch status:', err));
    };

    if (isVideoPlaying && !monitoringRef.current) {
      fetch(`${API_URL}/start-monitoring`, { method: 'POST' })
        .then(res => res.json())
        .then(() => {
          monitoringRef.current = true;
          statusInterval = setInterval(fetchStatus, 2000);
        })
        .catch(err => console.error('Monitor start failed:', err));
    } else if (!isVideoPlaying && monitoringRef.current) {
      fetch(`${API_URL}/stop-monitoring`, { method: 'POST' })
        .then(res => res.json())
        .then(() => {
          monitoringRef.current = false;
          if (statusInterval) clearInterval(statusInterval);
        })
        .catch(err => console.error('Monitor stop failed:', err));
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [isVideoPlaying, setEngagementStatus]);

  useEffect(() => {
    if (engagementStatus === 'DISTRACTED') {
      onDistractedRef.current();
    }
  }, [engagementStatus]);

  useEffect(() => {
    return () => {
      if (monitoringRef.current) {
        fetch(`${API_URL}/stop-monitoring`, { method: 'POST' });
      }
    };
  }, []);
};
