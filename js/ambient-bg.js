(function () {
  "use strict";

  /* ============================================================
     AMBIENT BACKGROUND — "System Constellation"
     A subtle, living network of nodes + connecting lines that
     echoes the site's systems-diagram language. Drifting points,
     thin links that fade with distance, rare orange accent nodes.

     Usage: place a host element on the page —
       <div class="ambient-bg" data-ambient="dark|light" aria-hidden="true"></div>
     One canvas is created per host. Honors prefers-reduced-motion,
     scales to devicePixelRatio, and pauses when off-screen / hidden.
  ============================================================ */

  var REDUCED = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* node/line/accent colors as "r, g, b" strings + alpha budgets */
  var THEMES = {
    dark: {
      ink: "217, 223, 225" /* platinum */,
      accent: "255, 97, 26" /* orange */,
      nodeAlpha: 0.5,
      lineAlpha: 0.2,
    },
    light: {
      ink: "19, 25, 30" /* dark-coffee */,
      accent: "255, 97, 26" /* orange */,
      nodeAlpha: 0.42,
      lineAlpha: 0.14,
    },
  };

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function Field(host) {
    this.host = host;
    this.theme =
      THEMES[host.getAttribute("data-ambient") === "light" ? "light" : "dark"];
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.host.appendChild(this.canvas);

    this.nodes = [];
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.linkDist = 132;
    this.raf = 0;
    this.running = false;
    this.onScreen = true;

    /* smoothed pointer-driven parallax for gentle depth */
    this.px = 0; /* target offset */
    this.py = 0;
    this.ox = 0; /* current offset */
    this.oy = 0;

    this.tick = this.tick.bind(this);
    this.resize();
    this.bind();

    if (REDUCED) {
      this.draw(); /* one static frame — no motion */
    } else {
      this.start();
    }
  }

  Field.prototype.seed = function () {
    var area = this.w * this.h;
    var count = Math.max(18, Math.min(84, Math.round(area / 17000)));
    this.nodes = [];
    for (var i = 0; i < count; i++) {
      var accent = Math.random() < 0.08;
      this.nodes.push({
        x: rand(0, this.w),
        y: rand(0, this.h),
        vx: rand(-0.28, 0.28),
        vy: rand(-0.28, 0.28),
        r: accent ? rand(1.8, 2.6) : rand(0.9, 1.9),
        accent: accent,
        /* slow twinkle so nodes feel alive without flashing */
        tw: rand(0, Math.PI * 2),
        twSpeed: rand(0.004, 0.012),
      });
    }
    /* link distance scales a touch with viewport size */
    this.linkDist = Math.max(110, Math.min(168, Math.sqrt(area) / 7.5));
  };

  Field.prototype.resize = function () {
    var w = this.host.clientWidth;
    var h = this.host.clientHeight;
    if (!w || !h) return;
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seed();
    if (REDUCED) this.draw();
  };

  Field.prototype.bind = function () {
    var self = this;

    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(function () {
        self.resize();
      });
      this._ro.observe(this.host);
    } else {
      window.addEventListener("resize", function () {
        self.resize();
      });
    }

    /* Pause when the host scrolls out of view */
    if (typeof IntersectionObserver !== "undefined") {
      this._io = new IntersectionObserver(
        function (entries) {
          self.onScreen = entries[0].isIntersecting;
          if (!REDUCED) {
            if (self.onScreen) self.start();
            else self.stop();
          }
        },
        { threshold: 0 }
      );
      this._io.observe(this.host);
    }

    document.addEventListener("visibilitychange", function () {
      if (REDUCED) return;
      if (document.hidden) self.stop();
      else if (self.onScreen) self.start();
    });

    if (!REDUCED) {
      window.addEventListener(
        "pointermove",
        function (e) {
          var rect = self.host.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          /* map pointer to a small parallax offset (±7px) */
          self.px = ((e.clientX - cx) / rect.width) * 14;
          self.py = ((e.clientY - cy) / rect.height) * 14;
        },
        { passive: true }
      );
    }
  };

  Field.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.tick);
  };

  Field.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  };

  Field.prototype.tick = function () {
    if (!this.running) return;
    this.update();
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  Field.prototype.update = function () {
    var n = this.nodes;
    for (var i = 0; i < n.length; i++) {
      var p = n[i];
      p.x += p.vx;
      p.y += p.vy;
      p.tw += p.twSpeed;

      /* wrap softly around the edges for an endless field */
      if (p.x < -20) p.x = this.w + 20;
      else if (p.x > this.w + 20) p.x = -20;
      if (p.y < -20) p.y = this.h + 20;
      else if (p.y > this.h + 20) p.y = -20;
    }
    /* ease parallax toward target */
    this.ox += (this.px - this.ox) * 0.05;
    this.oy += (this.py - this.oy) * 0.05;
  };

  Field.prototype.draw = function () {
    var ctx = this.ctx;
    var t = this.theme;
    var n = this.nodes;
    var dist = this.linkDist;
    var ox = this.ox;
    var oy = this.oy;

    ctx.clearRect(0, 0, this.w, this.h);

    /* links first, so nodes sit on top */
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      for (var j = i + 1; j < n.length; j++) {
        var b = n[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 > dist * dist) continue;
        var d = Math.sqrt(d2);
        var fade = 1 - d / dist;
        var pair = a.accent || b.accent;
        var color = pair ? t.accent : t.ink;
        ctx.strokeStyle =
          "rgba(" +
          color +
          "," +
          (t.lineAlpha * fade * (pair ? 1.1 : 1)).toFixed(3) +
          ")";
        ctx.lineWidth = pair ? 0.9 : 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x + ox, a.y + oy);
        ctx.lineTo(b.x + ox, b.y + oy);
        ctx.stroke();
      }
    }

    /* nodes */
    for (var k = 0; k < n.length; k++) {
      var p = n[k];
      var twinkle = 0.78 + Math.sin(p.tw) * 0.22;
      var x = p.x + ox;
      var y = p.y + oy;
      if (p.accent) {
        /* soft glow on accent nodes */
        var glow = ctx.createRadialGradient(x, y, 0, x, y, p.r * 6);
        glow.addColorStop(0, "rgba(" + t.accent + ",0.28)");
        glow.addColorStop(1, "rgba(" + t.accent + ",0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle =
          "rgba(" + t.accent + "," + (0.9 * twinkle).toFixed(3) + ")";
      } else {
        ctx.fillStyle =
          "rgba(" + t.ink + "," + (t.nodeAlpha * twinkle).toFixed(3) + ")";
      }
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  function init() {
    var hosts = document.querySelectorAll(".ambient-bg");
    for (var i = 0; i < hosts.length; i++) {
      /* guard against double-init */
      if (hosts[i].dataset.ambientReady) continue;
      hosts[i].dataset.ambientReady = "1";
      new Field(hosts[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
