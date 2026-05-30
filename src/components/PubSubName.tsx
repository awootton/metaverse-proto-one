
// This is a simple pub/sub system for components to subscribe to changes, messages and replies
// use a name to subscribe

type localMapItem = {

    // status: Object;
    // from sessionID to callback
    callbackList: Map<string, (stati: Object, err: string) => any>
}

// from name to localMapItem
let namesMap = new Map<string, localMapItem>()

function getMapItem(name: string): localMapItem | undefined {
    if (name.length > 0) {
        return namesMap.get(name)
    } else {
        return undefined
    }
}

export function subscribe(name: string, cb: (status: Object, err: string) => any): localMapItem | undefined {

    console.log('PubSubName subscribe', name)

    let found: localMapItem | undefined = getMapItem(name)
    if (found === undefined) {

        let found: localMapItem = {
            // status: {} as Object,
            callbackList: new Map<string, () => any>(),
        }
        found.callbackList.set(name, cb)

        namesMap.set(name, found)


    } else {
        // replace or add the callback
        found.callbackList.set(name, cb)
    }
    return found
}

export function publish(name: string, status: Object) {

    const found = getMapItem(name)
    if (found !== undefined) {
        let keys = found.callbackList.keys()
        let keyArray = Array.from(keys)
        for (let key of keyArray) {
            let cb = found.callbackList.get(key)
            if (cb !== undefined) {
                console.log('pubsub publish', name, key, status)
                cb(status, "")
            } else {
                console.log('pubsub publish callback is undefined', name, key)
            }
        }
    } else {
        // console.log('PubSub didnt find name', name)
    }

}

// remove is called when a component is unmounted.
export function unsubscribe(name: string, sessionID: string) {
    const key = name
    const found = getMapItem(name)
    if (found !== undefined) {
        console.log('pubsub unsubscribe', name, sessionID)
        found.callbackList.delete(sessionID)
        if (found.callbackList.size === 0) {
            namesMap.delete(key)
        }
    }
}
