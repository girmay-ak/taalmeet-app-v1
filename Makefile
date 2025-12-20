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
	@echo "📱 Mobile App (React Native/Expo):"
	@echo "  make start           - Start mobile app development server (default)"
	@echo "  make mobile          - Alias for 'make start'"
	@echo "  make install-mobile  - Install mobile app dependencies"
	@echo "  make build-mobile    - Build mobile app"
	@echo ""
	@echo "🌐 Standalone Web App (Vite + React):"
	@echo "  make web-app         - Start standalone web app development server"
	@echo "  make web             - Alias for 'make web-app'"
	@echo "  make start-web       - Alias for 'make web-app'"
	@echo "  make install-web     - Install web app dependencies"
	@echo "  make build-web       - Build web app"
	@echo ""
	@echo "📦 Shared:"
	@echo "  make install         - Install dependencies for both apps"
	@echo "  make clean           - Clean all build artifacts"
	@echo ""
	@echo "💡 Quick Start:"
	@echo "  make start           - Start mobile app"
	@echo "  make web-app         - Start standalone web app"
	@echo ""

# Mobile App Commands
mobile: start
start:
	@echo "📱 Starting mobile app..."
	npx expo start

install-mobile:
	@echo "📦 Installing mobile app dependencies..."
	npm install

build-mobile:
	@echo "🏗️  Building mobile app..."
	npx expo build

# Standalone Web App Commands (Vite)
web: web-app
start-web: web-app
web-app:
	@echo "🌐 Starting standalone web app..."
	cd web && make dev

install-web:
	@echo "📦 Installing web app dependencies..."
	cd web && make install

# Code quality
lint:
	npx eslint .

clean:
	@echo "🧹 Cleaning all build artifacts..."
	rm -rf node_modules
	rm -rf web/node_modules
	rm -rf web/dist
	rm -rf .expo
	rm -rf android/build
	rm -rf ios/build
	@echo "✅ Clean complete!"
