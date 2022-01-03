/* ------Taken from Awesomesams twitch Code------
---------I am just to lazy to make my own-----
---------If you dm me on discord just to complain I took his code please....----
----------just go tell someone who cares------ 
---------thanks for playing tho*/
const { startTwitch, closeTwitch } = require('./twitchIntegration');
const { checkBadge, initBadges, sendBadges } = require('./badges');
const { initRPC, updateRPC, closeRPC } = require('./discordRPC');

module.exports = {
    startTwitch,
    autoUpdate,
    checkBadge,
    initBadges,
    updateRPC,
    sendBadges,
    initRPC,
    closeTwitch,
    closeRPC
};