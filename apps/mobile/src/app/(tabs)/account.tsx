import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { Me } from "@shared/api";
import { Button, ErrorText, styles } from "@/components/ui";
import { api } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { colors } from "@/lib/theme";

export default function AccountScreen() {
  const { data: session } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    // Loads the profile through the website API, proving the signed-in session works there too.
    api<Me>("/me")
      .then((m) => active && setMe(m))
      .catch((e) => active && setError(e instanceof Error ? e.message : "Couldn't load your account."));
    return () => {
      active = false;
    };
  }, [userId]);

  if (!session) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your account</Text>
        <Text style={styles.subtitle}>
          Sign in to book classes and manage your family&apos;s sessions. It&apos;s free to join.
        </Text>
        <Button title="Join free" variant="accent" onPress={() => router.push("/sign-up")} />
        <Button title="Sign in" variant="outline" onPress={() => router.push("/sign-in")} />
      </ScrollView>
    );
  }

  const profile = me?.id === session.user.id ? me : null; // ignore a previous user's profile
  const rows: [string, string][] = [
    ["Name", profile?.name ?? session.user.name],
    ["Email", profile?.email ?? session.user.email],
    ["Account type", profile?.role ?? "…"],
    ["Time zone", profile?.timezone ?? "…"],
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Namaste, {session.user.name.split(" ")[0]}</Text>
      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
            <Text style={{ color: colors.muted }}>{label}</Text>
            <Text style={{ color: colors.text, fontWeight: "600" }}>{value}</Text>
          </View>
        ))}
      </View>
      <ErrorText>{error}</ErrorText>
      <Button title="My family" onPress={() => router.push("/family")} />
      <Button title="Sign out" variant="outline" onPress={() => void signOut()} />
    </ScrollView>
  );
}
