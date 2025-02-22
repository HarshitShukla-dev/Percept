import { getDefaultConfig } from "expo/metro-config";
import { withNativeWind } from "nativewind/metro";
import { withMonicon } from "@monicon/metro";

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
    ],
    // collections: [], // Optional: Specify the icon collections to be used.
});

export default withNativeWind(configWithMonicon, { input: "./global.css" });