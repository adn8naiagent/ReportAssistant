import { pgTable, text, uuid, timestamp, integer, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';

// Users table - core user information and subscription tier
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
  currentTier: text('current_tier').notNull().default('free'), // 'free', 'monthly', 'yearly'
  monthlyRequestsUsed: integer('monthly_requests_used').default(0).notNull(),
  monthlyRequestsLimit: integer('monthly_requests_limit').default(10).notNull(),
  lastResetDate: timestamp('last_reset_date').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  country: text('country'),
  referralSource: text('referral_source'),
});

// Subscriptions table - track Stripe subscription details
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeCustomerId: text('stripe_customer_id'),
  status: text('status').notNull(), // 'active', 'cancelled', 'past_due', 'trialing', 'incomplete'
  tier: text('tier').notNull(), // 'free', 'monthly', 'yearly'
  priceUsd: decimal('price_usd', { precision: 10, scale: 2 }).notNull(), // 13.99 or 129.99
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Saved responses table - user's saved report generations
export const savedResponses = pgTable('saved_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'reportCommentary', 'learningPlan', 'lessonPlan'
  inputText: text('input_text').notNull(),
  generatedContent: text('generated_content').notNull(),
  conversationHistory: jsonb('conversation_history'), // array of {role, content} objects
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  wordCount: integer('word_count'),
});

// Usage logs table - track every API request for analytics
export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  sessionId: uuid('session_id'),
  requestType: text('request_type').notNull(), // 'generate', 'refine'
  assistantType: text('assistant_type').notNull(), // 'reportCommentary', 'learningPlan', 'lessonPlan'
  tokensInput: integer('tokens_input'),
  tokensOutput: integer('tokens_output'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 6 }),
  responseTimeMs: integer('response_time_ms'),
  model: text('model'), // e.g., 'anthropic/claude-3.5-haiku'
  wasSuccessful: boolean('was_successful').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Sessions table - tracks both anonymous and authenticated users
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id), // null for anonymous visitors
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  country: text('country'),
  city: text('city'),
  referrer: text('referrer'),
  landingPage: text('landing_page'),
  isAnonymous: boolean('is_anonymous').notNull().default(true),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  durationSeconds: integer('duration_seconds'),
});

// Events table - granular action tracking
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  userId: uuid('user_id').references(() => users.id), // null if anonymous
  eventType: text('event_type').notNull(), // 'pageView', 'buttonClick', 'signupStarted', 'signupCompleted', 'assistantUsed', 'savedResponse'
  eventCategory: text('event_category').notNull(), // 'navigation', 'engagement', 'conversion', 'usage'
  eventLabel: text('event_label'),
  eventValue: integer('event_value'),
  metadata: jsonb('metadata'), // flexible field for additional data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SavedResponse = typeof savedResponses.$inferSelect;
export type NewSavedResponse = typeof savedResponses.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = typeof usageLogs.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
