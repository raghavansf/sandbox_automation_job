import ClientMgr from '../clientMgr.js';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';

async function refreshSandboxStatus() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const sandboxMgr = new SandboxMgr();
  const results = await provisionRequestMgr.findRequestInProgress();
  if (results.rowCount <= 0) {
    process.exit();
  }
  for (const element of results.rows) {
    console.log('Sandbox Status to be refreshed ', element.sandbox_id);
    const sandboxDetails = await sandboxMgr.getSandboxDetail(
      element.sandbox_id
    );
    console.log('SandboxDetails ', sandboxDetails);
    const provisionedRequest = JSON.parse(element.sandbox_details);
    sandboxDetails.data.clientConfig = provisionedRequest.clientConfig;

    if ('started' === sandboxDetails.data.state) {
      const clientMgr = new ClientMgr();
      await clientMgr.updateClientRoles(
        provisionedRequest.clientConfig.clientID,
        `${provisionedRequest.realm}_${provisionedRequest.instance}`
      );
      //TODO:Uncomment below once other activities are completed ,  test !!!
      //  await sandboxMgr.configureSandboxWithUsers(element,provisionedRequest);
      //TODO: post successful update provision request with User details
      // await sandboxMgr.configureSandboxWithCode(provisionedRequest);
    }

    await provisionRequestMgr.updateProvisionRequestWithDetails(
      element.id,
      sandboxDetails.data
    );
  }
  process.exit();
}

refreshSandboxStatus();
