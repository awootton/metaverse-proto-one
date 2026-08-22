
/// <reference types="node" />

// import * as dns from "dns/promises" this would be for the node only version, that we are not doing.

// npx ts-node src/scripts/makeWorld.ts

// This was an olde "show me some 3d" demo. It used to be in WorldTest1 I think 8/26 atw 

// import { sendNameserviceCommand } from "./sendTheCommand"
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree'
import { sendNameserviceCommand, sendNameserviceCommandHarder } from "../knotfree-ts-lib/3d/NamesApi"
import { GetTheKeys } from '../../broken-things/ReserveVrFunction'

{
    let asset = "color:#545454" // a road color from the web.
    let isImage = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(asset)
    console.log("isImage:", isImage)
}
{
    let asset = "street.jpg" // a road color from the web.
    let isImage = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(asset)
    console.log("isImage:", isImage)
}

{
    let asset = "street.jpg:repeat:10" // a road color from the web.
    let isImage = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(asset)
    console.log("isImage:", isImage)
}

console.log("isImage:")
console.log("isImage:")
console.log("isImage:")


// test the knotfree sendNameserviceCommand api -- this would be good. Does it work? 
// it runs up in knotfree.net for https or knotfree.io for http or knotfree.com:8085 for local development. (after 
// you set 127.0.0.1 knotfree.com in /etc/hosts)
// This text based command interface repeats in many places.
// base64 is used in some places, and especiall when encryption is reeuired.
// Under a microscope, this glyph '🔓' is an OPEN lock meaning no encryption is required

// excercise the knotfree.net API to reserve a name and create a world. 
// it doesn't really create anything, *** See tryingToReserve.ts for that. *** This is just to test the API calls and get a feel for how it works.

// command to execute: npx ts-node src/scripts/makeWorld.ts

// this is a script, not a library, so we can use console.log and such.
// it calls the knotfree.io API to reserve domain names and create worlds. It is a bit of a pain to do this by hand, 
// in the knotfree.net UI so this script automates it.

let finished = false

// **** This is the command set from the 
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
// [reserve] assign a public key to a name, create  eg reserve sss.iot bigKnotfreeToken
// [set option] add key subkey value. eg A @ 12.34.56.78 
// [version] info about this thing


async function doTheScript() {
    console.log("Doing the script")

    let res1: Promise<[string, Error | null]> = Promise.resolve(["hi", null] as [string, Error | null])
    let res: [string, Error | null] | null = null

    // lookup a dns name from dns server
    const [[pubk, priv], bigKnotfreeToken, err] = GetTheKeys()
    if (err) {
        console.error("Error getting keys:", err)
        return
    }

    res = null
    res = await res1
    console.log("help made the grade", res)

    // This will set a TXT param named 'meta_group_id' in the Domain Name "testmain-1n0u1w4p_vr"
    // maybe we should not. Let's skip this for now.

    const groupTextParameters: oct.GroupTextParameters = {
        id: "TmWyJB7iiPiEvT1HsyuFz6pK", // they can all draw, and act, together.
        master: "must-be-valid-cube-string", // this is the master node of the group. It must be a valid cube string. Set later.
        dbg: "localhost:3010",
        type: "floor",
        asset: "color:#545454" // a road color from the web.
    }
    const gtpString = JSON.stringify(groupTextParameters)
    console.log("groupTextParameters string:", gtpString)
    // except, the # breaks it so we have to base64url encode it.
    const gtpStringBase64Url = Buffer.from(gtpString).toString('base64url')
    console.log("groupTextParameters string base64url:", gtpStringBase64Url)
    // add an "=" to the START so we'll know it's base64url encoded when it gets to the server.
    // this is a CRAP convention that I made up and I apologize for it. 
    const gtpStringBase64UrlWithEquals = "=" + gtpStringBase64Url
    console.log("groupTextParameters string base64url with equals:", gtpStringBase64UrlWithEquals)

    // maybe later:
    // res = await sendNameserviceCommand("set option txt meta_group_id " + gtpStringBase64UrlWithEquals, "testmain-1n0u1w4p_vr", { pubk, priv })
    console.log("set option txt meta_group_id", res)
    console.log("set option txt meta_group_id", res)

    // try {
    //     const resolver = new dns.Resolver();
    //     // resolver.setServers(['8.8.8.8', '8.8.4.4']);
    //     resolver.setServers(['149.28.250.163']);
    //     const addresses = await resolver.resolve4("alan-t-wootton.iot")
    //     console.log("DNS lookup for alan-t-wootton.iot:", addresses)
    // } catch (err) {
    //     console.error("DNS lookup failed:", err)
    // }

    console.log()

    //await sendNameserviceCommand("help","none")

    res = await sendNameserviceCommandHarder("help", "no_name_needed", { pubk, priv })
    console.log("exists get-unix-time", res)


    // eg  command := "reserve " + name + " " + token
    // or  
    res = await sendNameserviceCommand("exists ", "get-unix-time", { pubk, priv })
    console.log("exists get-unix-time", res)

    res = await sendNameserviceCommand("exists", "get-unix-time_iot", { pubk, priv })
    console.log("exists get-unix-time_iot", res)

    res = await sendNameserviceCommand("details", "alan-t-wootton_iot", { pubk, priv })
    console.log("details alan-t-wootton_iot", res)

    res = await sendNameserviceCommand("set option txt @ default_value", "alan-t-wootton_iot", { pubk, priv })
    console.log("set option alan-t-wootton_iot", res)
    res = await sendNameserviceCommand("set option txt test1 test1_value", "alan-t-wootton_iot", { pubk, priv })
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

// Copyright 2026 Alan Tracey Wootton
// See LICENSE
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
