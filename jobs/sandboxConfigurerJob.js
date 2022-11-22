import async from 'async';
import ProvisionRequestMgr from '../provisionRequestMgr.js';
import { REQUEST_PROCESSING_STATUS } from '../constants.js';
import sfcc from 'sfcc-ci';
import SandboxMgr from '../sandboxMgr.js';
import ClientMgr from '../clientMgr.js';

(async function () {
  try {
    const provisionRequestMgr = new ProvisionRequestMgr();
    const results = await provisionRequestMgr.findRequestByStatus(
      REQUEST_PROCESSING_STATUS.INITIATED
    );
    async
      .each(results.rows, invokeProvisioningSteps)
      .then((result) => {
        console.log('All requests processed successfully', result);
        process.exit(0);
      })
      .catch((err) => {
        //TODO: How to avoid one of the request error /success and not exit till others complete ..
        console.log("One or more ProvisioningRequests didn't processed", err);
        process.exit(0);
      });
  } catch (error) {}
})();

function isSandboxStarted(request, callback) {
  const sandboxMgr = new SandboxMgr();
  const sandboxDetails = sandboxMgr
    .getSandboxDetail(request.sandbox_id)
    .then((result) => {
      const { data } = result;
      if (data.state == 'started') {
        console.log(
          'Sandbox is in Started State!!!!. Hence forwarding with Other Provisioning Steps for Request',
          request.id
        );
        callback(null, request, 'SUCCESS');
      } else {
        callback(
          `${request.sandbox_id} Not Proceeding for Provisioning since not in started state`
        );
      }
    });
}

function invokeProvisioningSteps(request, asyncLoopCallback) {
  console.log('Configuring Process started for Sandbox -', request.sandbox_id);
  try {
    let results = async.waterfall(
      [
        async.apply(isSandboxStarted, request),
        uploadData,
        importData,
        runProductIndex,
        runContentIndex,
        uploadCode,
        activateCode,
        updateClientRoles,
        createUsers,
        updateSandboxStatus,
        updateStatus,
      ],
      function (err) {
        if (err) {
          console.log(err);
          asyncLoopCallback(err);
        } else
          asyncLoopCallback(
            null,
            `Provision Request Completed For Sandbox - ${request.sandbox_id}`
          );
      }
    );
  } catch (error) {}
}

function runContentIndex(request, provisionedSandbox, callback) {
  console.log('ContenIndexing Started for Sandbox  ', request.sandbox_id);
  const sandboxMgr = new SandboxMgr();
  sandboxMgr
    .runIndexJob(process.env.OCAPI_CONTENTINDEX_URI, provisionedSandbox)
    .then((result) => {
      console.log('ContenIndexing Completed for Sandbox ', request.sandbox_id);
      callback(null, request, provisionedSandbox);
    })
    .catch((err) => {
      console.log(
        'Error Occured while ContentIndexing in Sandbox',
        request.sandbox_id
      );
      callback(
        `SandboxProvision failed in ContenIndexing for Sandbox Id - ${request.sandbox_id}`
      );
    });
}

function runProductIndex(request, provisionedSandbox, callback) {
  console.log('ProductIndexing Started for Sandbox  ', request.sandbox_id);
  const sandboxMgr = new SandboxMgr();
  sandboxMgr
    .runIndexJob(process.env.OCAPI_PRODUCTINDEX_URI, provisionedSandbox)
    .then((result) => {
      console.log('ProductIndexing Completed for Sandbox ', request.sandbox_id);
      callback(null, request, provisionedSandbox);
    })
    .catch((err) => {
      console.log(
        'Error Occured while running ProductIndexing  Sandbox',
        request.sandbox_id
      );
      callback(
        `SandboxProvision failed in ProductIndexing for Sandbox Id - ${request.sandbox_id}`
      );
    });
}

function createUsers(request, provisionedSandbox, callback) {
  console.log('Users Creation Started for Sandbox  ', request.sandbox_id);
  const sandboxMgr = new SandboxMgr();
  sandboxMgr
    .configureSandboxWithUsers(request, provisionedSandbox)
    .then((result) => {
      console.log('Users Creation Completed for Sandbox  ', request.sandbox_id);
      callback(null, request, provisionedSandbox);
    });
}

function updateSandboxStatus(request, provisionedSandbox, callback) {
  console.log('AppStatus Update Started for Sandbox  ', request.sandbox_id);
  const clientMgr = new ClientMgr();
  clientMgr
    .updateConnectedAppWithSandboxDetails(
      request.id,
      JSON.stringify(provisionedSandbox)
    )
    .then((result) => {
      console.log(
        'App Status Updated Successfully for Sandbox',
        request.sandbox_id
      );
      callback(null, request);
    })
    .catch((error) => {
      console.log('Error occured while updating AppStatus');
    });
}

