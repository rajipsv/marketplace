import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import type { OfferingDetail } from "@shared/api";
import { coachFacts, formatInr } from "@shared/format";
import { detectTimeZone, formatIst, formatSlot } from "@shared/time";
import { Button, ErrorText, styles } from "@/components/ui";
import { useSession } from "@/lib/auth-client";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/use-api";

const formatLabel = { "one-on-one": "Private 1-on-1 video", group: "Live group session", "weekly-class": "Weekly live class" } as const;

export default function ClassScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: session } = useSession();
  const { data: o, error, loading, reload } = useApi<OfferingDetail>(`/offerings/${encodeURIComponent(slug)}`);
  const tz = detectTimeZone();

  if (!o) {
    return (
      <View style={[styles.screen, styles.content]}>
        {loading ? <ActivityIndicator color={colors.primary} /> : <ErrorText>{error ?? "Class not found."}</ErrorText>}
      </View>
    );
  }

  const cta = o.format === "one-on-one" ? "Choose a time" : o.priceInr === 0 ? "Book free" : "Book";
  const book = () => (session ? router.push(`/book/${o.slug}`) : router.push("/sign-in"));

  return (
    <>
      <Stack.Screen options={{ title: o.coach.name }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
      >
        <Text style={styles.title}>{o.title}</Text>
        <Text style={styles.subtitle}>
          with {o.coach.name} · {o.coach.title}
        </Text>

        <View style={styles.card}>
          <Text style={{ color: colors.text }}>⏱ {o.durationMin} minutes</Text>
          <Text style={{ color: colors.text }}>🎥 {formatLabel[o.format]}</Text>
          <Text style={{ color: colors.text }}>🗣 {o.languages.join(", ")}</Text>
        </View>

        {o.description ? <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{o.description}</Text> : null}

        {o.format !== "one-on-one" && (
          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Upcoming dates</Text>
            {o.upcoming.length ? (
              o.upcoming.map((s) => (
                <View key={s.id} style={styles.card}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>{formatSlot(s.startsAt, tz)}</Text>
                  <Text style={{ color: colors.muted }}>{formatIst(s.startsAt)} for your teacher</Text>
                </View>
              ))
            ) : (
              <Text style={styles.subtitle}>New dates are being scheduled. Check back soon.</Text>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>About your teacher</Text>
          <Text style={{ color: colors.muted }}>{coachFacts(o.coach, "years teaching").join(" · ")}</Text>
          {o.coachBio ? <Text style={{ color: colors.text, lineHeight: 21 }}>{o.coachBio}</Text> : null}
        </View>

        <View style={[styles.card, { gap: 12 }]}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>{formatInr(o.priceInr)}</Text>
          <Button title={session ? cta : `Join free to ${cta.toLowerCase()}`} variant="accent" onPress={book} />
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center" }}>Cancel free up to 24 hours before</Text>
        </View>
      </ScrollView>
    </>
  );
}
