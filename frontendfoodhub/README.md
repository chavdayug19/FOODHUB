# FoodHub Frontend (Phase 1)

This is the Next.js frontend for the Multi-Vendor Food Ordering System.

## Features

- **QR Code Landing**: Scan/Enter QR code to access specific hubs.
- **Dynamic Vendor Menus**: Browse vendors and their menus with category filtering.
- **Unified Cart**: Multi-vendor cart support with smart grouping.
- **Real-time Order Tracking**: Live updates using Socket.IO.
- **Dashboards**: Dedicated dashboards for Admins and Vendors.
- **Authentication**: Secure JWT-based auth with cookie support.
- **Dark Mode**: Fully supported system-wide dark mode.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Context API (Auth, Cart, Theme)
- **API Client**: Axios
- **Real-time**: Socket.IO Client

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Ensure `.env.local` is configured:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
    NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Project Structure

- `/src/app`: App Router pages and layouts.
- `/src/components`: Reusable UI components.
- `/src/context`: Global state providers.
- `/src/lib`: API and Socket.IO utilities.
- `/src/types`: TypeScript definitions.

## Key Routes

- `/`: Landing Page
- `/auth/login`: User Login
- `/hub/[hubId]`: Hub Vendor Listing
- `/vendor/[vendorId]`: Vendor Menu
- `/cart`: Shopping Cart
- `/order/[orderId]`: Order Tracking
- `/dashboard/admin`: Admin Dashboard
- `/dashboard/vendor`: Vendor Dashboard
