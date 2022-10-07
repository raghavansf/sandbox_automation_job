/**
 * Current Stage
 * using my own clientId and the Sandbox APIUser associated to it for testing purposes
 * code_zip has been manually uploaded to S3(Bucketeer) in the public folder - that is the only one accessible
 * getting the http request options with ocapi.getOptions
 * postFile is using the options and creating a read stream for the object retrieved from the S3 bucket
 * job interval is set to 15mins, might need an increase
 */

import AWS from 'aws-sdk';
import {} from 'dotenv/config';
import process from 'process';
import request from 'request';

// import * as fs from 'fs';

import sfcc from 'sfcc-ci';
import ocapi from 'sfcc-ci/lib/ocapi.js';

const WEBDAV_BASE = '/on/demandware.servlet/webdav/Sites';
const WEBDAV_INSTANCE_IMPEX = '/impex/src/instance';
const WEBDAV_CODE = '/cartridges';
const WEBDAV_CARTRIDGES_PATH = '/on/demandware.servlet/webdav/Sites/cartridges';

const instanceToDeployTo = 'bbsv-303.sandbox.us02.dx.commercecloud.salesforce.com'
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

function postFile(options, callback) {
    var req = request(options, callback);
    // console.log('REQ ', req);

    const rs = s3.getObject(params, function (err, data) {
        if (err) console.error(err, err.stack);
        else console.log('The ObjectOutput from S3 - ', data);
    }).createReadStream();

    // console.log('READSTREAM ', rs);

    rs.pipe(req);
}


console.info('Start code upload');
sfcc.auth.auth(clientId, process.env.MY_CLIENT_SECRET, (err, token) => {
    // console.log('TOKEN ', token);

    var options = ocapi.getOptions(instanceToDeployTo, WEBDAV_CARTRIDGES_PATH, token, 'PUT');
    // console.log('OPTIONS ', options);

        postFile(options, function(err, res, body) {
            if (err) console.error(err, err.stack);
            else console.log('postFile ', res);
        })
});