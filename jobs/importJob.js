import AWS from 'aws-sdk';
import {} from 'dotenv/config';


var s3  = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.STORAGE_REGION,
    s3ForcePathStyle: true
});

var params = {
    Key: 'public/SFRA_CODE/SFRA_Sandbox.zip',
    Bucket: process.env.NODE_ENV === 'development' ? process.env.STORAGE_BUCKET_NAME : process.env.BUCKETEER_BUCKET_NAME
};

s3.getObject(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else console.log('The ObjectOutput from S3 - ', data);
});

