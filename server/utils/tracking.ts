import { prisma } from '../db';

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
  const session = await prisma.session.create({
    data: {
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
    },
  });

  return session.id;
}

/**
 * Track a user event
 */
export async function trackEvent(data: TrackEventData): Promise<void> {
  await prisma.event.create({
    data: {
      sessionId: data.sessionId,
      userId: data.userId || null,
      eventType: data.eventType,
      eventCategory: data.eventCategory,
      eventLabel: data.eventLabel || null,
      eventValue: data.eventValue || null,
      metadata: data.metadata || null,
      createdAt: new Date(),
    },
  });
}

/**
 * Update session's last activity timestamp
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        lastActivityAt: new Date(),
      },
    });
  } catch (error) {
    // Silently fail if session doesn't exist - it may have been deleted
    console.log(`Session ${sessionId} not found for activity update`);
  }
}

/**
 * End a session by setting endedAt and calculating duration
 */
export async function endSession(sessionId: string): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const endedAt = new Date();
  const durationSeconds = Math.floor(
    (endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000
  );

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      endedAt,
      durationSeconds,
    },
  });
}
