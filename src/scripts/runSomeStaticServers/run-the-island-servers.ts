
import { execSync } from 'child_process';
import find from 'find-process';
import { ServerItem, OurServerList } from '../../knotfree-ts-lib/avatars/testServermap';

const express = require('express');
const path = require('path');
// const fs = require('fs');
const app = express();

// like this: npx ts-node src/scripts/runSomeStaticServers/run-the-island-servers.ts
// like this:   npx ts-node src/scripts/runSomeStaticServers/run-the-island-servers.ts
// like this:       npx ts-node src/scripts/runSomeStaticServers/run-the-island-servers.ts
// like this:           npx ts-node src/scripts/runSomeStaticServers/run-the-island-servers.ts
// go team go! 

async function checkPort(port: number) {
    const list = await find('port', port);
    if (list.length > 0) {
        console.log(`Port ${port} is in use by PID:`, list[0].pid, 'Name:', list[0].name);
    } else {
        console.log(`Port ${port} is free.`);
    }
}

console.log("Checking ports for servers...");
async function checkAllPorts() {
    console.log("Checking ports for servers...");
    for (const [name, server] of Object.entries(OurServerList.servers)) {
        const item = server as ServerItem;
        const port = parseInt(item.port, 10);
        await checkPort(port);
    }
} // fire this baby off and don't wait for it. 
// :-) they don't allow that. Knew it. fire and forget instead.
checkAllPorts();

const worldsDir = '/Users/awootton/workspace/WorldsTest1';
const projectDir = '/Users/awootton/workspace/metaverse-proto-one';

// Build the app before starting any static servers. shell: true
process.chdir(worldsDir);
execSync('yarn build', { stdio: 'inherit', encoding: 'utf-8' });
process.chdir(projectDir);
// execSync('ls -lah', { stdio: 'inherit', encoding: 'utf-8' });
// 
console.log('atw was here. So far so good.');

for (const server of OurServerList.servers) {
    console.log(`Server name: ${server.name}, Master: ${server.master}, Port: ${server.port}`);
}

async function startServers() {

    await checkAllPorts();

    const buildDir = path.join(worldsDir, 'build');

    console.log("All ports checked. Starting servers...");

    for (const server of OurServerList.servers) {

        // console.log(`Starting server ${server.name} as ${server.master} with port ${server.port}`);
        // console.log(`Starting ${server.name} with build directory ${buildDir}`);

        if (server.port === "0") {
            console.log(`Skipping server ${server.name} with port 0.`);
            continue;
        }

        app.use(express.static(buildDir));
        app.get('/*splat', (req: any, res: any) => { // was '*'
            res.sendFile(path.join(buildDir, 'index.html'));
        });

        const port = Number(server.port);
        //console.log('Starting server on port', port, 'and path', buildDir);

        //if (!server.runLocalHost) { // don't do them all. 
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Example URL: http://${server.master}:${port}/index.html`);
        });
        // }

        // async wait for 10 sec for debug
        // await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

startServers();

console.log('ctrl-C to stop them all');

// That works!!! yay. I can serve two ways.
// I wonder how many I can do at once. ?
// Do they use memory while just sitting?

// examples: http://testmain-2n0u5w2p.zzz:9001 works
// we'll test some kind of prod version later. I can serve two ways. Now. can I serve these from S3.
// https://testmain-2n0u5w2p.zzz:9001 fails
// http://testmain-2n0u5w2p.zzz:9001 works


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
