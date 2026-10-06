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
      /* Two sections, the same split the teachers see. The wording is not
         theirs: a teacher reads "due for grading", which is about their own
         work, and a parent reading that about a volunteer who has not got
         to their child yet is the start of an argument nobody needs. For a
         parent the useful fact is simply that it has not been heard, and
         that it should keep being practised. */
      stillToHear:"Still to be heard", forNextClass:"To practise for",
      noNextClass:"the next class",
      setOnBy:"set {d} by {t}",
      memorize:"Memorize", review:"Review", setBy:"Set {d} by {t}",
      attendance:"Attendance", rate:"Attendance this year",
      breakdown:"Present / late / excused / no reason",
      present:"Present", late:"Late", excused:"Excused", noreason:"No reason", closed:"Class closed",
      where:"Where {n} is", pagesSolid:"Pages solid", ofPages:"of {n} in this juz",
      surahsSolid:"Surahs solid", needsReview:"Needs review",
      ofWhole:"in the whole Qur\u2019an",
      scope:"The pages are counted inside juz {j} \u2014 the part {n} is memorising now. The two lines under it count the whole Qur\u2019an. Pages are a fairer measure than surahs, because surah lengths vary enormously.",
      helpHome:"Needs review — help at home", recent:"Recent classes",
      nothingYet:"Nothing set yet.", noClasses:"No classes recorded yet.",
      contact:"Any question about homework or attendance — message the school on ClassDojo.",
      tajweed:"Tajwīd", adab:"Adab", tr_up:"moving forward", tr_flat:"standing still", tr_down:"needs attention", tr_away:"not enough to say", trHelp:"over the last few classes", wholeSurah:"whole surah", ayat:"ayat", notMarked:"not marked",
      noneRecorded:"Here — nothing recorded", guideLink:"A short guide to this page",
      notAssessed:"We haven't done this year's review with your child yet. Once their teacher has been through it — usually in the first few weeks — their progress appears here." 
    },
    ar: {
      stillToHear:"لَمْ يُسْمَعْ بَعْد", forNextClass:"لِلتَّحْضِيرِ لِـ",
      noNextClass:"الحِصَّةِ القَادِمَة",
      setOnBy:"حُدِّدَ {d} بِوَاسِطَةِ {t}",
      memorize:"لِلْحِفْظ", review:"لِلْمُرَاجَعَة",
      setBy:"حُدِّدَ {d} بِوَاسِطَةِ {t}",
      attendance:"الحُضُور", rate:"الحُضُورُ هَذَا العَام",
      breakdown:"حَاضِر / مُتَأَخِّر / بِعُذْر / بِدُونِ عُذْر",
      present:"حَاضِر", late:"مُتَأَخِّر", excused:"بِعُذْر", noreason:"بِدُونِ عُذْر",
      closed:"الحَلْقَةُ مُغْلَقَة",
      where:"مُسْتَوَى {n}", pagesSolid:"صَفَحَاتٌ مُتْقَنَة", ofPages:"مِنْ {n} فِي هَذَا الجُزْء",
      surahsSolid:"سُوَرٌ مُتْقَنَة", needsReview:"يَحْتَاجُ مُرَاجَعَة",
      ofWhole:"فِي القُرْآنِ كُلِّه",
      scope:"الصَّفَحَاتُ مَحْسُوبَةٌ ضِمْنَ الجُزْءِ {j} — القِسْمِ الَّذِي يَحْفَظُهُ {n} الآنَ. أَمَّا السَّطْرَانِ تَحْتَهُ فَيَشْمَلَانِ القُرْآنَ كُلَّه. وَالصَّفَحَاتُ مِقْيَاسٌ أَدَقُّ مِنَ السُّوَرِ لِأَنَّ أَطْوَالَ السُّوَرِ مُتَفَاوِتَة.",
      helpHome:"يَحْتَاجُ مُرَاجَعَة — لِلْمُسَاعَدَةِ فِي البَيْت", recent:"الحِصَصُ الأَخِيرَة",
      nothingYet:"لَمْ يُحَدَّدْ شَيْءٌ بَعْد.", noClasses:"لَا حِصَصَ مُسَجَّلَةٌ بَعْد.",
      contact:"لِأَيِّ سُؤَالٍ حَوْلَ الوَاجِبِ أَوِ الحُضُور، رَاسِلِ المَدْرَسَةَ عَبْرَ ClassDojo.",
      tajweed:"التَّجْوِيد", adab:"الأَدَب", tr_up:"يَتَقَدَّم", tr_flat:"ثَابِت", tr_down:"يَحْتَاجُ انْتِبَاهًا", tr_away:"لَا يُمْكِنُ الحُكْمُ بَعْد", trHelp:"خِلَالَ الحِصَصِ الأَخِيرَة", wholeSurah:"السُّورَةُ كَامِلَة", ayat:"آيَة", notMarked:"لَمْ يُسَجَّل",
      noneRecorded:"حَاضِر — لَمْ يُسَجَّلْ شَيْء", guideLink:"دَلِيلٌ مُخْتَصَرٌ لِهَذِهِ الصَّفْحَة",
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

  /* Same five faces the teacher sees, so a parent and a teacher are looking
     at the same thing. */
  var MOUTH = { 1:"M5.6 11.4a3.2 3.2 0 0 1 4.8 0", 2:"M5.6 10.9a3.4 3.4 0 0 1 4.8 .5",
                3:"M5.5 10.8h5", 4:"M5.6 10.3a3.4 3.4 0 0 0 4.8 .5",
                5:"M5.4 9.9a3.4 3.4 0 0 0 5.2 0" };
  function FACE(n) {
    n = Math.min(5, Math.max(1, n || 3));
    return '<svg class="face f' + n + '" viewBox="0 0 16 16" aria-hidden="true">' +
      '<circle cx="8" cy="8" r="6.6"/><circle class="eye" cx="5.9" cy="6.3" r=".85"/>' +
      '<circle class="eye" cx="10.1" cy="6.3" r=".85"/><path d="' + MOUTH[n] + '"/></svg>';
  }

  /* The same four arrows the teachers see, drawn the same way. The wording is
     translated here rather than taken from the database, because the database
     writes it in English only and this page has to work in Arabic. */
  var TR = {
    up:   { cls:"tr-up",   d:"M3 13 L13 3",  head:"M13 3 L8 3 M13 3 L13 8" },
    flat: { cls:"tr-flat", d:"M3 8 L13 8",   head:"M13 8 L9 5 M13 8 L9 11" },
    down: { cls:"tr-down", d:"M3 3 L13 13",  head:"M13 13 L8 13 M13 13 L13 8" },
    away: { cls:"tr-away", d:"M3.5 8 L12.5 8", head:"" }
  };
  function trendBar(tr) {
    if (!tr || !tr.dir || !TR[tr.dir]) return "";
    var a = TR[tr.dir];
    /* fill/stroke live on the element, not in the stylesheet, exactly as the
       teacher side draws them. Left to CSS the paths inherit fill:black and
       stroke:none — and a stroke-only arrow with no stroke is an arrow nobody
       can see. It shipped invisible once; the test below now looks at paint,
       not at presence.
       The inner .trend span is what carries the colour: .trend.tr-up and
       friends are the only rules that set one, and .trendbar.tr-up sets the
       background it has to read against. */
    return '<div class="trendbar ' + a.cls + '">' +
      '<span class="trend ' + a.cls + '">' +
        '<svg class="tarrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" ' +
          'fill="none" stroke="currentColor" stroke-width="2.8" ' +
          'stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="' + a.d + '"/>' + (a.head ? '<path d="' + a.head + '"/>' : '') +
        '</svg>' +
        '<span class="t">' + esc(t("tr_" + tr.dir)) + '</span>' +
      '</span>' +
      '<span class="why">' + esc(t("trHelp")) + '</span></div>';
  }

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
    h += trendBar(c.trend);

    // the attendance warning — adults only; the server omits it on a student link
    if (c.flags && c.flags.kind) {
      h += '<div class="banner ' + c.flags.kind + '"><span class="ic">●</span><div><b>' +
           esc(c.flags.message) + '.</b></div></div>';
    }

    /* Homework, in the same two sections the teachers see, from the same
       server-side test — a parent and a teacher looking at the same child on
       a Monday evening must not see the work in different places.

       Each row carries its OWN date and teacher. One line for the whole card
       taken from the first item, which is what this card used to do, is
       wrong the moment two items were set on different days — and in the
       overdue section they almost always were. */
    var hw = c.homework || [];
    var owed = hw.filter(function (x) { return x.overdue; });
    var next = hw.filter(function (x) { return !x.overdue; });
    var nextLabel = c.next_class ? i18n.fmtDate(c.next_class, true) : t("noNextClass");

    function hwLines(list) {
      return list.map(function (x) {
        return '<div class="line"><span class="k">' +
          esc(x.kind === "memorise" ? t("memorize") : t("review")) + '</span>' +
          '<span class="ar" dir="rtl">' + esc(x.name_ar) + '</span>' +
          '<span>' + esc(x.name_en) + (x.whole_surah ? "" :
             (x.ayah_from ? " " + x.ayah_from + "–" + x.ayah_to : "")) + '</span></div>' +
          ((x.set_on || x.set_by)
            ? '<div class="line sub">' + esc(t("setOnBy", {
                d: i18n.fmtDate(x.set_on), t: x.set_by || "—" })) + '</div>' : '');
      }).join("");
    }

    // What is owed. Shown first, and only when there is something in it —
    // an empty "still to be heard" card every week is just noise.
    if (owed.length) {
      h += '<div class="pcard hero"><h2>' + esc(t("stillToHear")) + '</h2>' +
           hwLines(owed) + '</div>';
    }
    // What is coming, always shown: this is the one a family acts on.
    h += '<div class="pcard hero"><h2>' + esc(t("forNextClass")) + ' ' +
         esc(nextLabel) + '</h2>' +
         (next.length ? hwLines(next)
           : '<div class="line"><span>' + esc(t("nothingYet")) + '</span></div>') +
         '</div>';

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
        /* These two have always counted the whole Qur'an while the line above
           them counts one juz. Nothing said so, and the note underneath said
           the opposite — it claimed the whole card was counted inside the
           juz. Each line now carries its own scope, in the same muted voice
           the pages line already used for "of 23 in this juz". */
        '<div class="kv"><span>' + esc(t("surahsSolid")) + '</span><b>' + (c.surahs_solid || 0) +
          ' <span style="font-weight:400;color:var(--ink-3)">' + esc(t("ofWhole")) + '</span></b></div>' +
        '<div class="kv"><span>' + esc(t("needsReview")) + '</span><b>' + (c.needs_review || []).length +
          ' <span style="font-weight:400;color:var(--ink-3)">' + esc(t("ofWhole")) + '</span></b></div>' +
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
          return esc(r.name_en) + (r.ayah_from ? " " + r.ayah_from + "–" + r.ayah_to : "") +
                 (r.tajweed ? ' <span class="stars ro" aria-label="' + esc(t("tajweed")) + ' ' + r.tajweed + '/5">' +
                   [1,2,3,4,5].map(function (i) {
                     return '<span class="st' + (i <= r.tajweed ? " on" : "") + '">' +
                       '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2-.7-4.3-3.1-3 4.3-.6z"/></svg></span>';
                   }).join("") + '</span>' : "");
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
        var adab = x.adab && x.adab.stars
          ? '<div class="adabline">' + FACE(x.adab.stars) + '<span>' + esc(t("adab")) + ' ' +
            x.adab.stars + '/5' + (x.adab.note ? ' · “' + esc(x.adab.note) + '”' : '') +
            '</span></div>'
          : "";
        return '<div class="s"><div class="d">' + i18n.fmtDate(x.held_on, true) +
          (x.teacher ? ' · ' + esc(x.teacher) : '') + '</div>' +
          '<div class="w">' + line + '</div>' +
          adab + notes + '</div>';
      }).join("") : '<div class="empty" style="color:var(--ink-3);font-size:13.5px">' +
                     esc(t("noClasses")) + '</div>') +
      '</div><div style="height:10px"></div><div class="note">' + esc(t("contact")) +
      /* The guide goes out once, as a PDF attached to one message, and is lost
         by the second week. The page it explains is the one place a parent
         reliably comes back to, so it carries its own link to it — in the
         language they are reading, not the language the file was named in. */
      ' <a href="' + (i18n.isAr() ? "parent-guide-ar.html" : "parent-guide.html") +
      '" target="_blank" rel="noopener">' + esc(t("guideLink")) + '</a></div></div>';

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
