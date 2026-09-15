
import * as THREE from 'three';

// what does useMemo do?

import React, { useRef, useState, useEffect, SetStateAction } from 'react';
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';
import * as leaves from './MiscCubeRenderElements'

import { GLTF, GLTFLoader } from 'three-stdlib';
import { useGLTF } from "@react-three/drei"

import { mainpubsub } from '../App';

import { Cmd_Lacky, ICommand } from '../knotfree-ts-lib/avatars/Cmd_Lacky';
import { RPC_Gadget } from '../knotfree-ts-lib/avatars/RPC_Gadget';


export type RenderThingsWithAuxGroupProps = {
    worldName: string
    aux: oct.AuxLeafStatus
}

// The changeover to using these Aux type groups IS almost complete.

// we need something to subscribe to the aux changes and redraw when they change (we do, it's MakeBoxesForShowingGroups.tsx
// and it renders THESE! ).

// we're changing this to Group With Aux, and that's all of them because
// we're making every since leaf node a group and we're assigning an Aux to everyone.
// The Aux will have all the drawing information.
// they all have to subscribe to aux changes but the plain color ones can leave class early after that.

export function AuxGroupRender(props: RenderThingsWithAuxGroupProps) {

    // it ALWAYS has an aux but we add little surprises to it.

    const [loaded, setLoaded] = useState(false);

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

    // what we really want is a RPC-Gadget and the Cmd_Lacky.  
    // when can I send a "get info" command to the island?

    console.log("AuxGroupRender: masterName is", masterName, "Starting centre and for ", masterName + "-mainland-centre");

    const cmdr = new Cmd_Lacky();
    const rpc = new RPC_Gadget(mainpubsub, masterName, masterName + "-mainland-centre", cmdr);

    // hey cmdr. Where's my commands?

    useEffect(() => {// boiler plate.

        // our actual name is master-mainland-centre

        console.log("AuxGroupRender subscribing to our channel:", rpc.GetOurChannelName());

        // can we override the 'hello' of orange aka 4w?
        if (masterName == "testmain-2n0u4w2p") {

            { // note sure about this one. 
                const islandCenterCount = mainpubsub.doesItemExist("testmain-2n0u4w2p-island-centre")
                console.log("Island center count for testmain-2n0u4w2p-island-centre:", islandCenterCount)
                if (islandCenterCount === 0) {
                    console.warn("111 FAIL FAIL FAIL FAIL No subscribers found for testmain-2n0u4w2p-island-centre osioeryhgr");
                }
            }

            // after 20 seconds send a "hello" command to the island. hello testmain-2n0u4w2p-island-centre
            // test a message going to the island-centre, and probably the temp channel also.
            setTimeout(() => {

                {
                    const islandCenterCount = mainpubsub.doesItemExist("testmain-2n0u4w2p-island-centre")
                    console.log("Island center count for testmain-2n0u4w2p-island-centre:", islandCenterCount)
                    if (islandCenterCount === 0) {
                        console.warn("222 Major FAIL FAIL FAIL FAIL No subscribers found for testmain-2n0u4w2p-island-centre osioeryhgr222");
                    }
                }

                console.log("Sending hello to testmain-2n0u4w2p-island-centre test1");

                mainpubsub.publish("testmain-2n0u4w2p-island-centre", "hello from mainland e5678");

            }, 20000);


            console.log("AuxGroupRender: masterName matches testmain-2n0u4w2p, can override 'hello' of orange aka 4w");
            const newHelloCommand: ICommand = {
                command: "hello",
                description: "Overridden hello command for testmain-2n0u4w2p",
                execute: (msg: any, callContext: any) => {
                    console.log("Overridden 'hello' command executed with msg:", msg);
                    return "Hello from the orange land! so4wh";
                }
            };
            cmdr.AddCommand(newHelloCommand);


        }


    }, []); // empty dependency array means this effect runs once on mount and cleans up on unmount is that right?  yes.  see https://react.dev/reference/react/useEffect

    // fix this later
    // if (masterName !== "testmain-2n0u4w2p") {
    //     return drawAllAsBoxed()
    // }


    // olde ways turned off dor a while. Trying to blob and ubblob shiva
    // now we can start falling back on old ways.
    // the old color hints
    if (aux.oldeTxtJunk?.color) { //&& (aux.oldeTxtJunk.color.includes(skipOlde))) {

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
    if (aux.oldeTxtJunk?.textureUrl) { //&& (aux.oldeTxtJunk.textureUrl.includes(skipOlde))) {
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

    {// everybody else
        return drawAllAsBoxed() //  oops.  nobody home.
    }


    function doConverter(): Blob | null {

        const agtlf = useGLTF("/shiba/scene.gltf")
        // can we make a blob here?
        // Yes. agtlf looks good from Shiba
        // animations: []
        // asset: 
        // {extras: {…}, generator: 'Sketchfab-12.68.0', version: '2.0'}
        // cameras: []
        // materials: {default: MeshBasicMaterial}
        // nodes:  {Sketchfab_Scene: Group, Sketchfab_model: Object3D, 1FBX: Object3D, RootNode: Object3D, Group18985: Object3D, …}
        // parser :  GLTFParser {json: {…}, extensions: {…}, plugins: {…}, options: {…}, cache: {…}, …}
        // scene : Group {isObject3D: true, uuid: '08ffc715-b532-46f2-bba9-1158bc87951a', name: 'Sketchfab_Scene', type: 'Group', parent: null, …}
        // scenes :  [Group]
        // userData :  {}

        // Example: Converting a file input or fetched GLTF/GLB into a Blob

        // Read the file as an ArrayBuffer
        //   const arrayBuffer = await agtlf.arrayBuffer();

        //   // Create a Blob from the buffer
        //   const gltfBlob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });

        //   // You can now create a local blob URL if needed
        //   const blobUrl = URL.createObjectURL(gltfBlob);
        //   return gltfBlob;
        //}

        //    return agtlf // is this not a blob? 

        convertGlbToGltfBlobs(agtlf).then(
            (
                { gltfBlob, binBlob }) => {
                console.log("Converted GLB to GLTF blobs:", gltfBlob, binBlob);
                return gltfBlob;

            }).catch((error) => {
                console.error("Error converting GLB to GLTF blobs:", error);
                return null
            });
        return null; // ensure the function returns a value even if the promise hasn't resolved yet
    }

    var haveGlbBlob: Blob | null = doConverter()

    // but let's say there is a key! 
    // now we enter the frightful world of converting blobs into GLB's and then into scenes and then into meshes.
    // and then rendering them.
    // Presuably we can subscribe to animation tricks and other cool stuff. But for now, let's just get the GLB to render.

    // const firstKey = Array.from(aux.glbItems.keys())[0];
    // const firstKey = "dummy_key" // placeholder since we're not using aux.glbItems anymore
    if (!haveGlbBlob) {
        console.error("ThingWithAux: haveGlbBlob is null :")
        return drawAllAsBoxed()
    }
    const firstItemStatus = true // item?.active;

    const firstItem = haveGlbBlob //put blob here for experiment.item?.blob;
    //   console.log("ThingWithAux: found glbItems with first key:", firstKey, "active:", firstItemStatus)
    /// we're supposed to parse this bad boy into some parts,

    ////////let foundGlb: GLTF | null = null


    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const scene = new THREE.Scene();

    console.log("haveGlbBlob is available:", haveGlbBlob);

    // if (haveGlbBlob !== null) {

    //     // let's try this one:
    //     // this makes a scene, the one above.
    //     haveGlbBlob.arrayBuffer().then((arrayBuffer: ArrayBuffer) => {

    //         const loader = new GLTFLoader();

    //         loader.parse(
    //             arrayBuffer,
    //             '',
    //             (loadedGltf: GLTF) => {
    //                 // foundGlb = loadedGltf //  setGltf(loadedGltf);

    //                 scene.add(loadedGltf.scene);

    //                 // Check if the GLB file contains embedded animations
    //                 if (loadedGltf.animations && loadedGltf.animations.length > 0) {
    //                     const mixer = new THREE.AnimationMixer(loadedGltf.scene);

    //                     // Play the first animation clip by default
    //                     const action = mixer.clipAction(loadedGltf.animations[0]);
    //                     action.play();

    //                     mixerRef.current = mixer;
    //                 }
    //             },
    //             (error) => {
    //                 console.error('Error parsing GLTF array buffer:', error);
    //             }
    //         );
    //     });

    //     // Clean up mixer and actions on unmount or blob change
    //     // where, where, why and how. 
    //     // in the final version we parse it once and that's economical.
    //     //return () => 
    //     { // I don't think there is one of these anyway.
    //         if (mixerRef.current) {
    //             mixerRef.current.stopAllAction();
    //             mixerRef.current = null;
    //         }
    //     };

    //     // now what? I expect the rest ts garbage, 'I'm not sure ThingWithAux is a component for.

    //     // can we just render the foundGlb in a scene thing?
    //     // it looks like it should draw.

    //     return (
    //         <mesh key={aux.wholeMaster} >
    //             <primitive object={scene} />
    //         </mesh>
    //     )
    // } else {
    //     return drawAllAsBoxed()
    // }

} // end of ThingWithAux


// nobody using this? Buh, bye
// someone is using it but I'm changing it to aux

export type LeafRenderingComponentProps = {
    treeStatus: oct.TreeStatus
    groupInfo: oct.GroupTextParameters // let's also know this always.
}

async function convertGlbToGltfBlobs(glbBlob: any) {
    const arrayBuffer = await glbBlob.arrayBuffer();
    const dataView = new DataView(arrayBuffer);

    // 1. Verify GLB Header
    const magic = dataView.getUint32(0, true);
    if (magic !== 0x46546C67) { // "glTF" in ASCII
        throw new Error("Not a valid GLB file.");
    }

    const version = dataView.getUint32(4, true);
    const totalLength = dataView.getUint32(8, true);

    let offset = 12;
    let gltfJson = null;
    let binBlob = null;

    // 2. Walk through the GLB chunks
    while (offset < totalLength) {
        const chunkLength = dataView.getUint32(offset, true);
        const chunkType = dataView.getUint32(offset + 4, true);
        offset += 8;

        if (chunkType === 0x4E4F534A) { // "JSON" chunk
            const jsonBuffer = arrayBuffer.slice(offset, offset + chunkLength);
            const decoder = new TextDecoder("utf-8");
            gltfJson = JSON.parse(decoder.decode(jsonBuffer));
        }
        else if (chunkType === 0x004E4942) { // "BIN" chunk
            const binBuffer = arrayBuffer.slice(offset, offset + chunkLength);
            binBlob = new Blob([binBuffer], { type: "application/octet-stream" });
        }

        offset += chunkLength;
    }

    if (!gltfJson) throw new Error("No JSON chunk found in GLB.");

    // 3. Point the glTF JSON to the new BIN blob URI if a BIN chunk exists
    if (binBlob && gltfJson.buffers && gltfJson.buffers[0]) {
        const binBlobUrl = URL.createObjectURL(binBlob);
        gltfJson.buffers[0].uri = binBlobUrl;
        // Note: If you are downloading these files, you'll want to change this uri 
        // to a relative path like "data.bin" instead of a temporary blob URL.
    }

    // 4. package the glTF JSON back into a text/json Blob
    const gltfBlob = new Blob([JSON.stringify(gltfJson, null, 2)], { type: "application/json" });

    return {
        gltfBlob,
        binBlob
    };
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
