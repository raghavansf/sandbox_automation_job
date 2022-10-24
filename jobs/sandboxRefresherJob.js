import ClientMgr from '../clientMgr.js';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';
import { parentPort } from 'worker_threads';
import ClientMgr from '../clientMgr.js';

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
      REQUEST_PROCESSING_STATUS.COMPLETED !=
        provisionRequest.request_processing_status
    ) {
      // TODO : plug only Code Import , User enablement , Client Roles Updation
      // Client Roles Update / Site Import / User creation/association

      const clientMgr = new ClientMgr();
      await clientMgr.updateClientRoles(
        provisionedRequest.clientConfig.clientID,
        `${provisionedRequest.realm}_${provisionedRequest.instance}`
      );
      await sandboxMgr.configureSandboxWithSiteImport(provisionedSandbox);
      // TODO : User creation / enablement ..
      //TODO: Refactor ..
      await provisionRequestMgr.updateProvisionRequestWithDetails(
        provisionRequest.id,
        sandboxDetails.data
      );
      await provisionRequestMgr.markProvisionRequestCompleted(
        provisionRequest.id
      );
    } else if (
      'deleted' == sandboxDetails.data.state &&
      REQUEST_PROCESSING_STATUS.COMPLETED !=
        provisionRequest.request_processing_status
    ) {
      await provisionRequestMgr.updateProvisionRequestWithDetails(
        provisionRequest.id,
        sandboxDetails.data
      );
    }
  }
  process.exit();
}
refreshSandboxStatus();
