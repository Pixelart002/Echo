# TrustedP2P - Secure Crypto Trading Platform

A comprehensive P2P cryptocurrency trading platform with escrow protection, built with Next.js and Supabase.

## Features

### 🔐 Security & Trust
- Manual escrow system with admin oversight
- Multi-role user system (User, Admin, Owner)
- Anti-fraud measures and activity logging
- Secure payment proof upload system

### 💰 Trading Features
- Buy/Sell crypto deals with multiple cryptocurrencies
- Flexible fee system (fixed or percentage-based)
- Real-time deal status tracking
- Payment method flexibility (UPI, Bank Transfer, etc.)

### 👥 User Management
- Role-based access control
- User banning/unbanning system
- Referral system support
- Comprehensive user profiles

### 🤖 Telegram Integration
- Bot webhook for notifications
- Command-based interaction
- Deal status updates via Telegram

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with Supabase
- **Bot**: Telegram Bot API
- **Deployment**: Vercel-ready

## Quick Start

### 1. Database Setup
Run the SQL script to set up your database:
\`\`\`sql
-- Execute the contents of scripts/setup-database.sql in your Supabase SQL editor
\`\`\`

### 2. Environment Variables
Create `.env.local` with your credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_APP_URL=your_domain
\`\`\`

### 3. Install & Run
\`\`\`bash
npm install
npm run dev
\`\`\`

### 4. Set Telegram Webhook
\`\`\`bash
curl -X POST http://localhost:3000/api/telegram/set-webhook
\`\`\`

## User Roles

### 👤 User
- Create buy/sell deals
- Upload payment proofs
- View deal history
- Basic platform access

### 🛡️ Admin
- Approve/reject deals
- Confirm escrow deposits
- Release funds to buyers
- Manage deal disputes
- View all platform activity

### 👑 Owner
- All admin privileges
- User role management
- Fee configuration
- Platform settings control
- Ban/unban users

## Deal Lifecycle

1. **Creation**: User creates buy/sell deal
2. **Review**: Admin reviews and approves/rejects
3. **Escrow**: Seller deposits crypto (manual process)
4. **Payment**: Buyer pays seller directly
5. **Proof**: Buyer uploads payment proof
6. **Release**: Admin verifies and releases crypto
7. **Completion**: Deal marked as completed

## Fee System

### Configurable Options
- **Fee Type**: Fixed amount or percentage
- **Fee Value**: Amount or percentage rate
- **Fee Payer**: Seller or buyer pays the fee
- **Min/Max Limits**: Minimum and maximum fee caps

### Example Calculations
- **Percentage**: ₹10,000 deal @ 1.5% = ₹150 fee
- **Fixed**: ₹50 fee regardless of deal size
- **Capped**: Max ₹500 fee even on large deals

## API Endpoints

### Webhook
- `POST /api/webhook` - Telegram bot webhook
- `POST /api/telegram/set-webhook` - Set webhook URL

## Security Features

### Anti-Fraud Measures
- One active deal per user limit
- Role verification for sensitive actions
- Comprehensive activity logging
- Payment proof requirements

### Data Protection
- Row Level Security (RLS) policies
- Secure API endpoints
- Input validation and sanitization
- Error handling and logging

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Migration
1. Run setup SQL script in Supabase
2. Configure RLS policies
3. Set up proper indexes for performance

### Telegram Bot Setup
1. Create bot with @BotFather
2. Get bot token and add to environment
3. Set webhook URL after deployment

## Production Considerations

### Performance
- Database indexes on frequently queried columns
- Image optimization for proof uploads
- Caching strategies for deal listings

### Security
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload handling
- Regular security audits

### Monitoring
- Error tracking and logging
- Performance monitoring
- User activity analytics
- Deal completion metrics

## Support & Maintenance

### Regular Tasks
- Monitor deal disputes
- Review user reports
- Update fee configurations
- Database maintenance

### Scaling Considerations
- Database connection pooling
- CDN for static assets
- Load balancing for high traffic
- Automated backup strategies

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

This project is proprietary software. All rights reserved.
