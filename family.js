/* ============================================================================
   Sijill · سِجِلّ — the page a parent or an older student opens.
   Read-only. There is no write path in this file at all.

   The link code lives after the # in the address. Browsers never send that
   part to a web server, so it does not appear in any server log anywhere.
   We read it here in the page and post it in the request body instead.
   ============================================================================ */
(function () {
  "use strict";
  var T = i18n.t, $ = function (id) { return document.getElementById(id); };
  var DATA = null, WHICH = 0;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c];
    });
  }
  function show(id) {
    ["v-family","v-loading","v-oops"].forEach(function (v) { $(v).hidden = (v !== id); });
  }

  function linkCode() {
    var h = (location.hash || "").replace(/^#/, "");
    if (!h) return null;
    var m = /(?:^|&)c=([^&]+)/.exec(h);
    return decodeURIComponent(m ? m[1] : h);
  }

  function oops(title, body) {
    $("oopsTitle").textContent = title;
    $("oopsBody").textContent = body;
    show("v-oops");
  }

  /* -------------------------------------------------------------- strings */
  var L = {
    en: {
      thisWeek:"This week", memorize:"Memorize", review:"Review", setBy:"Set {d} by {t}",
      attendance:"Attendance", rate:"Attendance this year",
      breakdown:"Present / late / excused / no reason",
      present:"Present", late:"Late", excused:"Excused", noreason:"No reason", closed:"Class closed",
      where:"Where {n} is", pagesSolid:"Pages solid", ofPages:"of {n} in this juz",
      surahsSolid:"Surahs solid", needsReview:"Needs review",
      scope:"Counted within juz {j}, the section {n} is working through. Pages are a fairer measure than surahs, because surah lengths vary enormously.",
      helpHome:"Needs review — help at home", recent:"Recent classes",
      nothingYet:"Nothing set for this week yet.", noClasses:"No classes recorded yet.",
      contact:"Any question about homework or attendance — message the school on ClassDojo.",
      wholeSurah:"whole surah", ayat:"ayat", notMarked:"not marked",
      noneRecorded:"Here — nothing recorded",
      notAssessed:"We haven't done this year's review with your child yet. Once their teacher has been through it — usually in the first few weeks — their progress appears here." 
    },
    ar: {
      thisWeek:"هَذَا الأُسْبُوع", memorize:"لِلْحِفْظ", review:"لِلْمُرَاجَعَة",
      setBy:"حُدِّدَ {d} بِوَاسِطَةِ {t}",
      attendance:"الحُضُور", rate:"الحُضُورُ هَذَا العَام",
      breakdown:"حَاضِر / مُتَأَخِّر / بِعُذْر / بِدُونِ عُذْر",
      present:"حَاضِر", late:"مُتَأَخِّر", excused:"بِعُذْر", noreason:"بِدُونِ عُذْر",
      closed:"الحَلْقَةُ مُغْلَقَة",
      where:"مُسْتَوَى {n}", pagesSolid:"صَفَحَاتٌ مُتْقَنَة", ofPages:"مِنْ {n} فِي هَذَا الجُزْء",
      surahsSolid:"سُوَرٌ مُتْقَنَة", needsReview:"يَحْتَاجُ مُرَاجَعَة",
      scope:"مَحْسُوبٌ ضِمْنَ الجُزْءِ {j}، القِسْمِ الَّذِي يَعْمَلُ عَلَيْهِ {n}. الصَّفَحَاتُ مِقْيَاسٌ أَدَقُّ مِنَ السُّوَرِ لِأَنَّ أَطْوَالَ السُّوَرِ مُتَفَاوِتَة.",
      helpHome:"يَحْتَاجُ مُرَاجَعَة — لِلْمُسَاعَدَةِ فِي البَيْت", recent:"الحِصَصُ الأَخِيرَة",
      nothingYet:"لَمْ يُحَدَّدْ شَيْءٌ لِهَذَا الأُسْبُوعِ بَعْد.", noClasses:"لَا حِصَصَ مُسَجَّلَةٌ بَعْد.",
      contact:"لِأَيِّ سُؤَالٍ حَوْلَ الوَاجِبِ أَوِ الحُضُور، رَاسِلِ المَدْرَسَةَ عَبْرَ ClassDojo.",
      wholeSurah:"السُّورَةُ كَامِلَة", ayat:"آيَة", notMarked:"لَمْ يُسَجَّل",
      noneRecorded:"حَاضِر — لَمْ يُسَجَّلْ شَيْء",
      notAssessed:"لَمْ نُجْرِ جَرْدَ هَذَا العَامِ مَعَ اِبْنِكُمْ بَعْد. وَحَالَمَا يُنْجِزُهُ مُعَلِّمُهُ — عَادَةً فِي الأَسَابِيعِ الأُولَى — سَيَظْهَرُ تَقَدُّمُهُ هُنَا." 
    }
  };
  function t(k, v) {
    var s = L[i18n.isAr() ? "ar" : "en"][k] || L.en[k] || k;
    if (v) Object.keys(v).forEach(function (x) { s = s.split("{" + x + "}").join(v[x]); });
    return s;
  }

  var DOT = {
    present:"p", late:"l", absent_unjustified:"a",
    absent_sick:"e", absent_travel:"e", absent_other:"e",
    closed:"c", "not marked":"n"
  };

  /* --------------------------------------------------------------- render */
  function render() {
    if (!DATA) return;
    var kids = DATA.children || [];
    // The name follows the reader's language. It used to come from the
    // database, which meant renaming the school needed a migration.
    $("school").textContent = (window.SIJILL && window.SIJILL.SCHOOL_NAME)
                              || T("schoolName") || (DATA.school && DATA.school.name) || "";

    $("kidRow").innerHTML = kids.length > 1 ? kids.map(function (c, i) {
      return '<button class="kid" data-i="' + i + '" aria-pressed="' + (i === WHICH) + '">' +
             esc(c.name) + '</button>';
    }).join("") : "";
    $("kidRow").querySelectorAll(".kid").forEach(function (b) {
      b.onclick = function () { WHICH = +b.dataset.i; render(); };
    });

    var c = kids[WHICH];
    if (!c) { $("body").innerHTML = '<div class="pcard">—</div>'; return; }

    var h = "";

    h += '<div class="ctx" style="padding:0 0 12px"><h1>' + esc(c.name) + '</h1>' +
         '<div class="sub">' + esc(c["class"] || "") + '</div></div>';

    // the attendance warning — adults only; the server omits it on a student link
    if (c.flags && c.flags.kind) {
      h += '<div class="banner ' + c.flags.kind + '"><span class="ic">●</span><div><b>' +
           esc(c.flags.message) + '.</b></div></div>';
    }

    // this week
    var hw = c.homework || [];
    h += '<div class="pcard hero"><h2>' + esc(t("thisWeek")) + '</h2>';
    if (!hw.length) {
      h += '<div class="line"><span>' + esc(t("nothingYet")) + '</span></div>';
    } else {
      hw.forEach(function (x) {
        h += '<div class="line"><span class="k">' +
             esc(x.kind === "memorise" ? t("memorize") : t("review")) + '</span>' +
             '<span class="ar" dir="rtl">' + esc(x.name_ar) + '</span>' +
             '<span>' + esc(x.name_en) + (x.whole_surah ? "" :
                (x.ayah_from ? " " + x.ayah_from + "–" + x.ayah_to : "")) + '</span></div>';
      });
      var first = hw[0];
      if (first.set_by || first.set_on) {
        h += '<div class="line" style="opacity:.78;font-size:12px">' +
             esc(t("setBy", { d: i18n.fmtDate(first.set_on), t: first.set_by || "—" })) + '</div>';
      }
    }
    h += '</div>';

    // attendance
    var a = c.attendance_summary || {};
    h += '<div class="pcard"><h2>' + esc(t("attendance")) + '</h2><div class="dots">' +
      (c.recent_attendance || []).map(function (d) {
        return '<span class="dot"><i class="' + (DOT[d.state] || "c") + '"></i><span>' +
               esc(i18n.fmtDate(d.held_on).replace(/ \d{4}$/, "")) + '</span></span>';
      }).join("") + '</div>' +
      '<div class="kv"><span>' + esc(t("rate")) + '</span><b>' +
        (a.rate == null ? "—" : a.rate + "%") + '</b></div>' +
      '<div class="kv"><span>' + esc(t("breakdown")) + '</span><b>' +
        [a.present || 0, a.late || 0, a.excused || 0, a.no_reason || 0].join(" · ") + '</b></div>' +
      '<div class="legendrow">' +
        '<span class="pill ok"><i></i>' + esc(t("present")) + '</span>' +
        '<span class="pill late"><i></i>' + esc(t("late")) + '</span>' +
        '<span class="pill exc"><i></i>' + esc(t("excused")) + '</span>' +
        '<span class="pill crit"><i></i>' + esc(t("noreason")) + '</span>' +
        '<span class="pill mute"><i class="sw-closed"></i>' + esc(t("closed")) + '</span>' +
        '<span class="pill mute"><i class="sw-none"></i>' + esc(t("notMarked")) + '</span></div></div>';

    // progress, in pages
    var p = c.progress;
    if (!p) {
      /* Most of the school has not been through the annual audit yet, so this
         is the normal state for a lot of families in September — not an error
         and not something to hide. Saying nothing here just looks broken. */
      h += '<div class="pcard"><h2>' + esc(t("where", { n: c.name.split(" ")[0] })) + '</h2>' +
        '<div class="note">' + esc(t("notAssessed")) + '</div></div>';
    } else {
      var pct = p.pages_in_juz ? Math.round(p.pages_solid / p.pages_in_juz * 100) : 0;
      var pctP = p.pages_in_juz ? Math.round(p.pages_partial / p.pages_in_juz * 100) : 0;
      h += '<div class="pcard"><h2>' + esc(t("where", { n: c.name.split(" ")[0] })) + '</h2>' +
        '<div class="kv"><span>' + esc(t("pagesSolid")) + '</span><b>' + p.pages_solid +
          ' <span style="font-weight:400;color:var(--ink-3)">' +
          esc(t("ofPages", { n: p.pages_in_juz })) + '</span></b></div>' +
        '<div class="kv"><span>' + esc(t("surahsSolid")) + '</span><b>' + (c.surahs_solid || 0) + '</b></div>' +
        '<div class="kv"><span>' + esc(t("needsReview")) + '</span><b>' + (c.needs_review || []).length + '</b></div>' +
        '<div style="height:10px"></div>' +
        '<span class="bar2" style="width:100%;height:10px"><i class="a" style="width:' + pct + '%"></i>' +
          '<i class="r" style="width:' + pctP + '%"></i></span>' +
        '<div style="height:11px"></div><div class="note">' +
          esc(t("scope", { j: p.juz, n: c.name.split(" ")[0] })) + '</div></div>';
    }

    // what to help with
    if ((c.needs_review || []).length) {
      h += '<div class="pcard"><h2>' + esc(t("helpHome")) + '</h2><div class="rlist">' +
        c.needs_review.map(function (r) {
          return '<div class="r"><span class="ar" dir="rtl">' + esc(r.name_ar) +
                 '</span><span class="tr">' + esc(r.name_en) + '</span></div>';
        }).join("") + '</div></div>';
    }

    // recent classes. recent_attendance already carries the state for each
    // date, so the two can be joined here rather than in a new SQL migration.
    var ATT = {};
    (c.recent_attendance || []).forEach(function (d) { ATT[d.held_on] = d.state; });
    h += '<div class="pcard"><h2>' + esc(t("recent")) + '</h2><div class="sess">' +
      ((c.recent_classes || []).length ? c.recent_classes.map(function (x) {
        var recited = (x.recited || []).map(function (r) {
          return esc(r.name_en) + (r.ayah_from ? " " + r.ayah_from + "–" + r.ayah_to : "");
        }).join(" · ");
        var notes = (x.notes || []).map(function (n) {
          return '<div class="n">“' + esc(n.body) + '”' +
                 (n.by ? ' <span style="font-style:normal;color:var(--ink-3)">— ' + esc(n.by) + '</span>' : '') +
                 '</div>';
        }).join("");
        // A dash meant "nothing recited", which is not something a parent can
        // be expected to decode — especially on a day their child was there.
        // Say it, and say whether they were present, which this card never did.
        var line;
        if (x.status === "cancelled") line = esc(t("closed"));
        else if (recited) line = recited;
        else {
          var st = ATT[x.held_on];
          line = esc(
            st === "present" || st === "late" ? t("noneRecorded")
            : st === "absent_unjustified" ? t("noreason")
            : (st === "absent_sick" || st === "absent_travel" || st === "absent_other") ? t("excused")
            : t("notMarked"));
        }
        return '<div class="s"><div class="d">' + i18n.fmtDate(x.held_on, true) +
          (x.teacher ? ' · ' + esc(x.teacher) : '') + '</div>' +
          '<div class="w">' + line + '</div>' +
          notes + '</div>';
      }).join("") : '<div class="empty" style="color:var(--ink-3);font-size:13.5px">' +
                     esc(t("noClasses")) + '</div>') +
      '</div><div style="height:10px"></div><div class="note">' + esc(t("contact")) + '</div></div>';

    $("body").innerHTML = h;
  }

  /* ----------------------------------------------------------------- boot */
  $("lang").onclick = function () { i18n.setLang(i18n.isAr() ? "en" : "ar"); };
  window.addEventListener("sijill:lang", render);
  $("theme").onclick = function () {
    var r = document.documentElement;
    var dark = r.getAttribute("data-theme") === "dark" ||
      (!r.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    r.setAttribute("data-theme", dark ? "light" : "dark");
    try { localStorage.setItem("sijill.theme", dark ? "light" : "dark"); } catch (e) {}
  };

  /* If the address's # changes — a parent opening a newly issued link while
     the old page is still on screen — nothing reloads by default and they
     would sit looking at stale data. Reload on the change. */
  window.addEventListener("hashchange", function () { location.reload(); });

  (function start() {
    try {
      var th = localStorage.getItem("sijill.theme");
      if (th) document.documentElement.setAttribute("data-theme", th);
    } catch (e) {}
    i18n.setLang(i18n.lang);

    var code = linkCode();
    if (!code) {
      return oops("This page needs your personal link",
        "Open the link the school sent you rather than typing the address by hand — the part after the # is what identifies your child.");
    }
    show("v-loading");
    api.rpc("api_family", { p_link: code }).then(function (d) {
      if (!d || d.ok === false) {
        return oops("This link doesn't work",
          (d && d.error) || "Ask the school to send you a new one.");
      }
      DATA = d; WHICH = 0;
      show("v-family"); render();
    }).catch(function (e) {
      oops("Could not load the page", e.message ||
        "Check your connection and try again. If it keeps happening, tell the school.");
    });
  })();
})();
