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
const CODE_ARCHIVE = 'SFRA_UPC_09_06_2022.zip';
const CODE_ARCHIVE_NAME = 'SFRA_UPC_09_06_2022';

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

    await clientMgr.updateClientRoles(
      provisionedSandbox.clientConfig.clientID,
      `${provisionedSandbox.realm}_${provisionedSandbox.instance}`
    );

    const clientCredentials = provisionedSandbox.clientConfig;

    console.log('Provisioned Sandbox ', provisionedSandbox);
    /*
    sfcc.auth.auth(
      clientCredentials.clientID,
      clientCredentials.clientSecret,
      (err, token) => {
        if (err) {
          console.log('SFCC Auth Failure', err);
        } else {
          sfcc.instance.upload(
            provisionedSandbox.hostName,
            process.env.DATA_VERSION,
            token,
            null,
            (err, res) => {
              if (err) console.log('InstanceData Upload error');
              else {
                console.log('InstanceData Upload Successful');
              }
            }
          );
        }
      }
    );
    */

    sfcc.auth.auth(
      clientCredentials.clientID,
      clientCredentials.clientSecret,
      (err, token) => {
        if (err) {
          console.log('SFCC Auth Failure', err);
        } else {
          sfcc.code.deploy(
            provisionedSandbox.hostName,
            CODE_ARCHIVE,
            token,
            null,
            (err, res) => {
              if (err) console.log('CodeArchive Upload error');
              else {
                console.log('CodeArchive Upload Successful');
                sfcc.code.activate(
                  provisionedSandbox.hostName,
                  CODE_ARCHIVE_NAME,
                  token,
                  (err, res) => {
                    if (err) console.log('Code Activation failed', err);
                    else {
                      console.log('Code Activation Successful', res);
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  }
}

uploadCodeToSandbox();
