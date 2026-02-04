(function () {
  'use strict';

  var screenEnvelope = document.getElementById('screenEnvelope');
  var screenLetter = document.getElementById('screenLetter');
  var screenYes = document.getElementById('screenYes');
  var envelopeWrap = document.getElementById('envelopeWrap');
  var btnYes = document.getElementById('btnYes');
  var btnNo = document.getElementById('btnNo');
  var btnClose = document.getElementById('btnClose');
  var letterView = document.getElementById('letterView');
  var letterChoices = document.getElementById('letterChoices');
  var confession = document.getElementById('confession');
  var heartCanvas = document.getElementById('heartParticles');

  if (!screenEnvelope || !envelopeWrap || !screenLetter || !btnYes || !btnNo) {
    return;
  }

  var noButtonMovedToBody = false;
  var confessionTimeouts = [];

  // Đưa nút Không ra body để nhảy đúng viewport
  function attachNoButtonToBody() {
    if (noButtonMovedToBody) return;
    noButtonMovedToBody = true;
    var rect = btnNo.getBoundingClientRect();
    var placeholder = document.createElement('span');
    placeholder.className = 'btn-no-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    btnNo.parentNode.insertBefore(placeholder, btnNo.nextSibling);
    document.body.appendChild(btnNo);
    btnNo.classList.add('flying');
    btnNo.style.left = rect.left + 'px';
    btnNo.style.top = rect.top + 'px';
    btnNo.style.right = 'auto';
    btnNo.style.bottom = 'auto';
    btnNo.style.margin = '0';
    btnNo.style.transform = 'none';
  }

  // Các lời tỏ tình hiện lên sau mỗi 5 giây
  function startConfessionTimers() {
    var lines = confession ? confession.querySelectorAll('.confession-line') : [];
    lines.forEach(function (line) {
      var delay = parseInt(line.getAttribute('data-delay'), 10) * 1000;
      var t = setTimeout(function () {
        line.classList.add('show');
      }, delay);
      confessionTimeouts.push(t);
    });
  }

  function clearConfessionTimers() {
    confessionTimeouts.forEach(function (t) { clearTimeout(t); });
    confessionTimeouts = [];
  }

  // Bấm vào bao thư → thư trồi ra, hiện màn đọc thư (lời tỏ tình hiện sau 5s)
  envelopeWrap.addEventListener('click', function () {
    if (envelopeWrap.classList.contains('opened')) return;
    envelopeWrap.classList.add('opened');
    setTimeout(function () {
      screenEnvelope.classList.add('hidden');
      screenLetter.classList.add('visible');
      letterView.style.display = 'flex';
      letterChoices.classList.remove('visible');
      if (confession) {
        confession.querySelectorAll('.confession-line').forEach(function (el) { el.classList.remove('show'); });
        startConfessionTimers();
      }
    }, 650);
  });

  // Bấm Đóng → ẩn thư, hiện câu hỏi + Có/Không
  if (btnClose && letterView && letterChoices) {
    btnClose.addEventListener('click', function () {
      clearConfessionTimers();
      letterView.style.display = 'none';
      letterChoices.classList.add('visible');
      attachNoButtonToBody();
    });
  }

  // Bấm Có → thư + bao thư biến mất, hiện màn chúc mừng + hiệu ứng particle trái tim (canvas)
  btnYes.addEventListener('click', function () {
    // 1. Ẩn nút Không ngay (phải mất khi bấm Có)
    btnNo.classList.add('gone');
    // 2. Cho thư mờ và thu nhỏ rồi ẩn hẳn
    screenLetter.classList.add('fade-out');
    screenEnvelope.classList.add('gone');
    setTimeout(function () {
      screenLetter.classList.remove('visible');
      screenLetter.classList.add('gone');
      screenLetter.classList.remove('fade-out');
    }, 450);

    // 3. Hiện màn chúc mừng và bật hiệu ứng trái tim particle (canvas)
    setTimeout(function () {
      screenYes.classList.add('visible');
      if (heartCanvas && window.HeartParticles) {
        window.HeartParticles.start(heartCanvas);
      }
    }, 350);
  });

  // Nút Không chỉ nhảy sang chỗ khác trên màn (luôn trong viewport, không mất)
  function moveNoButton() {
    var padding = 28;
    var w = btnNo.offsetWidth || 100;
    var h = btnNo.offsetHeight || 44;
    var minX = padding;
    var minY = padding;
    var maxX = window.innerWidth - w - padding;
    var maxY = window.innerHeight - h - padding;
    if (maxX < minX) maxX = minX + 1;
    if (maxY < minY) maxY = minY + 1;

    var x = minX + Math.random() * (maxX - minX);
    var y = minY + Math.random() * (maxY - minY);

    var yesRect = btnYes.getBoundingClientRect();
    var safeDist = 90;
    var attempts = 0;
    while (attempts < 25) {
      var dx = x + w / 2 - (yesRect.left + yesRect.width / 2);
      var dy = y + h / 2 - (yesRect.top + yesRect.height / 2);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= safeDist) break;
      x = minX + Math.random() * (maxX - minX);
      y = minY + Math.random() * (maxY - minY);
      attempts++;
    }

    btnNo.style.left = Math.round(x) + 'px';
    btnNo.style.top = Math.round(y) + 'px';
  }

  btnNo.addEventListener('click', function (e) {
    if (screenYes.classList.contains('visible')) return;
    e.preventDefault();
    moveNoButton();
  });

  btnNo.addEventListener('mouseenter', function () {
    if (screenYes.classList.contains('visible')) return;
    moveNoButton();
  });
})();
