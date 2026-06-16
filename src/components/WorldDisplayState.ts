
import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus';
import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf'; // just a map. 

// this is the state that we want to share between the MainWorldDisplay and the OrbitPropertyDialog and other components. 
// it has to live in the parent component, which is the App component.

// we should share the same cache that the BuildVisibleTreeStatus's uses, so we can share the same tree.

export type WorldDisplayState = {

    worldName: string

    previousCameraPosition: THREE.Vector3 // = new THREE.Vector3(1e999, 0, 0)
    timeSinceLastCameraMovement: number // = 0
    // what does it mean to have two copies of THIS gadget? 
    theGlobalTree: bvts.BuildVisibleTreeStatus // = new bvts.BuildVisibleTreeStatus(myMapCacheIntf)
}