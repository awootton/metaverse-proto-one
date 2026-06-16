
import * as THREE from 'three';

import { CacheIntf } from './CacheIntf';
import * as oct from './UrlOctTree'
import * as atwdns from './DnsTypes'
import { error } from 'console';

import * as octload from './OctTreeLoaders'


// BuildVisibleTreeStatus aka bvts in the logs.
export class BuildVisibleTreeStatus {

    cubeCache: CacheIntf
    maxRadiusToBeVisible = 100 // this is a placeholder. 
    // We should calculate this based on the camera FOV and the size of the cubes at each level. 
    // But for now, let's just say 100 meters is visible. 
    // This means that if a cube is within 100 meters of the camera, we will consider it visible and try to load its children. 
    // If it's farther than 100 meters, we won't bother loading its children because they will be too small to see anyway (not). 
    // This is a very simple way to do level of detail, but it should work for our purposes. 
    // We can always make it more sophisticated later if we want to.
    // Later, at render time we should check if the cubes are actually in the frustum and if not, we can skip rendering them.

    // this is what we're trying to build.
    public showingLeaves: Map<string, oct.TreeStatus>

    // 2. Constructor to initialize properties
    constructor(cubeCache: CacheIntf) {
        this.cubeCache = cubeCache;
        this.showingLeaves = new Map<string, oct.TreeStatus>();
    }

    // 3. Methods
    // we'll do this better with frustrum later, but for now we'll just say a cube is visible if it's within some distance of the camera.
    // a lot fluffier than I expected but should run out of the cache and be really fast after the first run.

    public async buildSubTree(tree: oct.TreeStatus, cameraPos: THREE.Vector3, depth: number): Promise<Error | null> {

        depth++
        if (depth > 64) {
            // 2^64 is 8 quintillion, which is more cubes than we have in the world. So we should never get here. If we do, something is very wrong and we should stop the recursion to avoid crashing the script.
            // more than just a big world. A universe of atoms.
            console.log("bvts Max depth reached, stopping recursion.")
            return null
        }

        // in the current example testmain-0n0u0e16p-0 is the tree and it has it's child bits.
        // if this is testmain-0n0u0e16p-0, for instance, we know there's no leaf at this level but the zeroth node exists.
        // does it have the child bits set? if not we need to look it up and set that array.
        // didn't we just do this? Can we delete this?
        if (tree.childrenBits === -1) {
            const [childBits, err] = await this.calcChildrenBits(tree.cube, tree.name, tree.childrenBits);
            tree.childrenBits = childBits;
            if (err) {
                console.error("bvts Error calculating children bits for tree ", tree.name, err)
                return err
            }
        }

        // // now we should have the children array filled in for this treeStatus. We can use that to recurse down to the visible children.
        for (let i = 0; i < 8; i++) {
            if (oct.IsParent(tree.childrenBits, i)) { // if exists
                // we might recurse into this.
                let aCube = oct.getChildCube(tree.cube, i)
                const visible = this.isCubeVisible(aCube, cameraPos, this.maxRadiusToBeVisible) // if exists and is visible.
                if (visible) {
                    // recurse on the subtree 
                    const subKeyCube = { ...aCube, whichParent: i } as oct.Cube
                    const subTreeKey = oct.cubeToUrlString(subKeyCube)[0] // eg testmain-0n0u0e15p-0 
                    // the existance of 16-p-0 implies there's a subtree here before we even look up anything. 

                    // if we've been here before then subTreeKey is in the cache and knows the bits
                    let subTreeStatus = this.cubeCache.get(subTreeKey)
                    // else let's just calc the childbits for it right now and that will load it.
                    if (subTreeStatus == undefined || subTreeStatus?.childrenBits === -1) {
                        const [childBits, childErr] = await this.calcChildrenBits(subKeyCube, subTreeKey, -1) // 
                        if (childErr) {
                            console.error("bvts Error: failed to calculate child bits for subtree ", subTreeKey, childErr);
                            return childErr;
                        }
                        // there really should be some freaking children here unless the existance of the //  
                        subTreeStatus = this.cubeCache.get(subTreeKey)
                        // the calc of the children bits should have put this in the cache. If it's not there, that's an error.
                        if (!subTreeStatus) {
                            console.error("bvts Error: subTreeStatus not found in cache for child that is a parent and is visible. ", subTreeKey)
                            return new Error("bvts Error: subTreeStatus not found in cache for child that is a parent and is visible. " + subTreeKey)
                        }
                        // and, we know it's childBits already.
                        subTreeStatus.childrenBits = childBits
                    }

                    // The one from inside buildSubTree
                    const got = this.buildSubTree(subTreeStatus, cameraPos, depth) // recurse !!! 
                    const err = await got
                    // console.log("got from buildSubTree for ", subTreeKey, ": ", err)
                    if (err) {
                        console.error("bvts Error in buildSubTree for child that is a parent and is visible. ", subTreeKey, err)
                        return err
                    }
                } // if it's not visible then we don't care.
            } else if (oct.ChildExists(tree.childrenBits, i)) { // if there's a leaf node here.
                let aCube = oct.getChildCube(tree.cube, i)
                const visible = this.isCubeVisible(aCube, cameraPos, this.maxRadiusToBeVisible)
                if (visible) {
                    const childKey = oct.cubeToUrlString(aCube)[0] // and it's visible.
                    const childStatus = this.cubeCache.get(childKey)
                    if (!childStatus) {
                        console.error("bvts Error: childStatus not found in cache for child that exists and is visible. ", oct.cubeToUrlString(aCube)[0])
                        return new Error("bvts Error: childStatus not found in cache for child that exists and is visible. " + oct.cubeToUrlString(aCube)[0])
                    }
                    this.showingLeaves.set(childKey, childStatus)
                    // console.log("showing leaf tree ", childKey)
                }
            } else {
                // nothing, empty space.
            }
        } // for each of the 8 children.
        return null
    }

