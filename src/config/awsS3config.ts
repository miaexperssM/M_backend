const AWS = require('aws-sdk');

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;

AWS.config.setPromisesDependency(require('bluebird'));
AWS.config.update({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY, region: AWS_REGION });

const s3 = new AWS.S3();

export async function imageUpload(base64: string, trackingNumber: string) {
  const base64Data = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const params = {
    Bucket: S3_BUCKET,
    Key: `${trackingNumber}.jpg`, // type is not required
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64', // required
    ContentType: `image/jpg`, // required. Notice the back ticks
  };

  let location = '';
  let key = '';
  try {
    const { Location, Key } = await s3.upload(params).promise();
    location = Location;
    key = Key;
  } catch (error) {}

  return location;
}
