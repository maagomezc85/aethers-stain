// Motor Raycaster 3D con Pitch Vertical (Mirada Arriba/Abajo), Niebla de Distancia Exponencial y Sombreado Dinámico
class RaycasterEngine {
  constructor() {
    this.canvas = document.getElementById('view-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.width = 640;
    this.height = 400;
    this.canvas.width = 640;
    this.canvas.height = 400;
    this.fov = 0.66;
    this.zBuffer = new Float64Array(640);

    this.imgData = this.ctx.createImageData(640, 400);
    this.buf = new ArrayBuffer(this.imgData.data.length);
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);

    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * 640,
        y: Math.random() * 200 + 100,
        r: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  render(player, sector, attackAnimFrame) {
    const w = 640;
    const h = 400;
    const buf32 = this.buf32;

    const pitch = Math.floor(player.pitch || 0);
    const horizon = 200 + pitch;
    const clampedHorizon = Math.max(0, Math.min(h, horizon));

    const sky32 = this.parseColorTo32(sector.skyColor);
    const floor32 = this.parseColorTo32(sector.floorColor);

    // Renderizado de Techo (Cielo) ajustado por pitch vertical
    for (let y = 0; y < clampedHorizon; y++) {
      const shadowFactor = 0.3 + (y / 200) * 0.7;
      const shadedSky = this.shadeColor32(sky32, shadowFactor);
      const rowOffset = y * w;
      for (let x = 0; x < w; x++) buf32[rowOffset + x] = shadedSky;
    }

    // Renderizado de Suelo ajustado por pitch vertical
    for (let y = clampedHorizon; y < h; y++) {
      const shadowFactor = 1.0 - ((y - 200) / 200) * 0.6;
      const shadedFloor = this.shadeColor32(floor32, shadowFactor);
      const rowOffset = y * w;
      for (let x = 0; x < w; x++) buf32[rowOffset + x] = shadedFloor;
    }

    // Raycasting DDA Engine para Paredes
    const grid = sector.grid;
    const planeX = -player.dirY * this.fov;
    const planeY = player.dirX * this.fov;

    for (let x = 0; x < w; x++) {
      const cameraX = 2 * x / w - 1;
      const rayDirX = player.dirX + planeX * cameraX;
      const rayDirY = player.dirY + planeY * cameraX;

      let mapX = Math.floor(player.x);
      let mapY = Math.floor(player.y);

      let deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
      let deltaDistY = Math.abs(1 / (rayDirY || 0.00001));

      let perpWallDist, stepX, stepY, sideDistX, sideDistY;

      if (rayDirX < 0) {
        stepX = -1; sideDistX = (player.x - mapX) * deltaDistX;
      } else {
        stepX = 1; sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
      }

      if (rayDirY < 0) {
        stepY = -1; sideDistY = (player.y - mapY) * deltaDistY;
      } else {
        stepY = 1; sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
      }

      let hit = 0;
      let side = 0;

      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX; mapX += stepX; side = 0;
        } else {
          sideDistY += deltaDistY; mapY += stepY; side = 1;
        }
        if (mapX >= 0 && mapX < 16 && mapY >= 0 && mapY < 16) {
          if (grid[mapY][mapX] > 0) hit = grid[mapY][mapX];
        } else {
          hit = 1;
        }
      }

      if (side === 0) perpWallDist = (mapX - player.x + (1 - stepX) / 2) / (rayDirX || 0.00001);
      else perpWallDist = (mapY - player.y + (1 - stepY) / 2) / (rayDirY || 0.00001);

      this.zBuffer[x] = perpWallDist;

      const lineHeight = Math.floor(h / (perpWallDist || 0.00001));
      let drawStart = Math.floor(-lineHeight / 2 + horizon);
      if (drawStart < 0) drawStart = 0;
      let drawEnd = Math.floor(lineHeight / 2 + horizon);
      if (drawEnd >= h) drawEnd = h - 1;

      let wallX;
      if (side === 0) wallX = player.y + perpWallDist * rayDirY;
      else wallX = player.x + perpWallDist * rayDirX;
      wallX -= Math.floor(wallX);

      let texX = Math.floor(wallX * 128);
      if (side === 0 && rayDirX > 0) texX = 128 - texX - 1;
      if (side === 1 && rayDirY < 0) texX = 128 - texX - 1;

      const tex = textures.textures[hit] || textures.textures[1];
      this.drawColHD(buf32, x, drawStart, drawEnd, lineHeight, texX, tex, side, perpWallDist, horizon);
    }

    this.imgData.data.set(this.buf8);
    this.ctx.putImageData(this.imgData, 0, 0);

