import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { ink: "#242321", paper: "#F7F5F0", sand: "#E9E3D8", muted: "#88847D" }, fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] } } },
  plugins: []
};
export default config;
