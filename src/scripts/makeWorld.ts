
/// <reference types="node" />

import * as dns from "dns/promises"

import { sendNameserviceCommand } from "./sendTheCommand"


// command to execute: npx ts-node src/scripts/makeWorld.ts

// this is a script, not a library, so we can use console.log and such.
// it calls the knotfree.io API to reserve domain names and create worlds. It is a bit of a pain to do this by hand, 
// in the knotfree.net UI so this script automates it.

let finished = false

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
// [reserve] assign a public key to a name, create
// [set option] add key subkey value. eg A @ 12.34.56.78 
// [version] info about this thing


async function doTheScript() {
    console.log("Doing the script")

    // lookup a dns name from dns server
  
    try {
        const resolver = new dns.Resolver();
        // resolver.setServers(['8.8.8.8', '8.8.4.4']);
        resolver.setServers(['149.28.250.163']);
        const addresses = await resolver.resolve4("alan-t-wootton.iot")
        console.log("DNS lookup for alan-t-wootton.iot:", addresses)
    } catch (err) {
        console.error("DNS lookup failed:", err)
    }

    console.log()

    //await sendNameserviceCommand("help","none")

    await sendNameserviceCommand("help","none")


    // eg  command := "reserve " + name + " " + token
    // or  
    let res = await sendNameserviceCommand("exists ", "get-unix-time")
    console.log("exists get-unix-time", res)
   
    res = await sendNameserviceCommand("exists", "get-unix-time_iot")
    console.log("exists get-unix-time_iot", res)

    res = await sendNameserviceCommand("details", "alan-t-wootton_iot")
    console.log("details alan-t-wootton_iot", res)

    res = await sendNameserviceCommand("set option txt @ default_value", "alan-t-wootton_iot")
    console.log("set option alan-t-wootton_iot", res)
    res = await sendNameserviceCommand("set option txt test1 test1_value", "alan-t-wootton_iot")
    console.log("set option alan-t-wootton_iot", res)

    finished = true
}

setTimer()

doTheScript()

function setTimer() {
    setTimeout(() => {
        if (!finished) {
            setTimer()
        } else {
            console.log("Finished the script")
        }
    }, 100)
}