    this.renderParticles(this.ctx, sector, pitch);
    this.renderSprites(player, sector, planeX, planeY);
    this.renderWhip(this.ctx, attackAnimFrame, pitch);
  }

  drawColHD(buf32, x, drawStart, drawEnd, lineHeight, texX, textureData, side, dist, horizon) {
    const data = textureData.data;
    const texW = textureData.width || 128;

    let shadow = 1.0 / (1.0 + dist * 0.18 + dist * dist * 0.02);
    if (side === 1) shadow *= 0.72;

    for (let y = drawStart; y < drawEnd; y++) {
      const d = y * 256 - horizon * 256 + lineHeight * 128;
      const texY = Math.floor(((d * texW) / lineHeight) / 256) & (texW - 1);
      const idx = (texY * texW + texX) * 4;

      const r = Math.floor(data[idx] * shadow);
      const g = Math.floor(data[idx + 1] * shadow);
      const b = Math.floor(data[idx + 2] * shadow);

      buf32[y * 640 + x] = (255 << 24) | (b << 16) | (g << 8) | r;
    }
  }

  renderParticles(ctx, sector, pitch) {
    ctx.save();
    const color = sector.id === 5 ? 'rgba(255, 200, 100, ' : (sector.id === 3 ? 'rgba(255, 80, 80, ' : 'rgba(0, 255, 180, ');
    this.particles.forEach(p => {
      p.x += p.speedX; p.y += p.speedY;
      if (p.x < 0) p.x = 640; if (p.x > 640) p.x = 0;
      if (p.y < 20) p.y = 380; if (p.y > 380) p.y = 20;

      const py = p.y + pitch * 0.3;
      if (py >= 0 && py <= 400) {
        ctx.fillStyle = `${color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  parseColorTo32(hex) {
    if (hex.startsWith('#')) {
      let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
      return (255 << 24) | (b << 16) | (g << 8) | r;
    }
    return 0xff000000;
  }

  shadeColor32(color32, factor) {
    const r = Math.floor((color32 & 0xff) * factor);
    const g = Math.floor(((color32 >> 8) & 0xff) * factor);
    const b = Math.floor(((color32 >> 16) & 0xff) * factor);
    return (255 << 24) | (b << 16) | (g << 8) | r;
  }

  renderSprites(player, sector, planeX, planeY) {
    const spritesToRender = [];
    const ex = sector.exitDoor.x;
    const ey = sector.exitDoor.y;
    const distExit = (ex - player.x) ** 2 + (ey - player.y) ** 2;

    const portalType = sector.biochip.collected ? 'portal_unlocked' : 'portal_locked';
    spritesToRender.push({ type: portalType, x: ex, y: ey, dist: distExit, isPortal: true });

    if (!sector.biochip.collected) {
      const dx = sector.biochip.x - player.x;
      const dy = sector.biochip.y - player.y;
      spritesToRender.push({ type: 'biochip', x: sector.biochip.x, y: sector.biochip.y, dist: dx * dx + dy * dy });
    }

    sector.nymphs.forEach(n => {
      if (n.alive) {
        const dx = n.x - player.x;
        const dy = n.y - player.y;
        spritesToRender.push({ type: 'nymph', x: n.x, y: n.y, dist: dx * dx + dy * dy });
      }
    });

    spritesToRender.sort((a, b) => b.dist - a.dist);
    spritesToRender.forEach(s => this.drawSprite(player, s, planeX, planeY));
  }

  drawSprite(player, sprite, planeX, planeY) {
    const ctx = this.ctx;
    const w = 640;
    const h = 400;

    const pitch = Math.floor(player.pitch || 0);
    const horizon = 200 + pitch;

    const sX = sprite.x - player.x;
    const sY = sprite.y - player.y;

    const invDet = 1.0 / (planeX * player.dirY - player.dirX * planeY);
    const transformX = invDet * (player.dirY * sX - player.dirX * sY);
    const transformY = invDet * (-planeY * sX + planeX * sY);

    if (transformY <= 0.1) return;

    const sScreenX = Math.floor((w / 2) * (1 + transformX / transformY));
    let baseH = Math.abs(Math.floor(h / transformY));

    if (sprite.type === 'nymph') baseH = Math.floor(baseH * 0.80);
    else if (sprite.isPortal) baseH = Math.floor(baseH * 1.55);

    const sH = baseH;
    const sW = sH;

    let dStartY = Math.floor(-sH / 2 + horizon);
    if (dStartY < 0) dStartY = 0;
    let dEndY = Math.floor(sH / 2 + horizon);
    if (dEndY >= h) dEndY = h - 1;

    let dStartX = Math.floor(-sW / 2 + sScreenX);
    if (dStartX < 0) dStartX = 0;
    let dEndX = Math.floor(sW / 2 + sScreenX);
    if (dEndX >= w) dEndX = w - 1;

    const img = textures.sprites[sprite.type];
    if (!img) return;

    const imgW = img.width || 256;

    for (let stripe = dStartX; stripe < dEndX; stripe++) {
      if (transformY < this.zBuffer[stripe]) {
        const texX = Math.floor((256 * (stripe - (-sW / 2 + sScreenX)) * imgW / sW) / 256);
        if (texX >= 0 && texX < imgW) {
          ctx.drawImage(img, texX, 0, 1, img.height, stripe, dStartY, 1, dEndY - dStartY);
        }
      }
    }
  }

  renderWhip(ctx, attackAnimFrame, pitch) {
    const frames = textures.sprites['whip'];
    const img = frames[attackAnimFrame > 0 ? 1 : 0];
    const pitchOffset = Math.floor(pitch * 0.4);
    ctx.drawImage(img, 640 - 270, 400 - 250 + pitchOffset + (attackAnimFrame > 0 ? -15 : 15), 250, 250);
  }
}

const raycaster = new RaycasterEngine();
