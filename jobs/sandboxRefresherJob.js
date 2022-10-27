import ClientMgr from '../clientMgr.js';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';
import { parentPort } from 'worker_threads';

async function refreshSandboxStatus() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const sandboxMgr = new SandboxMgr();

  const results = await provisionRequestMgr.findRequestInProgress(
    REQUEST_PROCESSING_STATUS.CODEPROVISIONED,
    REQUEST_PROCESSING_STATUS.COMPLETED
  );

  for (const provisionRequest of results.rows) {
    console.log('Sandbox Status to be refreshed ', provisionRequest.sandbox_id);
    const sandboxDetails = await sandboxMgr.getSandboxDetail(
      provisionRequest.sandbox_id
    );
    const provisionedSandbox = JSON.parse(provisionRequest.sandbox_details);
    sandboxDetails.data.clientConfig = provisionedSandbox.clientConfig;

    if (
      'started' === sandboxDetails.data.state &&
      REQUEST_PROCESSING_STATUS.CODEPROVISIONED ==
        provisionRequest.request_processing_status
    ) {
      const clientMgr = new ClientMgr();
      await clientMgr.updateClientRoles(
        provisionedSandbox.clientConfig.clientID,
        `${provisionedSandbox.realm}_${provisionedSandbox.instance}`
      );

      await sandboxMgr.configureSandboxWithSiteImport(provisionedSandbox);
      await sandboxMgr.configureSandboxWithUsers(
        provisionRequest,
        provisionedSandbox
      );
      // TODO : User creation / enablement ..
      //TODO: Refactor ..
      await provisionRequestMgr.updateProvisionRequestWithDetails(
        provisionRequest.id,
        sandboxDetails.data
      );
      await provisionRequestMgr.updateProvisionRequestWithStatus(
        provisionRequest.id,
        REQUEST_PROCESSING_STATUS.COMPLETED
      );
    } else if (
      'deleted' == sandboxDetails.data.state &&
      REQUEST_PROCESSING_STATUS.COMPLETED ==
        provisionRequest.request_processing_status
    ) {
      await provisionRequestMgr.updateProvisionRequestWithDetails(
        provisionRequest.id,
        sandboxDetails.data
      );
    } else if (
      'started' === sandboxDetails.data.state &&
      REQUEST_PROCESSING_STATUS.INITIATED ===
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
