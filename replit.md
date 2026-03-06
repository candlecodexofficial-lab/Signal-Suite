# TradeVault - TradingView Indicators Marketplace

## Overview
A premium web application for browsing and subscribing to TradingView indicators. Users can browse indicators, view details, add to cart with configurable durations, and complete registration to place orders.

## Tech Stack
- **Frontend**: React + TypeScript, Wouter routing, TanStack Query, Framer Motion
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **Styling**: Tailwind CSS, Shadcn UI components
- **Font**: Inter (sans), Playfair Display (serif), JetBrains Mono (mono)

## Architecture
- `shared/schema.ts` - Data models (indicators, registrations, orders, orderItems)
- `server/db.ts` - Database connection
- `server/seed.ts` - Seed data for 6 indicators
- `server/storage.ts` - DatabaseStorage class implementing IStorage
- `server/routes.ts` - API routes (/api/indicators, /api/registrations, /api/orders)
- `client/src/components/cart-provider.tsx` - Cart state with localStorage persistence
- `client/src/components/navbar.tsx` - Top navigation with cart badge
- `client/src/components/theme-toggle.tsx` - Dark/light mode toggle
- `client/src/components/indicator-card.tsx` - Card component for indicator grid

## Pages
- `/` - Home page with hero, features, indicator grid with category filters
- `/indicator/:slug` - Indicator detail page with stats, video, features, description
- `/cart` - Cart with duration selection per indicator
- `/checkout` - Registration form + order submission

## Database Tables
- `indicators` - Product catalog (name, slug, category, price, features, stats)
- `registrations` - User registration data (name, email, mobile, TradingView username)
- `orders` - Order records (registrationId, status, totalAmount)
- `order_items` - Individual items in orders (indicatorId, duration, price, isTrial)

## Key Features
- Category-based filtering on home page
- Free trial option for every indicator
- Cart with configurable duration (1-12 months)
- Registration form with validation (email, mobile, required fields)
- Dark/light mode toggle
- Responsive design
- Framer Motion animations
