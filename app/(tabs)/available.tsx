/**
 * Availability Screen - React Native
 * Manage your availability for language exchanges
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  useAvailability,
  useUpdateAvailabilityStatus,
  useUpdatePreferences,
  useAddScheduleSlot,
  useRemoveScheduleSlot,
} from '@/hooks/useAvailability';
import { useUpdateUserLocation } from '@/hooks/useLocation';
import { AvailabilityBottomSheet } from '@/components/availability/AvailabilityBottomSheet';
import type { WeeklySchedule } from '@/types/database';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  repeat: boolean;
}

interface Schedule {
  [day: string]: TimeSlot[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_TO_NUMBER: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export default function AvailableScreen() {
  const { colors } = useTheme();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  // Backend hooks
  const { data: availability, isLoading, error } = useAvailability(userId);
  const updateStatusMutation = useUpdateAvailabilityStatus();
  const updatePreferencesMutation = useUpdatePreferences();
  const addSlotMutation = useAddScheduleSlot();
  const removeSlotMutation = useRemoveScheduleSlot();
  const updateLocationMutation = useUpdateUserLocation();

  // Local UI state
  const [showStatusBottomSheet, setShowStatusBottomSheet] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [newSlotStart, setNewSlotStart] = useState('18:00');
  const [newSlotEnd, setNewSlotEnd] = useState('20:00');
  const [newSlotRepeat, setNewSlotRepeat] = useState(true);
  
  // Animated value for toggle thumb position
  const toggleAnim = useRef(new Animated.Value(currentStatus === 'offline' ? 0 : 1)).current;

  // Extract data from availability
  const currentStatus = availability?.status || 'offline';
  
  // Animate toggle when status changes
  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: currentStatus === 'offline' ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [currentStatus]);
  const until = availability?.until || null;
  const preferences = availability?.preferences || {
    inPerson: false,
    voice: false,
    video: false,
    chat: false,
  };
  const weeklySchedule = availability?.weeklySchedule || [];

  // Calculate time left in minutes
  const timeLeft = useMemo(() => {
    if (!until) return null;
    const untilDate = new Date(until);
    const now = new Date();
    const diffMs = untilDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes > 0 ? diffMinutes : 0;
  }, [until]);

  // Convert backend schedule to UI format
  const schedule: Schedule = useMemo(() => {
    const scheduleMap: Schedule = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    weeklySchedule.forEach((slot) => {
      const dayName = DAYS[slot.day_of_week];
      if (dayName) {
        scheduleMap[dayName].push({
          id: slot.id,
          start: slot.start_time.substring(0, 5), // HH:MM
          end: slot.end_time.substring(0, 5), // HH:MM
          repeat: slot.repeat_weekly,
        });
      }
    });

    return scheduleMap;
  }, [weeklySchedule]);

  // Convert preferences to UI format
  const meetingTypes = useMemo(() => ({
    'in-person': preferences.inPerson,
    'video': preferences.video,
    'voice': preferences.voice,
    'chat': preferences.chat,
  }), [preferences]);

  const [notifications, setNotifications] = useState({
    favorites: true,
    nearby: true,
    messages: false,
    reminders: true
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Handlers
  const handleStatusToggle = async () => {
    if (currentStatus === 'offline') {
      // If offline, open bottom sheet to select status
      setShowStatusBottomSheet(true);
    } else {
      // If online, turn off directly
      await handleStatusChange('offline', 0, [], undefined);
    }
  };

  const handleStatusChange = async (
    newStatus: 'available' | 'soon' | 'busy' | 'offline',
    durationMinutes: number,
    preferences: string[],
    location?: { latitude: number; longitude: number; address?: string }
  ) => {
    if (!userId) return;

    let until: string | null = null;
    if (durationMinutes > 0 && newStatus !== 'offline') {
      const untilDate = new Date();
      untilDate.setMinutes(untilDate.getMinutes() + durationMinutes);
      until = untilDate.toISOString();
    }

    try {
      // Update status
      await updateStatusMutation.mutateAsync({
        userId,
        data: { status: newStatus, until },
      });

      // Update preferences if provided
      if (preferences.length > 0 || newStatus === 'offline') {
        const meetingTypes = {
          inPerson: preferences.includes('in-person'),
          voice: preferences.includes('voice'),
          video: preferences.includes('video'),
          chat: preferences.includes('chat'),
        };

        await updatePreferencesMutation.mutateAsync({
          userId,
          data: { meetingTypes },
        });
      }

      // Update location if provided
      if (location && (newStatus === 'available' || newStatus === 'soon')) {
        try {
          await updateLocationMutation.mutateAsync({
            lat: location.latitude,
            lng: location.longitude,
          });
        } catch (error) {
          console.warn('Failed to update location:', error);
          // Don't fail the whole operation if location update fails
        }
      }

      setShowStatusBottomSheet(false);
      // Force refetch to update UI immediately
      // The mutation already invalidates queries, but we can also manually refetch
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to update availability:', error);
    }
  };

  const handleExtendTime = async () => {
    if (!userId || !until) return;

    const currentUntil = new Date(until);
    currentUntil.setHours(currentUntil.getHours() + 1);
    
    try {
      await updateStatusMutation.mutateAsync({
        userId,
        data: { status: currentStatus as 'available' | 'soon' | 'busy' | 'offline', until: currentUntil.toISOString() },
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleStopAvailability = async () => {
    if (!userId) return;

    try {
      await updateStatusMutation.mutateAsync({
        userId,
        data: { status: 'offline', until: null },
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!userId) return;

    const newPreferences = {
      ...meetingTypes,
      [key]: value,
    };

    try {
      await updatePreferencesMutation.mutateAsync({
        userId,
        data: {
          meetingTypes: {
            inPerson: newPreferences['in-person'],
            voice: newPreferences['voice'],
            video: newPreferences['video'],
            chat: newPreferences['chat'],
          },
        },
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleAddTimeSlot = async () => {
    if (!userId || !selectedDay) return;

    const dayNumber = DAY_TO_NUMBER[selectedDay];
    if (dayNumber === undefined) return;

    try {
      await addSlotMutation.mutateAsync({
        userId,
        data: {
          day_of_week: dayNumber,
          start_time: newSlotStart,
          end_time: newSlotEnd,
          repeat: newSlotRepeat,
        },
      });
      setShowTimeSlotModal(false);
      // Reset form
      setNewSlotStart('18:00');
      setNewSlotEnd('20:00');
      setNewSlotRepeat(true);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleRemoveTimeSlot = async (slotId: string) => {
    if (!userId) return;

    Alert.alert(
      'Remove Time Slot',
      'Are you sure you want to remove this time slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeSlotMutation.mutateAsync({ slotId, userId });
            } catch (error) {
              // Error is handled by the hook
            }
          },
        },
      ]
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeLeft = (minutes: number | null) => {
    if (minutes === null) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'available': return '#10B981';
      case 'soon': return '#F59E0B';
      case 'busy': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = () => {
    switch (currentStatus) {
      case 'available': return 'Available Now';
      case 'soon': return 'Available Soon';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.muted }]}>Loading availability...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={[styles.errorText, { color: colors.text.primary }]}>Error loading availability</Text>
          <Text style={[styles.errorSubtext, { color: colors.text.muted }]}>Please try again later</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Availability</Text>
          <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>Let others know when you're free to meet</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Status Card */}
        <View style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <View style={styles.statusHeader}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor()}20` }]}>
                <Ionicons name="time" size={24} color={getStatusColor()} />
              </View>
              <View>
                <View style={styles.statusLabelRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                  <Text style={[styles.statusLabel, { color: colors.text.primary }]}>{getStatusLabel()}</Text>
                </View>
                {currentStatus === 'available' && timeLeft !== null && (
                  <Text style={[styles.autoOffText, { color: colors.text.muted }]}>
                    Auto-off in: {formatTimeLeft(timeLeft)}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.statusRight}>
              {/* Custom Toggle Switch - Matching Figma Design */}
              <TouchableOpacity
                onPress={handleStatusToggle}
                disabled={updateStatusMutation.isPending}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.customToggle,
                    {
                      backgroundColor: toggleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [colors.border.default, colors.primary],
                      }),
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [
                          {
                            translateX: toggleAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [2, 28],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </Animated.View>
              </TouchableOpacity>
              {currentStatus !== 'offline' && (
                <TouchableOpacity
                  onPress={() => setShowStatusBottomSheet(true)}
                  disabled={updateStatusMutation.isPending}
                  style={styles.changeButton}
                >
                  <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {currentStatus === 'available' && (
            <View style={[styles.statusActions, { borderTopColor: colors.border.default }]}>
              <TouchableOpacity
                style={[styles.extendButton, { backgroundColor: colors.primary }]}
                onPress={handleExtendTime}
                disabled={updateStatusMutation.isPending}>
                <Text style={styles.extendButtonText}>
                  {updateStatusMutation.isPending ? '...' : 'Extend 1h'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}
                onPress={handleStopAvailability}
                disabled={updateStatusMutation.isPending}>
                <Text style={[styles.stopButtonText, { color: colors.text.primary }]}>
                  {updateStatusMutation.isPending ? '...' : 'Stop'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Weekly Schedule */}
        <View style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>📅 Weekly Schedule</Text>
            <Text style={[styles.cardSubtitle, { color: colors.text.muted }]}>When are you usually free?</Text>
          </View>

          <View style={styles.scheduleList}>
            {days.map((day) => (
              <View key={day} style={[styles.dayRow, { backgroundColor: colors.background.primary }]}>
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayName, { color: colors.text.primary }]}>{day}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedDay(day);
                      setShowTimeSlotModal(true);
                    }}
                    disabled={addSlotMutation.isPending}>
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {schedule[day].length === 0 ? (
                  <Text style={[styles.noTimesText, { color: colors.text.muted }]}>No times set</Text>
                ) : (
                  <View style={styles.slotsContainer}>
                    {schedule[day].map((slot) => (
                      <View key={slot.id} style={[styles.slotRow, { backgroundColor: colors.background.secondary }]}>
                        <View style={styles.slotInfo}>
                          <Text style={[styles.slotTime, { color: colors.text.primary }]}>
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </Text>
                          {slot.repeat && (
                            <Text style={[styles.repeatBadge, { color: colors.text.muted }]}>Repeat</Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveTimeSlot(slot.id)}
                          disabled={removeSlotMutation.isPending}>
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Meeting Preferences */}
        <View style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Meeting Preferences</Text>
          
          <View style={styles.preferencesGrid}>
            {[
              { key: 'in-person', emoji: '☕', label: 'In person' },
              { key: 'video', emoji: '📹', label: 'Video call' },
              { key: 'voice', emoji: '📞', label: 'Voice call' },
              { key: 'chat', emoji: '💬', label: 'Text chat' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.preferenceRow, { backgroundColor: colors.background.primary }]}
                onPress={() => handlePreferenceChange(item.key, !meetingTypes[item.key as keyof typeof meetingTypes])}
              >
                <View style={styles.preferenceLeft}>
                  <Text style={styles.preferenceEmoji}>{item.emoji}</Text>
                  <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>{item.label}</Text>
                </View>
                <Switch
                  value={meetingTypes[item.key as keyof typeof meetingTypes]}
                  onValueChange={(value) => handlePreferenceChange(item.key, value)}
                  trackColor={{ false: colors.border.default, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  disabled={updatePreferencesMutation.isPending}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Time Zone */}
          <View style={[styles.timezoneRow, { backgroundColor: colors.background.primary }]}>
            <Text style={[styles.timezoneLabel, { color: colors.text.muted }]}>Time zone:</Text>
            <Text style={[styles.timezoneValue, { color: colors.text.primary }]}>🌍 Amsterdam (GMT+1)</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Notifications</Text>
          <Text style={[styles.notifyMeText, { color: colors.text.muted }]}>Notify me when:</Text>
          
          <View style={styles.preferencesGrid}>
            {[
              { key: 'favorites', label: 'Favorites come online' },
              { key: 'nearby', label: 'Partners available nearby' },
              { key: 'messages', label: 'New messages' },
              { key: 'reminders', label: 'Meeting reminders' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.preferenceRow, { backgroundColor: colors.background.primary }]}
                onPress={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
              >
                <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>{item.label}</Text>
                <Switch
                  value={notifications[item.key as keyof typeof notifications]}
                  onValueChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                  trackColor={{ false: colors.border.default, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Status Info */}
        {currentStatus === 'available' && (
          <View style={[styles.infoCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoEmoji}>✨</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text.primary }]}>You're visible to partners!</Text>
              <Text style={[styles.infoText, { color: colors.text.muted }]}>
                Language learners nearby can now see you're available and send you connection requests.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Availability Bottom Sheet */}
      <AvailabilityBottomSheet
        isOpen={showStatusBottomSheet}
        onClose={() => setShowStatusBottomSheet(false)}
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
      />

      {/* Add Time Slot Modal */}
      <Modal
        visible={showTimeSlotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeSlotModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.secondary }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Add Time Slot</Text>
                <Text style={[styles.modalSubtitle, { color: colors.text.muted }]}>{selectedDay}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTimeSlotModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: colors.text.muted }]}>From:</Text>
                <TextInput
                  style={[styles.timeInputField, { backgroundColor: colors.background.primary, color: colors.text.primary, borderColor: colors.border.default }]}
                  value={newSlotStart}
                  onChangeText={setNewSlotStart}
                  placeholder="18:00"
                  placeholderTextColor={colors.text.muted}
                />
              </View>

              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: colors.text.muted }]}>To:</Text>
                <TextInput
                  style={[styles.timeInputField, { backgroundColor: colors.background.primary, color: colors.text.primary, borderColor: colors.border.default }]}
                  value={newSlotEnd}
                  onChangeText={setNewSlotEnd}
                  placeholder="20:00"
                  placeholderTextColor={colors.text.muted}
                />
              </View>
            </View>

            <View style={[styles.repeatRow, { backgroundColor: colors.background.primary }]}>
              <Text style={[styles.repeatLabel, { color: colors.text.primary }]}>Repeat weekly</Text>
              <Switch
                value={newSlotRepeat}
                onValueChange={setNewSlotRepeat}
                trackColor={{ false: colors.border.default, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleAddTimeSlot}
              disabled={addSlotMutation.isPending}>
              <Text style={styles.modalButtonText}>
                {addSlotMutation.isPending ? 'Adding...' : 'Add Slot'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowTimeSlotModal(false)}>
              <Text style={[styles.modalCancelText, { color: colors.text.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  autoOffText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  customToggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  changeButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  extendButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  extendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stopButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  scheduleList: {
    gap: 12,
  },
  dayRow: {
    borderRadius: 12,
    padding: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    padding: 4,
  },
  noTimesText: {
    fontSize: 12,
  },
  slotsContainer: {
    gap: 8,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  slotTime: {
    fontSize: 14,
  },
  preferencesGrid: {
    gap: 8,
    marginTop: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceEmoji: {
    fontSize: 18,
  },
  preferenceLabel: {
    fontSize: 14,
  },
  timezoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  timezoneLabel: {
    fontSize: 14,
  },
  timezoneValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  notifyMeText: {
    fontSize: 12,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  slotInfo: {
    flex: 1,
    gap: 4,
  },
  repeatBadge: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusOptionText: {
    flex: 1,
  },
  statusOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusOptionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  timeInputContainer: {
    gap: 16,
    marginBottom: 16,
  },
  timeInput: {
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeInputField: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  repeatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  repeatLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
  },
});

