import * as oct from '../../knotfree-ts-lib/3d/Dns8Tree'

import { ReserveVrFunctions } from '../../../broken-things/ReserveVrFunction'

// before you start this script, in a command line terminal, you must set the PRIVATE_KNOTFREE_PASSPHRASE and BIG_KNOTFREE_TOKEN environment variables.
// usually like this:
// export PRIVATE_KNOTFREE_PASSPHRASE="your passphrase here"
// export BIG_KNOTFREE_TOKEN="your token here"

// then execute this script with: 
// npx ts-node src/scripts/buildingTestMain/reserveSmallEmpty4meterSpace.ts

const property1 = "testmain-2n0u7w2p" // It's a small 4 by 4


// I'm going to reserve these normally and then also buy the same thing in cloudflare manually and point it at the same place.(soon)
// Then we'll have two different DNS providers both pointing to the same property. This is just to test that we can do it and that it works.
// and to waste $12
// it will have to fill in the whole northwest quad of the trees.

// are these in a group? no, not this time and this test.
const groupTextParameters: oct.GroupTextParameters = {
    id: "j9K2vW8mP3xY5zQ1bN6rL4tC", //  a group of one.
    master: property1, // Who else?
    dbg: "localhost:3010",
    // type: "floor",
    // asset: "color:orange" // navy blue "color:green" blank 
}

// We should be able to run this AGAIN and it will change the color or add a texture, etc.

async function doTheWork() {

    const reserveVrFunctions = new ReserveVrFunctions()
    const errReserveVr = await reserveVrFunctions.ReserveVr([property1], groupTextParameters)
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
