
## Cliffs notes:

A really bad outline, always running behind. Just like my brain!!

Also see src/knotfree-ts-lib/avatars/README.md

App 

    showingLeaves, setShowingLeaves
    pubsub.subscribe("ShowingLeavesChanges", "App", 
            I think that's it now. Nobody else subscribes to ShowingLeavesChanges

        ToggleOnlyShowOutlineBoxes publushes zero to force a redraw for xray mode.
        It needs to also force a localTraverseTheTree to bring them back instead of waiting 1/4 sec.
        

    export type WorldDisplayState = { 
        worldName: string

        previousCameraPosition: 
        timeSinceLastCameraMovement: 
        theGlobalTree:  

        uniqueId: string 
        
        onlyShowOutlineBoxes: boolean
        showOriginAxis: boolean 
    }

    // how do we turn on and off the demoProperties display?
          pubsub.publish("DemoPropertiesChanges", utils.randomString(24)) }
                in OrbitPropertyDialog2
           pubsub.publish("DemoPropertiesChanges", utils.randomString(24)) }
                in the dialog confirm in App.tsx
           and the two antiques in  OrbitPropertyDialog     

    AppCanvas (leaves)

        export type AppCanvasProps = {
            state: WorldDisplayState
          // gone  shouldShowMainWorldDisplay: boolean change to UseOrbitalControls
            showingLeaves: oct.TreeStatus[]
        }

        has the navigator

        has a canvas 

        use frame on camera
            has to be in canvas
                calls TraverseTheTree

        MainWorldDisplay(leaves) 

            export type MainWorldDisplayProps = {
            state: WorldDisplayState
            showingLeaves: oct.TreeStatus[]
            // add demo spaces here too.
            }

            sub to demo props

            MakeBoxesForShowingLeaves(leaves)

-------


MainWorldDisplay:
    does a ReCalcTheDemoProperties() after DemoProperties 
        trims demo spaces against known properties

MakeBoxesForDemoSpaces has:

    MakeBoxesForDemoSpacesProps

    MakeAuxGroupsFromShowingLeaves renderers

    ReCalcTheDemoProperties in main world  ReCalcTheDemoProperties  filters out the owned properties.

    type 
    
            MakeBoxesForDemoSpacesProps


    worldDisplayState: WorldDisplayState
    demoCubeList: oct.Cube[]  .

    OrbitalPropertyDialog

        subscribe to leaves.
        has showingLeaves, setShowingLeaves


        OrbitCanvas

            export type Props = {
                worldDisplayState: WorldDisplayState
                showingLeaves: oct.TreeStatus[] 
                }


orbitCanvas 
export type Props = {
 
  color?: string // optional color for the boxes, default to green. get rid of this.
  worldDisplayState: WorldDisplayState
}

LeafRenderingComponent( cubeName )
    // so we use the cache?

export type MainWorldDisplayProps = {
   state: WorldDisplayState
    showingLeaves: oct.TreeStatus[]
}



from MainWorldDisplay:
    props are WorldDesplayState 
        and shopingLeaves

    ReCalcTheDemoProperties returns 
        list of cubes or []   

    MakeBoxesForDemoSpaces
        props are WorldDesplayState
        and demoCubeList

        MakeOutlineBoxesForDemoSpaces
            props are worldDisplayState
            and demoCubeList

        MakeBoxesForDemoSpacesLines  
            props are worldDisplayState
            and demoCubeList

    MakeBoxesForShowingLeaves
        same params as MainWorldDisplay
        
        // I moved this to it's own function. 
        might show all as demo boxes
        then normally calls 
            LeafRenderingComponent



## Reserve space flow: 

it's all in ReserveVrFunctions now.

first PrepareToReservePropertyBatch

then VerifyReservePropertyBatch

then PrepareTheLists


await askQuestion

then: 

for each reserveResult.thingsToActuallyReserve

   sendNameserviceCommandHarder exists
   sendNameserviceCommandHarder reserve // even if we already own it.
   sendNameserviceCommandHarder set option txt meta_group_id

# spaces added notes

see src/scripts/buildingTestMain.

big sky thing

testmain-1s1u1w1w9p

I changed far to 5km

4 big sky
testmain-1s1u1w9p to testmain-0n1u0e9p

16 big sky, what color? 
// can't really see them all! 
// it's 2 by 2:
from testmain-2s1u2w9p to testmain-1n1u1e9p

I saw this working: it's 5 by 5  
from testmain-2s1u2w9p to testmain-2n1u2e9p
what color?  F0FFFE  ??

from testmain-2s1u2w10p to testmain-2n1u2e10p




big floor thing?  DONE it's a 4 by 4 of .5 km cubes.
it would have to be a under cubes
from testmain-2s1d2w9p to testmain-1n1d1e9p

dirt: #88674E

let's put the image on the road. DONE!

Did the duck. lol.



basic checks.

curl "https://knotfree.net/api1/getPublicKey"

curl "https://knotfree.net/api1/nameService?name=dummmyName&cmd=help"





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

