/* ============================================================================
   Sijill · سِجِلّ — the mushaf as a tree, and the live audit.

   Every other write in this app changes a child's state as a CONSEQUENCE of
   something that happened in class: they recited, therefore the state moved.
   This screen is the exception. It says what is true, directly — which is what
   an audit is, and why it was done on paper until now.

   Three levels, the same ones the mushaf itself has:

       mushaf  →  30 juz
       juz     →  its hizbs, and the pages in them
       page    →  which ayat of which surah sit on it

   Anything can be marked at any level. A whole juz in one tap is the point:
   juz 30 is 37 surahs and nobody is going to tap 37 times to record what a
   child already knows.

   Counting is in AYAT, and a page is solid only when every ayah on it is —
   the same rule the pages report has always used. Two different definitions
   of "done" in one app is how a tool stops being believed.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var T = i18n.t;
  /* api.js publishes itself as window.api, the same way coord.js picks it up. */

  /* view state: which student, and where in the tree we are standing */
  var M = { student: null, name: "", juz: null, data: null, open: {} };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function busy() { $("mtBody").innerHTML = '<div class="loading"><span class="spin"></span></div>'; }

  /* ---------------------------------------------------------------- open */
  function open(studentId, studentName) {
    M.student = studentId; M.name = studentName || ""; M.juz = null; M.open = {};
    ["v-gate", "v-who", "v-class", "v-student", "v-coord", "v-mushaf"].forEach(function (v) {
      var el = $(v); if (el) el.hidden = (v !== "v-mushaf");
    });
    window.scrollTo(0, 0);
    $("mtWho").textContent = M.name;
    load();
  }

  function load() {
    busy();
    return api.read("api_mushaf_tree",
      { p_student: M.student, p_juz: M.juz }
    ).then(function (d) { M.data = d; render(); })
     .catch(function (e) { $("mtBody").innerHTML =
       '<div class="banner crit"><span class="ic">●</span><div>' + esc(e.message) + '</div></div>'; });
  }

  /* ------------------------------------------------------------- drawing */
  /* U6 · "11+3" meant nothing without a key, and a tooltip is no use on a
     touchscreen. Tarek asked for a small colour bar AND the words. So: the
     bar carries the proportion at a glance, the words say exactly what it is,
     and neither needs explaining. */
  function bar(solid, review, total) {
    var t = total || 1;
    var ps = Math.round(solid / t * 100), pr = Math.round(review / t * 100);
    return '<span class="cbar" role="img" aria-label="' +
      esc(words(solid, review, total)) + '">' +
      '<i class="s" style="width:' + ps + '%"></i>' +
      '<i class="r" style="width:' + pr + '%"></i></span>';
  }
  function words(solid, review, total) {
    var ar = i18n.isAr(), out = [];
    if (solid)  out.push(solid + " " + (ar ? "مُتْقَن" : "solid"));
    if (review) out.push(review + " " + (ar ? "لِلْمُرَاجَعَة" : "to review"));
    var left = total - solid - review;
    if (left > 0) out.push(left + " " + (ar ? "لَمْ يُبْدَأْ" : "not started"));
    return out.join(" · ") || (ar ? "لَمْ يُبْدَأْ" : "not started");
  }

  /* The three marks, at whatever level the row represents. */
  function setters(scope, number, extra) {
    return '<span class="setg" data-scope="' + scope + '" data-n="' + number + '"' +
      (extra || "") + '>' +
      '<button class="gb lab3 sv" data-grade="1" title="' + esc(T("gGoodTip")) + '">' +
        '<span class="ic">✓</span><small>' + esc(T("mtSolid")) + '</small></button>' +
      '<button class="gb lab3 sv" data-grade="2" title="' + esc(T("gAgainTip")) + '">' +
        '<span class="ic">↻</span><small>' + esc(T("mtReview")) + '</small></button>' +
      '<button class="gb lab3 sv" data-grade="0" title="' + esc(T("mtClearTip")) + '">' +
        '<span class="ic">–</span><small>' + esc(T("mtClear")) + '</small></button>' +
    '</span>';
  }

  function render() {
    var ar = i18n.isAr();
    $("mtWho").textContent = M.name;
    if (!M.data) return;

    if (M.data.level === "mushaf") {
      $("mtTitle").textContent = ar ? "المُصْحَفُ كَامِلًا" : "The whole mushaf";
      var tot = M.data.juz.reduce(function (a, j) { return a + (+j.pages_solid || 0); }, 0);
      $("mtSub").textContent = T("mtPagesSolid", { n: tot });

      $("mtBody").innerHTML =
        '<div class="note" style="margin-bottom:12px">' + T("mtHelp") + '</div>' +
        '<div class="juzgrid" id="mtTree">' + M.data.juz.map(function (j) {
          return '<button class="juztile" data-juz="' + j.juz + '">' +
            '<span class="jn">' + (ar ? "جُزْء " : "Juz ") + j.juz + '</span>' +
            bar(+j.ayat_solid, +j.ayat_review, +j.ayat) +
            '<span class="jw">' + esc(j.pages_solid + "/" + j.pages +
              " " + (ar ? "صَفَحَات" : "pages")) + '</span>' +
          '</button>';
        }).join("") + '</div>';

      $("mtTree").onclick = function (e) {
        var b = e.target.closest("[data-juz]");
        if (!b) return;
        M.juz = +b.dataset.juz; M.open = {}; load();
      };
      return;
    }

    /* one juz */
    $("mtTitle").textContent = (ar ? "جُزْء " : "Juz ") + M.data.juz;
    var aS = 0, aR = 0, aT = 0;
    M.data.hizbs.forEach(function (h) {
      h.pages.forEach(function (p) { aS += +p.solid; aR += +p.review; aT += +p.ayat; });
    });
    $("mtSub").textContent = words(aS, aR, aT);

    var html =
      '<div class="crumbs"><button id="mtUp">‹ ' + esc(ar ? "كُلُّ الأَجْزَاء" : "All juz") + '</button>' +
      '<span>' + (ar ? "جُزْء " : "Juz ") + M.data.juz + '</span></div>' +
      '<div class="lvl">' +
        '<div class="lvlh"><b>' + esc(ar ? "الجُزْءُ كُلُّهُ" : "The whole juz") + '</b>' +
        bar(aS, aR, aT) + '<span class="w">' + esc(words(aS, aR, aT)) + '</span></div>' +
        setters("juz", M.data.juz) +
      '</div>';

    html += '<div id="mtTree">' + M.data.hizbs.map(function (h) {
      var hS = 0, hR = 0, hT = 0;
      h.pages.forEach(function (p) { hS += +p.solid; hR += +p.review; hT += +p.ayat; });
      return '<div class="lvl hizb">' +
          '<div class="lvlh"><b>' + esc((ar ? "حِزْب " : "Hizb ") + h.hizb) + '</b>' +
          bar(hS, hR, hT) + '<span class="w">' + esc(words(hS, hR, hT)) + '</span></div>' +
          setters("hizb", h.hizb) +
        '</div>' +
        h.pages.map(function (p) {
          var key = "p" + p.page, isOpen = !!M.open[key];
          return '<div class="prow' + (isOpen ? " open" : "") + '">' +
            '<button class="phead" data-page="' + p.page + '">' +
              '<span class="pn">' + esc((ar ? "صَفْحَة " : "p.") + p.page) + '</span>' +
              bar(+p.solid, +p.review, +p.ayat) +
              '<span class="chev">' + (isOpen ? "⌄" : "›") + '</span>' +
              '<span class="pw">' +
                esc(p.segments.map(function (g) { return g.name_en; }).join(" · ")) + '</span>' +
            '</button>' +
            /* The page's own marks appear only once the page is open. A juz
               is 20-odd pages; three buttons on every one of them turned the
               screen into six feet of scrolling for something a teacher uses
               on one page at a time. */
            (isOpen ? setters("page", p.page) : "") +
            (isOpen ? '<div class="segs">' + p.segments.map(function (g) {
              return '<div class="seg">' +
                '<span class="lab"><span class="ar" dir="rtl">' + esc(g.name_ar) + '</span>' +
                '<span class="tr">' + esc(g.name_en) + " " + g.from + "–" + g.to + '</span>' +
                '<span class="m">' + esc(words(+g.solid, +g.review, +g.ayat)) + '</span></span>' +
                setters("surah", g.surah,
                  ' data-from="' + g.from + '" data-to="' + g.to + '"') +
              '</div>';
            }).join("") + '</div>' : "") +
          '</div>';
        }).join("");
    }).join("") + '</div>';

    $("mtBody").innerHTML = html;
    $("mtUp").onclick = function () { M.juz = null; M.open = {}; load(); };
    wire();
  }

  function wire() {
    $("mtBody").querySelectorAll("[data-page]").forEach(function (b) {
      b.onclick = function () {
        var k = "p" + b.dataset.page;
        M.open[k] = !M.open[k];
        render();
      };
    });
    $("mtBody").querySelectorAll(".setg .sv").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var g = b.closest(".setg");
        var grade = +b.dataset.grade, scope = g.dataset.scope, n = +g.dataset.n;
        // Clearing is the destructive one: it is the only way to lose a
        // record of memorisation from this screen, so it asks first.
        if (grade === 0) {
          window.SijillSheet(T("mtClearAsk"),
            '<div style="font-size:13.5px;line-height:1.55">' + esc(T("mtClearBody")) + '</div>',
            T("mtClear"), function () {
              window.SijillCloseSheet(); apply(scope, n, grade, g); return false;
            });
          return;
        }
        apply(scope, n, grade, g);
      };
    });
  }

  function apply(scope, n, grade, g) {
    var call, args;
    if (scope === "surah") {
      call = "api_set_state";
      args = { p_student: M.student, p_surah: n, p_grade: grade,
               p_from: +g.dataset.from || null, p_to: +g.dataset.to || null };
    } else {
      call = "api_set_scope";
      args = { p_student: M.student, p_scope: scope, p_number: n, p_grade: grade };
    }
    return api.write(call, args, M.name).then(load).catch(function (e) {
      window.SijillToast(e.message);
    });
  }

  window.addEventListener("sijill:lang", function () {
    if ($("v-mushaf") && !$("v-mushaf").hidden) render();
  });

  window.SijillMushaf = { open: open };
})();
