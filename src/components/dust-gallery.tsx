import { useEffect, useRef } from "react";

const FRAMES = [
  { src: "/brand/slides/rangers.webp", alt: "Space Rangers. Корабль и тишина." },
  { src: "/brand/slides/gothic.webp", alt: "Готика. Колония под куполом." },
  { src: "/brand/slides/calradia.webp", alt: "Кальрадия. Степь и чужие знамёна." },
  { src: "/brand/slides/azeroth.webp", alt: "Азерот. Жрица у портала." },
  { src: "/brand/slides/zomboid.webp", alt: "Project Zomboid. Ночь без сейва." },
  { src: "/brand/slides/kenshi.webp", alt: "Кенши. Кандалы сняты." },
  { src: "/brand/slides/fallout.webp", alt: "Fallout. Одна пустошь." },
  { src: "/brand/slides/nito3.webp", alt: "Ни то. Окно и автобус." }
];

const ASPECT = 16 / 9;
const TILE = 6;

type Frame = { src: string; alt: string };

const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aCell;
uniform vec2 uCard;
uniform vec2 uCardSize;
uniform vec2 uView;
uniform float uTile;
out vec2 vUv;
out float vAlpha;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 center = uCard + aCell + vec2(uTile * 0.5);
  float zone = uView.x * 0.48;
  float dist = min(center.x, uView.x - center.x);
  float f = clamp(dist / zone, 0.0, 1.0);
  float n = hash(aCell);
  float n2 = hash(aCell + vec2(19.2, 7.7));
  f = clamp(f + (n - 0.5) * 0.28, 0.0, 1.0);
  float s = pow(1.0 - smoothstep(0.0, 1.0, f), 1.02);
  float dir = center.x < uView.x * 0.5 ? -1.0 : 1.0;
  vec2 fly = vec2(
    dir * s * uView.x * 0.38 + (n - 0.5) * s * uView.x * 0.18,
    (n2 - 0.5) * s * uView.y * 0.55
  );
  float ang = (n - 0.5) * s * 2.4;
  float shrink = mix(1.05, 0.28, s);
  vec2 local = (aPos - 0.5) * uTile * shrink;
  float c = cos(ang);
  float si = sin(ang);
  local = vec2(c * local.x - si * local.y, si * local.x + c * local.y);
  vec2 pos = center + fly + local;
  vec2 clip = (pos / uView) * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);
  vUv = (aCell + aPos * uTile) / uCardSize;
  vAlpha = smoothstep(0.02, 0.42, f);
}
`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
in vec2 vUv;
in float vAlpha;
out vec4 outColor;
void main() {
  if (vUv.x < 0.0 || vUv.y < 0.0 || vUv.x > 1.0 || vUv.y > 1.0) discard;
  vec4 color = texture(uTex, vUv);
  float a = color.a * vAlpha;
  if (a < 0.015) discard;
  outColor = vec4(color.rgb, a);
}
`;

function layoutOf(width: number, height: number) {
  const cardH = Math.min(height * 0.72, 520);
  const cardW = cardH * ASPECT;
  const gap = 28;
  const step = cardW + gap;
  return {
    cardH,
    cardW,
    gap,
    step,
    loop: step * FRAMES.length,
    cardY: (height - cardH) / 2
  };
}

export function DustGallery({ onOpen }: { onOpen: (item: Frame) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance"
    });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const uCard = gl.getUniformLocation(program, "uCard");
    const uCardSize = gl.getUniformLocation(program, "uCardSize");
    const uView = gl.getUniformLocation(program, "uView");
    const uTile = gl.getUniformLocation(program, "uTile");
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const cells = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cells);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);

    let count = 0;
    let gridKey = "";
    const rebuild = (cardW: number, cardH: number, tile: number) => {
      const key = `${Math.round(cardW)}|${Math.round(cardH)}|${tile}`;
      if (key === gridKey) return;
      gridKey = key;
      const cols = Math.ceil(cardW / tile);
      const rows = Math.ceil(cardH / tile);
      const data = new Float32Array(cols * rows * 2);
      let i = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          data[i++] = x * tile;
          data[i++] = y * tile;
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, cells);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      count = cols * rows;
    };

    const textures: (WebGLTexture | null)[] = FRAMES.map(() => null);
    const ready = FRAMES.map(() => false);
    FRAMES.forEach((frame, index) => {
      const img = new Image();
      img.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        textures[index] = tex;
        ready[index] = true;
      };
      img.src = frame.src;
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scroll = 0;
    let velocity = reduce ? 0 : 0.45;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let raf = 0;
    let alive = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      return { rect, dpr };
    };

    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const { rect, dpr } = resize();
      const cssW = rect.width;
      const cssH = rect.height;
      if (!dragging) scroll += velocity;
      const cruise = reduce ? 0 : 0.45;
      if (!dragging) velocity += (cruise - velocity) * 0.035;

      const box = layoutOf(cssW, cssH);
      scroll = (scroll % box.loop + box.loop) % box.loop;
      const tile = TILE;
      rebuild(box.cardW * dpr, box.cardH * dpr, tile * dpr);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(7 / 255, 6 / 255, 5 / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(uView, canvas.width, canvas.height);
      gl.uniform2f(uCardSize, box.cardW * dpr, box.cardH * dpr);
      gl.uniform1f(uTile, tile * dpr);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, cells);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

      let nearest: Frame | null = null;
      let nearestDist = Infinity;
      const margin = cssW * 0.45;
      for (let index = 0; index < FRAMES.length; index++) {
        if (!ready[index] || !textures[index] || count === 0) continue;
        let cardX = ((index * box.step - scroll) % box.loop + box.loop) % box.loop;
        if (cardX > cssW) cardX -= box.loop;
        if (cardX > cssW + margin || cardX + box.cardW < -margin) continue;
        const mid = cardX + box.cardW / 2;
        const dist = Math.abs(mid - cssW / 2);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = FRAMES[index];
        }
        gl.uniform2f(uCard, cardX * dpr, box.cardY * dpr);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[index]);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
      }
      if (labelRef.current && nearest && labelRef.current.textContent !== nearest.alt) {
        labelRef.current.textContent = nearest.alt;
      }
    };
    raf = requestAnimationFrame(tick);

    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = event.clientX;
      velocity = 0;
      canvas.setPointerCapture?.(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      moved += Math.abs(dx);
      scroll -= dx;
      velocity = -dx * 0.65;
    };
    const pointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (moved > 8) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const box = layoutOf(rect.width, rect.height);
      if (y < box.cardY || y > box.cardY + box.cardH) return;
      const zone = rect.width * 0.48;
      if (Math.min(x, rect.width - x) / zone < 0.62) return;
      const local = (x + (scroll % box.loop) + box.loop) % box.loop;
      const index = Math.floor(local / box.step);
      if (local - index * box.step > box.cardW) return;
      const item = FRAMES[index];
      if (item) onOpen(item);
    };
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      textures.forEach(tex => tex && gl.deleteTexture(tex));
      gl.deleteBuffer(quad);
      gl.deleteBuffer(cells);
      gl.deleteProgram(program);
    };
  }, [onOpen]);

  return <div className="dust"><canvas ref={canvasRef} aria-label="Лента путешествий Люси" /><p className="dust-label" ref={labelRef}>Путь между мирами</p><p className="dust-hint">Потяни. У края кадр рассыпается на осколки.</p></div>;
}
