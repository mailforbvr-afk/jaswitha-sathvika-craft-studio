import { PRODUCT_IMAGE_BUCKET } from "@/lib/config";
import { deleteProductImage } from "@/lib/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const CATALOGUE_SIZE = 1080;

const COLORS = {
  cream: "#fff5f7",
  creamDark: "#fbe3ec",
  ink: "#4a2d62",
  inkSoft: "#6a5478",
  petal: "#f6c2d4",
  pink: "#e45d96",
  pinkSoft: "#f48fb1",
  lilac: "#ead6f8",
  purple: "#6b3fa0",
  mint: "#c8efd8",
  mintDeep: "#7dcca0",
  cloud: "#d8eefb",
  sun: "#ffe9b8",
  peach: "#ffd8c2",
  white: "#ffffff",
};

const BRAND_LETTER_COLORS = [
  "#7ec8e3",
  "#8fcead",
  "#ffd166",
  "#f4a261",
  "#7ec8e3",
  "#6ec6ff",
  "#c77dff",
  "#e45d96",
  "#ffd166",
  "#9b7edc",
];

export type CatalogueKind = "bracelets" | "flowers" | "bouquets" | "keychains" | "magnets" | "other";

export type CatalogueImageInput = {
  source: File | string;
  productName: string;
  priceLabel: string | null;
  categorySlug?: string;
  categoryName?: string;
};

type FittedPhoto = {
  x: number;
  y: number;
  width: number;
  height: number;
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
};

export function catalogueKindFromCategory(slug?: string, name?: string): CatalogueKind {
  const haystack = `${slug ?? ""} ${name ?? ""}`.toLowerCase();
  if (haystack.includes("bracelet")) return "bracelets";
  if (haystack.includes("bouquet")) return "bouquets";
  if (haystack.includes("flower")) return "flowers";
  if (haystack.includes("key")) return "keychains";
  if (haystack.includes("magnet")) return "magnets";
  return "other";
}

async function loadImageSource(source: File | string): Promise<HTMLImageElement> {
  const image = new Image();
  const objectUrl = typeof source === "string" ? null : URL.createObjectURL(source);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read that product photo."));
      if (typeof source === "string") {
        image.crossOrigin = "anonymous";
        image.src = source;
      } else {
        image.src = objectUrl as string;
      }
    });
    return image;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function displayFont(): string {
  if (typeof document === "undefined") return "Fredoka, sans-serif";
  const value = getComputedStyle(document.body).getPropertyValue("--font-fredoka").trim();
  return value || "Fredoka, sans-serif";
}

function bodyFont(): string {
  if (typeof document === "undefined") return "Nunito, sans-serif";
  const value = getComputedStyle(document.body).getPropertyValue("--font-nunito").trim();
  return value || "Nunito, sans-serif";
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 2): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && context.measureText(next).width > maxWidth) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function fitProductPhoto(image: HTMLImageElement, kind: CatalogueKind): FittedPhoto {
  const header = 168;
  const footer = 248;
  const frameLeft = 168;
  const frameRight = 915;
  const pad = 28;
  const availableFrameW = frameRight - frameLeft;
  const availableH = CATALOGUE_SIZE - header - footer;
  const maxImageW = availableFrameW - pad * 2;
  const maxImageH = availableH - pad * 2;
  const naturalW = Math.max(1, image.naturalWidth);
  const naturalH = Math.max(1, image.naturalHeight);
  const aspect = naturalW / naturalH;
  let targetW: number;
  let targetH: number;

  if (aspect > 1.12) {
    targetW = Math.min(maxImageW, kind === "bouquets" ? 760 : 720);
    targetH = targetW / aspect;
    if (targetH > maxImageH) {
      targetH = maxImageH;
      targetW = targetH * aspect;
    }
  } else if (aspect < 0.88) {
    targetH = Math.min(maxImageH, kind === "bouquets" ? 680 : 640);
    targetW = targetH * aspect;
    if (targetW > maxImageW) {
      targetW = maxImageW;
      targetH = targetW / aspect;
    }
  } else {
    const size = Math.min(maxImageW, maxImageH, 680);
    targetW = size;
    targetH = size;
  }

  const frameW = targetW + pad * 2;
  const frameH = targetH + pad * 2;
  const frameX = (CATALOGUE_SIZE - frameW) / 2;
  const frameY = header + (availableH - frameH) / 2;

  return {
    x: frameX + pad,
    y: frameY + pad,
    width: targetW,
    height: targetH,
    frameX,
    frameY,
    frameW,
    frameH,
  };
}

