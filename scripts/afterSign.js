require('dotenv').config();
const {notarize} = require('electron-notarize')
const fs = require('fs');
const path = require('path');

module.exports = async function afterSign(params) {

    const {electronPlatformName, appOutDir} = params
    if (electronPlatformName !== 'darwin') {
       return
    }
    const appName = params.packager.appInfo.productFilename
    const appId = 'igv.org.circview'
    const appPath = path.join(appOutDir, `${appName}.app`);
    if (!fs.existsSync(appPath)) {
        console.log(`Application path does not exist: ${appPath}`);
        return;
    }
    const appleId = process.env.APPLE_ID
    const appleIdPassword = process.env.APPLE_ID_PASSWORD
    const appleTeamId = process.env.APPLE_TEAM_ID

    if(!appleId || !appleIdPassword) {
        console.log("Must set APPLE_ID and APPLE_PASSWORD in file named '.env' in root of repository.  Skipping notarization")
        return;
    }

    console.log(`Notarizing appName: ${appName} appPath: ${appPath}`)
    console.log(`appleId: ${appleId}`)


    try {
        await notarize({
            tool: "notarytool",
            appBundleId: appId,
            appPath: appPath,
            appleId: appleId,
            appleIdPassword: appleIdPassword,
            teamId: appleTeamId
        });
    } catch (error) {
        console.error(error);
    }

    console.log(`Done notarizing ${appId}`);

}
