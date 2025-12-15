# Mock Data Cleanup Plan

## Files with Mock Data

### Main Mock Data Files:
1. `web/src/data/mockData.ts` - Partners, conversations, messages, reviews
2. `web/src/data/mockSessions.ts` - Language sessions
3. `web/src/data/mockNotifications.ts` - Notifications
4. `figma-design/src/data/mockData.ts` - Design reference data
5. `figma-design/src/data/mockSessions.ts` - Design reference sessions
6. `figma-design/src/data/mockNotifications.ts` - Design reference notifications

### Files Using Mock Data:

**Web App:**
- `web/src/screens/PartnerProfileScreen.tsx` - Uses mockPartners, mockReviews
- `web/src/screens/MapScreen.tsx` - Uses mockPartners
- `web/src/screens/SessionDetailScreen.tsx` - Uses mockSessions
- `web/src/components/SessionCard.tsx` - Uses mockSessions
- `web/src/components/MatchFoundPopup.tsx` - Uses mockData
- `web/src/components/ConversationCard.tsx` - Has mock data support
- `web/src/ScreenshotGallery.tsx` - Uses mockConversations

**Figma Design (Reference):**
- Multiple screens in `figma-design/src/screens/` use mock data
- These are for design reference only

### Configuration:
- `lib/config.ts` - ENABLE_MOCK_DATA flag
- `web/src/lib/config.ts` - ENABLE_MOCK_DATA flag
- `types/env.d.ts` - ENABLE_MOCK_DATA type definition
- `env_p` - ENABLE_MOCK_DATA=false (already disabled)

## Cleanup Strategy

### Option 1: Remove All Mock Data (Recommended)
- Delete mock data files
- Remove imports and references
- Remove ENABLE_MOCK_DATA flag
- Update screens to use real backend data only

### Option 2: Keep for Development/Testing
- Keep mock data files but remove from production builds
- Use ENABLE_MOCK_DATA flag to conditionally load
- Ensure all production code uses real backend

### Option 3: Move to Tests Only
- Move mock data to test files
- Remove from production code
- Keep only for unit/integration tests

## Recommended Approach

Since `ENABLE_MOCK_DATA=false` is already set, we should:
1. Remove mock data imports from production screens
2. Ensure all screens use real backend hooks/services
3. Delete mock data files (or move to tests)
4. Remove ENABLE_MOCK_DATA flag from config
5. Keep figma-design mock data (it's for design reference only)

