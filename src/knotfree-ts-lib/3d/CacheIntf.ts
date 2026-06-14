
import * as oct from './UrlOctTree'

// TODO: build a map backed up by local storage, and use that for the cache in the tree traversal.
// The problem with that is that every time we come back the whole stupid cache will have 
// timed out so what's the point? 
// TODO: better. Just build one of these with a TTL of 5 min.

export interface CacheIntf {
    get(key: string): oct.TreeStatus | undefined;
    set(key: string, value: oct.TreeStatus, options?: { ttl?: number, start?: number }): void;
    delete(key: string): void;
    clear(): void;
    keys(): IterableIterator<string>;
}

// this one grows without bounds. Sounds like a goal. Grow. Be popular. Have early stage Twitter problems.
// TTL is infinite.
export const myMapCacheIntf: CacheIntf = {
    get(key: string): oct.TreeStatus | undefined {
        return oct.gCubeCache.get(key)
    },
    set(key: string, value: oct.TreeStatus, options?: { ttl?: number, start?: number }): void {
        // console.log("myMapCacheIntf caching ", key, )
        oct.gCubeCache.set(key, value)
    },
    delete(key: string): void {
        oct.gCubeCache.delete(key)
    },
    clear(): void {
        oct.gCubeCache.clear()
    },
    keys(): IterableIterator<string> {
        return oct.gCubeCache.keys()
    }
}

