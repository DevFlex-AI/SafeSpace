// useSensoryMonitor — Autism sensory habit-interrupter hook
// Uses accelerometer to detect repetitive hand-to-head motions (hair-pulling patterns)
// Triggers calming intervention when pattern is detected

import { useState, useEffect, useRef, useCallback } from 'react';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { AppState, AppStateStatus } from 'react-native';

interface SensoryMonitorConfig {
  sensitivity: 'low' | 'medium' | 'high';
  cooldownMs: number;
  minMotionDurationMs: number;
}

interface UseSensoryMonitorReturn {
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  lastTrigger: Date | null;
  dismissIntervention: () => void;
  showIntervention: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  setSensitivity: (s: 'low' | 'medium' | 'high') => void;
}

const DEFAULT_CONFIG: SensoryMonitorConfig = {
  sensitivity: 'medium',
  cooldownMs: 30000, // 30 seconds between interventions
  minMotionDurationMs: 2000, // Must detect motion for 2+ seconds
};

// Motion thresholds for detecting hair-pulling gesture
const SENSITIVITY_THRESHOLDS = {
  low: { acceleration: 2.5, frequency: 3 },
  medium: { acceleration: 1.8, frequency: 2.5 },
  high: { acceleration: 1.2, frequency: 2 },
};

export default function useSensoryMonitor(
  config: Partial<SensoryMonitorConfig> = {}
): UseSensoryMonitorReturn {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);
  const [lastTrigger, setLastTrigger] = useState<Date | null>(null);
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>(
    config.sensitivity || 'medium'
  );

  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const motionHistoryRef = useRef<AccelerometerMeasurement[]>([]);
  const lastTriggerRef = useRef<number>(0);
  const interventionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const thresholds = SENSITIVITY_THRESHOLDS[sensitivity];

  // Analyze motion pattern for hair-pulling detection
  const analyzeMotion = useCallback(() => {
    const history = motionHistoryRef.current;
    if (history.length < 10) return false;

    const recentHistory = history.slice(-20);
    
    // Check for repetitive upward motion (hand moving toward head)
    let upwardMotionCount = 0;
    let repetitivePattern = 0;
    
    for (let i = 1; i < recentHistory.length; i++) {
      const prev = recentHistory[i - 1];
      const curr = recentHistory[i];
      
      // Calculate acceleration magnitude
      const accel = Math.sqrt(
        curr.x * curr.x + curr.y * curr.y + curr.z * curr.z
      );
      
      // Check for significant Y movement (upward motion)
      const yDiff = curr.y - prev.y;
      if (Math.abs(yDiff) > 0.3 && curr.y > 0) {
        upwardMotionCount++;
      }
      
      // Check for high acceleration events
      if (accel > thresholds.acceleration) {
        repetitivePattern++;
      }
    }

    // Detect pattern if enough upward motions and acceleration events
    const patternScore = (upwardMotionCount / recentHistory.length) * 100;
    const accelerationScore = (repetitivePattern / recentHistory.length) * 100;

    return patternScore > 40 && accelerationScore > thresholds.frequency * 10;
  }, [thresholds]);

  // Trigger the intervention
  const triggerIntervention = useCallback(() => {
    const now = Date.now();
    
    // Check cooldown
    if (now - lastTriggerRef.current < mergedConfig.cooldownMs) {
      return;
    }

    lastTriggerRef.current = now;
    setLastTrigger(new Date());
    setShowIntervention(true);

    // Unique haptic pattern to get attention
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }, 500);
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);

    // Auto-dismiss after 10 seconds
    interventionTimeoutRef.current = setTimeout(() => {
      setShowIntervention(false);
    }, 10000);
  }, [mergedConfig.cooldownMs]);

  // Handle accelerometer updates
  const handleAccelerometerUpdate = useCallback((data: AccelerometerMeasurement) => {
    if (!isMonitoring) return;

    motionHistoryRef.current.push(data);
    
    // Keep only recent history (last ~3 seconds at 10Hz)
    if (motionHistoryRef.current.length > 30) {
      motionHistoryRef.current = motionHistoryRef.current.slice(-30);
    }

    // Analyze motion periodically
    if (motionHistoryRef.current.length >= 20) {
      if (analyzeMotion()) {
        triggerIntervention();
      }
    }
  }, [isMonitoring, analyzeMotion, triggerIntervention]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    motionHistoryRef.current = [];
    setIsMonitoring(true);

    // Set accelerometer update interval
    Accelerometer.setUpdateInterval(100); // 10Hz
    
    subscriptionRef.current = Accelerometer.addListener(handleAccelerometerUpdate);
  }, [isMonitoring, handleAccelerometerUpdate]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);
    
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    
    motionHistoryRef.current = [];
  }, [isMonitoring]);

  // Dismiss intervention manually
  const dismissIntervention = useCallback(() => {
    setShowIntervention(false);
    if (interventionTimeoutRef.current) {
      clearTimeout(interventionTimeoutRef.current);
      interventionTimeoutRef.current = null;
    }
  }, []);

  // Handle app state changes (pause when backgrounded)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        stopMonitoring();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      stopMonitoring();
    };
  }, [stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
      if (interventionTimeoutRef.current) {
        clearTimeout(interventionTimeoutRef.current);
      }
    };
  }, [stopMonitoring]);

  return {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    lastTrigger,
    dismissIntervention,
    showIntervention,
    sensitivity,
    setSensitivity,
  };
}

// Intervention message component to display when triggered
export const SENSORY_MESSAGES = [
  "Take a deep breath 🌬️",
  "You're doing great 💜",
  "Let's try the 5-4-3-2-1 exercise",
  "gentle reminder: you're safe",
  "How about a quick stretch?",
  "Your hands are telling you something",
];