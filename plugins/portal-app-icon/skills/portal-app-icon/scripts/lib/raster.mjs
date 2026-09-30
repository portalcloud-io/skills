#!/usr/bin/env node
// Sharp-based raster helpers shared by audit-icon.mjs and render.mjs.
const ALPHA = 10;

/** Rasterize an SVG string to a square PNG buffer with a transparent background. */
export async function renderSvg(sharp, svgText, size = 1024) {
  return sharp(Buffer.from(svgText), { density: 96 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

/**
 * Measure the opaque content of an image (path, Buffer or raw input sharp
 * accepts): coverage, bounding box, optical center offset, corners and luma.
 */
export async function analyzeRaster(sharp, input, target = 1024) {
  const { data, info } = await sharp(input, { density: 96 })
    .resize(target, target, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let covered = 0;
  let lumaMin = 255;
  let lumaMax = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (data[i + 3] <= ALPHA) continue;
      covered += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (luma < lumaMin) lumaMin = luma;
      if (luma > lumaMax) lumaMax = luma;
    }
  }

  if (maxX < 0) return { empty: true, width, height, coverage: 0, corners: [0, 0, 0, 0] };

  const bbox = { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const corners = [
    data[3], // top-left
    data[(width - 1) * 4 + 3], // top-right
    data[(height - 1) * width * 4 + 3], // bottom-left
    data[(height * width - 1) * 4 + 3], // bottom-right
  ];

  return {
    empty: false,
    width,
    height,
    coverage: covered / (width * height),
    bbox,
    centerOffset: { x: centerX - width / 2, y: centerY - height / 2 },
    maxExtent: Math.max(bbox.width, bbox.height) / width,
    corners,
    luma: { min: lumaMin, max: lumaMax, range: (lumaMax - lumaMin) / 255 },
  };
}

/** Count of opaque corners (background baked into the glyph tell). */
export function opaqueCorners(raster) {
  return (raster.corners || []).filter((a) => a > ALPHA).length;
}
