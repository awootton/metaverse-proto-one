
import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus';
import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf'; // just a map. 

// this is the state that we want to share between the MainWorldDisplay and the OrbitPropertyDialog and other components. 
// it has to live in the parent component?, which is the App component.

// we should share the same cache that the BuildVisibleTreeStatus's uses, so we can share the same tree?.
// That's not clear yet. In the end it's just a list of leaves, and then a list of groups.

export type WorldDisplayState = {

    worldName: string

    previousCameraPosition: THREE.Vector3 // = new THREE.Vector3(1e999, 0, 0)
    timeSinceLastCameraMovement: number // = 0
    currentCameraPosition: THREE.Vector3 // = new THREE.Vector3(1e999, 0, 0)

    // what does it mean to have two copies of THIS gadget? 
    // every instance of MainWorldDisplay should have it's own copy of the BuildVisibleTreeStatus, but they should share the same cache.
    theGlobalTree: bvts.BuildVisibleTreeStatus // = new bvts.BuildVisibleTreeStatus(myMapCacheIntf)

    uniqueId: string // this is a unique identifier for the component instance, so we can use it to subscribe to pubsub messages and avoid conflicts between multiple instances.
    showOriginAxis: boolean // = true should we pass these around as props or just have them in local storage? 
    // CP: I think we should have them in local storage, so they can be shared between different instances of the component.
    // Well, copilot has no class so we're keepkng them here. 

    onlyShowOutlineBoxes: boolean // = false, don't save this in storage.
    toggleOnlyShowOutlineBoxes: () => void
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
