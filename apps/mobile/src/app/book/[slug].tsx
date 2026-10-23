import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { Availability, BookingCreated, CouponPreview, FamilyMember, OfferingDetail } from "@shared/api";
import { formatInr, formatPaise } from "@shared/format";
import { detectTimeZone, formatIst, formatSlot, formatTime, groupByDay, zoneAbbreviation } from "@shared/time";
import { Button, ErrorText, styles } from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { colors, radius } from "@/lib/theme";
import { useApi } from "@/lib/use-api";

function Chip({ label, selected, onPress, disabled }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : colors.surface,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Text style={{ color: selected ? colors.primaryText : colors.text, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

export default function BookScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: session } = useSession();
  const offering = useApi<OfferingDetail>(`/offerings/${encodeURIComponent(slug)}`);
  const availability = useApi<Availability>(`/offerings/${encodeURIComponent(slug)}/availability`);
  const family = useApi<FamilyMember[]>("/me/family");
  const tz = detectTimeZone();

  const [attendee, setAttendee] = useState<string>("self");
  const [day, setDay] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null); // ISO start (1-on-1) or session id (group)
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const a = availability.data;
  const days = useMemo(() => (a?.format === "one-on-one" ? groupByDay(a.slots, tz) : []), [a, tz]);
  const activeDay = day ?? days[0]?.key ?? null;

  const o = offering.data;
  if (!o || !a) {
    const err = offering.error ?? availability.error;
    return (
      <View style={[styles.screen, styles.content]}>
        {err ? <ErrorText>{err}</ErrorText> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  const finalPaise = coupon ? coupon.finalPaise : Math.round(o.priceInr * 100);
  const empty = a.format === "one-on-one" ? a.slots.length === 0 : a.sessions.length === 0;

  async function applyCode() {
    setCouponError(null);
    setCoupon(null);
    try {
      setCoupon(await api<CouponPreview>("/coupons/preview", { method: "POST", body: { code, offeringId: o!.id } }));
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "That code isn't valid.");
    }
  }

  async function confirm() {
    if (!pick) return;
    setPending(true);
    setError(null);
    try {
      const r = await api<BookingCreated>("/bookings", {
        method: "POST",
        body: {
          offeringId: o!.id,
          attendee,
          ...(a!.format === "one-on-one" ? { startsAt: pick } : { sessionId: pick }),
          ...(coupon ? { coupon: coupon.code } : {}),
        },
      });
      router.replace({ pathname: "/sessions", params: { booked: r.status } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't book. Please try again.");
      availability.reload(); // the time may have just been taken
      setPick(null);
    } finally {
      setPending(false);
    }
  }

  const attendees = [{ id: "self", name: `Me (${session?.user.name.split(" ")[0] ?? "me"})` }, ...(family.data ?? [])];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{o.title}</Text>
      <Text style={styles.subtitle}>
        with {o.coach.name} · {o.durationMin} min
      </Text>

      <Text style={styles.label}>1. Who is attending?</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {attendees.map((p) => (
          <Chip key={p.id} label={p.name} selected={attendee === p.id} onPress={() => setAttendee(p.id)} />
        ))}
        <Chip label="+ Add a child" selected={false} onPress={() => router.push("/family")} />
      </View>

      <Text style={styles.label}>
        2. Choose a {a.format === "one-on-one" ? "time" : "date"} ({zoneAbbreviation(tz)})
      </Text>
      {empty ? (
        <Text style={styles.subtitle}>No open {a.format === "one-on-one" ? "times" : "dates"} right now — please check back soon.</Text>
      ) : a.format === "one-on-one" ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {days.map((d) => (
              <Chip
                key={d.key}
                label={d.label}
                selected={d.key === activeDay}
                onPress={() => {
                  setDay(d.key);
                  setPick(null);
                }}
              />
            ))}
          </ScrollView>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(days.find((d) => d.key === activeDay)?.times ?? []).map((iso) => (
              <Chip key={iso} label={formatTime(iso, tz)} selected={pick === iso} onPress={() => setPick(iso)} />
            ))}
          </View>
          {pick && <Text style={{ color: colors.muted }}>That&apos;s {formatIst(pick)} for your teacher.</Text>}
        </>
      ) : (
        <View style={{ gap: 8 }}>
          {a.sessions.map((s) => (
            <Pressable
              key={s.id}
              disabled={s.seatsLeft === 0}
              onPress={() => setPick(s.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: pick === s.id, disabled: s.seatsLeft === 0 }}
              style={[styles.card, { borderColor: pick === s.id ? colors.primary : colors.border, opacity: s.seatsLeft === 0 ? 0.5 : 1 }]}
            >
              <Text style={{ color: colors.text, fontWeight: "600" }}>{formatSlot(s.startsAt, tz)}</Text>
              <Text style={{ color: colors.muted }}>
                {formatIst(s.startsAt)} for your teacher · {s.seatsLeft === 0 ? "Full" : `${s.seatsLeft} seat${s.seatsLeft === 1 ? "" : "s"} left`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {o.priceInr > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Offer code</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={code}
              onChangeText={(t) => {
                setCode(t);
                setCoupon(null);
                setCouponError(null);
              }}
              autoCapitalize="characters"
              placeholder="e.g. FIRSTCLASS"
              placeholderTextColor={colors.muted}
              style={[styles.input, { flex: 1 }]}
            />
            <Pressable
              onPress={applyCode}
              disabled={!code.trim()}
              accessibilityRole="button"
              style={{ justifyContent: "center", paddingHorizontal: 16, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ fontWeight: "700", color: colors.text }}>Apply</Text>
            </Pressable>
          </View>
          {coupon && <Text style={{ color: colors.success }}>✓ {coupon.description}</Text>}
          {couponError && <Text style={{ color: colors.danger }}>{couponError}</Text>}
        </View>
      )}

      <View style={[styles.card, { gap: 12 }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ color: colors.muted }}>Price</Text>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>
            {coupon ? (
              <Text style={{ fontSize: 15, fontWeight: "400", color: colors.muted, textDecorationLine: "line-through" }}>
                {formatInr(o.priceInr)}{" "}
              </Text>
            ) : null}
            {formatPaise(finalPaise)}
          </Text>
        </View>
        {finalPaise > 0 && (
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            Online payment is opening soon. We&apos;ll reserve your spot now and send you a payment link before the class.
          </Text>
        )}
        <ErrorText>{error}</ErrorText>
        <Button
          title={pick ? (finalPaise > 0 ? "Reserve my spot" : "Confirm booking") : `Choose a ${a.format === "one-on-one" ? "time" : "date"}`}
          variant="accent"
          onPress={confirm}
          loading={pending}
          disabled={!pick}
        />
      </View>
    </ScrollView>
  );
}
