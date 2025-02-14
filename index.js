const path = require('path')
const shell = require('shelljs')
const create = require('./creator.js')
const separateOutput = 'input'
const argv = process.argv
const sourceAudioPath = argv[2] // mp3源文件路径
const endSec = argv[4] // 音频截取结束时间
const startSec = argv[3] || 0 // 音频截取开始时间
const fullBasename = path.basename(sourceAudioPath)
const ext = fullBasename.split('.')[1]
const lrcPath = sourceAudioPath.replace(ext, 'lrc') // 歌词路径
const basename = fullBasename.split('.')[0] // 获取输出的文件夹名称

const separateCommond = `spleeter separate -p spleeter:2stems -o ${separateOutput} "./${fullBasename.replace(ext, 'mp3')}"`
const transCommond = `ffmpeg -i "${sourceAudioPath}" -c:a libmp3lame -q:a 4 "./${sourceAudioPath.replace(ext, 'mp3')}"`
const cutCommond = `ffmpeg -i "./${sourceAudioPath.replace(ext, 'mp3')}" -acodec copy -ss ${startSec} -t ${endSec - startSec} "./${fullBasename.replace(ext, 'mp3')}"`

// 音频转换
const trans = () => shell.exec(transCommond, code => {
    if (code === 0) cut()
})

// 音频截取
const cut = () => shell.exec(cutCommond, code => {
    if (code === 0) separate()
})

// 伴奏分离
const separate = () => shell.exec(separateCommond, (code, stdout, stderr) => {
    if (code === 0) {
        // 伴奏分离成功
        // return
        shell.cp(lrcPath, path.resolve(__dirname, `${separateOutput}/${basename}/${basename}.lrc`)) // 拷贝歌词到伴奏文件夹
        const folderPath = path.resolve(__dirname, `${separateOutput}/${basename}`)
        create({
            folderPath,
            endSec,
            startSec
        }).then((output) => {
            shell.exec(`open "${output}"`) // 打开输出文件
            shell.rm([`./${fullBasename}`])
            // shell.rm([sourceAudioPath, lrcPath]) // 删除mp3及歌词文件
        })
    }
})

// cut()
trans()