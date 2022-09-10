// Mgr class for all sandbox calls
import axios from 'axios';
import ClientMgr from './clientMgr.js';

const API_BASE = process.env.ADMIN_API_HOST + '/api/v1';
const API_SANDBOXES = API_BASE + '/sandboxes/';

const SANDBOX_RESOURCE_PROFILES = {
  MEDIUM: 'medium',
  LARGE: 'large',
  XLARGE: 'xlarge',
};

const SANDBOX_WEBDAV_PERMISSIONS = [
  {
    client_id: 'CLIENTID',
    permissions: [
      { path: '/impex', operations: ['read_write'] },
      { path: '/cartridges', operations: ['read_write'] },
      { path: '/static', operations: ['read_write'] },
    ],
  },
];

const SANDBOX_OCAPI_SETTINGS = [
  {
    client_id: 'CLIENTID',
    resources: [
      {
        resource_id: '/code_versions',
        methods: ['get'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
      {
        resource_id: '/code_versions/*',
        methods: ['patch', 'delete'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
      {
        resource_id: '/jobs/*/executions',
        methods: ['post'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
      {
        resource_id: '/jobs/*/executions/*',
        methods: ['get'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
      {
        resource_id: '/sites/*/cartridges',
        methods: ['post'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
    ],
  },
];

export default class SandboxMgr {
  async provisionNewSandbox(provisionRequest) {
    try {
      const clientMgr = new ClientMgr();
      const newClient = await clientMgr.createNewClient();
      //TODO: Admin Access token
      const accessToken = await clientMgr.getAccessToken();
      console.log('ProvisionNew Sandbox Started ...');
      let ocapiSettings = SANDBOX_OCAPI_SETTINGS;
      let webdavPermissions = SANDBOX_WEBDAV_PERMISSIONS;
      ocapiSettings[0]['client_id'] = newClient.clientID;
      webdavPermissions[0]['client_id'] = newClient.clientID;

      let provisionRequestPayload = {
        realm: process.env.SFCC_REALM_ID,
        resourceProfile: SANDBOX_RESOURCE_PROFILES.MEDIUM,
        autoScheduled: true,
        ttl: 24,
        settings: {
          ocapi: ocapiSettings,
          webdav: webdavPermissions,
        },
      };
      const sandboxInstanceResponse = await axios.post(
        API_SANDBOXES,
        provisionRequestPayload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      console.log('provision request payload', provisionRequestPayload);
      const sandboxDetails = sandboxInstanceResponse.data.data;
      console.log('Sandbox provisioned details ', sandboxDetails);
      return sandboxDetails;
    } catch (error) {
      console.log('Error occured while provisioning new sandbox ', error);
    }
  }
  async configureSandboxWithCode() {
    //TODO: implementation
  }
  async configureSandboxWithUsers() {
    //TODO: implementation
  }
  async getSandboxDetail(sandboxId) {
    const clientMgr = new ClientMgr();
    try {
      const accessToken = await clientMgr.getAccessToken();
      const sandboxDetails = await axios.get(`${API_SANDBOXES}${sandboxId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return sandboxDetails;
    } catch (error) {
      console.log(
        'Error occured while retrieiving Sandbox details',
        error.stack
      );
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