    public async calcChildrenBits(cube: oct.Cube, name: string, previousBits: number): Promise<[number, Error | null]> {

        // if (!oct.HaveChildBits(previousBits)) {
        if (previousBits === -1) {
            // look it up and update the cache and the treeStatus
            // we have to also look up the 8 subtreees numbered 0-7 and then also check for the existence 
            // of the 8 children possible. We want to cache the found ones but a zero bit in the childrenBits is enouggh to know that it's not there, so we don't have to cache the not found ones. 
            // We should only have one or the other, not both, but we should check for both just in case because evil exists.

            // console.log("bvts calculating children bits for tree ", name)

            // eg if the box is testmain-0n0u0e16p-0, 
            const leavesList: (oct.TreeStatus)[] = new Array(8)
            const nodesList: (oct.TreeStatus)[] = new Array(8) // where a 'node' is a parent that has children, and a 'leaf' is a child that has no children. 
            const needToLookUp: oct.Cube[] = []
            const name2indexMap = new Map<string, number>()
            for (let i = 0; i < 8; i++) {
                const childCube = oct.getChildCube(cube, i)
                // aka testmain-0n0u0e15p and testmain-1n0u0e15p are the first two
                const [childKey, err] = oct.cubeToUrlString(childCube)
                if (err) {
                    console.error("bvts Error converting child cube to URL string: ", err)
                    return [-1, err]
                }
                {
                    name2indexMap.set(childKey, i)
                    const tmp = this.cubeCache.get(childKey)
                    if (!tmp) {
                        needToLookUp.push(childCube)
                    } else {
                        leavesList[i] = tmp
                    }
                }
                const asubTree = { ...cube, whichParent: i } as oct.Cube // we could just append -i to the name. lol
                // aka testmain-0n0u0e15p-0 and testmain-0n0u0e15p-1
                const [subTreeKey, err2] = oct.cubeToUrlString(asubTree)
                if (err2) {
                    console.error("bvts Error converting subtree cube to URL string: ", err2)
                    return [-1, err2]
                }
                {
                    name2indexMap.set(subTreeKey, i)
                    const tmp = this.cubeCache.get(subTreeKey)
                    if (!tmp) {
                        needToLookUp.push(asubTree)
                    } else {
                        nodesList[i] = tmp
                    }
                }
            }

            let result: [oct.TreeStatus[], Error | null]

            if (needToLookUp.length === 0) {
                console.log("bvts Error: no children to look up but we thought we needed to look up children. ", name)
                result = [[], null]
            } else {
                // console.log("bvts merged list of children we need to look up for tree ", name, ": ", needToLookUp.map(c => oct.cubeToUrlString(c)[0]))
                result = await octload.TwoWayLookupAndMerge(needToLookUp)
                if (result instanceof Error) {
                    console.error("bvts Error in TwoWayLookupAndMerge: ", result)
                    return [-1, result]
                }
            }
            // now we have to merge this into two arrays, one for the leaves and one for the nodes, and also update the cache with the new treeStatuses.
            // and not with the damn cache. 
            // console.log("bvts got tree statuses for children of ", name, ": ", result[0].map(ts => ts.name))
            // now we walk the results and fill in the two array.
            // There should be no holes when we're done.
            for (let i = 0; i < result[0].length; i++) {
                const treeStatus = result[0][i]
                const treeStatiusName = treeStatus.name
                const index = name2indexMap.get(treeStatus.name)
                if (index === undefined) {
                    // some of these will never happen.
                    console.error("bvts Error: treeStatus name not found in name2indexMap: ", treeStatus.name)
                    return [-1, new Error(`bvts Error: treeStatus name not found in name2indexMap: ${treeStatus.name}`)]
                }
                // how do we know if it's a parent. TwoWayLookupAndMerge can't tell
                // test if childKey ends in '-' and then 0..7 gross.
                const endsWithHyphenDigit = /-[0-7]$/.test(treeStatus.name) // not happy with this technique.    
                treeStatus.isParent = endsWithHyphenDigit
                if (treeStatus.isParent) {
                    nodesList[index] = treeStatus
                } else {
                    leavesList[index] = treeStatus
                }
            }

            // console.log("bvts final leavesList for ", name, ": ", leavesList.map(ts => ts ? ts.name + (ts.found ? " (found)" : " (not found)") : "undefined"))
            // console.log("bvts final nodesList for ", name, ": ", nodesList.map(ts => ts ? ts.name + (ts.found ? " (found)" : " (not found)") : "undefined"))

            // and form the children array for the parent treeStatus
            let madeChildBits = 0//: { exists: boolean, isParent: boolean }[] = []
            for (let i = 0; i < 8; i++) {

                const child = leavesList[i]
                const node = nodesList[i]
                // don't cache the not found because we're never coming back here again unless the cache clears.
                if (child.found) {
                    this.cubeCache.set(child.name, child)
                }
                if (node.found) {
                    this.cubeCache.set(node.name, node)
                }
                if (child.found && node.found) {
                    //console.error("bvts Error: both child and node found for index ", i, " child: ", child.name, " node: ", node.name)
                    // pick the child. It's a leaf node.
                    // better to check creation dates?
                    madeChildBits = oct.SetChildExists(madeChildBits, i, true)
                    madeChildBits = oct.SetIsParent(madeChildBits, i, false)
                } else if (child.found) {
                    madeChildBits = oct.SetChildExists(madeChildBits, i, true)
                    madeChildBits = oct.SetIsParent(madeChildBits, i, false)
                } else if (node.found) {
                    madeChildBits = oct.SetChildExists(madeChildBits, i, false)
                    madeChildBits = oct.SetIsParent(madeChildBits, i, true)
                } else {
                    // redundant to set these to false because madeChildBits starts at 0, but we'll do it for clarity.
                    madeChildBits = oct.SetChildExists(madeChildBits, i, false)
                    madeChildBits = oct.SetIsParent(madeChildBits, i, false)
                }
            }

            // console.log("bvts cache is now: ", Array.from(oct.gCubeCache.entries()).map(e => e[0] + ": " + (e[1].found ? "found" : "not found")).join(", "))

            // console.log("children array we made: ", madeChildBits.toString(16), "for parent ", name)
            // let's hope we don't have to do this again for a long time.
            return [madeChildBits, null]
        }
        return [previousBits, null]
    }

