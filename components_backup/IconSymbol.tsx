// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'message.fill': 'chat',
  'info.circle.fill': 'info',
  'leaf.fill': 'eco',
  'cpu': 'memory',
  'brain.head.profile': 'psychology',
  'globe.americas': 'public',
  'person.fill': 'person',
  'person.crop.circle.fill': 'account-circle',
  'location.fill': 'location-on',
  'checkmark.circle.fill': 'check-circle',
  'antenna.radiowaves.left.and.right': 'bluetooth',
  'mic.fill': 'mic',
  'square.and.arrow.up': 'upload',
  'trash.fill': 'delete',
  'trash': 'delete-outline',
  'link': 'bluetooth',
  'play.circle': 'play-arrow',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
