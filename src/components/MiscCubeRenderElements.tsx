import * as THREE from 'three';

// what does useMemo do?
import React, { Suspense, useRef } from 'react';
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';
import { Edges } from '@react-three/drei';
import { useTexture } from '@react-three/drei';
import RewriteUrl from './RewriteUrl';
import { OutlineBoxComponent } from './OutlineBoxComponent'
import * as leaves from './MiscCubeRenderElements'
// import { WorldDisplayState } from './WorldDisplayState';
import { LeafRenderingComponentProps, AuxGroupRender } from './AuxGroupRenderer';


// This falls out of favor as we change to rendering groups instead of individual cubes. But it's still here for now.
// 

// some varations of rendering a cube. The simplest is just a box with edges. 
// The next is a box with a texture. 

// The next is a box with a color. 
// The next is a box with an outline. The next is a box with an outline and a texture. 
// 
// Mostly they are antique because we only render groups now even if it's a group of one.


export const cube0: oct.Cube = {
    world: "testmain",
    x: 0,
    y: 0,
    z: 0,
    p: 0
}

export type LeafRenderingComponentGroupProps = {
    treeStatus: oct.TreeStatus
    groupInfo: oct.GroupTextParameters // let's also know this always.
}

export type MakeBoxesForDemoSpacesPropsAux = {
    //worldDisplayState: WorldDisplayState

    worldName: string

    aux: oct.AuxLeafStatus
    // indexBase: number // worst feature EVER.
}


// CubeWithEdges is the most basic, fallback rendering of a leaf. It just draws a box with edges. 
// It doesn't use any textures or glbs or colors. It's just a box with edges. It's used as a fallback when we can't load the texture or glb for some reason.
// We hope to NEVER see it. It's not a fast way.
export type CubeWithEdgesProps = {
    cube: oct.Cube,
    // a cube ALREADY has unique name.
    //  index: number // it's picky about this stuff.
}
export function CubeWithEdges(props: CubeWithEdgesProps) {
    const cube = props.cube

    const center = oct.CubeToCenter(cube)
    const width = (2 ** cube.p)
    const size = width

    return (
        <mesh
            position={center}
        >
            <boxGeometry
                args={[size * 0.98, size * 1.0, size * 0.98]}
            />
            <meshBasicMaterial color="lightblue" opacity={0.1} transparent />
            <Edges color="blue" />

        </mesh>
    );
}


// Some of the leaves have drawing hints, like texture, color and glb so we don't have to ask
// their iFrames to do the drawing. This is for performance reasons, and also because we want to be able to draw something even if the iFrame is not working for some reason.
// And, right now the iFrames parts aren't even written.

// we should sort them out by type and just load the textures and glbs once and then reuse them for all the leaves that need them. TODO: later. For now just load them in the leaf component and see how it goes.
// we should just pass the treeStatus here.
// clean this up so a 5 year old could understand it. Like ....... me.