    public async BuildVisibleTree(worldName: string, cameraPos: THREE.Vector3): Promise<Error | null> {

        this.showingLeaves.clear()
        // generate the 8 octants.
        // We will see if they exist before we look for their names and cache them
        const octants: { name: string, cube: oct.Cube }[] = []
        // I'm not sure if these are in the right order.  
        // Maybe just generate the names and then get the cubes from the names?
        let index = 0
        for (let z = 0; z >= -1; z--) {
            for (let y = 0; y >= -1; y--) {
                for (let x = 0; x >= -1; x--) {
                    const a0: oct.Cube = {
                        world: worldName,
                        x: x * 2 ** 16,
                        y: y * 2 ** 16,
                        z: z * 2 ** 16,
                        p: 16,
                        whichParent: index
                    }
                    const [s, err] = oct.cubeToUrlString(a0)
                    if (err) {
                        console.error("Error generating URL string for cube: ", err)
                        continue
                    }
                    octants.push({ name: s, cube: a0 })
                    index++
                }
            }
        } // end gen 8 octants
        const octantNames = octants.map(o => oct.cubeToUrlString(o.cube)[0])
        // console.log("Generated octant names: ", octantNames)
        // I'm not sure that the stupid -n suffixes on these make sense but they are correct! 

        // We shall build this. it will be in the cache. 
        // We just need to check if it's visible and if so, recurse into it.
        const octantList: oct.TreeStatus[] = new Array(8)

        // I know that testmain-0n0u0e16p-0, exists, for instance. 
        // and 'testmain-0n0u1w16p-4' exists. We need the names to match.
        // fill the cache. Including the not found. This is just for the top level.
        const getMe = []
        let i = 0
        for (const octant of octants) {
            let treeStatus = this.cubeCache.get(octant.name)
            if (!treeStatus) {
                getMe.push(octant.cube)
            } else {
                octantList[i] = treeStatus
            }
            i++
        }
        // get all the missing ones in one batch.
        if (getMe.length > 0) {
            let result = [] as oct.TreeStatus[]
            // show me the getMe so I can make a test elsewhere:  
            // console.log("BuildVisibleTree about to call TwoWayLookupAndMerge for octants. getMe: ", JSON.stringify(getMe, null, 2))
            const tmp = await octload.TwoWayLookupAndMerge(getMe)
            if (tmp instanceof Error) {
                console.error("Error in TwoWayLookupAndMerge: ", tmp)
                return tmp
            } else {
                result = tmp[0]
            }
            // you know, the getMe.length and the result.length should match. If they don't, something is very wrong.
            if (getMe.length !== result.length) {
                console.error("Error: getMe length does not match result length. ", getMe.length, result.length)
                return new Error(`Error: getMe length does not match result length. GetMe length: ${getMe.length}, result length: ${result.length}`)
            }
            for (const treeStatus of result) {
                treeStatus.isParent = true // we just say so.
                this.cubeCache.set(treeStatus.name, treeStatus)
                const lastChar = treeStatus.name[treeStatus.name.length - 1]
                const index = parseInt(lastChar)
                if (isNaN(index) || index < 0 || index > 7) {
                    console.error("Error: invalid treeStatus name format, cannot extract index. ", treeStatus.name)
                    return new Error(`Error: invalid treeStatus name format, cannot extract index. Name: ${treeStatus.name}`)
                }
                octantList[index] = treeStatus
            }
            // boom baby
            // console.log("got tree statuses for octants: ", octantList.map(ts => ts.name))
        }
        // let's go over them again. fill stuff in.
        for (const tree of octantList) {
            if (tree.found) {
                if (tree.childrenBits === -1) { // needs init.
                    const [newBits, err] = await this.calcChildrenBits(tree.cube, tree.name, tree.childrenBits)
                    if (err) {
                        console.error("Error calculating children bits for tree ", tree.name, err)
                        return err
                    }
                    tree.childrenBits = newBits
                }
            }
        }
        // are we good up to here?
        // does the octantList have all it's child bits?
        // console.log("octantList after calcChildrenBits: ", octantList.map(ts => ({ name: ts.name, found: ts.found, childrenBits: ts.childrenBits.toString(16) })))
        // for each of the 8 calc their child bits and recurse.
        for (let i = 0; i < octantList.length; i++) {
            if (!octantList[i]) {
                console.error("Error: octantList has undefined entry at index ", i)
                return new Error(`Error: octantList has undefined entry at index ${i}`)
            }
            const treeStatus = octantList[i]
            if (treeStatus.found) {
                // that's a whole octant. 
                // we need to walk through the subtrees.
                for (let j = 0; j < 8; j++) {
                    if (oct.IsParent(treeStatus.childrenBits, j)) {
                        const subTreeCube = oct.getChildCube(treeStatus.cube, j)
                        const subTreeKey = oct.cubeToUrlString({ ...subTreeCube, whichParent: j })[0]

                        // it's 'testmain-0n0u0e15p-0' it should be in the cache when we get there. 
                        // how did we know there's a child here? Because the child bits say it's a parent. How.
                        // We will find out more about it when we recurse into it.
                        let subTreeStatus = this.cubeCache.get(subTreeKey) //  
                        if (!subTreeStatus) {
                            const [childBits, err2] = await this.calcChildrenBits(subTreeCube, subTreeKey, -1) // always.
                            if (err2) {
                                console.error("bvts Error calculating children bits for subtree ", subTreeKey, err2)
                                return err2
                            }
                            subTreeStatus = this.cubeCache.get(subTreeKey) // calcChildrenBits will have cached it
                            if (!subTreeStatus) {
                                console.error("bvts Error: subTreeStatus not found in cache for child that is a parent and is visible. ", subTreeKey)
                                return new Error("bvts Error: subTreeStatus not found in cache for child that is a parent and is visible. " + subTreeKey)
                            }
                            subTreeStatus.childrenBits = childBits
                        }
                        // recurse from an octant into its child subtree. This will walk down the tree until it hits the leaves and fill in the showingLeaves map with the visible leaves.
                        // the first one from BuildVisibleTree, level is 0
                        const errP = this.buildSubTree(subTreeStatus, cameraPos, 0)
                        const err = await errP
                        if (err) {
                            console.error("bvts Error in buildSubTree: ", err)
                            return err
                        }
                    } else if (oct.ChildExists(treeStatus.childrenBits, j)) {
                        const childCube = oct.getChildCube(treeStatus.cube, j)
                        const childKey = oct.cubeToUrlString(childCube)[0]
                        const childStatus = this.cubeCache.get(childKey)
                        if (!childStatus) {
                            console.error("bvts Error: childStatus not found in cache for child that exists and is visible. ", oct.cubeToUrlString(childCube)[0])
                            return new Error("bvts Error: childStatus not found in cache for child that exists and is visible. " + oct.cubeToUrlString(childCube)[0])
                        }
                        if (this.isCubeVisible(childCube, cameraPos, this.maxRadiusToBeVisible)) {
                            this.showingLeaves.set(childKey, childStatus)
                            console.log("showing leaf tree ", childKey)
                        }
                    } else {
                        // nothing, empty space.
                    }
                }
            }
        }

        // TODO: make into separate functions.
        // before we return, let's check if we need the TXT records.
        // dammit, we do. We need the groupId to know which ones belong together for rendering.
        // make this a function.
        const needGroupIdLookup: oct.Cube[] = []
        for (const [key, treeStatus] of this.showingLeaves) {
            if (treeStatus.groupId === undefined) {
                // we haven't looked it up yet. Let's look it up and fill in the groupId.
                needGroupIdLookup.push(treeStatus.cube)
            }
        }
        if (needGroupIdLookup.length > 0) {
            // a two way lookup ?? yep.
            const a = octload.TwoWayLookupPart1(needGroupIdLookup, "TXT", "meta_group_id")
            // totally annoying how this is hard to use.
            const result = await a
            // then the AI writes it and it's fluffy.
            for (const part of result) { // first the vr list and then the xyz list
                const settled = await part
                if (settled.status === "fulfilled") {
                    const answers = await settled.value
                    if (answers instanceof Error) {
                        console.error("bvts Error in TwoWayLookupPart1 answers: ", answers)
                        continue
                    }
                    const responses: atwdns.DnsResponse[] = answers
                    let index = 0
                    for (const dnsResponse of responses) {
                        // we have the TXT record. We need to parse it and find the cube it belongs to and then update the cache and the showingLeaves with the groupId.
                        try {
                            const str = dnsResponse.Answer?.[0]?.data
                            if (!str) {
                                continue
                            }
                            // I should just be a dick and grep the answer right out of the middle of the bytes returned. But, I'm not.
                            // console.log("got TXT record data for groupId lookup: ", str)   // got it!  
                            const grp = JSON.parse(str) as oct.GroupTextParameters
                            // now, who were we? lol
                            const got = needGroupIdLookup[index]
                            // console.log("got TXT record data for groupId lookup: ", str)
                            const treeStatus = this.cubeCache.get(oct.cubeToUrlString(got)[0])
                            if (!treeStatus) {
                                console.error("bvts Error: treeStatus not found in cache for cube that has a groupId TXT record. ", got)
                                continue
                            }
                            // in case the xyz ALSO  has a value, just keep the first one. 
                            // we already screened for the ones needing a groupId lookup, 
                            if (!treeStatus.groupId) {
                                treeStatus.groupId = grp
                            }
                            this.cubeCache.set(treeStatus.name, treeStatus)
                            if (this.showingLeaves.has(treeStatus.name)) { // this is stupid. It's the same object.
                                this.showingLeaves.set(treeStatus.name, treeStatus)
                            }
                        } catch (err) {
                            console.error("bvts Error parsing TXT record data as JSON for groupId lookup: ", err, " data: ", dnsResponse)
                        }
                        index++
                    }
                } else {
                    console.error("bvts Error in TwoWayLookupPart1 for groupId lookup: part1 promise rejected: ", part)
                }
            }
        }
        return null
    }