function drawBlob(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation: number,
  color: string,
) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.beginPath();
  context.fillStyle = color;
  context.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawDot(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function drawCloud(context: CanvasRenderingContext2D, x: number, y: number, size: number, fill = COLORS.white) {
  context.fillStyle = fill;
  context.beginPath();
  context.arc(x - size * 0.48, y + size * 0.08, size * 0.42, 0, Math.PI * 2);
  context.arc(x, y - size * 0.18, size * 0.52, 0, Math.PI * 2);
  context.arc(x + size * 0.5, y + size * 0.04, size * 0.4, 0, Math.PI * 2);
  context.arc(x, y + size * 0.16, size * 0.5, 0, Math.PI * 2);
  context.fill();
}

function drawRainbow(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const bands = ["#f48fb1", "#ffd166", "#8fcead", "#7ec8e3", "#c77dff"];
  bands.forEach((color, index) => {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 11;
    context.lineCap = "round";
    context.arc(cx, cy, radius - index * 13, Math.PI, 0, false);
    context.stroke();
  });
  drawCloud(context, cx - radius + 8, cy + 6, 28);
  drawCloud(context, cx + radius - 8, cy + 6, 28);
}

function drawHeart(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, size * 0.3);
  context.bezierCurveTo(0, size * -0.15, -size, size * -0.15, -size, size * 0.3);
  context.bezierCurveTo(-size, size * 0.72, 0, size * 1.05, 0, size * 1.22);
  context.bezierCurveTo(0, size * 1.05, size, size * 0.72, size, size * 0.3);
  context.bezierCurveTo(size, size * -0.15, 0, size * -0.15, 0, size * 0.3);
  context.closePath();
  context.fill();
  context.restore();
}

function drawSparkle(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, -size);
  context.quadraticCurveTo(size * 0.14, 0, 0, size);
  context.quadraticCurveTo(-size * 0.14, 0, 0, -size);
  context.fill();
  context.beginPath();
  context.moveTo(-size, 0);
  context.quadraticCurveTo(0, size * 0.14, size, 0);
  context.quadraticCurveTo(0, -size * 0.14, -size, 0);
  context.fill();
  context.restore();
}

function drawStar(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const inner = angle + Math.PI / 5;
    context.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    context.lineTo(Math.cos(inner) * size * 0.42, Math.sin(inner) * size * 0.42);
  }
  context.closePath();
  context.fill();
  context.restore();
}

function drawFlower(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  petal: string,
  center: string,
) {
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    drawDot(context, x + Math.cos(angle) * size * 0.58, y + Math.sin(angle) * size * 0.58, size * 0.4, petal);
  }
  drawDot(context, x, y, size * 0.28, center);
}

function drawLeaf(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(0, 0, size * 0.38, size, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(90, 140, 110, 0.35)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(0, -size * 0.85);
  context.lineTo(0, size * 0.85);
  context.stroke();
  context.restore();
}

function drawStemBouquet(context: CanvasRenderingContext2D, x: number, y: number, flip: boolean) {
  const dir = flip ? -1 : 1;
  context.save();
  context.strokeStyle = "#8fcead";
  context.lineWidth = 5;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(x, y + 90);
  context.quadraticCurveTo(x + dir * 20, y + 30, x + dir * 8, y - 40);
  context.stroke();
  drawLeaf(context, x + dir * 28, y + 18, 22, dir * 0.8, "#b7e4c7");
  drawLeaf(context, x - dir * 18, y - 6, 18, -dir * 1.1, "#8fcead");
  drawFlower(context, x + dir * 6, y - 58, 16, "#f7b6d2", "#ffe08a");
  drawFlower(context, x + dir * 34, y - 28, 13, "#e45d96", "#fff4c2");
  context.restore();
}

function drawBead(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  drawDot(context, x, y, radius, color);
  drawDot(context, x - radius * 0.28, y - radius * 0.28, radius * 0.22, "rgba(255,255,255,0.65)");
}

function drawDashedRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  context.save();
  context.setLineDash([10, 8]);
  context.strokeStyle = color;
  context.lineWidth = 2.5;
  roundRect(context, x, y, width, height, radius);
  context.stroke();
  context.restore();
}