// this is getting outmoded. The decision about who draws, in batches, is done at a higher level.
// why does it need the camera position? It doesn't.
export function LeafRenderingComponent(props: LeafRenderingComponentGroupProps) {

    const cube = props.treeStatus.cube

    let baseUrl = "http://" + props.treeStatus.name
    const treeStatus = props.treeStatus
    // if (treeStatus.wasXYZ) {
    //     baseUrl += ".xyz"
    // } else {
    //     baseUrl += ".vr"
    // }

    const groupInfo: oct.GroupTextParameters = treeStatus.groupId as oct.GroupTextParameters

    const isDebug = window.location.href.includes("localhost")
    // console.log("LeafRenderingComponent ", treeStatus.groupId, treeStatus.cube, " isDebug ", isDebug)
    // console.log("LeafRenderingComponent groupInfo", groupInfo, " isDebug ", isDebug)

    const center = oct.CubeToCenter(cube)

    const width = (2 ** cube.p)

    const size = width

    const markerSize = 1 / 16 * (2 ** cube.p)

    // const corners: [number, number, number][] = [
    //     [cube.x + 0, cube.y + 0, cube.z + 0],
    //     [cube.x + width, cube.y + 0, cube.z + 0],
    //     [cube.x + 0, cube.y + 0, cube.z + width],
    //     [cube.x + width, cube.y + 0, cube.z + width],
    // ]
    // // these corners are the corners of the cube, but we want to draw small boxes at these corners, so we need to adjust the positions of the small boxes to be centered on the corners.
    // // to do this, we need to subtract half the size of the small box from each corner position.
    // for (let i = 0; i < corners.length; i++) {
    //     corners[i][0] += corners[i][0] - center[0] > 0 ? -markerSize / 2 : markerSize / 2
    //     corners[i][1] += corners[i][1] - center[1] > 0 ? -markerSize / 2 : markerSize / 2
    //     corners[i][2] += corners[i][2] - center[2] > 0 ? -markerSize / 2 : markerSize / 2
    // }

    function CubeWithEdges() {

        return (
            <mesh
                position={center}
            >
                <boxGeometry
                    args={[size * 0.98, size * 1.0, size * 0.98]}
                />
                <meshBasicMaterial color="lightblue" opacity={0.5} transparent />
                <Edges color="lightblue" />

            </mesh>
        );
    }

    // FIXME: group the things with the same texture (and id) and draw them all at once. This will be more efficient than drawing each one separately. We can do this by creating a map of texture to list of cubes, and then drawing each list of cubes with the same texture in one go.
    function ThingWithTexture(props: { treeStatus: oct.TreeStatus, groupInfo: oct.GroupTextParameters }) {

        const [tries, setTries] = React.useState(0)

        let asset = props.groupInfo.asset
        // if it ends with :repeat:N then parse that out and use it to repeat the texture.
        let repeat = 1
        if (asset) {
            const repeatMatch = asset.match(/:repeat:(\d+)$/)
            if (repeatMatch) {
                repeat = parseInt(repeatMatch[1])

                asset = asset.replace(/:repeat:\d+$/, "")
            }
        }

        let textureUrl = baseUrl + "/" + asset

        textureUrl = RewriteUrl(textureUrl, groupInfo, treeStatus)

        // if (window.location.href.includes("localhost") && groupInfo.dbg) {
        //     textureUrl = "http://" + groupInfo.dbg + "/" + asset
        // }
        // console.log("ThingWithTexture textureUrl ", textureUrl)

        // FIXME - use the actual asset url, and make sure it's a texture url.
        let texture;
        try {
            texture = useTexture(textureUrl)
        } catch (e) {
            // just shut up already - console.error("Failed to load texture:", textureUrl, e)
            // we should have a version of this with a big "error" sign pos ted at eye level. TODO:
            // I'm getting this with a textureUrl that works, and will eventually load.
            // what do I do in the meantime? 
            // set a timer? Doesn't work. If I go to orbital view then it starts working. wtf.
            // setTimeout(() => {
            //     setTries(tries + 1)
            // }, 30000)

            return <CubeWithEdges />
        }

        // Configure repeating settings
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeat, repeat); // Adjust numbers to repeat texture across the faces

        // the adjustment needs to be abolute and not relative to the size of the cube. 
        // So we need to adjust the size of the plane to be the size of the cube, and then adjust 
        // the position of the plane to be at the center of the cube.
        const adjustment = 0.1 // 

        //   if ( groupInfo.type === "floor" || groupInfo.type === "ceiling"){
        const centerBottom: [number, number, number] = [center[0], center[1] - size / 2 + adjustment, center[2]]
        const centerTop: [number, number, number] = [center[0], center[1] + size / 2 - adjustment, center[2]]

        if (groupInfo.type === "floor") {
            return (
                <mesh
                    position={centerBottom}
                    rotation={[-Math.PI / 2, 0, 0]} // rotate the plane to be horizontal
                >
                    <planeGeometry
                        args={[size, size]}
                    />
                    <meshBasicMaterial map={texture} side={THREE.DoubleSide} />

                </mesh>
            )
        }
        if (groupInfo.type === "ceiling") {
            return (
                <mesh
                    position={centerTop}
                    rotation={[Math.PI / 2, 0, 0]} // rotate the plane to be horizontal
                >
                    <planeGeometry
                        args={[size, size]}
                    />
                    <meshBasicMaterial map={texture} side={THREE.DoubleSide} />

                </mesh>
            )
        }

        return (
            <>
                <mesh
                    position={center}
                >
                    <boxGeometry
                        args={[size * 0.98, size * 1.0 - adjustment, size * 0.98]}
                    />
                    <meshBasicMaterial map={texture} />

                </mesh>

                <CubeWithEdges />
            </>
        );
    }

    // export function Duck() {
    //     const { scene } = useGLTF('Duck.glb');

    //     return (
    //         <>
    //             <primitive object={scene} />
    //         </>
    //     );
    // }


    function MakeChoices() {

        if (groupInfo !== undefined && groupInfo.asset) {
            const asset = groupInfo.asset
            if (asset.startsWith("color:")) {
                return <leaves.ThingWithColor {...props} />
            } else if (asset.match(/\.(jpg|jpeg|png|gif|bmp|webp)(:repeat:\d+)?$/)) {
                return (
                    <Suspense fallback={<CubeWithEdges />}>
                        <ThingWithTexture treeStatus={props.treeStatus} groupInfo={props.groupInfo} />
                    </Suspense>
                )
            }
            // I really need to throw out some of this trash.
            // why is this here? Why not in batches?
            //              
            //     if (asset.match(/\.(glb|gltf)$/)) {
            //     return (
            //         <Suspense fallback={<CubeWithEdges />}>

            //             const ourprops: ThingWithAuxProps = {

            //                             worldName: props.worldName,
            //                             // uniqueId: props.uniqueId,
            //                             onlyShowOutlineBoxes: props.onlyShowOutlineBoxes,
            //                             showOriginAxis: props.showOriginAxis,
            //                             // previousCameraPosition: props.state.previousCameraPosition,
            //                             // timeSinceLastCameraMovement: props.state.timeSinceLastCameraMovement,
            //                             // theGlobalTree: props.state.theGlobalTree,    

            //                             aux: auxRecord,
            //                             indexBase: keyIndex,
            //                             groupTxt: groupTextParameters
            //                         }

            //             <ThingWithAux {


            //                 } />
            //         </Suspense>
            //     )
            // } else 
            {
                console.log("Unknown asset type for leaf ", props.treeStatus.name, " asset is ", asset)
                return <CubeWithEdges />
            }

        } else {
            // no asset, no group, show me the chain fence with that says "this space 4 sale" or "under construction:
            // and a blue outline box. forceChainLink
            // return <CubeWithEdges />
            return <OutlineBoxComponent
                treeStatus={props.treeStatus}
                errorMsg={undefined}
                propsMessage={"Under Construction"}
                color={"blue"}
                forceChainLink={true}
            // key={99}
            //     indexBase={99}
            />
        }
    }

    // the default
    return (
        <>
            <MakeChoices />
        </>
    )
}