    // TODO: make virtual and do fancier stuff with it later. For now, just a simple distance check.
    public isCubeVisible(cube: oct.Cube, cameraPos: THREE.Vector3, distance: number) {

        let closestX = Math.max(cube.x, Math.min(cameraPos.x, cube.x + 2 ** cube.p))
        let closestY = Math.max(cube.y, Math.min(cameraPos.y, cube.y + 2 ** cube.p))
        let closestZ = Math.max(cube.z, Math.min(cameraPos.z, cube.z + 2 ** cube.p))

        let dx = closestX - cameraPos.x
        let dy = closestY - cameraPos.y
        let dz = closestZ - cameraPos.z

        let distSquared = dx * dx + dy * dy + dz * dz
        return distSquared < distance * distance
    }
}

// PrepareToReserveProperty will prepare a list of missing names to reserve. 
// It does not actually do the reservation, but it will check the cache and return a list of the ones that are missing.
// The idea is that we can then batch those missing ones together and reserve them all at once, and then update the cache with the new ones.
// it does not have to be swift. Doesn't happen during render, it can be a button click or something.
// export async function PrepareToReservePropertyBatch(startingProperties: string[], cache: Map<string, oct.TreeStatus>): Promise<[oct.ReserveResult, Error | null]> {

//     let result: oct.ReserveResult = {
//         startingProperties,
//         thingsThatAlreadyExist: [],
//         thingsToActuallyReserve: [],
//         rawChains: [],
//         cubeCache: cache,
//         error: null
//     }
//     for (const property of startingProperties) {
//         console.log(`Processing property ${property}`)
//         // do we check if this property exists and if we own it? 
//         // now? 
//         let rawChainCubes: oct.Cube[] = []
//         let [c, err] = oct.stringToCube(property)
//         if (err) {
//             console.error(`Error parsing property ${property}: ${err}`)
//             return [result, err]
//         }
//         // fill the raw chain
//         rawChainCubes.push(c) // the child
//         while (c.p < 16) {
//             const [parent, i] = oct.getParentCubeWithOcttreeIndex(c)
//             rawChainCubes.push({ ...parent, whichParent: i })
//             c = parent
//         }
//         result.rawChains.push(rawChainCubes)
//         // let's take a look. Print the rawChainCubes
//         // a little verbose console.log(rawChainCubes)
//         // itarate through the rawChainCubes  
//         for (const cubeParent of rawChainCubes) {
//             const [name, err] = oct.cubeToUrlString(cubeParent)
//             if (err) {
//                 console.error(`Error converting cube to URL string: ${err}`)
//                 continue
//             }
//         }
//     }
//     return [result, null]
// }


