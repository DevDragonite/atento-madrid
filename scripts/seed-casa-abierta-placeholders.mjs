// One-off script: convertir 8 fotos reales de Atento_Catering en WebP placeholders
// para las 8 escenas de Casa Abierta. Reemplazar por imágenes IA reales después.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SRC_DIR = path.join(root, "public", "images");
const DST_DIR = path.join(root, "public", "casa-abierta");

const mappings = [
  { src: "Atento_Catering-12.jpg", dst: "01-cocina-fuego.webp", width: 1900 },
  { src: "Atento_Catering-7.jpg",  dst: "02-plato.webp",        width: 1600 },
  { src: "Atento_Catering-3.jpg",  dst: "03-mesa-puesta.webp",  width: 1800 },
  { src: "Atento_Catering-25.jpg", dst: "04-copas.webp",        width: 1600 },
  { src: "Atento_Catering-31.jpg", dst: "05-ritual.webp",       width: 1600 },
  { src: "Atento_Catering-18.jpg", dst: "06-memoria.webp",      width: 1700 },
  { src: "Atento_Catering-40.jpg", dst: "07-despedida.webp",    width: 1700 },
  { src: "Atento_Catering-22.jpg", dst: "08-mesa-final.webp",   width: 1400 },
];

for (const m of mappings) {
  const srcPath = path.join(SRC_DIR, m.src);
  const dstPath = path.join(DST_DIR, m.dst);
  await sharp(srcPath)
    .resize({ width: m.width, height: 1080, fit: "cover", position: "centre" })
    .modulate({ saturation: 0.85, brightness: 0.88 })
    .tint({ r: 240, g: 220, b: 190 })
    .webp({ quality: 78 })
    .toFile(dstPath);
  console.log(`✓ ${m.dst}`);
}

console.log("Done. Replace these with AI-generated scenes when ready.");
