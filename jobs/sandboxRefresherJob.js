import ClientMgr from '../clientMgr.js';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';
import { parentPort } from 'worker_threads';

async function refreshSandboxStatus() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const sandboxMgr = new SandboxMgr();
  const clientMgr = new ClientMgr();

  const results = await provisionRequestMgr.findRequestByStatus(
    REQUEST_PROCESSING_STATUS.CODEPROVISIONED
  );
  if (results.rowCount <= 0) {
    console.log(
      'No Pending request for Sandbox - SiteImport & Other configurations'
    );
    process.exit(0);
  }

  for (const provisionRequest of results.rows) {
    console.log('Sandbox Status to be refreshed ', provisionRequest.sandbox_id);

    const provisionedSandbox = JSON.parse(provisionRequest.sandbox_details);

    const importStatus = await sandboxMgr.configureSandboxWithSiteImport(
      provisionedSandbox
    );
    if ('OK' == importStatus) {
      await clientMgr.updateClientRoles(
        provisionedSandbox.clientConfig.clientID,
        `${provisionedSandbox.realm}_${provisionedSandbox.instance}`
      );

      await sandboxMgr.configureSandboxWithUsers(
        provisionRequest,
        provisionedSandbox
      );
      await provisionRequestMgr.updateProvisionRequestWithStatus(
        provisionRequest.id,
        REQUEST_PROCESSING_STATUS.COMPLETED
      );
    }
  }
  process.exit();
}
refreshSandboxStatus();
