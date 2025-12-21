# Map Bottom Card Animation - Implementation Guide

## Overview
Update the map screen bottom card to have a smooth slide-up animation when a user marker is tapped, with a compact design and improved UX.

## Changes Required

### 1. Add New State and Animation Values

```typescript
// Add after existing state declarations (around line 99)
const cardSlideAnim = useRef(new Animated.Value(0)).current; // Start hidden
const cardOpacity = useRef(new Animated.Value(0)).current;
const [showCompactCard, setShowCompactCard] = useState(false);
```

### 2. Update `handleMarkerPress` Function

Replace the existing `handleMarkerPress` with:

```typescript
// Handle marker press with smooth animation
const handleMarkerPress = useCallback((user: NearbyUserMarker) => {
  setSelectedPartner(user.id);
  setShowCompactCard(true);
  
  // Animate card slide up
  Animated.parallel([
    Animated.spring(cardSlideAnim, {
      toValue: 180, // Compact height
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }),
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }),
  ]).start();
}, [cardSlideAnim, cardOpacity]);
```

### 3. Add Dismiss Function

```typescript
// Dismiss card with animation
const dismissCard = useCallback(() => {
  Animated.parallel([
    Animated.timing(cardSlideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }),
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }),
  ]).start(() => {
    setSelectedPartner(null);
    setShowCompactCard(false);
  });
}, [cardSlideAnim, cardOpacity]);
```

### 4. Replace Bottom Sheet with Compact Card

Replace the existing bottom sheet section (around line 654-812) with:

```typescript
{/* Compact Bottom Card - Slides up on marker tap */}
{showCompactCard && selectedPartner && (() => {
  const partner = markerUsers.find(u => u.id === selectedPartner);
  if (!partner) return null;

  const existingConnection = connections?.find(
    (conn) =>
      (conn.user_id === partner.id || conn.connected_user_id === partner.id) &&
      conn.status === 'accepted'
  );

  return (
    <>
      {/* Dimmed overlay */}
      <Animated.View 
        style={[
          styles.cardOverlay,
          { opacity: cardOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5]
          })}
        ]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={dismissCard}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Compact Card */}
      <Animated.View
        style={[
          styles.compactCard,
          {
            backgroundColor: colors.mode === 'dark' ? '#1A1A1AF5' : '#FFFFFFF5',
            height: cardSlideAnim,
            opacity: cardOpacity,
          },
        ]}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: colors.border.default }]} />
        </View>

        {/* Card Content */}
        <View style={styles.compactCardContent}>
          {/* Profile Photo */}
          <Image
            source={{ uri: partner.avatarUrl || undefined }}
            style={styles.compactAvatar}
          />

          {/* Info */}
          <View style={styles.compactInfo}>
            {/* Name and Age */}
            <Text style={[styles.compactName, { color: colors.text.primary }]}>
              {partner.displayName}, {partner.age || '25'}
            </Text>
            
            {/* Distance and Match */}
            <Text style={[styles.compactMeta, { color: colors.text.secondary }]}>
              {partner.distance}km away · {partner.matchScore}% match
            </Text>

            {/* Action Buttons */}
            <View style={styles.compactActions}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => {
                  dismissCard();
                  setTimeout(() => {
                    router.push(`/(tabs)/profile/${partner.id}`);
                  }, 250);
                }}
              >
                <Text style={styles.primaryActionText}>View Profile</Text>
              </TouchableOpacity>

              {existingConnection ? (
                <TouchableOpacity
                  style={[
                    styles.secondaryActionBtn,
                    { 
                      borderColor: colors.border.default,
                      backgroundColor: colors.background.tertiary,
                    },
                  ]}
                  onPress={() => {
                    dismissCard();
                    setTimeout(() => {
                      router.push('/(tabs)/messages');
                    }, 250);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={colors.text.primary} />
                  <Text style={[styles.secondaryActionText, { color: colors.text.primary }]}>
                    Message
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.secondaryActionBtn,
                    { 
                      borderColor: colors.border.default,
                      backgroundColor: colors.background.tertiary,
                    },
                  ]}
                  onPress={async () => {
                    try {
                      await sendConnectionRequestMutation.mutateAsync(partner.id);
                      Alert.alert('Success', 'Connection request sent!');
                    } catch (error) {
                      console.error('Failed to send connection request:', error);
                    }
                  }}
                >
                  <Ionicons name="heart-outline" size={16} color={colors.text.primary} />
                  <Text style={[styles.secondaryActionText, { color: colors.text.primary }]}>
                    Connect
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
})()}
```

### 5. Add New Styles

Add these styles to the StyleSheet (around line 1060+):

```typescript
cardOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000000',
  zIndex: 998,
},
compactCard: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 10,
  zIndex: 999,
  paddingBottom: 24,
},
dragHandleContainer: {
  alignItems: 'center',
  paddingVertical: 8,
},
dragHandle: {
  width: 40,
  height: 4,
  borderRadius: 2,
},
compactCardContent: {
  flexDirection: 'row',
  paddingHorizontal: 20,
  paddingTop: 8,
  gap: 16,
},
compactAvatar: {
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '#E0E0E0',
},
compactInfo: {
  flex: 1,
  justifyContent: 'center',
},
compactName: {
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 4,
},
compactMeta: {
  fontSize: 14,
  marginBottom: 12,
},
compactActions: {
  flexDirection: 'row',
  gap: 8,
},
primaryActionBtn: {
  flex: 1,
  backgroundColor: '#07BD74',
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
},
primaryActionText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '600',
},
secondaryActionBtn: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 12,
  borderWidth: 1.5,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
},
secondaryActionText: {
  fontSize: 15,
  fontWeight: '600',
},
```

## Features

### ✅ Smooth Animations
- **Spring animation** for natural card slide-up (180px height)
- **Fade animation** for opacity (250ms)
- **Parallel animations** for smooth combined effect

### ✅ Compact Design
- **Height**: 180px (vs previous larger sheet)
- **Horizontal layout**: Photo left, info right
- **Minimal padding**: Clean, focused design

### ✅ Visual Feedback
- **Dimmed overlay**: 50% black overlay behind card
- **Tap to dismiss**: Tap overlay or drag handle to close
- **Smooth transitions**: 200ms dismiss animation

### ✅ Action Buttons
- **Primary**: Green "View Profile" button
- **Secondary**: Outline "Message" or "Connect" button
- **Icons**: Clear visual indicators

## Testing

1. **Tap a marker** → Card slides up smoothly
2. **Tap overlay** → Card slides down and disappears
3. **Tap View Profile** → Navigates after dismiss animation
4. **Tap Message/Connect** → Performs action

## Result

- ✅ Fast, lightweight card (180px vs full sheet)
- ✅ Smooth spring animation (feels natural)
- ✅ Non-intrusive (dimmed overlay, easy dismiss)
- ✅ Consistent with dark map theme
- ✅ Clear action buttons
- ✅ Better UX than previous full sheet

