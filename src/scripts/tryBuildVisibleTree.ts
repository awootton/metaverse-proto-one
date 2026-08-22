

import { assert } from 'console';
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree'
import * as THREE from 'three';

import { WriteAllTheCubeCacheOut, ReadAllTheCubeCacheIn } from './CacheFileStuff';

// import * as loaders from '../knotfree-ts-lib/3d/OctTreeLoaders'

import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus'


// garbage import { clearCache, myFileCacheIntf } from './DiskedCache';

// command to execute. in a javascript debug terminal: 
// npx ts-node src/scripts/tryBuildVisibleTree.ts

// implement a better cache . in here. keep it away from the browser files. 

// the concept is simple
/* 
    prepare a list of promises for the cubes we want to fetch.
    settle them all in parallel.
    the good ones go into an array and the bad ones go into a list and we also make a mapping of index from new list to old.
    recurse. 

    Then we do it again to get the TXT records. It should be the same code even, with generic types.
    // last time I wrote this I spend 7 hours and it wasn't right. I didn't prepare for the recursion 
    // and I didn't test that way up front. 
*/

async function doTheScript() {

    // to test prod:
    // dnstypes.SetKnotfreeServer("https://knotfree.net") // test in prod.

    oct.ClearTreeStatusCache() // start with an empty cache.

    // just load cache when we're done and then write at the end.
    // ReadAllTheCubeCacheIn()

    let startingTime = Date.now()

    const builder = new bvts.BuildVisibleTreeStatus()
    const position = new THREE.Vector3(-2, 1.75, 10)
    const got = await builder.BuildVisibleTree("testmain", position)
    let endingTime = Date.now()
    console.log("Time taken to BuildVisibleTreeStatus: ", endingTime - startingTime, "ms for 1 run.", "or", (endingTime - startingTime) / 1, "ms per run.")
    // 2.5 minutes for the slow version.

    console.log("got ", got) // this is the error.
    // here's what we want:
    console.log("showingLeaves: ", builder.showingLeaves.size)

    // This was all the two way lookups. Prepared especially for a test in go.
    // I can't use this: 
    //  '"testmain-0n0u7w5p-0","testmain-0n0u7w5p-1","testmain-0n0u7w5p-2","testmain-0n0u7w5p-3","testmain-0n0u7w5p-4","testmain-0n0u7w5p-5","testmain-0n0u7w5p-6","testmain-0n0u7w5p-7","testmain-0n0u14w4p","testmain-1n0u14w4p","testmain-0n1u14w4p","testmain-1n1u14w4p","testmain-0n0u13w4p","testmain-1n0u13w4p","testmain-0n1u13w4p","testmain-1n1u13w4p"',
    let namesMappedWithCommas = "" // octload.allTheNames.join(",\n")
    // they have single quotes that have to go. 
    // for (const name of octload.allTheNames) {
    //     const tmp = "    " + name + ",\n" // why is this hard? name.substring(1, name.length - 1) // remove the single quotes
    //     namesMappedWithCommas += tmp
    // }
    // console.log("var names = [][]string{\n", namesMappedWithCommas, "\n}\n")

    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
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

    // let's take a look at the mess we made.
    // too much console.log("the cache: ", builder.cubeCache)
    // it's like 7 * 16 = 112 entries 

    console.log("cache entries count: ", oct.TreeStatusCacheSize())

    const cacheSize = oct.TreeStatusCacheSize() // this is the size of the cache before we do the torture test. It should be the same after.

    // for all the cache
    if (true) { // do this later.
        // for (const [key, value] of oct.gCubeCache.entries()) {
        //     // console.log(`cache key: ${key}, value: ${JSON.stringify(value)}`)
        //     if (value.cube.whichParent) {
        //         // so it has an index. 
        //         const i = value.cube.whichParent
        //         // does it's parent agree in that?
        //         const [parentCube2, parentIndex] = oct.getParentCubeWithOcttreeIndex(value.cube)
        //         if (parentIndex !== i) {
        //             console.error("Error: cube's whichParent does not match the index of the child cube in the parent. ", key)
        //         }
        //         const sameCube = oct.getChildCube(parentCube2, i)
        //         if (sameCube.x !== value.cube.x || sameCube.y !== value.cube.y || sameCube.z !== value.cube.z || sameCube.p !== value.cube.p) {
        //             console.error("Error: cube's whichParent does not point to the correct cube. ", key)
        //         }
        //     } else {
        //         // It's the Nth child of some parent. eg 'testmain-0n0u0e16p-0'

        //         const [parentCube, parentIndex] = oct.getParentCubeWithOcttreeIndex(value.cube)
        //         // which should be in the cache.
        //         const parentKey = oct.cubeToUrlString(parentCube)[0].toString()
        //         const parentValue = oct.gCubeCache.get(parentKey)
        //         if (!parentValue) {
        //             console.error("Error: cube's parent is not in the cache. ", key)
        //             continue
        //         }
        //         // does the parent have the child bit set for this index?
        //         if (!oct.ChildExists(parentValue.childrenBits, parentIndex)) {
        //             console.error("Error: cube's parent does not have the child bit set for this index. ", key)
        //         }
        //         // does the parent have the isParent bit set for this index?
        //         if (!oct.IsParent(parentValue.childrenBits, parentIndex)) {
        //             console.error("Error: cube's parent does not have the isParent bit set for this index. ", key)
        //         }
        //         // does the parent's whichParent point to this cube?
        //         const sameCube = oct.getChildCube(parentCube, parentIndex)
        //         if (sameCube.x !== value.cube.x || sameCube.y !== value.cube.y || sameCube.z !== value.cube.z || sameCube.p !== value.cube.p) {
        //             console.error("Error: cube's whichParent does not point to the correct cube. ", key)
        //         }                
        //     }
        //     // do the leaf TreeStatus objects have addresses or errors filled in? They should have one or the other.
        //     if (value.isParent) {
        //         if (value.found) {
        //             if (value.addresses !== undefined) {
        //                 console.error("Error: we don't want the addresses for non-leaf treeStatus. ", key)
        //             }
        //         }
        //     }
        //     if (value.level !== value.cube.p) { // tell me why we have level in the TreeStatus?
        //         console.error("Error: treeStatus level does not match the p of the cube. ", key)
        //     }
        // }
    }

    startingTime = Date.now()
    const runs = 100 //100 * 99999
    for (let i = 0; i < runs; i++) {

        // oct.gCubeCache.clear() // total torture test start with an empty cache.
        // it still screams because of cache in server. 127.73 ms per run. - not too bad

        // if we don't clear the cache we get:  1.92 ms per run.  why so slow? </sarcasm

        // total torture test. No respite.
        const prom = builder.BuildVisibleTree("testmain", new THREE.Vector3(0, 0, 0))
        const got = await prom
        if (got instanceof Error) {
            console.error("Error in BuildVisibleTree: ", got)
        } else {
            if (builder.showingLeaves.size !== 77) {
                console.error("Error: showingLeaves is not 77. ", builder.showingLeaves.size)
            }
            if (cacheSize !== oct.TreeStatusCacheSize()) {
                console.error("Error: cache size changed. ", got)
            }
        }
    }
    endingTime = Date.now()
    console.log("Time taken: ", endingTime - startingTime, "ms for ", runs, " runs.", "or", (endingTime - startingTime) / runs, "ms per run.")
    // Time taken:  165 ms for  1000  runs. or 0.165 ms per run.

    console.log("cache entries count: ", oct.TreeStatusCacheSize())

    WriteAllTheCubeCacheOut()

    finished = true
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
