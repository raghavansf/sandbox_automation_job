/**
 * Job will hold any worker pool if it needs to  based on processing need
 *  and Provisioner will be invoked from  either Worker/NonWorker context
 *
 */

import ProvisionRequestMgr from '../provisionRequestMgr.js';
import {} from 'dotenv/config';
import SandboxMgr from '../sandboxMgr.js';
import process from 'process';
import ClientMgr from '../clientMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';

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

    const clientMgr = new ClientMgr();
    const userExists = await clientMgr.isUserExists(element.email_address);

    if (userExists) {
      console.log(
        'User Already exists hence not proceeding for Sandbox Proivisoning'
      );
      await provisionRequestMgr.updateProvisionRequestWithStatus(
        provisionRequest.id,
        REQUEST_PROCESSING_STATUS.NOTPROVISIONED
      );
      await clientMgr.updateConnectedAppWithSandboxDetails(
        provisionRequest.id,
        {
          status: `Sandbox Not Provisioned Since User ${element.email_address} Already Exists`,
        }
      );
    } else {
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
  }

  process.exit();
}

provisionSandBoxes();
