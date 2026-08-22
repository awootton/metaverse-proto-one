
import * as THREE from 'three';

// what does useMemo do?
import React, { useRef, useState, useEffect, SetStateAction } from 'react';
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';
// import * as leaves from './MiscCubeRenderElements';
import * as sub from '../knotfree-ts-lib/avatars/PubSubSimple';
import * as bridge from '../knotfree-ts-lib/avatars/PubSubBridge';
// import * as pubsub from '../knotfree-ts-lib/avatars/PubSubTopicAndSubscribers';
import * as messes from '../knotfree-ts-lib/3d/messageTypes'
import * as leaves from './MiscCubeRenderElements'
import * as utils from '../knotfree-ts-lib/3d/utils';

import { GLTF, GLTFLoader } from 'three-stdlib';

import { mainpubsub } from '../App';
import { MasterToFriviousName } from '../knotfree-ts-lib/avatars/testServermap';


export type RenderThingsWithAuxGroupProps = {
    worldName: string
    aux: oct.AuxLeafStatus
}

// The changeover to using these Aux type groups is almost complete.

// we need something to subscribe to the aux changes and redraw when they change (we do, it's MakeBoxesForShowingGroups.tsx
// and it renders THESE! ).

// we're changing this to Group With Aux, and that's all of them because
// we're making every since leaf node a group and we're assigning an Aux to everyone.
// The Aux will have all the drawing information.
// they all have to subscribe to aux changes but the plain color ones can leave class early after that.

