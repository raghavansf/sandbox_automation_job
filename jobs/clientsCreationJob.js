import ClientMgr from '../clientMgr.js';
import {} from 'dotenv/config';

// its TEST!!!
async function createAPIClients() {
  try {
    const ClientCredentials = {
      clientID: process.env.ADMIN_CLIENT_ID,
      clientSecret: process.env.ADMIN_CLIENT_PASSWORD,
      grantType: `grant_type=client_credentials`,
    };
    const clientMgr = new ClientMgr();
    const adminAccessToken = await clientMgr.getAccessToken();
    console.log('Admin Access Token ', adminAccessToken);
    const accessToken = await clientMgr.getAccessTokenByCredentials(
      ClientCredentials
    );
    console.log(' Access Token ', accessToken);
  } catch (Error) {
    console.log('Error occured as part of Client creation', error);
  }
}

createAPIClients();
