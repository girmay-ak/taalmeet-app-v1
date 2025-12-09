/**
 * Expo File System Stub for Web
 * Provides empty implementations for web builds
 */

const fileSystemStub = {
  documentDirectory: null,
  cacheDirectory: null,
  bundleDirectory: null,
  getInfoAsync: async () => ({ exists: false, isDirectory: false }),
  readAsStringAsync: async () => '',
  writeAsStringAsync: async () => {},
  deleteAsync: async () => {},
  moveAsync: async () => {},
  copyAsync: async () => {},
  makeDirectoryAsync: async () => {},
  readDirectoryAsync: async () => [],
  downloadAsync: async () => ({ uri: '', status: 200, headers: {} }),
  uploadAsync: async () => ({ body: {}, headers: {}, status: 200 }),
};

// Export both default and named exports for compatibility
export default fileSystemStub;
export const {
  documentDirectory,
  cacheDirectory,
  bundleDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
  deleteAsync,
  moveAsync,
  copyAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
  downloadAsync,
  uploadAsync,
} = fileSystemStub;