// This is a single cube.
export function ThingWithColor(props: LeafRenderingComponentProps) {

    // const [tries, setTries] = React.useState(0)

    let asset = props.groupInfo.asset
    // parse out color:cname or color:#rrggbb
    let color = "white"
    if (asset) {
        const colorMatch = asset.match(/color:(#[0-9a-fA-F]{6}|[a-zA-Z]+)/)
        if (colorMatch) {
            color = colorMatch[1]
        }
    }
    color = color.startsWith("color:") ? color.substring(6) : color

    // console.log("ThingWithColor color ", color)
    const cube = props.treeStatus.cube
    const center = oct.CubeToCenter(cube)

    const width = (2 ** cube.p)

    const size = width


    const adjustment = 0.1

    //   if ( groupInfo.type === "floor" || groupInfo.type === "ceiling"){
    const centerBottom: [number, number, number] = [center[0], center[1] - size / 2 + adjustment, center[2]]
    const centerTop: [number, number, number] = [center[0], center[1] + size / 2 - adjustment, center[2]]

    if (props.groupInfo.type === "floor") {
        return (
            <mesh
                key={props.treeStatus.name}
                position={centerBottom}
                rotation={[-Math.PI / 2, 0, 0]} // rotate the plane to be horizontal
            >
                <planeGeometry
                    args={[size, size]}
                />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} />

            </mesh>
        )
    }
    if (props.groupInfo.type === "ceiling") {
        return (
            <mesh
                key={props.treeStatus.name}
                position={centerTop}
                rotation={[Math.PI / 2, 0, 0]} // rotate the plane to be horizontal
            >
                <planeGeometry
                    args={[size, size]}
                />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} />

            </mesh>
        )
    }
    return ( // otherwise the whole cube. No problem. Except for the shrinkage.
        <>
            <mesh key={props.treeStatus.name}
                position={center}
            >
                <boxGeometry
                    args={[size * 0.98, size * 1.0 - adjustment, size * 0.98]}
                />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} />

            </mesh>

            <leaves.CubeWithEdges cube={props.treeStatus.cube} key={props.treeStatus.name} />
        </>
    );
}


// MakeBoxesForDemoSpaces will draw green boxes for the cubes in the demoSpaces prop, which is a comma delimited list of UrlCubes.
// does is re calc often or just once. This is REAL fast.
// I would like to skip the ones behind me but hen I would have to recalc every camera move.


// export type GroupInfo = BatchInfo

// {
//     masterName: string
//     type: string
//     asset: string
//     groupInfo: oct.GroupTextParameters // just repeat it here for convenience
//     leaves: oct.TreeStatus[]
// }

// export type BatchInfo = {
//     masterName: string // HAVE tld.
//     type: string
//     asset: string
//     groupInfo: oct.GroupTextParameters
//     leaves: oct.TreeStatus[]
//     auxRecord: oct.AuxLeafStatus | null // overrides the asset and the type.
// }


// these are really for other uses with batches of cubes 


export type MakeBoxesForDemoSpacesProps = {
    worldName: string
    aux: oct.AuxLeafStatus
}

