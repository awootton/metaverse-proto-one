

import * as THREE from 'three';

// what does useMemo do?
import React, { Suspense, useRef, useState, useEffect, SetStateAction } from 'react';
import { useFrame } from '@react-three/fiber';
import * as oct from '../knotfree-ts-lib/3d/DomainNameOctTree';
import { Edges } from '@react-three/drei';
import { useTexture, useGLTF } from '@react-three/drei';
import RewriteUrl from './RewriteUrl';
import { OutlineBoxComponent } from './OutlineBoxComponent'
import * as leaves from './LeafRenderingComponent'
import { CubeWithEdges } from './LeafRenderingComponent';

import { GLTF, GLTFLoader } from 'three-stdlib';
import { Object3DEventMap } from 'three';
import * as sub from './PubSubSimple'
import * as messes from '../knotfree-ts-lib/3d/messageTypes'
import { group } from 'console';
import { BatchInfo } from '../knotfree-ts-lib/3d/DomainNameOctTree';

export type ThingWithAuxProps = {
    // state: WorldDisplayState
    worldName: string
    // previousCameraPosition: 
    // timeSinceLastCameraMovement: 
    // theGlobalTree:  
    // uniqueId: string
    onlyShowOutlineBoxes: boolean
    showOriginAxis: boolean

    aux: oct.AuxLeafStatus
  //  indexB ase: number
    groupTxt: oct.GroupTextParameters
    //   //    //     //     buy bye batchInfo: oct.BatchInfo
}

// we're changing this to Group With Aux, and that's all of them because
// we're making every since leaf node a group and we're assigning an Aux to everyone.
// The Aux will have all the drawing information.
// they all have to subscribe to aux changes but the plain color ones can leave class early after that.

