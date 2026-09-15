import * as utils from '../3d/utils'
import { PubSubTopicAndSubscribers } from './PubSubTopicAndSubscribers';
import { MasterToNickname } from './testServermap';
import * as oct from '../3d/Dns8Tree'
import { Cmd_Lacky } from './Cmd_Lacky';

// To do an RPC on top of a pubsub channel takes some tricks. Here they are.
// it's easier to just use it and never know.

// These are supposed to be parts of the identity and command system.
// Also, who is supporting the IdentityDialog? What? I'm doing the IdentityDialog. Wanna help?

// These things (rpc, commandMap, etc are thrown together in this file. TODO: move them.

// The RPC concept.

export class RPC_Gadget {

	temporaryChannel: string; // how long does this last? Who deletes it? 
	inUse: boolean; // how long does this last? Who deletes it? 

	pubsub: PubSubTopicAndSubscribers;

	cleanMasterDomainName: string; // no prefix before the world name. No TLD or crap after the coordinates. 
	ourChannelName: string; // this is the channel that we are listening on. It is our "name" in the pubsub world. 
	// usually the name followed by -mainland-centre or -island-centre

	ourSecondaryName: string; // If two people were listening on this same channel then this woild be how we would distinguish between them. 
	// But, we NOT DOING THAT.

	nickname: string = "frivolous"// aka nickname

	onAnIsland : boolean = false; // whether this RPC_Gadget is on an island

	commandLackey : Cmd_Lacky;

	theCallback: (status: any, err: Error) => any = (status: any, err: Error) => {
		console.error("Error in RpcHelper subscription. This should be replaced by now:", err);
	}

	constructor(pubsub: PubSubTopicAndSubscribers, cleanMasterDomainName: string, channelName: string, cmder : Cmd_Lacky) {

		this.commandLackey = cmder;

		this.onAnIsland = pubsub.onAnIsland; // determine if this RPC_Gadget is on an island based on the pubsub information.

		this.cleanMasterDomainName = cleanMasterDomainName;

		// this is crap: it could be that mainpubsub so it doesn't have a 'master'. The comma is from not using [] after 
		// if ( oct.VerifyCubeName(this.cleanMasterDomainName) == false ||  this.cleanMasterDomainName.includes(",")) {
		// 	console.error("ERROR ERROR ERROR ERROR ERROR ERROR Invalid cleanMasterDomainName contains a comma:", this.cleanMasterDomainName);
		// }

		// too clever to be right.. 
		// if ( this.onAnIsland ){
		// 	this.ourChannelName = this.cleanMasterDomainName + "-island-centre"; 
		// } else {
		// 	this.ourChannelName = this.cleanMasterDomainName + "-mainland-centre"; 
		// }
		this.ourChannelName = channelName;
		
		this.nickname = MasterToNickname(this.cleanMasterDomainName) // aka nickname

		this.inUse = false;
		this.pubsub = pubsub;

		let tmp = "cb_" + this.nickname + "_" + utils.RandomString(20); // create a unique temporary name for this instance.
		this.temporaryChannel = tmp
		pubsub.subscribe(this.temporaryChannel, "RpcHelper", false,(status: any, err: Error) => {
			this.theCallback(status, err);
		},"tmp channel always has ANOTHER callback");

		this.ourSecondaryName = "friv name " + this.nickname

		if ( cleanMasterDomainName == "testmain-2n0u4w2p" ) {
			console.log("RPC Gadget mainland subscribing to orange")
		} 
		
		pubsub.subscribe(this.GetOurChannelName(), "", false, (cmd: any, err: Error) => {
					this.ProcessCommand(cmd, err);
				},"passes to Cmd_Lacky");
	}

	GetOurChannelName(): string {
		return this.ourChannelName;
	}

	getDomainName(): string {
		return this.cleanMasterDomainName;
	}

	ProcessCommand(command: any, err: Error) {

		if (err) {
			console.error("Error in RpcHelper subscription. This should be replaced by now:", err);
		} else {
			console.log("RpcHelper " + this.GetOurChannelName() + " received command:", command);
			// do something with the command. - send it to the lacky. 
			const result = this.commandLackey.ExecuteCommand(command);
			console.log("Command lacky result:", result);
			// send it back to the reply channel
			const replyMsg = {
				result: result
			}
			this.pubsub.publish(command.replyChannel, replyMsg, new Error(""));
		}
	}

	// Send the text command to the channel and get a (text) answer back via the callback. 
	SendCommandOldSchool(channel: string, command: string, callback: (status: any, err: Error) => any) {
		if (this.inUse) {
			// how long do we wait?
	// atw fix me 		return;
		}
		this.inUse = true; // this is a one-time use object, unless we make more temp channels.
		this.theCallback = callback;
		const msg = {
			command: command,
			replyChannel: this.temporaryChannel
		}
		console.log("Publishing SendCommandOldSchool message to channel:", channel, "with message:", msg);
		this.pubsub.publish(channel, msg, new Error(""));
		// how long do we wait?
	}

	async SendCommand(channel: string, command: string): Promise<any> {
		const msg = {
			command: command,
			replyChannel: this.temporaryChannel
		}
		console.log("Publishing SendCommand message to targetchannel:", channel);
		this.pubsub.publish(channel, msg, new Error(""));
		return new Promise((resolve, reject) => {
			this.theCallback = (status: any, err: Error) => {

				console.log("RPC SendCommand callback received:", status);

				if (err) {
					reject(err);
				} else {
					resolve(status);
				}
			};
		});
	}

	// the async version of SendCommandOldSchool. It returns a promise that resolves when the callback is called.
	// What is the channel for an island?
	async xSendCommand(channel: string, command: string): Promise<any> {

		console.log("Sending command to channel:", channel, "with command:", command);
		
		const promiseA = new Promise((resolve, reject) => {
			this.SendCommandOldSchool(channel, command, (status: any, err: Error) => {
				this.inUse = false
				if (err) {
					reject(err);
				} else {
					resolve(status);
				}
			});
		});
		return withTimeout(promiseA, 100000, "RpcHelper.SendCommandAsync timed out after 100 second");
	}
}

function withTimeout<T>(
	promise: Promise<T>,
	ms: number,
	errorMessage = "Operation timed out"
): Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout>;

	// 1. Create a promise that rejects when the timer expires
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error(errorMessage));
		}, ms);
	});

	// 2. Race the original promise against the timeout
	return Promise.race([promise, timeoutPromise]).finally(() => {
		// 3. Clear the timeout to prevent memory leaks if the operation wins
		clearTimeout(timeoutId);
	});
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
