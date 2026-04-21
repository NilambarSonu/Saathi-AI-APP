module.exports = ({ config }) => {
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    config?.ios?.config?.googleMapsApiKey ||
    config?.android?.config?.googleMaps?.apiKey ||
    '';

  return {
    ...config,
    ios: {
      ...(config.ios || {}),
      infoPlist: {
        ...((config.ios && config.ios.infoPlist) || {}),
        NSBluetoothAlwaysUsageDescription:
          'Saathi AI uses Bluetooth to scan, connect, and read soil data from your Agni device.',
        NSBluetoothPeripheralUsageDescription:
          'Saathi AI uses Bluetooth to communicate with your Agni soil sensor.',
      },
      config: {
        ...((config.ios && config.ios.config) || {}),
        googleMapsApiKey,
      },
    },
    android: {
      ...(config.android || {}),
      permissions: Array.from(
        new Set([
          ...(((config.android && config.android.permissions) || [])),
          'BLUETOOTH',
          'BLUETOOTH_ADMIN',
          'BLUETOOTH_SCAN',
          'BLUETOOTH_CONNECT',
          'ACCESS_FINE_LOCATION',
        ])
      ),
      intentFilters: [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "saathiai",
              "host": "oauth-callback"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ],
      config: {
        ...((config.android && config.android.config) || {}),
        googleMaps: {
          ...((config.android && config.android.config && config.android.config.googleMaps) || {}),
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};
