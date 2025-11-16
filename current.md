# TeachAssist.ai - Current State

**Last Updated:** 2025-11-16
**Database:** Neon PostgreSQL (Connected ✅)
**ORM:** Prisma | **Schema:** camelCase
**Status:** Operational - Admin dashboard live, Landing page live at `/landing`

---

## ✅ Recent Updates

### Logo System (2025-11-16)
- **New SVG files** in `client/public/`:
  - `logo-full.svg` - Full logo with text (used in headers)
  - `logo-icon.svg` - Icon only (used in empty states)
- **Updated across app**: AppHeader, landing page, home page, assessment page
- **Size doubled**: h-10 → h-20 for better visibility

### UI Components (2025-11-16)
- **AppHeader component**: New header with logo, tabs, AI badge (`client/src/components/AppHeader.tsx`)
- **Home page updated**: Now uses AppHeader for consistent navigation
- **Landing page enhancements**:
  - Hide Demos button added (collapse/show demos)
  - Pause/Resume All Demos button
  - Both buttons side-by-side with Eye/EyeOff icons
- **Prisma logging**: Reduced verbosity (query logs disabled in dev)

### Previous Milestones
- Landing Page at `/landing` with animated demos ✅
- Learning Plan with sequential instructional phases ✅
- Prompt management centralized in `config/prompts.ts` ✅
- Admin Dashboard at `/admin` with 10 endpoints ✅
- Geolocation tracking (ipapi.co) ✅
- Anonymous session analytics ✅

---

## 📊 Database Schema (6 Tables)

**User** - id, email, name, currentTier, monthlyRequestsUsed, monthlyRequestsLimit, lastResetDate, ipAddress, country

**Subscription** - id, userId, stripeSubscriptionId, status, tier, priceUsd, currentPeriodStart/End

**SavedResponse** - id, userId, title, type, inputText, generatedContent, conversationHistory, isFavorite

**UsageLog** - id, userId (nullable), sessionId, requestType, assistantType, tokensInput/Output, costUsd, model

**Session** - id, userId (nullable), ipAddress, userAgent, country, city, isAnonymous, startedAt, lastActivityAt

**Event** - id, sessionId, userId (nullable), eventType, eventCategory, eventLabel, metadata

---

## 🗂️ Key Files

**Components:**
- `client/src/components/AppHeader.tsx` - Main navigation header (logo, tabs, badge)
- `client/src/components/TransformationDemo.tsx` - Report writing demo
- `client/src/components/LessonPlanDemo.tsx` - Lesson planning demo
- `client/src/components/LearningPlanDemo.tsx` - Learning plan demo

**Pages:**
- `client/src/pages/home.tsx` - Main assistants interface
- `client/src/pages/landing.tsx` - Marketing page at `/landing`
- `client/src/pages/admin.tsx` - Admin dashboard

**Server:**
- `server/routes.ts` - API routes with usage tracking
- `server/routes/admin.ts` - Admin endpoints (10 routes)
- `server/middleware/tracking.ts` - Session tracking with geolocation
- `server/utils/adminMetrics.ts` - Analytics calculations
- `server/utils/tracking.ts` - Session/event utilities

**Config:**
- `config/prompts.ts` - System prompts (single source of truth)
- `config/assessment.ts` - Writing assessment standards
- `prisma/schema.prisma` - Database schema

**Public Assets:**
- `client/public/logo-full.svg` - Full logo with text
- `client/public/logo-icon.svg` - Logo icon only
- `client/public/favicon.svg` - Favicon

---

## 🎯 Usage Limits

| Tier    | Requests/Month | Price    |
|---------|----------------|----------|
| Free    | 10             | $0.00    |
| Monthly | 300            | $13.99   |
| Yearly  | 400            | $129.99  |

---

## 📦 Four Assistant Types

1. **Report Commentary** - Natural paragraphs (150-200 words), anti-hype language
2. **Learning Plan** - Victorian Govt template with 4-6 sequential phases
3. **Lesson Plan** - NSW Dept structure (5 stages)
4. **Writing Assessment** - Australian Curriculum standards

---

## 🔧 Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run check         # TypeScript check
npm run db:push       # Push schema changes
npm run db:studio     # Prisma Studio GUI
```

---

## 📊 Admin Dashboard (`/admin`)

**10 API Endpoints:**
- `/api/admin/overview` - Total/active users, MRR, signups, API costs, anonymous sessions
- `/api/admin/revenue-breakdown` - Revenue by tier
- `/api/admin/usage-stats` - Requests, popular types
- `/api/admin/recent-signups` - Last 10 users
- `/api/admin/recent-usage` - Last 10 requests
- `/api/admin/metrics` - Churn & conversion rates
- `/api/admin/users` - Paginated user list
- `/api/admin/usage-by-ip` - Top 100 IPs with costs/locations
- `/api/admin/location-map` - Geographic distribution
- `/api/admin/browser-stats` - Browser usage

**Features:**
- 6 overview cards (users, MRR, API costs, sessions)
- Revenue breakdown by tier
- Usage statistics with popular assistant types
- Browser/location analytics
- Currency precision: 4 decimals ($0.0013)
- Auto-refresh: 30-60 seconds

---

## 🔍 Environment Variables

**Required:**
- `DATABASE_URL` - Neon PostgreSQL (in Replit Secrets)
- `OPENROUTER_API_KEY` - Claude API access

**Optional:**
- `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PORT`

---

## 🚀 Next Steps

**Priority 1: Authentication**
- [ ] Choose auth strategy
- [ ] User registration/login
- [ ] Session management
- [ ] Protected routes

**Priority 2: Stripe Integration**
- [ ] Set up products ($13.99/$129.99)
- [ ] Checkout flow
- [ ] Webhook handlers
- [ ] Subscription management

**Priority 3: API Endpoints**
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/saved-responses
- [ ] POST /api/saved-responses
- [ ] GET /api/usage

---

**Session Context:** Updated logo system with new SVG files (logo-full.svg, logo-icon.svg). Created AppHeader component with larger logos (h-20). Added Hide Demos button to landing page. Reduced Prisma logging noise. All pages using new logo system consistently.
