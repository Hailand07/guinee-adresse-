import Tts from 'react-native-tts';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

// Configurer la voix en Français
Tts.setDefaultLanguage('fr-FR');

export const processSale = (cartItems) => {
  // 1. Calculer le total
  const total = cartItems.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

  // 2. Feedback Physique (Vibration)
  const options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };
  ReactNativeHapticFeedback.trigger("notificationSuccess", options);

  // 3. Synthèse Vocale : "Total 25 000 Francs"
  Tts.speak(`Le total est de ${total} Francs Guinéens`);

  return total;
};
