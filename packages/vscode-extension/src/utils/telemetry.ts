/**
 * Telemetry Utility
 */

export interface TelemetryOptions {
  enabled?: boolean;
}

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, any>;
}

export interface Telemetry {
  trackEvent(event: TelemetryEvent): void;
  trackError(error: Error): void;
  trackTiming(name: string, durationMs: number): void;
}

class DummyTelemetry implements Telemetry {
  trackEvent(_event: TelemetryEvent) {}
  trackError(_error: Error) {}
  trackTiming(_name: string, _durationMs: number) {}
}

const globalTelemetry = new DummyTelemetry();

export function createTelemetry(_options?: TelemetryOptions): Telemetry {
  return new DummyTelemetry();
}

export function getTelemetry(): Telemetry {
  return globalTelemetry;
}

export function trackEvent(event: TelemetryEvent): void {
  globalTelemetry.trackEvent(event);
}

export function trackError(error: Error): void {
  globalTelemetry.trackError(error);
}

export function trackTiming(name: string, durationMs: number): void {
  globalTelemetry.trackTiming(name, durationMs);
}