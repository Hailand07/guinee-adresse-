import FastImage from 'react-native-fast-image';

const ProductCard = ({ item }) => (
  <FastImage
    style={{ width: 150, height: 150, borderRadius: 10 }}
    source={{
      uri: item.image_url,
      priority: FastImage.priority.high, // Charge les photos en priorité
      cache: FastImage.cacheControl.immutable, // Ne recharge jamais si l'URL ne change pas
    }}
    resizeMode={FastImage.resizeMode.cover}
  />
);