// This one is for when the asset is a color are the type is floor or ceiling. 
// we prepare a batch of lines for all the cubes in the group and draw them all at once. This is much faster than drawing each cube separately.
export function MakeBoxesForColorGroup(props: MakeBoxesForDemoSpacesProps) {

    const treeStatusList = props.aux.leaves // // this will get the cubes from the DemoProperties string in localStorage and parse them. We could also pass the cubes directly as a prop if we wanted to, but this way we can keep the parsing logic in one place and also easily trigger a re-render when the DemoProperties string changes.

    let color = props.aux.oldeTxtJunk?.asset ?? "white"

    // one more time for the stoners in the back.
    color = color.startsWith("color:") ? color.substring(6) : color

    // change list of treeStatus to list of cubes
    const cubeList = oct.GetTheAuxCubes(props.aux) // treeStatusList.map(ts => ts.cube)

    // console.log("MakeBoxesForColorGroup with color: ", color, " and cubeList length: ", cubeList.length)

    if (!cubeList)
        return null
    if (cubeList.length === 0)
        return null
    // console.log("MakeBoxesForColorGroup recalculated: ", cubeList.length)

    // console.log("ThingWithColor color ", color)

    const positions = new Float32Array(cubeList.length * 4 * 3); // 4 points per quad, 3 coords per point
    const indices = new Uint32Array(cubeList.length * 2 * 3); // 6 per quad

    let posIndex = 0
    let idxIndex = 0
    // it only does this once, when the prop changes, so it's not too bad. We could also memoize it if we wanted to be sure.
    // we can take out time. 
    const isCeiling = props.aux.oldeTxtJunk?.type === "ceiling"

    // we don't realy know these are the same size.
    for (const cube of cubeList) {
        const size = 2 ** cube.p // are they not all the same size? 
        // a huge ceiling can stand to have a bit of lowering to keep not bleed into the stuff above it. 
        let offset = 0.1 * size// 10% of the size of the cube.
        // until it becoomes absurd
        if (offset > 0.1) { // but not more than 0.1m
            offset = 0.1
        }
        const yoffset = isCeiling ? size - offset : offset // if it's a ceiling, we want to draw it a little bit lower than the actual ceiling so we can see it. This is a hack, but it works for now. We can fix it later if we want to. 
        // the indices for the future 4 points coming up.

        let currentPos = posIndex / 3   // the current position index, 
        // which is the number of points we've added so far.
        indices[idxIndex++] = currentPos + 0 // triangle 1
        indices[idxIndex++] = currentPos + 1
        indices[idxIndex++] = currentPos + 2

        indices[idxIndex++] = currentPos + 0 // triangle 2
        indices[idxIndex++] = currentPos + 2
        indices[idxIndex++] = currentPos + 3

        positions[posIndex++] = cube.x
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z

        positions[posIndex++] = cube.x + size
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z

        positions[posIndex++] = cube.x + size
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z + size

        positions[posIndex++] = cube.x
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z + size
    }

    // console.log("MakeBoxesForColorGroup finished calculating positions.", " idxIndex: ", idxIndex, " positions size: ", positions.length)

    // console.log("positions length expected", cubeList.length * 4 * 3, " actual ", positions.length)
    // console.log("index length expected", cubeList.length * 2 * 3, " actual ", indices.length)

    const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // geometry.setAttribute('index', new THREE.BufferAttribute(indices, 1));

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    geometry.setIndex(new THREE.BufferAttribute(indices, 1)); // Accepts standard array or Uint16Array/Uint32Array

    const material = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide }); // fancy material.
    // const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide }); // no lighting.


    geometry.computeVertexNormals();

    if (!oct.VerifyCubeName(props.aux.wholeMaster)) {
        console.log("MakeBoxesForColorGroup: ", props.aux.wholeMaster, " this may work poorly")
        return null
    }

    // return (
    //     <>
    //         <mesh args={[geometry, material]} key={props.indexBase}>
    //         </mesh>
    //     </>
    // )

    return (
        <>
            <instancedMesh args={[geometry, material, cubeList.length]} key={props.aux.wholeMaster}>
            </instancedMesh>
        </>
    )
}


// // FIXME: group the things with the same texture (and id) and draw them all at once. This will be more efficient than drawing each one separately. We can do this by creating a map of texture to list of cubes, and then drawing each list of cubes with the same texture in one go.
// // for now, just draw the glb ones one at a time
// this is all in the ThingWithAux now. We don't need this anymore.
// export function ThingWithGlb({props, indexBase}: ThingWithGlbProps) {

//     const groupInfo = props.groupInfo
//     let baseUrl = "http://" + props.treeStatus.name
//     const treeStatus = props.treeStatus
//     if (treeStatus.wasXYZ) {
//         baseUrl += ".xyz"
//     } else {
//         baseUrl += ".vr"
//     }
//     const cube = props.treeStatus.cube
//     const center = oct.CubeToCenter(cube) // : [number, number, number] = [cube.x + (2 ** cube.p) / 2, cube.y + (2 ** cube.p) / 2, cube.z + (2 ** cube.p) / 2]
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
//         // we should have a version of this with a big "error" sign pos ted at eye level. TODO:
//         // I'm getting this with a glbUrl that works, and will eventually load.
//         // what do I do in the meantime? 
//         // set a timer? Doesn't work. If I go to orbital view then it starts working. wtf.
//         // setTimeout(() => {
//         //     setTries(tries + 1)
//         // }, 30000)

