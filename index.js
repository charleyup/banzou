const path = require('path')
const fs = require('fs')
const colors = require('colors')
const { FFScene, FFText, FFCreator}  = require('ffcreator')
const config = require('./config')
const { fontSize, lineHeight, paddingTop } = config.text
const { width, height } = config.creator
const { lyrics } = require('./getLRC.js')
const duration = lyrics[lyrics.length - 1].seconds + 5

const creator = new FFCreator({
    cacheDir: path.join(__dirname, './cache'),
    outputDir: path.join(__dirname, './output'),
    output: 'test.mp4',
    width,
    height,
    audio: path.join(__dirname, './input/gbqq.mp3')
})

const scene = new FFScene()
scene.setBgColor('#000000')

let rollupIndex = 10

lyrics.forEach((item, index) => {
    let curY = index * lineHeight + paddingTop
    const text = new FFText({
        text: item.text,
        x: 280,
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