import React from "react"

import { MakeBoxesForDemoSpaces } from "./DemoProperties"
import { CubeWithEdges, LeafRenderingComponent } from "./LeafRenderingComponent"
import { MainWorldDisplayProps } from './MainWorldDisplay';
import * as oct from '../knotfree-ts-lib/3d/DomainNameOctTree';
import * as leaves from "./LeafRenderingComponent"
import * as outlines from "./OutlineBoxComponent"
import * as demo from "./DemoProperties"
import { Suspense, useRef } from 'react';
import * as pubsub from './PubSubTopicAndSubscribers'
import { ThingWithAux, ThingWithAuxProps } from './LeafRenderingGlb'
import * as oxy from '../knotfree-ts-lib/3d/DomainNameOctTree'
import { OldeTxJunk, CacheAuxLeafStatus } from "../knotfree-ts-lib/3d/DomainNameOctTree";


// Some properties come in groups, like a street. We can handle them all as a group. 
// We create a map of groupId to list of leaves. Then we can render them all at once.
// We use an AuxLeafStatus to store the group information, like the master name, type, asset, and list of leaves. 

export default function MakeBoxesForShowingLeaves(props: MainWorldDisplayProps) {

    if (props.showingLeaves.length === 0)
        return null

    // use the demo technique with just a bunch or obtimized lines all at once.

    // this is the feature where we only show the outlines of everything (X-Ray) so no grouping needed.
    // it's the "onlyShowOutlineBoxes" feature. It will be used for the demo spaces and for the orbital view.
    if (props.onlyShowOutlineBoxes) {
        // in which it's ALL one big batch,
        // we're going to need the real leaves here.
        // convrt the showingLeaves to a list of cubes
        const cubeList = props.showingLeaves.map(leaf => leaf.cube)
        return (<>
            <MakeBoxesForDemoSpaces
                worldName={props.worldName}
                demoCubeList={cubeList} // this is wrong. What is it?
                color={"black"} // optional color for the boxes. If not provided, will default to green.
          //      indexBase={0} // since they share these with leaves they need different numbers.                 
            />
        </>
        )
    }

    const results: JSX.Element[] = [] // we put the fragments in here and return them at the end.

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


    // console.log("MakeBoxesForShowingLeaves all the leavees just walked in here ", props.showingLeaves.length)

    // The map where we will collection them.
    const group2LeafListMap = new Map<string, oct.BatchInfo>()

    // fill the map above. It's all semi random key to batches. Some batches will only be one leaf, some will be many leaves.
    for (let i = 0; i < props.showingLeaves.length; i++) {

        const treeStatus: oct.TreeStatus = props.showingLeaves[i]
        if (!treeStatus.groupId) {
            // This should never happen..
            console.error("MakeBoxesForShowingLeaves: treeStatus has no groupId, so we can't group it. It will not be drawn. TreeStatus is ", treeStatus)
            continue
        }
        const groupInfo = treeStatus.groupId
        if (!groupInfo.id) {
            // this was pre screned when the ts was built, so it should NEVER happen.
            console.error("MakeBoxesForShowingLeaves: groupInfo has no id, so we can't group it. It will not be drawn. groupInfo is ", groupInfo, " treeStatus is ", treeStatus)
            // We force random Id's on singletons at discovery time.
            continue
        }
        let asset: string = "no-asset-found"
        if (groupInfo.asset) {
            asset = groupInfo.asset
        }
        let type: string = ""
        if (groupInfo.type) {
            type = groupInfo.type
        }

        // the key is the groupId.id 
        const key = treeStatus.groupId.id

        let info: oct.BatchInfo | undefined = group2LeafListMap.get(key)
        if (!info) {
            // make a new one
            const newGrpInfo: oct.BatchInfo = { // fill it in
                masterName: "",
                type: type,
                asset: asset,
                leaves: [],
                groupInfo: groupInfo, // this is the text paramaters,
                auxRecord: null
            }
            info = newGrpInfo
            group2LeafListMap.set(key, info) // put it in the map.
        }
        if (treeStatus.groupId.master) { // Set the master! 
            info.masterName = treeStatus.name
        }
        info.leaves.push(treeStatus) // add ourselves to the list of leaves for this group.
    }

    // let's dump the map. Force aux ALL Aux NOW
    // console.log("MakeBoxesForShowingLeaves: group2LeafListMap")

    // While we're dumping the map let's make some checks.
    for (const [key, batchInfo] of group2LeafListMap.entries()) {
        if (!batchInfo.masterName) {
            batchInfo.masterName = batchInfo.leaves[0].name // + (batchInfo.leaves[0].wasXYZ ? ".xyz" : ".vr")
            continue
        }
    }

    // While we're dumping the map let's make some checks.
    for (const [key, batchInfo] of group2LeafListMap.entries()) {

        // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " value: ", batchInfo)
        // key:  5zQ1bN6r2vW8mP3L4j9KxYtC  value:  {masterName: 'testmain-0n0u0e5p', type: 'floor', asset: 'cobblestonesgrok512.jpg:repeat:20', leaves: Array(1), groupInfo: {…}, …}

        // I trust nobody now. Check the name
        const tmp = oct.NoTld(batchInfo.masterName)
        // if (err) {  
        //     console.error("MakeBoxesForShowingLeaves: bad master name: ", batchInfo.masterName)
        //     continue
        // }
        if (tmp != batchInfo.masterName) {
            console.error("MakeBoxesForShowingLeaves: master name mismatch: ", batchInfo.masterName, " parsed: ", tmp)
            continue
        }
        let aux = oct.LookupAuxLeafStatus(oct.NoTld(batchInfo.masterName)) // does it have an aux record?
        // fill in the aux because we need even more room for mistakes.
        if (aux == null) {
            const masterCube = oct.StringToCube(oct.NoTld(batchInfo.masterName))[0]

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
            const newAux: oct.AuxLeafStatus = {
                wholeMaster: oct.NoTld(batchInfo.masterName),
                justTheWorld: oct.worldFromCubeName(batchInfo.masterName),
                leaves: leaftmpList,
                txtParams: batchInfo.groupInfo,
                glbItems: new Map<string, oct.GlbStatus>()
            }
            const group = batchInfo.groupInfo
            const asset = batchInfo.asset
            let oldeTxtJunkDirty = false
            var oldeTxtJunk: oct.OldeTxJunk = {
                color: "",
                textureUrl: "",
                repeat: 0,
                type: "",
                asset: ""
            }

            // fill it with the antiques.
            if (asset.startsWith("color:")) {
                const colorMatch = asset.match(/color:(#[0-9a-fA-F]{6}|[a-zA-Z]+)/)
                if (colorMatch) {
                    // newAux.backupColor = colorMatch[1]
                    oldeTxtJunk.color = colorMatch[1],
                        oldeTxtJunk.type = group.type ? group.type : "floor",
                        oldeTxtJunk.asset = group.asset ? group.asset : "color:" + colorMatch[1]
                    oldeTxtJunkDirty = true
                }
            }
            const parts = asset.split(":")
            const isImage = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(parts[0])
            if (isImage) {
                oldeTxtJunk.textureUrl = parts[0]
                oldeTxtJunk.repeat = 1
                oldeTxtJunkDirty = true
                if (group.asset) {
                    const repeatMatch = asset.match(/:repeat:(\d+)$/)
                    if (repeatMatch) {
                        oldeTxtJunk.repeat = parseInt(repeatMatch[1])
                        // oldeTxtJunk.repea = asset.replace(/:repeat:\d+$/, "")
                        oldeTxtJunkDirty = true
                    }
                    oldeTxtJunk.asset = asset
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

            if (newAux.wholeMaster !== batchInfo.masterName) { // this is because of the TLD.  A hug mustake having those. They exist in the AuxLeafStatus and can be looked up 
                // any time but are only EVER used by the uFrame ONCE while generatibg errirs FOREVER.
                // 7/17/26. I'm rolling that out again.
                console.error("MakeBoxesForShowingLeaves: newAux.master does not match batchInfo.masterName. newAux.master: ", newAux.wholeMaster, " batchInfo.masterName: ", batchInfo.masterName)
            }

            oct.CacheAuxLeafStatus(newAux.wholeMaster, newAux) // put it in the map for later retrieval.
            //oct.SetAuxLeafStatus(batchInfo.masterName, newAux) // put it in the map for later retrieval.
            batchInfo.auxRecord = newAux // fill it in for some reason.
        } else {
            // we found it in GetAuxLeafStatus under oct.NoTld( batchInfo.masterName
            // saving again?
            batchInfo.auxRecord = aux
            if (oct.NoTld(batchInfo.masterName) !== batchInfo.masterName) {
                console.warn("MakeBoxesForShowingLeaves: batchInfo.masterName has TLD: ", batchInfo.masterName, " aux.wholeMaster: ", aux.wholeMaster, " batchInfo: ", batchInfo)
            }
            oct.CacheAuxLeafStatus(oct.NoTld(batchInfo.masterName), aux) // ?? 
        }
    }
    // that damn thing better be filled in everywhere now.
    // done ensuring aux on everyone.

    // this parts's a mess.
    // We're getting rid of it.
    for (const [key, batchInfo] of group2LeafListMap.entries()) {
        if (!batchInfo.masterName) {
            // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " has no masterName, forcing it to be the first leaf in the list. value: ", batchInfo)
            // Why put TLD's on these?
            if (batchInfo.leaves.length > 0) { // it better be or else I'm down the rabbit hole.
                batchInfo.masterName = batchInfo.leaves[0].name // + (batchInfo.leaves[0].wasXYZ ? ".x yz" : ".vr")
            }
            const newBatchInfo: oct.BatchInfo = { // fill it in
                ...batchInfo,
            }
            group2LeafListMap.set(key, newBatchInfo) // put it back in the map. cloned. Does that matter? 
            // is it wrecking the iterator?
            // look up the aux record if necessary
            // what is this for?
            if (oct.NoTld(batchInfo.masterName) !== batchInfo.masterName) {
                console.error("MakeBoxesForShowingLeaves: batchInfo.masterName has TLD: ", batchInfo.masterName, " aux.master: ", batchInfo.auxRecord?.wholeMaster, " batchInfo: ", batchInfo)
            }
            const aux = oct.LookupAuxLeafStatus(oct.NoTld(batchInfo.masterName)) // does it have an aux record? 
            if (aux) {
                batchInfo.auxRecord = aux
            } else {
                console.log("MakeBoxesForShowingLeaves: We JUST DID THIS: ")
            }

        }
        // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " value: ", batchInfo)
        // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " aux: ", batchInfo.auxRecord)
        // key:  YjjhXF8zCnxkI7qUjlnWl71n  value:  {masterName: 'testmain-2n0u5w2p', type: 'floor', asset: 'Duck.glb', leaves: Array(1), groupInfo: {…}, …}
        // key:  YjjhXF8zCnxkI7qUjlnWl71n  aux:  {master: 'testmain-2n0u5w2p', leaves: Array(1), txtParams: {…}, glbItems: {…}, oldeTxtJunk: {…}}

    }

    // goes to MakeListOfiFrames. They DO have their aux yet!!! 
    pubsub.publish<Map<string, oct.BatchInfo>>("group2LeafListMap", group2LeafListMap) // for the iFrames to subscribe to.

    // now traverse the groups and send them to batch renderers.
    // console.log("MakeBoxesForShowingLeaves group count is ", group2LeafListMap.size)

    //let surroundingIndex = 512 * 1234 // the stupid "every thing must have a key" thing feature.

    // these are all BATCHES. Not cubes, leaves or treeStatus.

    let keyIndex = 0

    // at the very end we draw the  undrawnSoFar of which there are hopefully none.
    for (const [key, batch] of group2LeafListMap.entries()) {
        // console.log("MakeBoxesForShowingLeaves: undrawnSoFar key: ", key, " value: ", value)
        const batchInfo: oct.BatchInfo = batch

        // this is going to be a crappy auxRecord - fix later
        const auxRecord = batchInfo.auxRecord
        if (auxRecord != null) {

            const groupTextParameters = batchInfo.groupInfo // just repeat it here for convenience

            const ourprops: ThingWithAuxProps = {

                worldName: props.worldName,
                // uniqueId: props.uniqueId,
                onlyShowOutlineBoxes: props.onlyShowOutlineBoxes,
                showOriginAxis: props.showOriginAxis,
                // previousCameraPosition: props.state.previousCameraPosition,
                // timeSinceLastCameraMovement: props.state.timeSinceLastCameraMovement,
                // theGlobalTree: props.state.theGlobalTree,    

                aux: auxRecord,
           //     indexBase: keyIndex,
                groupTxt: groupTextParameters
            }

            const auxElement = (
                <ThingWithAux
                    {...ourprops}
                />
            )
            keyIndex += 1
            results.push(auxElement)
        }
        // else throw it on the floor? 
        else {
            for (let i = 0; i < batch.leaves.length; i++) {
                // for every cube in every batch in the undrawnSoFar entities.
                const treeStatus = batch.leaves[i]
                // 

                // results.push(<leaves.CubeWithEdges  cube={treeStatus.cube} index={30000+i}  />)
                // show the address on the floor along with the text "unloaded"  
                // it's over in  OutlineBoxComponent
                // draw one with an AuxREcord which presumablly contains a GLB
                const OneElement = (
                    <outlines.OutlineBoxComponentPlain treeStatus={treeStatus}
                        errorMsg={"under construction?"} color={"purple"} propsMessage={treeStatus.name}
                        forceChainLink={true}
                     />

                )
           //     keyIndex += 1
                results.push(OneElement)
            }
        }
    }

    return (
        <>
            {results}
        </>
    )
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
