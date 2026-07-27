import * as oct from '../../knotfree-ts-lib/3d/DomainNameOctTree'

import { ReserveVrFunctions } from '../../knotfree-ts-lib/3d/ReserveVrFunction'

// before you start this script, in a command line terminal, you must set the PRIVATE_KNOTFREE_PASSPHRASE and BIG_KNOTFREE_TOKEN environment variables.
// usually like this:
// export PRIVATE_KNOTFREE_PASSPHRASE="your passphrase here"
// export BIG_KNOTFREE_TOKEN="your token here"

// then execute this script with: npx ts-node src/scripts/buildingTestMain/roadToTheWest.ts

const property1 = "testmain-1n0u1w4p" // It's a 16 meter square, like a 4 lane road
// extending out to the west from the courtyard.
const property2 = "testmain-1n0u64w4p" 

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
    id: "TmiiPiEvT1HsyuFz6WyJB7pK", // they can all draw, and act, together.
    dbg: "localhost:3010",
    master: "this will get automatically get filled if not set", // it must be a valid cube string. It's testmain-1n0u1w4p 
    // mstr: false, // the first one is the master. The others are not. The iFrame will connect to the master for assets.
    type: "floor",
    asset: "street.jpg" // a road color from the web. http://localhost:3010/street.jpg
}
// I would like to make that a texture later.  ? testmain-1n0u1w4p is master

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
