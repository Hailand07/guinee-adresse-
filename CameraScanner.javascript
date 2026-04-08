import React from 'react';
import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';

export const CameraScanner = ({ mode, onScan }) => {
  const devices = useCameraDevices();
  const device = devices.back;

  // Configuration du scanner de code-barres
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'qr'],
    onCodeScanned: (codes) => {
      if (mode === 'barcode') onScan(codes[0].value);
    }
  });

  if (device == null) return <Text>Chargement de la caméra...</Text>;

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      codeScanner={mode === 'barcode' ? codeScanner : undefined}
      photo={true} // Permet de prendre une photo pour l'OCR
    />
  );
};

