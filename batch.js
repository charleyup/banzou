const path = require('path')
const fs = require('fs')
const create = require('./creator.js')
// 获取命令行音频、歌词参数
const argv = process.argv
const folderPath = argv[2] // 文件夹目录
// const folderPath = path.resolve(__dirname, argv[2]) // 文件夹目录

fs.readdir(folderPath, (err, files) => {
    if (err) throw err
    files.forEach(item => {
        const filePath = path.join(folderPath, item)
        fs.stat(filePath, (err, stats) => {
            if (err) throw err
            if (stats.isDirectory()) {
                create({
                    folderPath: filePath,
                    autoCut: true
                })
            }
        })
    })
})

// create({
//     folderPath,
//     cutDuration,
//     autoCut: true
// })
