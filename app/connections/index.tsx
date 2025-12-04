/**
 * Connections Screen - React Native
 * View and manage language exchange connections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useConnections } from '@/hooks/useConnections';
import { getLanguageFlag } from '@/utils/languageFlags';

type TabType = 'connections' | 'requests' | 'suggested';

export default function ConnectionsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch connections data
  const { data: connections = [], isLoading } = useConnections();

  // Mock data for now - replace with actual data
  const requests = [];
  const suggested = [];

  const tabs = [
    { id: 'connections' as TabType, label: 'Connections', count: connections.length },
    { id: 'requests' as TabType, label: 'Requests', count: requests.length },
    { id: 'suggested' as TabType, label: 'Suggested', count: suggested.length },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'connections':
        return connections;
      case 'requests':
        return requests;
      case 'suggested':
        return suggested;
      default:
        return [];
    }
  };

  const filteredData = getCurrentData().filter((item: any) =>
    item.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Connections</Text>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <Ionicons name="search-outline" size={20} color={colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search connections..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tab,
                  activeTab === tab.id
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.background.primary },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: activeTab === tab.id ? '#FFFFFF' : colors.text.muted,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    style={[
                      styles.tabBadge,
                      {
                        backgroundColor:
                          activeTab === tab.id ? 'rgba(255,255,255,0.2)' : colors.background.secondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        {
                          color: activeTab === tab.id ? '#FFFFFF' : colors.text.muted,
                        },
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.background.secondary }]}>
              <Ionicons name="people-outline" size={48} color={colors.text.muted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              No {activeTab} yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
              Start connecting with language partners
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.emptyButtonText}>Discover Partners</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredData.map((partner: any, index: number) => (
              <View
                key={partner.id || index}
                style={[
                  styles.partnerCard,
                  { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
                ]}
              >
                <View style={styles.partnerContent}>
                  {/* Avatar */}
                  <TouchableOpacity
                    onPress={() => router.push(`/partner/${partner.id}`)}
                    style={styles.avatarContainer}
                  >
                    <Image
                      source={{
                        uri: (partner.avatarUrl && partner.avatarUrl.trim() !== '') 
                          ? partner.avatarUrl 
                          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                      }}
                      style={styles.avatar}
                    />
                    {partner.isOnline && (
                      <View style={[styles.onlineIndicator, { backgroundColor: '#10B981' }]} />
                    )}
                  </TouchableOpacity>

                  {/* Content */}
                  <View style={styles.partnerInfo}>
                    <View style={styles.partnerHeader}>
                      <TouchableOpacity
                        onPress={() => router.push(`/partner/${partner.id}`)}
                        style={styles.partnerNameContainer}
                      >
                        <Text style={[styles.partnerName, { color: colors.text.primary }]}>
                          {partner.displayName}
                        </Text>
                      </TouchableOpacity>
                      {activeTab === 'connections' && partner.matchScore && (
                        <View style={[styles.matchBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.matchBadgeText}>{partner.matchScore}%</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.partnerMeta}>
                      <Text style={[styles.partnerMetaText, { color: colors.text.muted }]}>
                        {partner.distanceKm ? `${partner.distanceKm.toFixed(1)}km away` : ''}
                      </Text>
                      {partner.distanceKm && <Text style={[styles.metaDot, { color: colors.text.muted }]}>•</Text>}
                      <Text style={[styles.partnerMetaText, { color: colors.text.muted }]}>
                        {partner.lastActive || 'Recently active'}
                      </Text>
                    </View>

                    {/* Languages */}
                    {partner.languages && (
                      <View style={styles.languagesRow}>
                        {partner.languages
                          .filter((l: any) => l.role === 'teaching')
                          .slice(0, 1)
                          .map((lang: any, idx: number) => (
                            <View
                              key={idx}
                              style={[styles.languageBadge, { backgroundColor: colors.background.primary }]}
                            >
                              <Text style={styles.languageFlag}>{getLanguageFlag(lang.language)}</Text>
                              <Text style={[styles.languageLabel, { color: colors.primary }]}>Teaching</Text>
                            </View>
                          ))}
                        {partner.languages
                          .filter((l: any) => l.role === 'learning')
                          .slice(0, 1)
                          .map((lang: any, idx: number) => (
                            <View
                              key={idx}
                              style={[styles.languageBadge, { backgroundColor: colors.background.primary }]}
                            >
                              <Text style={styles.languageFlag}>{getLanguageFlag(lang.language)}</Text>
                              <Text style={[styles.languageLabel, { color: '#5FB3B3' }]}>Learning</Text>
                            </View>
                          ))}
                      </View>
                    )}

                    {/* Action Buttons */}
                    {activeTab === 'connections' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                          onPress={() => router.push(`/chat/${partner.id}`)}
                        >
                          <Text style={styles.actionButtonText}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.actionButtonSecondary,
                            { borderColor: colors.border.default },
                          ]}
                        >
                          <Text style={[styles.actionButtonTextSecondary, { color: colors.text.primary }]}>
                            Video Call
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {activeTab === 'requests' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        >
                          <Text style={styles.actionButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.actionButtonSecondary,
                            { borderColor: colors.border.default },
                          ]}
                        >
                          <Text style={[styles.actionButtonTextSecondary, { color: colors.text.primary }]}>
                            Decline
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {activeTab === 'suggested' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        >
                          <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Connect</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.actionButtonSecondary,
                            { borderColor: colors.border.default },
                          ]}
                          onPress={() => router.push(`/partner/${partner.id}`)}
                        >
                          <Text style={[styles.actionButtonTextSecondary, { color: colors.text.primary }]}>
                            View
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  partnerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  partnerContent: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  partnerInfo: {
    flex: 1,
    gap: 8,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  partnerNameContainer: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  partnerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnerMetaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  languagesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  languageFlag: {
    fontSize: 16,
  },
  languageLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    minHeight: 400,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

