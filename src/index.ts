import {getValueParameter} from './helper';

const id = 'PathResOrigVide';

getValueParameter(id)
  .then((result) => {
    if (result) {
      console.log('Resultado de la consulta:', result);
    } else {
      console.log('No se encontró ningún resultado.');
    }
  })
  .catch((error) => {
    console.error('Error al consultar la base de datos:', error);
  });