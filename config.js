const path = require('path')
const config = {
    creator: {
        width: 540,
        height: 960,
        cacheDir: path.join(__dirname, './cache'),
        outputDir: path.join(__dirname, './output')
    },
    scene: {},
    text: {
        lineHeight: 50,
        fontSize: 24,
        paddingTop: 80
    }
}

module.exports = config