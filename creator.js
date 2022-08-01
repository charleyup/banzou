const path = require('path')
const fs = require('fs')
const colors = require('colors')
const { FFScene, FFText, FFCreator } = require('ffcreator')
const config = require('./config')
const { fontSize, lineHeight, paddingTop } = config.text
const { width, height } = config.creator
const { getLyrics } = require('./getLRC.js')

const create = ({ folderPath, cutDuration, autoCut }) => {
    const fileName = path.basename(folderPath)
    const audioPath = path.join(folderPath, 'accompaniment.wav')// 音频路径
    const lrcPath = path.join(folderPath, `${fileName}.lrc`) // 歌词路径
    const lyrics = getLyrics(lrcPath)

    // 自动分段
    if (autoCut) {
        cutDuration = 0
        for (let i = 1; i < lyrics.length; i++) {
            const preSec = lyrics[i-1].seconds
            const curSec = lyrics[i].seconds
            // if (curSec < 60) break
            if (cutDuration < curSec - preSec) {
                cutDuration = preSec + (curSec - preSec) / 2
            }
        }
    }

    const duration = cutDuration || lyrics[lyrics.length - 1].seconds + 5

    const creator = new FFCreator({
        cacheDir: config.cacheDir,
        output: path.join(config.creator.outputDir, `${fileName}${cutDuration || autoCut ? '-合拍版' : ''}.mp4`),
        width,
        height,
        audio: path.resolve(audioPath),
        fps: 25
    })

    const scene = new FFScene()
    scene.setBgColor('#000000')

    // 添加歌手
    const singer = new FFText({
        text: fileName.split('-')[0].trim(),
        x: width / 2,
        y: height / 2 - 60,
        fontSize: 50,
        color: '#000000'
    })

    singer.setBackgroundColor('#ffffff')
    singer.alignCenter()
    singer.addAnimate({
        from: { alpha: 1 },
        to: { alpha: 0 },
        delay: 0.5,
        time: 0.2
    })
    scene.addChild(singer)

    // 添加歌曲名
    const title = new FFText({
        text: `《${fileName.split('-')[1].trim()}》`,
        x: width / 2,
        y: height / 2,
        fontSize: 50,
        color: '#000000'
    })

    title.setBackgroundColor('#ffffff')
    title.alignCenter()
    title.addAnimate({
        from: { alpha: 1 },
        to: { alpha: 0 },
        delay: 0.5,
        time: 0.2
    })
    scene.addChild(title)

    if (cutDuration || autoCut) {
        const title = new FFText({
            text: `合拍版`,
            x: width / 2,
            y: height / 2 + 60,
            fontSize: 50,
            color: '#000000'
        })

        title.setBackgroundColor('#ffffff')
        title.alignCenter()
        title.addAnimate({
            from: { alpha: 1 },
            to: { alpha: 0 },
            delay: 0.5,
            time: 0.2
        })
        scene.addChild(title)
    }


    // 添加歌词
    const rollupIndex = Math.floor(height / lineHeight / 2)
    lyrics.forEach((item, index) => {
        if (cutDuration && item.seconds > cutDuration) return // 合拍版精简歌词
        let curY = index * lineHeight + paddingTop
        const text = new FFText({
            text: item.text,
            x: width / 2,
            y: curY,
            fontSize: fontSize,
            color: '#ffffff'
        })
        text.alignCenter()

        for (let i = rollupIndex; i < lyrics.length; i++) {
            const seconds = lyrics[i].seconds;
            text.addAnimate({
                from: { y: curY, alpha: 0.3 },
                to: { y: curY -= lineHeight, alpha: 0.3 },
                delay: seconds,
                time: 0.5
            })
        }

        text.addAnimate({
            from: { scale: 1, alpha: 0.3 },
            to: { scale: 1.3, alpha: 1 },
            delay: item.seconds,
            time: 0.5
        })
        if (index !== lyrics.length - 1) {
            text.addAnimate({
                from: { scale: 1.3, alpha: 1 },
                to: { scale: 1, alpha: 0.3 },
                delay: lyrics[index + 1].seconds,
                time: 0.5
            })
        }

        scene.addChild(text)
    })

    scene.setDuration(duration)

    creator.addChild(scene)

    creator.start()

    creator.on('start', () => {
        console.log(`FFCreator start`);
    });

    creator.on('error', e => {
        console.log(`FFCreator error: ${e.error}}`);
    });

    creator.on('progress', e => {
        console.log(colors.yellow(`FFCreator progress: ${(e.percent * 100) >> 0}%`));
    });

    return new Promise((resolve, reject) => {
        creator.on('complete', e => {
            console.log(
                colors.magenta(`FFCreator completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `),
            );
            resolve(e.output)
        });
    })
}

module.exports = create


