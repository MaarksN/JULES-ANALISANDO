export enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum PlanTier {
  FREE = "FREE",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export const PLAN_LIMITS = {
  [PlanTier.FREE]: {
    voice_minutes: 10,
    ai_tokens: 10000,
    seats: 1,
  },
  [PlanTier.PRO]: {
    voice_minutes: 500,
    ai_tokens: 1000000,
    seats: 5,
  },
  [PlanTier.ENTERPRISE]: {
    voice_minutes: -1, // Unlimited
    ai_tokens: -1,
    seats: -1,
  },
};
