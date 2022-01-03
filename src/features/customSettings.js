const Store = require('electron-store');
const config = new Store();

module.exports = [
	{
		name: 'Start as Fullscreen',
		id: 'fullScreenStart',
		category: 'Startup',
		type: 'checkbox',
		needsRestart: true,
		val: config.get("fullScreenStart", true),
	},
    {
		name: 'Unlimited FPS',
		id: 'disableFrameRateLimit',
		category: 'Performance',
		type: 'checkbox',
		needsRestart: true,
		val: config.get("disableFrameRateLimit", false),
	},
	{
		name: 'Discord Rich Presence',
		id: 'discordRPC',
		category: 'Performance',
		type: 'checkbox',
		needsRestart: true,
		val: config.get("discordRPC", true),
	},
	{
		name: 'Client Badges',
		id: 'clientBadges',
		category: 'Performance',
		type: 'checkbox',
		needsRestart: true,
		val: config.get("clientBadges", true),
	},
	{
        name: 'Preferred Badge',
        id: 'prefBadge',
        category: 'Badges',
        type: 'list',
        values: ['None', 'Developer', 'Contributor', 'Staff', 'Patreon', 'GFX Artist', 'V.I.P', 'Kirka Dev', 'Server Booster', 'Custom Badge'],
        needsRestart: true,
        val: config.get('prefBadge', 'None')
    },
    {
        name: 'Show FPS',
        id: 'showFPS',
        category: 'Game',
        type: 'checkbox',
        val: config.get('showFPS', true),
    },
    {
        name: 'Show HP',
        id: 'showHP',
        category: 'Game',
        type: 'checkbox',
        val: config.get('showHP', true),
    },
    {
        name: 'Prevent Ctrl+W from closing client',
        id: 'controlW',
        category: 'Game',
        type: 'checkbox',
        val: config.get('controlW', true),
    },
    {
        name: 'Prevent M4 and M5 to go back and forward',
        id: 'preventM4andM5',
        category: 'Game',
        type: 'checkbox',
        needsRestart: true,
        val: config.get('preventM4andM5', true),
    },
	{
		name: 'In-game Chat Mode',
		id: 'chatType',
		category: 'Game',
		type: 'list',
		values: ['Show', 'Hide'],
		needsRestart: true,
		val: config.get("chatType", "Show"),
	},
	{
		name: 'Custom Sniper Scope',
		id: 'customScope',
		category: 'Game',
		type: 'input',
		needsRestart: false,
		val: config.get('customScope', ''),
		placeholder: 'Scope url'
	},
	{
		name: 'Scope Size',
		id: 'scopeSize',
		category: 'Game',
		type: 'slider',
		needsRestart: false,
		min: 10,
		max: 1000,
		val: config.get("scopeSize", 400)
	},
	{
        name: 'Custom CSS',
        id: 'css',
        category: 'Game',
        type: 'input',
        needsRestart: true,
        val: config.get('css', ''),
        placeholder: 'CSS URL (http/https only)'
    },
    {
        name: 'Twitch Integration',
        id: 'twitchInt',
        category: 'Twitch',
        type: 'checkbox',
        needsRestart: true,
        val: config.get('twitchInt', false),
    },
	{
        name: 'Show Twitch chat in Kirka chat',
        id: 'twitchChatSwap',
        category: 'Twitch',
        type: 'checkbox',
        val: config.get('twitchChatSwap', false),
    },
	{
        name: 'Twitch Channel',
        id: 'twitchChannel',
        category: 'Twitch',
        type: 'input',
        needsRestart: true,
        placeholder: 'Twitch Username goes here',
        val: config.get('twitchChannel', '')
    },
	{
        name: 'Link Command',
        id: 'linkCommand',
        category: 'Twitch',
        type: 'input',
        placeholder: 'Command to get the link of your game',
        val: config.get('linkCommand', '!link')
    },
	{
        name: 'Link Message',
        id: 'linkMessage',
        category: 'Twitch',
        type: 'input',
        placeholder: '{link} = Gamelink. Client will auto-replace that.',
        val: config.get('linkMessage', 'Join here: {link}')
    }
]
