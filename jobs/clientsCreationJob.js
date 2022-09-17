import ClientMgr from '../clientMgr.js';
import {} from 'dotenv/config';

// its TEST!!!
async function createAPIClients() {
  try {
    const clientMgr = new ClientMgr();
    const newClient = await clientMgr.createNewClient();
    await clientMgr.updateClientRoles(newClient.clientID, 'zzte_012');
  } catch (Error) {
    console.log('Error occured as part of Client creation', error);
  }
}

createAPIClients();
