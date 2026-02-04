/**
 * Website tỏ tình — typewriter + trái tim bay
 * Chỉnh: TYPE_CHAR (ms/chữ), DELAY_LINE (ms nghỉ giữa các dòng).
 */

(function () {
  'use strict';

  var TYPE_CHAR = 55;   // ms mỗi chữ (gõ chữ)
  var DELAY_LINE = 400; // ms nghỉ trước khi bắt đầu dòng mới
  var btnOpen = document.getElementById('btnOpen');
  var btnYes = document.getElementById('btnYes');
  var btnNo = document.getElementById('btnNo');
  var screenWelcome = document.getElementById('screenWelcome');
  var screenLetter = document.getElementById('screenLetter');
  var screenYes = document.getElementById('screenYes');
  var letterLines = document.querySelectorAll('.letter-line');
  var envelopeWrap = document.getElementById('envelopeWrap');

  if (!btnOpen || !screenWelcome || !screenLetter) return;

  function show(el) {
    if (!el) return;
    el.removeAttribute('hidden');
    el.style.display = 'flex';
  }

  function hide(el) {
    if (!el) return;
    el.setAttribute('hidden', '');
    el.style.display = 'none';
  }

  // Gõ từng chữ vào el, xong gọi onDone
  function typeWriter(el, text, index, onDone) {
    el.classList.add('visible');
    if (index < text.length) {
      el.innerHTML = text.slice(0, index) + '<span class="cursor">|</span>';
      setTimeout(function () { typeWriter(el, text, index + 1, onDone); }, TYPE_CHAR);
    } else {
      el.textContent = text;
      if (onDone) onDone();
    }
  }

  // Mở thư: hiện thư, gõ từng dòng lần lượt
  function openLetter() {
    hide(screenWelcome);
    show(screenLetter);

    var sorted = Array.from(letterLines).sort(function (a, b) {
      return (parseInt(a.getAttribute('data-order'), 10) || 0) - (parseInt(b.getAttribute('data-order'), 10) || 0);
    });

    function runLine(i) {
      if (i >= sorted.length) return;
      var line = sorted[i];
      var text = line.getAttribute('data-text') || '';
      line.textContent = '';
      typeWriter(line, text, 0, function () {
        setTimeout(function () { runLine(i + 1); }, DELAY_LINE);
      });
    }
    setTimeout(function () { runLine(0); }, 300);
  }

  // Click "Mở thư" hoặc click bao thư → mở thư
  btnOpen.addEventListener('click', openLetter);
  if (envelopeWrap) {
    envelopeWrap.addEventListener('click', openLetter);
  }

  // Bấm Có → màn "Yêu em nhiều lắm!"
  if (btnYes && screenYes) {
    btnYes.addEventListener('click', function () {
      hide(screenLetter);
      show(screenYes);
    });
  }

  // Bấm Không → nhẹ nhàng (có thể đổi thành chạy trốn nếu muốn)
  if (btnNo) {
    btnNo.addEventListener('click', function () {
      btnNo.textContent = 'Thử lại đi mà ♥';
      btnNo.style.background = 'linear-gradient(135deg, #f48fb1 0%, #f8bbd0 100%)';
    });
  }
})();
