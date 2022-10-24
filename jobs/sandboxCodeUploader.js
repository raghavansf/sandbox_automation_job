import { parentPort } from 'worker_threads';
import {} from 'dotenv/config';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';
import * as fs from 'fs';
import auth_sfcc from 'sfcc-ci/lib/auth.js';
import webDav from 'sfcc-ci/lib/webdav.js';

const WEBDAV_INSTANCE_IMPEX = '/impex/src/instance';

async function uploadCodeToSandbox() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const sandboxMgr = new SandboxMgr();

  const results = await provisionRequestMgr.findRequestInProgress();
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
  console.log('provisioned sandbox ', provisionedSandbox);
  sandboxDetails.data.clientConfig = provisionedSandbox.clientConfig;

  if (
    'started' === sandboxDetails.data.state &&
    REQUEST_PROCESSING_STATUS.COMPLETED !=
      provisionRequest.request_processing_status
  ) {
    const provisionedSandbox = JSON.parse(provisionRequest.sandbox_details);
    await provisionRequestMgr.updateProvisionRequestWithDetails(
      provisionRequest.id,
      sandboxDetails.data
    );
    const clientCredentials = provisionedSandbox.clientConfig;

    console.log('Client Credentials', clientCredentials);
    if (!fs.existsSync(process.env.CODE_VERSION)) {
      console.log('File Not Exists hence skipping ....');
      return;
    }
    console.log(
      'File Exists and hence proceeding ..',
      provisionedSandbox.hostName
    );

    auth_sfcc.auth(
      clientCredentials.clientID,
      clientCredentials.clientSecret,
      null,
      null,
      true
    );
    console.log('SFCC Auth Successful', auth_sfcc.getToken());

    await provisionRequestMgr.updateProvisionRequestWithStatus(
      provisionRequest.id,
      REQUEST_PROCESSING_STATUS.CODEPROVISIONED
    );
    webDav.postFile(
      provisionedSandbox.hostName,
      WEBDAV_INSTANCE_IMPEX,
      process.env.CODE_VERSION,
      auth_sfcc.getToken(),
      true,
      null,
      (err, res) => {
        if (err) console.error('err ', err);
        else {
          console.log('WebDAV Code Upload Successful');
          //TODO: update Provision Request with  Status "SANDBOX_CODE_PROVISIONED"
          if (parentPort) parentPort.postMessage('done');
          else process.exit(0);
        }
      }
    );
  }
}

uploadCodeToSandbox();
