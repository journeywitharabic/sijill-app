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

  /* An adult reads their own page. Everything the parent wording assumes
     — "your child", a first name, ClassDojo — is wrong for a man in his
     forties looking at his own hifdh, and "Abu Yusuf" split on a space
     gives "Abu", which is not a name at all. */
  function adult(c) { return !!(c && c.is_adult); }
  function who(c) { return adult(c) ? c.name : String(c.name || "").split(" ")[0]; }
  function tc(c, key) { return adult(c) ? t(key + "Self") : t(key); }

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
      /* The class note. A family reads it as "here is what the lesson was",
         so it is headed by what it is, not by the word "note". */
      classNotes:"In class", cnBy:"with {t}",
      stillToHear:"Still to be heard", forNextClass:"To practise for",
      noNextClass:"the next class",
      setOnBy:"set {d} by {t}",
      memorize:"Memorize", review:"Review", setBy:"Set {d} by {t}",
      attendance:"Attendance", rate:"Attendance this year",
      breakdown:"Present / late / excused / no reason",
      present:"Present", late:"Late", excused:"Excused", noreason:"No reason", closed:"Class closed",
      where:"Where {n} is", pagesSolid:"Pages solid", ofPages:"of {n} in this juz",
      surahsSolid:"Learned well", needsReview:"To revise at home",
      learningNow:"Being learned now",
      learningNote:"Leave these to the teacher — they are mid-lesson, not behind.",
      ofWhole:"in the whole Qur\u2019an",
      scope:"The pages are counted inside juz {j} \u2014 the part {n} is memorising now. The two lines under it count the whole Qur\u2019an. Pages are a fairer measure than surahs, because surah lengths vary enormously.",
      helpHome:"To revise at home", learningHome:"Being learned now", recent:"Recent classes",
      nothingYet:"Nothing set yet.", noClasses:"No classes recorded yet.",
      /* "Nothing set yet" on a child who is holding three unheard pieces of
         work reads as "your child has been given nothing", and that is the
         message that reached Tarek. Both halves are true; saying only one of
         them is what made it wrong. */
      nothingNewBut:"Nothing new set for this class yet — but there is still {n} to practise above.",
      nothingNewBut1:"Nothing new set for this class yet — but there is still one to practise above.",
      dueOn:"to be ready for {d}",
      noticeSchool:"From the school", noticeClass:"From the class",
      noticeTeacher:"From your child’s teacher",
      noticeTeacherSelf:"From your teacher",
      noteBy:"{t} · {d}",
      markedLate:"attendance filled in on {d}",
      contact:"Any question about homework or attendance — message the school on ClassDojo.",
      contactSelf:"Any question about your homework — speak to your teacher at the halaqa.",
      tajweed:"Tajwīd", adab:"Adab", tr_up:"moving forward", tr_flat:"standing still", tr_down:"needs attention", tr_away:"not enough to say", trHelp:"over the last few classes", wholeSurah:"whole surah", ayat:"ayat", notMarked:"not marked",
      noneRecorded:"Attended · no recitation recorded that day",
      /* EX-10: how a recitation went, in words. A judgement of the
         PASSAGE, never of the child — "learned well", not "he did well". */
      outGood:"learned well", outAverage:"nearly there",
      outRepeat:"to go over again", outNotReady:"wasn’t ready that day",
      heardBy:"heard by {t}",
      /* EX-9: attendance as a sentence before the numbers. */
      attWas:"Been at {n} of {t} classes.",
      attLate1:"Late once.", attLate:"Late {n} times.",
      attNoReason1:"One absence with no reason given.",
      attNoReason:"{n} absences with no reason given.",
      attExcused1:"One excused absence.", attExcused:"{n} excused absences.",
      /* EX-8: how to spread it over the week. */
      splitDaily:"About {n} ayat a day over {d} days.",
      splitAll:"Go through all of it together before the next class.",
      guideLink:"A short guide to this page",
      notAssessed:"We haven't done this year's review with your child yet. Once their teacher has been through it — usually in the first few weeks — their progress appears here.",
      notAssessedSelf:"Your memorization has not been written down yet. Once you have been through it with your teacher it appears here." 
    },
    ar: {
      classNotes:"فِي الحَلْقَة", cnBy:"مَعَ {t}",
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
      surahsSolid:"مُتْقَنَة", needsReview:"لِلْمُرَاجَعَةِ فِي الْبَيْت",
      learningNow:"يَحْفَظُهَا الْآن",
      learningNote:"اُتْرُكْهَا لِلْمُعَلِّم، فَهِيَ فِي أَثْنَاءِ الدَّرْسِ وَلَيْسَتْ مُتَأَخِّرَةً.",
      ofWhole:"فِي القُرْآنِ كُلِّه",
      scope:"الصَّفَحَاتُ مَحْسُوبَةٌ ضِمْنَ الجُزْءِ {j} — القِسْمِ الَّذِي يَحْفَظُهُ {n} الآنَ. أَمَّا السَّطْرَانِ تَحْتَهُ فَيَشْمَلَانِ القُرْآنَ كُلَّه. وَالصَّفَحَاتُ مِقْيَاسٌ أَدَقُّ مِنَ السُّوَرِ لِأَنَّ أَطْوَالَ السُّوَرِ مُتَفَاوِتَة.",
      helpHome:"لِلْمُرَاجَعَةِ فِي البَيْت", learningHome:"يَحْفَظُهَا الآن", recent:"الحِصَصُ الأَخِيرَة",
      nothingYet:"لَمْ يُحَدَّدْ شَيْءٌ بَعْد.", noClasses:"لَا حِصَصَ مُسَجَّلَةٌ بَعْد.",
      nothingNewBut:"لَمْ يُحَدَّدْ جَدِيدٌ لِهَذِهِ الحِصَّةِ بَعْد — غَيْرَ أَنَّ {n} مَا زَالَتْ لِلتَّحْضِيرِ أَعْلَاه.",
      nothingNewBut1:"لَمْ يُحَدَّدْ جَدِيدٌ لِهَذِهِ الحِصَّةِ بَعْد — غَيْرَ أَنَّ وَاحِدًا مَا زَالَ لِلتَّحْضِيرِ أَعْلَاه.",
      dueOn:"لِيَكُونَ جَاهِزًا لِـ{d}",
      noticeSchool:"مِنَ المَدْرَسَة", noticeClass:"مِنَ الحَلْقَة",
      noticeTeacher:"مِنْ مُعَلِّمِ اِبْنِكُم",
      noteBy:"{t} · {d}",
      markedLate:"سُجِّلَ الحُضُورُ بِتَارِيخِ {d}",
      contact:"لِأَيِّ سُؤَالٍ حَوْلَ الوَاجِبِ أَوِ الحُضُور، رَاسِلِ المَدْرَسَةَ عَبْرَ ClassDojo.",
      contactSelf:"لِأَيِّ سُؤَالٍ حَوْلَ وَاجِبِك، كَلِّمْ مُعَلِّمَكَ فِي الحَلْقَة.",
      noticeTeacherSelf:"مِنْ مُعَلِّمِك",
      notAssessedSelf:"لَمْ يُسَجَّلْ حِفْظُكَ بَعْد. وَإِذَا رَاجَعْتَهُ مَعَ مُعَلِّمِكَ ظَهَرَ هُنَا.",
      tajweed:"التَّجْوِيد", adab:"الأَدَب", tr_up:"يَتَقَدَّم", tr_flat:"ثَابِت", tr_down:"يَحْتَاجُ انْتِبَاهًا", tr_away:"لَا يُمْكِنُ الحُكْمُ بَعْد", trHelp:"خِلَالَ الحِصَصِ الأَخِيرَة", wholeSurah:"السُّورَةُ كَامِلَة", ayat:"آيَة", notMarked:"لَمْ يُسَجَّل",
      noneRecorded:"حَضَرَ · وَلَمْ تُسَجَّلْ تِلَاوَةٌ فِي ذَلِكَ اليَوْم",
      outGood:"أَتْقَنَهَا", outAverage:"قَارَبَ الإِتْقَان",
      outRepeat:"يُعِيدُهَا", outNotReady:"لَمْ يَكُنْ مُسْتَعِدًّا ذَلِكَ اليَوْم",
      heardBy:"سَمِعَهَا {t}",
      attWas:"حَضَرَ {n} مِنْ {t} حِصَّة.",
      attLate1:"تَأَخَّرَ مَرَّةً وَاحِدَة.", attLate:"تَأَخَّرَ {n} مَرَّات.",
      attNoReason1:"غِيَابٌ وَاحِدٌ بِلَا عُذْر.",
      attNoReason:"{n} غِيَابَاتٍ بِلَا عُذْر.",
      attExcused1:"غِيَابٌ وَاحِدٌ بِعُذْر.", attExcused:"{n} غِيَابَاتٍ بِعُذْر.",
      splitDaily:"نَحْوَ {n} آيَةٍ فِي اليَوْمِ عَلَى {d} أَيَّام.",
      splitAll:"اِقْرَأْهَا كَامِلَةً مَرَّةً وَاحِدَةً قَبْلَ الحِصَّةِ القَادِمَة.",
      guideLink:"دَلِيلٌ مُخْتَصَرٌ لِهَذِهِ الصَّفْحَة",
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

    /* Notices, above everything. School-wide ones come once at the top of
       the response rather than per child, so a family with three children
       here reads an announcement once instead of three times. Each carries
       no date of its own on screen: it is here because it is current, and
       it leaves on its own when it stops being. */
    var nots = ((DATA.notices || []).map(function (n) { return { n: n, school: true }; }))
      .concat((c.notices || []).map(function (n) { return { n: n, school: false }; }));
    if (nots.length) {
      h += nots.map(function (x) {
        return '<div class="pcard notice' + (x.school ? " school" : "") + '">' +
          '<h2>' + esc(t(x.school ? "noticeSchool" : "noticeClass")) + '</h2>' +
          '<div class="line"><span>' + esc(x.n.body) + '</span></div></div>';
      }).join("");
    }
    /* What the teacher wrote about this child. These used to come back only
       when the note had been attached to a passage during grading, so a note
       written from the + Add a note button — which is where a teacher writes
       to the parents — reached nobody. Each carries its own day and author:
       unlike a notice, a note does not expire, so without a date a parent
       cannot tell last Sunday's from September's. */
    var tn = c.teacher_notes || [];
    if (tn.length) {
      h += '<div class="pcard notice"><h2>' + esc(tc(c, "noticeTeacher")) + '</h2>' +
        tn.map(function (n) {
          return '<div class="line"><span>' + esc(n.body) + '</span>' +
            '<div class="nby">' + esc(t("noteBy", {
              t: n.by || "", d: n["on"] ? i18n.fmtDate(n["on"]) : "" })) + '</div></div>';
        }).join("") + '</div>';
    }

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

    /* One .hwitem per piece of homework, wrapping its surah line and its
       "set when, by whom" line. The two lines used to be siblings, and the
       dividing rule belonged to the FIRST of them — so it landed between a
       surah and its own provenance, and sat on the text. A rule separates
       entries, not the halves of one entry; owning it at the entry is the
       only way to say that without a previous-sibling selector. */
    /* How many ayat a piece of homework actually covers. A range when it
       carries one, the whole surah when it does not — `ayat` is the surah's
       length and is already on the wire for exactly this. */
    function ayatOf(x) {
      if (x.ayah_from && x.ayah_to) return (x.ayah_to - x.ayah_from) + 1;
      return x.ayat || 0;
    }

    function hwLines(list) {
      return list.map(function (x) {
        return '<div class="hwitem"><div class="line"><span class="k">' +
          esc(x.kind === "memorise" ? t("memorize") : t("review")) + '</span>' +
          '<span class="ar" dir="rtl">' + esc(x.name_ar) + '</span>' +
          '<span>' + esc(x.name_en) + (x.whole_surah ? "" :
             (x.ayah_from ? " " + x.ayah_from + "–" + x.ayah_to : "")) + '</span></div>' +
          ((x.set_on || x.set_by)
            ? '<div class="line sub">' + esc(t("setOnBy", {
                d: i18n.fmtDate(x.set_on), t: x.set_by || "—" })) +
              (x.due_on ? ' \u00b7 ' +
                esc(t("dueOn", { d: i18n.fmtDate(x.due_on, true) })) : '') +
              '</div>' : '') +
          /* EX-8: how to actually do it this week. A parent who wants to
             help and does not know how is the one this card is for, and
             "Al-Mulk 1-20 by Friday" tells them nothing about tonight.

             Only where it helps: a passage with no ayah count, nothing due,
             or a due date already gone gets no suggestion rather than a
             made-up one. On the last day it says to go through all of it
             together, because splitting one day is not a split. */
          (function () {
            var n = ayatOf(x);
            if (!n || !x.due_on || !c.class_day) return '';
            var days = Math.round(
              (new Date(x.due_on + "T00:00:00") - new Date(c.class_day + "T00:00:00"))
              / 86400000);
            if (days <= 0) return '';
            if (days === 1 || n <= days) {
              return '<div class="line split">' + esc(t("splitAll")) + '</div>';
            }
            return '<div class="line split">' +
              esc(t("splitDaily", { n: Math.ceil(n / days), d: days })) + '</div>';
          })() +
          '</div>';
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
           : '<div class="line"><span>' + esc(owed.length
               ? t(owed.length === 1 ? "nothingNewBut1" : "nothingNewBut", { n: owed.length })
               : t("nothingYet")) + '</span></div>') +
         '</div>';

    /* What the class did together, newest first. Shown only when a teacher
       has written one — an empty "nothing from the class" card every week
       would tell a family their teacher is not bothering, which is both
       unkind and usually untrue. */
    var cn = c.class_notes || [];
    if (cn.length) {
      h += '<div class="pcard"><h2>' + esc(t("classNotes")) + '</h2>' +
        cn.map(function (x) {
          return '<div class="cn">' +
            '<div class="cn-when">' + esc(i18n.fmtDate(x.held_on, true)) +
              (x.by ? ' · ' + esc(t("cnBy", { t: x.by })) : '') + '</div>' +
            '<div class="cn-txt">' + esc(x.note) + '</div></div>';
        }).join("") + '</div>';
    }

    // attendance
    var a = c.attendance_summary || {};
    /* EX-9: the sentence comes first, then the detail. "92%" and
       "8 · 1 · 2 · 0" are four numbers over a legend a parent has to
       decode before they mean anything, and the thing most parents want is
       one line telling them whether their child is turning up.

       Built from the parts rather than from a template per combination:
       four counts give sixteen sentences, and fifteen of them would be
       written once and never read again. */
    var att = (function () {
      var seen = (a.present || 0) + (a.late || 0);
      var tot = seen + (a.excused || 0) + (a.no_reason || 0);
      if (!tot) return "";
      var bits = [t("attWas", { n: seen, t: tot })];
      if (a.late)      bits.push(a.late === 1 ? t("attLate1") : t("attLate", { n: a.late }));
      if (a.no_reason) bits.push(a.no_reason === 1 ? t("attNoReason1")
                                                   : t("attNoReason", { n: a.no_reason }));
      if (a.excused)   bits.push(a.excused === 1 ? t("attExcused1")
                                                 : t("attExcused", { n: a.excused }));
      return bits.join(" ");
    })();
    h += '<div class="pcard"><h2>' + esc(t("attendance")) + '</h2>' +
      (att ? '<p class="attline">' + esc(att) + '</p>' : '') +
      '<div class="dots">' +
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
      h += '<div class="pcard"><h2>' + esc(t("where", { n: who(c) })) + '</h2>' +
        '<div class="note">' + esc(tc(c, "notAssessed")) + '</div></div>';
    } else {
      var pct = p.pages_in_juz ? Math.round(p.pages_solid / p.pages_in_juz * 100) : 0;
      var pctP = p.pages_in_juz ? Math.round(p.pages_partial / p.pages_in_juz * 100) : 0;
      h += '<div class="pcard"><h2>' + esc(t("where", { n: who(c) })) + '</h2>' +
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
        /* A surah being learned used to be counted here too, so a child
           halfway through Ar-Rahman was reported to their parents as needing
           to revise it — in a card headed "help at home", beside the ones
           that really had slipped. Two different things, said separately
           (migration 59). */
        ((c.learning || []).length
          ? '<div class="kv"><span>' + esc(t("learningNow")) + '</span><b>' + c.learning.length +
            ' <span style="font-weight:400;color:var(--ink-3)">' + esc(t("ofWhole")) + '</span></b></div>'
          : '') +
        '<div style="height:10px"></div>' +
        '<span class="bar2" style="width:100%;height:10px"><i class="a" style="width:' + pct + '%"></i>' +
          '<i class="r" style="width:' + pctP + '%"></i></span>' +
        '<div style="height:11px"></div><div class="note">' +
          esc(t("scope", { j: p.juz, n: who(c) })) + '</div></div>';
    }

    // what to help with
    if ((c.needs_review || []).length) {
      h += '<div class="pcard"><h2>' + esc(t("helpHome")) + '</h2><div class="rlist">' +
        c.needs_review.map(function (r) {
          return '<div class="r"><span class="ar" dir="rtl">' + esc(r.name_ar) +
                 '</span><span class="tr">' + esc(r.name_en) + '</span></div>';
        }).join("") + '</div></div>';
    }

    /* What the teacher is teaching right now. A parent seeing it listed
       should know it is in hand, not that they have something to fix. */
    if ((c.learning || []).length) {
      h += '<div class="pcard"><h2>' + esc(t("learningHome")) + '</h2><div class="rlist">' +
        c.learning.map(function (r) {
          return '<div class="r"><span class="ar" dir="rtl">' + esc(r.name_ar) +
                 '</span><span class="tr">' + esc(r.name_en) + '</span></div>';
        }).join("") +
        '</div><div class="note" style="margin-top:9px">' + esc(t("learningNote")) + '</div></div>';
    }

    // recent classes. recent_attendance already carries the state for each
    // date, so the two can be joined here rather than in a new SQL migration.
    var ATT = {};
    (c.recent_attendance || []).forEach(function (d) { ATT[d.held_on] = d.state; });
    h += '<div class="pcard"><h2>' + esc(t("recent")) + '</h2><div class="sess">' +
      ((c.recent_classes || []).length ? c.recent_classes.map(function (x) {
        var recited = (x.recited || []).map(function (r) {
          /* EX-10: how it went, in words. The outcome has been on the wire
             since the page was written and was never printed, so a parent
             saw "Al-Mulk 1-10" with four stars beside it and no way to tell
             whether that was a good morning or a bad one. The stars are
             tajwid, which is a different question.

             Said as a judgement of the RECITATION, never of the child:
             "learned well", not "he did well". */
          var word = r.outcome === "good" ? t("outGood")
                   : r.outcome === "average" ? t("outAverage")
                   : r.outcome === "repeat" ? t("outRepeat")
                   : r.outcome === "not_prepared" ? t("outNotReady") : "";
          var tone = r.outcome === "repeat" ? "late"
                   : r.outcome === "not_prepared" ? "exc"
                   : r.outcome === "average" ? "avg" : "ok";
          return '<div class="rline">' +
            '<span class="rsurah">' + esc(r.name_en) +
              (r.ayah_from ? " " + r.ayah_from + "–" + r.ayah_to : "") + '</span>' +
            (word ? ' <span class="pill ' + tone + '"><i></i>' + esc(word) + '</span>' : "") +
            /* ...and who heard it. A parent asking "who said this?" is
               asking a reasonable question, and the teacher is already
               carried on each passage. */
            /* Only when it was somebody OTHER than whoever took the class.
               The day line above already names the teacher, and four
               passages each repeating it is noise; a passage heard by a
               different teacher is the case worth saying out loud, and it
               is the one the day line gets wrong. */
            (r.by && r.by !== x.teacher
               ? ' <span class="heard">' + esc(t("heardBy", { t: r.by })) + '</span>' : "") +
                 (r.tajweed ? ' <span class="stars ro" aria-label="' + esc(t("tajweed")) + ' ' + r.tajweed + '/5">' +
                   [1,2,3,4,5].map(function (i) {
                     return '<span class="st' + (i <= r.tajweed ? " on" : "") + '">' +
                       '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2-.7-4.3-3.1-3 4.3-.6z"/></svg></span>';
                   }).join("") + '</span>' : "") +
            '</div>';
        /* One per line. Round 48 added a grade word and sometimes a teacher
           to each passage, and four of them joined by middots came out as a
           wall of text that wrapped mid-item — the worst of both, because
           you could no longer see where one recitation ended and the next
           began. The separator was doing the work a line break should. */
        }).join("");
        // The notes used to be printed here, under the class day they were
        // attached to. They now have a card of their own at the top, with
        // their date — printing them in both places would show every
        // session-tied note twice.
        var notes = "";
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
        /* A mark typed long after the class it belongs to. The register has
           said this since round 35; the page a parent reads had not, so a
           correction made three weeks later looked from their side exactly
           like a mark taken in the room. It matters most here: this is the
           record a family disputes. */
        var late = x.marked_late
          ? '<div class="line sub">' + esc(t("markedLate", { d: i18n.fmtDate(x.marked_late) })) + '</div>'
          : '';
        var adab = x.adab && x.adab.stars
          ? '<div class="adabline">' + FACE(x.adab.stars) + '<span>' + esc(t("adab")) + ' ' +
            x.adab.stars + '/5' + (x.adab.note ? ' · “' + esc(x.adab.note) + '”' : '') +
            '</span></div>'
          : "";
        return '<div class="s"><div class="d">' + i18n.fmtDate(x.held_on, true) +
          (x.teacher ? ' · ' + esc(x.teacher) : '') + '</div>' +
          '<div class="w">' + line + '</div>' +
          late + adab + notes + '</div>';
      }).join("") : '<div class="empty" style="color:var(--ink-3);font-size:13.5px">' +
                     esc(t("noClasses")) + '</div>') +
      '</div><div style="height:10px"></div><div class="note">' + esc(tc(c, "contact")) +
      /* The guide goes out once, as a PDF attached to one message, and is lost
         by the second week. The page it explains is the one place a parent
         reliably comes back to, so it carries its own link to it — in the
         language they are reading, not the language the file was named in. */
      /* ...but not for an adult: the guide it points at is written for a
         parent reading about their child, start to finish. */
      (adult(c) ? '' :
        ' <a href="' + (i18n.isAr() ? "parent-guide-ar.html" : "parent-guide.html") +
        '" target="_blank" rel="noopener">' + esc(t("guideLink")) + '</a>') +
      '</div></div>';

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

    /* Preview mode, for teachers. Teachers kept asking what the family
       actually sees, and the honest way to answer that is to show them THIS
       page rather than a second rendering of the same data that drifts from
       it within two rounds. So the page can be opened with #preview=<id>
       and the teacher's own session token, which the server checks: no
       family link is involved, none is shown, and nothing here can write.

       It is deliberately the same file. A preview that is a copy is a
       preview that is eventually a lie. */
    var prev = /(?:^|&|#)preview=([0-9a-f-]{36})/.exec(location.hash || "");
    if (prev) {
      var tok = null;
      try { tok = localStorage.getItem("sijill.token"); } catch (e) {}
      if (!tok) {
        return oops("Not signed in",
          "Open this from the teacher app — it uses your own sign-in, not a family link.");
      }
      show("v-loading");
      document.documentElement.setAttribute("data-preview", "1");
      return api.rpc("api_family_preview", { p_token: tok, p_student: prev[1] })
        .then(function (d) {
          if (!d || d.ok === false) {
            return oops("Could not show that child", (d && d.error) || "Try again.");
          }
          DATA = d; WHICH = 0; show("v-family"); render();
        }).catch(function (e) {
          oops("Could not show that child", e.message || "Try again.");
        });
    }

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
      /* An adult opening his own link lands here because this is the page
         the setup script printed, and this page is read-only — it was
         built for a parent watching a child. His own page, the one he can
         actually set homework and mark his memorization from, is the app.
         Send him there rather than showing him a wall he cannot act on.
         Only ever for a single-student link belonging to an adult: a
         parent's link, and a child's own link, stay exactly where they
         are. */
      if (d.kind === "student" && (d.children || []).length === 1 &&
          d.children[0] && d.children[0].is_adult) {
        location.replace("index.html#link=" + encodeURIComponent(code));
        return;
      }
      DATA = d; WHICH = 0;
      show("v-family"); render();
    }).catch(function (e) {
      oops("Could not load the page", e.message ||
        "Check your connection and try again. If it keeps happening, tell the school.");
    });
  })();
})();