export function AuxGroupRender(props: RenderThingsWithAuxGroupProps) {

    // it ALWAYS has an aux but we add little surprises to it.

    const [loaded, setLoaded] = useState(false);
    // nope const [tempReturnChannel, setTempReturnChannel] = useState("");

    const aux = props.aux

    const masterName = oct.NoTld(aux.wholeMaster)
    // do we have to check it? 
    const [str, err] = oct.StringToCube(masterName)
    if (err) {
        console.error("ThingWithAux: aux.master is not a valid cube string: !! Shame.", masterName)
        return <></>
    }
    // console.log("ThingWithAux: rendering with aux:", aux, "and groupTxt:", props.aux.txtParams, "and masterName:", masterName)

    function drawAllAsBoxed() { // worse case fallback.
        const list: JSX.Element[] = []
        const listOfNames = oct.GetTheAuxLeafNames(aux)
        for (const name of listOfNames) {
            const [cube, err] = oct.StringToCube(name)
            if (err) {
                console.error(`Invalid cube string: ${name}`)
                continue
            }
            list.push(<leaves.CubeWithEdges cube={cube} key={name} />)
        }
        return <>{list}</>
    }

    // what we really want is a RPC-Gadget and the Cmd-Lacky.  
    // when can I send a "get info" command to the island?
    // our island channel is masterName + "-commands" NOT  , I don't like it.   island-brain is it 
    // in the other project it's "masterName_commands"  which is wrong.

    // "island-brain" would be the central hub for managing island state and commands.
    // on the mainland there woulld be a component exclusivelt dedicated to interacting with the islands-brain.
    // his name is "" 

    // Hey CP what's a good name for dockside telegraph office. Something clever. play on dicker and telegraph. tele - ?? 


    // FIXME: RPC and Lacky

    useEffect(() => {
        if (!loaded) {
            return
        }
        const temporaryChannel = masterName + "-" + utils.RandomString(18);
        mainpubsub.subscribe(temporaryChannel, "temp", (status: any, err: Error) => {

            console.log("ThingWithAux received on temp channel:", masterName, "status:", status, "err:", err)

        }, ".??..??!!??");// did we get a suback? Do we ever? let's move this then. No, we don't know the island will get
        // the sub and it MUST.

        // now see the response up on the temporaryChannel

        return () => {
            console.log("ThingWithAux: unsubscribed  temporaryChannel", temporaryChannel)
            mainpubsub.unsubscribe(temporaryChannel, "temp")
        }
    }, [loaded])

    useEffect(() => {

        sub.subscribe(masterName + "-loaded", (message: messes.MessageBaseClass, err: Error | null) => {
            // MakeAniFrame makes these pubs.
            console.log("ThingWithAux received -loaded message for master:", masterName, "message:", message, "name:",  MasterToFriviousName(masterName), "err:", err)
            
            setLoaded(true) // we can now load the aux and draw it.

            // It's ready for a CALL to demo of "The RPC sequence". 
            // does the island have the sub yet? 

            // we need a better name than "-commands" 

            // their command channel  
            // now send a 'about' command to the masterName + "-commands" channel and get a (text) answer back via the callback.

            const ourSubscribeName = "testmain-2n0u4w2p-about"
            mainpubsub.publish(ourSubscribeName, "about") // it doesn't matter what you say, there should always be a response.
            // now see the response up on the temporaryChannel
        });

        return () => {
            sub.unsubscribe(masterName + "-loaded")
        }
    },[])

    // now we can start falling back on old ways.
    // the old color hints
    if (aux.oldeTxtJunk?.color) {

        // split it again just in case there are bots and junkies helping.
        const parts = aux.oldeTxtJunk.color.split(":")
        if (parts.length === 2) {
            aux.oldeTxtJunk.color = parts[1]
            // is the first part "color"?
        } else {
            // console.warn("ThingWithAux: aux.oldeTxtJunk.color has unexpected format:", aux.oldeTxtJunk.color)
        }
        // console.log("ThingWithAux: aux batch of color cubes", aux.oldeTxtJunk.color, " type is ", aux.oldeTxtJunk.type, " asset is ", aux.oldeTxtJunk.asset)

        const listOfLeaves: oct.TreeStatus[] = oct.GetTheAuxTreeStatus(aux)

        const someprops: leaves.MakeBoxesForDemoSpacesProps = {
            worldName: props.worldName,
            aux: aux,
        }

        const ele = leaves.MakeBoxesForColorGroup(someprops)
        return ele
    }
    if (aux.oldeTxtJunk) {
        // console.log("ThingWithAux: aux have oldeTxtJunk?.textureUrl", aux.oldeTxtJunk.color, " type is ", aux.oldeTxtJunk.type, " asset is ", aux.oldeTxtJunk.asset)
    }

    // this is actually asset="steet.jpg"
    // the old texture hints and url loads.
    if (aux.oldeTxtJunk?.textureUrl) {
        // const ele = leaves.x({ worldDisplayState: props.state, groupInfo: group, index Base: props.inde xBase })

        if (aux.oldeTxtJunk) {
            //  console.log("ThingWithAux: aux have oldeTxtJunk?.textureUrl", aux.oldeTxtJunk.color, " type is ", aux.oldeTxtJunk.type, " asset is ", aux.oldeTxtJunk.asset)
        }

        const myprops: leaves.MakeBoxesForDemoSpacesPropsAux = {
            aux: aux,
            worldName: props.worldName,
        }

        // console.log("MakeBoxesForShowingLeaves: calling MakeBoxesForTextureGroup for batch: ")
        // call he batch renderer for this group. 
        const tmp = (
            <leaves.MakeBoxesForTextureGroup2 {...myprops} />
        )
        return tmp
    }

    if (Object.keys(aux.glbItems).length === 0) {
        return drawAllAsBoxed() //  oops.  nobody home.
    }
    // but let's say there is a key! 
    // now we enter the frightful world of converting blobs into GLB's and then into scenes and then into meshes.
    // and then rendering them.
    // Presuably we can subscribe to animation tricks and other cool stuff. But for now, let's just get the GLB to render.

    const firstKey = Array.from(aux.glbItems.keys())[0];
    const item = aux.glbItems.get(firstKey);
    if (!item) {
        console.error("ThingWithAux: aux.glbItems has key but no item for key:", firstKey)
        return drawAllAsBoxed()
    }
    const firstItemStatus = item?.active;
    const firstItem = item?.blob;
    console.log("ThingWithAux: found glbItems with first key:", firstKey, "active:", firstItemStatus)
    /// we're supposed to parse this bad boy into some parts,

    let foundGlb: GLTF | null = null
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const scene = new THREE.Scene();

    // let's try this one:
    // this makes a scene, the one above.
    firstItem.arrayBuffer().then((arrayBuffer: ArrayBuffer) => {
        const loader = new GLTFLoader();

        loader.parse(
            arrayBuffer,
            '',
            (loadedGltf: GLTF) => {
                // foundGlb = loadedGltf //  setGltf(loadedGltf);

                scene.add(loadedGltf.scene);

                // Check if the GLB file contains embedded animations
                if (loadedGltf.animations && loadedGltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(loadedGltf.scene);

                    // Play the first animation clip by default
                    const action = mixer.clipAction(loadedGltf.animations[0]);
                    action.play();

                    mixerRef.current = mixer;
                }
            },
            (error) => {
                console.error('Error parsing GLTF array buffer:', error);
            }
        );
    });

    // Clean up mixer and actions on unmount or blob change
    // where, where, why and how. 
    // in the final version we parse it once and that's economical.
    //return () => 
    { // I don't think there is one of these anyway.
        if (mixerRef.current) {
            mixerRef.current.stopAllAction();
            mixerRef.current = null;
        }
    };

    // now what? I expect the rest ts garbage, 'I'm not sure ThingWithAux is a component for.

    // can we just render the foundGlb in a scene thing?
    // it looks like it should draw.

    return (
        <mesh key={aux.wholeMaster} >
            <primitive object={scene} />
        </mesh>
    )

} // end of ThingWithAux


