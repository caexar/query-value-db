import {getValueParameter, processParameterValues} from './helper';

const value1 = 'VideoSizeS';
const value2 = 'VideoSizeM';
const value3 = 'VideoDuracDiv';
const value4 = 'VideoSizeWS';

/*getValueParameter(id1)
  .then((result) => {
    if (result) {
      console.log('Resultado de la consulta:', result);
    } else {
      console.log('No se encontró ningún resultado.');
    }
  })
  .catch((error) => {
    console.error('Error al consultar la base de datos:', error);
  });*/

  processParameterValues(value1, value2, value3, value4)
  .catch((error) => {
    console.error(error);
  });
  

  