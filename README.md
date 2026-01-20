# QR Food Court System

A scalable, production-ready QR-based multi-vendor food ordering web application.

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Realtime**: Socket.IO Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **Realtime**: Socket.IO

## Features

- **Customer**: Scan QR, Browse Vendors, Multi-vendor Cart, Realtime Order Tracking.
- **Vendor**: Dashboard, Realtime Order Notifications, Status Updates.
- **Admin**: Manage Hubs and Vendors.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or remote URI)

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file (optional, defaults provided):
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/qr_food_app
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
4. Seed the database (Important for first run):
   ```bash
   node seed.js
   ```
5. Start the server:
   ```bash
   npm start
   # or for dev
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## Usage Flow

1. **Customer**:
   - Go to Home.
   - Click "Scan Downtown Food Court" (simulates QR scan).
   - Browse vendors (Burger King, etc.).
   - Add items to cart.
   - Go to Cart -> Place Order.
   - Watch the status update in real-time.

2. **Vendor**:
   - Go to `/auth/login`.
   - Login with `burger@example.com` / `password123`.
   - See the new order appear instantly.
   - Change status to "Preparing" -> "Ready".
   - See status update on Customer screen.

3. **Admin**:
   - Login with `admin@example.com` / `password123`.
   - View Hubs and Vendors.
FROENTEND .ENV 
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

BACKEND .ENV
MONGO_URI=mongodb+srv://chavdayug5_db_user:YUG@foodhub.uzvohq6.mongodb.net/
JWT_SECRET=your_secret_key
PORT=5000
