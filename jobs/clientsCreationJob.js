import ClientMgr from '../clientMgr.js';
import {} from 'dotenv/config';

// its TEST!!!
async function createAPIClients() {
  try {
    const ClientCredentials = {
      clientID: process.env.ADMIN_CLIENT_ID,
      clientSecret: process.env.ADMIN_CLIENT_PASSWORD,
      grantType: { grant_type: 'client_credentials' },
    };
    const clientMgr = new ClientMgr();
    const accessToken = await clientMgr.getAccessToken();
    console.log('Access Token ', accessToken);
    const credentialAccessToken = await clientMgr.getAccessTokenByCredentials(
      ClientCredentials
    );
    console.log('Client Credentials Access Token ', credentialAccessToken);
  } catch (Error) {
    console.log('Error occured as part of Client creation', error);
  }
}

createAPIClients();
