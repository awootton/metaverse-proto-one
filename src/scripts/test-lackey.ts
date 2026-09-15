
import { assert } from "console";
import { Cmd_Lacky } from "../knotfree-ts-lib/avatars/Cmd_Lacky";

// npx ts-node src/scripts/test-lackey.ts

const cmdr = new Cmd_Lacky();

// var got = cmdr.ExecuteCommand(["get", "time"]);
// // returns undefined.
// // assert.equal(got, undefined)
// console.log("got for get,time: ", got);

// got = cmdr.ExecuteCommand(["get_time"]);
// // returnse undefined.
// assert.equal(got, undefined)
// console.log("got for get,time: ", got);

var got = cmdr.ExecuteCommand("get time");

console.log(got);

got = cmdr.ExecuteCommand("help");

console.log(got);
