import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import type { BookingItem, BookingStatus } from "@shared/api";
import { formatPaise } from "@shared/format";
import { CANCEL_CUTOFF_HOURS, detectTimeZone, formatIst, formatSlot } from "@shared/time";
import { Button, ErrorText, styles } from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { colors, radius } from "@/lib/theme";
import { useApi } from "@/lib/use-api";

const statusLabel: Record<BookingStatus, { text: string; color: string; bg: string }> = {
  confirmed: { text: "Confirmed", color: colors.success, bg: "#e7f5ec" },
  pending_payment: { text: "Reserved · payment opens soon", color: "#9a5b07", bg: "#fdf1e1" },
  cancelled: { text: "Cancelled", color: colors.muted, bg: colors.surfaceMuted },
  refunded: { text: "Refunded", color: colors.muted, bg: colors.surfaceMuted },
  completed: { text: "Completed", color: colors.muted, bg: colors.surfaceMuted },
  no_show: { text: "Missed", color: colors.muted, bg: colors.surfaceMuted },
};

export default function SessionsScreen() {
  const { data: session } = useSession();
  const { booked } = useLocalSearchParams<{ booked?: string }>();
  const bookings = useApi<BookingItem[]>(session ? "/me/bookings" : null);
  const [error, setError] = useState<string | null>(null);
  const tz = detectTimeZone();

  // Refresh whenever the tab comes into view (e.g. right after booking).
  const { reload } = bookings;
  useFocusEffect(
    useCallback(() => {
      if (session) reload();
    }, [session, reload]),
  );

  if (!session) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>My sessions</Text>
        <Text style={styles.subtitle}>Sign in to see and manage your bookings.</Text>
        <Button title="Sign in" onPress={() => router.push("/sign-in")} />
      </ScrollView>
    );
  }

  const all = bookings.data ?? [];
  const now = bookings.fetchedAt; // time the list was loaded (render must stay pure)
  const active = (s: BookingStatus) => s === "confirmed" || s === "pending_payment";
  const upcoming = all.filter((b) => active(b.status) && new Date(b.startsAt).getTime() > now).reverse();
  const past = all.filter((b) => !upcoming.includes(b));

  const cancel = (b: BookingItem) =>
    Alert.alert("Cancel this booking?", `${b.offering.title} — ${formatSlot(b.startsAt, tz)}`, [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel booking",
        style: "destructive",
        onPress: async () => {
          setError(null);
          try {
            await api(`/bookings/${b.id}/cancel`, { method: "POST" });
            bookings.reload();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't cancel. Please try again.");
          }
        },
      },
    ]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={bookings.loading} onRefresh={bookings.reload} />}
    >
      {booked && (
        <View style={[styles.card, { backgroundColor: "#e7f5ec", borderColor: "#bfe3cc" }]}>
          <Text style={{ color: colors.success, fontWeight: "700" }}>
            {booked === "confirmed" ? "You're booked!" : "Your spot is reserved!"}
          </Text>
          {booked !== "confirmed" && <Text style={{ color: colors.text }}>We&apos;ll send a payment link before the class.</Text>}
        </View>
      )}
      <ErrorText>{error ?? bookings.error}</ErrorText>

      <Text style={styles.label}>Upcoming</Text>
      {upcoming.length === 0 && !bookings.loading ? (
        <View style={[styles.card, { gap: 10 }]}>
          <Text style={styles.subtitle}>No upcoming sessions.</Text>
          <Button title="Find a class" variant="outline" onPress={() => router.navigate("/")} />
        </View>
      ) : (
        upcoming.map((b) => (
          <View key={b.id} style={[styles.card, { gap: 8 }]}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>{b.offering.title}</Text>
            <Text style={{ color: colors.muted }}>
              with {b.coach.name} · {b.offering.durationMin} min{b.attendee ? ` · for ${b.attendee.name}` : ""}
            </Text>
            <Text style={{ color: colors.text }}>{formatSlot(b.startsAt, tz)}</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{formatIst(b.startsAt)} for your teacher</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text
                style={{
                  color: statusLabel[b.status].color,
                  backgroundColor: statusLabel[b.status].bg,
                  borderRadius: radius.pill,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  fontSize: 12,
                  fontWeight: "700",
                  overflow: "hidden",
                }}
              >
                {statusLabel[b.status].text}
              </Text>
              <Text style={{ color: colors.text, fontWeight: "600" }}>{formatPaise(b.priceInrPaise)}</Text>
            </View>
            {b.canCancel ? (
              <Button title="Cancel booking" variant="outline" onPress={() => cancel(b)} />
            ) : (
              <Text style={{ color: colors.muted, fontSize: 12 }}>Can&apos;t cancel within {CANCEL_CUTOFF_HOURS} hours of the class.</Text>
            )}
          </View>
        ))
      )}

      {past.length > 0 && (
        <>
          <Text style={styles.label}>Past &amp; cancelled</Text>
          {past.map((b) => (
            <View key={b.id} style={[styles.card, { flexDirection: "row", justifyContent: "space-between", gap: 8 }]}>
              <Text style={{ color: colors.text, flex: 1 }}>
                {b.offering.title}
                {b.attendee ? ` · ${b.attendee.name}` : ""}
              </Text>
              <Text style={{ color: colors.muted }}>{active(b.status) ? "Past" : statusLabel[b.status].text}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
