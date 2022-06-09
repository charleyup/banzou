const path = require('path')
const fs = require('fs')
const colors = require('colors')
const { FFScene, FFText, FFCreator}  = require('ffcreator')
const config = require('./config')
const { fontSize, lineHeight, paddingTop } = config.text
const { width, height } = config.creator
const { getLyrics } = require('./getLRC.js')

// 获取命令行音频、歌词参数
const argv = process.argv
const audioPath = argv[2]
const lrcPath = argv[3]
// const fileName = path.basename(audioPath).split('.')?.[0]
// const fileName = path.basename(lrcPath).split('.')?.[0]
const fileName = path.basename(lrcPath, '.lrc')

const lyrics = getLyrics(lrcPath)

const duration = lyrics[lyrics.length - 1].seconds + 5

const creator = new FFCreator({
  cacheDir: config.cacheDir,
  output: path.join(config.creator.outputDir, `${fileName}.mp4`),
  width,
  height,
  audio: path.resolve(audioPath)
})

const scene = new FFScene()
scene.setBgColor('#000000')

// 添加标题
const title = new FFText({
  text: `《${fileName}》`,
  x: width / 2,
  y: height / 2,
  fontSize: 54,
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

  creator.on('complete', e => {
    console.log(
      colors.magenta(`FFCreator completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `),
    );
  });