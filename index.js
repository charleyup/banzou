const path = require('path')
const shell = require('shelljs')
const separateOutput = 'input'
const argv = process.argv
const sourceAudioPath = argv[2] // mp3源文件路径
const startSec = argv[3] || 0 // 音频截取开始时间
const endSec = argv[4] // 音频截取结束时间
const fullBasename = path.basename(sourceAudioPath) // 完整文件名，包含后缀，例如abc.mp3
const ext = fullBasename.split('.')[1] // 获取后缀名
const lrcPath = sourceAudioPath.replace(ext, 'lrc') // 歌词路径，歌词文件需要和原音频文件放在同一目录，且文件名相同
const basename = fullBasename.split('.')[0] // 获取输出的文件夹名称

const isCut = endSec

// 原音频转成mp3格式
const transCommond = `ffmpeg -i "${sourceAudioPath}" -c:a libmp3lame -q:a 4 "./${sourceAudioPath.replace(ext, 'mp3')}"`

// 提取伴奏脚本
const separateCommond = `spleeter separate -p spleeter:2stems -o ${separateOutput} "./${isCut ? sourceAudioPath.replace('.' + ext, '-cut.mp3') : sourceAudioPath.replace(ext, 'mp3')}"`

// 不需要完整音频的可以截取 TODO 有点问题
const cutCommond = `ffmpeg -i "./${sourceAudioPath.replace(ext, 'mp3')}" -acodec copy -ss ${startSec} -t ${endSec - startSec} "./${sourceAudioPath.replace('.' + ext, '-cut.mp3')}"`

// 音频转换
const trans = () => shell.exec(transCommond, code => {
    console.log("开始将原音频转化为MP3格式...")
    if (code === 0) {
        console.log("格式转化成功")
        if (startSec && endSec) {
            console.log("开始截取")
            cut()
        } else {
            separate()
        }
    } else {
        console.error("格式转化失败")
    }
})

// 音频截取
const cut = () => shell.exec(cutCommond, code => {
    if (code === 0) {
        console.log("截取成功")
        separate()
    } else {
        console.error("截取失败")
    }
})

// 伴奏分离
const separate = () => shell.exec(separateCommond, (code, stdout, stderr) => {
    console.log("开始分离伴奏")
    if (code === 0) {
        console.log("伴奏分离成功")
        // shell.cp(lrcPath, path.resolve(__dirname, `${separateOutput}/${basename}/${basename}.lrc`)) // 拷贝歌词到伴奏文件夹
        // const folderPath = path.resolve(__dirname, `${separateOutput}/${basename}`)
        shell.cp(lrcPath, path.resolve(__dirname, `${separateOutput}/${basename + (isCut ? '-cut' : '')}/${basename + (isCut ? '-cut' : '')}.lrc`)) // 拷贝歌词到伴奏文件夹
        const folderPath = path.resolve(__dirname, `${separateOutput}/${basename + (isCut ? '-cut' : '')}`)
        require('./creator.js')({
            folderPath,
            endSec,
            startSec
        }).then((output) => {
            shell.exec(`open "${output}"`) // 打开输出文件
            // shell.rm([`./${fullBasename}`])
            // shell.rm([sourceAudioPath, lrcPath]) // 删除mp3及歌词文件
        })
    } else {
        console.error("伴奏分离失败：", stderr)
    }
})

// cut()
trans()
// shell.cp(lrcPath, path.resolve(__dirname, `${separateOutput}/${basename}/${basename}.lrc`)) // 拷贝歌词到伴奏文件夹
//         const folderPath = path.resolve(__dirname, `${separateOutput}/${basename}`)
//         require('./creator.js')({
//             folderPath,
//             endSec,
//             startSec
//         }).then((output) => {
//             shell.exec(`open "${output}"`) // 打开输出文件
//             shell.rm([`./${fullBasename}`])
//             // shell.rm([sourceAudioPath, lrcPath]) // 删除mp3及歌词文件
//         })