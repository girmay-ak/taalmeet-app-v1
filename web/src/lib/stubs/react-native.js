/**
 * React Native Stub for Web
 * Provides web-compatible implementations
 */

export const Platform = {
  OS: 'web',
  select: (obj) => obj.web || obj.default || null,
};

export default {
  Platform,
};
