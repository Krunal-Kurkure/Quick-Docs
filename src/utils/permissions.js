import {Platform, PermissionsAndroid} from 'react-native';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';

export const ensureGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    if (Number(Platform.Version) >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
  return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
};