require('dotenv').config()
const {notarize} = require('electron-notarize')

exports.default = async function notarizing(context) {
    const {electronPlatformName, appOutDir} = context
    if (electronPlatformName !== 'darwin') {
        return
    }

    const appName = context.packager.appInfo.productFilename

    console.log(`appName = ${appName}`)

    // return await notarize({
    //     appBundleId: 'igv.org.circview',
    //     appPath: `dist/mac/${appName}`,
    //     appleId: process.env.APPLEID,
    //     appleIdPassword: process.env.APPLEIDPASS,
    // })

}
