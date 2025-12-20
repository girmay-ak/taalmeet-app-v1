/**
 * Event Category Filter Component
 * Horizontal scrollable category filter for events
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { EventCategory, EVENT_CATEGORIES } from '@/types/events';

interface EventCategoryFilterProps {
  selectedCategory?: EventCategory;
  onCategorySelect: (category?: EventCategory) => void;
}

export function EventCategoryFilter({
  selectedCategory,
  onCategorySelect,
}: EventCategoryFilterProps) {
  const { colors } = useTheme();

  const categories: Array<{ key?: EventCategory; label: string; icon: string }> = [
    { key: undefined, label: 'All', icon: 'apps-outline' },
    ...Object.entries(EVENT_CATEGORIES).map(([key, value]) => ({
      key: key as EventCategory,
      label: value.label,
      icon: value.icon,
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category.key;
        const categoryColor = category.key
          ? EVENT_CATEGORIES[category.key].color
          : colors.primary;

        return (
          <TouchableOpacity
            key={category.key || 'all'}
            style={[
              styles.categoryButton,
              {
                backgroundColor: isSelected
                  ? categoryColor
                  : colors.background.secondary,
                borderColor: isSelected ? categoryColor : colors.border.default,
              },
            ]}
            onPress={() => onCategorySelect(category.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={isSelected ? '#FFFFFF' : colors.text.muted}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: isSelected ? '#FFFFFF' : colors.text.primary,
                },
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