function drawCircleBadge(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  fill: string,
  stroke: string,
  icon: string,
  line1: string,
  line2: string,
) {
  context.save();
  context.beginPath();
  context.fillStyle = fill;
  context.shadowColor = "rgba(74, 45, 98, 0.12)";
  context.shadowBlur = 12;
  context.shadowOffsetY = 4;
  context.arc(x, y, 58, 0, Math.PI * 2);
  context.fill();
  context.shadowColor = "transparent";
  context.lineWidth = 4;
  context.strokeStyle = stroke;
  context.stroke();

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `28px ${displayFont()}`;
  context.fillStyle = stroke;
  context.fillText(icon, x, y - 18);
  context.font = `700 13px ${bodyFont()}`;
  context.fillStyle = COLORS.ink;
  context.fillText(line1, x, y + 10);
  context.fillText(line2, x, y + 26);
  context.restore();
}

function drawCloudBadge(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  line1: string,
  line2: string,
) {
  context.save();
  context.translate(x, y);
  context.rotate(0.08);
  context.fillStyle = COLORS.petal;
  context.shadowColor = "rgba(228, 93, 150, 0.16)";
  context.shadowBlur = 14;
  context.beginPath();
  context.arc(-42, 8, 34, 0, Math.PI * 2);
  context.arc(0, -18, 46, 0, Math.PI * 2);
  context.arc(46, 6, 36, 0, Math.PI * 2);
  context.arc(0, 22, 48, 0, Math.PI * 2);
  context.fill();
  context.shadowColor = "transparent";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = COLORS.white;
  context.font = `700 22px ${displayFont()}`;
  context.fillText(line1, 0, -6);
  context.font = `700 20px ${displayFont()}`;
  context.fillText(line2, 0, 20);
  context.fillText("♡", 0, 44);
  context.restore();
}

function drawTiltedSticker(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  fill: string,
  lines: string[],
  textColor: string,
) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.fillStyle = fill;
  context.shadowColor = "rgba(74, 45, 98, 0.1)";
  context.shadowBlur = 10;
  roundRect(context, -width / 2, -height / 2, width, height, 22);
  context.fill();
  context.shadowColor = "transparent";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = textColor;
  context.font = `700 20px ${displayFont()}`;
  const start = -((lines.length - 1) * 22) / 2;
  lines.forEach((line, index) => {
    context.fillText(line, 0, start + index * 22);
  });
  context.restore();
}

