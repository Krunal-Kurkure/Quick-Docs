import ImagePicker from 'react-native-image-crop-picker';

export const cropImage = async (path, options = {}) => {
  if (!path) {
    throw new Error('Missing image path');
  }

  return ImagePicker.openCropper({
    path,
    width: options.width || 1240,
    height: options.height || 1754,
    freeStyleCropEnabled: true,
    cropperToolbarTitle: 'Crop Image',
    showCropGuidelines: true,
    showCropFrame: true,
    ...options,
  });
};
