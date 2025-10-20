/**
 * Types for resolved log configuration details
 */

export interface ResolvedChannel {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  exists: boolean;
}

export interface ResolvedRole {
  id: string;
  name: string;
  color: number;
  exists: boolean;
}

export interface ResolvedLogConfig {
  channel: ResolvedChannel | null;
  role: ResolvedRole | null;
  userHasAccess: boolean;
}

export type ResolvedLogConfigs = Record<string, ResolvedLogConfig>;
