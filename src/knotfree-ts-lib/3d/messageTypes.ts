
// I think we're going to need BaseMessages on EVERY message
// look in MakeListOfIFrames.tsx to see the plumbing,
// the to and from are internal addresses, not just 'source' or 'origin' 

// TODO: make this all into that cloudflare rpc: thing 'Cap'n Web',
// just as soon as we have enough here to know what we require. We're layers below that now.

// we're going to have to check the "in" for "to" and "from" and "type}
// and then case on that to make the right 'class' and actions.
// so, type is NOT cmd.

import * as oct from './DomainNameOctTree'


// How do we know the 'type' of the message?
// It's in the publish/subscribe in most cases,

export type MessageBaseClass = {

    to: string;          // for routing to the correct recipient
    from: string;        // for identifying the sender

    // is this the same as "cmd"? no
    type: string;       // for routing by type. Do we always need to include this in every message?
    sessionId: string;   //  for routing reply messages
}

export function ensureMessageBaseClass(message: any):  MessageBaseClass | null {
    const is = message && typeof message.to === "string" && typeof message.from === "string" &&
           typeof message.type === "string" && typeof message.sessionId === "string";
    if (!is) {
        return null
    }
    return message as MessageBaseClass;
}

export type Greetings = MessageBaseClass & {
    message: string; // a greeting message, and stop animating please until we say so? 
    aux: oct.AuxLeafStatus;
}

export type GlbMessage = MessageBaseClass & {
   // type: "glb";
    name: string;// of the master w/0 the tld. This will refer to the AuxLeafStatus on the other side..
    
    command: string; // "add" or "remove" or "update" or "replace", or "pause"/
    // "start" or "delete" or "modify" or "change" or "redraw"
    comment: string; // a comment about the change, for logging and debugging.

    key: string; // a name for the blob.
    active: boolean; // should it be playing? 
    data: Blob; // this is the exported glb data as a Blob.

    // how do the animations work?
};


// Copyright 2026 Alan Tracey Wootton
// See LICENSE
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published byx3
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


 // "mqtt": "^5.15.2",