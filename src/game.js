// Motor Principal del Juego (Con soporte para pitch vertical del ratón hacia arriba y abajo)
class GameEngine {
  constructor() {
    this.currentSectorIndex = 0;
    this.sector = null;
    this.score = 0;
    this.player = {
      x: 1.5,
      y: 1.5,
      dirX: 1,
      dirY: 0,
      pitch: 0, // Ángulo/Desplazamiento vertical de mirada (Pitch)
      hp: 100,
      maxHp: 100,
      rotSpeed: 0.04,
      moveSpeed: 0.065
    };
    this.keys = {};
    this.attackFrame = 0;
    this.isAttacking = false;
    this.damageFlash = false;
    this.gameRunning = false;
    this.isPointerLocked = false;

    this.setupControls();
    this.loadSector(0);
  }

  loadSector(index) {
    this.currentSectorIndex = index;
    this.sector = JSON.parse(JSON.stringify(SECTORS[index]));
    this.player.x = this.sector.playerStart.x;
    this.player.y = this.sector.playerStart.y;
    this.player.dirX = this.sector.playerStart.dirX;
    this.player.dirY = this.sector.playerStart.dirY;
    this.player.pitch = 0;

    document.getElementById('sector-title').innerText = this.sector.name;
    this.updateObjectiveUI();
    this.updateScoreUI();
    this.showIntro(this.sector);
  }

  showIntro(sector) {
    this.gameRunning = false;
    if (document.exitPointerLock) document.exitPointerLock();

    const modal = document.getElementById('overlay-screen');
    modal.querySelector('.glitch-title').innerText = sector.name;
    modal.querySelector('.subtitle').innerText = sector.id <= 4 ? `SECTOR ${sector.id} DE IV` : `EPÍLOGO FINAL`;
    modal.querySelector('.story-box').innerHTML = `
      <p><strong>HISTORIA DE EFE:</strong> ${sector.story}</p><br>
      <p><strong>OBJETIVO:</strong> <em>${sector.objective}</em></p>
    `;
    
    const btn = document.getElementById('start-btn');
    btn.innerText = sector.id <= 4 ? `INGRESAR AL SECTOR ${sector.id}` : `INGRESAR AL GRAN SOL`;
    btn.onclick = () => {
      sounds.init();
      modal.classList.remove('active');
      this.gameRunning = true;
      this.showToast(`INICIADO: ${sector.name}`);
      document.getElementById('view-canvas').requestPointerLock();
      this.loop();
    };
    modal.classList.add('active');
  }

