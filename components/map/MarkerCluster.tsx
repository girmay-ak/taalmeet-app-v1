/**
 * Marker Clustering Component
 * Efficiently handles hundreds of markers with clustering
 * Uses viewport-based rendering for optimal performance
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PointAnnotation } from '@rnmapbox/maps';
import { useTheme } from '@/lib/theme/ThemeProvider';
import type { NearbyUser } from './NearbyUserMarkers';

// ============================================================================
// TYPES
// ============================================================================

export interface ClusterPoint {
  id: string;
  lat: number;
  lng: number;
  user: NearbyUser;
}

export interface Cluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  users: NearbyUser[];
}

export interface MarkerClusterProps {
  /**
   * Array of nearby users to cluster
   */
  users: NearbyUser[];
  /**
   * Current map zoom level
   */
  zoomLevel: number;
  /**
   * Map viewport bounds
   */
  viewport?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  /**
   * Callback when a marker is pressed
   */
  onMarkerPress?: (user: NearbyUser) => void;
  /**
   * Callback when a cluster is pressed
   */
  onClusterPress?: (users: NearbyUser[]) => void;
  /**
   * Clustering radius in pixels (default: 60)
   */
  clusterRadius?: number;
  /**
   * Minimum points to form a cluster (default: 2)
   */
  minPoints?: number;
  /**
   * Enable clustering (default: true)
   */
  enableClustering?: boolean;
  /**
   * Children to render (e.g., NearbyUserMarkers for non-clustered)
   */
  children?: React.ReactNode;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two points in degrees
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const latDiff = lat2 - lat1;
  const lngDiff = lng2 - lng1;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

/**
 * Simple clustering algorithm optimized for mobile
 * Groups nearby markers based on distance threshold
 */
function clusterMarkers(
  users: NearbyUser[],
  radius: number,
  minPoints: number,
  zoomLevel: number
): Array<Cluster | ClusterPoint> {
  // At high zoom levels, don't cluster
  if (zoomLevel >= 15) {
    return users.map(user => ({
      id: user.id,
      lat: user.lat,
      lng: user.lng,
      user,
    }));
  }

  // Adjust clustering radius based on zoom level
  // Lower zoom = larger radius (more clustering)
  const zoomFactor = Math.pow(2, Math.max(0, 15 - zoomLevel));
  const adjustedRadius = (radius / 100000) * zoomFactor; // Convert pixels to degrees

  const clusters: Cluster[] = [];
  const clusteredIds = new Set<string>();

  // Sort users by latitude for better clustering
  const sortedUsers = [...users].sort((a, b) => a.lat - b.lat);

  for (const user of sortedUsers) {
    if (clusteredIds.has(user.id)) continue;

    // Find nearby users
    const nearbyUsers = sortedUsers.filter(other => {
      if (other.id === user.id || clusteredIds.has(other.id)) return false;
      const distance = calculateDistance(user.lat, user.lng, other.lat, other.lng);
      return distance <= adjustedRadius;
    });

    // If enough nearby users, create a cluster
    if (nearbyUsers.length >= minPoints - 1) {
      const clusterUsers = [user, ...nearbyUsers];
      
      // Calculate cluster center (average position)
      const centerLat = clusterUsers.reduce((sum, u) => sum + u.lat, 0) / clusterUsers.length;
      const centerLng = clusterUsers.reduce((sum, u) => sum + u.lng, 0) / clusterUsers.length;

      clusters.push({
        id: `cluster-${user.id}`,
        lat: centerLat,
        lng: centerLng,
        count: clusterUsers.length,
        users: clusterUsers,
      });

      // Mark users as clustered
      clusterUsers.forEach(u => clusteredIds.add(u.id));
    }
  }

  // Add unclustered users as individual points
  const unclusteredPoints: ClusterPoint[] = users
    .filter(user => !clusteredIds.has(user.id))
    .map(user => ({
      id: user.id,
      lat: user.lat,
      lng: user.lng,
      user,
    }));

  return [...clusters, ...unclusteredPoints];
}

/**
 * Filter markers by viewport bounds
 */
