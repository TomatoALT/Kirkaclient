/*-----Taken From Awesomesams Client suck my dick if you complain abt it------
*/
const Store = require('electron-store');
const config = new Store();
const scriptName = 'Auto Joiner';
const fetch = require('node-fetch');
const https = require('https');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});
const GAME_URL = 'https://kirkaclient.herokuapp.com/api/autojoin';

async function getGame() {
    const gameMode = config.get('AJ_prefGamemode'),
        map = config.get('AJ_prefMap', null),
        minPlayers = config.get('AJ_minPlayers', null),
        maxPlayers = config.get('AJ_maxPlayers', null);

    const data = {
        gameMode: gameMode,
        map: map,
        minPlayers: minPlayers,
        maxPlayers: maxPlayers
    };

    const request = {
        method: 'POST',
        agent: httpsAgent,
        body: JSON.stringify(data)
    };

    const response = await fetch(GAME_URL, request);
    const json = await response.json();
    return json;
}

module.exports = {
    name: scriptName,
    location: ['game'],
    settings: [
        {
            name: 'Keybind',
            id: 'AJ_keybind',
            category: scriptName,
            type: 'input',
            val: config.get('AJ_keybind', 'F7'),
            placeholder: 'Keybind'
        },
        {
            name: 'Preferred Gamemode',
            id: 'AJ_prefGamemode',
            category: scriptName,
            type: 'list',
            needsRestart: true,
            values: ['None', 'FFA', 'TDM', 'Parkour', 'Knife Only'],
            val: config.get('AJ_prefGamemode', 'None'),
        },
        {
            name: 'Preferred Map',
            id: 'AJ_prefMap',
            category: scriptName,
            type: 'list',
            values: ['None', 'Village', 'Mirage', 'Cathedral'],
            val: config.get('AJ_prefMap', 'None'),
        },
        {
            name: 'Minimum Players',
            id: 'AJ_minPlayers',
            category: scriptName,
            type: 'input',
            val: config.get('AJ_minPlayers', ''),
            placeholder: 'Leave empty to disable'
        },
        {
            name: 'Maximum Players',
            id: 'AJ_maxPlayers',
            category: scriptName,
            type: 'input',
            val: config.get('AJ_maxPlayers', ''),
            placeholder: 'Leave empty to disable'
        }
    ],
    launch: getGame
};
