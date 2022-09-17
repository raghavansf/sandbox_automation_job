export const USER_CREATION_PAYLOAD = {
  mail: '',
  firstName: '',
  lastName: '',
  displayName: 'Sandbox Trial',
  roles: ['bm-admin', 'slas-organization-admin'],
  groups: [],
  organizations: [process.env.TRIAL_SANDBOX_ORG_ID],
  primaryOrganization: process.env.TRIAL_SANDBOX_ORG_ID,
  userState: 'ENABLED',
  password: 'Salesforce@2022',
  roleTenantFilter: {},
};

export const CLIENT_CREATION_PAYLOAD = {
  name: 'Sandbox Trial',
  description: 'Sandbox Trial',
  jwtPublicKey: '',
  redirectUrls: ['http://localhost:3000/'],
  scopes: ['openid', 'roles', 'profile', 'tenantFilter'],
  organizations: [process.env.TRIAL_SANDBOX_ORG_ID],
  active: true,
  versionControl: ['allow abcd_sbx', 'allow uteg_*'],
  roles: ['SALESFORCE_COMMERCE_API'],
  roleTenantFilter: '',
  roleTenantFilterMap: {},
  password: 'TrialCommerce@2022',
  tokenEndpointAuthMethod: 'client_secret_basic',
  stateless: true,
};

export const USER_ACTIVATION_PAYLOAD = {
  userState: 'ENABLED',
  roleTenantFilter: '',
};

export const ADMIN_CLIENT_CREDENTIALS_PAYLOAD = {
  clientID: process.env.ADMIN_CLIENT_ID,
  clientSecret: process.env.ADMIN_CLIENT_PASSWORD,
  grantType: `grant_type=client_credentials`,
};
