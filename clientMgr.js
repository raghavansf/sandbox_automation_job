//Abstraction of AccountMgr to  provision clients
import axios from 'axios';
import querystring from 'querystring';
import {} from 'dotenv/config';
import { USER_CREATION_PAYLOAD } from './payloadConstants.js';
import { CLIENT_CREATION_PAYLOAD } from './payloadConstants.js';

const ACCOUNTMANAGER_TOKEN =
  process.env.ACCOUNT_MANAGER_HOST + process.env.ACCOUNT_MANAGER_TOKEN_PATH;
const NEW_API_CLIENT =
  process.env.ACCOUNT_MANAGER_HOST + process.env.API_CLIENT_CREATION_PATH;
const NEW_USER =
  process.env.ACCOUNT_MANAGER_HOST + process.env.USER_CREATION_PATH;

const mgrClientCredentials = {
  clientID: process.env.ADMIN_CLIENT_ID,
  clientSecret: process.env.ADMIN_CLIENT_PASSWORD,
  grantType: { grant_type: 'client_credentials' },
};

export default class ClientMgr {
  async createUsers(usersToCreate, activateUser = true) {
    try {
      const adminAccessToken = await this.getAccessToken();
      const userResponse = await axios.post(NEW_USER, USER_CREATION_PAYLOAD, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      console.log('CreateUsers:::User Created successfully ', userResponse);
    } catch (error) {
      console.log('Error occured during User Creation for APIClient', error);
    }
  }
  async createNewClient() {
    try {
      const adminAccessToken = await this.getAccessToken();
      const response = await axios.post(
        NEW_API_CLIENT,
        CLIENT_CREATION_PAYLOAD,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      const newClientDetails = {
        clientID: response.data.id,
        clientName: response.data.name,
        clientSecret: CLIENT_CREATION_PAYLOAD.password,
        links: response.data.links,
        grantType: { grant_type: 'client_credentials' },
      };
      console.log('New API Client created successfully', newClientDetails);

      return newClientDetails;

      console.log('new API Client response ', response);
    } catch (error) {
      console.log('Error occured during  New API Client Creation ', error);
    }
  }
  async getAccessToken() {
    try {
      const response = await axios.post(
        ACCOUNTMANAGER_TOKEN,
        querystring.stringify(mgrClientCredentials.grantType),
        {
          headers: {
            Accept: 'application.json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: mgrClientCredentials.clientID,
            password: mgrClientCredentials.clientSecret,
          },
        }
      );
      const accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      console.log('Error occured during Admin Access Token retrieval', error);
    }
  }
  async getAccessTokenByCredentials(clientCredentials) {
    try {
      console.log('Client Credentials ', clientCredentials);
      const response = await axios.post(
        ACCOUNTMANAGER_TOKEN,
        querystring.stringify(clientCredentials.grantType),
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
      const accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      console.log(
        'Error occured during Access Token By Credentials retrieval',
        error
      );
    }
  }
}
