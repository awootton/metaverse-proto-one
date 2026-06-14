
// This is a simple pub/sub system for components to subscribe to changes, messages and replies.
// use sessionID to subscribe.
// unused and might not be fit for purpose.

type localMapItem = {
    callback: (status: Object, err: string) => any
}

// from sessionID to localMapItem
let sessionMap = new Map<string, localMapItem>()

export function subscribe(sessionID: string, cb: (status: Object, err: string) => any): localMapItem | undefined {

    console.log('PubSubSessions subscribe', sessionID)

    let found: localMapItem | undefined = sessionMap.get(sessionID)
    if (found === undefined) {

        let found: localMapItem = {
            callback: cb
        }
        sessionMap.set(sessionID, found)

    } else {
        // replace the callback
        found.callback = cb
    }
    return found
}

export function publish(sessionID: string, status: Object) {

    const found = sessionMap.get(sessionID)
    if (found !== undefined) {
        let cb = found.callback
        // in a different thread?
        setTimeout(() => {
            console.log('pubsub sessions publish', sessionID, status)
            cb(status, "")
        }, 1)
    }
}

// remove is called when a component is unmounted.
export function unsubscribe(sessionID: string) {

    const found = sessionMap.get(sessionID)
    if (found !== undefined) {
        console.log('pubsub sessions unsubscribe', sessionID)
        sessionMap.delete(sessionID)
    }
}