// nobody using this? Buh, bye
// someone is using it but I'm changing it to aux

export type LeafRenderingComponentProps = {
    treeStatus: oct.TreeStatus
    groupInfo: oct.GroupTextParameters // let's also know this always.
}


// can we delete this already?
// FIXME: group the things with the same texture (and id) and draw them all at once. This will be more efficient than drawing each one separately. We can do this by creating a map of texture to list of cubes, and then drawing each list of cubes with the same texture in one go.
// for now, just draw the glb ones one at a time
// thing with Aux draws glb's // discontining this.
// export function XXxxXXThingWithGlb({ props, indexBase }: ThingWithGlbProps) {

//     const groupInfo = props.groupInfo
//     let baseUrl = "http://" + props.treeStatus.name
//     const treeStatus = props.treeStatus
//     // if (treeStatus.wasXYZ) {
//     //     baseUrl += ".xyz"
//     // } else {
//     //     baseUrl += ".vr"
//     //}
//     const cube = props.treeStatus.cube
//     const center: [number, number, number] = [cube.x + (2 ** cube.p) / 2, cube.y + (2 ** cube.p) / 2, cube.z + (2 ** cube.p) / 2]
//     const width = (2 ** cube.p)
//     const size = width

//     let asset = groupInfo.asset

//     let glbUrl = baseUrl + "/" + asset

//     const forceRemote = false
//     glbUrl = RewriteUrl(glbUrl, groupInfo, treeStatus, forceRemote)

//     // console.log("ThingWithGlb glbUrl ", glbUrl, "remote URL will be ", glbUrl)

//     const adjustment = 0.1

//     const centerBottom: [number, number, number] = [center[0], center[1] - size / 2 + adjustment, center[2]]

//     // FIXME - use the actual asset url, and make sure it's a glb url.
//     let glb;
//     try {
//         const { scene } = useGLTF(glbUrl);
//         return (
//             <>
//                 {/* <mesh
//                     position={centerBottom}
//                    // rotation={[-Math.PI / 2, 0, 0]} // rotate the plane to be horizontal
//                 > */}
//                 <primitive object={scene} position={centerBottom} key={indexBase} />
//                 {/* </mesh> */}
//             </>
//         );
//     } catch (e) {
//         // should we announce this? 
//         console.log("Failed to load GLB:", glbUrl, e)
//         // we should have a version of this with a big "error" sign posted at eye level. TODO:
//         // I'm getting this with a glbUrl that works, and will eventually load.
//         // what do I do in the meantime? 
//         // set a timer? Doesn't work. If I go to orbital view then it starts working. wtf.
//         // setTimeout(() => {
//         //     setTries(tries + 1)
//         // }, 30000)

//         return <CubeWithEdges cube={cube} key={indexBase} />
//     }
// }


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
