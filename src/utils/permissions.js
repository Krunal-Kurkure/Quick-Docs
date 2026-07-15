import {PermissionsAndroid, Platform} from 'react-native';
import {PERMISSIONS, RESULTS, request} from 'react-native-permissions';

export const ensureGalleryPermission = async () => {
  if (Platform.OS === 'ios') {
    const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
  }

  if (Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const ensureCameraPermission = async () => {
  if (Platform.OS === 'ios') {
    const result = await request(PERMISSIONS.IOS.CAMERA);
    return result === RESULTS.GRANTED;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const ensureMediaActionPermission = async action => {
  if (action === 'camera') return ensureCameraPermission();
  if (action === 'gallery') return ensureGalleryPermission();
  return true;
};