/* ============================================================================
   Sijill · سِجِلّ — English and Arabic.
   Arabic is Modern Standard with full tashkeel, as Tarek asked.
   Add a key to BOTH lists or the app falls back to English for it.
   ============================================================================ */
(function () {
  "use strict";

  var EN = {
    schoolName:"Qur’an School",
    gateTitle:"Sign in",
    gateHelp:"Type the school passphrase. You only do this once on this phone — it will remember you.",
    gateGo:"Sign in",
    whoTitle:"Who is teaching?",
    whoHelp:"Pick your name. Everything you record today is signed with it, so a mistake can always be traced back and corrected.",
    whoAdd:"My name is not on the list",
    whoAddTitle:"Add your name",
    whoAddHelp:"You will be able to teach straight away. A coordinator confirms your name afterwards.",
    markAll:"Mark all present", bulkHw:"+ Homework for the class",
    undo:"↶ Undo last change", clsHint:"Tap <b>✓ heard</b> when a child recites everything they had open and there is nothing to add. Tap their <b>name</b> for anything else. Both attendance <b>and</b> recitation are needed before the day counts as complete. Everything saves as you tap.",
    coordMode:"Coordinator tools", signOut:"Sign out",
    back:"‹ Back", fullMushaf:"☰ Mushaf",
    present:"present", late:"late", excused:"excused", noreason:"no reason",
    dueback:"due back", heard:"heard", recited:"recited", carries:"homework carries over",
    notMarked:"not marked yet",
    doneAll:"Today is complete", doneAllSub:"All {n} students — attendance and recitation both recorded",
    donePart:"of {n} students not yet complete",
    donePartSub:"Mark attendance <b>and</b> each student's recitation — both are needed",
    gDue:"Due back", gNew:"New memorization", gRot:"Review — oldest first",
    nextWeek:"Homework for next week", recentCls:"Recent classes",
    assignNew:"+ Assign new memorization", addReview:"+ Add old memorization to review",
    markKey:"<b>✓</b> recited well · <b>↻</b> more than 3 mistakes, comes back next week · <b>–</b> was present but hadn't prepared it.",
    hwHint:"<b>from ↻ repeat</b> means it landed here by itself. <b>set by teacher</b> means you chose it.",
    noneDue:"Nothing owed back.", noneNew:"No new memorization set.",
    noneHw:"No homework set for next week yet.", noneHist:"No classes recorded yet.",
    saving:"saving…", savedAll:"All changes saved", retryNow:"Retry now",
    failOne:"change did not save", failMany:"changes did not save",
    failHelp:"Nothing has been lost. Tap retry — if it keeps failing, write the marks on paper and tell Tarek.",
    signedAs:"Signed in as", notYou:"Not you?",
    reasonAsk:"Why were they away?",
    close:"Close", cancel:"Cancel", save:"Save", add:"Add", remove:"Remove", edit:"Edit",
    wholeSurah:"whole surah", ayat:"ayat", page:"page",
    coordAsk:"Coordinator passphrase",
    coordHelp:"This is the second passphrase, the one only the two coordinators have.",
    tabDash:"School", tabManage:"Manage", tabStats:"Statistics",
    student:"Student", classW:"Class", attendance:"Attendance", flags:"Needs attention",
    lastHeard:"Last heard", pages:"Pages", none:"—",
    weeks:"weeks ago", never:"not yet heard", thisTerm:"this term",

    /* --- one tap from the class list, and the labels under the marks --- */
    mHere:"here", mLate:"late", mAway:"away",
    gGood:"good", gAgain:"again", gNotReady:"not ready",
    gGoodTip:"Recited to standard — three mistakes a page or fewer",
    gAgainTip:"More than three mistakes a page. It comes back next week by itself.",
    gNotReadyTip:"Here, but had not worked on it. A conversation with the family, not a teaching problem.",
    week1:"week ago",
    mtSolid:"solid", mtReview:"review", mtClear:"clear",
    findSurah:"Find a surah — name or number",
    trend:"Trend",
    tr_up:"moving forward", tr_flat:"standing still",
    tr_down:"going backwards", tr_away:"not enough to say",
    mtClearTip:"Remove this from the child's record — use it to correct a mistake, not to mark forgetting",
    mtClearAsk:"Clear this from the record?",
    mtClearBody:"It stops counting as memorised. If the child has forgotten it, mark it review instead — that keeps the history and puts it back in the rotation.",
    mtPagesSolid:"{n} pages solid across the mushaf",
    mtHelp:"Tap a juz to open it. You can mark a whole juz, a hizb, a page or a few ayat — whichever matches what you actually know. Nothing here says the child recited today; it records what they already have.",
    heardAll:"heard", heardAllTip:"Heard everything they had open, all good",
    heardDone:"{name} — {n} marked good",
    /* --- taking a mark back --- */
    undoMark:"Take back", undoMarkTitle:"Take this mark back?",
    undoMarkBody:"The recitation is kept and marked withdrawn. {who} memorization goes back to what it was, and any homework it cleared opens again.",
    undoneOk:"Mark taken back",
    undoTooLate:"This surah has been marked again since. Take the newer mark back first.",
    /* --- notes --- */
    gNotes:"Notes", noneNotes:"No notes yet.", noteAdd:"+ Add a note",
    noteEdit:"Edit note", noteDelete:"Delete this note?",
    noteDeleteBody:"It stays in the record and a coordinator can put it back.",
    noteBy:"by", noteEdited:"edited",
    /* --- next student --- */
    nextStu:"Next student", pickStu:"Pick a student", ofN:"{i} of {n}",
    allDone:"That was the last one",
    /* --- duplicate homework --- */
    dupTitle:"They already have this",
    dupBody:"{n} of these students already have an overlapping passage open. Assign it again anyway?",
    dupAnyway:"Assign anyway"
  };

  var AR = {
    schoolName:"مَدْرَسَةُ القُرْآنِ",
    gateTitle:"تَسْجِيلُ الدُّخُول",
    gateHelp:"اُكْتُبْ كَلِمَةَ مُرُورِ المَدْرَسَة. تَفْعَلُ ذَلِكَ مَرَّةً وَاحِدَةً عَلَى هَذَا الهَاتِفِ فَقَط.",
    gateGo:"دُخُول",
    whoTitle:"مَنْ يُدَرِّسُ اليَوْم؟",
    whoHelp:"اخْتَرِ اسْمَكَ. كُلُّ مَا تُسَجِّلُهُ اليَوْمَ يُنْسَبُ إِلَيْك، فَيُمْكِنُ تَتَبُّعُ أَيِّ خَطَإٍ وَتَصْحِيحُه.",
    whoAdd:"اسْمِي لَيْسَ فِي القَائِمَة",
    whoAddTitle:"أَضِفِ اسْمَك",
    whoAddHelp:"يُمْكِنُكَ التَّدْرِيسُ فَوْرًا. يُؤَكِّدُ المُنَسِّقُ اسْمَكَ لَاحِقًا.",
    markAll:"تَسْجِيلُ الجَمِيعِ حَاضِرِين", bulkHw:"+ وَاجِبٌ لِلْحَلْقَةِ كُلِّهَا",
    undo:"↶ تَرَاجُعٌ عَنْ آخِرِ تَغْيِير",
    clsHint:"اُنْقُرْ <b>✓ سَمِعْتُهُ</b> إِذَا تَلَا الطَّالِبُ كُلَّ مَا كَانَ عَلَيْهِ وَلَا شَيْءَ يُضَاف. وَانْقُرْ عَلَى <b>الاِسْمِ</b> لِمَا سِوَى ذَلِك. يَلْزَمُ تَسْجِيلُ الحُضُورِ <b>وَ</b>التِّلَاوَةِ مَعًا حَتَّى يَكْتَمِلَ اليَوْم. كُلُّ شَيْءٍ يُحْفَظُ تِلْقَائِيًّا.",
    coordMode:"أَدَوَاتُ المُنَسِّق", signOut:"تَسْجِيلُ الخُرُوج",
    back:"‹ رُجُوع", fullMushaf:"☰ المُصْحَف",
    present:"حَاضِر", late:"مُتَأَخِّر", excused:"بِعُذْر", noreason:"بِدُونِ عُذْر",
    dueback:"لِلْإِعَادَة", heard:"سُمِعَتْ", recited:"سُجِّلَ", carries:"الوَاجِبُ مُسْتَمِرّ",
    notMarked:"لَمْ يُسَجَّلْ بَعْد",
    doneAll:"اكْتَمَلَ اليَوْم", doneAllSub:"جَمِيعُ الـ{n} طُلَّاب: الحُضُورُ وَالتِّلَاوَةُ مُسَجَّلَان",
    donePart:"مِنْ {n} لَمْ تَكْتَمِلْ بَيَانَاتُهُمْ",
    donePartSub:"سَجِّلِ الحُضُورَ <b>وَ</b> تِلَاوَةَ كُلِّ طَالِبٍ — كِلَاهُمَا مَطْلُوب",
    gDue:"لِلْإِعَادَة", gNew:"الحِفْظُ الجَدِيد", gRot:"المُرَاجَعَة — الأَقْدَمُ أَوَّلًا",
    nextWeek:"وَاجِبُ الأُسْبُوعِ القَادِم", recentCls:"الحِصَصُ الأَخِيرَة",
    assignNew:"+ إِسْنَادُ حِفْظٍ جَدِيد", addReview:"+ إِضَافَةُ حِفْظٍ قَدِيمٍ لِلْمُرَاجَعَة",
    markKey:"<b>✓</b> تَلَا جَيِّدًا · <b>↻</b> أَكْثَرُ مِنْ ثَلَاثِ أَخْطَاءٍ، يُعَادُ الأُسْبُوعَ القَادِم · <b>–</b> كَانَ حَاضِرًا لَكِنَّهُ لَمْ يُحَضِّرْ.",
    hwHint:"<b>مِنْ ↻ إِعَادَة</b> يَعْنِي أَنَّهُ أُضِيفَ تِلْقَائِيًّا. <b>أَضَافَهُ المُعَلِّم</b> يَعْنِي أَنَّكَ اخْتَرْتَه.",
    noneDue:"لَا شَيْءَ لِلْإِعَادَة.", noneNew:"لَمْ يُسْنَدْ حِفْظٌ جَدِيد.",
    noneHw:"لَمْ يُحَدَّدْ وَاجِبٌ بَعْد.", noneHist:"لَا حِصَصَ مُسَجَّلَةٌ بَعْد.",
    saving:"قَيْدَ الحِفْظ…", savedAll:"حُفِظَ الكُلّ", retryNow:"أَعِدِ المُحَاوَلَةَ الآن",
    failOne:"تَغْيِيرٌ لَمْ يُحْفَظ", failMany:"تَغْيِيرَاتٌ لَمْ تُحْفَظ",
    failHelp:"لَمْ يَضِعْ شَيْء. أَعِدِ المُحَاوَلَة — وَإِنِ اسْتَمَرَّ الخَلَل، سَجِّلْ عَلَى الوَرَقِ وَأَخْبِرْ طَارِق.",
    signedAs:"مُسَجَّلٌ بِاسْم", notYou:"لَسْتَ أَنْت؟",
    reasonAsk:"مَا سَبَبُ الغِيَاب؟",
    close:"إِغْلَاق", cancel:"إِلْغَاء", save:"حِفْظ", add:"إِضَافَة", remove:"حَذْف", edit:"تَعْدِيل",
    wholeSurah:"السُّورَةُ كَامِلَة", ayat:"آيَات", page:"صَفْحَة",
    coordAsk:"كَلِمَةُ مُرُورِ المُنَسِّق",
    coordHelp:"هَذِهِ هِيَ الكَلِمَةُ الثَّانِيَة، الَّتِي لَا يَمْلِكُهَا إِلَّا المُنَسِّقَان.",
    tabDash:"المَدْرَسَة", tabManage:"الإِدَارَة", tabStats:"الإِحْصَاءَات",
    student:"الطَّالِب", classW:"الحَلْقَة", attendance:"الحُضُور", flags:"يَحْتَاجُ اِنْتِبَاهًا",
    lastHeard:"آخِرُ سَمَاع", pages:"صَفَحَات", none:"—",
    weeks:"أَسَابِيعَ مَضَتْ", never:"لَمْ يُسْمَعْ بَعْدُ", thisTerm:"هَذَا الفَصْل",

    mHere:"حَاضِر", mLate:"مُتَأَخِّر", mAway:"غَائِب",
    gGood:"جَيِّد", gAgain:"أَعِدْ", gNotReady:"لَمْ يُحَضِّرْ",
    gGoodTip:"تَلَا عَلَى المُسْتَوَى المَطْلُوب — ثَلَاثَةُ أَخْطَاءٍ فِي الصَّفْحَةِ أَوْ أَقَلّ",
    gAgainTip:"أَكْثَرُ مِنْ ثَلَاثَةِ أَخْطَاءٍ فِي الصَّفْحَة. يَعُودُ الأُسْبُوعَ القَادِمَ تِلْقَائِيًّا.",
    gNotReadyTip:"حَاضِرٌ لَكِنَّهُ لَمْ يَعْمَلْ عَلَيْه. هَذَا حَدِيثٌ مَعَ الأُسْرَة، لَا مُشْكِلَةٌ تَعْلِيمِيَّة.",
    week1:"أُسْبُوعٌ مَضَى",
    mtSolid:"مُتْقَن", mtReview:"مُرَاجَعَة", mtClear:"مَسْح",
    findSurah:"ابْحَثْ عَنْ سُورَة — بِالاِسْمِ أَوْ بِالرَّقَم",
    trend:"الاِتِّجَاه",
    tr_up:"يَتَقَدَّم", tr_flat:"ثَابِتٌ بِلَا تَقَدُّم",
    tr_down:"يَتَرَاجَع", tr_away:"لَا يَكْفِي لِلْحُكْم",
    mtClearTip:"يُزِيلُ هَذَا مِنْ سِجِلِّ الطَّالِب — لِتَصْحِيحِ خَطَإٍ، لَا لِتَسْجِيلِ النِّسْيَان",
    mtClearAsk:"هَلْ تَمْسَحُ هَذَا مِنَ السِّجِلّ؟",
    mtClearBody:"لَنْ يُحْسَبَ مَحْفُوظًا بَعْدَ الآن. إِنْ كَانَ الطَّالِبُ قَدْ نَسِيَهُ فَاخْتَرْ مُرَاجَعَة، فَذَلِكَ يَحْفَظُ التَّارِيخَ وَيُعِيدُهُ إِلَى دَوْرَةِ المُرَاجَعَة.",
    mtPagesSolid:"{n} صَفْحَةً مُتْقَنَةً فِي المُصْحَفِ كُلِّهِ",
    mtHelp:"اُنْقُرْ عَلَى جُزْءٍ لِفَتْحِه. يُمْكِنُكَ تَعْلِيمُ جُزْءٍ كَامِلٍ أَوْ حِزْبٍ أَوْ صَفْحَةٍ أَوْ بِضْعِ آيَاتٍ، بِحَسَبِ مَا تَعْرِفُهُ فِعْلًا. لَا شَيْءَ هُنَا يَقُولُ إِنَّ الطَّالِبَ تَلَا اليَوْم؛ هَذَا تَسْجِيلٌ لِمَا هُوَ حَافِظُهُ أَصْلًا.",
    heardAll:"سَمِعْتُهُ", heardAllTip:"سَمِعْتُ كُلَّ مَا كَانَ عَلَيْهِ، وَكُلُّهُ جَيِّد",
    heardDone:"{name} — سُجِّلَ {n} بِنَجَاح",
    undoMark:"تَرَاجَعْ", undoMarkTitle:"هَلْ تَتَرَاجَعُ عَنْ هَذَا التَّسْجِيل؟",
    undoMarkBody:"تَبْقَى التِّلَاوَةُ فِي السِّجِلِّ مَعَ عَلَامَةِ السَّحْب. يَعُودُ حِفْظُ {who} إِلَى مَا كَانَ عَلَيْهِ، وَيُفْتَحُ الوَاجِبُ الَّذِي أُغْلِقَ مِنْ جَدِيد.",
    undoneOk:"تَمَّ التَّرَاجُع",
    undoTooLate:"سُجِّلَتْ هَذِهِ السُّورَةُ مَرَّةً أُخْرَى بَعْدَ ذَلِك. تَرَاجَعْ عَنِ التَّسْجِيلِ الأَحْدَثِ أَوَّلًا.",
    gNotes:"المُلَاحَظَات", noneNotes:"لَا تُوجَدُ مُلَاحَظَاتٌ بَعْدُ.", noteAdd:"+ أَضِفْ مُلَاحَظَة",
    noteEdit:"تَعْدِيلُ المُلَاحَظَة", noteDelete:"هَلْ تَحْذِفُ هَذِهِ المُلَاحَظَة؟",
    noteDeleteBody:"تَبْقَى فِي السِّجِلِّ وَيُمْكِنُ لِلْمُنَسِّقِ إِعَادَتُهَا.",
    noteBy:"بِقَلَمِ", noteEdited:"مُعَدَّلَة",
    nextStu:"الطَّالِبُ التَّالِي", pickStu:"اخْتَرْ طَالِبًا", ofN:"{i} مِنْ {n}",
    allDone:"كَانَ ذَلِكَ الأَخِير",
    dupTitle:"هَذَا مَوْجُودٌ لَدَيْهِمْ بِالفِعْل",
    dupBody:"{n} مِنْ هَؤُلَاءِ الطُّلَّابِ لَدَيْهِمْ مَقْطَعٌ مُتَدَاخِلٌ مَفْتُوحٌ بِالفِعْل. هَلْ تُسْنِدُهُ مَرَّةً أُخْرَى رَغْمَ ذَلِك؟",
    dupAnyway:"أَسْنِدْهُ رَغْمَ ذَلِك"
  };

  var lang = "en";
  try { lang = localStorage.getItem("sijill.lang") || "en"; } catch (e) {}

  function t(key, vars) {
    var s = (lang === "ar" ? AR[key] : EN[key]);
    if (s == null) s = EN[key];
    if (s == null) return key;
    if (vars) Object.keys(vars).forEach(function (k) {
      s = s.split("{" + k + "}").join(vars[k]);
    });
    return s;
  }
  function isAr() { return lang === "ar"; }
  function setLang(l) {
    lang = l;
    try { localStorage.setItem("sijill.lang", l); } catch (e) {}
    document.documentElement.lang = l;
    document.documentElement.dir = (l === "ar") ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach(function (el) {
      el.innerHTML = t(el.dataset.t);
    });
    var b = document.getElementById("lang");
    if (b) b.textContent = (l === "ar") ? "English" : "العربية";
    window.dispatchEvent(new Event("sijill:lang"));
  }

  /* Dates are always shown the way a person reads them, in their language,
     and never as a bare ISO string. */
  function fmtDate(iso, withWeekday) {
    if (!iso) return "—";
    var d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
    var loc = (lang === "ar") ? "ar" : "en-GB";
    var o = { day: "numeric", month: "short", year: "numeric" };
    if (withWeekday) o.weekday = "long";
    try { return d.toLocaleDateString(loc, o); } catch (e) { return iso; }
  }

  window.i18n = { t: t, isAr: isAr, setLang: setLang, get lang() { return lang; }, fmtDate: fmtDate };
})();
