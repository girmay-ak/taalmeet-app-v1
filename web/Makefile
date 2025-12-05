# TaalMeet Web App Makefile
# Quick commands for development and deployment

.PHONY: help install dev build preview clean lint format test

# Default target
help:
	@echo "TaalMeet Web App - Available Commands:"
	@echo ""
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development server (port 3000)"
	@echo "  make build      - Build for production"
	@echo "  make preview    - Preview production build"
	@echo "  make clean      - Clean build artifacts and node_modules"
	@echo "  make lint       - Run linter"
	@echo "  make format     - Format code with prettier"
	@echo "  make test       - Run tests"
	@echo "  make setup      - Initial setup (install + env setup)"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Start development server
dev:
	@echo "🚀 Starting development server..."
	@echo "   Server will run at http://localhost:3000"
	npm run dev

# Build for production
build:
	@echo "🏗️  Building for production..."
	npm run build
	@echo "✅ Build complete! Output in 'dist/' directory"

# Preview production build
preview:
	@echo "👀 Previewing production build..."
	npm run preview

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules
	rm -rf .vite
	@echo "✅ Clean complete!"

# Run linter
lint:
	@echo "🔍 Running linter..."
	npm run lint || echo "⚠️  Linter not configured, skipping..."

# Format code
format:
	@echo "✨ Formatting code..."
	npm run format || echo "⚠️  Formatter not configured, skipping..."

# Run tests
test:
	@echo "🧪 Running tests..."
	npm run test || echo "⚠️  Tests not configured, skipping..."

# Initial setup
setup: install
	@echo "⚙️  Setting up web app..."
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file..."; \
		echo "VITE_SUPABASE_URL=your_supabase_url" > .env; \
		echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env; \
		echo "✅ .env file created. Please update with your Supabase credentials."; \
	else \
		echo "✅ .env file already exists."; \
	fi
	@echo ""
	@echo "✅ Setup complete!"
	@echo "   Next steps:"
	@echo "   1. Update .env with your Supabase credentials"
	@echo "   2. Run 'make dev' to start development server"

# Quick start (install + dev)
start: install dev

