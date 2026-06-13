import { describe, it, expect } from 'vitest';
import { LOG_EVENTS } from '../../../src/lib/logging/events';

describe('Logging events definitions', () => {
  it('should have all 35 stable events defined', () => {
    const eventKeys = Object.keys(LOG_EVENTS);
    expect(eventKeys.length).toBe(35);
    
    // Check some specific events
    expect(LOG_EVENTS.APP_BOOTSTRAP_STARTED).toBe('app.bootstrap.started');
    expect(LOG_EVENTS.AUDIO_PLAYBACK_STARTED).toBe('audio.playback.started');
    expect(LOG_EVENTS.SETTINGS_PERSIST_COMPLETED).toBe('settings.persist.completed');
  });
});
