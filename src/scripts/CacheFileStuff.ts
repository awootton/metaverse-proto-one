

import * as oct from '../knotfree-ts-lib/3d/Dns8Tree'
import * as fs from 'fs'


const fileName = "./my-cache/cubeCache.json"

// this is all local to the fs
// which is why it's completely unusable. 

export function WriteAllTheCubeCacheOut() {
    console.log("gTreeStatusCache contents: ")
    const kvs = oct.TreeStatusCacheEntries()

    const entries: [string, oct.TreeStatus][] = oct.TreeStatusCacheEntries()
    console.log("gTreeStatusCache size: ", oct.TreeStatusCacheSize())
    const arr = Array.from(entries)
    console.log("arr: ", arr.length)
    const bigStr = JSON.stringify(arr, null, 2) // pretty ! 
    // console.log("bigStr: ", bigStr)
    fs.writeFileSync(fileName, bigStr,{ flag: 'w' })
}

export function ReadAllTheCubeCacheIn() {
    try {
        const data = fs.readFileSync(fileName, 'utf-8',)
        if (!data) {
            console.log("No cache file found, starting with empty cache.")
            return
        }
        const arr = JSON.parse(data) as Array<[string, oct.TreeStatus]>
        arr.forEach(([key, value]) => {
            oct.SetTreeStatusInCache(key, value)
        })
        console.log("Loaded cache entries: ", arr.length)
    } catch (error) {
        // console.log("Error reading cache file: ", error)
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
