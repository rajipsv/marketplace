import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import type { FamilyMember } from "@shared/api";
import { Button, ErrorText, Field, styles } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/use-api";

export default function FamilyScreen() {
  const family = useApi<FamilyMember[]>("/me/family");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const year = new Date().getFullYear();

  async function add() {
    setPending(true);
    setError(null);
    try {
      await api("/me/family", {
        method: "POST",
        body: { name: name.trim(), birthYear: birthYear ? Number(birthYear) : null, notes: notes.trim() || null },
      });
      setName("");
      setBirthYear("");
      setNotes("");
      family.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const remove = (m: FamilyMember) =>
    Alert.alert(`Remove ${m.name}?`, "Past bookings stay in your history.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/me/family/${m.id}`, { method: "DELETE" });
            family.reload();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't remove. Please try again.");
          }
        },
      },
    ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>
        Add your children so you can book classes for them. Teachers only see the first name and your notes.
      </Text>

      {(family.data ?? []).map((m) => (
        <View key={m.id} style={[styles.card, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontWeight: "700", color: colors.text }}>{m.name}</Text>
            <Text style={{ color: colors.muted }}>
              {m.birthYear ? `About ${year - m.birthYear} years old` : "Age not set"}
              {m.notes ? ` · ${m.notes}` : ""}
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => remove(m)} hitSlop={8}>
            <Text style={{ color: colors.danger, fontWeight: "600" }}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <View style={[styles.card, { gap: 12 }]}>
        <Text style={styles.label}>Add a child</Text>
        <Field label="Child's name" value={name} onChangeText={setName} maxLength={60} />
        <Field label="Birth year (optional)" value={birthYear} onChangeText={setBirthYear} keyboardType="number-pad" maxLength={4} />
        <Field label="Notes for teachers (optional)" value={notes} onChangeText={setNotes} maxLength={300} placeholder="e.g. beginner, shy at first" />
        <ErrorText>{error ?? family.error}</ErrorText>
        <Button title="Add to family" onPress={add} loading={pending} disabled={!name.trim()} />
      </View>
    </ScrollView>
  );
}
