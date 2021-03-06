const fs = require('fs')
const iconv = require('iconv-lite')
const reg1 = /(?<=\[)\d.*\d(?=\])/
const reg2 = /(?<=\]).*/
const getLyrics = (path) => {
    const lrcData = fs.readFileSync(path)
    const lyrics = iconv.decode(lrcData,'gbk').split(/\n/).reduce((arr, item) => {
        const time = item.match(reg1)?.[0] || ''
        const min = time.split(':')[0]
        const sec = time.split(':')[1]
        const seconds = Number(min) * 60 + Number(sec)
        const text = item.match(reg2)?.[0]
        if (text) {
            arr.push({
                seconds,
                text
            })
        }
        return arr
    }, [])
    return lyrics
}
exports.getLyrics = getLyrics