function drawColorfulBrand(context: CanvasRenderingContext2D, y: number) {
  const letters = "Little Arts".split("");
  context.save();
  context.font = `700 62px ${displayFont()}`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  const widths = letters.map((letter) => context.measureText(letter === " " ? " " : letter).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + 36;
  let x = (CATALOGUE_SIZE - total) / 2;
  let colorIndex = 0;
  letters.forEach((letter, index) => {
    if (letter === " ") {
      x += widths[index];
      return;
    }
    context.fillStyle = BRAND_LETTER_COLORS[colorIndex % BRAND_LETTER_COLORS.length];
    context.fillText(letter, x, y);
    x += widths[index];
    colorIndex += 1;
  });
  drawHeart(context, x + 22, y - 28, 14, COLORS.pinkSoft);
  context.restore();
}

function drawLayeredBackground(context: CanvasRenderingContext2D) {
  const gradient = context.createLinearGradient(0, 0, CATALOGUE_SIZE, CATALOGUE_SIZE);
  gradient.addColorStop(0, COLORS.cream);
  gradient.addColorStop(0.45, "#fff0f5");
  gradient.addColorStop(1, "#f4e7fb");
  context.fillStyle = gradient;
  context.fillRect(0, 0, CATALOGUE_SIZE, CATALOGUE_SIZE);

  drawBlob(context, 120, 80, 220, 160, -0.4, "rgba(246, 194, 212, 0.45)");
  drawBlob(context, 980, 90, 200, 150, 0.35, "rgba(234, 214, 248, 0.5)");
  drawBlob(context, 80, 980, 240, 180, 0.5, "rgba(200, 239, 216, 0.32)");
  drawBlob(context, 980, 1000, 210, 170, -0.3, "rgba(255, 233, 184, 0.28)");
  drawBlob(context, 540, 1040, 260, 90, 0, "rgba(255, 255, 255, 0.45)");

  drawDot(context, 240, 200, 8, "rgba(228, 93, 150, 0.28)");
  drawDot(context, 860, 170, 6, "rgba(107, 63, 160, 0.18)");
  drawDot(context, 200, 760, 7, "rgba(125, 204, 160, 0.35)");
  drawDot(context, 900, 820, 9, "rgba(255, 209, 102, 0.4)");
  drawDot(context, 70, 430, 5, "rgba(244, 143, 177, 0.4)");
  drawDot(context, 1010, 480, 6, "rgba(126, 200, 227, 0.4)");
}

function categoryCopy(kind: CatalogueKind): {
  badge: [string, string];
  side: [string, string];
  tagline: string;
} {
  if (kind === "bracelets") {
    return { badge: ["Kids", "Bracelet"], side: ["Wear a", "Little Smile"], tagline: "Small Crafts ♥ Big Happiness" };
  }
  if (kind === "flowers") {
    return { badge: ["Kids", "Flower"], side: ["Bloom", "with Love"], tagline: "Made by Little Hands ♡" };
  }
  if (kind === "bouquets") {
    return { badge: ["Kids", "Bouquet"], side: ["Handmade", "Happiness"], tagline: "Made by Little Hands ♡" };
  }
  if (kind === "keychains") {
    return { badge: ["Kids", "Keychain"], side: ["Carry Happiness", "Everywhere"], tagline: "Little Accessories Big Smiles ♡" };
  }
  if (kind === "magnets") {
    return { badge: ["Kids", "Magnet"], side: ["A Little", "Daily Smile"], tagline: "Small Crafts ♥ Big Happiness" };
  }
  return { badge: ["Little", "Arts"], side: ["Handmade", "with Love"], tagline: "Small Crafts ♥ Big Happiness" };
}

function drawCategoryDecorations(context: CanvasRenderingContext2D, kind: CatalogueKind) {
  drawRainbow(context, 148, 168, 78);
  drawStemBouquet(context, 92, 980, false);
  drawStemBouquet(context, 990, 990, true);

  if (kind === "bracelets") {
    drawBead(context, 70, 620, 11, "#f48fb1");
    drawBead(context, 102, 652, 8, "#ffd166");
    drawBead(context, 1008, 610, 10, "#7ec8e3");
    drawStar(context, 160, 250, 11, "#ffd166");
    drawHeart(context, 930, 250, 10, COLORS.pinkSoft);
  } else if (kind === "flowers" || kind === "bouquets") {
    drawFlower(context, 150, 250, 14, "#f7b6d2", "#ffe08a");
    drawFlower(context, 940, 230, 12, "#e45d96", "#fff4c2");
    drawLeaf(context, 70, 560, 22, -0.8, "#b7e4c7");
    drawLeaf(context, 1010, 540, 20, 0.9, "#8fcead");
  } else if (kind === "keychains") {
    drawHeart(context, 150, 248, 11, COLORS.pinkSoft);
    drawSparkle(context, 930, 240, 14, "#ffd166");
    drawStar(context, 80, 600, 10, "#c77dff");
  } else if (kind === "magnets") {
    drawHeart(context, 150, 250, 11, COLORS.pink);
    drawHeart(context, 940, 250, 9, COLORS.pinkSoft);
    roundRect(context, 48, 560, 34, 46, 8);
    context.fillStyle = COLORS.cloud;
    context.fill();
  } else {
    drawSparkle(context, 150, 250, 12, "#ffd166");
    drawHeart(context, 940, 240, 10, COLORS.pinkSoft);
  }

}

function drawProductPoster(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  photo: FittedPhoto,
) {
  context.save();
  context.shadowColor = "rgba(107, 63, 160, 0.16)";
  context.shadowBlur = 28;
  context.shadowOffsetY = 10;
  context.fillStyle = COLORS.white;
  roundRect(context, photo.frameX, photo.frameY, photo.frameW, photo.frameH, 46);
  context.fill();
  context.restore();

  drawDashedRoundRect(
    context,
    photo.frameX + 10,
    photo.frameY + 10,
    photo.frameW - 20,
    photo.frameH - 20,
    38,
    "rgba(228, 93, 150, 0.22)",
  );

  context.save();
  roundRect(context, photo.frameX + 14, photo.frameY + 14, photo.frameW - 28, photo.frameH - 28, 36);
  context.clip();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, photo.x, photo.y, photo.width, photo.height);
  context.restore();

  drawHeart(context, photo.frameX + 38, photo.frameY + 50, 12, "rgba(244, 143, 177, 0.9)");
  drawHeart(context, photo.frameX + photo.frameW - 50, photo.frameY + photo.frameH - 72, 10, "rgba(228, 93, 150, 0.8)");
  drawSparkle(context, photo.frameX + photo.frameW - 54, photo.frameY + 58, 13, "#ffd166");
  drawSparkle(context, photo.frameX + 50, photo.frameY + photo.frameH - 60, 10, "#ffe08a");
}

