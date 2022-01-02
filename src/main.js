//modules
require("v8-compile-cache"); //For better startup
const path = require("path");
const { app, BrowserWindow, screen, clipboard, dialog, shell, globalShortcut, session, ipcMain, ipcRenderer } = require('electron');
const electronLocalshortcut = require("electron-localshortcut");
const Store = require("electron-store");
const log = require('electron-log')
const config = new Store();
const { DiscordClient, InitRPC } = require('./features/discordRPC')
const yargs = require('yargs')

const argv = yargs.argv
const AUTO_UPDATE = argv.update || config.get('autoUpdate', 'download')


if (require("electron-squirrel-startup")) {
    app.quit();
}
if (config.get('disableFrameRateLimit', false)) {
    app.commandLine.appendSwitch('disable-frame-rate-limit')
}

ipcMain.on('close-me', (evt, arg) => {
    app.quit();
})

app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-print-preview');
app.commandLine.appendSwitch('disable-metrics');
app.commandLine.appendSwitch('disable-metrics-repo');
app.commandLine.appendSwitch('enable-javascript-harmony');
app.commandLine.appendSwitch('no-referrers');
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('high-dpi-support', 1);
app.commandLine.appendSwitch('disable-2d-canvas-clip-aa');
app.commandLine.appendSwitch('disable-bundled-ppapi-flash');
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('disable-web-security');

let gamePreload = path.resolve(__dirname + '/preload/global.js')
let splashPreload = path.resolve(__dirname + '/preload/splash.js')
let settingsPreload = path.resolve(__dirname + '/preload/settings.js')

let win;
let splash;
let canDestroy;

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        backgroundColor: "#000000",
        titleBarStyle: 'hidden',
		frame: false,
        show: false,
        acceptFirstMouse: true,
        icon: icon,
        webPreferences: {
            nodeIntergation: true,
            preload: gamePreload,
            enableRemoteModule: true
        },
    });
    createShortcutKeys();
    create_set();

    win.loadURL('https://kirka.io/');
    


    win.on('close', function() {
        app.exit();
    });

    win.webContents.on('new-window', function(event, url) {
        event.preventDefault()
        win.loadURL(url);
    });

    if (config.get("enablePointerLockOptions", false)) {
        app.commandLine.appendSwitch("enable-pointer-lock-options");
    }

    let contents = win.webContents;

    win.once("ready-to-show", () => {
        showWin();
        if (config.get("discordRPC", true)) {
            InitRPC();
            DiscordClient(win.webContents);
        }
        if (config.get("chatType", "Show") !== "Show") {
            win.webContents.send('chat', false, true);
        }
    });

    function showWin() {
        if (!canDestroy) {
            setTimeout(showWin, 500);
            return;
        }
        splash.destroy();
        if (config.get("fullScreenStart", true)) {
            win.setFullScreen(true);
        }
        win.show();
    }
    
}

function createShortcutKeys() {
    const contents = win.webContents;

    electronLocalshortcut.register(win, 'Escape', () => contents.executeJavaScript('document.exitPointerLock()', true));
    electronLocalshortcut.register(win, 'F4', () => clipboard.writeText(contents.getURL()));
    electronLocalshortcut.register(win, 'F5', () => contents.reload());
    electronLocalshortcut.register(win, 'Shift+F5', () => contents.reloadIgnoringCache());
    electronLocalshortcut.register(win, 'F6', () => checkkirka());
    electronLocalshortcut.register(win, 'F11', () => win.setSimpleFullScreen(!win.isSimpleFullScreen()));
    electronLocalshortcut.register(win, 'Enter', () => chatShowHide());
}

let chatState = false;
function chatShowHide() {
    let chatType = config.get("chatType", "Show")
    return;
    switch (chatType) {
        case 'Show':
            break;
        case 'Hide':
            win.webContents.send('chat', false, false)
            break;
        case 'On-Focus':
            break;
            win.webContents.send('chat', chatState, false)
            if (chatState) {
                chatState = false;
            } else {
                chatState = true;
            }
    }
}

function checkkirka() {
    const urld = clipboard.readText();
    if (urld.includes("https://kirka.io/games/")) {
        win.loadURL(urld);
    }
}

app.allowRendererProcessReuse = true;

let icon;
if (process.platform === "linux") {
    icon = __dirname + "/media/icon.png"
} else {
    icon = __dirname + "/media/icon.ico"
}

app.whenReady().then(() => createSplashWindow());

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});


function createSplashWindow() {
    splash = new BrowserWindow({
        width: 600,
        height: 350,
        center: true,
        resizable: false,
        frame: false,
        show: true,
	    icon: icon,
        transparent: true,
        alwaysOnTop: false,
        webPreferences: {
            preload: splashPreload,
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    let contents = splash.webContents;
    splash.loadFile(`${__dirname}/html/splash.html`);

    
	autoUpdate().finally(() => launchGame());

	async function autoUpdate() {
		return new Promise((resolve, reject) => {
			if (AUTO_UPDATE == 'skip') {
				resolve();
			} else {
				contents.on('dom-ready', () => {
					contents.send('message', 'Initializing the auto updater...');
					const { autoUpdater } = require('electron-updater');
					autoUpdater.logger = log;

					autoUpdater.on('error', err => {
						console.error(err);
						contents.send('message', 'Error: ' + err.name);
						reject(`Error occurred: ${err.name}`);
					});
					autoUpdater.on('checking-for-update', () => contents.send('message', 'Checking for update'));
					autoUpdater.on('update-available', info => {
						console.log(info);
						contents.send('message', `Update v${info.version} available`, info.releaseDate);
						if (AUTO_UPDATE != 'download') {
							resolve();
						}
					});
					autoUpdater.on('update-not-available', info => {
						console.log(info);
						contents.send('message', 'No update available');
						resolve();
					});
					autoUpdater.on('download-progress', info => {
						//contents.send('message', `Downloaded ${Math.floor(info.percent)}%`, Math.floor(info.bytesPerSecond / 1000) + 'kB/s');
                        //win.setProgressBar(info.percent / 100 );
					});
					autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName)=> {
						const dialogOpts = {
							type: 'info',
							buttons: ['Restart', 'Later'],
							title: 'Application Update',
							message: process.platform === 'win32' ? releaseNotes : releaseName,
							detail: 'A new version has been downloaded. Restart the application to apply the updates.'
						  }
						
						  dialog.showMessageBox(dialogOpts).then((returnValue) => {
							if (returnValue.response === 0) autoUpdater.quitAndInstall()
						  })
						//contents.send('message', null, `Installing v${info.version}...`);
						//autoUpdater.quitAndInstall(true, true);
					});

					autoUpdater.autoDownload = AUTO_UPDATE == 'download';
					autoUpdater.checkForUpdates();
				});
			}
		});
	}

    function launchGame() {
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        createWindow();
        wait(5000).then(() => { 
            canDestroy = true;
        });
    }

}

function create_set() {
    setwin = new BrowserWindow({
        width: 1000,
        height: 600,
        show: false,
        frame: true,
        icon: __dirname + "/media/icon.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: settingsPreload
          }
    });
    setwin.removeMenu();
    setwin.loadFile(path.join(__dirname, "/settings/settings.html"));
    //setwin.setResizable(false)

    setwin.on('close', (event) => {
        event.preventDefault();
        setwin.hide();
    });

    ipcMain.on('show-settings', () => {
        setwin.show()
    })

    setwin.once('ready-to-show', () => {
        //setwin.show()
        //setwin.webContents.openDevTools();
    })

};