//         return <CubeWithEdges cube={cube} index={indexBase} key={indexBase} />
//     }
// }


// type ThingWithAuxGlbProps = {
//     props: LeafRenderingComponentProps,
//     aux: oct.AuxTreeStatus
//     indexBase: number
// }


// export function ThingWithAuxGlb( props: ThingWithAuxGlbProps) {

//     const groupInfo = props.props.groupInfo

//     const cube = props.props.treeStatus.cube
//     const center = oct.CubeToCenter(cube) // : [number, number, number] = [cube.x + (2 ** cube.p) / 2, cube.y + (2 ** cube.p) / 2, cube.z + (2 ** cube.p) / 2]
//     const width = (2 ** cube.p)
//     const size = width

//     const aux = props.aux

//     // console.log("ThingWithGlb glbUrl ", glbUrl, "remote URL will be ", glbUrl)

//     const adjustment = 0.1

//     const centerBottom: [number, number, number] = [center[0], center[1] - size / 2 + adjustment, center[2]]

//     // FIXME - use the actual asset url, and make sure it's a glb url.
//     let glb;
//     try {
//         const { scene } = useGLTF(aux.glbBlob);
//         return (
//             <>
//                 {/* <mesh
//                     position={centerBottom}
//                    // rotation={[-Math.PI / 2, 0, 0]} // rotate the plane to be horizontal
//                 > */}
//                 <primitive object={scene} position={centerBottom} key={props.indexBase} />
//                 {/* </mesh> */}
//             </>
//         );
//     } catch (e) {
//         // should we announce this? 
//         console.log("Failed to load GLB: from aux", aux, e)
//         // we should have a version of this with a big "error" sign pos ted at eye level. TODO:
//         // I'm getting this with a glbUrl that works, and will eventually load.
//         // what do I do in the meantime? 
//         // set a timer? Doesn't work. If I go to orbital view then it starts working. wtf.
//         // setTimeout(() => {
//         //     setTries(tries + 1)
//         // }, 30000)

//         return <CubeWithEdges cube={cube} index={props.indexBase} key={props.index Base} />
//     }
// }



