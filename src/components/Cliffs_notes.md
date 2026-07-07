
## Cliffs notes:

App 

    showingLeaves, setShowingLeaves
    pubsub.subscribe("ShowingLeavesChanges", "App"+appDisplayState.uniqueId, 

    export type WorldDisplayState = {
        worldName: string
        previousCameraPosition: 
        timeSinceLastCameraMovement: 
        theGlobalTree:  
        uniqueId: string 
        onlyShowOutlineBoxes: boolean
        showOriginAxis: boolean 


    AppCanvas (leaves)

        export type AppCanvasProps = {
            state: WorldDisplayState
            shouldShowMainWorldDisplay: boolean
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
    does a ReCalcTheDemoProperties()
        trims demo spaces against known properties

MakeBoxesForDemoSpaces has:

    type MakeBoxesForDemoSpacesProps = {
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


big floor thing?  DONE it's a 4 by 4 of .5 km cubes.
it would have to be a under cubes
from testmain-2s1d2w9p to testmain-1n1d1e9p

dirt: #88674E

let's put the image on the road. DONE!

Did the duck. lol.



basic checks.

curl "https://knotfree.net/api1/getPublicKey"

curl "https://knotfree.net/api1/nameService?name=dummmyName&cmd=help"


