import * as oct from '../../knotfree-ts-lib/3d/Dns8Tree'

import { ReserveVrFunctions } from '../../../broken-things/ReserveVrFunction'

// before you start this script, in a command line terminal, you must set the PRIVATE_KNOTFREE_PASSPHRASE and BIG_KNOTFREE_TOKEN environment variables.
// usually like this:
// export PRIVATE_KNOTFREE_PASSPHRASE="your passphrase here"
// export BIG_KNOTFREE_TOKEN="your token here"



// then execute this script with: npx ts-node src/scripts/buildingTestMain/MakeBigSky.ts

// I backed this out because the sky was lit from above and looked like and angry
// brown cube. It's takes more thatn just flat geometry to make a sky. It needs a texture and a shader. So, I will leave this here for now, but not use it.
// Don't DO IT! 

// from testmain-2s1u2w10p to testmain-2n1u2e10p

// a 10p cube is about a kilometer in size. So, this is a 5 by 5 grid of cubes, each about a kilometer in size. This is a big sky. It will be a big cube, 
const property1 = "testmain-2s1u2w10p" // These are 10p or a km, in a 5 by 5 grid.
const property2 = "testmain-2n1u2e10p" // 1km in the air.

const [fromtostring, err] = oct.FromXToYString(property1, property2)
if (err) {
    console.error("Error calculating fromto string:", err)
    process.exit(1)
}
console.log("reserving these parcels: ", fromtostring)

// it wants a list of names, not a string. So we split it.
const fromtostringList = fromtostring.split(",")
console.log("reserving these parcels: ", fromtostringList)  


// are these in a group? no, not this time and this test.
const groupTextParameters: oct.GroupTextParameters = {
    id: "x9J4w2V8mP1qL7tB5yR6k3Zc", // they can all draw, and act, together.
    master: "must-be-valid-cube-string", // this is the master node of the group. It must be a valid cube string. Set later.
    dbg: "localhost:3010",
    type: "floor",
    asset: "color:#FeFFFE"  
}
// I would like to make that a texture later.  ?

async function doTheWork() {

    const reserveVrFunctions = new ReserveVrFunctions()
    // const errReserveVr = await reserveVrFunctions.ReserveVr(fromtostringList, groupTextParameters)
    const errReserveVr = await reserveVrFunctions.DeleteVr(fromtostringList, groupTextParameters)
    if (errReserveVr) {
        console.error("Error reserving VR properties:", errReserveVr)
    }
    else {
        console.log("Successfully reserved VR properties.")
    }
}
doTheWork()


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
