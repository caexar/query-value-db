import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

ffmpeg.setFfprobePath("C:\\Project\\ffmpegBin\\ffprobe");

function obtenerInformacionVideo(videoPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, probeData) => {
      if (err) {
        reject(err);
        return;
      }

      const duration = probeData.format.duration || 0;
      const size = fs.statSync(videoPath).size || 0;
      const streams = probeData.streams || [];
      let resolution = 'Desconocida';

      for (const stream of streams) {
        if (stream.codec_type === 'video') {
          resolution = `${stream.width}x${stream.height}`;
          break;
        }
      }

      const videoInfo = {
        duration,
        size,
        resolution,
      };

      resolve(videoInfo);
    });
  });
}

function comprimirVideo(videoPath: string, outputPath: string, size: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(outputPath)
      .videoCodec('libx264')
      .noAudio()
      .size(size)
      .on('error', reject)
      .on('end', resolve)
      .run();
  });
}

function recortarVideo(inputPath: string, outputPath: string, startTime: number, duration: number): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg({ source: inputPath })
      .setStartTime(startTime)
      .duration(duration)
      .on("error", reject)
      .on("end", resolve)
      .saveToFile(outputPath);
  });
}

async function procesarVideo(
  videoPath: string,
  sizeLimit: number,
  durationLimit: number,
  resolution480p: string,
  resolution720p: string,
  output480pPath: string,
  output720pPath: string
) {
  const info = await obtenerInformacionVideo(videoPath);

  console.log('Información del video:');
  console.log(`Duración: ${info.duration} segundos`);
  console.log(`Tamaño: ${info.size} bytes`);
  console.log(`Resolución: ${info.resolution}`);

  if (info.size > sizeLimit && info.duration > durationLimit) {
    console.log('El video excede los límites de tamaño y duración. Comprimiendo y recortando el video...');

    await comprimirVideo(videoPath, output480pPath + 'videoComprimido480p.mp4', resolution480p);
    await comprimirVideo(videoPath, output720pPath + 'videoComprimido720p.mp4', resolution720p);

    await recortarVideo(output480pPath + 'videoComprimido480p.mp4', 'videoRecortado1.mp4', 0, info.duration / 2);

    await recortarVideo(output480pPath + 'videoComprimido480p.mp4', 'videoRecortado2.mp4', info.duration / 2, info.duration / 2);

    fs.unlinkSync(output480pPath + 'videoComprimido480p.mp4');

    console.log('Proceso finalizado');

    return;

  } else if (info.size > sizeLimit) {
    console.log('El video excede el límite de tamaño. Comprimiendo el video...');

    await comprimirVideo(videoPath, output480pPath + 'videoComprimido480p.mp4', resolution480p);
    await comprimirVideo(videoPath, output720pPath + 'videoComprimido720p.mp4', resolution720p);

    console.log('Proceso finalizado');

    return;

  } else if (info.duration > durationLimit) {
    console.log('El video excede el límite de duración. Recortando el video...');

    await recortarVideo(videoPath, output480pPath + 'videoRecortado1.mp4', 0, info.duration / 2);

    await recortarVideo(videoPath, output480pPath + 'videoRecortado2.mp4', info.duration / 2, info.duration / 2);

    console.log('Proceso finalizado');

    return;
  } else {

    console.log('El video está dentro de los límites de tamaño y duración.');

  }
}

procesarVideo('videoCompleto.mp4', 100 * 1024 * 1024, 25000, '720x480', '1280x720', 'C:\\Project\\unionDB\\480p\\', 'C:\\Project\\unionDB\\720p\\')
  .catch(error => {
    console.error('Error al procesar el video:', error);
  });
