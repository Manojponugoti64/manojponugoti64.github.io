/* space-hub.js
 *
 * Powers three cards on the Space Hub page:
 *   1. NASA Astronomy Picture of the Day (APOD) — fetched live.
 *   2. Moon phase — computed locally from current UTC time using a synodic
 *      month approximation (29.530588 days).
 *   3. Next ISS passes overhead — computed locally with satellite.js using
 *      the live TLE for ISS (NORAD 25544) from Celestrak.
 *
 * Everything degrades gracefully: a card that fails (network, rate-limit,
 * geolocation denied, etc.) shows a friendly inline message instead of a
 * console error.
 */
(function () {
  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, props) {
    var node = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === 'text') node.textContent = props[k];
      else if (k === 'class') node.className = props[k];
      else node.setAttribute(k, props[k]);
    });
    return node;
  }
  function setStatus(card, msg, isError) {
    var s = $('.hub-status', card);
    if (!s) return;
    s.textContent = msg;
    s.classList.toggle('is-error', !!isError);
  }

  /* ===== 1. APOD ===== */
  function loadApod() {
    var card = $('#hub-apod');
    if (!card) return;
    setStatus(card, 'Loading today\u2019s sky\u2026');
    fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true')
      .then(function (r) {
        if (r.status === 429) throw new Error('rate-limited');
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        setStatus(card, '');
        var media = $('.hub-apod-media', card);
        media.innerHTML = '';
        if (data.media_type === 'image') {
          var img = el('img', {
            src: data.url,
            alt: data.title || 'NASA Astronomy Picture of the Day',
            loading: 'lazy'
          });
          media.appendChild(img);
        } else if (data.media_type === 'video') {
          if (data.thumbnail_url) {
            var thumb = el('img', {
              src: data.thumbnail_url, alt: data.title || 'APOD video',
              loading: 'lazy'
            });
            media.appendChild(thumb);
          }
          var play = el('a', {
            href: data.url, target: '_blank', rel: 'noopener',
            class: 'hub-apod-play', text: 'Watch video \u2192'
          });
          media.appendChild(play);
        }
        $('.hub-apod-title', card).textContent = data.title || '';
        $('.hub-apod-date', card).textContent = data.date || '';
        var expl = data.explanation || '';
        if (expl.length > 360) expl = expl.slice(0, 360).replace(/\s+\S*$/, '') + '\u2026';
        $('.hub-apod-explanation', card).textContent = expl;
        if (data.hdurl || data.url) {
          var more = $('.hub-apod-more', card);
          more.href = data.hdurl || data.url;
          more.style.display = '';
        }
      })
      .catch(function (err) {
        var msg = (err && err.message === 'rate-limited')
          ? 'NASA APOD is rate-limited right now \u2014 try again in an hour.'
          : 'Couldn\u2019t reach NASA right now \u2014 try again later.';
        setStatus(card, msg, true);
      });
  }

  /* ===== 2. Moon phase ===== */
  function loadMoon() {
    var card = $('#hub-moon');
    if (!card) return;
    var SYNODIC = 29.530588853;
    var REF = Date.UTC(2000, 0, 6, 18, 14, 0); // known new moon
    var now = Date.now();
    var days = (now - REF) / 86400000;
    var phase = ((days % SYNODIC) + SYNODIC) % SYNODIC;
    var pct = phase / SYNODIC;
    var illum = (1 - Math.cos(2 * Math.PI * pct)) / 2; // 0..1
    var name, emoji;
    if (pct < 0.0345 || pct > 0.9655) { name = 'New Moon'; emoji = '\uD83C\uDF11'; }
    else if (pct < 0.2155) { name = 'Waxing Crescent'; emoji = '\uD83C\uDF12'; }
    else if (pct < 0.2845) { name = 'First Quarter'; emoji = '\uD83C\uDF13'; }
    else if (pct < 0.4655) { name = 'Waxing Gibbous'; emoji = '\uD83C\uDF14'; }
    else if (pct < 0.5345) { name = 'Full Moon'; emoji = '\uD83C\uDF15'; }
    else if (pct < 0.7155) { name = 'Waning Gibbous'; emoji = '\uD83C\uDF16'; }
    else if (pct < 0.7845) { name = 'Last Quarter'; emoji = '\uD83C\uDF17'; }
    else { name = 'Waning Crescent'; emoji = '\uD83C\uDF18'; }

    var daysToFull;
    if (pct < 0.5) daysToFull = (0.5 - pct) * SYNODIC;
    else daysToFull = (1.5 - pct) * SYNODIC;
    var daysToNew = (1 - pct) * SYNODIC;

    $('.hub-moon-emoji', card).textContent = emoji;
    $('.hub-moon-name', card).textContent = name;
    $('.hub-moon-illum', card).textContent =
      Math.round(illum * 100) + '% illuminated';
    $('.hub-moon-age', card).textContent =
      'Moon age: ' + phase.toFixed(1) + ' days';
    $('.hub-moon-next', card).textContent =
      'Next full moon in ' + Math.round(daysToFull) + ' days \u00b7 ' +
      'next new moon in ' + Math.round(daysToNew) + ' days';
  }

  /* ===== 3. ISS pass predictor ===== */
  var TLE_URL = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE';
  function fmtTime(date) {
    return date.toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }
  function loadPasses() {
    var card = $('#hub-passes');
    if (!card) return;
    var btn = $('.hub-pass-btn', card);
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!('geolocation' in navigator)) {
        setStatus(card, 'Geolocation isn\u2019t supported in this browser.', true);
        return;
      }
      setStatus(card, 'Getting your location\u2026');
      navigator.geolocation.getCurrentPosition(function (pos) {
        computePasses(card, pos.coords.latitude, pos.coords.longitude);
      }, function () {
        setStatus(card, 'Need location permission to compute passes.', true);
      }, { timeout: 10000 });
    });
  }
  function computePasses(card, lat, lon) {
    setStatus(card, 'Crunching orbital math\u2026');
    if (typeof satellite === 'undefined') {
      setStatus(card, 'Orbit library failed to load \u2014 reload the page?', true);
      return;
    }
    fetch(TLE_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.text();
      })
      .then(function (txt) {
        var lines = txt.trim().split(/\r?\n/);
        if (lines.length < 3) throw new Error('bad tle');
        var rec = satellite.twoline2satrec(lines[1], lines[2]);
        var observer = {
          longitude: satellite.degreesToRadians(lon),
          latitude: satellite.degreesToRadians(lat),
          height: 0
        };
        var passes = [];
        var now = new Date();
        var step = 30 * 1000; // 30s
        var horizon = 10 * Math.PI / 180; // 10 deg
        var inPass = null;
        var lastDate = now;
        for (var t = 0; t < 48 * 3600 * 1000 && passes.length < 3; t += step) {
          var date = new Date(now.getTime() + t);
          var pv = satellite.propagate(rec, date);
          if (!pv.position) continue;
          var gmst = satellite.gstime(date);
          var posEcf = satellite.eciToEcf(pv.position, gmst);
          var look = satellite.ecfToLookAngles(observer, posEcf);
          var elev = look.elevation;
          lastDate = date;
          if (elev > horizon) {
            if (!inPass) inPass = { start: date, max: elev, maxAt: date };
            else if (elev > inPass.max) { inPass.max = elev; inPass.maxAt = date; }
          } else if (inPass) {
            inPass.end = date;
            inPass.duration = Math.round((inPass.end - inPass.start) / 60000);
            inPass.maxDeg = Math.round(inPass.max * 180 / Math.PI);
            passes.push(inPass);
            inPass = null;
          }
        }
        if (inPass && passes.length < 3) {
          inPass.end = lastDate;
          inPass.duration = Math.round((inPass.end - inPass.start) / 60000);
          inPass.maxDeg = Math.round(inPass.max * 180 / Math.PI);
          passes.push(inPass);
        }
        renderPasses(card, passes);
      })
      .catch(function () {
        setStatus(card, 'Couldn\u2019t fetch ISS orbit data \u2014 try again later.', true);
      });
  }
  function renderPasses(card, passes) {
    var list = $('.hub-pass-list', card);
    list.innerHTML = '';
    if (!passes.length) {
      setStatus(card, 'No visible passes in the next 48 hours.', false);
      return;
    }
    setStatus(card, 'Times shown in your local zone.');
    passes.forEach(function (p) {
      var li = el('li', { class: 'hub-pass-item' });
      li.appendChild(el('span', { class: 'hub-pass-when', text: fmtTime(p.start) }));
      li.appendChild(el('span', {
        class: 'hub-pass-detail',
        text: 'peaks at ' + p.maxDeg + '\u00b0 \u00b7 ' + p.duration + ' min'
      }));
      list.appendChild(li);
    });
  }

  /* ---------- init ---------- */
  function init() {
    loadApod();
    loadMoon();
    loadPasses();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
