import async from 'async';
import AWS from 'aws-sdk';
import * as fs from 'fs';
import {} from 'dotenv/config';

(async function () {
  try {
    const downloadbles = [
      { type: 'data', name: process.env.DATA_VERSION },
      { type: 'code', name: process.env.CODE_VERSION },
    ];
    console.log('Downloader Job started for Downloadables !!!');

    async
      .each(downloadbles, downloadFromS3)
      .then((result) => {
        console.log('Files Downloaded Successfully');
      })
      .catch((error) => {
        console.log('Error occured during download', error);
      });
  } catch (err) {
    console.log('Error occured while launching Job');
  }
})();

function downloadFromS3(downloadArtifact, callback) {
  console.log('Download Artifact', downloadArtifact);
  download(downloadArtifact.name, downloadArtifact.type)
    .then((result) => {
      console.log('Download Successful for type ', downloadArtifact.name);
      callback(null, `${downloadArtifact.type} download Successful`);
    })
    .catch((error) => {
      console.log('Error occured during download ', downloadArtifact.name);
      callback(error);
    });
}

function download(downloadArchive, downloadType) {
  console.log(`Download started for ${downloadType} - ${downloadArchive}`);
  return new Promise((resolve, reject) => {
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
      Key: `public/SFRA_CODE/${downloadArchive}`,
      Bucket:
        process.env.NODE_ENV === 'development'
          ? process.env.STORAGE_BUCKET_NAME
          : process.env.BUCKETEER_BUCKET_NAME,
    };

    console.log('Params', params);
    const rs = s3.getObject(params).createReadStream();
    const ws = fs.createWriteStream(downloadArchive);
    rs.on('error', reject);
    ws.on('error', reject);
    ws.on('close', () => {
      resolve(downloadArchive);
    });
    rs.pipe(ws);
  });
}
