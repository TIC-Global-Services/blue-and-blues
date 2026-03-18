import localFont from "next/font/local";

export const ClashDisplay = localFont({
  src: [
    {
      path: "./ClashDisplay/ClashDisplay-Extralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./ClashDisplay/ClashDisplay-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./ClashDisplay/ClashDisplay-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./ClashDisplay/ClashDisplay-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./ClashDisplay/ClashDisplay-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./ClashDisplay/ClashDisplay-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash-display",
  display: "swap",
});
