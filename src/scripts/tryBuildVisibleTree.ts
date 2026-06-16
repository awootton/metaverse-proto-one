

import { assert } from 'console';
import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'
import * as THREE from 'three';

import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf';

import { WriteAllTheCubeCacheOut, ReadAllTheCubeCacheIn } from './CacheFileStuff';

import * as octload from '../knotfree-ts-lib/3d/OctTreeLoaders'

import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus'

// garbage import { clearCache, myFileCacheIntf } from './DiskedCache';

// command to execute. in a javascript debug terminal: npx ts-node src/scripts/tryBuildVisibleTree.ts

// implement a better cache . in here. keep it away from the browser files. 


async function doTheScript() {

    // just load cache when we're done and then write at the end.
    // ReadAllTheCubeCacheIn()

    const builder = new bvts.BuildVisibleTreeStatus(myMapCacheIntf)
    const position = new THREE.Vector3(-2, 1.75, 10)
    const got = await builder.BuildVisibleTree("testmain", position)

    console.log("got ", got) // this is the error.
    // here's what we want:
    console.log("showingLeaves: ", builder.showingLeaves)

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

    console.log("cache entries count: ", oct.gCubeCache.size)

    const cacheSize = oct.gCubeCache.size

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

    const startingTime = Date.now()
    const runs = 100
    for (let i = 0; i < runs; i++) {
        const got = await builder.BuildVisibleTree("testmain", new THREE.Vector3(0, 0, 0))
        if (got instanceof Error) {
            console.error("Error in BuildVisibleTree: ", got)
        } else {
            if (builder.showingLeaves.size !== 1) {
                console.error("Error: showingLeaves is wrong. ", got)
            }
            if (cacheSize !== oct.gCubeCache.size) {
                console.error("Error: cache size changed. ", got)
            }
        }
    }
    const endingTime = Date.now()
    console.log("Time taken: ", endingTime - startingTime, "ms for ", runs, " runs.", "or", (endingTime - startingTime) / runs, "ms per run.")
    // Time taken:  165 ms for  1000  runs. or 0.165 ms per run.

    console.log("cache entries count: ", oct.gCubeCache.size)


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
