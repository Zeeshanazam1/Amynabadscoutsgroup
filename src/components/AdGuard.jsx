import { useMemo } from 'react';
import AdPlayer from './AdPlayer';
import { tryGetAdForTriggerOncePerSession } from '../utils/adTrigger';

/**
 * Renders AdPlayer as an overlay when entering a page that matches the given trigger.
 * Ensures the ad only plays once per session for that trigger.
 */
export default function AdGuard({ trigger }) {
  const resolvedTrigger = useMemo(() => trigger, [trigger]);
  const ad = tryGetAdForTriggerOncePerSession(resolvedTrigger);

  if (!ad) return null;

  // We keep the same callback signature as AdPlayer expects, but it’s a no-op.
  // tryGetAdForTriggerOncePerSession already ensures once-per-session behavior.
  return <AdPlayer ad={ad} onClose={() => {}} duration={ad.displayDuration || 5} />;
}


