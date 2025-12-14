/**
 * Location Search Modal Component
 * Search for cafes, places, and locations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import * as locationSearchService from '@/services/locationSearchService';
import type { LocationResult } from '@/services/locationSearchService';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationResult) => void;
  currentLocation?: { latitude: number; longitude: number } | null;
}

export function LocationSearchModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
}: LocationSearchModalProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLocations, setRecentLocations] = useState<LocationResult[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [popularPlaces, setPopularPlaces] = useState<LocationResult[]>([]);

  // Load popular places for current city when modal opens
  useEffect(() => {
    if (isOpen && currentLocation && !searchQuery) {
      const loadPopularPlaces = async () => {
        try {
          const places = await locationSearchService.getPopularPlaces(
            currentLocation.latitude,
            currentLocation.longitude
          );
          setPopularPlaces(places);
        } catch (error) {
          console.error('Error loading popular places:', error);
        }
      };
      loadPopularPlaces();
    } else {
      setPopularPlaces([]);
    }
  }, [isOpen, currentLocation, searchQuery]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await locationSearchService.searchLocations(
          searchQuery,
          currentLocation || undefined
        );
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Reduced debounce time for better responsiveness

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, currentLocation]);

  const handleSelectLocation = (location: LocationResult) => {
    onSelectLocation(location);
    // Save to recent locations
    setRecentLocations((prev) => {
      const filtered = prev.filter((loc) => loc.id !== location.id);
      return [location, ...filtered].slice(0, 5); // Keep last 5
    });
    onClose();
  };

  const handleAddCustom = async () => {
    if (!customAddress.trim()) return;

    setIsSearching(true);
    try {
      const location = await locationSearchService.geocodeAddress(customAddress);
      if (location) {
        handleSelectLocation(location);
        setCustomAddress('');
        setShowAddCustom(false);
      } else {
        alert('Could not find this location. Please try a different address.');
      }
    } catch (error) {
      console.error('Error adding custom location:', error);
      alert('Error adding location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetNearbyPlaces = async () => {
    if (!currentLocation) return;

    setIsSearching(true);
    try {
      const places = await locationSearchService.getNearbyPlaces(
        currentLocation.latitude,
        currentLocation.longitude,
        1000,
        'all'
      );
      setSearchResults(places);
    } catch (error) {
      console.error('Error getting nearby places:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getLocationIcon = (type?: string) => {
    switch (type) {
      case 'cafe':
        return '☕';
      case 'restaurant':
        return '🍽️';
      case 'library':
        return '📚';
      case 'park':
        return '🌳';
      case 'custom':
        return '📍';
      default:
        return '📍';
    }
  };

  const renderLocationItem = ({ item }: { item: LocationResult }) => (
    <TouchableOpacity
      style={[styles.locationItem, { backgroundColor: colors.background.primary }]}
      onPress={() => handleSelectLocation(item)}
    >
      <View style={styles.locationItemLeft}>
        <Text style={styles.locationIcon}>{getLocationIcon(item.type)}</Text>
        <View style={styles.locationItemText}>
          <Text style={[styles.locationItemName, { color: colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.locationItemAddress, { color: colors.text.muted }]} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.secondary }]} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Search Location</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search cafes, places, addresses..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
          {currentLocation && (
            <TouchableOpacity
              style={[styles.nearbyButton, { backgroundColor: colors.primary }]}
              onPress={handleGetNearbyPlaces}
            >
              <Ionicons name="location" size={16} color="#FFFFFF" />
              <Text style={styles.nearbyButtonText}>Nearby</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {showAddCustom ? (
          <View style={styles.addCustomContainer}>
            <Text style={[styles.addCustomTitle, { color: colors.text.primary }]}>
              Add Custom Location
            </Text>
            <TextInput
              style={[
                styles.customInput,
                { backgroundColor: colors.background.primary, color: colors.text.primary, borderColor: colors.border.default },
              ]}
              placeholder="Enter address or place name..."
              placeholderTextColor={colors.text.muted}
              value={customAddress}
              onChangeText={setCustomAddress}
              multiline
            />
            <View style={styles.addCustomActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border.default }]}
                onPress={() => {
                  setShowAddCustom(false);
                  setCustomAddress('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleAddCustom}
                disabled={!customAddress.trim() || isSearching}
              >
                {isSearching ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={searchQuery ? searchResults : (popularPlaces.length > 0 ? popularPlaces : recentLocations)}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {isSearching ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : searchQuery ? (
                  <>
                    <Ionicons name="search-outline" size={48} color={colors.text.muted} />
                    <Text style={[styles.emptyText, { color: colors.text.muted }]}>
                      No results found
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
                      Try searching for cafes, libraries, or addresses
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="location-outline" size={48} color={colors.text.muted} />
                    <Text style={[styles.emptyText, { color: colors.text.muted }]}>
                      Search for locations
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
                      Type to search cafes, places, or addresses
                    </Text>
                  </>
                )}
              </View>
            }
            ListHeaderComponent={
              !searchQuery && (popularPlaces.length > 0 || recentLocations.length > 0) ? (
                <View>
                  {popularPlaces.length > 0 && (
                    <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                      Popular Places Nearby
                    </Text>
                  )}
                  {recentLocations.length > 0 && popularPlaces.length > 0 && (
                    <Text style={[styles.sectionTitle, { color: colors.text.muted, marginTop: 24 }]}>
                      Recent
                    </Text>
                  )}
                  {recentLocations.length > 0 && popularPlaces.length === 0 && (
                    <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Recent</Text>
                  )}
                </View>
              ) : null
            }
          />
        )}

        {/* Add Custom Button */}
        {!showAddCustom && (
          <TouchableOpacity
            style={[styles.addCustomButton, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}
            onPress={() => setShowAddCustom(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.addCustomButtonText, { color: colors.primary }]}>
              Add Custom Location
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  nearbyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  locationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    fontSize: 20,
  },
  locationItemText: {
    flex: 1,
  },
  locationItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationItemAddress: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  addCustomContainer: {
    padding: 16,
    gap: 16,
  },
  addCustomTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  customInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  addCustomActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  addCustomButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