// This one is for when the asset has a texture and the type is floor or ceiling.
// we prepare a batch of lines for all the cubes in the group and draw them all at once. This is much faster than drawing each cube separately.
// eg {"grp":"j9xK3mP8wL2z","dbg":"localhost:3010","type":"floor","asset":"cobblestonesgrok512.jpg:repeat:20"}	
export function MakeBoxesForTextureGroup(props: MakeBoxesForDemoSpacesProps) {

    // const treeStatusList = props.groupInfo.leaves // // this will get the cubes from the DemoProperties string in localStorage and parse them. We could also pass the cubes directly as a prop if we wanted to, but this way we can keep the parsing logic in one place and also easily trigger a re-render when the DemoProperties string changes.
    // const worldDisplayState = props.worldDisplayState
    // const groupInfo = props.groupInfo
    // const index Base = props.index Base
    // let asset = props.aux.oldeTxtJunk?.asset

    // if it ends with :repeat:N then parse that out and use it to repeat the texture.
    let repeat = props.aux.oldeTxtJunk?.repeat ?? 1
    let asset = props.aux.oldeTxtJunk?.textureUrl ?? ""
    let baseUrl = "http://" + props.aux.wholeMaster
    let textureUrl = baseUrl + "/" + asset

    const ts = oct.GetTreeStatusFromCache(props.aux.wholeMaster) 
    if (!ts) {
        console.log("MakeBoxesForTextureGroup: no treeStatus for ", props.aux.wholeMaster)
        return null
    }
    const treeStatus = ts
    const forceRemote = false
    // This ALWAYS fails and falls back and I'm never going to fix it.
    // the iFrames provide GLB's and not textures. So we don't have a texture to load.  
    textureUrl = RewriteUrl(textureUrl, props.aux.txtParams, treeStatus, forceRemote)

    // console.log("MakeBoxesForTextureGroup baseUrl ", baseUrl, " asset ", asset, " repeat ", repeat, "rewriteUrl returns ", textureUrl)

    // MakeBoxesForTextureGroup baseUrl  http://testmain-1n0u1w4p.vr  asset  street.jpg  repeat  1 rewriteUrl returns  http://localhost:3010/street.jpg
    // add the remote param. 
    // MakeBoxesForTextureGroup with texture:  http://testmain-1n0u1w4p_vr.knotfree.io/street.jpg  and cubeList length:  57
    // try:  http://testmain-1n0u1w4p_vr.knotfree.dog:8085/street.jpg   with local server.
    // and a version of local-hoster that is logging on to local server. 

    let textureLoadingPath = "/loading-images/cobblestonesgrok512.jpg"
    if (textureUrl.includes("street.jpg")) {
        textureLoadingPath = "/loading-images/street.jpg"
    }
    const textureBackup = useTexture(textureLoadingPath) // a local texture that is always available.

    let texture;
    try {
        texture = useTexture(textureUrl)
        // console.log("MakeBoxesForTextureGroup using normal texture for ", textureUrl)

    } catch (e) {
        // console.log("Failed to load texture:", textureUrl)
        // we should have a version of this with a big "error" sign pos ted at eye level. TODO:
        // I'm getting this with a textureUrl that works, and will eventually load.
        // what do I do in the meantime? 
        // set a timer? Doesn't work. If I go to orbital view then it starts working. wtf.
        // setTimeout(() => {
        //     setTries(tries + 1)
        // }, 30000)
        // const ourprops = {
        //     worldDisplayState: props.worldDisplayState,
        //     groupInfo: props.groupInfo,
        //     index Base: props.index Base + 1234
        // }
        // violet means texture failed to load. We should have a better fallback texture that is local and always works.
        // return <MakeBoxesForColorGroup {...ourprops} groupInfo={{ ...ourprops.groupInfo, asset: "color:violet" }} />

        texture = textureBackup
        // console.log("MakeBoxesForTextureGroup using backup texture for ", textureLoadingPath)
    }

    // TODO: get fallback texture that always works. Maybe a local one. 

    // change list of treeStatus to list of cubes
    const cubeList = oct.GetTheAuxCubes(props.aux)

    // console.log("MakeBoxesForTextureGroup with texture: ", textureUrl, " and cubeList length: ", cubeList.length)

    if (!cubeList)
        return null
    if (cubeList.length === 0)
        return null
    // console.log("MakeBoxesForTextureGroup recalculated: ", cubeList.length)

    // console.log("ThingWithTexture ", textureUrl)

    const positions = new Float32Array(cubeList.length * 4 * 3); // 4 points per quad, 3 coords per point
    const indices = new Uint32Array(cubeList.length * 2 * 3); // 6 per quad
    const uvs = new Float32Array(cubeList.length * 4 * 2); // 4 points per quad, 2 coords per point

    let posIndex = 0
    let idxIndex = 0
    let uvIndex = 0

    // it only does this once, when the prop changes, so it's not too bad. We could also memoize it if we wanted to be sure.
    // we can take out time. 
    const isCeiling = props.aux.oldeTxtJunk?.type  === "ceiling"

    //repeat = 2

    // there's mirror wrapping. how do cobblestones look with mirror wrapping?
    texture.wrapS = THREE.RepeatWrapping; // Horizontal wrapping 
    texture.wrapT = THREE.RepeatWrapping; // Vertical wrapping

    // 3. Define how many times the texture repeats (X, Y)
    texture.repeat.set(repeat, repeat);


    repeat = 1

    // we don't realy know these are the same size.
    for (const cube of cubeList) {
        const size = 2 ** cube.p // are they not all the same size? 
        // a huge ceiling can stand to have a bit of lowering to keep not bleed into the stuff above it. 
        let offset = 0.1 * size// 10% of the size of the cube.
        // until it becoomes absurd
        if (offset > 0.1) { // but not more than 0.1m
            offset = 0.1
        }
        const yoffset = isCeiling ? size - offset : offset // if it's a ceiling, we want to draw it a little bit lower than the actual ceiling so we can see it. This is a hack, but it works for now. We can fix it later if we want to. 
        // the indices for the future 4 points coming up.

        let currentPos = posIndex / 3   // the current position index, 
        // which is the number of points we've added so far.
        indices[idxIndex++] = currentPos + 0 // triangle 1
        indices[idxIndex++] = currentPos + 1
        indices[idxIndex++] = currentPos + 2

        indices[idxIndex++] = currentPos + 0 // triangle 2
        indices[idxIndex++] = currentPos + 2
        indices[idxIndex++] = currentPos + 3

        // these go with the coordinates. do we repeat here also?
        uvs[uvIndex++] = 0
        uvs[uvIndex++] = 0

        uvs[uvIndex++] = repeat
        uvs[uvIndex++] = 0

        uvs[uvIndex++] = repeat
        uvs[uvIndex++] = repeat

        uvs[uvIndex++] = 0
        uvs[uvIndex++] = repeat

        positions[posIndex++] = cube.x
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z

        positions[posIndex++] = cube.x + size
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z

        positions[posIndex++] = cube.x + size
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z + size

        positions[posIndex++] = cube.x
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z + size
    }

    // console.log("MakeBoxesForTextureGroup finished calculating positions.", " idxIndex: ", idxIndex, " positions size: ", positions.length)

    // console.log("positions length expected", cubeList.length * 4 * 3, " actual ", positions.length)
    // console.log("index length expected", cubeList.length * 2 * 3, " actual ", indices.length)

    const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // geometry.setAttribute('index', new THREE.BufferAttribute(indices, 1));

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    geometry.setIndex(new THREE.BufferAttribute(indices, 1)); // Accepts standard array or Uint16Array/Uint32Array

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));  // 2 values per vertex (u,v)

    const material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: texture });
    // const material = new THREE.MeshBasicMaterial({  side: THREE.DoubleSide , map: texture}); // no lighting.

    geometry.computeVertexNormals();

    return (
        <>
            <instancedMesh args={[geometry, material, cubeList.length]} key={props.aux.wholeMaster}>
            </instancedMesh>
        </>
    )
}


