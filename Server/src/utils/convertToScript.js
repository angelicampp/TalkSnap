import ffmpeg from 'fluent-ffmpeg';
import speech from '@google-cloud/speech';
import fs from 'fs'

const client = new speech.SpeechClient();

function getSampleRate(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const sampleRate = metadata.streams[0].sample_rate; // Extrae la tasa de muestreo
      resolve(parseInt(sampleRate, 10));
    });
  });
}

function fileToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath); // Read file as buffer
  return fileBuffer.toString('base64'); // Convert buffer to Base64 string
}

async function convertToScript(filePath, lang) {
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: fileToBase64(filePath),
  };

  let langCode = ''
  if (lang === "spanish") langCode = 'es-ES'
  else if (lang === "english") langCode = 'en-US'
  else langCode = 'fr-FR'

  const config = {
    encoding: 'mp3',
    sampleRateHertz: await getSampleRate(filePath),
    languageCode: langCode
  };

  const request = {
    audio,
    config,
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);
  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  return response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
}

export default convertToScript
