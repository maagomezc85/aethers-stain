// Generador de Texturas y Sprites HD Mejorados (128x128 con Sombreado Procedural y Efectos Brillantes)
class TextureManager {
  constructor() {
    this.TEX_SIZE = 128;
    this.textures = {};
    this.sprites = {};
    this.initTextures();
  }

  initTextures() {
    this.textures[1] = this.createWetlandWallHD();
    this.textures[2] = this.createRustedMetalWallHD();
    this.textures[3] = this.createRedRustWallHD();
    this.textures[4] = this.createDoorTextureHD();

    this.sprites['biochip'] = this.createBiochipSpriteHD();
    this.sprites['nymph'] = this.createHighResNymphSpriteHD();
    this.sprites['whip'] = this.createHighResWhipFramesHD();
    this.sprites['portal_locked'] = this.createSunPortalSpriteHD(false);
    this.sprites['portal_unlocked'] = this.createSunPortalSpriteHD(true);
  }

  // 1. Textura HD: Paredes de Cisterna Orgánica (128x128)
  createWetlandWallHD() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Fondo quitina verde oscuro
    ctx.fillStyle = '#06160d';
    ctx.fillRect(0, 0, 128, 128);

    // Ladrillos de quitina
    ctx.strokeStyle = '#030a06';
    ctx.lineWidth = 3;
    for (let y = 0; y < 128; y += 32) {
      const offset = (y / 32) % 2 === 0 ? 0 : 32;
      for (let x = -offset; x < 128; x += 64) {
        const grad = ctx.createLinearGradient(x, y, x, y + 32);
        grad.addColorStop(0, '#163826');
        grad.addColorStop(1, '#091c12');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y + 2, 60, 28);
        ctx.strokeRect(x, y, 64, 32);
      }
    }

    // Venas bioluminiscentes cian
    ctx.strokeStyle = 'rgba(0, 225, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.quadraticCurveTo(30, 40, 15, 80); ctx.quadraticCurveTo(45, 110, 20, 128);
    ctx.moveTo(85, 0); ctx.quadraticCurveTo(110, 50, 75, 90); ctx.quadraticCurveTo(120, 115, 100, 128);
    ctx.stroke();

    // Esporas de musgo reluciente
    for (let i = 0; i < 80; i++) {
      const bx = Math.random() * 128;
      const by = Math.random() * 128;
      const r = Math.random() * 3 + 1;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 200, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return ctx.getImageData(0, 0, 128, 128);
  }

  // 2. Textura HD: Metal Oxidado Industrial (128x128)
  createRustedMetalWallHD() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Placa metálica oscura
    ctx.fillStyle = '#181512';
    ctx.fillRect(0, 0, 128, 128);

    // Paneles con relieve
    ctx.strokeStyle = '#2d2722';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 120, 120);
    ctx.strokeRect(20, 20, 88, 88);

    // Textura de óxido corrido
    for (let i = 0; i < 150; i++) {
      const rx = Math.random() * 128;
      const ry = Math.random() * 128;
      const rw = Math.random() * 12 + 4;
      const rh = Math.random() * 10 + 4;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(150, 50, 20, 0.45)' : 'rgba(90, 30, 10, 0.5)';
      ctx.fillRect(rx, ry, rw, rh);
    }

    // Remaches de hierro relucientes en las esquinas
    ctx.fillStyle = '#998d82';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    [[12, 12], [116, 12], [12, 116], [116, 116], [64, 12], [64, 116]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    return ctx.getImageData(0, 0, 128, 128);
  }

  // 3. Textura HD: Muro de Óxido Rojo Sangre (128x128)
  createRedRustWallHD() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#260606';
    ctx.fillRect(0, 0, 128, 128);

    // Grietas químicas rojas incandescentes
    ctx.strokeStyle = 'rgba(255, 51, 102, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 20); ctx.lineTo(40, 50); ctx.lineTo(30, 90); ctx.lineTo(70, 128);
    ctx.moveTo(128, 30); ctx.lineTo(80, 70); ctx.lineTo(100, 100); ctx.lineTo(50, 128);
    ctx.stroke();

    // Gotas de fluido abrasivo
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = Math.random() > 0.3 ? 'rgba(255, 80, 50, 0.4)' : 'rgba(180, 20, 20, 0.6)';
      ctx.fillRect(Math.random() * 128, Math.random() * 128, Math.random() * 8 + 2, Math.random() * 8 + 2);
    }

    return ctx.getImageData(0, 0, 128, 128);
  }

  // 4. Textura HD: Compuerta de Seguridad (128x128)
  createDoorTextureHD() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#061d24';
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = '#0e3a47';
    ctx.fillRect(10, 10, 108, 108);

    // Barras cian de refuerzo
    ctx.fillStyle = '#00e1ff';
    ctx.globalAlpha = 0.7;
    for (let i = 12; i < 108; i += 16) {
      ctx.fillRect(10 + i, 10, 8, 108);
    }
    ctx.globalAlpha = 1.0;

    // Emblema central de bio-seguridad
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(64, 64, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    return ctx.getImageData(0, 0, 128, 128);
  }

  // 5. Sprite HD: Biochip Plateado (256x256)
  createBiochipSpriteHD() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Halo holográfico de luz cian
    const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 110);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 225, 255, 0.9)');
    grad.addColorStop(0.7, 'rgba(0, 255, 136, 0.4)');
    grad.addColorStop(1, 'rgba(0, 150, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Placa de aleación plateada pulida
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.fillRect(80, 80, 96, 96);
    ctx.strokeRect(80, 80, 96, 96);

    // Conectores metálicos dorados
    ctx.fillStyle = '#fbbf24';
    for (let i = 88; i <= 168; i += 20) {
      ctx.fillRect(i, 64, 8, 16);
      ctx.fillRect(i, 176, 8, 16);
      ctx.fillRect(64, i, 16, 8);
      ctx.fillRect(176, i, 16, 8);
    }

    // Núcleo cuántico
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillRect(116, 116, 24, 24);
    ctx.shadowBlur = 0;

    return canvas;
  }

  // 6. Sprite HD: Ninfa de Libélula (256x256)
  createHighResNymphSpriteHD() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const cx = 128;

    // Alas translúcidas luminosas
    ctx.fillStyle = 'rgba(0, 225, 255, 0.22)';
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.ellipse(65, 105, 70, 20, -0.4, 0, Math.PI * 2);
    ctx.ellipse(55, 135, 60, 16, -0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(191, 105, 70, 20, 0.4, 0, Math.PI * 2);
    ctx.ellipse(201, 135, 60, 16, 0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Patas articuladas cian
    ctx.strokeStyle = '#00e1ff';
    ctx.lineWidth = 4;
    [115, 145, 175].forEach((ly, idx) => {
      ctx.beginPath();
      ctx.moveTo(cx - 32, ly); ctx.lineTo(cx - 80, ly - 22 + idx * 10); ctx.lineTo(cx - 105, ly + 25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 32, ly); ctx.lineTo(cx + 80, ly - 22 + idx * 10); ctx.lineTo(cx + 105, ly + 25);
      ctx.stroke();
    });

    // Abdomen segmentado con quitina
    const grad = ctx.createLinearGradient(cx, 110, cx, 235);
    grad.addColorStop(0, '#154028');
    grad.addColorStop(1, '#05140b');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, 175, 40, 58, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Tórax
    ctx.fillStyle = '#1c4a30';
    ctx.beginPath();
    ctx.ellipse(cx, 115, 48, 34, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Cabeza
    ctx.fillStyle = '#0d2417';
    ctx.beginPath();
    ctx.arc(cx, 75, 40, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Ojos compuestos rojos brillantes
    const eL = ctx.createRadialGradient(cx - 24, 68, 3, cx - 24, 68, 18);
    eL.addColorStop(0, '#ffffff');
    eL.addColorStop(0.3, '#ff3366');
    eL.addColorStop(1, '#66001a');
    ctx.fillStyle = eL;
    ctx.beginPath(); ctx.arc(cx - 24, 68, 18, 0, Math.PI * 2); ctx.fill();

    const eR = ctx.createRadialGradient(cx + 24, 68, 3, cx + 24, 68, 18);
    eR.addColorStop(0, '#ffffff');
    eR.addColorStop(0.3, '#ff3366');
    eR.addColorStop(1, '#66001a');
    ctx.fillStyle = eR;
    ctx.beginPath(); ctx.arc(cx + 24, 68, 18, 0, Math.PI * 2); ctx.fill();

    // Mandíbulas afiladas
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 16, 102); ctx.lineTo(cx - 30, 128); ctx.lineTo(cx - 12, 130);
    ctx.moveTo(cx + 16, 102); ctx.lineTo(cx + 30, 128); ctx.lineTo(cx + 12, 130);
    ctx.stroke();

    // Antenas cian
    ctx.strokeStyle = '#00e1ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 16, 42); ctx.quadraticCurveTo(cx - 42, 18, cx - 58, 12);
    ctx.moveTo(cx + 16, 42); ctx.quadraticCurveTo(cx + 42, 18, cx + 58, 12);
    ctx.stroke();

    return canvas;
  }

  // 7. Sprite HD: Sol Portal de Salida / Gran Sol (256x256)
  createSunPortalSpriteHD(unlocked) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const cx = 128;
    const cy = 128;

    // Resplandor del Sol
    const sunGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, 124);
    if (unlocked) {
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      sunGrad.addColorStop(0.25, 'rgba(0, 255, 136, 0.95)');
      sunGrad.addColorStop(0.65, 'rgba(0, 225, 255, 0.5)');
      sunGrad.addColorStop(1, 'rgba(0, 255, 136, 0)');
    } else {
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      sunGrad.addColorStop(0.25, 'rgba(255, 170, 0, 0.95)');
      sunGrad.addColorStop(0.65, 'rgba(255, 51, 102, 0.5)');
      sunGrad.addColorStop(1, 'rgba(255, 51, 102, 0)');
    }

    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 256, 256);

    // Rayos solares giratorios
    ctx.strokeStyle = unlocked ? 'rgba(0, 255, 136, 0.85)' : 'rgba(255, 170, 0, 0.85)';
    ctx.lineWidth = 5;
    for (let i = 0; i < 20; i++) {
      const angle = (i * Math.PI) / 10;
      const r1 = 48;
      const r2 = 108 + (i % 2 === 0 ? 18 : 0);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }

    // Núcleo solar
    ctx.fillStyle = unlocked ? '#00ff88' : '#ffaa00';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    if (unlocked) {
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#04150d';
      ctx.font = '900 26px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SOL', cx, cy);
    } else {
      ctx.fillStyle = '#1a0505';
      ctx.fillRect(cx - 16, cy - 8, 32, 28);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 12, Math.PI, 0);
      ctx.stroke();
    }

    return canvas;
  }

  // 8. Frames HD del Brazo y Látigo Espinoso (512x512)
  createHighResWhipFramesHD() {
    const frames = [];
    const f0 = document.createElement('canvas');
    f0.width = f0.height = 512;
    const c0 = f0.getContext('2d');
    this.drawArmHD(c0, false);
    this.drawWhipHD(c0, false);
    frames.push(f0);

    const f1 = document.createElement('canvas');
    f1.width = f1.height = 512;
    const c1 = f1.getContext('2d');
    this.drawArmHD(c1, true);
    this.drawWhipHD(c1, true);
    frames.push(f1);

    return frames;
  }

  drawArmHD(ctx, isAttacking) {
    ctx.save();
    const bX = isAttacking ? 270 : 310;
    const bY = isAttacking ? 330 : 350;

    const grad = ctx.createLinearGradient(bX, bY, bX + 180, 512);
    grad.addColorStop(0, '#1c3d30');
    grad.addColorStop(0.5, '#0e241c');
    grad.addColorStop(1, '#050f0b');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(bX + 20, bY + 60);
    ctx.lineTo(bX + 180, 512);
    ctx.lineTo(512, 512);
    ctx.lineTo(bX + 200, bY + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Circuitos cian que brillan
    ctx.strokeStyle = '#00e1ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00e1ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(bX + 40, bY + 70);
    ctx.lineTo(bX + 130, 480);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Placas de articulación con espinas
    ctx.fillStyle = '#0f2b20';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const fx = bX + 10 + i * 24;
      const fy = bY + 30 + i * 10;
      ctx.beginPath();
      ctx.arc(fx, fy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx - 18, fy - 22, fx - 10, fy - 38);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawWhipHD(ctx, isAttacking) {
    ctx.save();
    if (!isAttacking) {
      // Núcleo del látigo
      ctx.fillStyle = '#1e382b';
      ctx.strokeStyle = '#00e1ff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(285, 315, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cuerda espinosa
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 7;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(285, 315);
      ctx.bezierCurveTo(335, 235, 395, 175, 415, 115);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Espinas fluorescentes
      ctx.fillStyle = '#ff3366';
      [{ x: 325, y: 255 }, { x: 360, y: 205 }, { x: 388, y: 155 }, { x: 410, y: 120 }].forEach(pt => {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - 14, pt.y - 10);
        ctx.lineTo(pt.x - 4, pt.y + 12);
        ctx.closePath();
        ctx.fill();
      });
    } else {
      // Latigazo extendido resplandeciente
      ctx.strokeStyle = '#00e1ff';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(340, 370);
      ctx.bezierCurveTo(270, 110, 110, 50, 10, 150);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Espinas de energía en ataque
      ctx.fillStyle = '#ff3366';
      [{ x: 270, y: 210 }, { x: 200, y: 120 }, { x: 120, y: 75 }, { x: 40, y: 120 }].forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00ffff';
        ctx.fillRect(pt.x - 3, pt.y - 14, 6, 28);
        ctx.fillStyle = '#ff3366';
      });
    }
    ctx.restore();
  }
}

const textures = new TextureManager();
