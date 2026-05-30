

import * as utils from '../knotfree-ts-lib/3d/utils';


const passPhrase = process.env.PRIVATE_KNOTFREE_PASSPHRASE || "failed";

const bigKnotfreeToken = process.env.BIG_KNOTFREE_TOKEN || "failed";


console.log(`Passphrase: ${passPhrase}`);
// eg eyJhbGciOi...
console.log(`Big Private Token: ${bigKnotfreeToken}`);
// eg atw-domain-secret-wheel...


// create keypair
const keypair = utils.getBoxKeyPairFromPassphrase(passPhrase)
const [pubk, priv] = utils.KeypairToBase64(keypair)
console.log("pubk", pubk)
console.log("priv", priv)

// sends a command to the knotfree.io API, which will execute it on the server. 
export async function sendNameserviceCommand(command: string, domainName: string): Promise<string> {
    let nonce = utils.randomString(24)
    // console.log('reserve new nonce', nonce)

    // Fetch public key from API
    const response = await fetch('http://knotfree.io/api1/getPublicKey');
    const tmp = await response.text();
    if (!response.ok) {
        console.error('Failed to fetch public key:', response.statusText);
        return "FAILED - could not fetch public key";
    }
    const theirPubk = tmp || "FAILED -muxcABH_pTsuNqT3yaYfQj-3krwM6XmEu47vTZLSHM"
    // console.log("theirPubk", theirPubk)
    const theirPubkBuffer = utils.fromBase64Url(theirPubk)

    const now = Math.floor(new Date().getTime() / 1000)
    let payload = command + "#" + now

    const ownerPubk = pubk
    const message = payload
    const bmessage = Buffer.from(message)
    const ourAdminPrivk = utils.fromBase64Url(priv)
    const nbuffer = Buffer.from(nonce)
    var enc: Buffer // = Buffer.from("BoxItItUp failed")
    try {
        enc = utils.BoxItItUp(bmessage, nbuffer, theirPubkBuffer, ourAdminPrivk)
    } catch (e) {
        console.log("delete BoxItItUp failed", e)
        enc = Buffer.from("BoxItItUp failed")
    }
    let url = "http://knotfree.io/api1/nameService?"
    url += "&cmd=" + command
    url += "&nonce=" + nonce
    url += "&pubk=" + ownerPubk
    url += "&name=" + domainName
    url += "&sealed=" + utils.toBase64Url(enc)

    // console.log('nameservice url', url)
    // console.log()

    const response2 = await fetch(url);
    const result = await response2.text();

    // note that the result is not encrypted, it is just a string response from the API. 

    // console.log('result', result)
    // console.log()

    return result
}
