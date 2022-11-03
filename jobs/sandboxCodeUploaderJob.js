import {} from 'dotenv/config';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import SandboxMgr from '../sandboxMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';
import * as fs from 'fs';
import webDav from 'sfcc-ci/lib/webdav.js';
import sfcc from 'sfcc-ci';
import ClientMgr from '../clientMgr.js';
import axios from 'axios';

const WEBDAV_INSTANCE_IMPEX = '/impex/src/instance';

async function uploadCodeToSandbox() {
  const provisionRequestMgr = new ProvisionRequestMgr();
  const sandboxMgr = new SandboxMgr();
  const clientMgr = new ClientMgr();

  const results = await provisionRequestMgr.findRequestByStatus(
    REQUEST_PROCESSING_STATUS.INITIATED
  );
  if (results.rowCount <= 0) {
    console.log('No Pending request for Sandbox - Code Upload');
    process.exit(0);
  }
  const provisionRequest = results.rows[0];
  const sandboxDetails = await sandboxMgr.getSandboxDetail(
    provisionRequest.sandbox_id
  );
  const provisionedSandbox = JSON.parse(provisionRequest.sandbox_details);
  sandboxDetails.data.clientConfig = provisionedSandbox.clientConfig;

  if ('started' === sandboxDetails.data.state) {
    if (!fs.existsSync(process.env.CODE_VERSION)) {
      const result = await axios.get('http://localhost:5000/download');
      console.log('File Not Exists hence skipping ....');
      process.exit(0);
    }

    await provisionRequestMgr.updateProvisionRequestWithDetails(
      provisionRequest.id,
      sandboxDetails.data
    );
    await clientMgr.updateClientRoles(
      provisionedSandbox.clientConfig.clientID,
      `${provisionedSandbox.realm}_${provisionedSandbox.instance}`
    );

    const clientCredentials = provisionedSandbox.clientConfig;

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
                process.exit(0);
              }
            }
          );
        }
      }
    );
  } else {
    console.log('No Pending Sandbox for Code Provisioning !!!');
    process.exit(0);
  }
}

uploadCodeToSandbox();
