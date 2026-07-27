
import { assert } from 'console';
import * as oct from '../knotfree-ts-lib/3d/DomainNameOctTree'
import * as THREE from 'three';

import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf';

import { WriteAllTheCubeCacheOut, ReadAllTheCubeCacheIn } from './CacheFileStuff';

// import * as loaders from '../knotfree-ts-lib/3d/OctTreeLoaders'

import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus'

import * as dnstypes from '../knotfree-ts-lib/3d/DnsTypes'
import { ourLocalStorage } from '../knotfree-ts-lib/3d/LocalStorageFakery';
import axios from 'axios';

// this is similar to the test tryBuildVisibleTreeStatus.ts 
// but it's going to try to build EVERYTHING and then Serialize out the entire cache and send it to the server.

// command to execute. in a javascript debug terminal: 
// npx ts-node src/scripts/BuildWholeTreeAndCache.ts

// We should run this every 3 minutes always to keep the DB full of the latest child bits cache..

async function doTheScript() {

    // to test prod: This should ALWAYS be in prod? 
    // dnstypes.SetKnotfreeServer("https://knotfree.net") // test in prod.
    // Why? 

    oct.gTreeStatusCache.clear() // start with an empty cache.
    // to do this right we must cleear the child bits cache too.
    console.log("Starting to build the whole tree and cache it. cache size BEFORE clear: ", ourLocalStorage.length)
    oct.ClearChildBitsCache()
    console.log("Starting to build the whole tree and cache it. cache size AFTER clear: ", ourLocalStorage.length)

    let startingTime = Date.now()

    const builder = new bvts.BuildVisibleTreeStatus(myMapCacheIntf)
    const position = new THREE.Vector3(-2, 1.75, 10)
    builder.minRatioToBeVisible = 0 // this is the key to getting everything. 0 means everything is visible. 
    // 1 means only the closest cubes are visible 45 degrees?
    // how do we jugger this so EVERYTHING is visible? We need to set the minRatioToBeVisible to 0.  ?
    const got = await builder.BuildVisibleTree("testmain", position)
    let endingTime = Date.now()
    console.log("Time taken to BuildVisibleTreeStatus: ", endingTime - startingTime, "ms for 1 run.", "or", (endingTime - startingTime) / 1, "ms per run.")
    // 2.5 minutes for the slow version.

    console.log("got ", got) // this is the error.
    // here's what we want:
    console.log("showingLeaves: ", builder.showingLeaves.size)

    console.log("cache entries count: ", oct.gTreeStatusCache.size)
    const cacheSize = oct.gTreeStatusCache.size


    // let's see that cache now.
    const cacheEntries = oct.GetTheWholeChildBitsLocalCache()
    console.log("cache entries count: ", cacheEntries.size)
    console.log("Done building the whole tree and cacheing it. cache size AFTER clear: ", ourLocalStorage.length)

    // console.log("cache entries keys: ", Array.from(cacheEntries.keys()))
    // make into json file
    const asjson = JSON.stringify(Array.from(cacheEntries.entries()), null, 2)
    // console.log("cache entries json: ", asjson)

    const fs = require('fs');
    fs.writeFileSync('./cacheEntries.json', asjson);

    // now, do it AGAIN!
    // with a cleared cache but a non clear localStorage. This should be fast because the localStorage cache is used.
    if (false) {
        oct.gTreeStatusCache.clear() // start with an empty cache.
        console.log("Starting to build the whole tree and cache it. cache size: ", ourLocalStorage.length)

        startingTime = Date.now()
        {
            const builder = new bvts.BuildVisibleTreeStatus(myMapCacheIntf)
            const position = new THREE.Vector3(-2, 1.75, 10)
            builder.minRatioToBeVisible = 0 // this is the key to getting everything. 0 means everything is visible. 
            // 1 means only the closest cubes are visible 45 degrees?
            // how do we jugger this so EVERYTHING is visible? We need to set the minRatioToBeVisible to 0.  ?
            const got = await builder.BuildVisibleTree("testmain", position)
            let endingTime = Date.now()
            console.log("Time taken to BuildVisibleTreeStatus: ", endingTime - startingTime, "ms for 1 run.", "or", (endingTime - startingTime) / 1, "ms per run.")
            // 2.5 minutes for the slow version.
        }
        endingTime = Date.now()
        console.log("Time taken to BuildVisibleTree #2: ", endingTime - startingTime, "ms for 1 run.", "or", (endingTime - startingTime) / 1, "ms per run.")

        console.log("cube cache entries count: ", oct.gTreeStatusCache.size)

        const cacheEntries2 = oct.GetTheWholeChildBitsLocalCache()
        console.log("child bits entries count: ", cacheEntries2.size)
    }

    // send it to the server!!! 
    // who will send it to the db.
    // then we will try to build the tree from that.
    {
        let server = dnstypes.knotfreeServer; // http://knotfree.dog:8085.
        let url = server + "/api1/setAllChildBitCache?world=testmain";

        await sendLargeString(asjson, url)
    }
    {
        let server = dnstypes.knotFreeDotNet; // "https://knotfree.net"
        let url = server + "/api1/setAllChildBitCache?world=testmain";

        await sendLargeString(asjson, url)
    }

    // never finished. Run every 5 miinutes.  finished = true
}

