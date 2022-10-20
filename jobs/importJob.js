/**
 * Current Solution
 * using test clientId and the Sandbox APIUser associated to it
 * using sfcc-ci
 * auth through auth.js with the flag renewal in case the auth needs to be renew(it does not seem to throw an err anymore)
 * postFile through webdav.js using a token generated at the time of the call with auth.getToken(), otherwise getting a token issue and will have to renew auth too
 * job interval is set to 15mins
 * flow -> code_zip has been manually uploaded to S3(Bucketeer) in the public folder - that is the only one accessible
 *      -> extract and save the code_zip locally in fs(it has to be in fs, tried memfs but path seems to throw err)
 *      -> upload code_zip to the instance
 *      -> delete the local file
 */

 import AWS from 'aws-sdk';
 import {} from 'dotenv/config';
 import process from 'process';
 // import request from 'request';

 import * as fs from 'fs';

 import sfcc, { auth, webdav } from 'sfcc-ci';
 import ocapi from 'sfcc-ci/lib/ocapi.js';
 import auth_sfcc from 'sfcc-ci/lib/auth.js';
 import webDav from 'sfcc-ci/lib/webdav.js';

 // import { fs } from 'memfs';

 // const WEBDAV_BASE = '/on/demandware.servlet/webdav/Sites';
 // const WEBDAV_INSTANCE_IMPEX = '/on/demandware.servlet/webdav/Sites/impex/src/instance';
 const WEBDAV_INSTANCE_IMPEX = '/impex/src/instance';
 // const WEBDAV_CODE = '/cartridges';
 // const WEBDAV_CARTRIDGES_PATH = '/on/demandware.servlet/webdav/Sites/cartridges';

 // const instanceToDeployTo = 'bbsv-303.sandbox.us02.dx.commercecloud.salesforce.com'
 const clientId = 'dd204fc7-d094-425c-af91-f12f5db14f6a'

 var s3  = new AWS.S3({
     accessKeyId: process.env.NODE_ENV === 'development' ? process.env.AWS_ACCESS_KEY_ID : process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.NODE_ENV === 'development' ? process.env.AWS_SECRET_ACCESS_KEY : process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
     region: 'eu-west-1',
     s3ForcePathStyle: true
 });

var params = {
     Key: 'public/SFRA_CODE/SFRA_Sandbox.zip',
     Bucket: process.env.NODE_ENV === 'development' ? process.env.STORAGE_BUCKET_NAME : process.env.BUCKETEER_BUCKET_NAME
 };

 //
 // --- WORKING WITH LOCAL FILE ---
 //
 auth_sfcc.auth(clientId, process.env.TO_CLIENT_SECRET, null, null, true);

 const rs = s3.getObject(params).createReadStream();
 const ws = fs.createWriteStream('SFRA_Sandbox.zip');
 rs.pipe(ws);

 var file = 'SFRA_Sandbox.zip';

 setTimeout(() => {
     webDav.postFile(process.env.TO_INSTANCE, WEBDAV_INSTANCE_IMPEX, file, auth_sfcc.getToken(), true, null, (err, res) => {
         if (err) console.error('ERR ', err);
         else console.log('RES SUCCESS');
     });
 }, 3600);

 setTimeout(() => {
     fs.unlink('SFRA_Sandbox.zip',function(err){
         if(err) return console.log(err);
         console.log('The local file has been deleted successfully');
    });
 }, 4800);
