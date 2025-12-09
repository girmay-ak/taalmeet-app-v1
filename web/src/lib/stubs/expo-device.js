/**
 * Expo Device Stub for Web
 * Provides empty implementations for web builds
 */

const deviceStub = {
  brand: null,
  manufacturer: null,
  modelName: null,
  osName: 'web',
  osVersion: null,
  deviceName: null,
  deviceYearClass: null,
  totalMemory: null,
  supportedCpuArchitectures: null,
  osBuildId: null,
  osInternalBuildId: null,
  osBuildFingerprint: null,
  platformApiLevel: null,
  deviceType: 'DESKTOP',
  isDevice: false,
  isRooted: false,
};

// Export both default and named exports for compatibility
export default deviceStub;
export const {
  brand,
  manufacturer,
  modelName,
  osName,
  osVersion,
  deviceName,
  deviceYearClass,
  totalMemory,
  supportedCpuArchitectures,
  osBuildId,
  osInternalBuildId,
  osBuildFingerprint,
  platformApiLevel,
  deviceType,
  isDevice,
  isRooted,
} = deviceStub;
