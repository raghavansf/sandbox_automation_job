import ClientMgr from '../clientMgr.js';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';

async function refreshSandboxStatus() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const sandboxMgr = new SandboxMgr();
  const results = await provisionRequestMgr.findRequestInProgress();

  for (const element of results.rows) {
    console.log('Sandbox Status to be refreshed ', element.sandbox_id);
    const sandboxDetails = await sandboxMgr.getSandboxDetail(
      element.sandbox_id
    );
    const provisionedRequest = JSON.parse(element.sandbox_details);
    sandboxDetails.data.clientConfig = provisionedRequest.clientConfig;

    if (
      'started' === sandboxDetails.data.state &&
      REQUEST_PROCESSING_STATUS.PROVISIONED != element.request_processing_status
    ) {
      const clientMgr = new ClientMgr();
      await clientMgr.updateClientRoles(
        provisionedRequest.clientConfig.clientID,
        `${provisionedRequest.realm}_${provisionedRequest.instance}`
      );

      const configureSandboxWithCodePromise = () => {
        return new Promise(() => {
          sandboxMgr.configureSandboxWithCode(provisionedRequest);
        });
      }
      Promise.all([sandboxMgr.configureSandboxWithUsers(element,provisionedRequest),
                   configureSandboxWithCodePromise,
                   sandboxMgr.configureSandboxWithSiteImport(provisionedRequest)])
                   .then(() => console.log('The Sandbox has been configured with Users, Site Import and Code'))
                   .catch((error) => console.error('The configuration has failed', error));



      //TODO:Uncomment below once other activities are completed ,  test !!!
      //  await sandboxMgr.configureSandboxWithUsers(element,provisionedRequest);
      //TODO: post successful update provision request with User details
      // sandboxMgr.configureSandboxWithCode(provisionedRequest)
      // await sandboxMgr.configureSandboxWithSiteImport(provisionedRequest);
    }
    await provisionRequestMgr.updateProvisionRequestWithDetails(
      element.id,
      sandboxDetails.data
    );
  }

  process.exit();
}

refreshSandboxStatus();
