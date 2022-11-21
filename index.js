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
import express from 'express';
import * as fs from 'fs';
import {} from 'dotenv/config';
import AWS from 'aws-sdk';

const app = express();

const bree = new Bree({
  jobs: [
    {
      name: 'sandboxProvisionerJob',
      interval: '100s',
    },
    {
      name: 'codedataDownloaderJob',
      interval: '300s',
    },
    { name: 'sandboxConfigurerJob', interval: '150s' },
  ],
});
app.use('/download', function (req, res) {
  console.log('Downloading lastest Code version from S3....');
  downloadFromS3();
  res.json({ message: 'Code Version Downloaded Successfully!!!' });
});
function downloadFromS3() {
  var s3 = new AWS.S3({
    accessKeyId:
      process.env.NODE_ENV === 'development'
        ? process.env.AWS_ACCESS_KEY_ID
        : process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey:
      process.env.NODE_ENV === 'development'
        ? process.env.AWS_SECRET_ACCESS_KEY
        : process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: process.env.STORAGE_REGION,
    s3ForcePathStyle: true,
  });
  console.log('S3 Bucket Instance Successful');

  var params = {
    Key: `public/SFRA_CODE/${process.env.CODE_VERSION}`,
    Bucket:
      process.env.NODE_ENV === 'development'
        ? process.env.STORAGE_BUCKET_NAME
        : process.env.BUCKETEER_BUCKET_NAME,
  };
  const rs = s3.getObject(params).createReadStream();
  const ws = fs.createWriteStream(process.env.CODE_VERSION);
  rs.pipe(ws);
}

var port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Our JobApp is running on port ${port}`);
});
console.log('Bree Scheduler for  Job(s) started!!');
const graceful = new Graceful({ brees: [bree] });
graceful.listen();
await bree.start();
