const path = require('path')
const fs = require('fs')
const colors = require('colors')
const { FFScene, FFText, FFCreator, FFAudio } = require('ffcreator')
const config = require('./config')
const { fontSize, lineHeight, paddingTop } = config.text
const { width, height } = config.creator
const { getLyrics } = require('./getLRC.js')

const create = ({ folderPath, endSec, startSec, autoCut }) => {
    const fileName = path.basename(folderPath)
    const audioPath = path.join(folderPath, 'accompaniment.wav')// 音频路径
    const lrcPath = path.join(folderPath, `${fileName}.lrc`) // 歌词路径
    // 获取歌词
    const lyrics = getLyrics(lrcPath).filter(item => {
        return item.seconds > startSec && item.seconds < endSec
    })

    // 视频时长
    const duration = endSec - startSec

    const creator = new FFCreator({
        cacheDir: config.cacheDir,
        output: path.join(config.creator.outputDir, `${fileName}${endSec || autoCut ? '-合拍版' : ''}.mp4`),
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

    if (endSec) {
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

    // 倒计时
    const firLySec = lyrics[0].seconds
    const addCountDown = (sec = 5) => {
        for (let i = 1; i <= sec; i++) {
            const num = new FFText({
                text: ` ${i} `,
                x: width / 2,
                y: height / 2,
                fontSize: 80,
                color: '#ffffff',
                alpha: 0
            })
            // num.setBackgroundColor('#ffffff')
            num.alignCenter()
            num.addAnimate({
                from: { alpha: 0 },
                to: { alpha: 1 },
                delay: firLySec - startSec - i - 1 + 0.6,
                time: 0
            })
            num.addAnimate({
                from: { alpha: 1 },
                to: { alpha: 0 },
                delay: firLySec - startSec - i + 0.6,
                time: 0
            })
            scene.addChild(num)
        }
    }

    addCountDown()

    // 添加歌词
    const rollupIndex = Math.floor(height / lineHeight / 2)
    lyrics.forEach((item, index) => {
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
                delay: seconds - startSec,
                time: 0.5
            })
        }

        text.addAnimate({
            from: { scale: 1, alpha: 0.3 },
            to: { scale: 1.3, alpha: 1 },
            delay: item.seconds - startSec,
            time: 0.5
        })
        if (index !== lyrics.length - 1) {
            text.addAnimate({
                from: { scale: 1.3, alpha: 1 },
                to: { scale: 1, alpha: 0.3 },
                delay: lyrics[index + 1].seconds - startSec,
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


