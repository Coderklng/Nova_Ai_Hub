const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const dir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(dir, { recursive: true });

const crc = (b) => {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) {
    c ^= b[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const ch = (t, d) => {
  const l = Buffer.alloc(4);
  l.writeUInt32BE(d.length, 0);
  const tb = Buffer.from(t, "ascii");
  const cb = Buffer.alloc(4);
  cb.writeUInt32BE(crc(Buffer.concat([tb, d])), 0);
  return Buffer.concat([l, tb, d, cb]);
};

const mk = (s, f) => {
  const raw = Buffer.alloc((s * 4 + 1) * s);
  const cx = s / 2;
  const cy = s / 2;
  const ro = s * 0.44;
  const ri = s * 0.16;

  for (let y = 0; y < s; y++) {
    const rs = y * (s * 4 + 1);
    raw[rs] = 0;
    for (let x = 0; x < s; x++) {
      const idx = rs + 1 + x * 4;
      const d = Math.hypot(x - cx, y - cy);
      let r = 9,
        g = 9,
        b = 11;

      if (d <= ro && d >= ro - s * 0.06) {
        r = 245;
        g = 158;
        b = 11;
      } else if (d <= ri) {
        r = 56;
        g = 189;
        b = 248;
      }

      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = 255;
    }
  }

  const ih = Buffer.alloc(13);
  ih.writeUInt32BE(s, 0);
  ih.writeUInt32BE(s, 4);
  ih[8] = 8;
  ih[9] = 6;

  fs.writeFileSync(
    f,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      ch("IHDR", ih),
      ch("IDAT", zlib.deflateSync(raw)),
      ch("IEND", Buffer.alloc(0)),
    ])
  );
};

mk(192, path.join(dir, "icon-192.png"));
mk(512, path.join(dir, "icon-512.png"));
console.log("Icons generated in public/icons/");