function drawNameAndPrice(
  context: CanvasRenderingContext2D,
  name: string,
  priceLabel: string | null,
  photo: FittedPhoto,
) {
  const nameY = photo.frameY + photo.frameH + 54;
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (name) {
    context.font = `700 40px ${displayFont()}`;
    const lines = wrapText(context, name, 620, 2);
    const pillW = Math.min(
      760,
      Math.max(...lines.map((line) => context.measureText(line).width)) + 72,
    );
    const pillH = lines.length === 1 ? 64 : 104;
    context.fillStyle = COLORS.petal;
    context.shadowColor = "rgba(228, 93, 150, 0.16)";
    context.shadowBlur = 12;
    roundRect(context, (CATALOGUE_SIZE - pillW) / 2, nameY - pillH / 2, pillW, pillH, 32);
    context.fill();
    context.shadowColor = "transparent";
    context.fillStyle = COLORS.ink;
    lines.forEach((line, index) => {
      const lineY = lines.length === 1 ? nameY : nameY - 18 + index * 36;
      context.fillText(line, CATALOGUE_SIZE / 2, lineY);
    });
  }

  if (priceLabel) {
    const priceY = name ? nameY + 78 : nameY;
    context.font = `800 64px ${displayFont()}`;
    context.fillStyle = COLORS.pink;
    context.fillText(priceLabel, CATALOGUE_SIZE / 2, priceY);
    drawHeart(context, CATALOGUE_SIZE / 2 - context.measureText(priceLabel).width / 2 - 28, priceY - 10, 11, COLORS.pinkSoft);
    drawHeart(context, CATALOGUE_SIZE / 2 + context.measureText(priceLabel).width / 2 + 28, priceY - 10, 11, COLORS.pinkSoft);
  }
}

