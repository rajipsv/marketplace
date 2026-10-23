import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { Button, ErrorText, Field, styles } from "@/components/ui";
import { signIn } from "@/lib/auth-client";
import { colors } from "@/lib/theme";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    const { error } = await signIn.email({ email: email.trim(), password });
    setPending(false);
    if (error) {
      setError(error.message ?? "Couldn't sign in. Please try again.");
      return;
    }
    router.dismissAll();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome back</Text>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
        <ErrorText>{error}</ErrorText>
        <Button title="Sign in" onPress={submit} loading={pending} disabled={!email || password.length < 8} />
        <Link href="/sign-up" replace style={{ color: colors.primary, fontWeight: "600", textAlign: "center" }}>
          New here? Join free
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
