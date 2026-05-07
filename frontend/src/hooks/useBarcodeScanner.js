import { useState, useEffect, useCallback } from 'react';
import { initBarcodeScanner, startBarcodeScanner, stopBarcodeScanner, onDetected, cleanupScanner } from '../lib/barcode';

/**
 * Custom hook for barcode scanning functionality
 */
export const useBarcodeScanner = (options = {}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const initScanner = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await initBarcodeScanner(options);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Failed to initialize scanner: ' + err.message);
      setIsLoading(false);
      return false;
    }
  }, [options]);

  const startScan = useCallback(async () => {
    if (!isScanning) {
      try {
        startBarcodeScanner();
        setIsScanning(true);
        setError(null);
      } catch (err) {
        setError('Failed to start scanner: ' + err.message);
      }
    }
  }, [isScanning]);

  const stopScan = useCallback(() => {
    if (isScanning) {
      stopBarcodeScanner();
      setIsScanning(false);
    }
  }, [isScanning]);

  const onScanResult = useCallback((callback) => {
    onDetected((result) => {
      if (result && result.codeResult) {
        setScannedData(result.codeResult);
        callback(result.codeResult);
        // Auto-stop after successful scan if desired
        if (options.autoStop !== false) {
          stopScan();
        }
      }
    });
  }, [options, stopScan]);

  const resetScan = useCallback(() => {
    setScannedData(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      cleanupScanner();
    };
  }, []);

  return {
    isScanning,
    scannedData,
    error,
    isLoading,
    initScanner,
    startScan,
    stopScan,
    onScanResult,
    resetScan,
  };
};

export default useBarcodeScanner;
