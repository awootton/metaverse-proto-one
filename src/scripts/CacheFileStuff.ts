

import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'
import * as fs from 'fs'


const fileName = "./my-cache/cubeCache.json"

export function WriteAllTheCubeCacheOut() {
    console.log("gCubeCache contents: ")

    const arr = Array.from(oct.gCubeCache.entries())
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
            oct.gCubeCache.set(key, value)
        })
        console.log("Loaded cache entries: ", arr.length)
    } catch (error) {
        // console.log("Error reading cache file: ", error)
    }
}
