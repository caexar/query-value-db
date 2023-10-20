#Video compression and trimming function

```
Para el funcionamiento hay que crear 3 carpetas y poner su ubicación helper/linea 221
también hay que agregar un .env y agregar la conexión de la db.

·         origen = ruta origen donde se almacenarán los videos.

·         720p = ruta donde se almacenarán los videos comprimidos en 720p.

·         480p = ruta donde se almacenarán los videos comprimidos en 420p.

*Si el video es comprimido y recortado también se almacena en la ruta respectiva de su resolución 720p o 480p, si solo es recortado entonces se guardará en la carpeta origen.


Las condiciones de comprensión y recortar son las siguientes:
1. Si supera un max de tamaño 100mb (variable en db) este se comprime en 720p y 480p
2. Si supera el max de duración 25.000(variable db corregir) este se recortará en 2 partes
3. Si supera el max de tamaño y duración pasan los 2 casos anteriores


Actualmente los parámetros parametrizados son:

·         Resolución 480p:  VideoSizeS

·         Resolución 720p: VideoSizeM

·         Tamaño de video max: VideoSizeWS

·         Duración max: VideoDuracDiv

*Futuramente se agregarán las rutas de las carpetas

```

