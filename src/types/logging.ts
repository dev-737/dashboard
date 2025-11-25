interface ResolvedChannel {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  exists: boolean;
}

interface ResolvedRole {
  id: string;
  name: string;
  color: number;
  exists: boolean;
}

interface ResolvedLogConfig {
  channel: ResolvedChannel | null;
  role: ResolvedRole | null;
  userHasAccess: boolean;
}

export type ResolvedLogConfigs = Record<string, ResolvedLogConfig>;