// // mockDnsMap changes a domain name + an "A" or a "TXT" to a domain name. This is to simulate the DNS resolution that we would do to check if a property is reserved or not.
// // const mockDnsMap = new Map<string, string>([
// //     ["testmain-0n0u0e5p", "testmain-0n0u0e5p"], // this one is already reserved, so we should see it in the cache and not try to reserve it again.
// //     ["testmain-1n0u0e-1p", "testmain-1n0u0e-1p"] // this one is not reserved, so we should see it as missing and try to reserve it.
// // ])

// type twlmPart1ResponsePair = Promise<[PromiseSettledResult<atwdns.DnsResponse[] | Error>, PromiseSettledResult<atwdns.DnsResponse[] | Error>]>

// // eg 
// export async function TwoWayLookupPart1(rawChain: oct.Cube[], recordType: "A" | "TXT", prefix?: string): Promise<twlmPart1ResponsePair> {

//     // for each name in a rawChain, check if it exists.
//     const vrNames: string[] = []
//     const zyzNames: string[] = []
//     for (const cubeParent of rawChain) {
//         const [name, err] = oct.cubeToUrlString(cubeParent)
//         if (err) {
//             console.error(`Error converting cube to URL string: ${err}`)
//             continue
//         }
//         let vrName = `${name}.vr`
//         let xyzName = `${name}.xyz`
//         if (prefix) {
//             vrName = `${prefix}.${vrName}`
//             xyzName = `${prefix}.${xyzName}`
//         }
//         vrNames.push(vrName)
//         zyzNames.push(xyzName)
//     }
//     const vrCommaNames = vrNames.join(",")
//     const zyzCommaNames = zyzNames.join(",")
//     const howMany = vrNames.length

