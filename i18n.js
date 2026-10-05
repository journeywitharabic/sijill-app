/* ============================================================================
   Sijill · سِجِلّ — English and Arabic.
   Arabic is Modern Standard with full tashkeel, as Tarek asked.
   Add a key to BOTH lists or the app falls back to English for it.
   ============================================================================ */
(function () {
  "use strict";

  var EN = {
    tajweed:"Tajwīd",
    tajweedAsk:"pick a tajwīd grade",
    adab:"Adab — behaviour",
    adabNotePh:"What happened? (needed for 1)",
    adabClear:"Remove",
    adabHint:"Optional. Most children will not have one — it is for when something is worth telling the family. A 1 needs a line saying what happened.",
    adabNeedNote:"A 1 needs a line saying what happened.",
    baselineSet:"marked solid",
    baselineRev:"moved to review",
    schoolName:"Qur’an School",
    tagline:"Attendance · homework · memorization",
    lastHeld:"the last class that ran",
    aheadNote:"This class has not met yet. You can set homework now — attendance and ✓ heard open on the day itself.",
    gateTitle:"Sign in",
    gateHelp:"Type the school passphrase. You only do this once on this phone — it will remember you.",
    gateGo:"Sign in",
    whoTitle:"Who is teaching?",
    whoHelp:"Pick your name. Everything you record today is signed with it, so a mistake can always be traced back and corrected.",
    whoAdd:"My name is not on the list",
    whoAddTitle:"Add your name",
    whoAddHelp:"You will be able to teach straight away. A coordinator confirms your name afterwards.",
    markAll:"Mark all present", bulkHw:"+ Homework for the class",
    undo:"↶ Undo last change", clsHint:"Tap <b>✓ heard</b> when a child recites everything they had open and there is nothing to add — it records every item as good with <b>tajwīd 5/5</b>. If the tajwīd was not 5/5, tap their <b>name</b> and grade the items one at a time. Both attendance <b>and</b> recitation are needed before the day counts as complete. Everything saves as you tap.",
    coordMode:"Coordinator tools", signOut:"Sign out",
    back:"‹ Back", fullMushaf:"☰ Mushaf",
    present:"present", late:"late", excused:"excused", noreason:"no reason",
    dueback:"due back", heard:"heard", recited:"recited", carries:"homework carries over",
    notMarked:"not marked yet",
    doneAll:"Today is complete", doneAllSub:"All {n} students — attendance and recitation both recorded",
    donePart:"of {n} students not yet complete",
    donePartSub:"Mark attendance <b>and</b> each student's recitation — both are needed",
    gDue:"To hear today", gNew:"New memorization", gRot:"Review — oldest first",
    gToday:"To hear today", gNext:"Homework for next week", gDueGroup:"Review",
    gHearNow:"hear it now", gHearNowTip:"Move this up and hear it in today\u2019s class",
    gNothingToday:"Nothing set before today, so there is nothing to hear yet.",
    gSetToday:"Set today \u2014 goes home tonight",
    ruleNew:"<b>One mistake a page.</b> More than that and it comes back next week.",
    ruleReview:"<b>Up to 3 mistakes</b> is good \u00b7 <b>4\u20135</b> is average \u00b7 <b>6 or more</b> comes back next week.",
    gAverage:"average", gAverageTip:"4 to 5 mistakes \u2014 it counts, but it comes round again sooner",
    spMulti:"Tick as many as you like \u2014 each becomes its own homework.",
    spNarrow:"Narrow it down (optional)",
    spFromAyah:"From ayah", spToAyah:"To ayah",
    spFromPage:"From page", spToPage:"To page", spPage:"p.",
    spBad:"That is not a range inside this surah (1\u2013{n}).",
    spPickOne:"Pick a surah first.",
    spFullName:"Full name", spNameHint:"First name and surname initial, e.g. Bilal N.",
    spFindChild:"Find a child", spUnsent:"Mark this as not sent after all",
    ofAyat:"of {n}", rotShowAll:"Show all {n}", rotCollapse:"Show fewer",
    rotNeeds:"needs attention", rotAvg:"was average",
    nextWeek:"Homework for next week", recentCls:"Recent classes",
    assignNew:"+ Assign new memorization", addReview:"+ Add old memorization to review",
    markKey:"<b>–</b> means the child was present but hadn\u2019t prepared it. Nothing is recorded against the passage.",
    hwHint:"<b>from ↻ repeat</b> means it landed here by itself. <b>set by teacher</b> means you chose it.",
    hwChange:"Change", hwSetThis:"set this week", hwSetWeeks:"set {n} weeks ago",
    hwSetLast:"set last week", hwStillOpen:"still waiting to be heard",
    hwRemoveAsk:"Remove this homework?",
    hwRemoveBody:"It disappears from the family\u2019s page straight away, so only do this if it was set by mistake. If you meant to change it instead, close this and edit the surah or the ayat. A coordinator can put it back from the change log.",
    hwRemoveGo:"Remove it", hwRemoved:"Homework removed",
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
    mtClearBody:"It stops counting as memorized. If the child has forgotten it, mark it review instead — that keeps the history and puts it back in the rotation.",
    mtPagesSolid:"{n} pages solid across the mushaf",
    mtHelp:"Tap a juz to open it. You can mark a whole juz, a hizb, a page or a few ayat — whichever matches what you actually know. Nothing here says the child recited today; it records what they already have.",
    heardAll:"heard", heardAllTip:"Heard everything they had open — memorisation and tajwīd both good (5/5)",
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
    tajweed:"التَّجْوِيد",
    tajweedAsk:"اخْتَرْ دَرَجَةَ التَّجْوِيد",
    adab:"الأَدَب — السُّلُوك",
    adabNotePh:"مَاذَا حَصَل؟ (مَطْلُوبٌ لِـ ١)",
    adabClear:"إِزَالَة",
    adabHint:"اخْتِيَارِيّ. أَكْثَرُ الأَطْفَالِ لَنْ تَكُونَ لَهُمْ عَلَامَةٌ — إِنَّمَا هِيَ لِمَا يَسْتَحِقُّ إِبْلَاغَ الأُسْرَة. وَالدَّرَجَةُ ١ تَحْتَاجُ سَطْرًا يُوَضِّحُ مَا حَصَل.",
    adabNeedNote:"الدَّرَجَةُ ١ تَحْتَاجُ سَطْرًا يُوَضِّحُ مَا حَصَل.",
    baselineSet:"أُثْبِتَ مُتْقَنًا",
    baselineRev:"نُقِلَ لِلْمُرَاجَعَة",
    schoolName:"مَدْرَسَةُ القُرْآنِ",
    tagline:"الحُضُورُ وَالوَاجِبَاتُ وَالحِفْظُ",
    lastHeld:"آخِرُ حَلْقَةٍ انْعَقَدَتْ",
    aheadNote:"لَمْ تَبْدَأْ هَذِهِ الحَلْقَةُ بَعْدُ. يُمْكِنُكَ تَعْيِينُ الوَاجِبَاتِ الآنَ، وَيُفْتَحُ الحُضُورُ يَوْمَ الحَلْقَةِ.",
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
    clsHint:"انْقُرْ <b>سَمِعْتُهُ</b> إِذَا سَمِعْتَ كُلَّ مَا عَلَيْهِ وَلَا شَيْءَ تُضِيفُه — وَيُسَجَّلُ كُلُّ بَنْدٍ جَيِّدًا مَعَ <b>تَجْوِيد ٥/٥</b>. وَإِنْ لَمْ يَكُنِ التَّجْوِيدُ ٥/٥ فَانْقُرْ <b>اسْمَه</b> وَقَيِّمْ البُنُودَ وَاحِدًا وَاحِدًا. وَيَلْزَمُ الحُضُورُ <b>وَ</b> التِّلَاوَةُ لِيُعَدَّ اليَوْمُ كَامِلًا. وَكُلُّ شَيْءٍ يُحْفَظُ فَوْرًا.",
    coordMode:"أَدَوَاتُ المُنَسِّق", signOut:"تَسْجِيلُ الخُرُوج",
    back:"‹ رُجُوع", fullMushaf:"☰ المُصْحَف",
    present:"حَاضِر", late:"مُتَأَخِّر", excused:"بِعُذْر", noreason:"بِدُونِ عُذْر",
    dueback:"لِلْإِعَادَة", heard:"سُمِعَتْ", recited:"سُجِّلَ", carries:"الوَاجِبُ مُسْتَمِرّ",
    notMarked:"لَمْ يُسَجَّلْ بَعْد",
    doneAll:"اكْتَمَلَ اليَوْم", doneAllSub:"جَمِيعُ الـ{n} طُلَّاب: الحُضُورُ وَالتِّلَاوَةُ مُسَجَّلَان",
    donePart:"مِنْ {n} لَمْ تَكْتَمِلْ بَيَانَاتُهُمْ",
    donePartSub:"سَجِّلِ الحُضُورَ <b>وَ</b> تِلَاوَةَ كُلِّ طَالِبٍ — كِلَاهُمَا مَطْلُوب",
    gDue:"لِلسَّمَاعِ اليَوْم", gNew:"الحِفْظُ الجَدِيد", gRot:"المُرَاجَعَة — الأَقْدَمُ أَوَّلًا",
    gToday:"لِلسَّمَاعِ اليَوْم", gNext:"وَاجِبُ الأُسْبُوعِ القَادِم", gDueGroup:"لِلْمُرَاجَعَة",
    gHearNow:"اِسْمَعْهُ الآنَ", gHearNowTip:"اِنْقُلْهُ إِلَى الأَعْلَى وَاسْمَعْهُ فِي حِصَّةِ اليَوْم",
    gNothingToday:"لَمْ يُحَدَّدْ شَيْءٌ قَبْلَ اليَوْم، فَلَا شَيْءَ لِسَمَاعِهِ بَعْد.",
    gSetToday:"حُدِّدَ اليَوْمَ — يَذْهَبُ إِلَى البَيْتِ اللَّيْلَة",
    ruleNew:"<b>خَطَأٌ وَاحِدٌ فِي الصَّفْحَة.</b> وَمَا زَادَ عَلَى ذَلِكَ يُعَادُ الأُسْبُوعَ القَادِم.",
    ruleReview:"<b>حَتَّى ثَلَاثَةِ أَخْطَاء</b> جَيِّد · <b>٤–٥</b> مُتَوَسِّط · <b>٦ فَأَكْثَر</b> يُعَادُ الأُسْبُوعَ القَادِم.",
    gAverage:"مُتَوَسِّط", gAverageTip:"مِنْ أَرْبَعَةِ إِلَى خَمْسَةِ أَخْطَاء — يُحْتَسَب، لَكِنَّهُ يَعُودُ أَسْرَع",
    spMulti:"اِخْتَرْ مَا شِئْتَ — كُلُّ سُورَةٍ تُصْبِحُ وَاجِبًا مُسْتَقِلًّا.",
    spNarrow:"تَحْدِيدُ مَقْطَع (اِخْتِيَارِيّ)",
    spFromAyah:"مِنْ آيَة", spToAyah:"إِلَى آيَة",
    spFromPage:"مِنْ صَفْحَة", spToPage:"إِلَى صَفْحَة", spPage:"ص.",
    spBad:"هَذَا لَيْسَ مَقْطَعًا دَاخِلَ هَذِهِ السُّورَة (١–{n}).",
    spPickOne:"اِخْتَرْ سُورَةً أَوَّلًا.",
    spFullName:"الاِسْمُ الكَامِل", spNameHint:"الاِسْمُ الأَوَّلُ وَالحَرْفُ الأَوَّلُ مِنَ العَائِلَة، مِثْل: بِلَال ن.",
    spFindChild:"اِبْحَثْ عَنْ طِفْل", spUnsent:"اِعْتَبِرْهُ غَيْرَ مُرْسَل",
    ofAyat:"مِنْ {n}", rotShowAll:"أَظْهِرِ الكُلَّ ({n})", rotCollapse:"أَظْهِرْ أَقَلَّ",
    rotNeeds:"يَحْتَاجُ انْتِبَاهًا", rotAvg:"كَانَ مُتَوَسِّطًا",
    nextWeek:"وَاجِبُ الأُسْبُوعِ القَادِم", recentCls:"الحِصَصُ الأَخِيرَة",
    assignNew:"+ إِسْنَادُ حِفْظٍ جَدِيد", addReview:"+ إِضَافَةُ حِفْظٍ قَدِيمٍ لِلْمُرَاجَعَة",
    markKey:"<b>–</b> تَعْنِي أَنَّ الطَّالِبَ كَانَ حَاضِرًا لَكِنَّهُ لَمْ يُحَضِّرْ. وَلَا يُسَجَّلُ شَيْءٌ عَلَى المَقْطَع.",
    hwHint:"<b>مِنْ ↻ إِعَادَة</b> يَعْنِي أَنَّهُ أُضِيفَ تِلْقَائِيًّا. <b>أَضَافَهُ المُعَلِّم</b> يَعْنِي أَنَّكَ اخْتَرْتَه.",
    hwChange:"تَعْدِيل", hwSetThis:"حُدِّدَ هَذَا الأُسْبُوع", hwSetWeeks:"حُدِّدَ قَبْلَ {n} أَسَابِيع",
    hwSetLast:"حُدِّدَ الأُسْبُوعَ المَاضِي", hwStillOpen:"لَا يَزَالُ يَنْتَظِرُ السَّمَاع",
    hwRemoveAsk:"حَذْفُ هَذَا الوَاجِب؟",
    hwRemoveBody:"سَيَخْتَفِي مِنْ صَفْحَةِ الأُسْرَةِ فَوْرًا، فَلَا تَحْذِفْهُ إِلَّا إِذَا كَانَ قَدْ أُسْنِدَ خَطَأً. وَإِنْ كُنْتَ تُرِيدُ تَعْدِيلَهُ فَأَغْلِقْ هَذِهِ النَّافِذَةَ وَعَدِّلِ السُّورَةَ أَوِ الآيَات. وَيَسْتَطِيعُ المُنَسِّقُ إِرْجَاعَهُ مِنْ سِجِلِّ التَّغْيِيرَات.",
    hwRemoveGo:"اِحْذِفْهُ", hwRemoved:"حُذِفَ الوَاجِب",
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
    heardAll:"سَمِعْتُهُ", heardAllTip:"سَمِعْتُ كُلَّ مَا كَانَ عَلَيْهِ — الحِفْظُ وَالتَّجْوِيدُ جَيِّدَان (٥/٥)",
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
