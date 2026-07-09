import React from "react"

import { MakeBoxesForDemoSpaces } from "./DemoProperties"
import { CubeWithEdges, LeafRenderingComponent } from "./LeafRenderingComponent"
import { MainWorldDisplayProps } from './MainWorldDisplay';
import * as oct from '../knotfree-ts-lib/3d/UrlOctTree';
import * as leaves from "./LeafRenderingComponent"
import * as outlines from "./OutlineBoxComponent"
import * as demo from "./DemoProperties"
import { Suspense, useRef } from 'react';
import { WorldDisplayState } from "./WorldDisplayState";


// These grouped themselves by having the same groupId.id and groupId.asset.
export type BatchInfo = {
    masterName: string
    type: string
    asset: string
    groupInfo: oct.GroupTextParameters
    leaves: oct.TreeStatus[]
}

// what is this? Why the indirection? 
// can we put this in LeafRendering, yes, or something but I'll put it in it's own file for now
// we're returning compenents to be rendered in the scene. Some components will be optimized to render a bunch of leaves at once, some will be for a single leaf.
export default function MakeBoxesForShowingLeaves(props: MainWorldDisplayProps) {

    if (props.showingLeaves.length === 0)
        return null

    // use the demo technique with just a bunch or obtimized lines all at once.

    if (props.state.onlyShowOutlineBoxes) {
        // in which it's ALL one big batch,
        console.log("MakeBoxesForShowingLeaves: onlyShowOutlineBoxes is true, not rendering leaves, using MakeBoxesForDemoSpaces technique")
        return (<>
            <MakeBoxesForDemoSpaces
                worldDisplayState={{ ...props.state, previousCameraPosition: props.state.previousCameraPosition }}
                demoCubeList={props.showingLeaves.map(ts => ts.cube)}
                color={"royalblue"}
                indexBase={props.indexBase} />
        </>
        )
    }

    const results: JSX.Element[] = [] // we put the fragments in here and return them at the end.

    // first group them by groupId and then make a single OutlineBoxComponent for each groupId.
    // These are the groups now: 
// 5zQ1bN6r2vW8mP3L4j9KxYtC:cobblestonesgrok512.jpg:repeat:20  value:  {masterName: 'testmain-0n0u0e5p.vr', type: 'floor', asset: 'cobblestonesgrok512.jpg:repeat:20', leaves: Array(1), groupInfo: {…}}
// TmiPiEvT1Hz6WyJB7pKisyuF:color:#88674E                      value:  {masterName: 'testmain-2s1d2w9p.vr', type: 'ceiling', asset: 'color:#88674E', leaves: Array(16), groupInfo: {…}}
// TmiiPiEvT1HsyuFz6WyJB7pK:street.jpg                         value:  {masterName: 'testmain-1n0u1w4p.vr', type: 'floor', asset: 'street.jpg', leaves: Array(57), groupInfo: {…}}
// j9K2vW8mP3xY5zQ1bN6rL4tC:undefined                          value:  {masterName: 'testmain-2n0u7w2p.vr', type: '', asset: 'no-asset-found', leaves: Array(1), groupInfo: {…}}
// oXwlQzOq9NOKNuvH7XcLUdJ9:color:orange                       value:  {masterName: 'testmain-2n0u5w2p.vr', type: 'floor', asset: 'color:orange', leaves: Array(1), groupInfo: {…}}
// VcLCjRUHES4lhCDVMOJM22K2:color:orange  has no masterName, forcing it to be the first leaf in the list. 
//                                                             value:  {masterName: '', type: 'floor', asset: 'color:orange', leaves: Array(1), groupInfo: {…}}
// VcLCjRUHES4lhCDVMOJM22K2:color:orange                       value:  {masterName: 'testmain-2n0u4w2p.vr', type: 'floor', asset: 'color:orange', leaves: Array(1), groupInfo: {…}}


    // we can group by grp and then asset? Does type matter? If it's just floor or celiing then 
    // we can acomodate that in the asset. 
    // let's go with grp and asset. We *could* have a group with different colors.
    // but for now let's keep it simple.

    // let's dump them ALL. (see below)
    for (let i = 0; i < props.showingLeaves.length; i++) {
        const treeStatus = props.showingLeaves[i]
        //console.log("MakeBoxesForShowingLeaves grp for: ", treeStatus.name, " is ", treeStatus.groupId)
    }

    const group2LeafListMap = new Map<string, BatchInfo>()

    // fill the map above. It's all semi random key to batches. Some batches will only be one leaf, some will be many leaves.
    for (let i = 0; i < props.showingLeaves.length; i++) {
        const treeStatus: oct.TreeStatus = props.showingLeaves[i]
        if (!treeStatus.groupId) {
            // does this happen? It's bad.
            console.log("MakeBoxesForShowingLeaves: treeStatus has no groupId, so we can't group it. It will not be drawn. TreeStatus is ", treeStatus)
            continue
        }
        const groupInfo = treeStatus.groupId
        if (!groupInfo.id) {
            console.log("MakeBoxesForShowingLeaves: groupInfo has no id, so we can't group it. It will not be drawn. groupInfo is ", groupInfo, " treeStatus is ", treeStatus)
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

        // the key is the groupId.id and groupId.asset. We don't care about type for now.
        // should have just used the ID but I'm paranoid about folks who use different assets and types for the same groupId.id. 
        const key = treeStatus.groupId.id + ":" + treeStatus.groupId.asset

        let info: BatchInfo | undefined = group2LeafListMap.get(key)
        if (!info) {
            // make a new one
            const newGrpInfo: BatchInfo = { // fill it in
                masterName: "",
                type: type,
                asset: asset,
                leaves: [],
                groupInfo: groupInfo
            }
            info = newGrpInfo
            group2LeafListMap.set(key, info) // put it in the map.
        }
        if (treeStatus.groupId.mstr) { // Set the master! 
            info.masterName = treeStatus.name + (treeStatus.wasXYZ ? ".xyz" : ".vr")
        }
        info.leaves.push(treeStatus) // add ourselves to the list of leaves for this group.
    }

    // let's dump the map. Force masters if necessary
    for (const [key, batchInfo] of group2LeafListMap.entries()) {
        if (!batchInfo.masterName) {
            // console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " has no masterName, forcing it to be the first leaf in the list. value: ", batchInfo)
            if (batchInfo.leaves.length > 0) { // it better be or else I'm down the rabbit hole.
                batchInfo.masterName = batchInfo.leaves[0].name + (batchInfo.leaves[0].wasXYZ ? ".xyz" : ".vr")
            }
            const newBatchInfo: BatchInfo = { // fill it in
                ...batchInfo,
            }
            group2LeafListMap.set(key, batchInfo) // put it back in the map. cloned. Does that matter? 
            // is it wriecking the iteretor? 
        }
        console.log("MakeBoxesForShowingLeaves: group2LeafListMap key: ", key, " value: ", batchInfo)
    }

    // now traverse the groups and send them to batch renderers.
    // console.log("MakeBoxesForShowingLeaves group count is ", group2LeafListMap.size)

    let surroundingIndex = 512 * 1234 // the stupid "every thing must have a key" thing.
    const undrawnSoFar = new Map<string, BatchInfo>() // leftovers.

    // these are all BATCHES. Not cubes, leaves or treeStatus.
    for (const [key, group] of group2LeafListMap.entries()) {
        // who to draw first? 
        // we must assign them to handlers as we go.

        const parts = group.asset.split(":")
        // it might have a repeat:20 or repeat:10 whatever. bad design.
        const isImage = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(parts[0])

        // let's do "asset:color..." first
        if (group.asset.startsWith("color:")) {

            const subResults: JSX.Element[] = []

            // use the batch method. 
            let useBatchMethod = true
            // if (value.leaves.length == 1) { // there's only one that 1 cube and one one that's 16
            //     useBatchMethod = true // debug the easy one.
            // }
            if (useBatchMethod) {
                const ele = leaves.MakeBoxesForColorGroup({ worldDisplayState: props.state, groupInfo: group, indexBase: 12 * 1000 })

                subResults.push(<React.Fragment key={surroundingIndex}>{ele}</React.Fragment>)
            } else { // draw them the old way.
                // get rid of this eventually. soon. I was having trouble the 3 of july. 
                // console.log("MakeBoxesForShowingLeaves: drawing leaves the old way, one at a time. len= ", group.leaves.length)
                const props: leaves.LeafRenderingComponentProps = {
                    treeStatus: group.leaves[0], // just pick the first one, they all have the same asset and type and groupId
                    groupInfo: group.groupInfo // just pick the first one, they all have the same groupId
                }
                for (let i = 0; i < group.leaves.length; i++) {
                    props.treeStatus = group.leaves[i] // we can reuse this? right?
                    subResults.push(leaves.ThingWithColor(props))
                }
            }
            // results.push(<React.Fragment key={surroundingIndex}>{subResults}</React.Fragment>)
            results.push(<>{subResults}</>)
            surroundingIndex += 1000
        }  // end of batches of colored spaces. Should add walls too too when anyone gives a shit.
        else if ((group.asset.match(/\.(glb|gltf)$/))) { // glb's
            // note that glb's aren't happening in batches, so I'm iteratating them here. Blech.

            const subResults: JSX.Element[] = [] // bad technique. FIXME:
            group.leaves.forEach((treeStatus, index) => {
                const props: leaves.LeafRenderingComponentProps = {
                    treeStatus: treeStatus,
                    groupInfo: group.groupInfo // just pick the first one, they all have the same groupId
                }
                const tmp = (
                    <Suspense fallback={<CubeWithEdges cube={props.treeStatus.cube} index={surroundingIndex + index} />}>
                        <leaves.ThingWithGlb {...props} />
                    </Suspense>
                )
                subResults.push(tmp)
            })

            results.push(<React.Fragment key={surroundingIndex}>{subResults}</React.Fragment>)

        } else if (isImage) { // images
            // make the props.
            const myprops: leaves.MakeBoxesForDemoSpacesProps = { worldDisplayState: props.state, groupInfo: group, indexBase: 13 * 1000 }
            // console.log("MakeBoxesForShowingLeaves: calling MakeBoxesForTextureGroup for batch: ")
            // call he batch renderer for this group. 
            const tmp = (
                <leaves.MakeBoxesForTextureGroup {...myprops} />
            )
            // straight to the reukts
            results.push(<React.Fragment key={surroundingIndex}>{tmp}</React.Fragment>)

        }
        else {
            // who is left?
            undrawnSoFar.set(key, group)
        }
    }

    // at the very end we draw the  undrawnSoFar of which there are hopefully none.
    for (const [key, batch] of undrawnSoFar.entries()) {
        // console.log("MakeBoxesForShowingLeaves: undrawnSoFar key: ", key, " value: ", value)

        for (let i = 0; i < batch.leaves.length; i++) {
            // for every cube in every batch in the undrawnSoFar entities.
            const treeStatus = batch.leaves[i]
            // name on the floor? ??
            // results.push(<leaves.CubeWithEdges  cube={treeStatus.cube} index={30000+i}  />)
            // show the address on the floor along with the text "unloaded"  
            // it's over in  OutlineBoxComponent
            const OneElement = (
                <outlines.OutlineBoxComponentPlain treeStatus={treeStatus}
                    errorMsg={"under construction?"} color={"purple"} propsMessage={treeStatus.name}
                    forceChainLink={true}
                    indexBase={props.indexBase + i} />
            )
            results.push(OneElement)
        }
    }

    return (
        <>
            {results}
        </>
    )

    // otherwise fall through and makeLeafRenderers will make a list of LeafRenderingComponent for each leaf in the showingLeaves list.
    // and return that list of components to be rendered in the scene.

    // const tmp = props. showingLeaves.trim()
    // const leavesArray = tmp.split(",").map(s => s.trim())
    const leavesArray = props.showingLeaves
    //  too long to log: console.error("MakeBoxesForShowingLeaves: ", leavesArray)
    // this is just a list of names. 
    // we need a list of treeStatus objects. 


    // function makeLeafRenderers(): JSX.Element {
    //     const results = []

    //     // previousCameraPosition is close enough
    //     const cameraPosition = props.state.previousCameraPosition

    //     for (let i = 0; i < leavesArray.length; i++) {
    //         const treeStatus = leavesArray[i]
    //         const cubeStr = treeStatus.name
    //         results.push(<LeafRenderingComponent key={i}
    //             treeStatus={treeStatus} cameraPosition={cameraPosition} />)
    //     }

    //     return (<>
    //         {results}
    //     </>
    //     )

    // }
    // return ( // this would make all of them.
    //     <>
    //         {makeLeafRenderers()}
    //         {/* {leavesArray.map((cubeStr, index) => {
    //     const [cube, error] = oct.StringToCube(cubeStr)
    //     if (error) {
    //       console.error("Error parsing cube string: ", cubeStr, error)
    //       const errStr = error.message
    //       return <div>Error parsing cube string: {cubeStr}. {errStr}</div>
    //     }
    //     return <LeafRenderingComponent key={index} leaf={cubeStr} />
    //   })} */}
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
testmain-0n1d1e9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n1d1e9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-2s1d0e9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1s1d0e9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-2s1d1e9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1s1d1e9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u57w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u56w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u55w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u54w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u53w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u52w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u51w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u50w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u49w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u48w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u47w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u46w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u45w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u44w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u43w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u42w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u41w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u40w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u39w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u38w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u37w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u36w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u35w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u34w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u33w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u32w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u31w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u30w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u29w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u28w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u27w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u26w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u25w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u24w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u23w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u22w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u21w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u20w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u19w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u18w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u17w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u16w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u15w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u14w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u13w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u12w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u11w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u10w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u9w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u8w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u7w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u6w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u5w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u4w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u3w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-2n0u7w2p  is  {grp: 'DATIq0j87qVgDECBv2rYiGiL', dbg: 'localhost:3010'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-2n0u5w2p  is  {grp: 'SBnuuqPUVhGf6ATMkAJZgp5N', dbg: 'localhost:3010', type: 'floor', asset: 'color:orange'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u2w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: false, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-2n0u4w2p  is  {grp: '55Qvz3V3ZT0eSO4cRfxrj1FU', dbg: 'localhost:3010', type: 'floor', asset: 'Duck.glb'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n0u1w4p  is  {grp: 'TmiiPiEvT1HsyuFz6WyJB7pK', dbg: 'localhost:3010', mstr: true, type: 'floor', asset: 'street.jpg'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-0n1d2w9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n1d2w9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-0n1d1w9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1n1d1w9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-2s1d2w9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1s1d2w9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-2s1d1w9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}
MakeBoxesForShowingLeaves.tsx:39 MakeBoxesForShowingLeaves grp for:
testmain-1s1d1w9p  is  {grp: 'TmiPiEvT1Hz6WyJB7pKisyuF', dbg: 'localhost:3010', type: 'ceiling', asset: 'color:#88674E'}


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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