function drawBadges(context: CanvasRenderingContext2D, kind: CatalogueKind, photo: FittedPhoto) {
  const copy = categoryCopy(kind);
  const badges: Array<[string, string, string, string, string]> = [
    ["#ffe4ee", COLORS.pink, "♡", "Handmade", "with Love"],
    ["#dff6e8", COLORS.mintDeep, "🌿", "Unique", "Design"],
    [COLORS.peach, "#e89a4a", "🎁", "Perfect for", "Gifting"],
  ];
  if (kind !== "bouquets") {
    badges.push([COLORS.lilac, COLORS.purple, "★", "Kids", "Favorite"]);
  }
  const top = photo.frameY + 58;
  const bottom = photo.frameY + photo.frameH - 58;
  badges.forEach((badge, index) => {
    const y =
      badges.length === 1 ? (top + bottom) / 2 : top + (index * (bottom - top)) / (badges.length - 1);
    drawCircleBadge(context, 92, y, badge[0], badge[1], badge[2], badge[3], badge[4]);
  });

  drawTiltedSticker(
    context,
    930,
    118,
    176,
    86,
    0.18,
    "#fff4d6",
    ["Small Crafts", "Big Smiles ♡"],
    COLORS.ink,
  );
  drawCloudBadge(context, 950, photo.frameY + 86, copy.badge[0], copy.badge[1]);
  context.save();
  context.translate(948, photo.frameY + photo.frameH * 0.55);
  context.rotate(0.12);
  context.textAlign = "center";
  context.fillStyle = COLORS.inkSoft;
  context.font = `italic 700 22px ${bodyFont()}`;
  context.fillText(copy.side[0], 0, 0);
  context.fillText(copy.side[1], 0, 28);
  drawHeart(context, 0, 54, 8, COLORS.pinkSoft);
  context.restore();
}

export async function generateCatalogueImage(input: CatalogueImageInput): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("Catalogue images can only be created in the admin browser.");
  }

  const image = await loadImageSource(input.source);
  const kind = catalogueKindFromCategory(input.categorySlug, input.categoryName);
  const canvas = document.createElement("canvas");
  canvas.width = CATALOGUE_SIZE;
  canvas.height = CATALOGUE_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create the catalogue image. Please try again.");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const photo = fitProductPhoto(image, kind);

  drawLayeredBackground(context);
  drawCategoryDecorations(context, kind);
  drawProductPoster(context, image, photo);
  drawColorfulBrand(context, 92);

  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillStyle = COLORS.ink;
  context.font = `italic 700 28px ${bodyFont()}`;
  context.fillText("Handmade with Love", CATALOGUE_SIZE / 2 - 8, 132);
  drawHeart(context, CATALOGUE_SIZE / 2 + context.measureText("Handmade with Love").width / 2 + 18, 118, 9, COLORS.pink);

  drawBadges(context, kind, photo);
  drawNameAndPrice(context, input.productName.trim(), input.priceLabel, photo);

  context.save();
  context.translate(170, 1038);
  context.rotate(-0.12);
  context.fillStyle = COLORS.inkSoft;
  context.font = `italic 700 22px ${bodyFont()}`;
  context.textAlign = "center";
  context.fillText(categoryCopy(kind).tagline, 0, 0);
  context.restore();

  drawTiltedSticker(
    context,
    900,
    1028,
    210,
    78,
    0.1,
    "#fff0f6",
    ["Little Accessories", "Big Smiles ♡"],
    COLORS.ink,
  );

  const blob =
    (await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/webp", 0.92);
    })) ??
    (await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/png");
    }));
  if (!blob) {
    throw new Error("Unable to create the catalogue image. Please try again.");
  }
  return blob;
}

export async function uploadCatalogueImage(blob: Blob, productId: string): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const extension = blob.type === "image/png" ? "png" : "webp";
  const path = `catalogue/${productId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, blob, {
    cacheControl: "3600",
    upsert: false,
    contentType: blob.type || "image/webp",
  });

  if (error) {
    throw new Error("Unable to save the catalogue image. Please try again.");
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function replaceCatalogueImage(
  blob: Blob,
  productId: string,
  previousUrl: string | null,
): Promise<string> {
  const nextUrl = await uploadCatalogueImage(blob, productId);
  if (previousUrl && previousUrl !== nextUrl) {
    await deleteProductImage(previousUrl);
  }
  return nextUrl;
}
