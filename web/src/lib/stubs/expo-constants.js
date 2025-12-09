/**
 * Expo Constants Stub for Web
 * Provides empty implementations for web builds
 */

const constantsStub = {
  appOwnership: null,
  executionEnvironment: 'standalone',
  expoVersion: null,
  installationId: null,
  sessionId: null,
  statusBarHeight: 0,
  deviceYearClass: null,
  manifest: {},
  manifest2: null,
  systemVersion: null,
  expoConfig: {
    version: '1.0.0',
    extra: {
      eas: {
        projectId: null,
      },
    },
  },
  easConfig: {
    projectId: null,
  },
  platform: {
    ios: {
      platform: 'ios',
      model: null,
      userInterfaceIdiom: 'unsupported',
      systemVersion: null,
    },
    android: {
      platform: 'android',
      versionCode: null,
    },
    web: {
      platform: 'web',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    },
  },
  getWebViewUserAgentAsync: async () => typeof navigator !== 'undefined' ? navigator.userAgent : '',
};

// Export both default and named exports for compatibility
export default constantsStub;

