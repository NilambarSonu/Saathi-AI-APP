// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude Android/iOS build output directories from the Metro file watcher.
// Without this, Metro crashes with ENOENT when Gradle deletes incremental
// build cache dirs (e.g. expo-autolinking-plugin build artifacts) mid-watch.
config.resolver = config.resolver || {};
config.resolver.blockList = [
  // Existing blockList entries (if any)
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  // Android build artifacts
  /.*\/android\/\.gradle\/.*/,
  /.*\/android\/build\/.*/,
  /.*\/android\/app\/build\/.*/,
  /.*\/node_modules\/.*\/android\/.*\/build\/.*/,
  // iOS build artifacts
  /.*\/ios\/build\/.*/,
  /.*\/ios\/Pods\/.*/,
];

module.exports = config;
