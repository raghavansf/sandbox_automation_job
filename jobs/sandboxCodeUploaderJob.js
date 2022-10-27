import { parentPort } from 'worker_threads';
import {} from 'dotenv/config';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';
import * as fs from 'fs';
import webDav from 'sfcc-ci/lib/webdav.js';
import sfcc from 'sfcc-ci';
import ClientMgr from '../clientMgr.js';

const WEBDAV_INSTANCE_IMPEX = '/impex/src/instance';

async function uploadCodeToSandbox() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const sandboxMgr = new SandboxMgr();
  const clientMgr = new ClientMgr();

  const results = await provisionRequestMgr.findRequestInProgress(
    REQUEST_PROCESSING_STATUS.INITIATED,
    REQUEST_PROCESSING_STATUS.CODEPROVISIONED
  );
  if (results.rowCount <= 0) {
    console.log('No Pending request for Sandbox - Code Upload');
    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
  }
  const provisionRequest = results.rows[0];
  const sandboxDetails = await sandboxMgr.getSandboxDetail(
    provisionRequest.sandbox_id
  );
  console.log('Sandbox Details ', sandboxDetails);
  const provisionedSandbox = JSON.parse(provisionRequest.sandbox_details);
  sandboxDetails.data.clientConfig = provisionedSandbox.clientConfig;

  if ('started' === sandboxDetails.data.state) {
    await provisionRequestMgr.updateProvisionRequestWithDetails(
      provisionRequest.id,
      sandboxDetails.data
    );
    await clientMgr.updateClientRoles(
      provisionedSandbox.clientConfig.clientID,
      `${provisionedSandbox.realm}_${provisionedSandbox.instance}`
    );

    const clientCredentials = provisionedSandbox.clientConfig;

    console.log('Client Credentials', clientCredentials);
    if (!fs.existsSync(process.env.CODE_VERSION)) {
      console.log('File Not Exists hence skipping ....');
      return;
    }
    console.log('Provisioned Sandbox ', provisionedSandbox);

    sfcc.auth.auth(
      clientCredentials.clientID,
      clientCredentials.clientSecret,
      (err, token) => {
        if (err) console.log('Error occuring during SFCC Auth Auth');
        else {
          webDav.postFile(
            provisionedSandbox.hostName,
            WEBDAV_INSTANCE_IMPEX,
            process.env.CODE_VERSION,
            token,
            true,
            null,
            (err, res) => {
              if (err) console.error('err ', err);
              else {
                provisionRequestMgr.updateProvisionRequestWithStatus(
                  provisionRequest.id,
                  REQUEST_PROCESSING_STATUS.CODEPROVISIONED
                );
                console.log('WebDAV Code Upload Successful', res);
                //TODO: update Provision Request with  Status "SANDBOX_CODE_PROVISIONED"
                if (parentPort) parentPort.postMessage('done');
                else process.exit(0);
              }
            }
          );
        }
      }
    );
    /*
    auth_sfcc.auth(
      clientCredentials.clientID,
      clientCredentials.clientSecret,
      null,
      null,
      true
    );
    */
  } else {
    console.log('No Pending Sandbox  for Code Provisioning !!!');
    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
  }
}

uploadCodeToSandbox();
