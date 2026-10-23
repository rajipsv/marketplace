import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSession } from "@/lib/auth-client";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  const { data: session, isPending } = useSession();
  if (isPending) return null; // splash screen stays up while the saved session loads

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: colors.primary, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Sign-in screens only exist while signed out; after signing in the user lands back on the tabs. */}
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" options={{ title: "Sign in", presentation: "modal" }} />
          <Stack.Screen name="sign-up" options={{ title: "Join free", presentation: "modal" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
