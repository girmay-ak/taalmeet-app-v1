.PHONY: install start ios android lint format typecheck build-dev build-preview build-prod prebuild clean help

# Default target
help:
	@echo "TAALMEET - Available Commands"
	@echo "=============================="
	@echo "  make install       - Install dependencies"
	@echo "  make start         - Start Expo development server (use with Expo Go)"
	@echo "  make ios           - Run on iOS simulator"
	@echo "  make android       - Run on Android emulator (requires Android SDK)"
	@echo "  make lint          - Run ESLint"
	@echo "  make lint-fix      - Fix ESLint errors"
	@echo "  make format        - Format code with Prettier"
	@echo "  make format-check  - Check code formatting"
	@echo "  make typecheck     - Run TypeScript type checking"
	@echo "  make build-dev     - Build development bundle"
	@echo "  make build-preview - Build preview bundle"
	@echo "  make build-prod    - Build production bundle"
	@echo "  make prebuild      - Generate native code"
	@echo "  make clean         - Clean build artifacts"
	@echo ""
	@echo "📱 Quick Start (No Android SDK needed):"
	@echo "  make start  # Then scan QR code with Expo Go app"
	@echo ""
	@echo "See ANDROID_SETUP.md if you see Android SDK errors"

# Install dependencies
install:
	npm install

# Development
start:
	npx expo start

start-dev:
	npx expo start --dev-client

start-clear:
	npx expo start --clear

# Platform specific
ios:
	npx expo run:ios

android:
	@echo "Checking Android SDK setup..."
	@if [ -z "$$ANDROID_HOME" ]; then \
		echo "⚠️  ANDROID_HOME is not set."; \
		echo ""; \
		echo "For Expo Go (no setup required):"; \
		echo "  make start  # Then scan QR code with Expo Go app"; \
		echo ""; \
		echo "For Android Studio setup:"; \
		echo "  1. Install Android Studio from https://developer.android.com/studio"; \
		echo "  2. Add to ~/.zshrc:"; \
		echo "     export ANDROID_HOME=$$HOME/Library/Android/sdk"; \
		echo "     export PATH=$$PATH:$$ANDROID_HOME/platform-tools"; \
		echo "  3. Run: source ~/.zshrc"; \
		echo ""; \
		echo "See ANDROID_SETUP.md for full instructions."; \
		exit 1; \
	fi
	@if ! command -v adb > /dev/null 2>&1; then \
		echo "⚠️  Android SDK tools not found in PATH."; \
		echo "Please add Android SDK to your PATH."; \
		echo "See ANDROID_SETUP.md for instructions."; \
		exit 1; \
	fi
	@echo "✅ Android SDK found at $$ANDROID_HOME"
	npx expo run:android

# Code quality
lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

format:
	npx prettier --write .

format-check:
	npx prettier --check .

typecheck:
	npx tsc --noEmit

# Build commands (requires EAS CLI)
build-dev:
	npx eas build --profile development --platform all

build-preview:
	npx eas build --profile preview --platform all

build-prod:
	npx eas build --profile production --platform all

# Native code generation
prebuild:
	npx expo prebuild

prebuild-clean:
	npx expo prebuild --clean

# Cleanup
clean:
	rm -rf node_modules
	rm -rf .expo
	rm -rf dist
	rm -rf build
	@echo "Cleaned build artifacts"

