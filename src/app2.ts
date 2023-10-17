function obtenerNombreSinExtension(nombreVideo: string): string {
    const [nombreBase, extension] = nombreVideo.split('.');
    if (extension === 'mp4') {
        return nombreBase;
    } else {
        return nombreVideo;
    }
}

// Ejemplo de uso
const nombreDelVideo = 'video1.mp4';
const nombreSinExtension = obtenerNombreSinExtension(nombreDelVideo);
console.log(nombreSinExtension);  // Esto imprimirá 'video1'
