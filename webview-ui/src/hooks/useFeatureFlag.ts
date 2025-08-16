/**
 * Local-only build: feature flags disabled (no telemetry/posthog).
 */
export const useHasFeatureFlag = (_flagName: string): boolean => false
