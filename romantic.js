/**
 * ============================================================
 * MOONLIT BLOOM - ROMANTIC LOVE LETTER
 * Interactive GSAP, HTML5 Canvas, Web Audio & SVG Animation
 * Adjusted to exact design specifications & uploaded screenshots
 * ============================================================
 */

(function () {
  'use strict';

  // DOM Elements
  const canvas = document.getElementById('tree');
  const ctx = canvas.getContext('2d');

  const heroSection = document.getElementById('hero');
  const targetHeart = document.getElementById('targetHeart');
  const confessionSection = document.getElementById('confession');
  const arrowStreak = document.getElementById('arrowStreak');
  const confessionCard = document.getElementById('confessionCard');
  const confessionUnderline = document.getElementById('confessionUnderline').querySelector('path');
  const flashPortal = document.getElementById('flashPortal');

  const bloomOverlay = document.getElementById('bloomOverlay');
  const sunburst = document.getElementById('sunburst');
  const badgeYou = document.getElementById('badgeYou');
  const badgeMe = document.getElementById('badgeMe');
  const quoteStars = document.getElementById('quoteStars');
  const quoteBlooms = document.getElementById('quoteBlooms');
  const climaxHeartWrap = document.getElementById('climaxHeartWrap');
  const climaxArrowWrap = document.getElementById('climaxArrowWrap');
  const neonConfession = document.getElementById('neonConfession');

  const constellationScene = document.getElementById('constellationScene');
  const constellationLinesGroup = document.getElementById('constellationLines');
  const constellationNodesGroup = document.getElementById('constellationNodes');
  const constellationCenter = document.getElementById('constellationCenter');
  const creatureCyan = document.getElementById('creatureCyan');
  const creaturePink = document.getElementById('creaturePink');
  const againBtn = document.getElementById('againBtn');

  const bgMusic = document.getElementById('bgMusic');
  const soundToggle = document.getElementById('soundToggle');
  const soundIconOn = document.getElementById('soundIconOn');
  const soundIconOff = document.getElementById('soundIconOff');

  // Application State
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = window.devicePixelRatio || 1;

  let currentScene = 'hero'; // 'hero', 'confession', 'bloom', 'constellation'
  let isSoundMuted = false;
  let audioStarted = false;
  let masterTimeline = null;

  // Animation values manipulated via GSAP
  const animState = {
    treeGrowth: 0,
    bloomSceneAlpha: 0,
    constellationAlpha: 0,
    creatureOrbit: 0, // 0 to 1
    motesAlpha: 1
  };

  // ============================================================
  // AUDIO CONTROLLER (HTML5 Audio + Procedural Web Audio Synth)
  // ============================================================
  let audioCtx = null;
  let synthInterval = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSynthChime(frequency, delay, duration = 1.8) {
    if (!audioCtx || isSoundMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + delay);

    gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
  }

  function startProceduralMelody() {
    if (synthInterval) clearInterval(synthInterval);
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C maj
      [220.00, 261.63, 329.63, 440.00], // A min
      [174.61, 220.00, 261.63, 349.23], // F maj
      [196.00, 246.94, 293.66, 392.00]  // G maj
    ];
    let chordIdx = 0;
    synthInterval = setInterval(() => {
      if (isSoundMuted || (!bgMusic.paused && !bgMusic.muted)) return;
      const notes = chords[chordIdx % chords.length];
      notes.forEach((f, i) => {
        playSynthChime(f, i * 0.35, 2.2);
      });
      chordIdx++;
    }, 2800);
  }

  function startMusic() {
    if (audioStarted) return;
    audioStarted = true;
    initAudioContext();

    if (bgMusic) {
      bgMusic.volume = 0.65;
      bgMusic.play().then(() => {
        console.log('Romantic music playing smoothly.');
      }).catch((err) => {
        console.warn('Audio element autoplay policy engaged, using Web Audio synth fallback:', err);
        startProceduralMelody();
      });
    }
  }

  soundToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isSoundMuted = !isSoundMuted;
    if (bgMusic) bgMusic.muted = isSoundMuted;
    if (isSoundMuted) {
      soundIconOn.style.display = 'none';
      soundIconOff.style.display = 'block';
    } else {
      soundIconOn.style.display = 'block';
      soundIconOff.style.display = 'none';
      if (!audioStarted) startMusic();
    }
  });

  // ============================================================
  // PARTICLES, STARS, BOKEH & MOTES
  // ============================================================
  const stars = [];
  const bokehOrbs = [];
  const motes = [];
  const floatingPetals = [];
  const stardustTrails = [];

  function initStarfield() {
    stars.length = 0;
    const starCount = Math.floor((width * height) / 7500);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }

    bokehOrbs.length = 0;
    const colors = [
      'rgba(80, 50, 140, 0.24)',
      'rgba(45, 65, 150, 0.20)',
      'rgba(140, 50, 110, 0.18)',
      'rgba(50, 90, 180, 0.16)'
    ];
    for (let i = 0; i < 7; i++) {
      bokehOrbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 180 + 120,
        color: colors[i % colors.length],
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
      });
    }

    motes.length = 0;
    for (let i = 0; i < 45; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.6 - 0.2,
        alpha: Math.random() * 0.7 + 0.3,
        life: Math.random() * 100
      });
    }

    floatingPetals.length = 0;
    const petalColors = ['#ffe5ec', '#ffc2d1', '#ffb3c6', '#e8dff5', '#cddafd', '#d8f3dc', '#ffe5d9'];
    for (let i = 0; i < 45; i++) {
      floatingPetals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 6 + 4,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        vx: Math.random() * 0.8 + 0.2,
        vy: Math.random() * 1.1 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04,
        swaySpeed: Math.random() * 0.03 + 0.015,
        swayPhase: Math.random() * Math.PI * 2
      });
    }
  }

  // ============================================================
  // OPEN HEART WREATH BLOSSOM TREES (EXACTLY MATCHING IMAGE 3)
  // ============================================================
  let treeLeft = null;
  let treeRight = null;

  function createHeartWreathTree(startX, startY, forkX, forkY, canopyX, canopyY, scale, petalCount) {
    // 1. Trunk spine
    const trunk = [
      { x: startX, y: startY, width: 14 },
      { x: startX + (forkX - startX) * 0.5 - 15, y: startY + (forkY - startY) * 0.5, width: 10 },
      { x: forkX, y: forkY, width: 7 }
    ];

    // 2. Generate heart perimeter points (parametric 2D heart)
    const perimeterPoints = [];
    for (let i = 0; i < petalCount; i++) {
      const t = Math.PI * 2 * (i / petalCount);
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      // Petals form a ribbon/wreath around the perimeter
      const ribbonWidth = (Math.random() - 0.5) * scale * 2.2;
      const x = canopyX + (hx * scale) + ribbonWidth;
      const y = canopyY + (hy * scale) + ribbonWidth;

      perimeterPoints.push({ x, y, angle: t });
    }

    // 3. Radiating branches from the fork node to key perimeter points (ribs)
    const branches = [];
    const ribIndices = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135];
    const totalPts = perimeterPoints.length;

    for (let i = 0; i < 9; i++) {
      const targetIdx = Math.floor((i / 9) * totalPts);
      const targetPt = perimeterPoints[targetIdx];
      branches.push({
        from: { x: forkX, y: forkY },
        to: { x: targetPt.x, y: targetPt.y },
        width: 3.2
      });
    }

    // 4. Petals
    const petalColors = ['#fff0f5', '#ffd6e0', '#ffc2d1', '#ffb3c6', '#e8dff5', '#cddafd', '#d8f3dc', '#ffe5d9'];
    const petals = perimeterPoints.map((pt) => {
      return {
        x: pt.x,
        y: pt.y,
        size: Math.random() * 5 + 4.5,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        rotation: Math.random() * Math.PI * 2,
        bloomThreshold: Math.random() * 0.5 + 0.35,
        scale: 0
      };
    });

    return { trunk, branches, petals, canopyX, canopyY };
  }

  function initTrees() {
    const isMobile = width < 768;
    const heartScale = isMobile ? Math.min(width, height) * 0.0085 : Math.min(width, height) * 0.0105;

    // Left Tree ("you") - canopy at x=0.287, y=0.301 matching Image 3
    const t1StartX = width * 0.08;
    const t1StartY = height * 1.05;
    const t1ForkX = width * 0.28;
    const t1ForkY = height * 0.44;
    const t1CanopyX = width * 0.287;
    const t1CanopyY = height * 0.301;
    treeLeft = createHeartWreathTree(t1StartX, t1StartY, t1ForkX, t1ForkY, t1CanopyX, t1CanopyY, heartScale, 180);

    // Right Tree ("me") - canopy at x=0.753, y=0.571 matching Image 3
    const t2StartX = width * 0.75;
    const t2StartY = height * 1.05;
    const t2ForkX = width * 0.75;
    const t2ForkY = height * 0.72;
    const t2CanopyX = width * 0.753;
    const t2CanopyY = height * 0.571;
    treeRight = createHeartWreathTree(t2StartX, t2StartY, t2ForkX, t2ForkY, t2CanopyX, t2CanopyY, heartScale, 170);

    // Update quote and badge coordinates if needed
    if (badgeYou) {
      badgeYou.style.left = `${width * 0.36}px`;
      badgeYou.style.top = `${height * 0.16}px`;
    }
    if (badgeMe) {
      badgeMe.style.left = `${width * 0.84}px`;
      badgeMe.style.top = `${height * 0.44}px`;
    }
  }

  function drawHeartPetal(x, y, size, color, rot, scale) {
    if (scale <= 0.01) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.2);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(255, 180, 210, 0.4)';
    ctx.shadowBlur = 4;
    ctx.fill();

    ctx.restore();
  }

  function renderTree(tree, progress) {
    if (progress <= 0) return;

    ctx.save();
    ctx.strokeStyle = '#2d1b3d';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Draw trunk
    const trunkSegments = tree.trunk;
    const trunkProgress = Math.min(progress / 0.55, 1);
    if (trunkProgress > 0) {
      for (let i = 0; i < trunkSegments.length - 1; i++) {
        const segProgress = (trunkProgress - i / (trunkSegments.length - 1)) * (trunkSegments.length - 1);
        if (segProgress <= 0) break;

        const p0 = trunkSegments[i];
        const p1 = trunkSegments[i + 1];
        const curX = p0.x + (p1.x - p0.x) * Math.min(segProgress, 1);
        const curY = p0.y + (p1.y - p0.y) * Math.min(segProgress, 1);

        ctx.beginPath();
        ctx.lineWidth = p0.width;
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(curX, curY);
        ctx.stroke();
      }
    }

    // 2. Draw radiating branch ribs
    if (progress > 0.4) {
      const branchProgress = Math.min((progress - 0.4) / 0.35, 1);
      tree.branches.forEach((br) => {
        const curX = br.from.x + (br.to.x - br.from.x) * branchProgress;
        const curY = br.from.y + (br.to.y - br.from.y) * branchProgress;

        ctx.beginPath();
        ctx.lineWidth = br.width;
        ctx.moveTo(br.from.x, br.from.y);
        ctx.lineTo(curX, curY);
        ctx.stroke();
      });
    }

    // 3. Draw blossoming heart petals forming heart wreath
    tree.petals.forEach((petal) => {
      if (progress >= petal.bloomThreshold) {
        const p = Math.min((progress - petal.bloomThreshold) / 0.25, 1);
        petal.scale = p * (1 + 0.25 * Math.sin(p * Math.PI));
        drawHeartPetal(petal.x, petal.y, petal.size, petal.color, petal.rotation, petal.scale);
      }
    });

    ctx.restore();
  }

  // ============================================================
  // CONSTELLATION PATH & TWO WINGED CREATURES (IMAGE 2)
  // ============================================================
  // 10 geometric heart vertices normalized (0 to 1000) matching Image 2
  const constellationHeartPoints = [
    { x: 500, y: 310 }, // Top center dip
    { x: 640, y: 200 }, // Top right arch
    { x: 790, y: 260 }, // Right shoulder
    { x: 830, y: 480 }, // Right mid point
    { x: 680, y: 680 }, // Right lower flank
    { x: 500, y: 830 }, // Bottom point
    { x: 320, y: 680 }, // Left lower flank
    { x: 170, y: 480 }, // Left mid point
    { x: 210, y: 260 }, // Left shoulder
    { x: 360, y: 200 }  // Top left arch
  ];

  function buildConstellationSVG() {
    constellationLinesGroup.innerHTML = '';
    constellationNodesGroup.innerHTML = '';

    for (let i = 0; i < constellationHeartPoints.length; i++) {
      const p1 = constellationHeartPoints[i];
      const p2 = constellationHeartPoints[(i + 1) % constellationHeartPoints.length];

      // Draw constellation line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('class', 'constellation-line');
      line.style.animationDelay = `${i * 0.1}s`;
      constellationLinesGroup.appendChild(line);

      // Draw star node with 4-point diamond glint
      const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      node.setAttribute('class', 'constellation-node');
      node.setAttribute('transform', `translate(${p1.x}, ${p1.y})`);
      node.style.animationDelay = `${(i * 0.25) % 2.5}s`;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#ffffff');
      node.appendChild(circle);

      const starGlint = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      starGlint.setAttribute('d', 'M 0 -11 L 2 -3 L 11 0 L 2 3 L 0 11 L -2 3 L -11 0 L -2 -3 Z');
      starGlint.setAttribute('fill', 'rgba(255, 255, 255, 0.85)');
      node.appendChild(starGlint);

      constellationNodesGroup.appendChild(node);
    }
  }

  function getConstellationScreenCoord(t) {
    const pts = constellationHeartPoints;
    const count = pts.length;
    const indexFloat = (t % 1) * count;
    const idx = Math.floor(indexFloat);
    const fraction = indexFloat - idx;

    const p1 = pts[idx];
    const p2 = pts[(idx + 1) % count];

    const svgX = p1.x + (p2.x - p1.x) * fraction;
    const svgY = p1.y + (p2.y - p1.y) * fraction;

    const svgRect = document.getElementById('constellationSvg').getBoundingClientRect();
    const screenX = svgRect.left + (svgX / 1000) * svgRect.width;
    const screenY = svgRect.top + (svgY / 1000) * svgRect.height;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angleRad = Math.atan2(dy, dx);

    return { x: screenX, y: screenY, angle: angleRad };
  }

  // ============================================================
  // MASTER RENDER LOOP
  // ============================================================
  function renderScene() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background Bokeh Orbs
    ctx.save();
    bokehOrbs.forEach((orb) => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < -100) orb.x = width + 100;
      if (orb.x > width + 100) orb.x = -100;
      if (orb.y < -100) orb.y = height + 100;
      if (orb.y > height + 100) orb.y = -100;

      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 2. Draw Twinkling Stars
    ctx.save();
    ctx.fillStyle = '#ffffff';
    stars.forEach((star) => {
      star.phase += star.speed;
      star.alpha = star.baseAlpha + Math.sin(star.phase) * 0.35;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, star.alpha));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3. Draw Hero Screen Floating Motes
    if (animState.motesAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = '#ffd9e4';
      motes.forEach((mote) => {
        mote.y += mote.vy;
        mote.x += mote.vx;
        mote.life += 0.2;
        if (mote.y < -10) {
          mote.y = height + 10;
          mote.x = Math.random() * width;
        }
        ctx.globalAlpha = mote.alpha * animState.motesAlpha * (0.6 + 0.4 * Math.sin(mote.life * 0.1));
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 4. Draw Procedural Trees & Petals (Scene 2 & lingering in Scene 3 as seen in Image 2)
    const effectiveTreeAlpha = Math.max(animState.bloomSceneAlpha, animState.constellationAlpha * 0.25);
    if (animState.treeGrowth > 0.001 && effectiveTreeAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = effectiveTreeAlpha;
      if (treeLeft) renderTree(treeLeft, animState.treeGrowth);
      if (treeRight) renderTree(treeRight, animState.treeGrowth);
      ctx.restore();

      // Draw drifting loose petals
      if (animState.bloomSceneAlpha > 0.1) {
        ctx.save();
        ctx.globalAlpha = animState.bloomSceneAlpha * 0.85;
        floatingPetals.forEach((p) => {
          p.swayPhase += p.swaySpeed;
          p.x += p.vx + Math.sin(p.swayPhase) * 0.7;
          p.y += p.vy;
          p.rotation += p.vRot;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width * 0.7;
          }
          if (p.x > width + 20) p.x = -20;

          drawHeartPetal(p.x, p.y, p.size, p.color, p.rotation, 1);
        });
        ctx.restore();
      }
    }

    // 5. Draw Winged Creatures & Stardust Trails (Scene 3 - Image 2)
    if (animState.constellationAlpha > 0.01) {
      // In Image 2, creature 1 is at top dip, creature 2 is at bottom point
      const tCyan = animState.creatureOrbit % 1;
      const tPink = (animState.creatureOrbit + 0.5) % 1;

      const posCyan = getConstellationScreenCoord(tCyan);
      const posPink = getConstellationScreenCoord(tPink);

      if (creatureCyan) {
        creatureCyan.style.left = `${posCyan.x}px`;
        creatureCyan.style.top = `${posCyan.y}px`;
        creatureCyan.style.transform = `translate(-50%, -50%) rotate(${posCyan.angle}rad)`;
      }

      if (creaturePink) {
        creaturePink.style.left = `${posPink.x}px`;
        creaturePink.style.top = `${posPink.y}px`;
        creaturePink.style.transform = `translate(-50%, -50%) rotate(${posPink.angle}rad)`;
      }

      // Emit stardust particles
      if (Math.random() < 0.6) {
        stardustTrails.push({
          x: posCyan.x,
          y: posCyan.y,
          r: Math.random() * 2.5 + 1,
          color: '#8ce1ff',
          alpha: 0.9,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        });
        stardustTrails.push({
          x: posPink.x,
          y: posPink.y,
          r: Math.random() * 2.5 + 1,
          color: '#ff9ec6',
          alpha: 0.9,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        });
      }

      // Render stardust trails
      ctx.save();
      for (let i = stardustTrails.length - 1; i >= 0; i--) {
        const p = stardustTrails[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        if (p.alpha <= 0) {
          stardustTrails.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * animState.constellationAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    requestAnimationFrame(renderScene);
  }

  // ============================================================
  // GSAP CINEMATIC INTERACTIVE TIMELINE
  // ============================================================
  function setupCinematicSequence() {
    masterTimeline = gsap.timeline({ paused: true });

    // ----------------------------------------------------
    // STAGE 1: Exit Hero Screen
    // ----------------------------------------------------
    masterTimeline
      .to(targetHeart, {
        scale: 0.78,
        duration: 0.35,
        ease: 'power2.in'
      })
      .to(targetHeart, {
        scale: 1.4,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      })
      .to(heroSection, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.5,
        onComplete: () => {
          heroSection.style.visibility = 'hidden';
          currentScene = 'confession';
        }
      }, '-=0.25')
      .to(animState, {
        motesAlpha: 0,
        duration: 0.6
      }, '-=0.5');

    // ----------------------------------------------------
    // STAGE 1.5: Arrow Streak & Kinetic Typography (IMAGE 1)
    // ----------------------------------------------------
    masterTimeline
      .set(confessionSection, {
        visibility: 'visible',
        opacity: 1
      })
      .set(arrowStreak, {
        opacity: 1,
        rotation: -35,
        xPercent: -80,
        yPercent: 80
      })
      .to(arrowStreak, {
        xPercent: 120,
        yPercent: -120,
        duration: 0.9,
        ease: 'power2.inOut'
      })
      .to(confessionCard, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.2)'
      }, '-=0.45')
      .to(confessionUnderline, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.2')
      .to({}, { duration: 2.0 })
      .to(flashPortal, {
        scale: 32,
        opacity: 1,
        duration: 0.75,
        ease: 'power3.in'
      })
      .to(confessionSection, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          confessionSection.style.visibility = 'hidden';
          currentScene = 'bloom';
        }
      });

    // ----------------------------------------------------
    // STAGE 2: Blossom Trees & Climax Heart (IMAGE 3)
    // ----------------------------------------------------
    masterTimeline
      .set(bloomOverlay, {
        visibility: 'visible',
        opacity: 1
      })
      .to(flashPortal, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      })
      .to(animState, {
        bloomSceneAlpha: 1,
        treeGrowth: 1,
        duration: 4.8,
        ease: 'power1.inOut'
      }, '-=0.4')
      .to(sunburst, {
        opacity: 0.7,
        duration: 2.5,
        ease: 'power2.out'
      }, '-=4.0')
      // Tree canopy badges "you" & "me"
      .to(badgeYou, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.5)'
      }, '-=2.8')
      .to(badgeMe, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.5)'
      }, '-=2.4')
      // Ambient poetic quotes matching Image 3
      .to([quoteStars, quoteBlooms], {
        opacity: 1,
        duration: 1.2,
        stagger: 0.3,
        ease: 'power2.out'
      }, '-=2.0')
      // Climax Center Heart appears at x=72.3%, y=32.3%
      .to(climaxHeartWrap, {
        scale: 1,
        opacity: 1,
        duration: 1.0,
        ease: 'elastic.out(1, 0.6)'
      }, '-=1.2')
      // Cupid Arrow shoots through center heart
      .set(climaxArrowWrap, {
        opacity: 1,
        x: -250
      })
      .to(climaxArrowWrap, {
        x: 350,
        duration: 0.85,
        ease: 'power2.inOut'
      })
      .to(climaxHeartWrap, {
        scale: 1.2,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      }, '-=0.55')
      // Neon Calligraphy "I love you"
      .to(neonConfession, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.3')
      .to({}, { duration: 2.4 });

    // ----------------------------------------------------
    // STAGE 3: Constellation & Two Wings, One Sky (IMAGE 2)
    // ----------------------------------------------------
    masterTimeline
      .to(bloomOverlay, {
        opacity: 0,
        duration: 1.0,
        ease: 'power2.inOut',
        onComplete: () => {
          bloomOverlay.style.visibility = 'hidden';
          currentScene = 'constellation';
        }
      })
      .to(animState, {
        bloomSceneAlpha: 0,
        duration: 1.0
      }, '-=1.0')
      .set(constellationScene, {
        visibility: 'visible',
        opacity: 1
      })
      .to(animState, {
        constellationAlpha: 1,
        duration: 1.2,
        ease: 'power2.out'
      })
      .to('.constellation-line', {
        strokeDashoffset: 0,
        duration: 1.8,
        stagger: 0.08,
        ease: 'power2.out'
      }, '-=0.8')
      .to(constellationCenter, {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out'
      }, '-=1.0')
      .to('#constellationUnderline path', {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.out'
      }, '-=0.6')
      .to(againBtn, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.2)'
      }, '-=0.4')
      .to(animState, {
        creatureOrbit: '+=1000',
        duration: 12000,
        repeat: -1,
        ease: 'none'
      });
  }

  // ============================================================
  // INTERACTION HANDLERS
  // ============================================================
  function onStartJourney() {
    startMusic();
    if (masterTimeline && currentScene === 'hero') {
      masterTimeline.play();
    }
  }

  heroSection.addEventListener('click', onStartJourney);
  heroSection.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStartJourney();
    }
  });

  // Replay Functionality
  againBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!masterTimeline) return;

    gsap.to(['#constellationScene', '#bloomOverlay', '#confession'], {
      opacity: 0,
      duration: 0.6,
      onComplete: () => {
        constellationScene.style.visibility = 'hidden';
        bloomOverlay.style.visibility = 'hidden';
        confessionSection.style.visibility = 'hidden';

        masterTimeline.pause(0);

        animState.treeGrowth = 0;
        animState.bloomSceneAlpha = 0;
        animState.constellationAlpha = 0;
        animState.creatureOrbit = 0;
        animState.motesAlpha = 1;

        confessionUnderline.style.strokeDashoffset = '450';
        document.querySelectorAll('.constellation-line').forEach(l => l.style.strokeDashoffset = '400');
        const cu = document.querySelector('#constellationUnderline path');
        if (cu) cu.style.strokeDashoffset = '380';

        heroSection.style.visibility = 'visible';
        currentScene = 'hero';
        gsap.to(heroSection, { opacity: 1, pointerEvents: 'auto', duration: 0.6 });
        gsap.set(targetHeart, { scale: 1, opacity: 1 });
      }
    });
  });

  // ============================================================
  // WINDOW RESIZE HANDLER
  // ============================================================
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    initStarfield();
    initTrees();
    buildConstellationSVG();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // ============================================================
  // INITIALIZATION
  // ============================================================
  window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    setupCinematicSequence();
    renderScene();
  });

})();
