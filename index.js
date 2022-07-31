const path = require('path')
const shell = require('shelljs')
const create = require('./creator.js')
const separateOutput = 'input'
const argv = process.argv
const sourceAudioPath = argv[2] // mp3源文件路径
const lrcPath = sourceAudioPath.replace('.mp3', '.lrc') // 歌词路径
const basename = path.basename(sourceAudioPath, '.mp3') // 获取输出的文件夹名称
const separateCommond = `python3.8 -m spleeter separate -p spleeter:2stems -o ${separateOutput} "${sourceAudioPath}"`
shell.exec(separateCommond, (code, stdout, stderr) => {
    if (code === 0) {
        // 伴奏分离成功
        shell.cp(lrcPath, path.resolve(__dirname, `${separateOutput}/${basename}/${basename}.lrc`)) // 拷贝歌词到伴奏文件夹
        const folderPath = path.resolve(__dirname, `${separateOutput}/${basename}`)
        const cutDuration = argv[3] // 剪辑时长、不传默认音频时长
        create({
            folderPath,
            cutDuration
        }).then((output) => {
            shell.exec(`open "${output}"`) // 打开输出文件
            shell.rm([sourceAudioPath, lrcPath]) // 删除mp3及歌词文件
        })
    }
})