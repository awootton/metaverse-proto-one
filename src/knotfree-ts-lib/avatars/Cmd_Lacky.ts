
// Cmd_Lacky is just a gadget for managing executing list of commands. 
// It's a fancy way of saying if (cmd === "something") { do something } else if (cmd === "something else") { do something else } and so on.
// also, it integrates with the RPC_Gadget to handle incoming commands and deliver results.
// In other versions of this thing(C++, Java, Go, etc), the args might be in the command line but here there''s
// Just one arg and the args are in there as properties of the message object.
// Also note that the window.addEventListener has some fancy features for carrying things (arrays, data scructures, etc)
//  across mainland/island barrier so we just leave it all as 'any'  


// the Q and A are to help the humans keep track because it could be complicated.
// Every command and reply could have a different schema (like an rpc thing). and it will fill up files quickly. I've used grpc.
// The Q and A fields are optional and serve as a reference for the expected input and output structure of the command.

export type ICommand = {
	command: string; 
	description: string;
	Q?: any, // a js/ts object with the query parameters or additional data for the command. A schema
	A?: any, // a js/ts object with the data for the reply. A schema?
	// the msg should probably be an intanstance (not schema) of the Q
	
	// The execute function will be called with the message object (msg) and the call context (callContext).
	// The message object typically contains the arguments for the command, and the call context is usually the instance of Cmd_Lacky.
	execute: (msg: any, callContext: any) => any;
	// callContext is the context in which the command is executed, typically the instance of Cmd_Lacky.
}

// Cmd_Lacky class and its setup function

export class Cmd_Lacky {

	theCommands: Map<string, ICommand>

	passpharase: string // these are not all used. 
	pubStr: string   // some of this is so old that it used to be in C++
	privStr: string
	host: string
	adminPubStr: string
	adminPrivStr: string
	adminPubStr2: string
	adminPrivStr2: string

	fail: number
	count: number
	index: number
	token: string
	logMeVerbose: boolean
	dummyString: string

	constructor() {

		this.passpharase = ""
		this.fail = 0;
		this.count = 0;
		this.index = 0;
		this.pubStr = "";
		this.privStr = "";
		this.host = "";
		this.adminPubStr = "";
		this.adminPrivStr = "";
		this.adminPubStr2 = "";
		this.adminPrivStr2 = "";
		this.token = "";
		this.logMeVerbose = false;
		this.dummyString = "";

		// What is our domain? Can we have a nickname?
		this.theCommands = new Map<string, ICommand>();

		setupSomeBaseCommands(this);
	}

	public ExecuteCommand(commandString: string ): any | undefined {
		let cmd = this.theCommands.get(commandString);
		if (!cmd) {
			cmd = this.theCommands.get("help");
			if (!cmd) {
				return undefined;
			}
		}
		return cmd.execute(cmd, this);
	}

	public AddCommand(cmd: ICommand): void {
		this.theCommands.set(cmd.command, cmd);
	}
}

export function setupSomeBaseCommands(cmdr: Cmd_Lacky) {
	// 	// and then declare some commands.

	cmdr.AddCommand({

		command: "get time", // The command

		description: "seconds since 1970🔓", // a description

		Q: {}, // no query parameters for this command
		A:  { seconds: "string" }, // the expected structure of the reply

		//argCount: 0,
		// the function to execute when this command is received. 
		// It takes the message, the arguments, and the call context (which is the IThingContext object in this case).
		execute: (msg: any, callContext: any) => {
			const sec = Math.floor(Date.now() / 1000);
			return sec.toString();
		}
	});

	cmdr.AddCommand({
		command: "get random",
		description: "returns a random integer",
		
		Q: {}, // no query parameters for this command
		A : { random: "string" }, // the expected structure of the reply

		execute: (msg: any, callContext: any) => {
			const tmp = Math.floor(Math.random() * 0xFFFFFFFF);
			return tmp.toString();
		}
	});

	cmdr.AddCommand({
		command: "get count",
		description: "how many served since reboot",
		
		Q: {}, // no query parameters for this command
		A: { count: "number" }, // the expected structure of the reply

		execute: (msg: any, callContext: any) => {
			return { count: callContext.count };
		}
	});

	cmdr.AddCommand({
		command: "get fail",
		description: "how many requests were bad since reboot",
		Q: {}, // no query parameters for this command
		A: { fail: "number" }, // the expected structure of the reply
		execute: (msg: any, callContext: any) => {
			return { fail: callContext.fail };
		}
	});

	cmdr.AddCommand({
		command: "get pubk"	,
		description: "device public key 🔓",
		Q: {}, // no query parameters for this command
		A: { pubk: "base64-string" }, // the expected structure of the reply
		execute: (msg: any, callContext: any) => {
			return { pubk: callContext.pubStr };
		}
	});

	cmdr.AddCommand({
		command: "get_admin_hint",
		description: "the first chars of the admin public keys🔓",
		Q: {}, // no query parameters for this command
		A: { hint: "string" }, // the expected structure of the reply
		execute: (msg: any, callContext: any) => {
			return { hint: callContext.adminPubStr.substring(0, 8) + " " + callContext.adminPubStr2.substring(0, 8) };
		}
	});

	cmdr.AddCommand({
		command: "version",
		description: "info about this thing",
		//argCount: 0,
		execute: (msg: any, callContext: any) => {
			return "v0.2.0";
		}
	});		

	cmdr.AddCommand({
		command: "help",
		description: "lists all commands. 🔓 means no encryption required",
		Q: {}, // no query parameters for this command
		A:  `{"top":"string","cmds":[{"cmd":["string"],"desc":"string","Q":{},"A":{}}]}` , 

		execute: (msg: any, callContext: any) => {
			let s = "";
			let result = { help: "These are the commands. Am I doing this right?" };

			const keys: string[] = Array.from(callContext.theCommands.keys());
			keys.sort();
			for (const k of keys) {
				const command = callContext.theCommands.get(k);
				if (!command) continue;
				let argCount = "";
				if (command.argCount > 0) {
					argCount = " +" + command.argCount.toString();
				}
				s += "[" + k + "]" + argCount + " " + command.description + "\n";
			}
			return { help: s };
		}
	});

	cmdr.AddCommand({
		command: "get token"	,
		description: "info about the token",
		execute: (msg: any, callContext: any) => {
			const parts = callContext.token.split(".");
			if (parts.length !== 3) {
				return "error: invalid token";
			}
			const payloadB64 = parts[1];
			try {
				const payload = Buffer.from(payloadB64, 'base64url').toString('utf-8');
				return payload;
			} catch (err) {
				return "error: " + (err as Error).message;
			}
		}
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
