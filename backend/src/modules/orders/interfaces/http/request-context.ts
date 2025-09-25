export interface RequestContext {
  tenantId: string;
  userId: string;
  roles: string[];
  scopes: string[];
}
