import { eq } from 'drizzle-orm';
import { db } from '../db';
import { sessions, events } from '../../shared/schema';

export interface CreateSessionData {
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  userId?: string | null;
  country?: string | null;
  city?: string | null;
}

export interface TrackEventData {
  sessionId: string;
  userId?: string | null;
  eventType: string;
  eventCategory: string;
  eventLabel?: string | null;
  eventValue?: number | null;
  metadata?: Record<string, any> | null;
}

/**
 * Create a new session and return the session ID
 */
export async function createSession(data: CreateSessionData): Promise<string> {
  const [session] = await db
    .insert(sessions)
    .values({
      userId: data.userId || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      referrer: data.referrer || null,
      landingPage: data.landingPage || null,
      country: data.country || null,
      city: data.city || null,
      isAnonymous: !data.userId,
      startedAt: new Date(),
      lastActivityAt: new Date(),
    })
    .returning({ id: sessions.id });

  return session.id;
}

/**
 * Track a user event
 */
export async function trackEvent(data: TrackEventData): Promise<void> {
  await db.insert(events).values({
    sessionId: data.sessionId,
    userId: data.userId || null,
    eventType: data.eventType,
    eventCategory: data.eventCategory,
    eventLabel: data.eventLabel || null,
    eventValue: data.eventValue || null,
    metadata: data.metadata || null,
    createdAt: new Date(),
  });
}

/**
 * Update session's last activity timestamp
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  await db
    .update(sessions)
    .set({
      lastActivityAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));
}

/**
 * End a session by setting endedAt and calculating duration
 */
export async function endSession(sessionId: string): Promise<void> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const endedAt = new Date();
  const durationSeconds = Math.floor(
    (endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000
  );

  await db
    .update(sessions)
    .set({
      endedAt,
      durationSeconds,
    })
    .where(eq(sessions.id, sessionId));
}