//     const got = Promise.allSettled([
//         atwdns.FetchDnsResponseTryHard(vrCommaNames, recordType, "none-no-dns-server", true, howMany),
//         atwdns.FetchDnsResponseTryHard(zyzCommaNames, recordType, atwdns.currentDnsServer, false, howMany)
//     ])
//     return got
// }

// // ThreeWayLookupAndMerge will attempt to find the names as .xyz names
// // then it will try to find them as .vr names, and then it will merge the results together.
// // a rawChain is just a list of cubes from the leaf to the root. 
// // We will check later if they exists when they should not.
// // note that the TXT parts are not filled out.
// export async function TwoWayLookupAndMerge(rawChain: oct.Cube[]): Promise<[oct.TreeStatus[], Error | null]> {

//     const results: oct.TreeStatus[] = []
//     // call FetchDnsResponseTryHard twice in parallel, once with knotfreeNative true and once with knotfreeNative false, and then merge the results together.
//     const p1result = await TwoWayLookupPart1(rawChain, "A")

//     let vrResult: atwdns.DnsResponse[]
//     let xyzResult: atwdns.DnsResponse[]

//     const vrResultSettledPrmise = await p1result[0]
//     if (vrResultSettledPrmise.status === 'fulfilled') {
//         const tmp = vrResultSettledPrmise.value
//         if (tmp instanceof Error) {
//             console.error(`Error fetching VR DNS response: ${tmp}`)
//             return [results, tmp]
//         }
//         vrResult = tmp
//         // console.log('VR Success for', vrResult);

