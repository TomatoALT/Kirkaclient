/*-----TODO-----
    DiscordRPC is connecting but not displaying on discord and too lazy to fix them
    Will work on it later if you mad abt it don't use my client thanks  */


const { gameLoaded, version } = require('./const');
const DiscordRPC = require('discord-rpc');
const ClientID = '898286141239865404';
const starttime = Date.now();
const { checkBadge } = require('./badges');
const Store = require('electron-store');
const config = new Store();

let userBadges = { type: 'anything', role: 'KirkaClient User' };
let socket;
let discordOpen = false;

DiscordRPC.register(ClientID);
const client = new DiscordRPC.Client({ transport: 'ipc' });
client.login({ clientId: ClientID }).catch((error) => {
    console.log(error);
});


client.on('ready', () => {
    console.log(`RPC Ready! Username: ${client.user.username}#${client.user.discriminator}`);
    discordOpen = true;
});

function initRPC(socket_, webContents) {
    if (!config.get('discordRPC', true))
        return;
    socket = socket_;
    setInterval(() => {
        if (!discordOpen)
            return;

        let user = config.get('user', '').toString();

        if (user.slice(-1) === ' ')
            user = user.slice(0, -1);

        if (user !== '') {
            userBadges = checkBadge(user);
            if (!userBadges)
                userBadges = { type: 'anything', role: 'KirkaClient User' };

            const gameURL = webContents.getURL();
            if (!gameLoaded(gameURL))
                notPlaying();
            else {
                const gamecode = gameURL.replace('https://kirka.io/games/', '');
                socket.send({ type: 3, data: gamecode });
            }
        }
    }, 2500);
}

function notPlaying() {
    client.setActivity({
        state: 'Home Page',
        smallImageKey: userBadges.type,
        smallImageText: userBadges.role,
        largeImageKey: 'client_logo',
        largeImageText: `KirkaClient ${version}`,
        instance: true,
        startTimestamp: starttime,
        buttons: [
            { label: 'Get KirkaClient', url: 'https://discord.gg/TyGwHQ8yPA' }
        ]
    });
}

async function updateRPC(data) {
    if (!discordOpen)
        return;

    if (!data.success)
        return;
    let finalData, category;
    if (data.shortMode == 'MAP') {
        finalData = {
            mode: 'Editing a map',
            cap: data.players
        };
        category = 'map';
    } else {
        finalData = {
            mode: data.shortMode,
            map: data.map,
            cap: data.players,
            url: data.link
        };
        category = 'game';
    }
    updateClient(finalData, category);
}

function updateClient(data, type) {
    const updateData = {
        smallImageKey: userBadges.type,
        smallImageText: userBadges.role,
        largeImageKey: 'client_logo',
        largeImageText: `KirkaClient ${version}`,
        instance: true,
        startTimestamp: starttime,
    };

    switch (type) {
    case 'game':
        updateData['buttons'] = [
            { label: 'Join Game', url: data.url },
            { label: 'Get KirkaClient', url: 'https://discord.gg/TyGwHQ8yPA' }
        ];
        updateData['details'] = `Playing ${data.mode}`;
        updateData['state'] = `${data.map} (${data.cap})`;
        break;
    case 'map':
        updateData['buttons'] = [
            { label: 'Get KirkaClient', url: 'https://discord.gg/TyGwHQ8yPA' }
        ];
        updateData['details'] = 'Editing a map';
        updateData['state'] = data.cap;
        break;
    }
    client.setActivity(updateData);
}

function closeRPC() {
    if (discordOpen)
        client.clearActivity();
}

module.exports.initRPC = initRPC;
module.exports.closeRPC = closeRPC;
module.exports.updateRPC = updateRPC;
