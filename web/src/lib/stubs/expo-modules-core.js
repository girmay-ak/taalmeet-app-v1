/**
 * Expo Modules Core Stub for Web
 * Provides empty implementations for web builds
 */

export class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  addListener(eventName, listener) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(listener);
    return { remove: () => this.removeListener(eventName, listener) };
  }

  removeListener(eventName, listener) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  removeAllListeners(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  emit(eventName, ...args) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }
}

// Export both default and named exports for compatibility
const expoModulesCoreStub = {
  EventEmitter,
};

export default expoModulesCoreStub;
