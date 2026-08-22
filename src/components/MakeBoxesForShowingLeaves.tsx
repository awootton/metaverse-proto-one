import React from "react"

import { MakeBoxesForDemoSpaces } from "./DemoProperties"
import { CubeWithEdges, LeafRenderingComponent } from "./MiscCubeRenderElements"
import { MainWorldDisplayProps } from './MainWorldDisplay';
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';
import * as leaves from "./MiscCubeRenderElements"
import * as outlines from "./OutlineBoxComponent"
import * as demo from "./DemoProperties"
import { Suspense, useRef } from 'react';
import * as pubsub from '../knotfree-ts-lib/avatars/PubSubTopicAndSubscribers'
import { AuxGroupRender, RenderThingsWithAuxGroupProps } from './AuxGroupRenderer'
import * as oxy from '../knotfree-ts-lib/3d/Dns8Tree'
import { MaketheGroups } from "./MakeTheGroups";

// see that white space? That's how much simpler it's become. Now clean it up. lol.

export type MakeBoxesForShowingGroupsProps = {
    worldName: string // like a traditional at this point.
    onlyShowOutlineBoxes: boolean
    showOriginAxis: boolean
    showingLeaves: string[] // these are the leaves that are being shown. They are the names of the leaves. 
}
import { mainpubsub } from '../App';
// don't use this: import * as pubsub from '../knotfree-ts-lib/avatars/PubSubTopicAndSubscribers'
// This one actually returns elements. Either make the frames or 
// or make the actual results for the group renderer.
// note that WE depend on the leaves but MaketheGroups does not.
export function MakeBoxesForShowingGroups(props: MakeBoxesForShowingGroupsProps) {

    // it's the "onlyShowOutlineBoxes" feature. It will be used for the demo spaces and for the orbital view.
    // xray mode. Do nothing else. It's x-ray. 
    if (props.onlyShowOutlineBoxes) {

        // in which it's ALL one big batch,
        // we're going to need the real leaves here.
        // convrt the showingLeaves to a list of cubes
        // const cubeList = props.showingLeaves.map(leaf => leaf.cube)
        // we'll just parse them, and verifies too.
        const cubeList: oxy.Cube[] = []
        for (let i = 0; i < props.showingLeaves.length; i++) {
            const leafName = props.showingLeaves[i]
            const [cube, err] = oxy.StringToCube(leafName)
            if (err) {
                console.error("MakeBoxesForShowingLeaves: error converting leafName to cube ", leafName, err)
                continue
            }
            cubeList.push(cube)
        }
        return (<>
            <MakeBoxesForDemoSpaces
                worldName={props.worldName}
                demoCubeList={cubeList} // this is wrong. What is it?
                color={"black"} // optional color for the boxes. If not provided, will default to green.
            />
        </>
        )
    }
    return (<>
        <MaketheGroups worldName={props.worldName} />
    </>)

}


// Some properties come in groups, like a street. We can handle them all as a group and gain great drawing efficiencies.
// We create a map of groupId to list of leaves. Then we can render them all at once.
// We use an AuxLeafStatus to store the group information, like the master name, type, asset, and list of leaves. 
// we used to use this to group boxes that were the same color or texuure but that's over. 

// MainWorldDisplay calls this with its fresh list of showingLeaves. It will be called again if the showingLeaves change. 

// I'm sure there's more economical ways to do this but I have very little content now
// and no time to debug stuff I could have had CP triple check. 

// 1) walk all the leaves and if they they have not 'id' then we use their cubename ad an id.
// 2) group them by id.
// 3) find a cubename that will be the URL for each group. 
//        It will be the masterName of the AuxLeafStatus. TXT records are supposed to declare this in their groups.
// 4) reconcile with the AuxLeafStatus if it exists. If not, create a new one.
// 5) publish the keys (masterNames) to the pubsub topic "NewGroupKeys" as string[] for the iFrames, and MakeTheGroups to subscribe to.
// 6) publish those same keys to the renderer, MakeTheGroups.

// This is not return a JSX.Element. It publishes. 

// we run it in the MainWorldDisplay component, it takes some time and then returns nothing.

