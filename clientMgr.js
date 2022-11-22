//Abstraction of AccountMgr to  provision clients
import axios from 'axios';
import {} from 'dotenv/config';
import { USER_CREATION_PAYLOAD } from './payloadConstants.js';
import { CLIENT_CREATION_PAYLOAD } from './payloadConstants.js';
import { USER_ACTIVATION_PAYLOAD } from './payloadConstants.js';
import { ADMIN_CLIENT_CREDENTIALS_PAYLOAD } from './payloadConstants.js';
import qs from 'qs';

const ACCOUNTMANAGER_TOKEN =
  process.env.ACCOUNT_MANAGER_HOST + process.env.ACCOUNT_MANAGER_TOKEN_PATH;
const NEW_API_CLIENT =
  process.env.ACCOUNT_MANAGER_HOST + process.env.API_CLIENT_CREATION_PATH;
const UPDATE_API_CLIENT =
  process.env.ACCOUNT_MANAGER_HOST + process.env.API_CLIENT_UPDATION_PATH;
const USER_ENDPOINT = process.env.ACCOUNT_MANAGER_HOST + process.env.USERS_URI;

export default class ClientMgr {
  async updateConnectedAppWithSandboxDetails(requestId, provisionedSandbox) {
    try {
      const accessToken = await this.getConnectedAppToken();
      const responseData = {};
      responseData.Status__c = 'success';
      responseData.message__c = provisionedSandbox;
      const { data: response } = await axios.patch(
        `${process.env.CONNECTEDAPP_SANDBOX_UPDATE_URI}${requestId}`,
        responseData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('Response from connected app', response);
    } catch (error) {
      console.log('Error occured while updating status to ConnectedApp', error);
    }
  }
  async getConnectedAppToken() {
    try {
      const { data: response } = await axios({
        method: 'POST',
        url: process.env.CONNECTEDAPP_TOKEN_URI,
        withCredentials: true,
        crossdomain: true,
        data: qs.stringify({
          username: process.env.CONNECTEDAPP_USERNAME,
          password: process.env.CONNECTEDAPP_PASSWORD,
          client_id: process.env.CONNECTEDAPP_CLIENTID,
          client_secret: process.env.CONNECTEDAPP_CLIENTSECRET,
          grant_type: process.env.CONNECTEDAPP_GRANTTYPE,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.access_token;
    } catch (error) {
      console.log(
        'Error occured while getting Access token for Connected App',
        error
      );
    }
  }
  async createUsers(usersToCreate) {
    try {
      const adminAccessToken = await this.getAccessToken();
      for (const user of usersToCreate.users) {
        const newUserPayload = USER_CREATION_PAYLOAD;
        newUserPayload.mail = user.mail;
        newUserPayload.firstName = user.firstName;
        newUserPayload.lastName = user.lastName;

        //TODO: Commented to see if User display happening in Account Manager
        /*
        let roleTenantFilters = '';
        for (const role of USER_CREATION_PAYLOAD.roles) {
          roleTenantFilters += `${role}:${user.sandboxRealmInstance};`;
        }
        newUserPayload.roleTenantFilter = roleTenantFilters;
        */

        const userCreationResponse = await axios.post(
          USER_ENDPOINT,
          newUserPayload,
          {
            headers: { Authorization: `Bearer ${adminAccessToken}` },
          }
        );
        /*
        const activateUserPayload = USER_ACTIVATION_PAYLOAD;
        activateUserPayload.roleTenantFilter = roleTenantFilters;

        await axios.put(
          USER_ENDPOINT + `/${userCreationResponse.data.id}`,
          activateUserPayload,
          {
            headers: { Authorization: `Bearer ${adminAccessToken}` },
          }
        );
        */
      }

      return {};
    } catch (error) {
      console.log('Error occured during User Creation for Users', error);
    }
  }
  async updateClientRoles(clientId, sandboxRealmInstance) {
    try {
      const adminAccessToken = await this.getAccessToken();
      let roleTenantFilters = '';
      for (const role of CLIENT_CREATION_PAYLOAD.roles) {
        roleTenantFilters += `${role}:${sandboxRealmInstance};`;
      }
      const { data: response } = await axios.put(
        `${UPDATE_API_CLIENT}/${clientId}`,
        { roleTenantFilter: roleTenantFilters, stateless: true },
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      console.log(
        'Role Assignments Updated Successfully for clientID',
        clientId
      );
    } catch (error) {
      console.log('Error occured while updating RoleAssignments', error);
    }
  }

  async createNewClient() {
    try {
      const adminAccessToken = await this.getAccessToken();
      const { data: response } = await axios.post(
        NEW_API_CLIENT,
        CLIENT_CREATION_PAYLOAD,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      const newClientDetails = {
        clientID: response.id,
        clientName: response.name,
        clientSecret: CLIENT_CREATION_PAYLOAD.password,
        links: response.links,
        grantType: `grant_type=client_credentials`,
      };
      console.log('New API Client created successfully', newClientDetails);

      return newClientDetails;
    } catch (error) {
      console.log('Error occured during  New API Client Creation ', error);
    }
  }
  async getAccessToken() {
    try {
      const { data: response } = await axios.post(
        ACCOUNTMANAGER_TOKEN,
        ADMIN_CLIENT_CREDENTIALS_PAYLOAD.grantType,
        {
          headers: {
            Accept: 'application.json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: ADMIN_CLIENT_CREDENTIALS_PAYLOAD.clientID,
            password: ADMIN_CLIENT_CREDENTIALS_PAYLOAD.clientSecret,
          },
        }
      );
      const accessToken = response.access_token;
      return accessToken;
    } catch (error) {
      console.log('Error occured during Admin Access Token retrieval', error);
    }
  }
  async getAccessTokenByCredentials(clientCredentials) {
    try {
      const { data: response } = await axios.post(
        ACCOUNTMANAGER_TOKEN,
        clientCredentials.grantType,
        {
          headers: {
            Accept: 'application.json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: clientCredentials.clientID,
            password: clientCredentials.clientSecret,
          },
        }
      );
      const accessToken = response.access_token;
      return accessToken;
    } catch (error) {
      console.log(
        'Error occured during Access Token By Credentials retrieval',
        error
      );
    }
  }
}
