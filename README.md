# Moms-2GO - Safe Transportation for Expecting & New Mothers

A fully functional web application providing safe, reliable transportation services specifically designed for pregnant and postpartum mothers with CPR-certified drivers.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure signup/signin with NextAuth.js
- **Role-based Access** - Separate interfaces for passengers, drivers, and admins
- **Ride Booking** - Complete booking system with real-time matching
- **Real-time Tracking** - Live GPS tracking during rides
- **Payment Processing** - Stripe integration for secure payments
- **Notifications** - Email alerts for ride updates
- **Emergency Support** - Priority emergency ride handling

### User Roles

#### Passengers
- Account registration with pregnancy information
- Ride booking with pickup/destination
- Real-time ride tracking
- Emergency ride requests
- Payment processing
- Ride history and ratings

#### Drivers
- Driver application with vehicle information
- Background check and certification tracking
- Availability status management
- Ride request acceptance
- Real-time location sharing
- Earnings and ride history

#### Administrators
- Driver approval workflow
- System analytics and reporting
- Emergency ride monitoring
- User and ride management
- Revenue tracking

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with credential provider
- **Payments**: Stripe API integration
- **Notifications**: Nodemailer (email)
- **Maps**: Google Maps API integration ready
- **Deployment**: Vercel ready

## 📁 Project Structure

```
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── rides/                # Ride management
│   │   ├── drivers/              # Driver management
│   │   ├── payments/             # Payment processing
│   │   └── notifications/        # Notification system
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # User dashboards
│   │   ├── admin/               # Admin interface
│   │   ├── book-ride/           # Ride booking
│   │   ├── driver/              # Driver dashboard
│   │   ├── payment/             # Payment pages
│   │   └── track/               # Real-time tracking
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # Reusable UI components
├── lib/                         # Utility libraries
│   ├── db/                      # Database configuration
│   ├── auth.ts                  # Authentication setup
│   ├── stripe.ts                # Payment processing
│   └── notifications.ts         # Email/SMS system
├── types/                       # TypeScript definitions
└── public/                      # Static assets
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Stripe account for payments
- SMTP email service (Gmail/SendGrid)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd moms-2-go
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@moms2go.com"


# Google Maps API - Optional for enhanced geocoding
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

3. **Database setup:**
```bash
# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Launch Drizzle Studio for database management
npm run db:studio
```

4. **Run the development server:**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Stripe Webhook Setup

For payment processing to work properly, set up Stripe webhooks:

1. In your Stripe dashboard, go to Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook secret to your environment variables

## 🧪 Testing

### User Account Creation
1. Visit `/auth/signup`
2. Choose "Passenger" or "Driver" role
3. Fill out the registration form
4. For drivers: wait for admin approval

### Booking a Ride (Passenger)
1. Sign in as a passenger
2. Navigate to "Book a Ride"
3. Enter pickup and destination addresses
4. Choose immediate or scheduled pickup
5. Confirm booking

### Accepting Rides (Driver)
1. Sign in as an approved driver
2. Set status to "Available"
3. Accept incoming ride requests
4. Update ride status through the journey

### Admin Functions
1. Create an admin user (update role in database)
2. Access `/dashboard/admin`
3. Approve pending drivers
4. Monitor rides and analytics

## 🔧 Required Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the following required variables:

### Essential for Basic Functionality:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for session encryption
- `NEXTAUTH_URL` - Application URL

### Required for Payment Processing:
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Required for Email Notifications:
- `SMTP_HOST` - Email server host
- `SMTP_PORT` - Email server port
- `SMTP_USER` - Email account username
- `SMTP_PASSWORD` - Email account password
- `SMTP_FROM` - From email address


### Optional for Enhanced Maps:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

## 🚀 Deployment

The application is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel settings
3. Deploy!

For other platforms, ensure Node.js 18+ support and PostgreSQL connectivity.

## 📝 Additional Notes

- The application includes comprehensive error handling and form validation
- Real-time features use polling (can be upgraded to WebSockets)
- All sensitive data is properly secured and encrypted
- The design is fully responsive for mobile and desktop
- Accessibility features are built-in with proper ARIA labels

## 🔐 Security Features

- Encrypted password storage with bcrypt
- JWT session management
- Role-based access control
- Input validation and sanitization
- CSRF protection
- SQL injection prevention with Drizzle ORM

## 📞 Support

For questions or issues:
- Check the API documentation in the code comments
- Review error logs in the console
- Ensure all environment variables are correctly set
- Verify database connectivity

---

**Moms-2GO** - Safe rides for life's precious moments 💝