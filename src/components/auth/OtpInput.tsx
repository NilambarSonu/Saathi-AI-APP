import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { useDarkModeTheme } from '@/context/ThemeContext';
interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
}

export function OtpInput({ length = 6, value, onChange, onComplete, error }: OtpInputProps) {
  const { theme } = useDarkModeTheme();
  const inputs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Fallback array if length isn't provided
  const digits = Array(length).fill('');

  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const cleanText = text.replace(/[^0-9]/g, '');
    if (!cleanText && text !== '') return;

    let newValue = value.split('');
    
    // Handle paste
    if (cleanText.length > 1) {
      newValue = cleanText.split('').slice(0, length);
      onChange(newValue.join(''));
      
      const nextIndex = Math.min(newValue.length, length - 1);
      inputs.current[nextIndex]?.focus();
      
      if (newValue.length === length && onComplete) {
        onComplete(newValue.join(''));
      }
      return;
    }

    newValue[index] = cleanText;
    const stringValue = newValue.join('');
    onChange(stringValue);

    if (cleanText && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (stringValue.length === length && onComplete && cleanText) {
      onComplete(stringValue);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {digits.map((_, index) => {
        const isFocused = focusedIndex === index;
        return (
          <View
            key={index}
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.surface,
                borderColor: error
                  ? theme.error
                  : isFocused
                  ? theme.primary
                  : theme.border,
              },
            ]}
          >
            <TextInput
              ref={(ref) => { inputs.current[index] = ref; }}
              style={[
                styles.input,
                { color: theme.textPrimary },
              ]}
              maxLength={value.length === index ? 6 : 1} // allow paste if empty
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              value={value[index] || ''}
              onChangeText={(t) => handleChangeText(t, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              selectTextOnFocus
              selectionColor={theme.primary}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16,
  },
  inputContainer: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
  },
});
