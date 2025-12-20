/**
 * Map Pin Markers Component
 * Renders user markers as pins on the map with avatars
 */

import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { PointAnnotation } from '@rnmapbox/maps';
import { MapPinMarker } from './MapPinMarker';
import { AnimatedMarkerWrapper } from './AnimatedMarkerWrapper';
import { getLanguageFlag } from '@/utils/languageFlags';
import type { NearbyUser } from './NearbyUserMarkers';

export interface MapPinMarkersProps {
  /**
   * Array of nearby users to display as markers
   */
  users: NearbyUser[];
  /**
   * Callback when a marker is pressed
   */
  onMarkerPress?: (user: NearbyUser) => void;
  /**
   * Size of marker pin (default: 56)
   */
  markerSize?: number;
  /**
   * Show online status indicator
   */
  showOnlineStatus?: boolean;
  /**
   * Currently selected user ID
   */
  selectedUserId?: string | null;
}

export function MapPinMarkers({
  users,
  onMarkerPress,
  markerSize = 56,
  showOnlineStatus = true,
  selectedUserId = null,
}: MapPinMarkersProps) {
  // Animate marker on press
  const handleMarkerPress = (user: NearbyUser) => {
    if (onMarkerPress) {
      onMarkerPress(user);
    }
  };

  // Determine border color based on online status and match score
  const getBorderColor = (user: NearbyUser): string => {
    if (user.isOnline) {
      return '#07BD74'; // Green for online
    }
    if (user.matchScore && user.matchScore >= 80) {
      return '#584CF4'; // Purple for high match
    }
    return '#9E9E9E'; // Gray for others
  };

  // Get teaching language for marker badge
  const getTeachingLanguage = (user: NearbyUser) => {
    const teachingLang = user.languages.find((l) => l.role === 'teaching');
    return teachingLang ? getLanguageFlag(teachingLang.language) : '🌍';
  };

  return (
    <>
      {users.map((user) => {
        const isOnline = user.isOnline ?? false;
        const borderColor = getBorderColor(user);
        const languageFlag = getTeachingLanguage(user);
        const isSelected = selectedUserId === user.id;
        const isDimmed = selectedUserId !== null && selectedUserId !== user.id;

        return (
          <PointAnnotation
            key={user.id}
            id={user.id}
            coordinate={[user.lng, user.lat]}
            onSelected={() => handleMarkerPress(user)}
            anchor={{ x: 0.5, y: 1 }} // Anchor at bottom center of pin
          >
            <AnimatedMarkerWrapper isSelected={isSelected} isDimmed={isDimmed}>
              <MapPinMarker
                avatarUrl={user.avatarUrl}
                size={markerSize}
                isOnline={showOnlineStatus && isOnline}
                borderColor={borderColor}
                displayName={user.displayName}
                languageFlag={languageFlag}
              />
            </AnimatedMarkerWrapper>
          </PointAnnotation>
        );
      })}
    </>
  );
}