export function MakeAuxGroupsFromShowingLeaves(props: MainWorldDisplayProps) {

    if (props.showingLeaves.length === 0)
        return null

    // use the demo technique with just a bunch or obtimized lines all at once.

    // this is the feature where we only show the outlines of everything (X-Ray) so no grouping needed.

    // not using this. We're publishing the group2LeafListMap and that subscriber will make the elements.

    // const results: JSX.Element[] = [] // we put the fragments in here and return them at the end.

    // first group them by groupId and then make a single OutlineBoxComponent for each groupId.
    // Here are some examples:: 
    // 5zQ1bN6r2vW8mP3L4j9KxYtC:cobblestonesgrok512.jpg:repeat:20  value:  {masterName: 'testmain-0n0u0e5p.vr', type: 'floor', asset: 'cobblestonesgrok512.jpg:repeat:20', leaves: Array(1), groupInfo: {…}}
    // TmiPiEvT1Hz6WyJB7pKisyuF:color:#88674E                      value:  {masterName: 'testmain-2s1d2w9p.vr', type: 'ceiling', asset: 'color:#88674E', leaves: Array(16), groupInfo: {…}}
    // TmiiPiEvT1HsyuFz6WyJB7pK:street.jpg                         value:  {masterName: 'testmain-1n0u1w4p.vr', type: 'floor', asset: 'street.jpg', leaves: Array(57), groupInfo: {…}}
    // j9K2vW8mP3xY5zQ1bN6rL4tC:undefined                          value:  {masterName: 'testmain-2n0u7w2p.vr', type: '', asset: 'no-asset-found', leaves: Array(1), groupInfo: {…}}
    // oXwlQzOq9NOKNuvH7XcLUdJ9:color:orange                       value:  {masterName: 'testmain-2n0u5w2p.vr', type: 'floor', asset: 'color:orange', leaves: Array(1), groupInfo: {…}}
    // VcLCjRUHES4lhCDVMOJM22K2:color:orange  has no masterName, forcing it to be the first leaf in the list. 
    //                                                             value:  {masterName: '', type: 'floor', asset: 'color:orange', leaves: Array(1), groupInfo: {…}}
    // VcLCjRUHES4lhCDVMOJM22K2:color:orange                       value:  {masterName: 'testmain-2n0u4w2p.vr', type: 'floor', asset: 'color:orange', leaves: Array(1), groupInfo: {…}}

    // we have some antique TXT annotations we can add in the DNS records for simple coloring and texturing. 
    // It's being deprocated.

    type XXXGroupInfo = {
        masterName: string // HAVE tld.
        type: string
        asset: string
        groupInfo: oct.GroupTextParameters // just repeat it here for convenience
        leaves: oct.TreeStatus[]
    }

    // These group themselves by having the same groupId.id.
    // They will use the same iFrame and the same masterName. The masterName is a leaf name and becomes the URL.
    // We will NOT have a TLD on the masterName. I changed my mind.
    // There are ways to recover the TLD when necessary (see aux2LocalUrl in MakeAnIFrame.tsx.)
    // It is distressingly similar to an AuxRecord. Maybe someday some can merge them.
    // this is the source of the iFrame list in MakeListOfiFrames and MakeAnIFrame.tsx.
    // It is sent to them by 'publish'. 
    // this is not being kept and will be rebuilt every time the showingLeaves change. It is not being cached in the oct.
    // each of these will become an AuxLeafStatus  

    //   export type GroupTextParameters = {
    //     id: string, // usually just a random string but some share a common id. For instance, 
    //     dbg?: string, // example  localhost:3010, ignore in prod.
    //     master: string // for the iFrame to connect to. 
    //     type?: string // example: floor, ceiling and that's it?
    //     asset?: string // example: url to a file like street.jpg, or Duck.gtl or color:#808080. Just the three so far and gltf has to go away. 
    // }


    type BatchInfo = {
        key: string // the groupId.id and NOT the masterName. The masterName a leaf name.
        masterName: string // HAVE tld. for iFrame later,
        //   type: string
        //  asset: string just use groupInfo asset
        groupInfo: oct.GroupTextParameters
        leaves: oct.TreeStatus[]  // maybe have names here instead - no.
        auxRecord: oct.AuxLeafStatus | null // overrides the asset and the type.
    }

    function isNameBad(masterName: string): boolean {
        if (masterName == null || masterName == undefined || masterName.length === 0) {
            return true
        }
        const [cube, err] = oct.StringToCube(masterName)
        if (err) {
            return true
        }
        return false
    }


    // the key is the groupId.id and NOT the masterName. The masterName a leag name.
    // the key is a pseudo-random string that is the same for all leaves in the group. It's the meta_group_id in the TXT record.

    // Not export
    const group2LeafListMap = new Map<string, BatchInfo>()

    function GetBatchInfo(key: string): BatchInfo | undefined {
        return group2LeafListMap.get(key)
    }

    function SetBatchInfo(key: string, batchInfo: BatchInfo): void {
        group2LeafListMap.set(key, batchInfo)
    }

    function GetAllBatchInfoEntries(): IterableIterator<[string, BatchInfo]> {
        return group2LeafListMap.entries()
    }

    // console.log("MakeBoxesForShowingLeaves all the leavees just walked in here ", props.showingLeaves.length)

    // 1) walk all the leaves and if they they have not 'id' then we use their cubename 
    // they are just names. Get the TreeStatus and fix them 

    for (let i = 0; i < props.showingLeaves.length; i++) {

        const leafName = props.showingLeaves[i]
        const treeStatus = oct.GetTreeStatusFromCache(leafName)
        if (treeStatus === undefined) {
            console.error("ERROR HUGE ERROR MakeBoxesForShowingLeaves: error looking up treeStatus for leafName ", leafName)
            continue
        }

        if (!treeStatus.groupId) {
            // This should never happen. Now it didn't happen twice.
            treeStatus.groupId = { id: leafName, type: "", asset: "", master: "" } // force a groupId on it. It will be a singleton group.
        }

        // all the goofy asset, type, and masterName stuff is in the original TXT string in the LeafStatus.
        // we can deal with it later.

        // the key is the groupId.id 
        const key = treeStatus.groupId.id

        // group them by the groupId.id. This is the meta_group_id in the TXT record. It is a random string that is the same for all leaves in the group.

        // 2) group them. -- we're still looping over leaves.

        let info: BatchInfo | undefined = GetBatchInfo(key)
        if (!info) {
            // make a new one
            const newGrpInfo: BatchInfo = { // fill it in
                key: key,
                masterName: "",
                leaves: [],
                //: "",
                groupInfo: treeStatus.groupId, // 
                auxRecord: null
            }
            info = newGrpInfo
            info.leaves.push(treeStatus) // add ourselves to the list of leaves for this group.
            SetBatchInfo(key, info) // put it in the map.
        } else {
            info.leaves.push(treeStatus) // add ourselves to the list of leaves for this group.
            SetBatchInfo(key, info) // put it in the map.
        }
        // Maybe we can set the master name now.
        if (isNameBad(info.masterName)) { // like, it's empty or not a cube name. 
            if (!isNameBad(treeStatus.groupId.master)) { // and the TXT record claimns it's the master.
                info.masterName = treeStatus.groupId.master // give it the name
            }
        }
    }// end of loop over leaves.

    //  now they are grouped by groupId.id. 

    // 3) find a cubename that will be the URL for each group. It will be the masterName of the AuxLeafStatus.

    // There still might be a numerical or empty masterName. We need to fix that. The masterName is the URL for the iFrame. 
    // It will NOT be the name of the first leaf in the group. 
    // we'll sort them first. lol
    // loop over the groups:
    for (const [key, batchInfo] of GetAllBatchInfoEntries()) {
        if (isNameBad(batchInfo.masterName)) {
            // find the first leaf in the group that has a valid name and use that as the masterName.}
            const sortedLeaves = batchInfo.leaves.sort((a, b) => a.name.localeCompare(b.name))
            batchInfo.masterName = sortedLeaves[0].name
        }
    }
    // that should settle the masterName for each group. with huge overkill.


    // some of them may still have no masterName. 
    // first check if someone said somethhing and we missed it.
    // iterate the groups.
    for (const [key, batchInfo] of GetAllBatchInfoEntries()) {
        let nameIsBad = isNameBad(batchInfo.masterName)
        if (nameIsBad) {
            // now what? 
            console.error("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " has no masterName. value: ", batchInfo)
        }
    }

    // 4) reconcile with the AuxLeafStatus if it exists. If not, create a new one.

    // the keys of the batches are our output.
    for (const [key, batchInfo] of GetAllBatchInfoEntries()) {
        // convert them to AuxLeafStatus and cache them in the oct. as necessary
        // The AuxLeafStatus is what the iFrames will use to render the leaves.
        const [masterCube, err] = oct.StringToCube(oct.NoTld(batchInfo.masterName))
        if (err) {
            console.error("MakeBoxesForShowingLeaves: ERROR converting masterName to cube ", batchInfo.masterName, err)
        }
        let aux = oct.LookupAuxLeafStatus(oct.NoTld(batchInfo.masterName)) // does it have an aux record?
        if (aux == null) {
            // make a new one
            const leaftmpList = []
            { // aux has a simple format for it's leaves. We need to convert 
                for (let i = 0; i < batchInfo.leaves.length; i++) {
                    if (oct.NoTld(batchInfo.leaves[i].name) !== batchInfo.leaves[i].name) {
                        console.error("MakeBoxesForShowingLeaves: batchInfo.leaves[i].name has TLD: ", batchInfo.leaves[i].name, " batchInfo: ", batchInfo)
                    }
                    const cubeName = oct.NoTld(batchInfo.leaves[i].name)
                    const split = cubeName.split("-")
                    if (split.length != 2) {
                        console.error("MakeBoxesForShowingLeaves: cubeName is not in the expected format of world-adddress. cubeName is ", cubeName)
                    }
                    if (split[0] != masterCube.world) {
                        console.error("MakeBoxesForShowingLeaves: world does not match masterCube. cubeName is ", cubeName, " masterCube is ", masterCube)
                    }
                    leaftmpList.push(split[1]) // just the address part.
                }
            }
            if (oct.NoTld(batchInfo.masterName) !== batchInfo.masterName) {
                console.error("MakeBoxesForShowingLeaves: batchInfo.masterName has TLD: ", batchInfo.masterName, " batchInfo: ", batchInfo)
            }
            // make a new one
            // are we really going to drag along all this old crap? blech.
            const newAux: oct.AuxLeafStatus = {
                wholeMaster: oct.NoTld(batchInfo.masterName),
                justTheWorld: oct.worldFromCubeName(batchInfo.masterName),
                leaves: leaftmpList,
                txtParams: batchInfo.groupInfo,
                glbItems: new Map<string, oct.GlbStatus>()
            }
            let oldeTxtJunkDirty = false
            const group = batchInfo.groupInfo
            var asset = batchInfo.groupInfo.asset //batchInfo.asset
            if (!asset) {
                asset = "color:brown" // default to violet if no asset is provided.
                oldeTxtJunkDirty = true
            }
            var type = batchInfo.groupInfo.type
            if (!type) {
                type = "floor" // a common stupid and lazy case.
                oldeTxtJunkDirty = true
            }
            var oldeTxtJunk: oct.OldeTxJunk = {
                color: "",
                textureUrl: "",
                repeat: 1,
                type: type,
                asset: asset
            }

            // fill it with the antiques.
            if (asset.startsWith("color:")) {
                const colorMatch = asset.match(/color:(#[0-9a-fA-F]{6}|[a-zA-Z]+)/)
                if (colorMatch) {
                    // newAux.backupColor = colorMatch[1]
                    oldeTxtJunk.color = colorMatch[1]
                    oldeTxtJunk.type = group.type ? group.type : "floor"
                    oldeTxtJunk.asset = group.asset ? group.asset : "color:" + colorMatch[1]
                    oldeTxtJunkDirty = true

                    // console.log("making boxes color is", oldeTxtJunk.color, " type is ", oldeTxtJunk.type, " asset is ", oldeTxtJunk.asset)
                }
            }

            const parts = asset.split(":")
            const isImage = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(parts[0])
            if (isImage) {
                oldeTxtJunk.textureUrl = parts[0]
                oldeTxtJunk.repeat = 1
                oldeTxtJunkDirty = true
                if (group.asset) { // the same as asset?
                    const repeatMatch = asset.match(/:repeat:(\d+)$/)
                    if (repeatMatch) {
                        oldeTxtJunk.repeat = parseInt(repeatMatch[1])
                        // oldeTxtJunk.repea = asset.replace(/:repeat:\d+$/, "")
                        oldeTxtJunkDirty = true
                    }
                    oldeTxtJunk.asset = asset
                    // console.log("making boxes color is", oldeTxtJunk.color, " type is ", oldeTxtJunk.type, " asset is ", oldeTxtJunk.asset)
                }
            }
            // dude, I don't even want to do GLB url anymore.
            // if ((asset.match(/\.(glb|gltf)$/))) { // glb's
            //     // I'm not. I refuse. I'll do the duck another way.
            // }
            if (group.type) {
                oldeTxtJunk.type = group.type // floor, ceiling, wall, etc.
                oldeTxtJunkDirty = true
            }
            if (oldeTxtJunkDirty) {
                newAux.oldeTxtJunk = oldeTxtJunk
            }
            // so now the Aux is ready.

            // console.log("making boxes old aux junk is", oldeTxtJunk)

            if (newAux.wholeMaster !== batchInfo.masterName) { // this is because of the TLD.  A hug mustake having those. They exist in the AuxLeafStatus and can be looked up 
                // any time but are only EVER used by the uFrame ONCE while generatibg errirs FOREVER.
                // 7/17/26. I'm rolling that out again.
                console.error("MakeBoxesForShowingLeaves: newAux.master does not match batchInfo.masterName. newAux.master: ", newAux.wholeMaster, " batchInfo.masterName: ", batchInfo.masterName)
            }

            oct.CacheAuxLeafStatus(newAux.wholeMaster, newAux) // put it in the map for later retrieval.
            //oct.SetAuxLeafStatus(batchInfo.masterName, newAux) // put it in the map for later retrieval.
            batchInfo.auxRecord = newAux // fill it in for some reason. Why? 
            // the map of batchInfo only even exists here in this function.
        } else {
            // we found it in GetAuxLeafStatus under oct.NoTld( batchInfo.masterName
            // saving again?
            batchInfo.auxRecord = aux
            if (oct.NoTld(batchInfo.masterName) !== batchInfo.masterName) {
                console.warn("MakeBoxesForShowingLeaves: batchInfo.masterName has TLD: ", batchInfo.masterName, " aux.wholeMaster: ", aux.wholeMaster, " batchInfo: ", batchInfo)
            }
            oct.CacheAuxLeafStatus(oct.NoTld(batchInfo.masterName), aux) // ?? 
        }
    } // end of loop over groups and making the AuxLeafStatus.

    // 5) publish the keys (masterNames) to the pubsub topic "group2LeafListMap" as a Map<string, BatchInfo> for the iFrames to subscribe to.

    const theKeys = Array.from(GetAllBatchInfoEntries()).map(([key, batchInfo]) => batchInfo.masterName)
    // console.log("MakeBoxesForShowingLeaves: this are the output keys of the mapping operation: ", theKeys)

    // let's see them all console.log("MakeBoxesForShowingLeaves: Publish them: ", theKeys)

    mainpubsub.publish("NewGroupKeys", theKeys)

    // {
    //     console.log("Dumping masters and aux for them: ")
    //     const dumps = []
    //     for (const key of theKeys) {
    //         const theAux = oct.LookupAuxLeafStatus(key)
    //         if (!theAux) {
    //             console.warn("No AuxLeafStatus found for this master: ", key)
    //             continue
    //         }
    //         let leavesArr = "Master:" + key + "\n    "
    //         leavesArr += theAux.leaves.join(",")
    //         // console.log("AuxLeafStatus for this master: ", theAux, " leaves: ", leavesArr)
    //         dumps.push({key, theAux, leavesArr})
    //     }
    //     let leavesWholeDump =  dumps.map(d => d.leavesArr).join("\n")
    //     console.log(leavesWholeDump)
    //     console.log("END Dumping masters: ")
    // }

    // 6) publish those same keys to the renderer.

    // // fill the map above. It's all semi random key to batches. Some batches will only be one leaf, some will be many leaves.
    // for (let i = 0; i < props.showingLeaves.length; i++) {

    //     const leafName = props.showingLeaves[i]
    //     const treeStatus = oct.gTreeStatusCache.get(leafName)
    //     if (treeStatus === undefined) {
    //         console.error("MakeBoxesForShowingLeaves: error looking up treeStatus for leafName ", leafName)
    //         continue
    //     }

    //     //const treeStatus: oct.TreeStatus = props.showingLeaves[i]

    //     if (!treeStatus.groupId) {
    //         // This should never happen..
    //         console.error("MakeBoxesForShowingLeaves: treeStatus has no groupId, so we can't group it. It will not be drawn. TreeStatus is ", treeStatus)
    //         continue
    //     }
    //     const groupInfo = treeStatus.groupId
    //     if (!groupInfo.id) {
    //         // this was pre screned when the ts was built, so it should NEVER happen.
    //         console.error("MakeBoxesForShowingLeaves: groupInfo has no id, so we can't group it. It will not be drawn. groupInfo is ", groupInfo, " treeStatus is ", treeStatus)
    //         // We force random Id's on singletons at discovery time.
    //         continue
    //     }
    //     let asset: string = "no-asset-found"
    //     if (groupInfo.asset) {
    //         asset = groupInfo.asset
    //     }
    //     let type: string = ""
    //     if (groupInfo.type) {
    //         type = groupInfo.type
    //     }

    //     // the key is the groupId.id 
    //     const key = treeStatus.groupId.id

    //     let info: oct.BatchInfo | undefined = oct.GetBatchInfo(key)
    //     if (!info) {
    //         // make a new one
    //         const newGrpInfo: oct.BatchInfo = { // fill it in
    //             key: key,
    //             masterName: "",
    //             type: type,
    //             asset: asset,
    //             leaves: [],
    //             groupInfo: groupInfo, // this is the text paramaters,
    //             auxRecord: null
    //         }
    //         info = newGrpInfo
    //         SetBatchInfo(key, info) // put it in the map.
    //     }
    //     if (treeStatus.groupId.master) { // Set the master! 
    //         info.masterName = treeStatus.name
    //     }
    //     info.leaves.push(treeStatus) // add ourselves to the list of leaves for this group.
    // }

    // let's dump the map. Force aux ALL Aux NOW
    // console.log("MakeBoxesForShowingLeaves: group2LeafListMap")

    // // While we're dumping the map let's make some checks.
    // for (const [key, batchInfo] of oct.GetAllBatchInfoEntries()) {
    //     if (!batchInfo.masterName) {
    //         batchInfo.masterName = batchInfo.leaves[0].name // + (batchInfo.leaves[0].wasXYZ ? ".xyz" : ".vr")
    //         continue
    //     }
    // }

    // While we're dumping the map let's make some checks.
    // for (const [key, batchInfo] of group2LeafListMap.entries()) {

    //     // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " value: ", batchInfo)
    //     // key:  5zQ1bN6r2vW8mP3L4j9KxYtC  value:  {masterName: 'testmain-0n0u0e5p', type: 'floor', asset: 'cobblestonesgrok512.jpg:repeat:20', leaves: Array(1), groupInfo: {…}, …}

    //     // I trust nobody now. Check the name
    //     const tmp = oct.NoTld(batchInfo.masterName)
    //     // if (err) {  
    //     //     console.error("MakeBoxesForShowingLeaves: bad master name: ", batchInfo.masterName)
    //     //     continue
    //     // }
    //     if (tmp != batchInfo.masterName) {
    //         console.error("MakeBoxesForShowingLeaves: master name mismatch: ", batchInfo.masterName, " parsed: ", tmp)
    //         continue
    //     }
    //     let aux = oct.LookupAuxLeafStatus(oct.NoTld(batchInfo.masterName)) // does it have an aux record?
    //     // fill in the aux because we need even more room for mistakes.
    //     if (aux == null) {
    //         const masterCube = oct.StringToCube(oct.NoTld(batchInfo.masterName))[0]

    //         const leaftmpList = []
    //         { // aux has a simple format for it's leaves. We need to convert 
    //             for (let i = 0; i < batchInfo.leaves.length; i++) {
    //                 if (oct.NoTld(batchInfo.leaves[i].name) !== batchInfo.leaves[i].name) {
    //                     console.error("MakeBoxesForShowingLeaves: batchInfo.leaves[i].name has TLD: ", batchInfo.leaves[i].name, " batchInfo: ", batchInfo)
    //                 }
    //                 const cubeName = oct.NoTld(batchInfo.leaves[i].name)
    //                 const split = cubeName.split("-")
    //                 if (split.length != 2) {
    //                     console.error("MakeBoxesForShowingLeaves: cubeName is not in the expected format of world-adddress. cubeName is ", cubeName)
    //                 }
    //                 if (split[0] != masterCube.world) {
    //                     console.error("MakeBoxesForShowingLeaves: world does not match masterCube. cubeName is ", cubeName, " masterCube is ", masterCube)
    //                 }
    //                 leaftmpList.push(split[1]) // just the address part.
    //             }
    //         }
    //         if (oct.NoTld(batchInfo.masterName) !== batchInfo.masterName) {
    //             console.error("MakeBoxesForShowingLeaves: batchInfo.masterName has TLD: ", batchInfo.masterName, " batchInfo: ", batchInfo)
    //         }
    //         // make a new one
    //         const newAux: oct.AuxLeafStatus = {
    //             wholeMaster: oct.NoTld(batchInfo.masterName),
    //             justTheWorld: oct.worldFromCubeName(batchInfo.masterName),
    //             leaves: leaftmpList,
    //             txtParams: batchInfo.groupInfo,
    //             glbItems: new Map<string, oct.GlbStatus>()
    //         }
    //         const group = batchInfo.groupInfo
    //         const asset = batchInfo.asset
    //         let oldeTxtJunkDirty = false
    //         var oldeTxtJunk: oct.OldeTxJunk = {
    //             color: "",
    //             textureUrl: "",
    //             repeat: 0,
    //             type: "",
    //             asset: ""
    //         }

    //         // fill it with the antiques.
    //         if (asset.startsWith("color:")) {
    //             const colorMatch = asset.match(/color:(#[0-9a-fA-F]{6}|[a-zA-Z]+)/)
    //             if (colorMatch) {
    //                 // newAux.backupColor = colorMatch[1]
    //                 oldeTxtJunk.color = colorMatch[1],
    //                     oldeTxtJunk.type = group.type ? group.type : "floor",
    //                     oldeTxtJunk.asset = group.asset ? group.asset : "color:" + colorMatch[1]
    //                 oldeTxtJunkDirty = true
    //             }
    //         }
    //         const parts = asset.split(":")
    //         const isImage = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(parts[0])
    //         if (isImage) {
    //             oldeTxtJunk.textureUrl = parts[0]
    //             oldeTxtJunk.repeat = 1
    //             oldeTxtJunkDirty = true
    //             if (group.asset) {
    //                 const repeatMatch = asset.match(/:repeat:(\d+)$/)
    //                 if (repeatMatch) {
    //                     oldeTxtJunk.repeat = parseInt(repeatMatch[1])
    //                     // oldeTxtJunk.repea = asset.replace(/:repeat:\d+$/, "")
    //                     oldeTxtJunkDirty = true
    //                 }
    //                 oldeTxtJunk.asset = asset
    //             }
    //         }
    //         // dude, I don't even want to do GLB url anymore.
    //         // if ((asset.match(/\.(glb|gltf)$/))) { // glb's
    //         //     // I'm not. I refuse. I'll do the duck another way.
    //         // }
    //         if (group.type) {
    //             oldeTxtJunk.type = group.type // floor, ceiling, wall, etc.
    //             oldeTxtJunkDirty = true
    //         }
    //         if (oldeTxtJunkDirty) {
    //             newAux.oldeTxtJunk = oldeTxtJunk
    //         }
    //         // so now the Aux is ready.

    //         if (newAux.wholeMaster !== batchInfo.masterName) { // this is because of the TLD.  A hug mustake having those. They exist in the AuxLeafStatus and can be looked up 
    //             // any time but are only EVER used by the uFrame ONCE while generatibg errirs FOREVER.
    //             // 7/17/26. I'm rolling that out again.
    //             console.error("MakeBoxesForShowingLeaves: newAux.master does not match batchInfo.masterName. newAux.master: ", newAux.wholeMaster, " batchInfo.masterName: ", batchInfo.masterName)
    //         }

    //         oct.CacheAuxLeafStatus(newAux.wholeMaster, newAux) // put it in the map for later retrieval.
    //         //oct.SetAuxLeafStatus(batchInfo.masterName, newAux) // put it in the map for later retrieval.
    //         batchInfo.auxRecord = newAux // fill it in for some reason.
    //     } else {
    //         // we found it in GetAuxLeafStatus under oct.NoTld( batchInfo.masterName
    //         // saving again?
    //         batchInfo.auxRecord = aux
    //         if (oct.NoTld(batchInfo.masterName) !== batchInfo.masterName) {
    //             console.warn("MakeBoxesForShowingLeaves: batchInfo.masterName has TLD: ", batchInfo.masterName, " aux.wholeMaster: ", aux.wholeMaster, " batchInfo: ", batchInfo)
    //         }
    //         oct.CacheAuxLeafStatus(oct.NoTld(batchInfo.masterName), aux) // ?? 
    //     }
    // }
    // // that damn thing better be filled in everywhere now.
    // done ensuring aux on everyone.

    // this parts's a mess.
    // // We're getting rid of it.
    // for (const [key, batchInfo] of group2LeafListMap.entries()) {
    //     if (!batchInfo.masterName) {
    //         // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " has no masterName, forcing it to be the first leaf in the list. value: ", batchInfo)
    //         // Why put TLD's on these?
    //         if (batchInfo.leaves.length > 0) { // it better be or else I'm down the rabbit hole.
    //             batchInfo.masterName = batchInfo.leaves[0].name // + (batchInfo.leaves[0].wasXYZ ? ".x yz" : ".vr")
    //         }
    //         const newBatchInfo: oct.BatchInfo = { // fill it in
    //             ...batchInfo,
    //         }
    //         group2LeafListMap.set(key, newBatchInfo) // put it back in the map. cloned. Does that matter? 
    //         // is it wrecking the iterator?
    //         // look up the aux record if necessary
    //         // what is this for?
    //         if (oct.NoTld(batchInfo.masterName) !== batchInfo.masterName) {
    //             console.error("MakeBoxesForShowingLeaves: batchInfo.masterName has TLD: ", batchInfo.masterName, " aux.master: ", batchInfo.auxRecord?.wholeMaster, " batchInfo: ", batchInfo)
    //         }
    //         const aux = oct.LookupAuxLeafStatus(oct.NoTld(batchInfo.masterName)) // does it have an aux record? 
    //         if (aux) {
    //             batchInfo.auxRecord = aux
    //         } else {
    //             console.log("MakeBoxesForShowingLeaves: We JUST DID THIS: ")
    //         }

    //     }
    //     // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " value: ", batchInfo)
    //     // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " aux: ", batchInfo.auxRecord)
    //     // key:  YjjhXF8zCnxkI7qUjlnWl71n  value:  {masterName: 'testmain-2n0u5w2p', type: 'floor', asset: 'Duck.glb', leaves: Array(1), groupInfo: {…}, …}
    //     // key:  YjjhXF8zCnxkI7qUjlnWl71n  aux:  {master: 'testmain-2n0u5w2p', leaves: Array(1), txtParams: {…}, glbItems: {…}, oldeTxtJunk: {…}}

    // }

    // goes to MakeListOfiFrames. They DO have their aux yet!!! 
    // 
    // just send the keys, and the keys are the masterNames. The aux is in the oct. The aux is the only thing that has the TLD's.

    //  pubsub.publish<Map<string, oct.BatchInfo>>("group2LeafListMap", group2LeafListMap) // for the iFrames to subscribe to.

    // no the 'iframes' are the MakeListOfIFrames and MakeAnIFrame. They subscribe to the "group2LeafListMap" topic and get the map of groupId to BatchInfo.

    // now traverse the groups and send them to batch renderers.
    // console.log("MakeBoxesForShowingLeaves group count is ", group2LeafListMap.size)

    //let surroundingIndex = 512 * 1234 // the stupid "every thing must have a key" thing feature.

    // these are all BATCHES. Not cubes, leaves or treeStatus.

    let keyIndex = 0

    // at the very end we draw the  undrawnSoFar of which there are hopefully none.
    // for (const [key, batch] of group2LeafListMap.entries()) {
    //     // console.log("MakeBoxesForShowingLeaves: undrawnSoFar key: ", key, " value: ", value)
    //     const batchInfo: oct.BatchInfo = batch

    //     // this is going to be a crappy auxRecord - fix later
    //     const auxRecord = batchInfo.auxRecord
    //     if (auxRecord != null) {

    //         const groupTextParameters = batchInfo.groupInfo // just repeat it here for convenience

    //         const ourprops: ThingWithAuxProps = {

    //             worldName: props.worldName,
    //             // uniqueId: props.uniqueId,
    //             onlyShowOutlineBoxes: props.onlyShowOutlineBoxes,
    //             showOriginAxis: props.showOriginAxis,
    //             // previousCameraPosition: props.state.previousCameraPosition,
    //             // timeSinceLastCameraMovement: props.state.timeSinceLastCameraMovement,
    //             // theGlobalTree: props.state.theGlobalTree,    

    //             aux: auxRecord,
    //             //     indexBase: keyIndex,
    //             groupTxt: groupTextParameters
    //         }

    //         const auxElement = (
    //             <ThingWithAux
    //                 {...ourprops}
    //             />
    //         )
    //         keyIndex += 1
    //         results.push(auxElement)
    //     }
    //     // else throw it on the floor? 
    //     else {
    //         for (let i = 0; i < batch.leaves.length; i++) {
    //             // for every cube in every batch in the undrawnSoFar entities.
    //             const treeStatus = batch.leaves[i]
    //             // 

    //             // results.push(<leaves.CubeWithEdges  cube={treeStatus.cube} index={30000+i}  />)
    //             // show the address on the floor along with the text "unloaded"  
    //             // it's over in  OutlineBoxComponent
    //             // draw one with an AuxREcord which presumablly contains a GLB
    //             const OneElement = (
    //                 <outlines.OutlineBoxComponentPlain treeStatus={treeStatus}
    //                     errorMsg={"under construction?"} color={"purple"} propsMessage={treeStatus.name}
    //                     forceChainLink={true}
    //                 />

    //             )
    //             //     keyIndex += 1
    //             results.push(OneElement)
    //         }
    //     }
    // }

    // this does not make any elements. It just makes the aux records and publishes the map to the iFrames and the LeafRenderers. 
    // The iFrames will subscribe to the map and render the leaves.
    // return (
    //     <>
    //         {results}
    //     </>
    // )
}

/** example: testmain-1n0u1w4p NEEDS suffix .vr to be a subdomain request to knotfree.net or knotfree.io

group2LeafListMap key:  j9xK3mP8wL2z:cobblestonesgrok512.jpg:repeat:20  value:  {masterName: '', type: 'floor', asset: 'cobblestonesgrok512.jpg:repeat:20', leaves: Array(1)}
group2LeafListMap key:  TmiPiEvT1Hz6WyJB7pKisyuF:color:#88674E  value:  {masterName: '', type: 'ceiling', asset: 'color:#88674E', leaves: Array(16)}
group2LeafListMap key:  TmiiPiEvT1HsyuFz6WyJB7pK:street.jpg  value:  {masterName: 'testmain-1n0u1w4p', type: 'floor', asset: 'street.jpg', leaves: Array(57)}
group2LeafListMap key:  L94PscW0snrsMcZHniYPNV6q:undefined  value:  {masterName: '', type: '', asset: 'no-asset-found', leaves: Array(1)}
group2LeafListMap key:  HODSz5XXywVYyoDHPkspu6wd:color:orange  value:  {masterName: '', type: 'floor', asset: 'color:orange', leaves: Array(1)}
group2LeafListMap key:  rJ3hGdipNxjh7ZzIww2nvZ0i:Duck.glb  value:  {masterName: '', type: 'floor', asset: 'Duck.glb', leaves: Array(1)}

 */

/*
MakeBoxesForDemoSpaces recalculated:  16
DemoProperties.tsx:200 MakeBoxesForDemoSpaces finished calculating positions. posIndex:  1152  lineCount:  192  positions size:  1152
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:

testmain-0n0u0e5p  is  {grp: 'j9xK3mP8wL2z', dbg: 'localhost:3010', type: 'floor', asset: 'cobblestonesgrok512.jpg:repeat:20'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-0n1d0e9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n1d0e9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-0n1

*/


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
// along with this program.  If not, see <http://www.gnu.org/licenses/
