
// This is a simple pub/sub system for components to subscribe to changes, messages and replies.
// use sessionID to subscribe.
// unused and might not be fit for purpose.
// are we using this?? delete me. 
// note that it's just the item and not an topic and a component. 
// so it's more of a direct messaging system.

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
