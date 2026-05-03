Allo Reserve Product

A robust inventory management and product reservation system built with Next.js. This application allows users to reserve products from different warehouses with a temporary lock mechanism, ensuring high consistency and preventing over-selling.

🔗 Live Application

Live URL: https://allo-reserve-product-2tzv.vercel.app/

✨ Features

Real-time Inventory Tracking: Monitor stock levels across multiple warehouse locations.

Temporary Product Reservations: Hold items for 5 minutes to allow users to complete their checkout process.

Automated Cleanup: Cron-based cleanup tasks to release expired reservations and restore stock levels.

Responsive Design: Fully optimized for mobile, tablet, and desktop views using Tailwind CSS and Shadcn UI.

Live Latency Monitoring: Visual feedback on API performance and system health.

Theme Support: Integrated light and dark mode support.

🛠️ Tech Stack

Framework: Next.js 15 (App Router)

Database: PostgreSQL (hosted on Supabase/Neon)

Caching/State: Redis (hosted on Upstash)

ORM: Prisma

Styling: Tailwind CSS

UI Components: Shadcn UI

Icons: Lucide React

Validation: Zod

⚙️ How it Works: Reservation Expiry

To ensure product availability is handled correctly without permanent locks, the system implements a two-tier cleanup strategy:

Redis TTL: Temporary reservation tokens are stored in Redis with an expiration time.

Cron Job: A dedicated cleanup route (/api/cron/cleanup) runs periodically (via Vercel Cron) to identify expired reservations in the PostgreSQL database and revert the reservedAmount back to the warehouse stock.

🚀 Getting Started

Prerequisites

Node.js 18.x or later

A PostgreSQL database

An Upstash Redis account

Environment Variables

Create a .env file in the root directory and add the following:

# Database
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"


Installation

Clone the repository:

git clone [https://github.com/bharath05022005/allo-reserve-product.git](https://github.com/bharath05022005/allo-reserve-product.git)
cd allo-reserve-product


Install dependencies:

npm install


Setup Database:

npx prisma generate
npx prisma migrate dev
npx prisma db seed


Run development server:

npm run dev


📂 Project Structure

/src/app: Next.js pages and API routes.

/src/components: Reusable UI components (Sidebar, Navbar, Product Cards).

/src/lib: Database and Redis configuration clients.

/src/services: Business logic for handling reservations.

/prisma: Database schema and seeding scripts.

📈 Future Improvements

Distributed Locking: Moving from simple atomicity to Redlock for extreme high-concurrency scenarios.

Websockets: Real-time stock updates across all active client sessions using Pusher or Socket.io.

