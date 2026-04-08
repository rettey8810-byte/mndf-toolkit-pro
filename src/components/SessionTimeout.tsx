import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Timer } from 'lucide-react';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes warning

export default function SessionTimeout() {
  const { logout, currentUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(WARNING_TIME);

  useEffect(() => {
    if (!currentUser) return;

    let inactivityTimer: ReturnType<typeof setTimeout>;
    let warningTimer: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      setShowWarning(false);
      setTimeRemaining(WARNING_TIME);

      inactivityTimer = setTimeout(() => {
        setShowWarning(true);
        
        countdownInterval = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1000) {
              clearInterval(countdownInterval);
              logout();
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);

        warningTimer = setTimeout(() => {
          logout();
        }, WARNING_TIME);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timer start
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [currentUser, logout]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Session Timeout Warning</h2>
            <p className="text-sm text-gray-500">Your session is about to expire</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-olive-600" />
            <span className="text-2xl font-bold text-olive-700">{formatTime(timeRemaining)}</span>
          </div>
          <p className="text-center text-sm text-gray-600">
            You will be automatically logged out due to inactivity
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Click anywhere or press any key to stay logged in
        </p>

        <button
          onClick={() => setShowWarning(false)}
          className="w-full py-3 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition-colors font-medium"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  );
}
