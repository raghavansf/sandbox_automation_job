import SandboxMgr from '../sandboxMgr.js';

(async function () {
  try {
    const sandboxMgr = new SandboxMgr();
    const sandboxDetails = {
      id: 'ad88787c-6c40-45f3-a3f8-81c836afc6e7',
      realm: 'zzte',
      instance: '085',
      versions: {},
      autoScheduled: true,
      resourceProfile: 'medium',
      state: 'new',
      createdAt: '2022-11-17T10:42:17Z',
      createdBy: 'fff79095-0dae-4630-a720-f1029b9810d8',
      eol: '2023-02-15T10:42:17Z',
      hostName: 'zzte-085.dx.commercecloud.salesforce.com',
      links: {
        bm: 'https://zzte-085.dx.commercecloud.salesforce.com/on/demandware.store/Sites-Site',
        ocapi: 'https://zzte-085.dx.commercecloud.salesforce.com/s/-/dw/data/',
        impex:
          'https://zzte-085.dx.commercecloud.salesforce.com/on/demandware.servlet/webdav/Sites/Impex',
        code: 'https://zzte-085.dx.commercecloud.salesforce.com/on/demandware.servlet/webdav/Sites/Cartridges',
        logs: 'https://zzte-085.dx.commercecloud.salesforce.com/on/demandware.servlet/webdav/Sites/Logs',
      },
      clientConfig: {
        clientID: '8f6a6e2e-23ee-4194-9bef-05a9ab1a0f6b',
        clientSecret: 'TrialCommerce@2022',
        clientName: 'Sandbox Trial',
      },
    };
    const eolDate = new Date(sandboxDetails.eol);
    console.log(
      `${eolDate.getMonth() + 1}/${eolDate.getDate()}/${eolDate.getFullYear()}`
    );
  } catch (error) {}
})();
