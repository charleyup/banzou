const fs = require('fs')
const lrcData = fs.readFileSync('./geci.lrc','utf-8')
const reg1 = /(?<=\[)\d.*\d(?=\])/
const reg2 = /(?<=\]).*/
const lyrics = lrcData.split(/\r/).reduce((arr, item) => {
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
exports.lyrics = lyrics