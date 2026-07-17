import ImagePicker from 'react-native-image-crop-picker';

const baseOptions = {
  mediaType: 'photo',
  compressImageQuality: 0.6,
  compressImageMaxWidth: 1240,
  compressImageMaxHeight: 1754,
  includeExif: false,
  freeStyleCropEnabled: false,
};

export const pickImagesFromGallery = async () => {
  const result = await ImagePicker.openPicker({
    ...baseOptions,
    maxFiles: 30,
    multiple: true,
    cropping: false,
  });

  return Array.isArray(result) ? result : [result];
};

export const pickSingleImageFromGallery = async () => {
  const result = await ImagePicker.openPicker({
    ...baseOptions,
    cropping: false,
    multiple: false,
  });

  return result ? [result] : [];
};

export const captureImageFromCamera = async () => {
  const result = await ImagePicker.openCamera({
    ...baseOptions,
    cropping: false,
  });

  return result ? [result] : [];
};
