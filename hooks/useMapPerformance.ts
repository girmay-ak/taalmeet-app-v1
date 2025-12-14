/**
 * Map Performance Monitoring Hook
 * Tracks FPS, load times, and renders for optimization
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface PerformanceMetrics {
  // Rendering
  fps: number;
  avgFps: number;
  renderCount: number;
  lastRenderTime: number;
  
  // Loading
  initialLoadTime: number;
  timeToInteractive: number;
  
  // Memory (if available)
  memoryUsage?: number;
  
  // Network
  networkRequests: number;
  cachedRequests: number;
  cacheHitRate: number;
  
  // User interactions
  markerCount: number;
  visibleMarkerCount: number;
  clusterCount: number;
}

export interface UseMapPerformanceOptions {
  /**
   * Enable performance monitoring (default: true)
   */
  enabled?: boolean;
  /**
   * Sample rate for FPS calculation (default: 60 frames)
   */
  fpsSampleSize?: number;
  /**
   * Log performance warnings (default: false)
   */
  logWarnings?: boolean;
  /**
   * FPS threshold for warnings (default: 30)
   */
  fpsWarningThreshold?: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function useMapPerformance(options: UseMapPerformanceOptions = {}) {
  const {
    enabled = true,
    fpsSampleSize = 60,
    logWarnings = false,
    fpsWarningThreshold = 30,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    avgFps: 60,
    renderCount: 0,
    lastRenderTime: 0,
    initialLoadTime: 0,
    timeToInteractive: 0,
    networkRequests: 0,
    cachedRequests: 0,
    cacheHitRate: 100,
    markerCount: 0,
    visibleMarkerCount: 0,
    clusterCount: 0,
  });

  // Performance tracking refs
  const frameTimestamps = useRef<number[]>([]);
  const renderCount = useRef(0);
  const loadStartTime = useRef<number>(Date.now());
  const interactiveTime = useRef<number | null>(null);
  const networkRequestCount = useRef(0);
  const cacheHitCount = useRef(0);
  const rafId = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // Track FPS
  const trackFrame = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    frameTimestamps.current.push(now);

    // Keep only recent frames (fpsSampleSize)
    if (frameTimestamps.current.length > fpsSampleSize) {
      frameTimestamps.current.shift();
    }

    // Calculate FPS
    if (frameTimestamps.current.length >= 2) {
      const timespan = now - frameTimestamps.current[0];
      const fps = Math.round((frameTimestamps.current.length / timespan) * 1000);
      const avgFps = Math.round(
        frameTimestamps.current.length / 
        ((frameTimestamps.current[frameTimestamps.current.length - 1] - frameTimestamps.current[0]) / 1000)
      );

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        fps: Math.min(fps, 60),
        avgFps: Math.min(avgFps, 60),
        lastRenderTime: now,
      }));

      // Log warning if FPS drops below threshold
      if (logWarnings && fps < fpsWarningThreshold) {
        console.warn(`[MapPerformance] Low FPS detected: ${fps} fps`);
      }
    }

    // Schedule next frame
    if (appState.current === 'active') {
      rafId.current = requestAnimationFrame(trackFrame);
    }
  }, [enabled, fpsSampleSize, logWarnings, fpsWarningThreshold]);

  // Track render count
  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    setMetrics(prev => ({
      ...prev,
      renderCount: renderCount.current,
    }));
  });

  // Start FPS tracking
  useEffect(() => {
    if (!enabled) return;

    rafId.current = requestAnimationFrame(trackFrame);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled, trackFrame]);

  // Track app state changes
  useEffect(() => {
    if (!enabled) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;

      if (nextAppState === 'active' && rafId.current === null) {
        // Resume FPS tracking when app becomes active
        rafId.current = requestAnimationFrame(trackFrame);
      } else if (nextAppState !== 'active' && rafId.current !== null) {
        // Pause FPS tracking when app goes to background
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, trackFrame]);

  // Mark initial load complete
  const markLoadComplete = useCallback(() => {
    if (!enabled) return;

    const loadTime = Date.now() - loadStartTime.current;
    setMetrics(prev => ({
      ...prev,
      initialLoadTime: loadTime,
    }));

    if (logWarnings && loadTime > 3000) {
      console.warn(`[MapPerformance] Slow initial load: ${loadTime}ms`);
    }
  }, [enabled, logWarnings]);

  // Mark interactive
  const markInteractive = useCallback(() => {
    if (!enabled || interactiveTime.current !== null) return;

    const timeToInteractive = Date.now() - loadStartTime.current;
    interactiveTime.current = timeToInteractive;
    
    setMetrics(prev => ({
      ...prev,
      timeToInteractive,
    }));

    if (logWarnings && timeToInteractive > 2000) {
      console.warn(`[MapPerformance] Slow time to interactive: ${timeToInteractive}ms`);
    }
  }, [enabled, logWarnings]);

  // Track network request
  const trackNetworkRequest = useCallback((fromCache: boolean = false) => {
    if (!enabled) return;

    networkRequestCount.current += 1;
    if (fromCache) {
      cacheHitCount.current += 1;
    }

    const cacheHitRate = networkRequestCount.current > 0
      ? Math.round((cacheHitCount.current / networkRequestCount.current) * 100)
      : 100;

    setMetrics(prev => ({
      ...prev,
      networkRequests: networkRequestCount.current,
      cachedRequests: cacheHitCount.current,
      cacheHitRate,
    }));
  }, [enabled]);

  // Update marker counts
  const updateMarkerCounts = useCallback((
    markerCount: number,
    visibleMarkerCount: number,
    clusterCount: number
  ) => {
    if (!enabled) return;

    setMetrics(prev => ({
      ...prev,
      markerCount,
      visibleMarkerCount,
      clusterCount,
    }));

    if (logWarnings && visibleMarkerCount > 200) {
      console.warn(`[MapPerformance] High marker count: ${visibleMarkerCount} visible markers`);
    }
  }, [enabled, logWarnings]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    return {
      ...metrics,
      isGoodPerformance: metrics.avgFps >= 50 && metrics.initialLoadTime < 2000,
      needsOptimization: metrics.avgFps < 40 || metrics.initialLoadTime > 3000,
    };
  }, [metrics]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    frameTimestamps.current = [];
    renderCount.current = 0;
    loadStartTime.current = Date.now();
    interactiveTime.current = null;
    networkRequestCount.current = 0;
    cacheHitCount.current = 0;

    setMetrics({
      fps: 60,
      avgFps: 60,
      renderCount: 0,
      lastRenderTime: 0,
      initialLoadTime: 0,
      timeToInteractive: 0,
      networkRequests: 0,
      cachedRequests: 0,
      cacheHitRate: 100,
      markerCount: 0,
      visibleMarkerCount: 0,
      clusterCount: 0,
    });
  }, []);

  return {
    metrics,
    markLoadComplete,
    markInteractive,
    trackNetworkRequest,
    updateMarkerCounts,
    getPerformanceSummary,
    resetMetrics,
  };
}

/**
 * Performance logger component (for debugging)
 */
export function usePerformanceLogger(metrics: PerformanceMetrics, enabled: boolean = false) {
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      console.log('[MapPerformance] Metrics:', {
        fps: `${metrics.fps} fps (avg: ${metrics.avgFps})`,
        renders: metrics.renderCount,
        load: `${metrics.initialLoadTime}ms`,
        interactive: `${metrics.timeToInteractive}ms`,
        markers: `${metrics.visibleMarkerCount}/${metrics.markerCount} (${metrics.clusterCount} clusters)`,
        cache: `${metrics.cacheHitRate}% hit rate`,
      });
    }, 5000); // Log every 5 seconds

    return () => clearInterval(interval);
  }, [enabled, metrics]);
}


