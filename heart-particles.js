/**
 * Hiệu ứng trái tim particle (canvas) — trái tim vỡ ra thành từng mảnh bay
 * Chỉ chạy khi màn chúc mừng hiện (sau khi bấm Có).
 */
window.HeartParticles = (function () {
  'use strict';

  var settings = {
    particles: {
      length: 520,
      duration: 2.2,
      velocity: 95,
      effect: -0.72,
      size: 34
    },
    color: '#e11d48'
  };

  function Point(x, y) {
    this.x = x !== undefined ? x : 0;
    this.y = y !== undefined ? y : 0;
  }
  Point.prototype.clone = function () {
    return new Point(this.x, this.y);
  };
  Point.prototype.length = function (len) {
    if (len === undefined) return Math.sqrt(this.x * this.x + this.y * this.y);
    this.normalize();
    this.x *= len;
    this.y *= len;
    return this;
  };
  Point.prototype.normalize = function () {
    var len = this.length();
    this.x /= len;
    this.y /= len;
    return this;
  };

  function Particle() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  Particle.prototype.initialize = function (x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  };
  Particle.prototype.update = function (deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };
  Particle.prototype.draw = function (context, image) {
    function ease(t) {
      return (--t) * t * t + 1;
    }
    var size = image.width * ease(this.age / settings.particles.duration);
    context.globalAlpha = 1 - this.age / settings.particles.duration;
    context.drawImage(
      image,
      this.position.x - size / 2,
      this.position.y - size / 2,
      size,
      size
    );
  };

  function ParticlePool(length) {
    var particles = [];
    for (var i = 0; i < length; i++) particles.push(new Particle());
    var firstActive = 0;
    var firstFree = 0;
    var duration = settings.particles.duration;

    this.add = function (x, y, dx, dy) {
      particles[firstFree].initialize(x, y, dx, dy);
      firstFree++;
      if (firstFree === length) firstFree = 0;
      if (firstActive === firstFree) firstActive++;
      if (firstActive === length) firstActive = 0;
    };
    this.update = function (deltaTime) {
      var i;
      if (firstActive < firstFree) {
        for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime);
      }
      if (firstFree < firstActive) {
        for (i = firstActive; i < length; i++) particles[i].update(deltaTime);
        for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
      }
      while (particles[firstActive].age >= duration && firstActive !== firstFree) {
        firstActive++;
        if (firstActive === length) firstActive = 0;
      }
    };
    this.draw = function (context, image) {
      if (firstActive < firstFree) {
        for (i = firstActive; i < firstFree; i++) particles[i].draw(context, image);
      }
      if (firstFree < firstActive) {
        for (i = firstActive; i < length; i++) particles[i].draw(context, image);
        for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
      }
    };
  }

  function pointOnHeart(t) {
    return new Point(
      160 * Math.pow(Math.sin(t), 3),
      130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
    );
  }

  function createHeartImage() {
    var c = document.createElement('canvas');
    c.width = settings.particles.size;
    c.height = settings.particles.size;
    var ctx = c.getContext('2d');
    function to(t) {
      var p = pointOnHeart(t);
      p.x = settings.particles.size / 2 + (p.x * settings.particles.size) / 350;
      p.y = settings.particles.size / 2 - (p.y * settings.particles.size) / 350;
      return p;
    }
    ctx.beginPath();
    var t = -Math.PI;
    var p = to(t);
    ctx.moveTo(p.x, p.y);
    while (t < Math.PI) {
      t += 0.01;
      p = to(t);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = settings.color;
    ctx.fill();
    var img = new Image();
    img.src = c.toDataURL();
    return img;
  }

  var animId = null;
  var heartImage = null;

  function start(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var particles = new ParticlePool(settings.particles.length);
    var particleRate = settings.particles.length / settings.particles.duration;
    var time;

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    function render() {
      animId = requestAnimationFrame(render);
      var newTime = Date.now() / 1000;
      var deltaTime = newTime - (time !== undefined ? time : newTime);
      time = newTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var amount = particleRate * deltaTime;
      for (var i = 0; i < amount; i++) {
        var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
        var dir = pos.clone().length(settings.particles.velocity);
        particles.add(
          canvas.width / 2 + pos.x,
          canvas.height / 2 - pos.y,
          dir.x,
          -dir.y
        );
      }
      particles.update(deltaTime);
      if (heartImage && heartImage.complete) particles.draw(ctx, heartImage);
    }

    heartImage = createHeartImage();
    resize();
    window.addEventListener('resize', resize);
    render();
  }

  function stop() {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  return { start: start, stop: stop };
})();
