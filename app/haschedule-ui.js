(function () {
  // theme passed by the host via the served query: _dark=1/0, _accent=#hex
  try {
    var q = new URLSearchParams(location.search);
    document.body.classList.toggle('light', q.get('_dark') === '0');
    var a = q.get('_accent') || '';
    if (/^#[0-9a-fA-F]{6}$/.test(a)) document.documentElement.style.setProperty('--accent', a);
  } catch (e) {}

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var ROWS = 6;   // always render 6 slots a side (data or empty) so both columns line up with the same row lines + spacing
  function renderAgenda(items) {
    items = items || [];
    var html = '';
    for (var i = 0; i < ROWS; i++) {
      var a = items[i];
      html += a
        ? '<div class="ag"><div class="date">' + esc(a.date) + '</div><div class="time">' + esc(a.time) + '</div><div class="title">' + esc(a.title) + '</div></div>'
        : '<div class="ag"></div>';
    }
    $('agenda').innerHTML = html;
  }
  function renderEvents(items) {
    items = items || [];
    var html = '';
    for (var i = 0; i < ROWS; i++) {
      var e = items[i];
      if (e) {
        html += '<div class="ev"><div class="eday">' + esc(e.day) + '</div><div class="etime">' + esc(e.time)
          + '</div><div class="venue">' + esc(e.venue) + '</div><div class="title">' + esc(e.title) + '</div></div>';
      } else { html += '<div class="ev"></div>'; }
    }
    $('events').innerHTML = html;
  }

  function tick() {
    fetch('/haschedule-data', { cache: 'no-store' }).then(function (r) { return r.json(); })
      .then(function (s) {
        var bad = !!(s && s.ok === false);
        $('err').textContent = bad && s.error ? s.error : '';
        $('err').classList.toggle('show', bad);
        renderAgenda(s && s.agenda); renderEvents(s && s.events);
      })
      .catch(function () { $('err').textContent = 'reconnecting…'; $('err').classList.add('show'); });
  }
  tick();
  setInterval(tick, 30000);   // re-read the cached snapshot; main refreshes HA on the app's poll interval
})();
