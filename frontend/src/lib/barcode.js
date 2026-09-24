/**
 * Barcode scanner wrapper using QuaggaJS.
 *
 * Quagga is a heavy dependency (~300KB), so it is lazy-loaded on first use
 * via a dynamic import and kept out of the main bundle. All exported
 * functions await the same singleton loader.
 */
let quaggaPromise = null;

const loadQuagga = () => {
  if (!quaggaPromise) {
    quaggaPromise = import('quagga').then((mod) => mod.default ?? mod);
  }
  return quaggaPromise;
};

export const initBarcodeScanner = async (config) => {
  const Quagga = await loadQuagga();
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

export const startBarcodeScanner = async () => {
  const Quagga = await loadQuagga();
  Quagga.start();
};

export const stopBarcodeScanner = async () => {
  const Quagga = await loadQuagga();
  Quagga.stop();
};

export const onDetected = async (callback) => {
  const Quagga = await loadQuagga();
  Quagga.onDetected(callback);
};

export const offDetected = async (callback) => {
  const Quagga = await loadQuagga();
  Quagga.offDetected(callback);
};

export const decodeSingle = async (imageData) => {
  const Quagga = await loadQuagga();
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

export const cleanupScanner = async () => {
  const Quagga = await loadQuagga();
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
