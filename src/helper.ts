import {Client} from 'pg';
import {config} from 'dotenv';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

// Ubicacion de ffprobe
ffmpeg.setFfprobePath("C:\\Project\\ffmpegBin\\ffprobe");
config();

// Configuración de la base de datos PostgreSQL
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432
};

// Función asincrónica para obtener un parámetro de la base de datos.
async function getValueParameter(id1: string): Promise<any> {
    const client = new Client(dbConfig); 
    await client.connect();
  
    const query = "SELECT * FROM public.parameter_values WHERE id = $1"; // Consulta SQL para obtener el valor de un parámetro.
    const values = [id1]; // Valores a sustituir en la consulta.
  
    try {
      const result = await client.query(query, values);
      const resultParameter = result.rows[0].value1; 
      return resultParameter;
    } catch (error) {
      throw error;
    } finally {
      await client.end();
    }
  }

  // Función asincrónica para procesar los valores de los parámetros.
  async function processParameterValues(value1: string, value2: string, value3: string, value4: string): Promise<void> {
    //Obtener valores de los parámetros desde la base de datos.
    const size480p = await getValueParameter(value1);
    const size720p = await getValueParameter(value2);
    const duration = await getValueParameter(value3);
    const size = await getValueParameter(value4);
  
    // Funcion para obtener informacion de los videos
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
    
    // Funcion para comprimir video, el parametro outputPath sera la resolucion dada en la db
    function comprimirVideo(videoPath: string, outputPath: string, size: string): Promise<any> {
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .output(outputPath)
          .videoCodec('libx264')
          .size(size)
          .on('error', reject)
          .on('end', resolve)
          .run();
      });
    }
    
    // Funcion para recortar video
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

    // Funcion para obtener nombre sin extension
    function obtenerNombreDelVideo(videoPath: string): string {
      const nombreBase = path.basename(videoPath); // Obtiene el nombre del archivo de la ruta completa
      const [nombre, extension] = nombreBase.split('.');
      if (extension === 'mp4') {
        return nombre;
      } else {
        return nombreBase;
      }
    }

    // Funcion para procesar video
    async function procesarVideo(
      videoPath: string,
      sizeLimit: number,
      durationLimit: number,
      resolution480p: string,
      resolution720p: string,
      outputOriginPath: string,
      output480pPath: string,
      output720pPath: string,
      counter: number
    ) {
      const info = await obtenerInformacionVideo(videoPath);
      const name = obtenerNombreDelVideo(videoPath);
      
      console.log('Información del video:');
      console.log(`Duración: ${info.duration} segundos`);
      console.log(`Tamaño: ${info.size} bytes`);
      console.log(`Resolución: ${info.resolution}`);
      console.log(`nombre: ${name}`);
    
      if (info.size > sizeLimit && info.duration > durationLimit) {
        console.log('El video excede los límites de tamaño y duración. Comprimiendo y recortando el video...');
    
        await comprimirVideo(videoPath, output480pPath + `${name}_480p.mp4`, resolution480p);
        await comprimirVideo(videoPath, output720pPath + `${name}_720p.mp4`, resolution720p);
    
        await recortarVideo(output480pPath + `${name}_480p.mp4`, output480pPath + `${name}_recorte1.mp4`, 0, info.duration / 2);
        await recortarVideo(output480pPath + `${name}_480p.mp4`, output480pPath + `${name}_recorte2.mp4`, info.duration / 2, info.duration / 2);

        await recortarVideo(output720pPath + `${name}_720p.mp4`, output720pPath + `${name}_recorte1.mp4`, 0, info.duration / 2);
        await recortarVideo(output720pPath + `${name}_720p.mp4`, output720pPath + `${name}_recorte2.mp4`, info.duration / 2, info.duration / 2);
    
        fs.unlinkSync(output480pPath + `${name}_480p.mp4`);
        fs.unlinkSync(output720pPath + `${name}_720p.mp4`);
    
        console.log('Proceso finalizado');
    
        return;
    
      } else if (info.size > sizeLimit) {
        console.log('El video excede el límite de tamaño. Comprimiendo el video...');
    
        await comprimirVideo(videoPath, output480pPath + `${name}_480p.mp4`, resolution480p);
        await comprimirVideo(videoPath, output720pPath + `${name}_720p.mp4`, resolution720p);
    
        console.log('Proceso finalizado');
    
        return;
    
      } else if (info.duration > durationLimit) {
        console.log('El video excede el límite de duración. Recortando el video...');
    
        await recortarVideo(videoPath, outputOriginPath + `${name}_recorte1.mp4`, 0, info.duration / 2);
        await recortarVideo(videoPath, outputOriginPath + `${name}_recorte2.mp4`, info.duration / 2, info.duration / 2,);
    
        console.log('Proceso finalizado');
    
        return;
      } else {
    
        console.log('El video está dentro de los límites de tamaño y duración.');
    
      }
    }
    
    // Funcion para recorrer la carpeta origen
    async function listarArchivosEnCarpeta(carpeta: string): Promise<string[]> {
        try {
          // Lee el contenido de la carpeta
          const archivos = fs.readdirSync(carpeta);
    
          // Retorna la lista de archivos
          return archivos;
        } catch (error) {
          console.error("Error al listar archivos:", error);
          return [];
        }
      }
      
      // Filtra solo los videos
      function filtrarVideos(archivos: string[]): string[] {
        return archivos.filter(
          (archivo) =>
            archivo.endsWith(".mp4") ||
            archivo.endsWith(".avi") ||
            archivo.endsWith(".mkv") ||
            archivo.endsWith(".mov") ||
            archivo.endsWith(".wmv")
        );
      }
    
      // Ruta de origen
      const carpetaEspecifica = "origen";//Parametro de Db
    
      // Obtiene la lista de archivos en la carpeta
      const archivosEnCarpeta = await listarArchivosEnCarpeta(carpetaEspecifica);
    
      // Filtra los videos de la lista de archivos
      const videosEnCarpeta = filtrarVideos(archivosEnCarpeta);

      
    
      for (let i = 0; i < videosEnCarpeta.length; i++) {
        const video = videosEnCarpeta[i];
        console.log(video);
        procesarVideo(`origen/${video}`, size * 1024 * 1024, duration, size480p, size720p, 'C:\\Project\\unionDB\\origen\\', 'C:\\Project\\unionDB\\480p\\', 'C:\\Project\\unionDB\\720p\\', i+1)
      .catch(error => {
        console.error('Error al procesar el video:', error);
      });
      }
    
    };
    
  export { getValueParameter, processParameterValues };