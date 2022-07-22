const create = require('./creator.js')
// 获取命令行音频、歌词参数
const argv = process.argv
const folderPath = argv[2] // 文件夹目录
const cutDuration = argv[3] // 剪辑时长、不传默认音频时长

create(folderPath, cutDuration)
