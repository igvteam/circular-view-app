'use strict';
const path = require('path');
const fs = require('fs');
const {app, Menu, shell, dialog} = require('electron');
const {
    is,
    appMenu,
    aboutMenuItem,
    openUrlMenuItem,
    openNewGitHubIssue,
    debugInfo
} = require('electron-util');
const prompt = require('electron-prompt');


let mainWindow;

function createMenu(win) {
    mainWindow = win;
    return Menu.buildFromTemplate(template);
}

const showPreferences = () => {
    // Show the app's preferences here
};

const helpSubmenu = [
    openUrlMenuItem({
        label: 'Website',
        url: 'https://igv.org'
    }),
    openUrlMenuItem({
        label: 'Source Code',
        url: 'https://github.com/igvteam/circular-view.js'
    }),
    {
        label: 'Report an Issue…',
        click() {
            const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


---

${debugInfo()}`;

            openNewGitHubIssue({
                user: 'igvteam',
                repo: 'circular-view',
                body
            });
        }
    }
];

const viewSubmenu = [
    {
        label: 'Clear chords',
        click() {
            mainWindow.webContents.send('fromMain', '{"message": "clearChords"}');
        }
    }
];

if (!is.macos) {
    helpSubmenu.push(
        {
            type: 'separator'
        },
        aboutMenuItem({
            icon: path.join(__dirname, 'static', 'icon.ico'),
            text: 'Created by Your Name'
        })
    );
}

const debugSubmenu = [
    {
        label: 'Open development tools',
        click() {
            // Open the DevTools.
            mainWindow.webContents.openDevTools()
        }
    },
    // {
    //     label: 'Show Settings',
    //     click() {
    //         config.openInEditor();
    //     }
    // },
    // {
    //     label: 'Show App Data',
    //     click() {
    //         shell.openItem(app.getPath('userData'));
    //     }
    // },
    // {
    //     type: 'separator'
    // },
    // {
    //     label: 'Delete Settings',
    //     click() {
    //         config.clear();
    //         app.relaunch();
    //         app.quit();
    //     }
    // },
    // {
    //     label: 'Delete App Data',
    //     click() {
    //         shell.moveItemToTrash(app.getPath('userData'));
    //         app.relaunch();
    //         app.quit();
    //     }
    // }
];

const macosTemplate = [
    appMenu([
        {
            label: 'Preferences…',
            accelerator: 'Command+,',
            click() {
                showPreferences();
            }
        }
    ]),
    // {
    //     role: 'fileMenu',
    //     submenu: [
    //         {
    //             label: 'Load from file...',
    //             click: getFileFromUser
    //         },
    //         {
    //             type: 'separator'
    //         },
    //         {
    //             role: 'close'
    //         }
    //     ]
    // },
    // {
    //     role: 'editMenu'
    // },
    {
        role: 'viewMenu',
        submenu: viewSubmenu
    },
    {
        role: 'help',
        submenu: helpSubmenu
    },
    {
        label: 'Debug',
        submenu: debugSubmenu
    }
];

// Linux and Windows
const otherTemplate = [
    {
        role: 'fileMenu',
        submenu: [
            {
                label: 'Custom'
            },
            {
                type: 'separator'
            },
            {
                label: 'Settings',
                accelerator: 'Control+,',
                click() {
                    showPreferences();
                }
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    },
    {
        role: 'viewMenu',
        submenu: viewSubmenu

    },
    {
        role: 'help',
        submenu: helpSubmenu
    }
];

/**
 * Open a file dialog to select files.
 *
 * @returns {Promise<void>}
 */
async function getFileFromUser() {

    const files = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections']
    });

    if (!files) {
        return;
    }

    const configs = createTrackConfigs(files.filePaths);
    mainWindow.webContents.send('fromMain', JSON.stringify(configs))

}

const template = is.macos ? macosTemplate : otherTemplate;

if (is.development) {
    template.push({
        label: 'Debug',
        submenu: debugSubmenu
    });
}

module.exports = createMenu