//     } else {
//         console.log('VR Failed with reason:', vrResultSettledPrmise.reason);
//         return [results, vrResultSettledPrmise.reason instanceof Error ? vrResultSettledPrmise.reason : new Error(String(vrResultSettledPrmise.reason))]
//     }
//     const xyzResultSettledPrmise = await p1result[1]
//     if (xyzResultSettledPrmise.status === 'fulfilled') {
//         const tmp = xyzResultSettledPrmise.value
//         if (tmp instanceof Error) {
//             console.error(`Error fetching XYZ DNS response: ${tmp}`)
//             return [results, tmp]
//         }
//         xyzResult = tmp
//         xyzResult = tmp
//         // console.log('XYZ Success for', xyzResult);

//     } else {
//         console.log('XYZ Failed with reason:', xyzResultSettledPrmise.reason);
//         return [results, xyzResultSettledPrmise.reason instanceof Error ? xyzResultSettledPrmise.reason : new Error(String(xyzResultSettledPrmise.reason))]
//     }
//     if (vrResult.length !== rawChain.length || xyzResult.length !== rawChain.length) {
//         const err = new Error(`Unexpected result length from FetchDnsResponseTryHard. Expected ${rawChain.length} but got ${vrResult.length} and ${xyzResult.length}`)
//         console.error(err)
//         return [results, err]
//     }
//     for (let i = 0; i < rawChain.length; i++) {
//         const cube = rawChain[i]
//         const [cubename, err] = oct.cubeToUrlString(cube)
//         if (err) {
//             console.error(`Error converting cube to URL string: ${err}`)
//             return [results, err]
//         }
//         const cubeVr: atwdns.DnsResponse = vrResult[i]
//         const cubeXyz: atwdns.DnsResponse = xyzResult[i]
//         // console.log(`VR DNS response for ${cubeVr.Question[0].name}:`, cubeVr)
//         // console.log(`XYZ DNS response for ${cubeXyz.Question[0].name}:`, cubeXyz)

//         const status: oct.TreeStatus = {
//             name: cubename,
//             cube: cube,
//             level: cube.p,
//             //  index: -1,
//             found: false,
//             isParent: false,
//             wasXYZ: false,
//             childrenBits: -1,
//             error: null
//         }
//         if (cubeVr.Status === atwdns.DnsStatusCode.NOERROR && cubeXyz.Status === atwdns.DnsStatusCode.NOERROR) {
//             // we got them both.
//             // which one is has an older creation date? 
//             // TODO: get the creation date from the nameservice and use that to decide which one is older. 
//             status.found = true
//             status.wasXYZ = true
//         }
//         else {
//             if (cubeXyz.Status === atwdns.DnsStatusCode.NOERROR) {
//                 status.found = true
//                 status.wasXYZ = true
//             } else if (cubeVr.Status === atwdns.DnsStatusCode.NOERROR) {
//                 status.found = true
//             } else {
//                 status.found = false
//             }
//         }
//         // they are never parents. How do we know if they are parents? Check for -N suffix. What a hack.
//         // not doing that here.
//         // if (status.found && !status.isParent && cubeVr.Answer) {
//         if (status.found && cubeVr.Answer) {
//             status.addresses = cubeVr.Answer.map(a => a.data || "").filter(d => d)
//         }
//         results.push(status)
//     }
//     return [results, null]
// }

// // if the property is already exists, or we find it in the cache (same thing) then we CAN'T reserve it. 
// // actually, if ANY of the parents are not parents and are actually leaves then, also a fail.
// // please tell me this works in a browser environment. I'm nervious about .map and stuff.
// export async function VerifyReservePropertyBatch(result: oct.ReserveResult): Promise<[oct.ReserveResult, Error | null]> {

//     // check for leafs. If any of the parents are actually leafs, then we can't reserve this property. 
//     // This is a failure case that we need to handle.
//     for (const rawChain of result.rawChains) {
//         const leafList: string[] = []
//         const cubesAsLeaves: oct.Cube[] = []

