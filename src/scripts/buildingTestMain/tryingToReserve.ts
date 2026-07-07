// import * as dns from "dns/promises" NOPE. We can't use this.

import * as oct from '../../knotfree-ts-lib/3d/UrlOctTree'

import * as octload from '../../knotfree-ts-lib/3d/OctTreeLoaders'
import * as atwdns from '../../knotfree-ts-lib/3d/DnsTypes'

import * as utils from '../../knotfree-ts-lib/3d/utils'
import * as names from '../../knotfree-ts-lib/3d/NamesApi'

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { GetTheKeys } from '../../knotfree-ts-lib/3d/ReserveVrFunction'

// Don't use this. Use the reserveSmallPlots.ts script instead. It's newer

// command to execute. in a javascript debug terminal: npx ts-node src/scripts/tryingToReserve.ts

// a primitive version that reserved these: 
// const property = "testmain-0n0u0e5p" // my old buddy. 32 by 32 meters.
// const acrossToTheWest = "testmain-0n0u1w5p" // 

// is this a script or do the inputs come in env vars?
const args = process.argv.slice(2);
const firstArg = args[0];
const lastArg = args[1];

const passPhrase = process.env.PRIVATE_KNOTFREE_PASSPHRASE || "failed";
let bigKnotfreeToken = process.env.BIG_KNOTFREE_TOKEN || "failed";

const groupTextParameters: oct.GroupTextParameters = {
    id: "j9xK3mP8wL2z", // randomness
    dbg: "localhost:3010",
    type: "floor",
    asset: "street.jpg"
}
const gtpString = JSON.stringify(groupTextParameters)
if (gtpString.length > 255) {
    console.error("Group text parameters are too long to fit in a TXT record. Please shorten them.")
}
console.log("Group text parameters for the reservation:", JSON.stringify(groupTextParameters), gtpString.length)
console.log("Group text parameters for the reservation:", JSON.stringify(groupTextParameters), gtpString.length)


async function askQuestion(q: string): Promise<string> {
    // Create the interface link to standard I/O
    const rl = readline.createInterface({ input, output });

    try {
        // Prompt the user and wait for their answer
        const answer = await rl.question(q);
        return answer;
    } finally {
        // Always close the interface to release the terminal stream
        rl.close();
    }
}

