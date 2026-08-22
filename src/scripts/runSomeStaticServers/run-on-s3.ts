

// npm install express s3-proxy
// or, actually,  yarn add express s3-proxy

// por favor npx ts-node src/scripts/runSomeStaticServers/run-on-s3.ts

console.log("Running on S3 server...")

const express = require('express');
const s3Proxy = require('s3-proxy');
const app = express();


// what is our cname? 

// s3 url:  s3://gotoherestatic/gotohere.com/
// copy url:   https://gotoherestatic.s3.us-east-1.amazonaws.com/gotohere.com/

// They don't work. it's the wrong shape 

//  try this: https://medium.com/@kyle.galbraith/how-to-host-a-website-on-s3-without-getting-lost-in-the-sea-e2b82aa6cd38


// this, when used like: http://localhost:3000/index.html
// actually works. 

// Fill these from your AWS credentials and bucket info.
// - bucket: the S3 bucket name only, e.g. 'gotoherestatic'
// - prefix: optional folder inside that bucket, e.g. 'gotohere.com'
//   If your objects live at s3://gotoherestatic/gotohere.com/index.html,

// s3://gotoherestatic/gotohere.com/index.html
// https://gotoherestatic.s3.us-east-1.amazonaws.com/gotohere.com/index.html

//   then bucket='gotoherestatic' and prefix='gotohere.com'.
//   If your files are in the bucket root, set prefix='' (empty string).
// - accessKeyId / secretAccessKey: your AWS IAM user credentials.
//   Prefer environment variables instead of hardcoding them here.

// don't check these in to git

const bucket = process.env.S3_BUCKET || 'gotoherestatic';
const prefix = process.env.S3_PREFIX || 'gotohere.com';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'see';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '.bash_profile';
const region = process.env.AWS_REGION || 'us-east-1';

app.get('/*path', s3Proxy({
  bucket,
  prefix,
  accessKeyId,
  secretAccessKey,
  region,
}));

app.listen(3000, () => console.log('Server running on port 3000'));   // works

