# TaalMeet App - Root Makefile
# Commands for mobile app, web app, and shared tasks

.PHONY: help mobile web install-mobile install-web dev-mobile dev-web build-mobile build-web clean

# Default target
help:
	@echo "TaalMeet App - Available Commands:"
	@echo ""
	@echo "📱 Mobile App (React Native/Expo):"
	@echo "  make mobile          - Start mobile app development server"
	@echo "  make install-mobile  - Install mobile app dependencies"
	@echo "  make build-mobile    - Build mobile app"
	@echo ""
	@echo "🌐 Web App:"
	@echo "  make web             - Start web app development server"
	@echo "  make install-web     - Install web app dependencies"
	@echo "  make build-web       - Build web app"
	@echo ""
	@echo "📦 Shared:"
	@echo "  make install         - Install dependencies for both apps"
	@echo "  make clean           - Clean all build artifacts"
	@echo ""
	@echo "💡 Quick Start:"
	@echo "  make start           - Start mobile app (default)"
	@echo "  make start-web       - Start web app"
	@echo ""

# Mobile App Commands
mobile: start
start:
	@echo "📱 Starting mobile app..."
	cd . && npx expo start

install-mobile:
	@echo "📦 Installing mobile app dependencies..."
	npm install

build-mobile:
	@echo "🏗️  Building mobile app..."
	npx expo build

# Web App Commands
web:
	@echo "🌐 Starting web app..."
	cd web && make dev

install-web:
	@echo "📦 Installing web app dependencies..."
	cd web && make install

build-web:
	@echo "🏗️  Building web app..."
	cd web && make build

start-web: web

# Shared Commands
install: install-mobile install-web
	@echo "✅ All dependencies installed!"

clean:
	@echo "🧹 Cleaning all build artifacts..."
	rm -rf node_modules
	rm -rf web/node_modules
	rm -rf web/dist
	rm -rf .expo
	rm -rf android/build
	rm -rf ios/build
	@echo "✅ Clean complete!"
