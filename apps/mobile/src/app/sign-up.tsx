import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { detectTimeZone } from "@shared/time";
import { Button, ErrorText, Field, styles } from "@/components/ui";
import { signUp } from "@/lib/auth-client";
import { colors } from "@/lib/theme";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    const { error } = await signUp.email({ name: name.trim(), email: email.trim(), password, timezone: detectTimeZone() });
    setPending(false);
    if (error) {
      setError(error.message ?? "Couldn't create your account. Please try again.");
      return;
    }
    router.dismissAll();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Join free</Text>
        <Text style={styles.subtitle}>Create your family account. You only pay when you book a class.</Text>
        <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Field
          label="Password (8+ characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        <ErrorText>{error}</ErrorText>
        <Button
          title="Create account"
          variant="accent"
          onPress={submit}
          loading={pending}
          disabled={!name || !email || password.length < 8}
        />
        <Link href="/sign-in" replace style={{ color: colors.primary, fontWeight: "600", textAlign: "center" }}>
          Already have an account? Sign in
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
