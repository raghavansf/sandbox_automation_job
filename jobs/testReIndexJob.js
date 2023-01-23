import ClientMgr from '../clientMgr.js';
import SandboxMgr from '../sandboxMgr.js';

(async function () {
  try {
    const sandboxMgr = new SandboxMgr();
    const clientMgr = new ClientMgr();

    const usersToCreate = {
      users: [
        {
          mail: 'ns.rags@gmail.com',
          firstName: 'Rags',
          lastName: 'N',
        },
      ],
    };

    await clientMgr.createUsers(usersToCreate);
  } catch (error) {}
})();
