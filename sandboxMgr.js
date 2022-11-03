// Mgr class for all sandbox calls
import axios from 'axios';
import {} from 'dotenv/config';
import process from 'process';
import * as fs from 'fs';
import auth_sfcc from 'sfcc-ci/lib/auth.js';
import webDav from 'sfcc-ci/lib/webdav.js';

import ClientMgr from './clientMgr.js';
import { SANDBOX_RESOURCE_PROFILES } from './sandboxConstants.js';
import { SANDBOX_WEBDAV_PERMISSIONS } from './sandboxConstants.js';
import { SANDBOX_OCAPI_SETTINGS } from './sandboxConstants.js';
import { SITE_ARCHIVE_PAYLOAD } from './sandboxConstants.js';

const API_BASE = process.env.ADMIN_API_HOST + '/api/v1';
const API_SANDBOXES = API_BASE + '/sandboxes/';
const OCAPI_SITE_IMPORT_URI = process.env.OCAPI_SITE_IMPORT_URI;
const OCAPI_JOB_EXECUTION_STATUS_URI = process.env.OCAPI_JOB_EXECUTION_STATUS;
const WEBDAV_INSTANCE_IMPEX = '/impex/src/instance';

export default class SandboxMgr {
  async provisionNewSandbox(provisionRequest) {
    try {
      const clientMgr = new ClientMgr();
      const newClient = await clientMgr.createNewClient();
      console.log('ProvisionNew Sandbox Started ...');
      let ocapiSettings = SANDBOX_OCAPI_SETTINGS;
      let webdavPermissions = SANDBOX_WEBDAV_PERMISSIONS;
      ocapiSettings[0]['client_id'] = newClient.clientID;
      webdavPermissions[0]['client_id'] = newClient.clientID;

      let provisionRequestPayload = {
        realm: process.env.SFCC_REALM_ID,
        resourceProfile: SANDBOX_RESOURCE_PROFILES.MEDIUM,
        autoScheduled: true,
        ttl: process.env.SANDBOX_TTL,
        settings: {
          ocapi: ocapiSettings,
          webdav: webdavPermissions,
        },
      };
      const accessToken = await clientMgr.getAccessToken();
      const { data: sandboxInstanceResponse } = await axios.post(
        API_SANDBOXES,
        provisionRequestPayload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const sandboxDetails = sandboxInstanceResponse.data;
      sandboxDetails.clientConfig = {
        clientID: newClient.clientID,
        clientSecret: newClient.clientSecret,
        clientName: newClient.clientName,
      };

      //TODO:Append clientID/password with Sandbox Details or separate Column?? for future reference
      console.log('Sandbox provisioned details ', sandboxDetails);
      return sandboxDetails;
    } catch (error) {
      console.log('Error occured while provisioning new sandbox ', error);
    }
  }

  async configureSandboxWithSiteImport(sandboxDetails) {
    try {
      const clientMgr = new ClientMgr();
      const clientCredentials = sandboxDetails.clientConfig;
      clientCredentials.grantType = `grant_type=client_credentials`;
      console.log(
        'Client Credentials from Provisioned Sandbox ',
        clientCredentials
      );
      const clientAccessToken = await clientMgr.getAccessTokenByCredentials(
        clientCredentials
      );

      //trigger OCAPI Site Import Job with File name
      let siteArchive = SITE_ARCHIVE_PAYLOAD;
      siteArchive.file_name = process.env.CODE_VERSION;
      const jobExecutionResponse = await axios.post(
        `${sandboxDetails.links.ocapi}`.concat(OCAPI_SITE_IMPORT_URI),
        siteArchive,
        {
          headers: { Authorization: `Bearer ${clientAccessToken}` },
        }
      );

      if (202 === jobExecutionResponse.status) {
        console.log(
          'SiteImport Job Launched for Execution',
          jobExecutionResponse.data.id
        );
        let jobStatus = jobExecutionResponse.data.status;

        while (jobStatus === 'PENDING') {
          const { data: response } = await axios.get(
            `${sandboxDetails.links.ocapi}${OCAPI_JOB_EXECUTION_STATUS_URI}/${jobExecutionResponse.data.id}`,
            {
              headers: { Authorization: `Bearer ${clientAccessToken}` },
            }
          );
          if (
            response.execution_status === 'finished' &&
            (response.status == 'OK' || response.status == 'ERROR')
          ) {
            console.log('job execution completed ', response);
            jobStatus = response.status;
            return jobStatus;
          } else {
            setTimeout(function () {
              console.log(
                'Job execution Not Completed hence waiting ......',
                response.status
              );
            }, 10000);
          }
        }
      }
    } catch (error) {
      console.log('Error occured during Site Import', error);
    }
  }
  async configureSandboxWithUsers(provisionRequestDetails, sandboxDetails) {
    try {
      const clientMgr = new ClientMgr();

      const usersToCreate = {
        users: [
          {
            firstName: provisionRequestDetails.first_name,
            lastName: provisionRequestDetails.last_name,
            mail: provisionRequestDetails.email_address,
            sandboxRealmInstance: `${sandboxDetails.realm}_${sandboxDetails.instance}`,
          },
        ],
      };
      const userCreationResponse = await clientMgr.createUsers(usersToCreate);
    } catch (error) {
      console.log('Error occured while provisioning users for sandbox', error);
    }
  }
  async getSandboxDetail(sandboxId) {
    const clientMgr = new ClientMgr();
    try {
      const accessToken = await clientMgr.getAccessToken();
      const { data: sandboxDetails } = await axios.get(
        `${API_SANDBOXES}${sandboxId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return sandboxDetails;
    } catch (error) {
      console.log('Error occured while retrieiving Sandbox details', error);
    }
  }
  /**
   * Use this method with CAUTION
   * @param {*} sandboxId
   * @returns
   */
  async deleteSandbox(sandboxId) {
    const clientMgr = new ClientMgr();
    try {
      const accessToken = await clientMgr.getAccessToken();
      const sandboxDetails = await axios.delete(
        `${API_SANDBOXES}${sandboxId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return sandboxDetails;
    } catch (error) {
      console.log('Error occured while deleting Sandbox details', error);
      let sandboxResponse = {
        data: { code: 404, message: error.stack },
      };
      return sandboxResponse;
    }
  }
  async renewSandbox(renewRequest) {
    console.log('Method to be implemented for RENEWAL!!!');
  }
}