function updateClientRoles(request, provisionedSandbox, callback) {
  console.log('ClientRoles  Updation started for Sandbox', request.sandbox_id);
  const clientMgr = new ClientMgr();
  clientMgr
    .updateClientRoles(
      provisionedSandbox.clientConfig.clientID,
      `${provisionedSandbox.realm}_${provisionedSandbox.instance}`
    )
    .then((result) => {
      console.log(
        'ClientRoles Updation Completed for Sandbox',
        request.sandbox_id
      );
      callback(null, request, provisionedSandbox);
    });
}

function importData(request, provisionedSandbox, callback) {
  console.log('Running SiteImport Started for Sandbox  ', request.sandbox_id);
  const sandboxMgr = new SandboxMgr();
  sandboxMgr
    .configureSandboxWithSiteImport(provisionedSandbox)
    .then((result) => {
      console.log('SiteImport Completed for Sandbox ', request.sandbox_id);
      callback(null, request, provisionedSandbox);
    })
    .catch((err) => {
      console.log(
        'Error Occured while Importing SiteData for Sandbox',
        request.sandbox_id
      );
      callback(
        `SandboxProvision failed in SiteImport for Sandbox Id - ${request.sandbox_id}`
      );
    });
}

function uploadData(request, status, callback) {
  console.log('SiteData Uploading Started for Sandbox - ', request.sandbox_id);
  const provisionedSandbox = JSON.parse(request.sandbox_details);
  const clientCredentials = provisionedSandbox.clientConfig;
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
            if (err) {
              console.log('Data Upload to Sandbox Failed', err);
              callback(
                `${request.sandbox_id} Not Proceeding for Provisioning since DataUpload Failed`
              );
            } else {
              console.log(
                'SiteData Upload Completed for Sandbox',
                request.sandbox_id
              );
              callback(null, request, provisionedSandbox);
            }
          }
        );
      }
    }
  );
}

function uploadCode(request, provisionedSandbox, callback) {
  console.log('Code  Uploading Started for Sandbox', request.sandbox_id);
  const clientCredentials = provisionedSandbox.clientConfig;
  sfcc.auth.auth(
    clientCredentials.clientID,
    clientCredentials.clientSecret,
    (err, token) => {
      if (err) {
        console.log('SFCC Auth Failure', err);
      } else {
        sfcc.code.deploy(
          provisionedSandbox.hostName,
          process.env.CODE_VERSION,
          token,
          null,
          (err, res) => {
            if (err) {
              console.log('Error occured while Uploading Code', err);
              callback(
                `${request.sandbox_id} Not Proceeding for Provisioning since CodeUpload Failed`
              );
            } else {
              console.log(
                'Code Upload  Completed for Sandbox',
                request.sandbox_id
              );
              callback(null, request, provisionedSandbox);
            }
          }
        );
      }
    }
  );
}
function activateCode(request, provisionedSandbox, callback) {
  console.log('Activating  code Started for Sandbox', request.sandbox_id);
  const clientCredentials = provisionedSandbox.clientConfig;
  const codeArchiveName = process.env.CODE_VERSION.substring(
    0,
    process.env.CODE_VERSION.lastIndexOf('.')
  );
  sfcc.auth.auth(
    clientCredentials.clientID,
    clientCredentials.clientSecret,
    (err, token) => {
      if (err) {
        console.log('SFCC Auth Failure', err);
      } else {
        sfcc.code.activate(
          provisionedSandbox.hostName,
          codeArchiveName,
          token,
          (err, res) => {
            if (err) {
              console.log('Error occured while Activating Code');
            } else {
              console.log(
                'Activating Code Completed for Sandbox',
                request.sandbox_id
              );
              callback(null, request, provisionedSandbox);
            }
          }
        );
      }
    }
  );
}
function updateStatus(request, callback) {
  console.log(
    'Updating the status for ProvisionRequest Started',
    request.sandbox_id
  );
  const provisionRequestMgr = new ProvisionRequestMgr();

  provisionRequestMgr
    .updateProvisionRequestWithStatus(
      request.id,
      REQUEST_PROCESSING_STATUS.COMPLETED
    )
    .then((result) => {
      console.log(
        'Provisioning Request Status Updation Completed for Id',
        request.sandbox_id
      );
      callback(null);
    });
}
