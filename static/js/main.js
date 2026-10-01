// Copy the BibTeX entry to the clipboard.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.dataset.target);
      if (!el) return;
      var text = el.textContent;
      var label = btn.querySelector('span');
      function done(ok) {
        label.textContent = ok ? 'Copied' : 'Press Ctrl+C';
        btn.classList.toggle('done', ok);
        setTimeout(function () { label.textContent = 'Copy'; btn.classList.remove('done'); }, 1800);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
      } else {
        fallback();
      }
      function fallback() {
        var r = document.createRange();
        r.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        done(ok);
      }
    });
  });
});
