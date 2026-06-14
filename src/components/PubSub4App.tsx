
// This is a simple pub/sub system for components to subscribe to changes, messages and replies
// for instance the app, in it's useEffect will subscrube with a key and it's name and then when a change happens it 
// can get called to do a set state.

type localMapItem = {
    // they have to be named sp we can remove them when the component unmounts. 
    // So the key would be the name of the component, or some unique identifier for the component instance.
    // are we using the error?
    callbackList: Map<string, (status: Object, err: Error) => any>
}

// from name to localMapItem
// every key, like 'DemoPropertiesChanges' will have a list of callbacks.
// so "App" might habe a callback for "DemoPropertiesChanges", and "OrbitPropertyDialog" might also have a callback for "DemoPropertiesChanges". 
// When we publish "DemoPropertiesChanges", we want to call all the callbacks that are subscribed to that name.

let namesMap = new Map<string, localMapItem>()

function getMapItem(name: string): localMapItem | undefined {
    if (name.length > 0) {
        return namesMap.get(name)
    } else {
        return undefined
    }
}

export function subscribe(key: string, who: string, cb: (status: Object, err: Error) => any): localMapItem | undefined {
    console.log('PubSub4App subscribe', key)
    let found: localMapItem | undefined = getMapItem(key)
    if (found === undefined) {
        let found: localMapItem = {
            callbackList: new Map<string, (status: Object, err: Error) => any>(),
        }
        found.callbackList.set(who, cb)
        namesMap.set(key, found)

    } else {
        // replace or add the callback
        found.callbackList.set(who, cb)
    }
    return found
}

// all the who's get a callback.
export function publish(key: string, status: Object, err: Error = new Error("")) {

    const found = getMapItem(key)
    if (found !== undefined) {
        // iterate the callback list and call each one.
        for (const [callbackKey, cb] of found.callbackList) {
            if (cb !== undefined) {
                console.log('pubsub publish', callbackKey, status)
                cb(status, err)
            } else {
                console.log('pubsub publish callback is undefined', callbackKey)
            }
        }
    } else {
        // not really a problem if there are no subscribers, but maybe we want to know about it for debugging.
        console.log('PubSub didnt find key', key)
    }
}

// remove is called when a component is unmounted.
export function unsubscribe(key: string, myAppName: string) {
    const found = getMapItem(key)
    if (found !== undefined) {
        console.log('pubsub unsubscribe', key, myAppName)
        found.callbackList.delete(myAppName)
        if (found.callbackList.size === 0) {
            namesMap.delete(key)
        }
    }
}
