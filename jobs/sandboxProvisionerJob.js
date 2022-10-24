/**
 * Job will hold any worker pool if it needs to  based on processing need
 *  and Provisioner will be invoked from  either Worker/NonWorker context
 *
 */

import ProvisionRequestMgr from '../provisionRequestMgr.js';
import {} from 'dotenv/config';
import SandboxMgr from '../sandboxMgr.js';
import process from 'process';

export async function provisionSandBoxes() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const results = await provisionRequestMgr.findNewProvisionRequests();

  if (results.rowCount <= 0) {
    process.exit();
  }
  console.log(
    'Number of Records found for New Provisioning ',
    results.rowCount
  );

  //Running sequentially one by one for provisioning .Need to change if required

  for (const element of results.rows) {
    console.log('Sandbox provisioning starting for Request- ', element.id);
    const provisionRequest = {
      id: element.id,
      clientID: process.env.ADMIN_CLIENT_ID,
    };

    const sandboxMgr = new SandboxMgr();
    const sandboxDetails = await sandboxMgr.provisionNewSandbox(
      provisionRequest
    );
    console.log(
      'Sandbox provisioning request initiation completed for Request-',
      element.id
    );
    await provisionRequestMgr.updateProvisionRequestWithDetails(
      provisionRequest.id,
      sandboxDetails
    );
  }

  process.exit();
}

provisionSandBoxes();
