/**
 * Home/Discover Screen - Matches Figma Design
 */

import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuth } from '@/providers';
import { useDiscoverFeed } from '@/hooks/useDiscover';
import { useLanguageEvents } from '@/hooks/useEventbriteEvents';
import { EventCard } from '@/components/events/EventCard';
import { EventHorizontalCard } from '@/components/events/EventHorizontalCard';
import { getLanguageFlag } from '@/utils/languageFlags';
import type { DiscoverFilters } from '@/services/discoverService';
import { DiscoveryFiltersModal } from '@/components/discovery/DiscoveryFiltersModal';
import { useDiscoveryFilterPreferences } from '@/hooks/useDiscoveryFilters';

const languageCategories = ['All', 'Spanish', 'Japanese', 'French', 'Italian', 'German', 'Dutch', 'English'];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { profile, user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState<DiscoverFilters>({
    language: undefined,
    maxDistance: 50,
    limit: 50,
    gender: 'all',
    availabilityOnly: false,
    minMatchScore: 0,
  });

  // Load saved preferences
  const { data: savedPreferences } = useDiscoveryFilterPreferences(user?.id);
  
  // Apply saved preferences on mount
  // Apply saved preferences on mount
  useEffect(() => {
    if (savedPreferences) {
      setFilters({
        language: undefined,
        maxDistance: savedPreferences.max_distance,
        limit: 50,
        gender: savedPreferences.gender_preference,
        availabilityOnly: savedPreferences.availability_filter,
        minMatchScore: savedPreferences.min_match_score,
        preferredLanguages: savedPreferences.preferred_languages || undefined,
      });
    }
  }, [savedPreferences]);

  const userName = profile?.displayName || 'Language Learner';

  // Build filters for discover feed (merge with language selection)
  const activeFilters: DiscoverFilters = {
    ...filters,
    language: selectedLanguage === 'All' ? undefined : selectedLanguage,
  };

  // Fetch discover feed
  const { data, isLoading, error, refetch } = useDiscoverFeed(activeFilters);

  // Fetch Eventbrite events for selected language
  const {
    data: events = [],
    isLoading: eventsLoading,
  } = useLanguageEvents({
    language: selectedLanguage === 'All' ? 'Spanish' : selectedLanguage, // Default to Spanish if All
    enabled: selectedLanguage !== 'All', // Only fetch when a specific language is selected
  });

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Format date for sessions
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month}, ${year}`;
  };

  // Calculate joined percentage for sessions
  const getJoinedPercentage = (participantCount: number, capacity: number) => {
    if (capacity === 0) return 0;
    return Math.round((participantCount / capacity) * 100);
  };

  const renderNearbyPartner = ({ item }: { item: any }) => {
    const teachingLang = item.languages?.find((l: any) => l.role === 'teaching');
    const learningLang = item.languages?.find((l: any) => l.role === 'learning');
    
    return (
      <TouchableOpacity
        style={styles.nearbyPartner}
        activeOpacity={0.8}
        onPress={() => router.push(`/partner/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: (item.avatar_url && item.avatar_url.trim() !== '') 
                ? item.avatar_url 
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            }}
            style={styles.nearbyAvatar}
          />
          {item.is_online && (
            <View style={[styles.onlineDot, { borderColor: colors.background.secondary }]} />
          )}
        </View>
        <Text style={[styles.nearbyName, { color: colors.text.primary }]} numberOfLines={1}>
          {item.display_name}
        </Text>
        {teachingLang && (
          <Text style={[styles.nearbyLanguage, { color: colors.text.muted }]} numberOfLines={1}>
            {getLanguageFlag(teachingLang.language)} {teachingLang.language}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSessionCard = (session: any) => {
    const joinedPercentage = getJoinedPercentage(session.participantCount || 0, session.capacity || 1);
    const remainingAttendees = (session.capacity || 0) - (session.participantCount || 0);
    
    return (
      <TouchableOpacity
        key={session.id}
        style={[styles.sessionCard, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
        activeOpacity={0.8}
        onPress={() => router.push(`/session/${session.id}`)}
      >
        {/* Header */}
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <Text style={[styles.sessionTitle, { color: colors.text.primary }]} numberOfLines={2}>
              {session.title}
            </Text>
            <View style={styles.sessionMeta}>
              <Text style={[styles.sessionDate, { color: colors.text.muted }]}>
                {formatSessionDate(session.starts_at)}
              </Text>
              <Text style={[styles.sessionLanguage, { color: colors.primary }]}>
                {getLanguageFlag(session.language)} {session.language}
              </Text>
            </View>
          </View>
          <View style={styles.sessionPercentage}>
            <Text style={[styles.percentageText, { color: colors.text.primary }]}>
              {joinedPercentage}%
            </Text>
            <Text style={[styles.joinedLabel, { color: colors.text.muted }]}>Joined</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.sessionFooter}>
          <View style={styles.sessionCapacity}>
            <Ionicons name="people-outline" size={16} color={colors.text.muted} />
            <Text style={[styles.capacityText, { color: colors.text.muted }]}>
              {session.participantCount || 0} / {session.capacity}
            </Text>
          </View>
          <View style={[styles.arrowButton, { backgroundColor: colors.background.primary }]}>
            <Ionicons name="arrow-forward" size={18} color={colors.text.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.userInfo}>
            <Image
              source={{ 
                uri: (profile?.avatarUrl && profile.avatarUrl.trim() !== '') 
                  ? profile.avatarUrl 
                  : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' 
              }}
              style={[styles.userAvatar, { borderColor: colors.primary }]}
            />
            <View>
              <Text style={[styles.welcomeText, { color: colors.text.muted }]}>Welcome 👋</Text>
              <Text style={[styles.userName, { color: colors.text.primary }]}>{userName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.background.primary }]}
              onPress={() => setShowFiltersModal(true)}
            >
              <Ionicons name="filter" size={20} color={colors.text.primary} />
              {(filters.gender !== 'all' || filters.availabilityOnly || (filters.maxDistance || 50) !== 50 || (filters.minMatchScore || 0) > 0) && (
                <View style={[styles.filterDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.notificationButton, { backgroundColor: colors.background.primary }]}>
              <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
              <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Title */}
        <Text style={[styles.sectionSubtitle, { color: colors.text.muted }]}>Language Exchange Sessions</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Happening Today</Text>
          <View style={[styles.countBadge, { backgroundColor: colors.background.primary }]}>
            <Text style={[styles.countText, { color: colors.text.primary }]}>
              ({data?.sessions?.length || 0})
            </Text>
          </View>
        </View>

        {/* Language Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {languageCategories.map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setSelectedLanguage(lang)}
              style={[
                styles.filterPill,
                selectedLanguage === lang
                  ? { backgroundColor: '#FFFFFF' }
                  : { backgroundColor: colors.background.primary, borderColor: colors.border.default, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedLanguage === lang ? '#0F0F0F' : colors.text.muted },
                ]}
              >
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading && !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.muted }]}>Loading discover feed...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.semantic?.error || colors.text.muted} />
          <Text style={[styles.errorText, { color: colors.text.primary }]}>Error loading feed</Text>
          <Text style={[styles.errorSubtext, { color: colors.text.muted }]}>{error.message}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          {/* Active Users Section */}
          {data?.activeUsers && data.activeUsers.length > 0 && (
            <View style={[styles.nearbySection, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
              <Text style={[styles.nearbySectionTitle, { color: colors.text.primary }]}>
                Online Nearby <Text style={{ color: colors.text.muted }}>({data.activeUsers.length})</Text>
              </Text>
              <FlatList
                horizontal
                data={data.activeUsers}
                renderItem={renderNearbyPartner}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearbyList}
              />
            </View>
          )}

          {/* Recommended Users Section */}
          {data?.recommendedUsers && data.recommendedUsers.length > 0 && (
            <View style={[styles.nearbySection, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
              <Text style={[styles.nearbySectionTitle, { color: colors.text.primary }]}>
                Recommended for You <Text style={{ color: colors.text.muted }}>({data.recommendedUsers.length})</Text>
              </Text>
              <FlatList
                horizontal
                data={data.recommendedUsers}
                renderItem={renderNearbyPartner}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearbyList}
              />
            </View>
          )}

          {/* New Users Section */}
          {data?.newUsers && data.newUsers.length > 0 && (
            <View style={[styles.nearbySection, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
              <Text style={[styles.nearbySectionTitle, { color: colors.text.primary }]}>
                New Members <Text style={{ color: colors.text.muted }}>({data.newUsers.length})</Text>
              </Text>
              <FlatList
                horizontal
                data={data.newUsers}
                renderItem={renderNearbyPartner}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearbyList}
              />
            </View>
          )}

          {/* Eventbrite Events Horizontal Section */}
          {selectedLanguage !== 'All' && events.length > 0 && (
            <View style={[styles.nearbySection, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
              <Text style={[styles.nearbySectionTitle, { color: colors.text.primary }]}>
                {selectedLanguage} Events <Text style={{ color: colors.text.muted }}>({events.length})</Text>
              </Text>
              <FlatList
                horizontal
                data={events}
                renderItem={({ item }) => <EventHorizontalCard event={item} />}
                keyExtractor={(item) => `eventbrite-horizontal-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearbyList}
              />
            </View>
          )}

          {/* Sessions & Events Section */}
          {((data?.sessions && data.sessions.length > 0) || (selectedLanguage !== 'All' && events.length > 0)) && (
            <View style={styles.sessionsContainer}>
              <View style={styles.languageSection}>
                <View style={styles.languageHeader}>
                  <Text style={[styles.languageTitle, { color: colors.text.primary }]}>
                    {selectedLanguage === 'All' ? 'Upcoming Sessions' : `${selectedLanguage} Sessions & Events`}
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: colors.background.primary }]}>
                    <Text style={[styles.countText, { color: colors.text.primary }]}>
                      ({(data?.sessions?.length || 0) + (selectedLanguage !== 'All' ? events.length : 0)})
                    </Text>
                  </View>
                </View>
                
                {/* Show Eventbrite Events first */}
                {selectedLanguage !== 'All' && events.length > 0 && (
                  <>
                    {events.map((event) => (
                      <EventCard key={`eventbrite-${event.id}`} event={event} />
                    ))}
                  </>
                )}
                
                {/* Show internal Sessions */}
                {data?.sessions && data.sessions.length > 0 && (
                  <>
                    {data.sessions.map(renderSessionCard)}
                  </>
                )}
              </View>
            </View>
          )}

          {/* Empty State */}
          {(!data || 
            (data.activeUsers.length === 0 &&
              data.recommendedUsers.length === 0 &&
              data.newUsers.length === 0 &&
              data.sessions.length === 0 &&
              (selectedLanguage === 'All' || events.length === 0))) && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.text.muted} />
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No content available</Text>
              <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
                {selectedLanguage !== 'All'
                  ? `No ${selectedLanguage} sessions, events, or users found. Try a different language.`
                  : 'Check back later for new users and sessions!'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filters Modal */}
      <DiscoveryFiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        currentFilters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          refetch();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  countBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  nearbySection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  nearbySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  nearbyList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  nearbyPartner: {
    alignItems: 'center',
    marginRight: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  nearbyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1DB954',
    borderWidth: 2,
  },
  nearbyName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  nearbyDistance: {
    fontSize: 12,
  },
  sessionsContainer: {
    padding: 16,
  },
  languageSection: {
    marginBottom: 24,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 13,
  },
  sessionPercentage: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
  },
  joinedLabel: {
    fontSize: 12,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  remainingBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  nearbyLanguage: {
    fontSize: 11,
    marginTop: 2,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sessionLanguage: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityText: {
    fontSize: 13,
  },
});