async function doTheScript() {

    // nope. Not fixing this. see reserveSmallPlots for a better example. DELETE ME: atw

    // all this crap has been moved into the ReserveVr function. 
    // use that instead.  See  reserveSmallPlotInCloudflair.ts

    const property = "testmain-0n0u0e5p" // my old buddy. 32 by 32 meters.
    const acrossToTheWest = "testmain-0n0u1w5p" // 
    // let's pretend we're reserving it.

    // let tmp = await octload.PrepareToReservePropertyBatch([property, acrossToTheWest], oct.gCubeCache)
    // // console.log("PrepareToReservePropertyBatch result", tmp)
    // if (tmp instanceof Error) {
    //     console.error("Error preparing to reserve property batch:", tmp)
    //     finished = true
    //     return
    // }
    // const reserveResult = tmp[0]

    // do this at the beginning 
    // let [pubk, priv]: [string, string] = ["", ""]
    // {
    //     if (passPhrase.length < 25) {
    //         console.error("Passphrase is too short. Please set the PRIVATE_KNOTFREE_PASSPHRASE environment variable to a legit value.")
    //         finished = true
    //         return
    //     }
    //     if (bigKnotfreeToken.length < 128) {
    //         console.error("Big knotfree token is too short. Please set the BIG_KNOTFREE_TOKEN environment variable to a real value.")
    //         finished = true
    //         return
    //     }

    //     bigKnotfreeToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTk2OTA0MzUsImlzcyI6Il85c2giLCJqdGkiOiJkdmF3M3oyOG84Ynhxc3E2ZndvengzaHgiLCJpbiI6MTIxNiwib3V0IjoxMjE2LCJzdSI6NjQsImNvIjozMiwidXJsIjoia25vdGZyZWUubmV0L21xdHQiLCJwdWJrIjoiTkVVZFpYc1BURC1seEdlZUhXWEctb185d2xmbl9zQlNxUHFVcXpBMEhTMCJ9.PrpFngWp4Q2tIGSQojyke0D3jHWkHsLLdqIA-tUhwDkIR_gU_6tje7AxMwRmRJr9ebmTYDZynuoVROGvubK3Cg"
    //     console.log()
    //     console.log(`Have Passphrase: ${passPhrase.slice(0, 8)}...`);
    //     // eg eyJhbGciOi...
    //     console.log()
    //     console.log(`Have Big Private Token: ${bigKnotfreeToken.slice(0, 16)}...${bigKnotfreeToken.slice(-16)}`);
    //     // eg atw-domain-secret-wheel...
    //     console.log()

    //     const keypair = utils.getBoxKeyPairFromPassphrase(passPhrase)

    //     const keyPairBase64 = utils.KeypairToBase64(keypair)
    //     pubk = keyPairBase64[0]
    //     priv = keyPairBase64[1]
    //     console.log("pubk", pubk)
    //     console.log("priv", priv)

    //     // we should take apart the token and check that the pubk in the token matches the pubk we just generated from the passphrase. Just to be sure.
    //     // it will not be possible to change it and re-sign the jwtid token.
    //     const tokenParts = bigKnotfreeToken.split('.')
    //     if (tokenParts.length !== 3) {
    //         console.error("Invalid big knotfree token format. Expected three parts separated by dots.")
    //         finished = true
    //         return
    //     }
    //     const payload = tokenParts[1]
    //     let decodedPayload: string
    //     try {
    //         decodedPayload = Buffer.from(payload, 'base64').toString('utf-8')
    //     } catch (e) {
    //         console.error("Failed to decode big knotfree token payload:", e)
    //         finished = true
    //         return
    //     }
    //     let payloadObj: any
    //     try {
    //         payloadObj = JSON.parse(decodedPayload)
    //     } catch (e) {
    //         console.error("Failed to parse big knotfree token payload as JSON:", e)
    //         finished = true
    //         return
    //     }
    //     if (payloadObj.pubk !== pubk) {
    //         console.error("Public key in the big knotfree token does not match the public key derived from the passphrase. Please check your environment variables.")
    //         finished = true
    //         return
    //     }
    //     console.log("Public key in the big knotfree token matches the public key derived from the passphrase. Good to go.")
    //     console.log()
    // }

        // const  [[pubk, priv],bigKnotfreeToken,err] = GetTheKeys()
        // if (err) {
        //     console.error("Error getting keys:", err)
        //     return
        // }
    

    // console.log("the raw list", reserveResult.rawChains.map(chain => chain.map(cube => oct.cubeToUrlString(cube))))

    // tmp = await octload.VerifyReservePropertyBatch(reserveResult)
    // //console.log("VerifyReservePropertyBatch result", tmp)
    // if (tmp instanceof Error) {
    //     console.error("Error verifying reserve property batch:")
    //     finished = true
    //     return
    // } else {
    //     console.log("Successfully verified reserve property batch. Result:", tmp)
    // }
    // // prepare the lists. 
    // await octload.PrepareTheLists(reserveResult)

    // if (reserveResult.thingsThatAlreadyExist.length > 0) {
    //     console.log("The following properties already exist and won't be reserved again:", reserveResult.thingsThatAlreadyExist.map(item => oct.CubeToString(item.cube)[0]))
    // }

    // if (reserveResult.thingsToActuallyReserve.length === 0) {
    //     console.error("No properties to reserve after preparation.")
    //     finished = true
    //     return
    // }
    // console.log("Ready to reserve the following properties:", reserveResult.thingsToActuallyReserve.map(cube => oct.CubeToString(cube)[0]))

    // const groupTextParameters: oct.GroupTextParameters = {
    //     grp: "j9xK3mP8wL2z", // randomness
    //     dbg: "localhost:3010",
    //     type: "floor",
    //     asset: "street.jpg"
    // }
    // const gtpString = JSON.stringify(groupTextParameters)
    // if (gtpString.length > 255) {
    //     console.error("Group text parameters are too long to fit in a TXT record. Please shorten them.")
    //     finished = true
    //     return
    // }
    // console.log("Group text parameters for the reservation:", JSON.stringify(groupTextParameters), gtpString.length)


    // const yn = await askQuestion("Are we going to reserve these names now? (y/n) ")
    // if (yn.toLowerCase() !== "y") {
    //     console.log("Aborting reservation.")
    //     finished = true
    //     return
    // } else {
    //     console.log("going through with it.")
    //     console.log()
    //     for (const cube of reserveResult.thingsToActuallyReserve) {
    //            let err: Error | null
    //            let cubeStr: string
    //         [cubeStr, err] = oct.CubeToString(cube)
    //         if (err) {
    //             console.error("Error converting cube to URL string:", err)
    //             continue
    //         }
    //         if (!cube.whichParent) {
    //             console.log(`Reserving property ${cubeStr}.vr with group text parameters:`, JSON.stringify(groupTextParameters))
    //         }
    //         // Here you would call the function to actually reserve the property using the cubeStr and groupTextParameters.
    //         // This might involve sending a command to the knotfree API or some other action depending on how your reservation system works.
    //         // what if it fails in the middle? Seppuku. The only recourse.
    //         // just kidding. if we run it again it should skip the ones that already exist and try to reserve the rest.
    //         const cubeUrlVr = cubeStr + "_vr" // how knot free does a .vr domain.
    //         let res: string
         
    //         [res, err] = await names.sendNameserviceCommand("exists", cubeUrlVr, { pubk, priv })
    //         const existsObj = JSON.parse(res) as names.LookupNameExistsReturnType
    //         if (existsObj.Exists) {
    //             console.log(`How can this exist, we just checked? ${cubeStr} as ${cubeUrlVr}. It now exists in the name service.`)
    //         }
    //         [res, err] = await names.sendNameserviceCommand("reserve " + cubeUrlVr + " " + bigKnotfreeToken, cubeUrlVr, { pubk, priv })
    //         console.log(`Attempted to reserve ${cubeUrlVr}. Response:`, res)
    //         if (res.startsWith("FAILED")) {
    //             console.error(`Failed to reserve ${cubeUrlVr}:`, res)
    //         } else {
    //             console.log(`Successfully reserved ${cubeUrlVr}. Response:`, res)
    //         }
    //         if (cube.whichParent === undefined) { // this test is WRONG
    //             // don't set these on parents.
    //             [res, err] = await names.sendNameserviceCommand(`set option txt meta_group_id ${gtpString}`, cubeUrlVr, { pubk, priv })
    //             console.log(`set option ${cubeUrlVr}`, res)
    //         }
    //         console.log()
    //     }
    // }



    finished = true
}