export function ThingWithAux(props: ThingWithAuxProps) {

    // it ALWAYS has an aux but we add little suproses to it.
    const [aux, setAux] = useState<oct.AuxLeafStatus>(props.aux);

    const [sequence, setSequence] = useState<number>(0); // totally fake

    const masterName = oct.NoTld(aux.wholeMaster)
    // do we have to check it? 
    const [str,err] = oct.StringToCube(masterName)
    if (err) {
        console.error("ThingWithAux: aux.master is not a valid cube string:", masterName)
        return <></>
    }
    console.log("ThingWithAux: rendering with aux:", aux, "and groupTxt:", props.groupTxt)

    function drawAllAsBoxed() { // worse case fallback.
        const list: JSX.Element[] = []
        const listOfNames = oct.GetTheAuxLeafNames(aux)
        for (const name of listOfNames) {
            const [cube, err] = oct.StringToCube(name)
            if (err) {
                console.error(`Invalid cube string: ${name}`)
                continue
            }
            list.push(<CubeWithEdges cube={cube} key={name} />)
        }
        return <>{list}</>
    }

    // we have to ALWAYS do the useEffect `master + "-redraw" subscription or it will get mad. ?
    // But, it's quick. ?
    // should we break these up into two useEffects? One for the redraw and one for the glb changes?
    useEffect(() => {

        const master: string = oct.NoTld(aux.wholeMaster);
        if (master !== aux.wholeMaster) {
            console.warn(`ThingWithAux: aux.master had TLD, stripped to ${master}`)
        }

        // this is really a "modify my draw list" message.
        sub.subscribe(master + "-redraw", (message: messes.MessageBaseClass, err: Error | null) => {

            // fo real though. Just make a redraw. 
            setSequence(sequence + 1) // force a re-render of the component when a redraw message is received

            // don't put glb stuff in a redraw

            // console.log("ThingWithAux received redraw message for key:", redrawMessage.key,
            //     "from master:", redrawMessage.name, "with comment:", redrawMessage.comment,
            //     "and a blob of ??:", redrawMessage.data?.size, "active:", redrawMessage.active
            // )
            // if (redrawMessage.data === undefined || redrawMessage.data === null) {
            //     console.error("ThingWithAux: redraw message has no data, ignoring.")
            //     return
            // }

            // let newAux: oct.AuxLeafStatus = { ...aux, } // shallow copy
            // const newGlbStatus: oct.GlbStatus = {
            //     blob: redrawMessage.data,
            //     active: redrawMessage.active,
            // }
            // newAux.glbItems.set(redrawMessage.key, newGlbStatus)
            // setAux(newAux) // update the aux state with the new aux data

            // just change the aux amd quit for now.

            // do we parse this now into a dict of 

            // setBlob(message.data); // force a re-render of the GLB when a redraw message is received
            // // and also
            // let aux = oct.gAuxTreeCache.get(message.name)
            // if (!aux) { // this is very bogus
            //     aux = {
            //         master: message.master,
            //         names: [message.name],
            //         glbBlobs: {}
            //     }
            //     aux.glbBlobs[message.key] = message.data
            //     oct.gAuxTreeCache.set(message.name, aux)
            // }

            // setAux(aux); // update the aux state with the new aux data


        });

                // this is really a "modify my draw list" message.
        sub.subscribe(master + "-glb-changes", (message: messes.GlbMessage, err: Error | null) => {

            const glbMessage = message as messes.GlbMessage

            console.log("ThingWithAux received -glb-changes message for key:", glbMessage )
      
            // right we assume an "add" command. 
            let newAux: oct.AuxLeafStatus = { ...aux, } // shallow copy
            const newGlbStatus: oct.GlbStatus = {
                blob: glbMessage.data,
                active: glbMessage.active,
            }
            newAux.glbItems.set(glbMessage.key, newGlbStatus)
            setAux(newAux) // update the aux state with the new aux data    

            // setAux(aux); // update the aux state with the new aux data
        });

        // now, go forth and redraw.
        return () => {
            sub.unsubscribe(master + "-redraw");
            sub.unsubscribe(master + "-glb-changes");
        }
    },);

    // now we can start falling back on old ways.
    // the old color hints
    if (aux.oldeTxtJunk?.color) {

        const listOfLeaves: oct.TreeStatus[] = oct.GetTheAuxTreeStatus(aux)

        // make aux to groupInfo. function. Function AuxToGroupInfo(aux: oct.AuxLeafStatus): oct.GroupInfo {
        const myGroup: BatchInfo = {
            masterName: aux.wholeMaster,
            type: aux.oldeTxtJunk.type || "color",
            asset: aux.oldeTxtJunk.textureUrl || "",
            groupInfo: aux.txtParams,
            leaves: listOfLeaves,
            auxRecord: aux,
        }

        const someprops: leaves.MakeBoxesForDemoSpacesProps = {         
            worldName: props.worldName,      
            groupInfo: myGroup,
        }

        const ele = leaves.MakeBoxesForColorGroup(someprops)
        return ele
    }
    // this is actually asset="steet.jpg"
    // the old texture hints and url loads.
    if (aux.oldeTxtJunk?.textureUrl) {
        // const ele = leaves.MakeBoxesForImageGroup({ worldDisplayState: props.state, groupInfo: group, index Base: props.inde xBase })

        const myprops: leaves.MakeBoxesForDemoSpacesPropsAux = {
           //  worldDisplayState: props.state,
            aux: aux,
     //       index Base: props.index Base, 
            worldName: props.worldName,
         //   uniqueId: props.uniqueId,
         //   onlyShowOutlineBoxes: props.onlyShowOutlineBoxes,
         //   showOriginAxis: props.showOriginAxis,
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
    // but let's  say there is a key! 
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
        <mesh  >
            <primitive object={scene} />
        </mesh>
    )


    // }// , [blob]); // whe does it think we're at the nend of a use effect? Whch one?

    // Advance the animation timeline on every frame
    // useFrame((_, delta) => {
    //     if (mixerRef.current) {
    //         mixerRef.current.update(delta);
    //     }
    // });

} // end of ThingWithAux







// is this all garbage from here on down?





// like: 
// ThingWithAuxProps
// export type ThingWithAuxProps = {
//     state: WorldDisplayState
//     aux: oct.AuxLeafStatus
//     indexBase: number
//     groupTxt: oct.GroupTextParameters
//     // batchInfo: oct.BatchInfo
// }


export type LeafRenderingComponentProps = {
    treeStatus: oct.TreeStatus
    //  cameraPosition: THREE.Vector3 // this would force a redraw anyway, and it's unused.
    groupInfo: oct.GroupTextParameters // let's also know this always.
}

type ThingWithGlbProps = {
    props: LeafRenderingComponentProps,
    indexBase: number
}

// FIXME: group the things with the same texture (and id) and draw them all at once. This will be more efficient than drawing each one separately. We can do this by creating a map of texture to list of cubes, and then drawing each list of cubes with the same texture in one go.
// for now, just draw the glb ones one at a time
// thing with Aux draws glb's // discontining this.
export function XXxxXXThingWithGlb({ props, indexBase }: ThingWithGlbProps) {

    const groupInfo = props.groupInfo
    let baseUrl = "http://" + props.treeStatus.name
    const treeStatus = props.treeStatus
    // if (treeStatus.wasXYZ) {
    //     baseUrl += ".xyz"
    // } else {
    //     baseUrl += ".vr"
    //}
    const cube = props.treeStatus.cube
    const center: [number, number, number] = [cube.x + (2 ** cube.p) / 2, cube.y + (2 ** cube.p) / 2, cube.z + (2 ** cube.p) / 2]
    const width = (2 ** cube.p)
    const size = width

    let asset = groupInfo.asset

    let glbUrl = baseUrl + "/" + asset

    const forceRemote = false
    glbUrl = RewriteUrl(glbUrl, groupInfo, treeStatus, forceRemote)

    // console.log("ThingWithGlb glbUrl ", glbUrl, "remote URL will be ", glbUrl)

    const adjustment = 0.1

    const centerBottom: [number, number, number] = [center[0], center[1] - size / 2 + adjustment, center[2]]

    // FIXME - use the actual asset url, and make sure it's a glb url.
    let glb;
    try {
        const { scene } = useGLTF(glbUrl);
        return (
            <>
                {/* <mesh
                    position={centerBottom}
                   // rotation={[-Math.PI / 2, 0, 0]} // rotate the plane to be horizontal
                > */}
                <primitive object={scene} position={centerBottom} key={indexBase} />
                {/* </mesh> */}
            </>
        );
    } catch (e) {
        // should we announce this? 
        console.log("Failed to load GLB:", glbUrl, e)
        // we should have a version of this with a big "error" sign posted at eye level. TODO:
        // I'm getting this with a glbUrl that works, and will eventually load.
        // what do I do in the meantime? 
        // set a timer? Doesn't work. If I go to orbital view then it starts working. wtf.
        // setTimeout(() => {
        //     setTries(tries + 1)
        // }, 30000)

        return <CubeWithEdges cube={cube} key={indexBase} />
    }
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
