import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';

const Library = () => {
  // Pull the theme data and toggle function from our Context
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeAreaCont, { backgroundColor: theme.colors.primary }]}
      edges={['top']}
    >
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={theme.colors.primary}
      />
      <View style={[styles.MainContainer,{backgroundColor:theme.colors.background}]}>
        <View
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.headerText}>Created PDf</Text>

          <View style={styles.headerBtns}>
            <TouchableOpacity style={styles.Btn}>
              <Feather name="edit" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.Btn}>
              <Feather name="share-2" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.Btn}>
              <Feather name="trash-2" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Library;

const styles = StyleSheet.create({
  safeAreaCont: {
    flex: 1,
  },
  MainContainer: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#ffffff',
    fontSize: 18,
  },
  headerBtns: {
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  Btn: {
    padding: 3,
    borderRadius: 5,
    borderWidth: 2,
  },
});
