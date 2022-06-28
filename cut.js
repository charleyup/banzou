const path = require('path')
const fs = require('fs')
const colors = require('colors')
const { FFScene, FFText, FFCreator, FFVideo}  = require('ffcreator')
const config = require('./config')
const { width, height } = config.creator

// 获取命令行音频、歌词参数
const argv = process.argv
const videopath = argv[2]
const duration = argv[3]


const creator = new FFCreator({
  cacheDir: config.cacheDir,
  output: path.join(config.creator.outputDir, `test.mp4`),
  width,
  height
})

const scene = new FFScene()

// 添加标题
const video = new FFVideo({
    path: videopath,
    x: 0,
    y: 0,
    width: width,
    height: height
});

scene.addChild(video)


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