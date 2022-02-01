const afterSign = require("./afterSign.js")
const path = require('path');

//packager.appInfo.productFilename
async function doNotarization() {

    const context = {
        electronPlatformName: "darwin",
        appOutDir: path.resolve("../dist/mac"),
        packager: {
            appInfo: {
                productFilename: "IGV JBrowse CircularView"
            }
        }
    }

    await afterSign(context)
}

doNotarization()
    .then((value) => {
        console.log(value)
    })
    .catch((error) => {
        console.log(error)
    })