let finished = false
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


//   { // this is just me trying things.
//         const knt = await atwdns.FetchDnsResponse("alan-t-wootton.vr", "A", "xxx", true)
//         //console.log("knotfree FetchDnsResponse result", knt)

//         const dd = await atwdns.FetchDnsResponse("adobe.com,google.com", "A", "8.8.8.8", false)
//         // console.log("google FetchDnsResponse result", dd)
//     }
//     { // this part is actually a test.
//         let theName = "meta_group_id.testmain-0n0u0e16p-0.vr"
//         const kftest = await atwdns.FetchDnsResponse(theName, "TXT", "xxx", true)

//         const dd0 = kftest instanceof Error ? kftest : kftest[0]
//         if (dd0 instanceof Error) {
//             console.error("Error fetching DNS response:", dd0)
//         } else {
//             const answerData = dd0.Answer ? dd0.Answer[0].data : "No answer"
//             console.log("google FetchDnsResponse adobe address:", answerData)
//             assert.equal(answerData, "meta_group_id-no-leading-underscore")
//         }
//     }

// put this in a test somewhere.
// const dummyResponse: atwdns.DnsResponse = {
//     Status: 0,
//     TC: false,
//     RD: true,
//     RA: true,
//     AD: false,
//     CD: false,
//     Question: [
//         {
//             name: "testmain-0n0u0e5p",
//             type: 16
//         }
//     ],
//     Answer: [
//         {
//             name: "testmain-0n0u0e5p",
//             type: 16,
//             TTL: 300,
//             data: "testmain-0n0u0e5p"
//         }
//     ]
// }
// // cool
// const asAstring = JSON.stringify(dummyResponse)
// // console.log("as a string:", asAstring)

// // we can parse it back to an object and it should match the original object.
// const parsedResponse = JSON.parse(asAstring) as atwdns.DnsResponse
// // console.log("back to object:", parsedResponse)


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
