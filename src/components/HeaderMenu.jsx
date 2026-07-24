import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';

const HeaderMenu = ({
  isDarken,
  toggleTheme,
  handleEdit,
  handleShare,
  handleDelete,
  downloadPdf,
}) => {
  // State to manage menu visibility
  const [menuVisible, setMenuVisible] = useState(false);

  const { theme } = useTheme();

  // Helper function to execute the action AND close the menu
  const executeAction = actionFunction => {
    setMenuVisible(false); // Close menu first
    if (actionFunction) actionFunction(); // Then run the function
  };

  return (
    <View style={styles.headerContainer}>
      {/* 3-Dot Menu Button */}
      <TouchableOpacity
        style={styles.threeDotBtn}
        onPress={() => setMenuVisible(true)}
      >
        <Feather name="more-vertical" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)} // Handles hardware back button on Android
      >
        {/* Full screen overlay: clicking this closes the menu */}
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          {/* The actual dropdown card */}
          <View
            style={[
              styles.menuCard,
              { backgroundColor: theme?.colors?.card || '#fff' },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => executeAction(toggleTheme)}
            >
              <Feather
                name={isDarken ? 'sun' : 'moon'}
                size={20}
                color={theme.colors.text}
              />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                {isDarken ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => executeAction(handleEdit)}
            >
              <Feather name="edit" size={20} color={theme.colors.text} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => executeAction(downloadPdf)}
            >
              <Feather name="download" size={20} color={theme.colors.text} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Download
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => executeAction(handleShare)}
            >
              <Feather name="share-2" size={20} color={theme.colors.text} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => executeAction(handleDelete)}
            >
              <Feather name="trash-2" size={20} color="#FF3B30" />
              <Text style={[styles.menuText, { color: '#FF3B30' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default HeaderMenu;
const styles = StyleSheet.create({
  headerContainer: {
    // Keeps the 3-dot icon in place within your header
    zIndex: 1,
  },
  threeDotBtn: {
    padding: 3,
  },

  // Modal Overlay Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)', // Invisible overlay to catch clicks
  },

  // Dropdown Card Styles
  menuCard: {
    position: 'absolute',
    top: 58, // Adjust this based on your header height
    right: 15, // Distance from the right side of the screen
    borderRadius: 10,
    paddingVertical: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },

  // Individual Button Styles inside the card
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '400',
  },
});
