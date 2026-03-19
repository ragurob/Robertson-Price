import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '../src/content/blog');
const OUT_DIR = join(__dirname, '../public/images/blog');

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

function seededRand(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getPatternType(slug) {
  const s = slug.toLowerCase();
  if (/ai|gpt|openai|llm|chatbot|anthropic|gemini|machine|claude|neural|model/.test(s)) return 0;
  if (/bitcoin|ethereum|crypto|nft|defi|token|blockchain|bnb|solana|web3|yield|trading|market/.test(s)) return 1;
  const h = hash(slug);
  return h % 2 === 0 ? 2 : 3;
}

function generateNeuralSVG(slug, rand) {
  const W = 1200, H = 630;
  let elements = [];

  // Background
  elements.push(`<rect width="${W}" height="${H}" fill="#FAFAF9"/>`);

  // Faint horizontal grid lines every 80px
  for (let y = 80; y < H; y += 80) {
    elements.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#E8E8E6" stroke-width="0.8" opacity="0.6"/>`);
  }

  // 5 columns of nodes
  const cols = [150, 300, 600, 900, 1050];
  const nodesByCol = [];

  for (let ci = 0; ci < cols.length; ci++) {
    const x = cols[ci];
    const count = 4 + Math.floor(rand() * 4); // 4-7 nodes
    const nodes = [];
    const spacing = H / (count + 1);
    for (let ni = 0; ni < count; ni++) {
      const baseY = spacing * (ni + 1);
      const jitter = (rand() - 0.5) * spacing * 0.4;
      const y = Math.max(40, Math.min(H - 40, baseY + jitter));
      const r = 4 + rand() * 3; // 4-7
      nodes.push({ x, y, r });
    }
    nodesByCol.push(nodes);
  }

  // Draw curved connections between adjacent column pairs
  for (let ci = 0; ci < cols.length - 1; ci++) {
    const fromNodes = nodesByCol[ci];
    const toNodes = nodesByCol[ci + 1];
    for (const from of fromNodes) {
      for (const to of toNodes) {
        if (rand() < 0.55) {
          const cx1 = from.x + (to.x - from.x) * 0.4;
          const cy1 = from.y + (rand() - 0.5) * 80;
          const cx2 = from.x + (to.x - from.x) * 0.6;
          const cy2 = to.y + (rand() - 0.5) * 80;
          const opacity = (0.25 + rand() * 0.2).toFixed(2);
          elements.push(`<path d="M${from.x},${from.y} C${cx1},${cy1} ${cx2},${cy2} ${to.x},${to.y}" stroke="#D1CFC9" stroke-width="0.8" fill="none" opacity="${opacity}"/>`);
        }
      }
    }
  }

  // Draw nodes
  for (const nodes of nodesByCol) {
    for (const n of nodes) {
      elements.push(`<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="#D1CFC9" opacity="0.8"/>`);
    }
  }

  // Accent nodes (larger, outline only)
  for (let i = 0; i < 4; i++) {
    const colIdx = Math.floor(rand() * cols.length);
    const x = cols[colIdx] + (rand() - 0.5) * 40;
    const y = 80 + rand() * (H - 160);
    const r = 10 + rand() * 8;
    elements.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="#1A1A1A" stroke-width="1" opacity="0.15"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${elements.join('\n')}\n</svg>`;
}

function generateFlowSVG(slug, rand) {
  const W = 1200, H = 630;
  let elements = [];

  elements.push(`<rect width="${W}" height="${H}" fill="#FAFAF9"/>`);

  // 15 horizontal bezier curves
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    const baseY = 50 + t * 530;
    const yStart = baseY + (rand() - 0.5) * 60;
    const yEnd = baseY + (rand() - 0.5) * 60;
    const cy1 = baseY + (rand() - 0.5) * 180;
    const cy2 = baseY + (rand() - 0.5) * 180;
    const cx1 = 200 + rand() * 200;
    const cx2 = 800 + rand() * 200;
    const isLight = rand() < 0.3;
    const strokeColor = isLight ? '#E8E8E6' : '#D1CFC9';
    const strokeWidth = (0.8 + rand() * 1.0).toFixed(2);
    const opacity = (0.4 + rand() * 0.35).toFixed(2);
    elements.push(`<path d="M0,${yStart.toFixed(1)} C${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${W},${yEnd.toFixed(1)}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity}"/>`);
  }

  // Tick marks along the bottom
  for (let x = 0; x <= W; x += 100) {
    const tickH = 4 + rand() * 8;
    const y1 = H - 20;
    const y2 = H - 20 - tickH;
    elements.push(`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2.toFixed(1)}" stroke="#D1CFC9" stroke-width="0.8" opacity="0.5"/>`);
  }

  // Diagonal accent element
  const dx1 = rand() * 200 + 200;
  const dy1 = rand() * 100 + 100;
  const dx2 = dx1 + 300 + rand() * 200;
  const dy2 = dy1 + 200 + rand() * 100;
  elements.push(`<line x1="${dx1.toFixed(1)}" y1="${dy1.toFixed(1)}" x2="${dx2.toFixed(1)}" y2="${dy2.toFixed(1)}" stroke="#D1CFC9" stroke-width="1" opacity="0.3"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${elements.join('\n')}\n</svg>`;
}

function generateDotGridSVG(slug, rand) {
  const W = 1200, H = 630;
  let elements = [];

  elements.push(`<rect width="${W}" height="${H}" fill="#FAFAF9"/>`);

  const spacing = 48;
  const cols = Math.ceil(W / spacing) + 1;
  const rows = Math.ceil(H / spacing) + 1;
  const offsetX = (W - (cols - 1) * spacing) / 2;
  const offsetY = (H - (rows - 1) * spacing) / 2;

  // Focal point
  const focalX = W * (0.4 + rand() * 0.2);
  const focalY = H * (0.3 + rand() * 0.4);
  const focalRadius = 200 + rand() * 150;

  const dots = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + col * spacing;
      const y = offsetY + row * spacing;
      const dist = Math.sqrt((x - focalX) ** 2 + (y - focalY) ** 2);
      const nearFocal = dist < focalRadius;
      const baseR = 1.5 + rand() * 3;
      const r = nearFocal ? baseR * (1 + (1 - dist / focalRadius) * 0.8) : baseR;
      const opacity = (0.2 + rand() * 0.5).toFixed(2);
      dots.push({ x, y, r: Math.min(r, 4.5) });
      elements.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#1A1A1A" opacity="${opacity}"/>`);
    }
  }

  // Connect some nearby dots with thin lines
  for (let i = 0; i < dots.length; i++) {
    if (rand() < 0.04) {
      const d1 = dots[i];
      // connect to a neighbor
      const ni = i + 1 < dots.length ? i + 1 : i - 1;
      const d2 = dots[ni];
      if (d2) {
        elements.push(`<line x1="${d1.x.toFixed(1)}" y1="${d1.y.toFixed(1)}" x2="${d2.x.toFixed(1)}" y2="${d2.y.toFixed(1)}" stroke="#D1CFC9" stroke-width="0.5" opacity="0.25"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${elements.join('\n')}\n</svg>`;
}

function generateCirclesSVG(slug, rand) {
  const W = 1200, H = 630;
  let elements = [];

  elements.push(`<rect width="${W}" height="${H}" fill="#FAFAF9"/>`);

  const count = 5 + Math.floor(rand() * 2); // 5-6 circles
  for (let i = 0; i < count; i++) {
    const cx = W * (0.3 + rand() * 0.5);
    const cy = H * (0.2 + rand() * 0.6);
    const r = 150 + rand() * 200;
    const isFilled = i < 2 && rand() < 0.5;
    const isLight = rand() < 0.4;
    const strokeColor = isLight ? '#E8E8E6' : '#D1CFC9';
    const strokeWidth = (0.8 + rand() * 0.7).toFixed(2);

    if (isFilled) {
      elements.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="rgba(209,207,201,0.08)" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`);
    } else {
      elements.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${elements.join('\n')}\n</svg>`;
}

function generateSVG(slug) {
  const h = hash(slug);
  const rand = seededRand(h);
  const patternType = getPatternType(slug);

  switch (patternType) {
    case 0: return generateNeuralSVG(slug, rand);
    case 1: return generateFlowSVG(slug, rand);
    case 2: return generateDotGridSVG(slug, rand);
    case 3: return generateCirclesSVG(slug, rand);
    default: return generateDotGridSVG(slug, rand);
  }
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
let generated = 0;
for (const file of files) {
  const slug = basename(file, '.md');
  const svg = generateSVG(slug);
  writeFileSync(join(OUT_DIR, `${slug}.svg`), svg);
  generated++;
}
console.log(`Generated ${generated} hero images`);
