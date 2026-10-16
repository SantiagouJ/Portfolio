import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#161616",
          color: "#f1f0eb",
          fontSize: 86,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        SJ
      </div>
    ),
    { ...size },
  );
}
