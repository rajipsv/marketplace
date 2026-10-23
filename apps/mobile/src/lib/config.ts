import Constants from "expo-constants";

/** Website/API base URL. Override with EXPO_PUBLIC_API_URL (e.g. a preview deployment). */
export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "https://marketplace-ten-virid.vercel.app";

/** Must match "scheme" in app.json and siteConfig.appScheme on the server. */
export const APP_SCHEME = "gurubridge";
