# banzou

## 提取伴奏
`
python3.8 -m spleeter separate -p spleeter:2stems -o output
`

## 合成伴奏、歌词
伴奏带歌词

sourceFolder包含accompaniment.wav音频文件和sourceFolder目录同名的lrc文件，sec为截取长度，单位秒，不传则不截取
`bash
node index.js sourceFolder sec
`

## 一键生成
.mp3及同名.lrc文件需放置于同一目录
`bash
node index.js *.mp3 sec
`

##
```bash
cd ~/charleyup/banzouba
node index.js ../../Desktop/dy/* startSec endSec
```

## ogg转mp3
```
ffmpeg -i input.ogg -c:a libmp3lame -q:a 4 output.mp3
```
