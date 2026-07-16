import ImagePicker from 'react-native-image-crop-picker';

export const cropImage = async (path, options = {}) => {
  if (!path) {
    throw new Error('Missing image path');
  }

  return ImagePicker.openCropper({
    path,
    width: options.width || 1200,
    height: options.height || 1600,
    freeStyleCropEnabled: true,
    cropperToolbarTitle: 'Crop Image',
    showCropGuidelines: true,
    showCropFrame: true,
    ...options,
  });
};
