import * as dnstypes from '../knotfree-ts-lib/3d/DnsTypes';
import axios from 'axios';
import * as fs from 'fs';

// command to execute: npx ts-node src/scripts/testChildBits2Server.ts

const filePath = './cacheEntries.json'; // Replace with the actual path to your file
const fileContent = fs.readFileSync(filePath, 'utf-8');
// this is what we're posting: 
console.log("length is ", fileContent.length, " first 100 chars: ", fileContent.substring(0, 100), " last 100 chars: ", fileContent.substring(fileContent.length - 100) );
// and, we expect to be able to get it back.

console.log("cacheEntries.json length is ", fileContent.length);
console.log("cacheEntries.json length is ", fileContent.length);
console.log("cacheEntries.json length is ", fileContent.length);


let server = dnstypes.knotfreeServer; // default to local server for testing.
let url = server + "/api1/setAllChildBitCache?world=testmain";

// now do a post of fileContent

async function sendLargeString() {
  // Generate or ingest a massive string
  const largeString = fileContent //"A".repeat(50 * 1024 * 1024); // 50 MB string

  try {
    const response = await axios.post(url, largeString, {
      headers: {
        'Content-Type': 'text/plain' // Change to 'application/json' if wrapped in an object
      },
      // Crucial settings to prevent "Request body larger than maxBodyLength limit" errors
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    console.log('Success:', response.status);
    console.log('Success:', response.status);
    console.log('Success:', response.status);
    console.log('Success:', response.status);
  } catch (error: any) {
    console.error('Error sending large string:', error.message); // but did it get there? Error sending large string: read ECONNRESET
    console.error('Error sending large string:', error.message);    // what am I doing wrong. Nothing, probably.
    console.error('Error sending large string:', error.message);
    console.error('Error sending large string:', error.message);
  }
}

async function main() {
  await sendLargeString();
  console.log("in main, finished sendLargeString.")

  await new Promise(resolve => setTimeout(resolve, 10000)); // sleep for 10 seconds

  console.log("in main, finished sleeping.")
  // where's the answer? 

  // now let's do the get.
  await getLargeData()

}

main();

console.log("done sending large string about to nap.")


// sleep for a while to let the server process the request and then we can check the server logs to see if it worked.   

console.log("done sending large string to server. check the server logs for the result.")
console.log("done sending large string to server. check the server logs for the result.")
console.log("done sending large string to server. check the server logs for the result.")
console.log("done sending large string to server. check the server logs for the result.")


async function getLargeData() {
  try {
    const response = await axios.get(server + "/api1/getAllChildBitCache?world=testmain", {
      // Allow unlimited content sizes (default is ~10MB)
      maxContentLength: Infinity, 
      maxBodyLength: Infinity,
      
      // Tell Axios to leave the response as a raw string instead of trying to parse it
      transformResponse: [(data) => data], 
    });

    const rawLargeString = response.data;
    console.log(`Fetched string length: ${rawLargeString.length}`);
    console.log(`Fetched string length: ${rawLargeString.length}`);
    console.log(`Fetched string length: ${rawLargeString.length}`);
    
    // Process your string here... fill the cache and order a traversal! 
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// getLargeData();

