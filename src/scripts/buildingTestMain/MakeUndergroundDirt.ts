import * as oct from '../../knotfree-ts-lib/3d/Dns8Tree'

import { ReserveVrFunctions } from '../../../broken-things/ReserveVrFunction'

// before you start this script, in a command line terminal, you must set the PRIVATE_KNOTFREE_PASSPHRASE and BIG_KNOTFREE_TOKEN environment variables.
// usually like this:
// export PRIVATE_KNOTFREE_PASSPHRASE="your passphrase here"
// export BIG_KNOTFREE_TOKEN="your token here"

// then execute this script with: npx ts-node src/scripts/buildingTestMain/MakeUndergroundDirt.ts

const property1 = "testmain-2s1d2w9p" // These are 9p or half a km, in a 4 by 4 grid.
const property2 = "testmain-1n1d1e9p" // 512 meters underground.

const [fromtostring, err] = oct.FromXToYString(property1, property2)
if (err) {
    console.error("Error calculating fromto string:", err)
    process.exit(1)
}
console.log("reserving these parcels: ", fromtostring)

// it wants a list of names, not a string. So we split it.
const fromtostringList = fromtostring.split(",")
console.log("reserving these parcels: ", fromtostringList)  


// I'm going to reserve these normally and then also buy the same thing in cloudflare manually and point it at the same place. 
// Then we'll have two different DNS providers both pointing to the same property. This is just to test that we can do it and that it works.
// and to waste $12
// it will have to fill in the whole northwest quad of the trees.

// are these in a group? no, not this time and this test.
const groupTextParameters: oct.GroupTextParameters = {
    id: "TmiPiEvT1Hz6WyJB7pKisyuF", // they can all draw, and act, together.
    master: property1, // this is the master node of the group. It must be a valid cube string. Someone has to do it.
    dbg: "localhost:3010",
    type: "ceiling",
    asset: "color:#88674E"  
}
// I would like to make that a texture later.  ?

async function doTheWork() {

    const reserveVrFunctions = new ReserveVrFunctions()
    const errReserveVr = await reserveVrFunctions.ReserveVr(fromtostringList, groupTextParameters)
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
