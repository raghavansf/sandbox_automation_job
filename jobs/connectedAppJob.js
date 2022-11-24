import ClientMgr from '../clientMgr.js';
(async function () {
  try {
    const usersToCreate = {
      users: [
        {
          firstName: 'Raghvan',
          lastName: 'NS',
          mail: 'raghavanns@gmail.com',
          sandboxRealmInstance: 'zzte_045',
        },
      ],
    };
    const clientMgr = new ClientMgr();
    clientMgr.isUserExists('rsrinivasa@salesforce.com');
    clientMgr.createUsers(usersToCreate);
  } catch (error) {
    console.log('Error occured while updating connected app ', error);
  }
})();
