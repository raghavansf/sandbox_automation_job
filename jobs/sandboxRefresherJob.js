import ClientMgr from '../clientMgr.js';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';

async function refreshSandboxStatus() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const sandboxMgr = new SandboxMgr();
  const results = await provisionRequestMgr.findRequestInProgress();

  for (const provisionRequest of results.rows) {
    console.log('Sandbox Status to be refreshed ', provisionRequest.sandbox_id);
    const sandboxDetails = await sandboxMgr.getSandboxDetail(
      provisionRequest.sandbox_id
    );
    const provisionedSandbox = JSON.parse(provisionRequest.sandbox_details);
    sandboxDetails.data.clientConfig = provisionedSandbox.clientConfig;

    if (
      'started' === sandboxDetails.data.state &&
      REQUEST_PROCESSING_STATUS.PROVISIONED !=
        provisionRequest.request_processing_status
    ) {
      const clientMgr = new ClientMgr();
      await clientMgr.updateClientRoles(
        provisionedSandbox.clientConfig.clientID,
        `${provisionedSandbox.realm}_${provisionedSandbox.instance}`
      );
      await sandboxMgr.configureSandboxWithCode(provisionedSandbox);
      await sandboxMgr.configureSandboxWithUsers(
        provisionRequest,
        provisionedSandbox
      );
      await sandboxMgr.configureSandboxWithSiteImport(provisionedSandbox);
      /*
      const configureSandboxWithCodePromise = () => {
        return new Promise(() => {
          sandboxMgr.configureSandboxWithCode(provisionedRequest);
        });
      };
      Promise.all([
        sandboxMgr.configureSandboxWithUsers(element, provisionedRequest),
        configureSandboxWithCodePromise,
        sandboxMgr.configureSandboxWithSiteImport(provisionedRequest),
      ])
        .then(() =>
          console.log(
            'The Sandbox has been configured with Users, Site Import and Code'
          )
        )
        .catch((error) => console.error('The configuration has failed', error));
        */

      //Update Provision Request to COMPLETED status so that it doesn't get picked up for any further processing
      await provisionRequestMgr.updateProvisionRequestWithDetails(
        provisionRequest.id,
        sandboxDetails.data
      );
      await provisionRequestMgr.markProvisionRequestCompleted(
        provisionRequest.id
      );
    } else if ('deleted' == sandboxDetails.data.state) {
      await provisionRequestMgr.updateProvisionRequestWithDetails(
        provisionRequest.id,
        sandboxDetails.data
      );
    }
  }

  process.exit();
}

refreshSandboxStatus();
