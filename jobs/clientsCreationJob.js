import SandboxMgr from '../sandboxMgr.js';
async function createAPIClients() {
  try {
    const sandboxMgr = new SandboxMgr();
    const provisionRequest = {};
    const sandboxDetails = await sandboxMgr.provisionNewSandbox(
      provisionRequest
    );
  } catch (Error) {
    console.log('Error occured as part of Client creation', Error.stack);
  }
}

createAPIClients();