async function sendLargeString(largeString: string, url: string) {

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
    } catch (error: any) {
        console.error('Error sending large string:', error.message); // but did it get there? Error sending large string: read ECONNRESET
    }
}


// if (true) { // this works, it's in here: make into a test ?
//     const testChain = [
//         { world: "testmain", x: 0, y: 0, z: 0, p: 5 },
//     ]
//     const exampleGroupId: oct.GroupTextParameters = { grp: "testgroup", ali: "testalias", p: 5 }
//     console.log("example groupId: ", JSON.stringify(exampleGroupId))
//     // expecting {"grp":"CourtyardAndFloor_group_j9xK3mP8wL2z","ali":"localhost","p":3010}
//     // on meta_group_id.testmain-0n0u0e5p.vr 

//     octload.TwoWayLookupPart1(testChain, "TXT", "meta_group_id").then(async result => {
//         console.log("TwoWayLookupPart1 result: ", result)
//         const r2 = await result
//         console.log("TwoWayLookupPart1 resolved: ", r2)
//         if (r2[0].status === "fulfilled") {
//             console.log("TwoWayLookupPart1 resolved: ", r2[0].value)
//             // get the Answer
//             const answers = r2[0].value
//             if (answers instanceof Error) {
//                 console.error("Error in TwoWayLookupPart1 answers: ", answers)
//             } else {
//                 for (const answer of answers) {
//                     console.log("Answer: ", answer)
//                     // if (answer.type === "TXT") {
//                     //     console.log("TXT record: ", answer.data)
//                     // }
//                 }
//             }
//         }
//         if (r2[1].status === "fulfilled") {
//             console.log("TwoWayLookupPart2 resolved: ", r2[1].value)
//             const answers = r2[1].value
//             if (answers instanceof Error) {
//                 console.error("Error in TwoWayLookupPart2 answers: ", answers)
//             } else {
//                 for (const answer of answers) {
//                     console.log("Answer: ", answer)
//                     // if (answer.type === "TXT") {
//                     //     console.log("TXT record: ", answer.data)
//                     // }
//                 }
//             }
//         }
//     }).catch(err => {
//         console.error("Error in TwoWayLookupPart1: ", err)
//     })

//     await new Promise(resolve => setTimeout(resolve, 10000))
// }


// The disk cache version.
// showingLeaves:  Map(1) {
//   'testmain-0n0u0e5p' => {
//     name: 'testmain-0n0u0e5p',
//     cube: { world: 'testmain', x: 0, y: 0, z: 0, p: 5 },
//     level: 5,
//     found: true,
//     isParent: false,
//     wasXYZ: false,
//     childrenBits: -1,
//     error: null,
//     addresses: [ '216.128.128.195' ],
//     groupId: {
//       grp: 'CourtyardAndFloor_group_j9xK3mP8wL2z',
//       ali: 'localhost',
//       p: 3010
//     }
//   }
// }
// cache entries count:  184
// Time taken:  163 ms for  1000  runs. or 0.163 ms per run.


let finished = false
setTimer()

doTheScript()

function setTimer() {
    setTimeout(() => {

        doTheScript()

        if (!finished) {
            setTimer()
        } else {
            console.log("Finished the script")
        }
    }, 5 * 60 * 1000) // 5 minutes
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