  setupControls() {
    const canvas = document.getElementById('view-canvas');

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.key) {
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.key.toUpperCase()] = true;
      }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && this.gameRunning) {
        e.preventDefault();
      }
      if (e.code === 'Space' && !this.isAttacking && this.gameRunning) {
        this.attack();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.key) {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.key.toUpperCase()] = false;
      }
    });

    canvas.addEventListener('click', () => {
      sounds.init();
      if (this.gameRunning && !this.isPointerLocked) {
        canvas.requestPointerLock();
      } else if (this.gameRunning && this.isPointerLocked && !this.isAttacking) {
        this.attack();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === canvas);
      if (this.isPointerLocked) {
        this.showToast("Control 3D de Ratón ACTIVADO (ESC para liberar)");
      }
    });

    // Control de vista vertical y horizontal completo con Ratón (Pointer Lock)
    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked && this.gameRunning) {
        const mX = e.movementX || 0;
        const mY = e.movementY || 0;

        // Movimiento Horizontal (Yaw)
        if (mX !== 0) {
          this.rotate(mX * 0.0035);
        }

        // Movimiento Vertical (Pitch: Arriba / Abajo)
        if (mY !== 0) {
          this.player.pitch -= mY * 0.9;
          // Limitar ángulo de inclinación vertical entre -140px y +140px
          this.player.pitch = Math.max(-140, Math.min(140, this.player.pitch));
        }
      }
    });
  }

  attack() {
    this.isAttacking = true;
    this.attackFrame = 8;
    sounds.playWhipSound();

    this.sector.nymphs.forEach(n => {
      if (n.alive) {
        const dx = n.x - this.player.x;
        const dy = n.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dot = (dx * this.player.dirX + dy * this.player.dirY) / (dist || 1);

        if (dist <= 2.2 && dot > 0.6) {
          n.hp -= 25;
          sounds.playNymphRoar();
          if (n.hp <= 0) {
            n.alive = false;
            this.addScore(150, "NINFA ELIMINADA +150 PTS");
            this.showToast("¡NINFA DE LIBÉLULA ELIMINADA!");
          } else {
            this.showToast(`Impacto en Ninfa (${n.hp} HP restantes)`);
          }
        }
      }
    });
  }

  addScore(pts, label) {
    this.score += pts;
    this.updateScoreUI();
    const wrapper = document.getElementById('viewport-wrapper');
    const p = document.createElement('div');
    p.className = 'score-popup';
    p.innerText = label || `+${pts} PTS`;
    p.style.left = '50%';
    p.style.top = '45%';
    wrapper.appendChild(p);
    setTimeout(() => { if (wrapper.contains(p)) wrapper.removeChild(p); }, 1200);
  }

  updateScoreUI() {
    const el = document.getElementById('score-text');
    if (el) el.innerText = `${this.score} PTS`;
  }

  isKey(code, ch) {
    return this.keys[code] || this.keys[ch] || this.keys[ch.toUpperCase()];
  }

  updatePlayer() {
    let m = 0, s = 0;
    if (this.isKey('KeyW', 'w') || this.keys['ArrowUp']) m = this.player.moveSpeed;
    if (this.isKey('KeyS', 's') || this.keys['ArrowDown']) m = -this.player.moveSpeed;
    if (this.isKey('KeyA', 'a')) s = -this.player.moveSpeed * 0.8;
    if (this.isKey('KeyD', 'd')) s = this.player.moveSpeed * 0.8;

    if (this.keys['ArrowLeft'] || this.isKey('KeyQ', 'q')) this.rotate(-this.player.rotSpeed);
    if (this.keys['ArrowRight'] || this.isKey('KeyE', 'e')) this.rotate(this.player.rotSpeed);

    let dx = 0, dy = 0;
    if (m !== 0) { dx += this.player.dirX * m; dy += this.player.dirY * m; }
    if (s !== 0) {
      const pX = -this.player.dirY, pY = this.player.dirX;
      dx += pX * s; dy += pY * s;
    }

    if (dx !== 0 || dy !== 0) {
      this.tryMove(this.player.x + dx, this.player.y + dy);
    }

    if (this.attackFrame > 0) {
      this.attackFrame--;
      if (this.attackFrame === 0) this.isAttacking = false;
    }
  }

  rotate(ang) {
    const oX = this.player.dirX;
    this.player.dirX = this.player.dirX * Math.cos(ang) - this.player.dirY * Math.sin(ang);
    this.player.dirY = oX * Math.sin(ang) + this.player.dirY * Math.cos(ang);
  }

  tryMove(nX, nY) {
    const g = this.sector.grid;
    const mar = 0.2;
    const cX = nX + (nX > this.player.x ? mar : -mar);
    if (g[Math.floor(this.player.y)] && g[Math.floor(this.player.y)][Math.floor(cX)] === 0) this.player.x = nX;
    const cY = nY + (nY > this.player.y ? mar : -mar);
    if (g[Math.floor(cY)] && g[Math.floor(cY)][Math.floor(this.player.x)] === 0) this.player.y = nY;
  }

  updateNymphs() {
    const g = this.sector.grid;
    const nSpd = 0.016;
    const mar = 0.25;

    this.sector.nymphs.forEach(n => {
      if (!n.alive) return;
      const dx = this.player.x - n.x;
      const dy = this.player.y - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 7.0 && dist > 0.5) {
        const nextX = n.x + (dx / dist) * nSpd;
        const nextY = n.y + (dy / dist) * nSpd;

        const cX = nextX + (nextX > n.x ? mar : -mar);
        if (g[Math.floor(n.y)] && g[Math.floor(n.y)][Math.floor(cX)] === 0) n.x = nextX;
        const cY = nextY + (nextY > n.y ? mar : -mar);
        if (g[Math.floor(cY)] && g[Math.floor(cY)][Math.floor(n.x)] === 0) n.y = nextY;
      }

      if (dist <= 0.6) {
        this.hurt(8);
      }
    });
  }

  checkPickups() {
    if (!this.sector.biochip.collected) {
      const dist = Math.sqrt((this.player.x - this.sector.biochip.x) ** 2 + (this.player.y - this.sector.biochip.y) ** 2);
      if (dist <= 0.7) {
        this.sector.biochip.collected = true;
        sounds.playBiochipSound();
        this.addScore(500, "BIOCHIP RECOGIDO +500 PTS");
        this.showToast("¡BIOCHIP PLATEADO RECOGIDO! Sol Portal Desbloqueado");
        this.updateObjectiveUI();
      }
    }

    const distExit = Math.sqrt((this.player.x - this.sector.exitDoor.x) ** 2 + (this.player.y - this.sector.exitDoor.y) ** 2);
    if (distExit <= 1.2) {
      if (this.sector.biochip.collected) {
        sounds.playDoorOpenSound();
        this.addScore(1000, "SECTOR COMPLETADO +1000 PTS");
        this.nextSector();
      } else {
        this.showToast("SOL PORTAL BLOQUEADO. Necesitas el Biochip Plateado.");
      }
    }
  }

  hurt(dmg) {
    if (this.damageFlash) return;
    this.player.hp -= dmg;
    this.damageFlash = true;
    sounds.playPlayerHurtSound();

    const o = document.getElementById('damage-overlay');
    o.classList.add('active');
    setTimeout(() => {
      o.classList.remove('active');
      this.damageFlash = false;
    }, 200);

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.gameOver();
    }
  }

  nextSector() {
    if (this.currentSectorIndex < SECTORS.length - 1) {
      this.loadSector(this.currentSectorIndex + 1);
    } else {
      this.victory();
    }
  }

  gameOver() {
    this.gameRunning = false;
    if (document.exitPointerLock) document.exitPointerLock();

    const m = document.getElementById('overlay-screen');
    m.querySelector('.glitch-title').innerText = "CICLO INTERRUMPIDO";
    m.querySelector('.subtitle').innerText = `PUNTUACIÓN FINAL: ${this.score} PTS`;
    m.querySelector('.story-box').innerHTML = "<p>Las Ninfas de Libélula han superado tu exoesqueleto. Inténtalo de nuevo para escapar del ciclo.</p>";
    
    const b = document.getElementById('start-btn');
    b.innerText = "REINTENTAR SECTOR";
    b.onclick = () => {
      this.player.hp = 100;
      this.loadSector(this.currentSectorIndex);
    };
    m.classList.add('active');
  }

  victory() {
    this.gameRunning = false;
    if (document.exitPointerLock) document.exitPointerLock();

    const m = document.getElementById('overlay-screen');
    m.querySelector('.glitch-title').innerText = "METAMORFOSIS COMPLETA";
    m.querySelector('.subtitle').innerText = "EFE: EL EFEMERÓPTERO";
    m.querySelector('.story-box').innerHTML = `
      <p style="font-size:1.15rem; line-height:1.6; color:#00ff88; text-align:center; font-weight:bold;">
        "Aunque recolectaste todos tus chips para salvar a tu raza, te transformaste en un adulto."
      </p>
      <p style="font-size:1.4rem; font-weight:900; color:#00e1ff; text-align:center; margin-top:14px; text-shadow:0 0 10px rgba(0,225,255,0.6);">
        EFE, eres ahora un Efemeróptero.
      </p>
      <p style="font-size:0.9rem; color:#a0b0c0; text-align:center; margin-top:16px;">
        Puntuación Final acumulada: <strong>${this.score} PUNTOS</strong>
      </p>
    `;

    const b = document.getElementById('start-btn');
    b.innerText = "JUGAR DE NUEVO";
    b.onclick = () => {
      this.score = 0;
      this.player.hp = 100;
      this.loadSector(0);
    };
    m.classList.add('active');
  }

  updateObjectiveUI() {
    const objText = document.getElementById('objective-text');
    const doorStatus = document.getElementById('door-status');
    const doorText = document.getElementById('door-text');

    if (this.sector.id === 5) {
      objText.innerText = "Todos los chips recolectados";
      doorStatus.className = "status-indicator unlocked";
      doorText.innerText = "Gran Sol: ALCANZABLE";
    } else if (this.sector.biochip.collected) {
      objText.innerText = "Biochip Plateado: CONSEGUIDO";
      doorStatus.className = "status-indicator unlocked";
      doorText.innerText = "Sol Portal: DESBLOQUEADO";
    } else {
      objText.innerText = "Localiza el Biochip Plateado";
      doorStatus.className = "status-indicator locked";
      doorText.innerText = "Sol Portal: BLOQUEADO";
    }
  }

  showToast(msg) {
    const t = document.getElementById('game-toast');
    t.innerText = msg;
    t.classList.add('visible');
    setTimeout(() => t.classList.remove('visible'), 2500);
  }

  loop() {
    if (!this.gameRunning) return;
    this.updatePlayer();
    this.updateNymphs();
    this.checkPickups();

    raycaster.render(this.player, this.sector, this.attackFrame);
    hud.update(this.player, this.sector, this.damageFlash);

    requestAnimationFrame(() => this.loop());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});
