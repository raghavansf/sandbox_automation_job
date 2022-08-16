import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';

async function deleteSandbox() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const results = await provisionRequestMgr.findDeleteProvisionRequests();
  const sandboxMgr = new SandboxMgr();

  if (results.rowCount <= 0) {
    return;
  }
  for (const element of results.rows) {
    const sandboxDetails = await sandboxMgr.deleteSandbox(element.sandbox_id);
    if (
      sandboxDetails.data.code == '404' ||
      sandboxDetails.data.code == '202'
    ) {
      const sandboxDeleted = await sandboxMgr.getSandboxDetail(
        element.sandbox_id
      );
      console.log('Sandbox Response ', sandboxDeleted);
      await provisionRequestMgr.updateProvisionRequestWithDetails(
        element.id,
        sandboxDeleted.data.data
      );
    }
  }
}

deleteSandbox();
