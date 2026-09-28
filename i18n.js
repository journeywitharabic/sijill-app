/* ============================================================================
   Sijill · سِجِلّ — English and Arabic.
   Arabic is Modern Standard with full tashkeel, as Tarek asked.
   Add a key to BOTH lists or the app falls back to English for it.
   ============================================================================ */
(function () {
  "use strict";

  var EN = {
    gateTitle:"Sign in",
    gateHelp:"Type the madrasah passphrase. You only do this once on this phone — it will remember you.",
    gateGo:"Sign in",
    whoTitle:"Who is teaching?",
    whoHelp:"Pick your name. Everything you record today is signed with it, so a mistake can always be traced back and corrected.",
    whoAdd:"My name is not on the list",
    whoAddTitle:"Add your name",
    whoAddHelp:"You will be able to teach straight away. A coordinator confirms your name afterwards.",
    markAll:"Mark all present", bulkHw:"+ Homework for the whole class",
    undo:"↶ Undo last change", clsHint:"Tap a name to record recitation. Everything saves as you tap.",
    coordMode:"Coordinator tools", signOut:"Sign out",
    back:"‹ Back to class", fullMushaf:"☰ Full mushaf",
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
    weeks:"weeks ago", never:"not yet heard", thisTerm:"this term"
  };

  var AR = {
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
    clsHint:"اُنْقُرْ عَلَى الاِسْمِ لِتَسْجِيلِ التِّلَاوَة. كُلُّ شَيْءٍ يُحْفَظُ تِلْقَائِيًّا.",
    coordMode:"أَدَوَاتُ المُنَسِّق", signOut:"تَسْجِيلُ الخُرُوج",
    back:"‹ العَوْدَةُ إِلَى الحَلْقَة", fullMushaf:"☰ المُصْحَفُ كَامِلًا",
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
    weeks:"أَسَابِيعَ مَضَتْ", never:"لَمْ يُسْمَعْ بَعْد", thisTerm:"هَذَا الفَصْل"
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
