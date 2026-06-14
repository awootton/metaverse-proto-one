

import * as utils from './utils';
import * as atwdns from './DnsTypes'

// the help commend returns a list of commands, and the get-unix-time command returns the current unix time.
// [bulk option] add key kv pairs
// [delete] delete a name
// [details] A serialization of the name record
// [exists] returns true if the name exists 🔓
// [get option] get key val. eg A 12.34.56.78 🔓
// [get pubk] device public key 🔓
// [get random] returns a random integer
// [get time] seconds since 1970🔓
// [get txt] get key val. eg A 12.34.56.78 🔓
// [help] lists all commands. 🔓 means no encryption required
// [proxy-status] returns ProxyStatusReturnType 🔓
// [replace options] Replace all the options. Arg is json map in base64.
// [reserve] assign a public key to a name, create  eg "reserve sss.iot bigKnotfreeToken
// [set option] add key subkey value. eg A @ 12.34.56.78 
// [version] info about this thing


export type LookupNameExistsReturnType = {
	Exists: boolean
	Online: boolean
}

let server = "https://knotfree.net"
// server = "http://knotfree.com:8085" // for local testing
server = atwdns.knotfreeServer

// sends a command to the knotfree.io API, which will execute it on the server. 
export async function sendNameserviceCommand(command: string, domainName: string, keyPair: { pubk: string, priv: string }): Promise<string> {
    let nonce = utils.randomString(24)
    // console.log('reserve new nonce', nonce)

    // Fetch public key from API. Every time?
    const response = await fetch(server + '/api1/getPublicKey');
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

    const ownerPubk = keyPair.pubk
    const message = payload
    const bmessage = Buffer.from(message)
    const ourAdminPrivk = utils.fromBase64Url(keyPair.priv)
    const nbuffer = Buffer.from(nonce)
    var enc: Buffer // = Buffer.from("BoxItItUp failed")
    try {
        enc = utils.BoxItItUp(bmessage, nbuffer, theirPubkBuffer, ourAdminPrivk)
    } catch (e) {
        console.log("delete BoxItItUp failed", e)
        enc = Buffer.from("BoxItItUp failed")
    }
    let url = server + "/api1/nameService?"
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
