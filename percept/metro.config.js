const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { withMonicon } = require("@monicon/metro");

const config = getDefaultConfig(__dirname);

// Mandatory: Specify the icons that will be used in the application.
// For a complete list of available icons, visit: https://icon-sets.iconify.design/ph/
const configWithMonicon = withMonicon(config, {
    icons: [
        "ph:user",
        "ph:user-fill",
        "ph:presentation",
        "ph:presentation-fill",
        "ph:calendar-check",
        "ph:calendar-check-fill",
        "ph:calendar",
        "ph:plus",
        "arcticons:robotfindskitten-alt",
        "ph:caret-right",
        "ph:caret-left",
        "ph:microphone",
        "ph:stop-fill",
        "ph:upload",
        "ph:waveform",
        "ph:github-logo-fill"
    ],
    // collections: [], // Optional: Specify the icon collections to be used.
});

module.exports = withNativeWind(configWithMonicon, { input: "./global.css" });