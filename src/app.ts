import {processParameterValues} from './helper';

const value1 = 'VideoSizeS';
const value2 = 'VideoSizeM';
const value3 = 'VideoDuracDiv';
const value4 = 'VideoSizeWS';


  processParameterValues(value1, value2, value3, value4)
  .catch((error) => {
    console.error(error);
  });
  

  