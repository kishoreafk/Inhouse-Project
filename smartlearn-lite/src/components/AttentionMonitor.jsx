import { useEffect, useState, useRef } from "react";

export default function AttentionMonitor({ onDistracted, isPlaying }) {
  const [visible, setVisible] = useState(true);
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setVisible(isVisible);
      if (!isVisible && isPlaying) {
        onDistracted("tab_switch");
      }
    };

    const handleMouseMove = () => {
      lastActivityRef.current = Date.now();
    };

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      
      if (timeSinceActivity > 30000 && isPlaying) {
        onDistracted("inactivity");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousemove", handleMouseMove);
    inactivityTimerRef.current = setInterval(checkInactivity, 10000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousemove", handleMouseMove);
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
    };
  }, [isPlaying, onDistracted]);

  return null;
}
