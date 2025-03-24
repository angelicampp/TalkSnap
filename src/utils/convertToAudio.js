import ffmpeg from 'fluent-ffmpeg';
import path from 'path'

const convertVideotoMp3 = (file) => {
  const outputPath = path.join(file.destination, `${path.basename(file.filename, path.extname(file.filename))}.mp3`)

  ffmpeg(file.path)
    .outputOptions('-vn', '-ab', '128k', '-ar', '44100')
    .toFormat('mp3')
    .save(outputPath)

  return outputPath
}

export default convertVideotoMp3;
