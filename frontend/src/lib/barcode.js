/**
 * Barcode scanner wrapper using QuaggaJS
 */
import Quagga from 'quagga';

export const initBarcodeScanner = (config) => {
  const defaultConfig = {
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: document.querySelector('#scanner-container'),
      constraints: {
        width: 640,
        height: 480,
        facingMode: 'environment',
      },
    },
    decoder: {
      readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader'],
    },
    locator: {
      patchSize: 'medium',
      halfSample: true,
    },
    numOfWorkers: 2,
    frequency: 10,
    ...config,
  };

  return new Promise((resolve, reject) => {
    Quagga.init(defaultConfig, (err) => {
      if (err) {
        console.error('Failed to initialize barcode scanner:', err);
        reject(err);
        return;
      }
      resolve();
    });
  });
};

export const startBarcodeScanner = () => {
  Quagga.start();
};

export const stopBarcodeScanner = () => {
  Quagga.stop();
};

export const onDetected = (callback) => {
  Quagga.onDetected(callback);
};

export const offDetected = (callback) => {
  Quagga.offDetected(callback);
};

export const decodeSingle = async (imageData) => {
  return new Promise((resolve, reject) => {
    Quagga.decodeSingle(
      {
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader'],
        },
        src: imageData,
      },
      (result) => {
        if (result && result.codeResult) {
          resolve(result.codeResult);
        } else {
          reject(new Error('No barcode detected'));
        }
      }
    );
  });
};

export const cleanupScanner = () => {
  Quagga.offDetected();
  Quagga.stop();
};

export default {
  initBarcodeScanner,
  startBarcodeScanner,
  stopBarcodeScanner,
  onDetected,
  offDetected,
  decodeSingle,
  cleanupScanner,
};