//         // the raw chain is leaf and parents. 
//         // we just want to check leaves. 
//         for (const cubeParent of rawChain) {
//             const parentAsChild = {
//                 x: cubeParent.x,
//                 y: cubeParent.y,
//                 z: cubeParent.z,
//                 p: cubeParent.p,
//                 world: cubeParent.world
//             } as oct.Cube
//             const [name, err] = oct.cubeToUrlString(parentAsChild)
//             if (err) {
//                 err.message += (`Error converting cube to URL string: ${err}`)
//                 console.error(err)
//                 return [result, err]
//             }
//             leafList.push(name)
//             cubesAsLeaves.push(parentAsChild)
//         }
//         // note that the final leaf and it's parent have the same name, 
//         // but the final leaf is actually a leaf and the parent is actually a parent. 
//         let commaList = ""
//         if (leafList.length > 1 && leafList[0] === leafList[1]) {
//             commaList = leafList.slice(1).join(",")
//         }
//         else {
//             commaList = leafList.join(",")
//         }
//         // lets make leafList into a command separated string and print it out.
//         // console.log(`Leaf list for property ${result.startingProperties[0]}: ${commaList}`)
//         const mergResults = TwoWayLookupAndMerge(cubesAsLeaves)
//         const [treeStatuses, err] = await mergResults
//         if (err) {
//             console.error(`Error in TwoWayLookupAndMerge: ${err}`)
//             return [result, err]
//         }
//         // we should have a treeStatus for each cube in the rawChain. 
//         if (treeStatuses.length !== rawChain.length) {
//             const err = new Error(`Unexpected treeStatuses length from TwoWayLookupAndMerge. Expected ${rawChain.length} but got ${treeStatuses.length}`)
//             console.error(err)
//             return [result, err]
//         }
//         // we should check if any of the treeStatuses are found and are leaves. If so, then we can't reserve this property. 
//         // if it's a problem, and we reserved the leaf but can't to the rest then
//         // delete the leaf, if it's our and try again.
//         // we can also check if the leaf is reserved by us, and if so then we can just delete it and try again.
//         for (const ts of treeStatuses) {
//             if (ts.found) {
//                 const err = new Error(`Cannot reserve property ${result.startingProperties[0]} because parent ${ts.name} is already a leaf.`)
//                 console.error(err)
//                 return [result, err]
//             }
//             // console.log(`Tree status for ${ts.name}: found=${ts.found}, isParent=${ts.isParent}, wasXYZ=${ts.wasXYZ}`)
//         }
//     }
//     return [result, null]
// }

// // PrepareTheLists assumes VerifyReservePropertyBatch has passed
// // it's going to check for what's already reserved in the various dns servers and prepare the lists of what we will actually need to reserve.
// export async function PrepareTheLists(result: oct.ReserveResult): Promise<[oct.ReserveResult, Error | null]> {

//     const cubeSet = new Map<string, oct.Cube>()
//     for (const rawList of result.rawChains) {
//         for (const cube of rawList) {
//             cubeSet.set(oct.cubeToUrlString(cube)[0], cube)
//         }
//     }
//     console.log("All cubes we will need to reserve:", cubeSet) // from all the chains from all the starting properties. 
//     // it dedupes the parents.
//     const cubeArray = Array.from(cubeSet.values())

//     // a big fat lookup.
//     const [mergeResults, e] = await TwoWayLookupAndMerge(cubeArray)
//     if (e) {
//         const err = new Error(`Error during TwoWayLookupAndMerge: ${e.message}`)
//         console.error(err)
//         return [result, err]
//     }
//     // subtract the ones we already have from the ones we need to reserve.
//     for (let i = 0; i < mergeResults.length; i++) {
//         const ts = mergeResults[i]
//         if (!ts.cube) {
//             const err = new Error(`Error: When does this happen? ${ts.name}`)
//             console.error(err)
//             return [result, err]
//         }
//         if (ts.found && ts.cube) {
//             result.thingsThatAlreadyExist.push({ cube: ts.cube, from: ts.wasXYZ ? "xyz" : "vr" })
//         }
//     }
//     // that was fun.
//     // console.log("Things that already exist:", result.thingsThatAlreadyExist)
//     // subtract it from the stuff we'd need to buy and that gives us the stuff we actually need to reserve.
//     // subtract from the cubeSet.
//     for (const existing of result.thingsThatAlreadyExist) {
//         cubeSet.delete(oct.cubeToUrlString(existing.cube)[0])
//     }
//     result.thingsToActuallyReserve = Array.from(cubeSet.values())
//     console.log("Things we actually need to reserve:", result.thingsToActuallyReserve)
//     // looks good. We have the list of things we actually need to reserve, and the list of things that already exist. We can use this to show the user what they are about to reserve, and what they already have.

//     return [result, null]
// }


