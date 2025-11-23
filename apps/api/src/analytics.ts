interface AnalyticsEvent {
  name:
    | 'account_created'
    | 'file_uploaded'
    | 'validation_completed'
    | 'report_downloaded'
    | 'subscription_created'
    | 'subscription_cancelled';
  organisationId: string;
  timestamp?: number;
}

const events: AnalyticsEvent[] = [];

export function track(event: AnalyticsEvent) {
  events.push({ ...event, timestamp: event.timestamp ?? Date.now() });
}

export function listEvents() {
  return events.slice(-200);
}
