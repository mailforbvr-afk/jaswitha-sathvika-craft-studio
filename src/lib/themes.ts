export const THEME_IDS = [
  "pink-dream",
  "rainbow-fun",
  "garden-bloom",
  "butterfly-magic",
  "candy-pop",
  "ocean-dream",
  "sunny-craft",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME_ID: ThemeId = "pink-dream";

export type ThemeDefinition = {
  id: ThemeId;
  emoji: string;
  name: string;
  description: string;
  decorations: string[];
  preview: string[];
  vars: Record<string, string>;
};

function themeVars(colors: {
  cream: string;
  creamDark: string;
  ink: string;
  inkSoft: string;
  petal: string;
  pinkDeep: string;
  lilac: string;
  purpleDeep: string;
  cloud: string;
  mint: string;
  sun: string;
  card: string;
  cardBorder: string;
  shadow: string;
  shadowHover: string;
  radius: string;
  spot1: string;
  spot2: string;
  spot3: string;
  spot4: string;
  spot5: string;
  cats: [string, string, string, string, string, string, string, string, string, string, string, string];
}): Record<string, string> {
  return {
    "--color-cream": colors.cream,
    "--color-cream-dark": colors.creamDark,
    "--color-ink": colors.ink,
    "--color-ink-soft": colors.inkSoft,
    "--color-petal": colors.petal,
    "--color-pink-deep": colors.pinkDeep,
    "--color-lilac": colors.lilac,
    "--color-purple-deep": colors.purpleDeep,
    "--color-cloud": colors.cloud,
    "--color-mint": colors.mint,
    "--color-sun": colors.sun,
    "--color-card": colors.card,
    "--color-card-border": colors.cardBorder,
    "--shadow-card": colors.shadow,
    "--shadow-card-hover": colors.shadowHover,
    "--shadow-soft": colors.shadow,
    "--radius-card": colors.radius,
    "--theme-spot-1": colors.spot1,
    "--theme-spot-2": colors.spot2,
    "--theme-spot-3": colors.spot3,
    "--theme-spot-4": colors.spot4,
    "--theme-spot-5": colors.spot5,
    "--theme-cat-1-from": colors.cats[0],
    "--theme-cat-1-to": colors.cats[1],
    "--theme-cat-2-from": colors.cats[2],
    "--theme-cat-2-to": colors.cats[3],
    "--theme-cat-3-from": colors.cats[4],
    "--theme-cat-3-to": colors.cats[5],
    "--theme-cat-4-from": colors.cats[6],
    "--theme-cat-4-to": colors.cats[7],
    "--theme-cat-5-from": colors.cats[8],
    "--theme-cat-5-to": colors.cats[9],
    "--theme-cat-6-from": colors.cats[10],
    "--theme-cat-6-to": colors.cats[11],
  };
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  "pink-dream": {
    id: "pink-dream",
    emoji: "🎀",
    name: "Pink Dream",
    description: "Pastel pink and lavender with bows, hearts, flowers and sparkles.",
    decorations: ["🎀", "✨", "🦋", "🌸", "💕", "🌿", "🌈", "⭐"],
    preview: ["#f6c2d4", "#ead6f8", "#e45d96", "#6b3fa0"],
    vars: themeVars({
      cream: "#fff5f7",
      creamDark: "#fbe3ec",
      ink: "#4a2d62",
      inkSoft: "#6a5478",
      petal: "#f6c2d4",
      pinkDeep: "#e45d96",
      lilac: "#ead6f8",
      purpleDeep: "#6b3fa0",
      cloud: "#e7f3fb",
      mint: "#e4f6ee",
      sun: "#ffe9b8",
      card: "#ffffff",
      cardBorder: "rgba(228, 93, 150, 0.16)",
      shadow: "0 16px 36px rgba(107, 63, 160, 0.11)",
      shadowHover: "0 20px 40px rgba(107, 63, 160, 0.15)",
      radius: "1.85rem",
      spot1: "rgba(246, 194, 212, 0.62)",
      spot2: "rgba(234, 214, 248, 0.48)",
      spot3: "rgba(255, 255, 255, 0.7)",
      spot4: "rgba(234, 214, 248, 0.28)",
      spot5: "rgba(255, 233, 184, 0.16)",
      cats: [
        "#ffd6e5", "#ffc2d8",
        "#ead9ff", "#d9c4fb",
        "#d8f1ff", "#c4e6fb",
        "#d8f8e8", "#c3efd6",
        "#ffe9c2", "#ffd89a",
        "#ffe0f0", "#f3d4ff",
      ],
    }),
  },
  "rainbow-fun": {
    id: "rainbow-fun",
    emoji: "🌈",
    name: "Rainbow Fun",
    description: "Soft pastel rainbow colors with playful shapes.",
    decorations: ["🌈", "✨", "🎀", "🎨", "⭐", "💗"],
    preview: ["#ffd1dc", "#ffe8a3", "#c4f0d8", "#bfe4f7"],
    vars: themeVars({
      cream: "#fff9f4",
      creamDark: "#ffe8dc",
      ink: "#45324d",
      inkSoft: "#6a5470",
      petal: "#ffd1dc",
      pinkDeep: "#d96b9a",
      lilac: "#d7c4f5",
      purpleDeep: "#7f73c4",
      cloud: "#bfe4f7",
      mint: "#c4f0d8",
      sun: "#ffe8a3",
      card: "#ffffff",
      cardBorder: "rgba(255, 209, 220, 0.55)",
      shadow: "0 14px 32px rgba(180, 110, 150, 0.12)",
      shadowHover: "0 18px 36px rgba(180, 110, 150, 0.16)",
      radius: "1.75rem",
      spot1: "rgba(255, 209, 220, 0.5)",
      spot2: "rgba(215, 196, 245, 0.45)",
      spot3: "rgba(191, 228, 247, 0.42)",
      spot4: "rgba(196, 240, 216, 0.38)",
      spot5: "rgba(255, 232, 163, 0.28)",
      cats: [
        "#ffd6e0", "#ffc2d4",
        "#ffe7b0", "#ffe08a",
        "#c8f3dc", "#aee9c8",
        "#c5e9fb", "#a9dbf5",
        "#ddd0f8", "#cbbaf2",
        "#ffd9c8", "#ffc8ae",
      ],
    }),
  },
  "garden-bloom": {
    id: "garden-bloom",
    emoji: "🌸",
    name: "Garden Bloom",
    description: "Soft pink, green and cream with floral styling.",
    decorations: ["🌸", "🌿", "🌷", "✨", "🍃", "🌼"],
    preview: ["#f5cfd8", "#d4ead6", "#c86b84", "#eaf3e4"],
    vars: themeVars({
      cream: "#fbf8f1",
      creamDark: "#efe4d4",
      ink: "#3f4a3c",
      inkSoft: "#5d6a58",
      petal: "#f5cfd8",
      pinkDeep: "#c86b84",
      lilac: "#e4edd8",
      purpleDeep: "#6f8f64",
      cloud: "#eaf3e4",
      mint: "#d4ead6",
      sun: "#f3e6b8",
      card: "#fffdf8",
      cardBorder: "rgba(212, 234, 214, 0.7)",
      shadow: "0 14px 32px rgba(120, 140, 110, 0.12)",
      shadowHover: "0 18px 36px rgba(120, 140, 110, 0.16)",
      radius: "1.8rem",
      spot1: "rgba(245, 207, 216, 0.5)",
      spot2: "rgba(212, 234, 214, 0.48)",
      spot3: "rgba(234, 243, 228, 0.45)",
      spot4: "rgba(243, 230, 184, 0.3)",
      spot5: "rgba(228, 237, 216, 0.35)",
      cats: [
        "#f8d7e0", "#f0c2ce",
        "#dcefdc", "#c5e3c8",
        "#f4e7c4", "#ead7a4",
        "#e7f3de", "#d3e6c8",
        "#f3d8c8", "#e8c4b0",
        "#e4f0e8", "#cfe3d4",
      ],
    }),
  },
  "butterfly-magic": {
    id: "butterfly-magic",
    emoji: "🦋",
    name: "Butterfly Magic",
    description: "Lavender, sky blue and pastel pink with butterflies and sparkles.",
    decorations: ["🦋", "✨", "💜", "🌸", "⭐", "💫"],
    preview: ["#d5c8f8", "#cde7fb", "#c084c4", "#f3d0e8"],
    vars: themeVars({
      cream: "#f7f4ff",
      creamDark: "#e4dcf8",
      ink: "#3d3558",
      inkSoft: "#5d5478",
      petal: "#f3d0e8",
      pinkDeep: "#b56db8",
      lilac: "#d5c8f8",
      purpleDeep: "#7c6bc4",
      cloud: "#cde7fb",
      mint: "#e4d9ff",
      sun: "#efe4ff",
      card: "#ffffff",
      cardBorder: "rgba(213, 200, 248, 0.6)",
      shadow: "0 14px 32px rgba(124, 107, 196, 0.14)",
      shadowHover: "0 18px 36px rgba(124, 107, 196, 0.18)",
      radius: "1.85rem",
      spot1: "rgba(213, 200, 248, 0.5)",
      spot2: "rgba(243, 208, 232, 0.42)",
      spot3: "rgba(205, 231, 251, 0.45)",
      spot4: "rgba(228, 217, 255, 0.4)",
      spot5: "rgba(181, 109, 184, 0.12)",
      cats: [
        "#e3d8fc", "#d0c0f6",
        "#f7d7ec", "#ecc0de",
        "#d5edfb", "#bde0f6",
        "#ebe3ff", "#d9ccfa",
        "#f3e0f8", "#e4c8ef",
        "#e8f4ff", "#d2e8fb",
      ],
    }),
  },
  "candy-pop": {
    id: "candy-pop",
    emoji: "🍭",
    name: "Candy Pop",
    description: "Pastel pink, mint and yellow with playful candy-inspired styling.",
    decorations: ["🍭", "✨", "🍬", "🎀", "💗", "⭐"],
    preview: ["#ffd4e5", "#c8f5de", "#fff0a8", "#e06b9a"],
    vars: themeVars({
      cream: "#fff8fb",
      creamDark: "#ffe4ef",
      ink: "#5a3a4a",
      inkSoft: "#7a5866",
      petal: "#ffd4e5",
      pinkDeep: "#e06b9a",
      lilac: "#ffe4f0",
      purpleDeep: "#5eb88a",
      cloud: "#fff6c9",
      mint: "#c8f5de",
      sun: "#fff0a8",
      card: "#ffffff",
      cardBorder: "rgba(255, 212, 229, 0.65)",
      shadow: "0 14px 32px rgba(224, 107, 154, 0.12)",
      shadowHover: "0 18px 36px rgba(224, 107, 154, 0.16)",
      radius: "1.9rem",
      spot1: "rgba(255, 212, 229, 0.5)",
      spot2: "rgba(200, 245, 222, 0.42)",
      spot3: "rgba(255, 240, 168, 0.4)",
      spot4: "rgba(255, 228, 240, 0.4)",
      spot5: "rgba(94, 184, 138, 0.12)",
      cats: [
        "#ffdce9", "#ffc5db",
        "#d4f8e6", "#b7efd2",
        "#fff4b8", "#ffe98a",
        "#ffe8f2", "#ffd2e4",
        "#e4fbe8", "#c8f0d4",
        "#fff0d0", "#ffe0a8",
      ],
    }),
  },
  "ocean-dream": {
    id: "ocean-dream",
    emoji: "🌊",
    name: "Ocean Dream",
    description: "Soft aqua, sky blue and cream with subtle ocean-inspired styling.",
    decorations: ["🌊", "✨", "🐚", "🫧", "⭐", "💙"],
    preview: ["#c5ebe8", "#b8e4f0", "#3d9bb8", "#f4fbfc"],
    vars: themeVars({
      cream: "#f4fbfc",
      creamDark: "#d8f0f4",
      ink: "#2c4a55",
      inkSoft: "#4d6a74",
      petal: "#c5ebe8",
      pinkDeep: "#3d9bb8",
      lilac: "#cfe8f7",
      purpleDeep: "#4a8fb8",
      cloud: "#b8e4f0",
      mint: "#c8f0ea",
      sun: "#e8f4c8",
      card: "#ffffff",
      cardBorder: "rgba(184, 228, 240, 0.7)",
      shadow: "0 14px 32px rgba(61, 155, 184, 0.12)",
      shadowHover: "0 18px 36px rgba(61, 155, 184, 0.16)",
      radius: "1.7rem",
      spot1: "rgba(197, 235, 232, 0.5)",
      spot2: "rgba(184, 228, 240, 0.45)",
      spot3: "rgba(207, 232, 247, 0.4)",
      spot4: "rgba(232, 244, 200, 0.28)",
      spot5: "rgba(200, 240, 234, 0.35)",
      cats: [
        "#d4f3f0", "#b7e8e4",
        "#d2eef8", "#b5e0f2",
        "#eaf6d4", "#d8eeb0",
        "#cfeaf2", "#b4dce8",
        "#e4f7f4", "#c8ebe6",
        "#e8f3fb", "#cfe6f4",
      ],
    }),
  },
  "sunny-craft": {
    id: "sunny-craft",
    emoji: "🌼",
    name: "Sunny Craft",
    description: "Soft yellow, orange and cream with cheerful handmade styling.",
    decorations: ["🌼", "☀️", "✨", "🧡", "⭐", "🌻"],
    preview: ["#ffe0b8", "#ffe08a", "#e89a4a", "#fffaf0"],
    vars: themeVars({
      cream: "#fffaf0",
      creamDark: "#ffe8c8",
      ink: "#5a3e28",
      inkSoft: "#7a5c42",
      petal: "#ffe0b8",
      pinkDeep: "#e89a4a",
      lilac: "#ffe9c4",
      purpleDeep: "#d4813a",
      cloud: "#fff3d0",
      mint: "#f5e6c8",
      sun: "#ffe08a",
      card: "#fffdf8",
      cardBorder: "rgba(255, 224, 184, 0.75)",
      shadow: "0 14px 32px rgba(232, 154, 74, 0.14)",
      shadowHover: "0 18px 36px rgba(232, 154, 74, 0.18)",
      radius: "1.75rem",
      spot1: "rgba(255, 224, 184, 0.5)",
      spot2: "rgba(255, 224, 138, 0.4)",
      spot3: "rgba(255, 243, 208, 0.45)",
      spot4: "rgba(245, 230, 200, 0.35)",
      spot5: "rgba(232, 154, 74, 0.12)",
      cats: [
        "#ffe7c4", "#ffd49a",
        "#fff0b0", "#ffe07a",
        "#f8e0c8", "#f0c8a0",
        "#ffe8d0", "#ffd4a8",
        "#fff6d8", "#ffe9a8",
        "#f6e6c8", "#ead2a8",
      ],
    }),
  },
};

export const THEME_LIST: ThemeDefinition[] = THEME_IDS.map((id) => THEMES[id]);

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

export function resolveThemeId(value: string | null | undefined): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME_ID;
}

export function themeCssVars(value: string | null | undefined): Record<string, string> {
  return THEMES[resolveThemeId(value)].vars;
}

export function getTheme(value: string | null | undefined): ThemeDefinition {
  return THEMES[resolveThemeId(value)];
}
