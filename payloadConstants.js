export const USER_CREATION_PAYLOAD = {
  mail: 'ns.rags@gmail.com',
  firstName: 'Rags',
  lastName: 'NS',
  displayName: 'NS-Rags-Trial',
  roles: ['bm-user'],
  groups: [],
  organizations: [process.env.TRIAL_SANDBOX_ORG_ID],
  primaryOrganization: process.env.TRIAL_SANDBOX_ORG_ID,
  userState: 'ENABLED',
  password: 'Demandware1!',
};

export const CLIENT_CREATION_PAYLOAD = {
  name: 'Sandbox Trial',
  description: 'Sandbox Trial',
  jwtPublicKey: '',
  redirectUrls: ['http://localhost/'],
  scopes: ['openid', 'roles', 'profile', 'tenantFilter'],
  organizations: [process.env.TRIAL_SANDBOX_ORG_ID],
  active: true,
  versionControl: ['allow abcd_sbx', 'allow uteg_*'],
  roles: ['ccdx-sbx-user', 'SALESFORCE_COMMERCE_API'],
  roleTenantFilter: '',
  roleTenantFilterMap: {},
  password: 'TrialCommerce@2022',
  tokenEndpointAuthMethod: 'client_secret_basic',
  accessTokenFormat: 'JWT',
};
