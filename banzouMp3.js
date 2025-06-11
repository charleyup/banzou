const path = require('path')
const shell = require('shelljs')
const separateOutput = 'input'
const argv = process.argv
const sourceAudioPath = argv[2] // mp3源文件路径
const fullBasename = path.basename(sourceAudioPath) // 完整文件名，包含后缀，例如abc.mp3
const ext = fullBasename.split('.')[1] // 获取后缀名
const basename = fullBasename.split('.')[0] // 获取输出的文件夹名称

const wavPath = path.resolve(__dirname, `${separateOutput}/${basename}/accompaniment.wav`) // 伴奏wav文件路径

// 原音频转成mp3格式
const transCommond = `ffmpeg -i "${wavPath}" -c:a libmp3lame -q:a 4 "./${fullBasename.replace(ext, 'mp3')}"`

// 提取伴奏脚本
const separateCommond = `spleeter separate -p spleeter:2stems -o ${separateOutput} "${sourceAudioPath}"`

// 音频转换
const trans = () => shell.exec(transCommond, code => {
    console.log("开始将原音频转化为MP3格式...")
    if (code === 0) {
        console.log("格式转化成功")
    } else {
        console.error("格式转化失败")
    }
})

// 伴奏分离
const separate = () => shell.exec(separateCommond, (code, stdout, stderr) => {
    console.log("开始分离伴奏")
    if (code === 0) {
        console.log("伴奏分离成功")
        trans()
    } else {
        console.error("伴奏分离失败：", stderr)
    }
})

// cut()
// trans()
separate()