# TeachAssist.ai - Current State

**Last Updated:** 2025-11-16
**Database:** Neon PostgreSQL (Connected ✅)
**ORM:** Prisma
**Schema Naming:** camelCase
**Status:** Operational - Database tables created, Admin dashboard live, Landing page created

---

## ✅ Recent Milestones

- **Landing Page Created**: Marketing landing page at `/landing` with animated demos (PENDING REVIEW)
- **Learning Plan Prompt Updated**: Added instructional sequencing with 4-6 sequential phases
- **Prompt Management Fixed**: Removed duplicate client-side prompts, single source of truth in config/prompts.ts
- **Prisma Migration Complete**: Migrated from Drizzle to Prisma ORM
- **Database Setup**: All 6 tables created and operational
- **Admin Dashboard**: Fully functional at `/admin` with 10 API endpoints
- **Report Prompt Enhanced**: Comprehensive hype language guidelines with extensive prohibited words list
- **Usage Tracking**: Full analytics logging in /api/generate-report endpoint with token/cost tracking
- **Geolocation**: ipapi.co integration for session country/city tracking
- **Advanced Analytics**: IP-based usage tracking, geographic distribution, and browser statistics
- **Admin Overview Cards**: 6 metric cards including Monthly API Costs and Anonymous Sessions
- **Currency Precision**: 4 decimal places for cost tracking ($0.0013 instead of $0.00)

---

## 📊 Database Schema (6 Tables)

### User
- id, email (unique), name, createdAt, updatedAt, lastActiveAt
- currentTier (free/monthly/yearly), monthlyRequestsUsed, monthlyRequestsLimit
- lastResetDate (auto-resets every 30 days), ipAddress, country, referralSource

### Subscription
- id, userId → User, stripeSubscriptionId, stripeCustomerId
- status (active/cancelled/past_due/trialing), tier, priceUsd (13.99 or 129.99)
- currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, cancelledAt

### SavedResponse
- id, userId → User, title, type (reportCommentary/learningPlan/lessonPlan)
- inputText, generatedContent, conversationHistory (JSON), isFavorite, wordCount

### UsageLog
- id, userId → User (nullable), sessionId, requestType (generate/refine)
- assistantType, tokensInput, tokensOutput, costUsd, responseTimeMs, model
- wasSuccessful, errorMessage

### Session
- id, userId → User (nullable), ipAddress, userAgent, country, city
- referrer, landingPage, isAnonymous, startedAt, lastActivityAt, endedAt, durationSeconds

### Event
- id, sessionId → Session, userId → User (nullable)
- eventType (pageView/buttonClick/signupStarted/etc), eventCategory, eventLabel, eventValue
- metadata (JSON)

---

## 🗂️ Key Files

**Database:**
- `prisma/schema.prisma` - Complete Prisma schema (6 models)
- `server/db.ts` - Prisma Client singleton
- `.env.example` - Environment template

**Utilities:**
- `server/utils/subscription.ts` - Usage limits (getTierLimits, checkUsageLimit, incrementUsage, resetMonthlyUsage)
- `server/utils/tracking.ts` - Session/event tracking (createSession, trackEvent, updateSessionActivity, endSession)
- `server/utils/adminMetrics.ts` - Analytics (MRR, churn, conversion, costs, tokens)
- `server/middleware/tracking.ts` - Auto session tracking with geolocation (captures IP, UA, country, city, referrer)

**Application:**
- `server/index.ts` - Express server with Prisma $connect() test
- `server/routes.ts` - Main API routes with full usage tracking in /api/generate-report
- `server/routes/admin.ts` - Admin API endpoints (10 routes)
- `server/vite.ts` - Vite middleware (fixed to exclude /api routes)
- `client/src/pages/home.tsx` - Main React UI (assistants interface)
- `client/src/pages/landing.tsx` - Marketing landing page (PENDING REVIEW)
- `client/src/pages/admin.tsx` - Admin dashboard with browser/location analytics
- `client/src/hooks/useAdminData.ts` - Admin data fetching hooks (10 endpoints)
- `client/src/components/Logo.tsx` - TeachAssist.ai logo component
- `client/src/components/TransformationDemo.tsx` - Animated report writing demo
- `client/src/components/LessonPlanDemo.tsx` - Animated lesson plan demo
- `client/src/components/LearningPlanDemo.tsx` - Animated learning plan demo
- `config/prompts.ts` - Enhanced system prompts (single source of truth)
- `config/assessment.ts` - Writing assessment standards and prompts

