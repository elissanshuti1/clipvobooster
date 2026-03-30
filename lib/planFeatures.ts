// Plan features configuration
export const PLAN_FEATURES = {
  free: {
    leads: 0,
    emails: 0,
    templates: 0,
    analytics: 'none',
    support: 'none',
    leadStorage: 'none',
    teamMembers: 0,
  },
  starter: {
    leads: 100,
    emails: 300,
    templates: 5,
    analytics: 'basic',
    support: 'email',
    leadStorage: '30days',
    teamMembers: 1,
  },
  professional: {
    leads: 500,
    emails: 1000,
    templates: 999999, // unlimited
    analytics: 'advanced',
    support: 'priority-chat',
    leadStorage: '90days',
    teamMembers: 3,
  },
  business: {
    leads: 2000,
    emails: 5000,
    templates: 999999,
    analytics: 'custom',
    support: 'dedicated',
    leadStorage: 'unlimited',
    teamMembers: 999999,
  },
};

// Check if user has access to a feature
export function hasFeature(userPlan: string, feature: string, value?: any): boolean {
  const features = PLAN_FEATURES[userPlan as keyof typeof PLAN_FEATURES];
  if (!features) return false;

  if (feature === 'templates') {
    return features.templates > 0;
  }
  
  if (feature === 'analytics') {
    return features.analytics !== 'none';
  }
  
  if (feature === 'support') {
    return features.support !== 'none';
  }

  return false;
}

// Get plan limit for a feature
export function getPlanLimit(userPlan: string, feature: string): number {
  const features = PLAN_FEATURES[userPlan as keyof typeof PLAN_FEATURES];
  if (!features) return 0;
  return features[feature as keyof typeof features] as number || 0;
}

// Check if usage is near limit (80%)
export function isNearLimit(used: number, limit: number): boolean {
  if (limit === 0) return false;
  return used >= limit * 0.8;
}

// Check if usage exceeded limit
export function isLimitExceeded(used: number, limit: number): boolean {
  if (limit === 0) return true;
  return used >= limit;
}