// Same as above except takes an AuxTreeStatus instead of a group . This is for when we have a glb or texture that is not in the main tree but is in an aux tree.	
export function MakeBoxesForTextureGroup2(props: MakeBoxesForDemoSpacesPropsAux) {

    const [masterCube, err] = oct.StringToCube(props.aux.wholeMaster)
    if (err) {
        console.log("MakeBoxesForTextureGroup2: oops ", props.aux.wholeMaster, " error: ", err)
        return null
    }
    if (!oct.VerifyCubeName(props.aux.wholeMaster)) {
        console.log("MakeBoxesForTextureGroup2: oops ", props.aux.wholeMaster, " is not a valid cube name")
        return null
    }

    const treeStatusList = []//props.groupInfo.leaves // // this will get the cubes from the DemoProperties string in localStorage and parse them. We could also pass the cubes directly as a prop if we wanted to, but this way we can keep the parsing logic in one place and also easily trigger a re-render when the DemoProperties string changes.
    for (const auxaddress of props.aux.leaves) {
        treeStatusList.push(masterCube.world + "-" + auxaddress)
    }
    // const worldDisplayState = props.worldDisplayState
    //const groupInfo = props.groupInfo
    //let asset = props.aux.backupTextureUrl

    // if it ends with :repeat:N then parse that out and use it to repeat the texture.
    let repeat = props.aux.oldeTxtJunk?.repeat || 1

    let baseUrl = "http://" + props.aux.wholeMaster
    let textureUrl = baseUrl + "/" + (props.aux.oldeTxtJunk?.textureUrl || "street.jpg")

    const forceRemote = false
    const ts = oct.GetTreeStatusFromCache(masterCube.world + "-" + props.aux.leaves[0])
    if (!ts) {
        console.log("MakeBoxesForTextureGroup2: failed to find treeStatus for aux leaf ", props.aux.leaves[0], " in world ", masterCube.world)
        return null
    }
    const groupInfo = ts.groupId
    if (!groupInfo) {
        console.log("MakeBoxesForTextureGroup2: failed to find groupInfo for aux leaf ", props.aux.leaves[0], " in world ", masterCube.world)
        return null
    }
    textureUrl = RewriteUrl(textureUrl, groupInfo, ts, forceRemote)

    // console.log("MakeBoxesForTextureGroup baseUrl ", baseUrl, " asset ", asset, " repeat ", repeat, "rewriteUrl returns ", textureUrl)

    // MakeBoxesForTextureGroup baseUrl  http://testmain-1n0u1w4p.vr  asset  street.jpg  repeat  1 rewriteUrl returns  http://localhost:3010/street.jpg
    // add the remote param. 
    // MakeBoxesForTextureGroup with texture:  http://testmain-1n0u1w4p_vr.knotfree.io/street.jpg  and cubeList length:  57
    // try:  http://testmain-1n0u1w4p_vr.knotfree.dog:8085/street.jpg   with local server.
    // and a version of local-hoster that is logging on to local server. 

    let textureLoadingPath = "/loading-images/cobblestonesgrok512.jpg"
    if (textureUrl.includes("street.jpg")) {
        textureLoadingPath = "/loading-images/street.jpg"
    }
    const textureBackup = useTexture(textureLoadingPath) // a local texture that is always available.

    let texture;
    try {
        texture = useTexture(textureUrl)
        // console.log("MakeBoxesForTextureGroup using normal texture for ", textureUrl)

    } catch (e) {
        // console.log("Failed to load texture:", textureUrl)
        // we should have a version of this with a big "error" sign posted at eye level. TODO:
        // I'm getting this with a textureUrl that works, and will eventually load.
        // what do I do in the meantime? 
        // set a timer? Doesn't work. If I go to orbital view then it starts working. wtf.
        // setTimeout(() => {
        //     setTries(tries + 1)
        // }, 30000)
        // const ourprops = {
        //     worldDisplayState: props.worldDisplayState,
        //     groupInfo: props.groupInfo,
        //     indexBase: props.indexBase + 1234
        // }
        // violet means texture failed to load. We should have a better fallback texture that is local and always works.
        // return <MakeBoxesForColorGroup {...ourprops} groupInfo={{ ...ourprops.groupInfo, asset: "color:violet" }} />

        texture = textureBackup
        // console.log("MakeBoxesForTextureGroup using backup texture for ", textureLoadingPath)
    }

    // TODO: get fallback texture that always works. Maybe a local one. 

    // change list of treeStatus to list of cubes
    const cubeList = treeStatusList.map(ts => oct.StringToCube(ts)[0])

    // console.log("MakeBoxesForTextureGroup with texture: ", textureUrl, " and cubeList length: ", cubeList.length)

    if (!cubeList)
        return null
    if (cubeList.length === 0)
        return null
    // console.log("MakeBoxesForTextureGroup recalculated: ", cubeList.length)

    // console.log("ThingWithTexture ", textureUrl)

    const positions = new Float32Array(cubeList.length * 4 * 3); // 4 points per quad, 3 coords per point
    const indices = new Uint32Array(cubeList.length * 2 * 3); // 6 per quad
    const uvs = new Float32Array(cubeList.length * 4 * 2); // 4 points per quad, 2 coords per point

    let posIndex = 0
    let idxIndex = 0
    let uvIndex = 0

    // it only does this once, when the prop changes, so it's not too bad. We could also memoize it if we wanted to be sure.
    // we can take out time. 
    const isCeiling = groupInfo.type === "ceiling"

    //repeat = 2

    // there's mirror wrapping. how do cobblestones look with mirror wrapping?
    texture.wrapS = THREE.RepeatWrapping; // Horizontal wrapping 
    texture.wrapT = THREE.RepeatWrapping; // Vertical wrapping

    // 3. Define how many times the texture repeats (X, Y)
    texture.repeat.set(repeat, repeat);


    repeat = 1

    // we don't realy know these are the same size.
    for (const cube of cubeList) {
        const size = 2 ** cube.p // are they not all the same size? 
        // a huge ceiling can stand to have a bit of lowering to keep not bleed into the stuff above it. 
        let offset = 0.1 * size// 10% of the size of the cube.
        // until it becoomes absurd
        if (offset > 0.1) { // but not more than 0.1m
            offset = 0.1
        }
        const yoffset = isCeiling ? size - offset : offset // if it's a ceiling, we want to draw it a little bit lower than the actual ceiling so we can see it. This is a hack, but it works for now. We can fix it later if we want to. 
        // the indices for the future 4 points coming up.

        let currentPos = posIndex / 3   // the current position index, 
        // which is the number of points we've added so far.
        indices[idxIndex++] = currentPos + 0 // triangle 1
        indices[idxIndex++] = currentPos + 1
        indices[idxIndex++] = currentPos + 2

        indices[idxIndex++] = currentPos + 0 // triangle 2
        indices[idxIndex++] = currentPos + 2
        indices[idxIndex++] = currentPos + 3

        // these go with the coordinates. do we repeat here also?
        uvs[uvIndex++] = 0
        uvs[uvIndex++] = 0

        uvs[uvIndex++] = repeat
        uvs[uvIndex++] = 0

        uvs[uvIndex++] = repeat
        uvs[uvIndex++] = repeat

        uvs[uvIndex++] = 0
        uvs[uvIndex++] = repeat

        positions[posIndex++] = cube.x
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z

        positions[posIndex++] = cube.x + size
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z

        positions[posIndex++] = cube.x + size
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z + size

        positions[posIndex++] = cube.x
        positions[posIndex++] = cube.y + yoffset
        positions[posIndex++] = cube.z + size
    }

    // console.log("MakeBoxesForTextureGroup finished calculating positions.", " idxIndex: ", idxIndex, " positions size: ", positions.length)

    // console.log("positions length expected", cubeList.length * 4 * 3, " actual ", positions.length)
    // console.log("index length expected", cubeList.length * 2 * 3, " actual ", indices.length)

    const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // geometry.setAttribute('index', new THREE.BufferAttribute(indices, 1));

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    geometry.setIndex(new THREE.BufferAttribute(indices, 1)); // Accepts standard array or Uint16Array/Uint32Array

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));  // 2 values per vertex (u,v)

    const material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: texture });
    // const material = new THREE.MeshBasicMaterial({  side: THREE.DoubleSide , map: texture}); // no lighting.

    geometry.computeVertexNormals();

    return (
        <>
            <instancedMesh args={[geometry, material, cubeList.length]} key={props.aux.wholeMaster}>
            </instancedMesh>
        </>
    )
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
