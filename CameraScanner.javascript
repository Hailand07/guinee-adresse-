/**
 * Gère l'accès à la caméra et le scan via le navigateur.
 */
export const CameraScanner = {
    stream: null,

    /**
     * Démarre le flux vidéo dans un élément <video>
     * @param {string} videoElementId - L'ID de la balise <video> dans ton HTML
     */
    async startCamera(videoElementId) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } // Utilise la caméra arrière
            });
            const video = document.getElementById(videoElementId);
            video.srcObject = this.stream;
            video.play();
        } catch (err) {
            console.error("Erreur caméra : ", err);
            alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
        }
    },

    /**
     * Prend une photo (capture d'écran du flux vidéo) pour l'OCR
     * @param {string} videoElementId 
     * @returns {string} - L'image en format Base64
     */
    takePhoto(videoElementId) {
        const video = document.getElementById(videoElementId);
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        return canvas.toDataURL('image/png');
    },

    /**
     * Active le scanner de code-barres (QR / EAN-13)
     * @param {string} containerId - L'ID de la div qui affichera le scanner
     * @param {Function} onScan - Fonction appelée quand un code est trouvé
     */
    startBarcodeScanner(containerId, onScan) {
        const html5QrCode = new Html5Qrcode(containerId);
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: "environment" }, 
            config,
            (decodedText) => {
                onScan(decodedText);
                html5QrCode.stop(); // On arrête après avoir trouvé
            }
        ).catch(err => console.error("Erreur scanner : ", err));
    },

    /**
     * Arrête la caméra pour économiser la batterie
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
};
