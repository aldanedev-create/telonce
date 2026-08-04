export interface DashboardOptions {
  port?: number;
  host?: string;
}

export interface DashboardData {
  stats: Record<string, unknown>;
}

export interface DashboardServer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function serveDashboard(_options: DashboardOptions = {}): DashboardServer {
  return {
    async start() {},
    async stop() {},
  };
}

export function createDashboardServer(options: DashboardOptions = {}): DashboardServer {
  return serveDashboard(options);
}
