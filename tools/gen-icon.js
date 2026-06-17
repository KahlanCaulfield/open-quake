'use strict';
// Generates app/icon.png — a small "knob" mark (dark body + cyan glow ring) used for the
// tray icon and the Windows exe/window icon. Pure Node (zlib), no deps. Run: node tools/gen-icon.js
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const W = 256, H = 256, cx = 127.5, cy = 127.5;
function colorAt(x, y) {
  const d = Math.hypot(x - cx, y - cy);
  if (d < 86) return [22, 27, 36, 255];                                   // knob body
  if (d < 104) return [124, 255, 178, 255];                               // cyan glow ring
  if (d < 110) return [124, 255, 178, Math.round(255 * (110 - d) / 6)];   // soft outer edge
  return [0, 0, 0, 0];                                                    // transparent
}

const raw = Buffer.alloc(H * (1 + W * 4));
let o = 0;
for (let y = 0; y < H; y++) {
  raw[o++] = 0; // PNG filter type 0 (none) per scanline
  for (let x = 0; x < W; x++) { const c = colorAt(x, y); raw[o++] = c[0]; raw[o++] = c[1]; raw[o++] = c[2]; raw[o++] = c[3]; }
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
const out = path.join(__dirname, '..', 'app', 'icon.png');
fs.writeFileSync(out, png);
console.log('wrote', out, png.length, 'bytes');
