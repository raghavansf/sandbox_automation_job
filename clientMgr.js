//Abstraction of AccountMgr to  provision clients
import axios from 'axios';
import querystring from 'querystring';

const ACCOUNTMANAGER_TOKEN =
  process.env.ACCOUNT_MANAGER_HOST + process.env.ACCOUNT_MANAGER_TOKEN_PATH;

const mgrClientCredentials = {
  clientID: process.env.ADMIN_CLIENT_ID,
  clientSecret: process.env.ADMIN_CLIENT_PASSWORD,
  grantType: { grant_type: 'client_credentials' },
};
const CLIENT_CREATION_PAYLOAD = {
  name: 'OpenID Connect - Client Id',
  description: 'OpenID Connect - Client Id',
  jwtPublicKey: '',
  redirectUrls: ['http://localhost/'],
  scopes: ['openid', 'roles', 'profile', 'tenantFilter'],
  organizations: ['Salesforce'],
  active: true,
  // versionControl: ['allow abcd_sbx', 'allow uteg_*'],
  roles: [],
  roleTenantFilter: '',
  roleTenantFilterMap: {},
  password: 'Commerce@2022',
  tokenEndpointAuthMethod: 'client_secret_post',
};
export default class ClientMgr {
  async createNewClient() {
    //TODO Implementation
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
      console.log('Error occured during Access Token retrieval', error);
    }
  }
  async getAccessTokenByCredentials(clientCredentials) {
    try {
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
      console.log('Error occured during Access Token retrieval', error);
    }
  }
}