**Documentation:**
- `scripts/COPY-SCHEMA.md` - Deployment guide
- `scripts/setup-database.md` - Database setup instructions
- `current.md` - This file

---

## 🔧 Available Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run check         # TypeScript check
npm run db:push       # Push schema (fast, no migrations)
npm run db:studio     # Prisma Studio GUI
npm run db:generate   # Regenerate Prisma Client
npm run db:migrate    # Create & apply migrations
```

---

## 🎯 Usage Limits

| Tier    | Requests/Month | Price    | Auto-Reset |
|---------|----------------|----------|------------|
| Free    | 10             | $0.00    | 30 days    |
| Monthly | 300            | $13.99   | 30 days    |
| Yearly  | 400            | $129.99  | 30 days    |

---

## 🔑 Utility Functions Reference

**Subscription (`server/utils/subscription.ts`):**
```typescript
getTierLimits(tier: string): number  // Returns limit for tier
checkUsageLimit(userId): Promise<{allowed, remaining}>  // Auto-resets after 30 days
incrementUsage(userId): Promise<void>  // +1 to monthlyRequestsUsed
resetMonthlyUsage(userId): Promise<void>  // Resets counter
```

**Tracking (`server/utils/tracking.ts`):**
```typescript
createSession(data: CreateSessionData): Promise<string>  // Returns sessionId
trackEvent(data: TrackEventData): Promise<void>  // Logs actions
updateSessionActivity(sessionId): Promise<void>  // Updates lastActivityAt
endSession(sessionId): Promise<void>  // Closes session, calculates duration
```

**Admin Metrics (`server/utils/adminMetrics.ts`):**
```typescript
getMonthlyRecurringRevenue(): Promise<number>  // MRR calculation
getNewSignupsCount(days): Promise<number>
getActiveUsersCount(days): Promise<number>
getChurnRate(): Promise<number>  // Cancellation %
getConversionRate(): Promise<number>  // Anonymous → Signup %
getAverageRequestsPerUser(): Promise<number>
getPopularAssistantTypes(): Promise<{type, count}[]>
getTotalApiCosts(days): Promise<number>
getTotalTokensUsed(days): Promise<{input, output, total}>
```

---

## 📦 Application Features

### Four Assistant Types
1. **Report Commentary** - Natural paragraph reports (150-200 words)
   - **Enhanced prompt**: Comprehensive anti-hype language guidelines
   - **Prohibited words**: exceptional, outstanding, excellent, remarkable, impressive, commendable, exemplary, wonderful, delightful, fantastic, brilliant, extraordinary, tremendous, superb, magnificent, phenomenal, stellar, noteworthy, admirable
   - **Prohibited phrases**: "stand out as", "significant strengths", "particularly noteworthy", "shows great promise"
   - **Tone**: Matter-of-fact, observational, neutral - not enthusiastic or promotional
   - Balanced: Mentions both strengths and areas for development
2. **Learning Plan** - Victorian Govt template with instructional sequencing
   - **NEW**: Baseline assessment section
   - **NEW**: 4-6 sequential instructional phases per learning area
   - **NEW**: Clear transition criteria between phases
   - **NEW**: Teacher and student actions for each phase
   - **NEW**: Progress checks and formative assessments
   - **NEW**: Final assessment criteria
   - **Formatting**: Parent lines without bullets when sub-bullets exist
3. **Lesson Plan** - NSW Dept structure (5 stages)
4. **Writing Assessment** - Australian Curriculum standards analysis

### UI Features
- Tab-based navigation (independent state)
- Context-specific refinement buttons (9 for Report, 6 for Learning/Lesson)
- Batched refinements (select multiple, refine once)
- Rich text copy (HTML + plain text for Word)
- Sticky copy button
- HTML rendering (**bold**, bullets, numbers)
- Generation history (last 10 per tab)
- localStorage persistence

### Admin Dashboard (`/admin`)
- **Overview Cards**: 6 key metrics
  - Total Users (signed up users)
  - Active Users (30d)
  - Anonymous Sessions (30d) - visitors who haven't signed up
  - Monthly Recurring Revenue (MRR)
  - Monthly API Costs (30d) - matches MRR time period
  - New Signups (7d)
- **Revenue Breakdown**: Distribution by subscription tier
- **Usage Statistics**: Total requests, avg per user (calculated from UsageLog), popular assistant types
- **Recent Activity**: Recent signups and usage logs
- **Key Metrics**: Churn rate, conversion rate
- **Browser Statistics**: Browser usage distribution with visual progress bars
- **Geographic Distribution**: Sessions and unique IPs by country/city
- **Usage by IP**: Top 100 IPs with request counts, costs (4 decimals), and locations
- **User Management**: Searchable, paginated user list (20 per page)
- **Auto-refresh**: Updates every 30-60 seconds
- **Currency Format**: All costs show 4 decimal places for accuracy

### Middleware & Usage Tracking
- **Tracking middleware** (`server/middleware/tracking.ts`):
  - Auto-captures sessions (IP, UA, referrer, landing page)
  - **Geolocation**: Fetches country/city from ipapi.co for new sessions
  - Creates/updates sessions on each request
  - Stores sessionId in cookie: `ta_session_id` (30 days)
  - Attaches sessionId to req object

- **Usage logging** (`server/routes.ts` - `/api/generate-report`):
  - Tracks every API request with full metrics
  - **Token tracking**: prompt_tokens and completion_tokens from OpenRouter
  - **Cost calculation**: $0.25/1M input, $1.25/1M output tokens (Haiku pricing)
  - **Response time**: Milliseconds from request start to completion
  - **Request type**: Distinguishes between 'generate' and 'refine'
  - **Success/failure**: Logs both successful and failed requests with error messages
  - **Event tracking**: Creates Event records for analytics
  - **Error resilience**: Logging failures don't break API responses

---

## 🚀 Next Development Steps

### Priority 1: Database Setup ✅ COMPLETE
- [x] Add DATABASE_URL to Replit Secrets
- [x] Run `npm run db:push`
- [x] Verify connection ("✓ Prisma connected to database successfully")

### Priority 2: Authentication
- [ ] Choose auth strategy (Passport, NextAuth, custom)
- [ ] Implement user registration/login
- [ ] Hash passwords (bcrypt)
- [ ] Create session management
- [ ] Add protected routes

### Priority 3: Stripe Integration
- [ ] Set up Stripe account & keys
- [ ] Create subscription products (Monthly $13.99, Yearly $129.99)
- [ ] Implement Stripe Checkout
- [ ] Handle webhooks (subscription.created, subscription.updated, subscription.deleted)
- [ ] Update user currentTier on successful payment
- [ ] Implement subscription management (upgrade/downgrade/cancel)

### Priority 4: API Endpoints
- [ ] POST /api/auth/register - Create user
- [ ] POST /api/auth/login - Authenticate user
- [ ] POST /api/auth/logout - End session
- [x] POST /api/generate-report - Generate AI content ✅
- [ ] GET /api/saved-responses - List user's saved responses
- [ ] POST /api/saved-responses - Save response
- [ ] DELETE /api/saved-responses/:id - Delete saved response
- [ ] GET /api/usage - Get user's usage stats
- [x] GET /api/admin/overview - Overview metrics ✅
- [x] GET /api/admin/revenue-breakdown - Revenue by tier ✅
- [x] GET /api/admin/usage-stats - Usage statistics ✅
- [x] GET /api/admin/recent-signups - Recent signups ✅
- [x] GET /api/admin/recent-usage - Recent usage ✅
- [x] GET /api/admin/metrics - Churn & conversion ✅
- [x] GET /api/admin/users - Paginated user list ✅

### Priority 5: Frontend Pages
- [x] Landing page at `/landing` - CREATED (PENDING REVIEW) ✅
  - Hero section with animated gradient text
  - Three live transformation demos (pause/resume control)
  - Features section with 3 cards
  - How It Works section (3 steps)
  - Benefits section with checkmarks
  - CTA section with gradient card
  - Footer with links
- [ ] Add route to App.tsx for `/landing`
- [ ] Signup/Login forms
- [ ] Dashboard (usage stats, saved responses)
- [ ] Pricing page with Stripe checkout
- [ ] Account settings (manage subscription)
- [x] Admin panel at `/admin` ✅

### Priority 6: Usage Enforcement
- [ ] Middleware to check usage limits before generation
- [ ] Increment usage after successful generation
- [ ] Return 429 error when limit reached
- [ ] Display remaining requests in UI
- [ ] Auto-reset job (optional, or check on each request)

---

## 🔍 Environment Variables

**Required:**
- `DATABASE_URL` - Neon PostgreSQL connection (add to Replit Secrets)
- `OPENROUTER_API_KEY` - For Claude API access

**Optional:**
- `SESSION_SECRET` - Express session secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing
- `PORT` - Server port (default: 5000)

---

## 📝 Migration & Recent Changes

**Prisma Migration (Completed):**
- ✅ Removed Drizzle ORM (drizzle-orm, drizzle-zod, drizzle-kit)
- ✅ Added Prisma ORM (@prisma/client, prisma)
- ✅ Created prisma/schema.prisma with 6 models
- ✅ Updated all utilities to use Prisma queries
- ✅ Created Prisma Client singleton pattern
- ✅ Enhanced server/db.ts with detailed logging
- ✅ Generated Prisma Client (node_modules/@prisma/client)

**Admin Dashboard (Completed):**
- ✅ Created 7 admin API endpoints at `/api/admin/*`
- ✅ Built comprehensive dashboard UI at `/admin`
- ✅ Implemented React Query hooks for data fetching
- ✅ Fixed Vite catch-all route to exclude `/api` requests
- ✅ Added detailed error logging and diagnostics
- ✅ Auto-refresh functionality (30-60 seconds)

**Report Prompt Updates:**
- ✅ Updated to avoid excessive adjectives ("delightful", "excellent", etc.)
- ✅ Emphasis on observable behaviors over character judgments
- ✅ More direct, action-focused language
- ✅ Improved example style for balanced commentary

**Files Deleted:**
- drizzle.config.ts
- shared/schema.ts
- drizzle/ folder

**Database Status:**
- Schema defined ✅
- Prisma Client generated ✅
- Tables created in Neon ✅
- Connection operational ✅

---

## 📊 Admin Dashboard Endpoints

All endpoints fully functional and returning JSON:

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/admin/overview` | GET | Total users, active users, MRR, signups | ✅ |
| `/api/admin/revenue-breakdown` | GET | Revenue distribution by tier | ✅ |
| `/api/admin/usage-stats` | GET | Total requests, avg/user, popular types | ✅ |
| `/api/admin/recent-signups` | GET | Last 10 new users | ✅ |
| `/api/admin/recent-usage` | GET | Last 10 API requests | ✅ |
| `/api/admin/metrics` | GET | Churn & conversion rates | ✅ |
| `/api/admin/users` | GET | Paginated user list with search | ✅ |
| `/api/admin/usage-by-ip` | GET | Top 100 IPs by request count with costs & location | ✅ |
| `/api/admin/location-map` | GET | Sessions/unique IPs grouped by country & city | ✅ |
| `/api/admin/browser-stats` | GET | Browser usage distribution from user agents | ✅ |

---

---

## 🐛 Recent Bug Fixes

**UsageLog Not Recording Data (Fixed 2025-11-07):**

**Issue 1: Nullable userId constraint**
- **Problem**: UsageLog table had required `userId` field but code tried to create logs with `userId: null`
- **Root Cause**: Schema field was non-nullable but anonymous users don't have userIds
- **Fix**: Made `userId` field optional in Prisma schema
- **Changes**:
  - Updated `prisma/schema.prisma` line 68: `userId String?` (made nullable)
  - Updated `prisma/schema.prisma` line 69: `user User?` (made relation optional)
  - Created migration: `20251107080111_make_usage_log_user_id_optional`
  - Applied schema changes with `npx prisma db push`

**Issue 2: Conditional sessionId check preventing logs**
- **Problem**: Usage logging code was wrapped in `if (sessionId)` checks, causing logs to be skipped when tracking middleware failed
- **Root Cause**: Tracking middleware session errors prevented `req.sessionId` from being set, causing all usage logging to be skipped
- **Fix**: Removed sessionId requirement for usage logging (server/routes.ts:113, 145, 172, 218)
- **Changes**:
  - Removed `if (sessionId)` wrappers around all usage log creation code
  - Changed `sessionId: sessionId` to `sessionId: sessionId || null`
  - Kept sessionId check only for trackEvent calls (which require sessionId)
  - Added `.catch()` error handling to prevent logging failures from breaking API responses
- **Verification**: Tested multiple requests - all now create usage logs successfully
- **Impact**: Usage logs now capture **ALL** API requests regardless of session/tracking status

---

## 🆕 Recent Updates (2025-11-07)

### Admin Dashboard Enhancements

**1. Currency Precision Upgrade**
- **Change**: Updated all currency displays to show 4 decimal places
- **File**: `client/src/pages/admin.tsx:29-36`
- **Reason**: API costs are very small ($0.001308), need precision to track accurately
- **Before**: $0.00
- **After**: $0.0013

**2. Monthly API Costs Card**
- **Added**: New overview card showing total API costs for last 30 days
- **Backend**:
  - Updated `getTotalApiCosts()` in `server/utils/adminMetrics.ts:180` to return full precision (removed rounding)
  - Added to overview endpoint in `server/routes/admin.ts:48-50`
  - Added export in `server/routes/admin.ts:17`
- **Frontend**:
  - Added `monthlyApiCosts` to `OverviewData` interface in `client/src/hooks/useAdminData.ts:8`
  - Added card in `client/src/pages/admin.tsx:117-124`
- **Time Period**: Matches MRR (30 days) for consistent comparison

**3. Anonymous Sessions Card**
- **Added**: New overview card showing count of anonymous sessions (30d)
- **Backend**:
  - Created `getAnonymousSessionsCount()` function in `server/utils/adminMetrics.ts:66-80`
  - Added to overview endpoint in `server/routes/admin.ts:52-54`
  - Added export in `server/routes/admin.ts:5`
- **Frontend**:
  - Added `anonymousSessions30d` to `OverviewData` interface in `client/src/hooks/useAdminData.ts:9`
  - Added card in `client/src/pages/admin.tsx:108-115`
- **Purpose**: Track visitors who haven't signed up yet (isAnonymous: true sessions)

**4. Fixed Average Requests Per User**
- **Problem**: Was calculating average of `User.monthlyRequestsUsed` field (always 0)
- **Fix**: Changed to calculate from actual usage: `totalRequests / totalUsers`
- **File**: `server/utils/adminMetrics.ts:126-135`
- **Now shows**: Accurate average based on UsageLog records

### Current Overview Cards (6 Total)
1. Total Users (signed up users)
2. Active Users (30d)
3. Anonymous Sessions (30d) - NEW
4. Monthly Recurring Revenue (MRR)
5. Monthly API Costs (30d) - NEW
6. New Signups (7d)

---

## 🎨 Landing Page (2025-11-16) - PENDING REVIEW

**Status:** Created, not yet added to App.tsx routing

**Location:** `client/src/pages/landing.tsx`

**Components Created:**
- `client/src/components/Logo.tsx` - SVG logo with TeachAssist.ai branding
- `client/src/components/TransformationDemo.tsx` - Animated report writing transformation
- `client/src/components/LessonPlanDemo.tsx` - Animated lesson plan generation
- `client/src/components/LearningPlanDemo.tsx` - Animated learning plan with phases

**Features:**
- **Hero Section**: Gradient text, AI badge, dual CTAs (Start Speaking, Watch Demo)
- **Live Demos**: Three animated transformation demos showing input → output
- **Global Pause Control**: Pause/resume button for all animations
- **Typing Animation**: Character-by-character reveal with cursor
- **Features Grid**: 3 cards (Report Writing, Lesson Planning, Save Time)
- **How It Works**: 3-step process with numbered circles
- **Benefits**: 5 checkmark items in animated cards
- **CTA Section**: Gradient card with "Get Started Free" button
- **Footer**: Logo, copyright, links (Privacy, Terms, Contact)

**Dependencies:**
- framer-motion (motion/react)
- lucide-react icons
- Tailwind CSS with gradients

**Design System:**
- Primary colors: teal-600, emerald-600
- Gradients: from-teal-50 via-white to-emerald-50
- Typography: Bold headlines (4xl-7xl), readable body (lg-xl)
- Spacing: Generous padding, container mx-auto
- Animations: Smooth transitions, whileInView effects

**Next Steps:**
1. Review and refine landing page code
2. Add route to `client/src/App.tsx`: `<Route path="/landing" component={LandingPage} />`
3. Test animations and responsiveness
4. Connect Sign In/Get Started buttons to auth flow

---

## 🔧 Prompt System Updates (2025-11-16)

**Problem Fixed:** Landing page prompt not being used

**Root Cause:** Duplicate system prompts in `client/src/pages/home.tsx` (300+ lines)

**Solution:**
1. **Removed client-side prompts** (home.tsx:913-1245)
   - Deleted outdated report, learningPlan, and lessonPlan prompts
   - Client now only stores user/assistant messages
   - Reduced bundle size by ~14 kB (335.88 kB → 321.85 kB)

2. **Updated server logic** (server/routes.ts:66-74)
   - Server now **always** prepends system prompt from `config/prompts.ts`
   - Works for both initial generation and refinements
   - Single source of truth for all prompts

3. **Learning Plan Prompt Enhanced** (config/prompts.ts:83-195)
   - Added **BASELINE ASSESSMENT** section
   - Added **INSTRUCTIONAL SEQUENCES** with 4-6 sequential phases
   - Each phase includes:
     - What teacher will do
     - What student will do
     - Resources needed
     - Progress check
     - Transition criteria ("When student can consistently...")
   - Added **FINAL ASSESSMENT CRITERIA** section
   - Updated formatting rules: Parent lines without bullets when sub-bullets exist

**Files Modified:**
- `client/src/pages/home.tsx` - Removed 332 lines of duplicate prompts
- `server/routes.ts` - Always prepend system prompt from config
- `config/prompts.ts` - Enhanced learning plan prompt, fixed formatting rules
- `config/assessment.ts` - Fixed syntax error (missing quotes on criteria strings)

**Result:**
- ✅ All prompts reference `config/prompts.ts` only
- ✅ Learning plan now generates sequential phases
- ✅ No more client/server prompt sync issues
- ✅ Future updates only need one file change

---

**Last Updated:** 2025-11-16
**Session Context:** Created marketing landing page at `/landing` with three animated transformation demos (PENDING REVIEW). Enhanced learning plan prompt with instructional sequencing (4-6 phases with transition criteria). Fixed critical prompt management issue by removing duplicate client-side prompts - all prompts now managed from single source in config/prompts.ts. Fixed formatting rules to remove parent bullets when sub-bullets exist. Fixed syntax error in assessment.ts. Bundle size reduced by 14 kB.