function filterByViewport(
  users: NearbyUser[],
  viewport: { north: number; south: number; east: number; west: number } | undefined,
  buffer: number = 0.1 // 10% buffer
): NearbyUser[] {
  if (!viewport) return users;

  const { north, south, east, west } = viewport;
  const latBuffer = (north - south) * buffer;
  const lngBuffer = (east - west) * buffer;

  return users.filter(user => 
    user.lat >= (south - latBuffer) &&
    user.lat <= (north + latBuffer) &&
    user.lng >= (west - lngBuffer) &&
    user.lng <= (east + lngBuffer)
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MarkerCluster = React.memo<MarkerClusterProps>(({
  users,
  zoomLevel,
  viewport,
  onMarkerPress,
  onClusterPress,
  clusterRadius = 60,
  minPoints = 2,
  enableClustering = true,
  children,
}) => {
  const { colors } = useTheme();

  // Filter users by viewport for performance
  const visibleUsers = useMemo(() => {
    const filtered = filterByViewport(users, viewport);
    console.log(`[MarkerCluster] Viewport filtering: ${users.length} → ${filtered.length} users`);
    return filtered;
  }, [users, viewport]);

  // Apply clustering
  const clusteredMarkers = useMemo(() => {
    if (!enableClustering || visibleUsers.length < minPoints) {
      return visibleUsers.map(user => ({
        id: user.id,
        lat: user.lat,
        lng: user.lng,
        user,
      }));
    }

    const result = clusterMarkers(visibleUsers, clusterRadius, minPoints, zoomLevel);
    
    const clusterCount = result.filter(m => 'count' in m).length;
    const markerCount = result.filter(m => !('count' in m)).length;
    console.log(`[MarkerCluster] Clustering: ${visibleUsers.length} users → ${clusterCount} clusters + ${markerCount} markers`);
    
    return result;
  }, [visibleUsers, zoomLevel, clusterRadius, minPoints, enableClustering]);

  // Handle cluster press
  const handleClusterPress = useCallback((cluster: Cluster) => {
    if (onClusterPress) {
      onClusterPress(cluster.users);
    }
  }, [onClusterPress]);

  // Handle marker press
  const handleMarkerPress = useCallback((user: NearbyUser) => {
    if (onMarkerPress) {
      onMarkerPress(user);
    }
  }, [onMarkerPress]);

  // Render cluster markers
  const renderClusterMarker = useCallback((cluster: Cluster) => {
    // Determine cluster size category for styling
    const sizeCategory = 
      cluster.count >= 50 ? 'xlarge' :
      cluster.count >= 20 ? 'large' :
      cluster.count >= 10 ? 'medium' :
      'small';

    const clusterSize = 
      sizeCategory === 'xlarge' ? 80 :
      sizeCategory === 'large' ? 64 :
      sizeCategory === 'medium' ? 52 :
      40;

    const fontSize =
      sizeCategory === 'xlarge' ? 22 :
      sizeCategory === 'large' ? 18 :
      sizeCategory === 'medium' ? 16 :
      14;

    // Color based on size
    const backgroundColor =
      sizeCategory === 'xlarge' ? colors.semantic.error :
      sizeCategory === 'large' ? colors.semantic.warning :
      sizeCategory === 'medium' ? colors.primary :
      colors.primary;

    return (
      <PointAnnotation
        key={cluster.id}
        id={cluster.id}
        coordinate={[cluster.lng, cluster.lat]}
        onSelected={() => handleClusterPress(cluster)}
      >
        <Pressable
          onPress={() => handleClusterPress(cluster)}
          style={({ pressed }) => [
            styles.clusterMarker,
            {
              width: clusterSize,
              height: clusterSize,
              borderRadius: clusterSize / 2,
              backgroundColor,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 1.1 : 1 }],
            },
          ]}
        >
          <View style={styles.clusterInner}>
            <Text
              style={[
                styles.clusterCount,
                {
                  fontSize,
                  color: '#FFFFFF',
                  fontWeight: '700',
                },
              ]}
            >
              {cluster.count}
            </Text>
          </View>
          {/* Pulse ring */}
          <View
            style={[
              styles.clusterPulse,
              {
                width: clusterSize + 12,
                height: clusterSize + 12,
                borderRadius: (clusterSize + 12) / 2,
                borderColor: backgroundColor,
              },
            ]}
          />
        </Pressable>
      </PointAnnotation>
    );
  }, [colors, handleClusterPress]);

  return (
    <>
      {/* Render clusters */}
      {clusteredMarkers.map(marker => {
        if ('count' in marker) {
          // It's a cluster
          return renderClusterMarker(marker as Cluster);
        } else {
          // It's a single point - let children handle rendering
          // (NearbyUserMarkers will handle these)
          return null;
        }
      })}

      {/* Render children (NearbyUserMarkers for unclustered points) */}
      {children}
    </>
  );
});

MarkerCluster.displayName = 'MarkerCluster';

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  clusterMarker: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  clusterInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clusterCount: {
    textAlign: 'center',
  },
  clusterPulse: {
    position: 'absolute',
    borderWidth: 3,
    opacity: 0.3,
  },
});


