/* ------Taken from Awesomesams twitch Code------
---------I am just to lazy to make my own-----
---------If you dm me on discord just to complain I took his code please....----
----------just go tell someone who cares------ 
---------thanks for playing tho*/



const Store = require('electron-store');
const config = new Store();

let twitchRunning = false;
let client;
let webContents;

function twitchGarb(web) {
    // This just does some stupid shit that i could care less about
    if (config.get('botUsername', null) &&
    config.get('botOAuth', null) &&
    config.get('twitchChannel', null) &&
    config.get('twitchInt', false)
    ){
        const tmi = require('tmi.js');
        const opts = {
            identity: {
                username: config.get('botUsername'),
                password: config.get('botOAuth')

            },
            channls: [
                config.get('twitchChannel')
            ]
        };
        client = new tmi.client(opts);
        client.on('chat', onMessageHandler);
        client.on('connected', onConnectedHandler);
        webContents = web
        client.connect().catch((err) => console.log(err));
    } else 
        console.log('Twitch Intergration is not running')
}

function closeTwitch(){
    if (twitchRunning)
    client.disconnect()
}
function onMessageHandler(channel, user, msg) {
    msg = msg.toLowerCase();
    if (config.get('twitchChatSwap', false)) {
        const userName = user['display-name'];
        const userColor = user['color'] || '#ff69b4';
        webContents.send('twitch-msg', userName, userColor, msg);
    }

    const commandName = msg.trim();
    let response;
    if (commandName === config.get('linkCommand', '!link'))
        response = `${config.get('linkMessage', '{link}').replace('{link}', webContents.getURL())}`;
    else if (commandName === '!client')
        response = 'Download KClient2.0 here: https://discord.gg/TyGwHQ8yPA';
    else
        return;

    client.say(channel, response);
}

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
    twitchRunning = true;
}

module.exports.startTwitch = startTwitch;
module.exports.closeTwitch = closeTwitch;
