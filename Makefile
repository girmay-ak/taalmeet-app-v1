.PHONY: install start ios android web lint format typecheck build-dev build-preview build-prod prebuild clean help

# Default target
help:
	@echo "TAALMEET - Available Commands"
	@echo "=============================="
	@echo "  make install       - Install dependencies"
	@echo "  make start         - Start Expo development server"
	@echo "  make ios           - Run on iOS simulator"
	@echo "  make android       - Run on Android emulator"
	@echo "  make web           - Run on web browser"
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
	npx expo run:android

web:
	npx expo start --web

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

