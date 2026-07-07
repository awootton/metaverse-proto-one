
// This is a simple pub/sub system for components to subscribe to changes, messages and replies
// for instance the app, in it's useEffect will subscribe with a key and it's name and then when a change happens it 
// can get called to do a set state.

// eg T is oct.TreeStatus[]

type localMapItem<T> = {
    // they have to be named so we can remove them when the component unmounts. 
    // So the key would be the name of the component, or some unique identifier for the component instance.
    // are we using the error?
    callbackList: Map<string, (status: T, err: Error) => any>
}

// from name to localMapItem
// every key, like 'DemoPropertiesChanges' will have a list of callbacks.
// so "App" might have a callback for "DemoPropertiesChanges", and "OrbitPropertyDialog" might also have a callback for "DemoPropertiesChanges". 
// When we publish "DemoPropertiesChanges", we want to call all the callbacks that are subscribed to that name.
// We will take care to use separate keys for each instance. 

let namesMap = new Map<string, localMapItem<any>>()

function getMapItem<T>(name: string): localMapItem<T> | undefined {
    if (name.length > 0) {
        return namesMap.get(name)
    } else {
        return undefined
    }
}
// Note that we don't remember old values or supply them to new subscribers. 
// We just call the callbacks when we publish.
// What is the return for?
export function subscribe<T>(key: string, who: string, cb: (status: T, err: Error) => any): localMapItem<T> | undefined {
    // console.log('PubSub4App subscribe', key, "who: ", who)
    let found: localMapItem<T> | undefined = getMapItem(key)
    if (found === undefined) {
        let found: localMapItem<T> = {
            callbackList: new Map<string, (status: T, err: Error) => any>(),
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
export function publish<T>(key: string, status: T, err: Error = new Error("")) {

    const found = getMapItem(key)
    if (found !== undefined) {
        // iterate the callback list and call each one.
        for (const [callbackKey, cb] of found.callbackList) {
            if (cb !== undefined) {
                // console.log('pubsub publish', callbackKey, status)
                // call them anonymously so they can't mess with each other.
                setTimeout(() => {
                    try {
                        cb(status, err)
                    } catch (e) {
                        console.error('Error in pubsub callback for key', callbackKey, 'with status', status, 'and error', err, ': ', e)
                    }
                }, 0) // straight to the input queue.
                // c
                //cb(status, err)
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
        // console.log('pubsub unsubscribe', key, myAppName)
        found.callbackList.delete(myAppName)
        if (found.callbackList.size === 0) {
            namesMap.delete(key)
        }
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
