// Componente HUD: Máscara de Rorschach (Salud) + Minimapa 2D Radar
class HUDManager {
  constructor() {
    this.maskCanvas = document.getElementById('mask-canvas');
    this.maskCtx = this.maskCanvas.getContext('2d');

    this.mapCanvas = document.getElementById('minimap-canvas');
    this.mapCtx = this.mapCanvas.getContext('2d');

    this.inkTime = 0;
    this.hurtTimer = 0;
  }

  update(player, currentSector, damageFlash) {
    this.inkTime += 0.03;
    if (damageFlash) {
      this.hurtTimer = 15;
    } else if (this.hurtTimer > 0) {
      this.hurtTimer--;
    }

    this.renderRorschachMask(player.hp, player.maxHp);
    this.renderMinimap(player, currentSector);
    this.updateHealthBar(player.hp, player.maxHp);
  }

  renderRorschachMask(hp, maxHp) {
    const ctx = this.maskCtx;
    const w = this.maskCanvas.width;
    const h = this.maskCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    if (this.hurtTimer > 0) {
      const shakeX = (Math.random() * 8 - 4) * (this.hurtTimer / 15);
      const shakeY = (Math.random() * 8 - 4) * (this.hurtTimer / 15);
      ctx.translate(shakeX, shakeY);
    }

    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = this.hurtTimer > 0 ? '#ffcccc' : '#e6dfd3';
    ctx.strokeStyle = '#2b2620';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(cx, cy - 80);
    ctx.bezierCurveTo(cx + 65, cy - 70, cx + 70, cy + 20, cx + 45, cy + 80);
    ctx.bezierCurveTo(cx + 20, cy + 95, cx - 20, cy + 95, cx - 45, cy + 80);
    ctx.bezierCurveTo(cx - 70, cy + 20, cx - 65, cy - 70, cx, cy - 80);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#100e0b';
    ctx.beginPath();
    ctx.ellipse(cx - 24, cy - 20, 12, 8, -0.1, 0, Math.PI * 2);
    ctx.ellipse(cx + 24, cy - 20, 12, 8, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hp < 30 ? '#ff3366' : '#00ff88';
    const pupilLookX = Math.sin(this.inkTime * 0.5) * 2;
    ctx.fillRect(cx - 25 + pupilLookX, cy - 21, 3, 3);
    ctx.fillRect(cx + 23 + pupilLookX, cy - 21, 3, 3);

    ctx.fillStyle = '#0a0a0a';
    ctx.globalAlpha = 0.95;

    const morph1 = Math.sin(this.inkTime) * 6;
    const morph2 = Math.cos(this.inkTime * 1.3) * 5;

    ctx.beginPath();
    ctx.moveTo(cx, cy - 45);
    ctx.bezierCurveTo(cx + 15 + morph1, cy - 30, cx + 25 - morph2, cy + 10, cx + 5, cy + 40);
    ctx.bezierCurveTo(cx + 10, cy + 55, cx, cy + 65, cx, cy + 65);
    ctx.bezierCurveTo(cx, cy + 65, cx - 10, cy + 55, cx - 5, cy + 40);
    ctx.bezierCurveTo(cx - 25 + morph2, cy + 10, cx - 15 - morph1, cy - 30, cx, cy - 45);
    ctx.fill();

    const s1 = Math.sin(this.inkTime * 2) * 4;
    ctx.beginPath();
    ctx.arc(cx - 35, cy + 20 + s1, 8, 0, Math.PI * 2);
    ctx.arc(cx + 35, cy + 20 + s1, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderMinimap(player, sector) {
    const ctx = this.mapCtx;
    const w = this.mapCanvas.width;
    const h = this.mapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const grid = sector.grid;
    const tileSize = w / 16;

    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const tile = grid[r][c];
        if (tile > 0) {
          ctx.fillStyle = 'rgba(0, 255, 136, 0.25)';
          ctx.fillRect(c * tileSize, r * tileSize, tileSize - 1, tileSize - 1);
        }
      }
    }

    // Renderizar Sol Portal de Salida en el Minimapa
    const ex = sector.exitDoor.x * tileSize;
    const ey = sector.exitDoor.y * tileSize;
    ctx.fillStyle = sector.biochip.collected ? '#00ff88' : '#ffaa00';
    ctx.shadowColor = sector.biochip.collected ? '#00ff88' : '#ffaa00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (!sector.biochip.collected) {
      const bx = sector.biochip.x * tileSize;
      const by = sector.biochip.y * tileSize;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.fillRect(bx - 3, by - 3, 6, 6);
      ctx.shadowBlur = 0;
    }

    sector.nymphs.forEach(nymph => {
      if (nymph.alive) {
        const nx = nymph.x * tileSize;
        const ny = nymph.y * tileSize;
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const px = player.x * tileSize;
    const py = player.y * tileSize;

    ctx.save();
    ctx.translate(px, py);
    const angle = Math.atan2(player.dirY, player.dirX);
    ctx.rotate(angle);

    ctx.fillStyle = '#00e1ff';
    ctx.shadowColor = '#00e1ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  updateHealthBar(hp, maxHp) {
    const percentage = Math.max(0, (hp / maxHp) * 100);
    document.getElementById('health-bar-fill').style.width = percentage + '%';
    document.getElementById('health-text').innerText = `${Math.ceil(hp)} / ${maxHp} HP`;
  }
}

const hud = new HUDManager();
