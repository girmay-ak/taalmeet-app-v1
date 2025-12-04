# User Safety Integration Examples

This document shows how to integrate blocked user filtering into existing services and screens.

## Overview

The blocking system ensures that:
1. Blocked users never appear in discover feeds, connections, or chat
2. Messages to/from blocked users are disabled
3. Blocking is bidirectional (if A blocks B, B cannot see A either)

## Integration Points

### 1. Discover Service (`services/discoverService.ts`)

Filter blocked users from discover feed results:

```typescript
import { excludeBlockedUsers } from '@/services/safetyService';

export async function getDiscoverFeed(
  userId: string,
  filters: DiscoverFilters = {}
): Promise<DiscoverFeed> {
  // ... existing code to fetch users ...

  // Filter out blocked users
  const recommendedUsers = await excludeBlockedUsers(userId, recommendedUsersRaw);
  const newUsers = await excludeBlockedUsers(userId, newUsersRaw);
  const activeUsers = await excludeBlockedUsers(userId, activeUsersRaw);

  return {
    recommendedUsers,
    newUsers,
    activeUsers,
    sessions, // Sessions don't need filtering (they're events, not users)
  };
}
```

### 2. Connections Service (`services/connectionsService.ts`)

Filter blocked users from connections:

```typescript
import { excludeBlockedUsers } from '@/services/safetyService';

export async function getConnections(userId: string): Promise<ConnectionWithProfile[]> {
  // ... existing code to fetch connections ...

  // Filter out blocked users
  const filteredConnections = await excludeBlockedUsers(
    userId,
    connections
  );

  return filteredConnections;
}

export async function getSuggestedConnections(
  userId: string,
  limit: number = 20
): Promise<SuggestedConnection[]> {
  // ... existing code to fetch suggestions ...

  // Filter out blocked users
  const filteredSuggestions = await excludeBlockedUsers(
    userId,
    suggestions
  );

  return filteredSuggestions;
}
```

### 3. Messages Service (`services/messagesService.ts`)

Filter blocked users from conversations:

```typescript
import { excludeBlockedUsers } from '@/services/safetyService';

export async function getConversations(userId: string): Promise<ConversationListItem[]> {
  // ... existing code to fetch conversations ...

  // Filter out conversations with blocked users
  const blockedIds = await getBlockedUserIds(userId);
  const blockedSet = new Set(blockedIds);
  
  const filteredConversations = result.filter(
    (conv) => !blockedSet.has(conv.otherUser.id)
  );

  return filteredConversations;
}
```

### 4. Map Screen (`app/(tabs)/map.tsx`)

Filter blocked users from map markers:

```typescript
import { useBlockedUserIds } from '@/hooks/useSafety';

export default function MapScreen() {
  const { user } = useAuth();
  const { data: blockedIds = [] } = useBlockedUserIds(user?.id);
  const blockedSet = new Set(blockedIds);

  // ... fetch nearby users ...

  // Filter blocked users
  const visibleUsers = nearbyUsers.filter(
    (user) => !blockedSet.has(user.id)
  );

  // Render map with visibleUsers only
}
```

### 5. Discover Screen (`app/(tabs)/index.tsx`)

The discover feed hook already filters blocked users if you update the service:

```typescript
// No changes needed in the hook - filtering happens in the service
const { data } = useDiscoverFeed(filters);
// data.recommendedUsers, data.newUsers, data.activeUsers are already filtered
```

### 6. Connections Screen (`app/connections/index.tsx`)

Filter blocked users from connections list:

```typescript
import { useBlockedUserIds } from '@/hooks/useSafety';

export default function ConnectionsScreen() {
  const { user } = useAuth();
  const { data: connections = [] } = useConnectionsList(user?.id);
  const { data: blockedIds = [] } = useBlockedUserIds(user?.id);
  const blockedSet = new Set(blockedIds);

  // Filter blocked users
  const visibleConnections = connections.filter(
    (conn) => !blockedSet.has(conn.partner.id)
  );

  // Render visibleConnections
}
```

## Helper Function Usage

The `excludeBlockedUsers` helper function is the recommended way to filter:

```typescript
import { excludeBlockedUsers } from '@/services/safetyService';

// In any service function
const filteredResults = await excludeBlockedUsers(userId, rawResults);
```

This function:
- Returns empty array immediately if input is empty
- Fetches blocked user IDs once
- Filters efficiently using a Set
- Works with any array of objects that have an `id` property

## React Query Hook Usage

For client-side filtering in components:

```typescript
import { useBlockedUserIds } from '@/hooks/useSafety';

function MyComponent() {
  const { user } = useAuth();
  const { data: blockedIds = [] } = useBlockedUserIds(user?.id);
  const blockedSet = new Set(blockedIds);

  // Filter any user list
  const visibleUsers = allUsers.filter(
    (user) => !blockedSet.has(user.id)
  );
}
```

## Chat Screen Integration

The chat screen already includes:
- Block/report menu in header
- Disabled message input when user is blocked
- Automatic navigation back after blocking

See `app/chat/[id].tsx` for the complete implementation.

## Performance Considerations

1. **Server-side filtering** (recommended): Filter in services before returning data
2. **Client-side filtering**: Use `useBlockedUserIds` hook for small lists
3. **Caching**: Blocked user IDs are cached for 2 minutes by React Query
4. **Bidirectional checks**: The `isUserBlocked` function checks both directions automatically

## Testing

To test blocking:
1. Block a user from chat screen
2. Verify they disappear from:
   - Discover feed
   - Connections list
   - Map markers
   - Messages list
3. Verify message input is disabled in chat
4. Verify unblocking restores visibility

