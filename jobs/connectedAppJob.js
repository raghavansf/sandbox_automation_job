import ClientMgr from '../clientMgr.js';
(async function () {
  try {
    const provisionedSandbox = {
      id: '33ec525c-a674-4c00-aecd-4c68f2a828f4',
      realm: 'zzte',
      instance: '085',
      versions: {},
      autoScheduled: true,
      resourceProfile: 'medium',
      state: 'new',
      createdAt: '2022-11-21T12:09:38Z',
      createdBy: 'fff79095-0dae-4630-a720-f1029b9810d8',
      eol: '2023-02-19T12:09:38Z',
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
        clientID: 'f858a45a-d4e4-4903-840b-c5fcf33e51af',
        clientSecret: 'TrialCommerce@2022',
        clientName: 'Sandbox Trial',
      },
    };
    const clientMgr = new ClientMgr();
    clientMgr.updateConnectedAppWithSandboxDetails(
      58,
      JSON.stringify(provisionedSandbox)
    );
  } catch (error) {
    console.log('Error occured while updating connected app ', error);
  }
})();
