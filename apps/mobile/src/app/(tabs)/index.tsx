import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import type { Category, OfferingCard } from "@shared/api";
import { formatInr } from "@shared/format";
import { detectTimeZone, formatIst, formatSlot } from "@shared/time";
import { ErrorText, styles } from "@/components/ui";
import { api } from "@/lib/api";
import { colors, radius } from "@/lib/theme";

const formatLabel = { "one-on-one": "1-on-1 video", group: "Live group", "weekly-class": "Weekly class" } as const;
type Chip = { slug: string | null; name: string };

export default function ExploreScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [classes, setClasses] = useState<OfferingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tz = detectTimeZone();

  const fetchClasses = useCallback(
    (cat: string | null) =>
      Promise.all([api<Category[]>("/categories"), api<OfferingCard[]>(`/offerings${cat ? `?category=${cat}` : ""}`)]),
    [],
  );

  // Load whenever the category changes; state is only set when the request finishes.
  useEffect(() => {
    let active = true;
    fetchClasses(category)
      .then(([cats, list]) => {
        if (!active) return;
        setCategories(cats);
        setClasses(list);
        setError(null);
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : "Couldn't load classes."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category, fetchClasses]);

  const pickCategory = (slug: string | null) => {
    if (slug === category) return;
    setLoading(true);
    setCategory(slug);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const [cats, list] = await fetchClasses(category);
      setCategories(cats);
      setClasses(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load classes.");
    } finally {
      setLoading(false);
    }
  };

  const chips: Chip[] = [{ slug: null, name: "All" }, ...categories];

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={classes}
      keyExtractor={(o) => o.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <Text style={styles.title}>Learn from India&apos;s best trainers &amp; coaches</Text>
          <Text style={styles.subtitle}>Live classes, shown in your time zone.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {chips.map((c) => {
              const active = c.slug === category;
              return (
                <Pressable
                  key={c.slug ?? "all"}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => pickCategory(c.slug)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary : colors.surface,
                  }}
                >
                  <Text style={{ color: active ? colors.primaryText : colors.text, fontWeight: "600" }}>{c.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <ErrorText>{error}</ErrorText>
        </View>
      }
      ListEmptyComponent={loading ? undefined : <Text style={styles.subtitle}>No classes in this category yet.</Text>}
      renderItem={({ item: o }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/class/${o.slug}`)}
          style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text }}>{o.title}</Text>
          <Text style={{ color: colors.muted }}>
            {o.coach.name} · {formatLabel[o.format]} · {o.durationMin} min
          </Text>
          {o.startsAt ? (
            <Text style={{ color: colors.text }}>
              {formatSlot(o.startsAt, tz)} <Text style={{ color: colors.muted }}>({formatIst(o.startsAt)})</Text>
            </Text>
          ) : (
            <Text style={{ color: colors.text }}>Pick a time that suits you</Text>
          )}
          <Text style={{ fontSize: 17, fontWeight: "700", color: colors.primary }}>{formatInr(o.priceInr)}</Text>
        </Pressable>
      )}
    />
  );
}
