/**
 * Services Index
 * Export all service modules
 */

// Auth Service
export * from './authService';

// User Service (Legacy - uses 'users' table)
export * from './userService';

// Profile Service (New - uses 'profiles' table)
export * from './profileService';

// Connections Service
export * from './connectionsService';

// Messages Service
export * from './messagesService';

// Availability Service
export * from './availabilityService';

// Location Service
export * from './locationService';

// Session Service
export * from './sessionService';

// Preferences Service
export * from './preferencesService';

// Discover Service
export * from './discoverService';

// Storage Service
export * from './storageService';

// Safety Service (Blocking & Reporting)
export * from './safetyService';

// Data Export Service (GDPR)
export * from './dataExportService';

// Moderation Service (Admin)
export * from './moderationService';

// Gamification Service
export * from './gamificationService';
export * from './helpService';
export * from './discoveryFilterService';
export * from './translationService';
export * from './groupsService';
