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
    //check for 200 response from axios inside sandboxDetails.data.code..

    await provisionRequestMgr.updateProvisionRequestWithDetails(
      element.id,
      sandboxDetails.data.data
    );
  }
}

refreshSandboxStatus();
