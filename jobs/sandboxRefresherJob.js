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
    console.log('Sandbox details ', sandboxDetails);

    if ('started' === sandboxDetails.data.state) {
      //TODO:Need to  see if code is already imported , avoid importing again
      const provisionRequest = element;
      //TODO:Uncomment below once other activities are completed
      //  await sandboxMgr.configureSandboxWithUsers(provisionRequest);
      //TODO: post successful update provision request with User details
      // await sandboxMgr.configureSandboxWithCode(provisionRequest);
    }

    // See how we can retain Client Config  as newly updated Sandbox details will not contain

    await provisionRequestMgr.updateProvisionRequestWithDetails(
      element.id,
      sandboxDetails.data
    );
  }
}

refreshSandboxStatus();
