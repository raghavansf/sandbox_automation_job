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

    if ('started' === sandboxDetails.data.data.state) {
      const provisionRequest = element;
      await sandboxMgr.configureSandboxWithUsers(provisionRequest);
      //TODO: post successful update provision request with User details
    }

    await provisionRequestMgr.updateProvisionRequestWithDetails(
      element.id,
      sandboxDetails.data.data
    );
  }
}

refreshSandboxStatus();
