import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Default link preview (WhatsApp, Facebook, iMessage…) for pages without their own image.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #fff9f0 0%, #fdf1e1 60%, #f2a33a 160%)",
          color: "#1f2937",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              background: "#f2a33a",
              color: "#2a1a05",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              fontWeight: 700,
            }}
          >
            {siteConfig.name[0]}
          </div>
          <div style={{ fontSize: 56, fontWeight: 700 }}>{siteConfig.name}</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 64, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000, color: "#134e5e" }}>
          Trainers &amp; coaches from India, live in your time zone
        </div>
        <div style={{ marginTop: 32, fontSize: 32, color: "#5b6472" }}>
          Chess · Maths · Coding · Music · Dance · Fitness · Languages
        </div>
      </div>
    ),
    size,
  );
}
