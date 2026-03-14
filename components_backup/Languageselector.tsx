import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, FlatList } from 'react-native';
import { useLanguage, Language } from '../app/context/LanguageContext';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

export default function LanguageDropdown() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const colorScheme = useColorScheme();
  
  const languages: Language[] = ['English', 'Odia', 'Hindi'];

  const setCurrentLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsDropdownOpen(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          {
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].primary,
          }
        ]}
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <ThemedText 
          style={styles.dropdownButtonText}
          lightColor={Colors['light'].text}
          darkColor={Colors['dark'].text}
        >
          {currentLanguage}
        </ThemedText>
        <ThemedText 
          style={styles.dropdownArrow}
          lightColor={Colors.light.text}
          darkColor={Colors.dark.text}
        >
          {isDropdownOpen ? '▲' : '▼'}
        </ThemedText>
      </TouchableOpacity>

      {/* Dropdown Menu */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            <ThemedView 
              style={styles.dropdownMenu}
            >
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: Colors[colorScheme].primary },
                    currentLanguage === lang && { 
                      backgroundColor: Colors[colorScheme].tint + '20',
                    }
                  ]}
                  onPress={() => setCurrentLanguage(lang)}
                >
                  <ThemedText 
                    style={styles.dropdownItemText}
                    lightColor={currentLanguage === lang ? Colors.light.tint : Colors.light.text}
                    darkColor={currentLanguage === lang ? Colors.dark.tint : Colors.dark.text}
                  >
                    {lang}
                  </ThemedText>
                  {currentLanguage === lang && (
                    <ThemedText 
                      style={styles.checkmark}
                      lightColor={Colors.light.tint}
                      darkColor={Colors.dark.tint}
                    >
                      ✓
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    padding: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxWidth: 300,
  },
  dropdownMenu: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});