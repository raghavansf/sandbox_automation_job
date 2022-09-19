/**
 * 1) keep running(for local testing)
 * 2) Initiate Workers for processing
 * 3) Pull the non-processed records from DB
 * 4) Split and Assign --> new  provision / update provision
 * 5) New Provision ==>
 *   Provision new ClientID  + User
 *   Call sfcc-ci as API to  provision
 *   Post Provision --> Upload / Configure SFRA Code to make the Storefront Up and Running
 * 6) Update Provision ==>
 *      Delete the Provisioned Sandbox
 *      Renew the Provisioned Sandbox
 * 7) Send communication to CORE for updating the status (CORE Endpoint to be known!!)
 */

import Bree from 'bree';
import Graceful from '@ladjs/graceful';

const bree = new Bree({
  jobs: [
    {
      name: 'sandboxProvisionerJob',
      interval: '10s',
    },
    {
      name: 'sandboxRefresherJob',
      interval: '40s',
    },
  ],
});
console.log('Bree Scheduler for  Job(s) started!!');
const graceful = new Graceful({ brees: [bree] });
graceful.listen();
await bree.start();
