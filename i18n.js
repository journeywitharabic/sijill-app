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
    aheadNote:"This class has not met yet. You can set homework now — attendance and grading open on the day itself.",
    gateTitle:"Sign in",
    gateHelp:"Type the school passphrase. You only do this once on this phone — it will remember you.",
    gateGo:"Sign in",
    whoTitle:"Who is teaching?",
    whoHelp:"Pick your name. Everything you record today is signed with it, so a mistake can always be traced back and corrected.",
    whoAdd:"My name is not on the list",
    whoAddTitle:"Add your name",
    whoAddHelp:"You will be able to teach straight away. A coordinator confirms your name afterwards.",
    markAll:"Mark all present", bulkHw:"+ Homework for the class",
    /* The class-wide assign. It used to be a cut-down picker of its own —
       a radio list, no page numbers, no running total — which is how it
       came to be missing the multi-select that the student page had. It now
       opens the SAME picker, so the kind is asked first instead of hiding
       in a dropdown inside it. */
    bulkKind:"What kind of homework?",
    bulkKindNew:"New memorization", bulkKindRev:"Review",
    bulkTitleNew:"New memorization for the whole class",
    bulkTitleRev:"Review for the whole class",
    bulkWho:"the whole class",
    bulkNote:"A separate homework item is created for each student, so you can still change any one of them afterwards. Absent students are included \u2014 they keep the same homework.",

    /* The toast's own button. It used to be `undo` with the "\u21b6 " sliced
       off in code, which read as "Undo last change" on a 7-second toast where
       "Undo" is the whole of what is meant — and would have silently stopped
       working the day either language's `undo` lost its arrow. */
    undo:"\u21b6 Undo last change", undoShort:"Undo", clsHint:"Tap a child's <b>name</b> to hear them and grade each passage. Both attendance <b>and</b> recitation are needed before the day counts as complete. Everything saves as you tap.",
    coordMode:"Coordinator tools", signOut:"Sign out",
    back:"‹ Back", fullMushaf:"☰ Mushaf",
    present:"present", late:"late", excused:"excused", noreason:"no reason",
    dueback:"due back", heard:"heard", recited:"recited", carries:"homework carries over",
    notMarked:"not marked yet",
    doneAll:"Today is complete", doneAllSub:"All {n} students — attendance and recitation both recorded",
    donePart:"of {n} students not yet complete",
    donePartSub:"Mark attendance <b>and</b> each student's recitation — both are needed",
    gDue:"To hear today", gNew:"New memorization", gRot:"Review — oldest first",
    /* The two homework sections. Neither heading names the class the work
       came from: the items in the first can come from several different
       classes, and the commonest reason one is sitting there is that nobody
       got to hear the child, sometimes for weeks. "Due for grading" is true
       however old it is. The second heading names a real day and date,
       because "next week" is wrong at a school that meets Friday AND
       Sunday — the next class is usually two or five days away. */
    /* The class note — the one thing in Sijill that one teacher writes and
       every family in the class reads. The warning is part of the label,
       not a tooltip, because a tooltip does not exist on a phone and this
       is the only place where getting it wrong reaches thirty-five homes. */
    cnTitle:"What the class did today",
    cnHint:"Every parent in this class sees this. Write about the class, never about a child by name.",
    cnPlaceholder:"e.g. We revised Surat Al-Mulk together and went through the rules of madd.",
    cnSave:"Save note", cnClear:"Remove note", cnSaved:"Saved",
    cnBy:"written by {t}", cnEmpty:"No note for this class yet.",
    cnTooLong:"That is {n} characters — the limit is 600.",
    cnClearAsk:"Remove this class note?",
    cnClearBody:"The families in this class will stop seeing it. You can write a new one at any time.",
    gDueGrade:"Previous homework due for grading",
    /* ---- round 31 ---- */
    /* The empty next-class box used to say only "nothing set yet", which on a
       child holding three unheard items reads as "this child has nothing to
       do" — and that is what sent teachers checking one by one. */
    gNothingNextBut:"Nothing new set for {d} — but {n} still to be heard, above.",
    gNothingNextBut1:"Nothing new set for {d} — but 1 still to be heard, above.",
    gDueOn:"due {d}", gDueLabel:"Due back",
    gDueChange:"change",
    /* The proposal, and the nudge when a teacher overrides it downwards. Not
       a block: a tool that refuses a teacher is a tool teachers route around. */
    dueTitle:"When is it due back?",
    dueSoonTitle:"That is only {n} days",
    dueSoonBody:"New memorization due {d} gives the child {n} days. Most need the week — Friday to Sunday is about thirty-six hours. You can set it anyway.",
    dueSoonKeep:"Set it for {d} anyway", dueSoonUse:"Use {d} instead",
    /* The register's three counts. The third one named a child's whole
       workload; it only ever meant the next class. */
    gapNext:"{n} have nothing for {d}", gapNext1:"1 has nothing for {d}",
    gapNextNone:"{n} have nothing set", gapNextNone1:"1 has nothing set",
    gapTapHint:"Tap a line to see who",
    gapAll:"Show everyone",
    gapNoneLeft:"Nobody left in that list \u2014 it is done.",
    gapOnly:"Showing {n} of {t}",
    hwOpenMark:"{n} still open",
    /* Already-set work, shown in the picker instead of in a dialog afterwards. */
    spHas:"already set: {w}",
    spHasShort:"already set",
    /* Notices */
    ntTitle:"Notice for families", ntSchool:"Whole school", ntClass:"This class only",
    ntBody:"What you want families to see", ntUntil:"Show until",
    ntSave:"Post it", ntRemove:"Take it down", ntRemoveQ:"Take this notice down?",
    ntNone:"No notices up at the moment.",
    ntAdd:"Write a notice", ntLive:"showing", ntLapsed:"finished",
    ntUntilShort:"until {d}", ntBy:"posted by {w}",
    ntSchoolOnly:"Only a coordinator can post to the whole school.",
    ntPosted:"Notice posted", ntTookDown:"Notice taken down",
    ntHeading:"From the school", ntHeadingClass:"From the class",
    /* What the family sees */
    pvOpen:"See what the family sees", pvTitle:"The family's page",
    pvNote:"This is exactly what {w}'s family sees on their own link. Nothing here can be changed, and their link is not shown.",
    /* The change log's filter bar. These were English literals when the bar
       was built, which is a regression in an app a teacher can read in
       Arabic — and the release-notes check caught it before a teacher did. */
    lgFrom:"From", lgTo:"To", lgTeacher:"Teacher", lgKind:"Kind", lgSearch:"Search",
    lgAnyone:"anyone", lgAnything:"anything",
    lgSearchHint:"a child\u2019s name, a surah\u2026",
    lgGo:"Search", lgClear:"Clear", lgNewer:"\u2039 Newer", lgOlder:"Older \u203a",
    lgShowing:"Showing {a}\u2013{b} of {n}", lgNoMatch:"Nothing matches those filters.",
    /* The register and the class picker count different things and are both
       right; the difference needed saying out loud. */
    joinedLater:"{n} children joined after this class \u2014 they appear from {d}.",
    joinedLater1:"{w} joined after this class \u2014 they appear from {d}.",
    joinedSoon:"{n} children joined after this class — they appear once another class is on the calendar.",
    joinedSoon1:"{w} joined after this class — they appear once another class is on the calendar.",
    gNotesSeen:"The family reads these on their own page, each with the teacher's name and the day it was written.",
    nsFrom:"First day in this class",
    nsFromHint:"A register only lists children who were enrolled on that day, so pick the day they actually started \u2014 not today, unless today is their first.",
    gNextClass:"Homework for the next class",
    gNoNextClass:"no class scheduled yet",
    gNothingDue:"Nothing waiting to be graded.",
    gNothingNext:"Nothing set yet for {d}.",
    gSetOn:"set {d}",
    gDueGroup:"Review",
    gHearNow:"hear it now", gHearNowTip:"Move this up and hear it in today\u2019s class",
    ruleNew:"<b>One mistake a page.</b> More than that and it comes back next week.",
    ruleReview:"<b>Up to 3 mistakes</b> is good \u00b7 <b>4\u20135</b> is average \u00b7 <b>6 or more</b> comes back next week.",
    gAverage:"average", gAverageTip:"4 to 5 mistakes \u2014 it counts, but it comes round again sooner",
    spMulti:"Tick as many as you like \u2014 each becomes its own homework.",
    spNarrow:"Narrow it down (optional)",
    spFromAyah:"From ayah", spToAyah:"To ayah",
    spFromPage:"From page", spToPage:"To page", spPage:"p.",
    spPageFail:"Page numbers could not be loaded, so pick by ayah instead.",
    spPageFailWhy:"The server did not answer \u2014 tell Tarek.",
    spBad:"That is not a range inside this surah (1\u2013{n}).",
    spPickOne:"Pick a surah first.",
    spFullName:"Full name", spNameHint:"First name and surname initial, e.g. Bilal N.",
    spFindChild:"Find a child", spUnsent:"Mark this as not sent after all",
    ofAyat:"of {n}", rotShowAll:"Show all {n}", rotCollapse:"Show fewer",
    rotNeeds:"needs attention", rotAvg:"was average",
    nextWeek:"Homework for next week", recentCls:"Recent classes",
    /* The two buttons teachers were mixing up. They were identical ghost
       buttons whose distinguishing word arrived third, so a glance saw the
       same thing twice. Fixed without colour, deliberately: green and amber
       are GRADES here, and borrowing them for a pair of buttons that grade
       nothing would have made them read as a pass and a fail.

       What distinguishes them instead: the word that differs comes first,
       the "+" belongs to only one of them so it means something, ↻ is the
       app's existing mark for "comes round again", and each carries a line
       saying what it is for. */
    assignNew:"New memorization", addReview:"Review \u2014 old memorization",
    assignNewSub:"assign a new portion of Qur\u2019an to memorize",
    addReviewSub:"review a surah that was learned before",
    hwAdded:"{k} added", hwUndone:"Undone",
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
    tabGaps:"To chase",
    dowFriday:"Fridays", dowSunday:"Sundays",
    dShort_friday:"Fri", dShort_sunday:"Sun",
    dayEarlier:"Earlier\u2026",
    histMore:"Show earlier classes",
    calMonth:"The month",
    calPrev:"Previous month", calNext:"Next month", calToday:"This month",
    calPick:"Tap a day to see what it held.",
    calChanges:"Changes that day",
    calOpenReg:"Open register",
    calChase:"Still to log",
    calChaseNone:"Every class day that has run is fully logged.",
    calCounts:"{a} of {n} marked \u00b7 {r} heard",
    calClose:"Closing a day",
    loadFailed:"That did not load.", retry:"Try again",
    shNoClass:"No classes yet.",
    shHow:"One page per child.", shHowBody:"Pick a class and press Print \u2014 the app around this is left off the page, and each child starts a new sheet.",
    shPrint:"Print", shCount:"{n} children",
    shTrend:"How it is going", shWhere:"Where they are",
    shJuz:"Juz {j}", shPages:"{s} of {n} pages solid", shPartial:"{n} partly",
    shNotAssessed:"this year\u2019s review not done yet",
    shSolid:"Surahs solid", shAttendance:"Attendance",
    shAttDetail:"{p} present \u00b7 {l} late \u00b7 {e} excused \u00b7 {u} no reason, of {n} classes taken",
    shUnmarked:"{n} never marked", shNoClasses:"no classes yet",
    shNoneMarked:"the register was not taken on any of their {n} classes",
    shSet:"Set now", shWhole:"whole surah", shNothingSet:"nothing set",
    shReview:"Needs review", shNotes:"Notes to the family",
    shFooter:"Qur\u2019an School \u00b7 \u0645\u064e\u062f\u0652\u0631\u064e\u0633\u064e\u0629\u064f \u0627\u0644\u0642\u064f\u0631\u0652\u0622\u0646\u0650 \u00b7 Assalam Mosque, Ottawa",
    excSome:"Excuse a few\u2026",
    excTitle:"Excuse these children",
    excBody:"{c} on {d}. Tick who was away with a reason \u2014 the rest of the register is untouched.",
    excReasonLab:"Reason", excWhy:"Why \u2014 funeral, family travel\u2026",
    excUnmarked:"not marked",
    excOverwrite:"This replaces whatever is already marked for the children you tick, and nobody else. Each one is logged and can be undone from the change log.",
    excSave:"Mark them excused", excDone:"{n} marked excused",
    excNobody:"Nobody was enrolled in that class on that day.",
    rotAssign:"+ set as homework", rotHasHw:"already set",
    rotAssignTitle:"Set as review homework",
    rotAssignBody:"{w} \u2014 the whole surah, to review at home.",
    rotAssigned:"Set as review homework",
    rotNoDay:"No class day to be due on yet. It will be set anyway and the next class that runs will claim it.",
    st_s_complete:"everything logged", st_s_partial:"partly logged",
    st_s_empty:"nothing logged yet", st_s_closed:"class closed",
    st_s_ahead:"has not happened yet",
    backTitle:"You are looking at {d}.",
    backBody:"Anything you record goes against that class, not today\u2019s. Tap the newest day in the strip above to come back.",
    backClosed:"That class was closed. A coordinator can reopen it from Manage \u2192 Calendar.",
    lateMark:"filled in later",
    /* The three gaps, named as the question a coordinator is actually
       asking. Counts on the register, names on the coordinator's list. */
    gapAtt:"{n} still need attendance",
    gapMark:"{n} still need their homework marked",
    gapAtt1:"1 still needs attendance",
    gapMark1:"1 still needs their homework marked",
    gapNone:"Nothing outstanding \u2014 every class is up to date.",
    /* A class joins the list once it has FINISHED, which is not the same
       as the day being over — see class_day_finished. The times come from
       the server so this line cannot drift from the real setting. */
    gapCutoff:"A class appears here once it has finished \u2014 {t}. One still in progress is not listed; teachers see those on their own register.",
    gapCutoffOne:"{d} after {h}",
    gapWindow:"The last {n} class days of each class.",
    gapTouched:"last worked on by {t}", gapUntouched:"nobody has opened this day",
    gapCopy:"Copy for WhatsApp", gapCopied:"Copied",
    gapOpen:"Open this class day",
    gapRoll:"{n} on the roll",
    /* A day nobody opened would otherwise print the same names twice —
       once as "need attendance" and once as "no homework for next week" —
       which is two lines saying one thing. */
    gapNotStarted:"Nobody has opened this day yet \u2014 all {n} children",

    student:"Student", classW:"Class", attendance:"Attendance", flags:"Needs attention",
    lastHeard:"Last heard", pages:"Pages", none:"—",
    weeks:"weeks ago", never:"not yet heard", thisTerm:"this term",

    /* --- one tap from the class list, and the labels under the marks --- */
    /* "absent", not "away". The Arabic has always said غَائِب — absent —
       so the two languages were naming the same button differently, and
       "away" reads as a softer, vaguer thing than the register records. */
    mHere:"present", mLate:"late", mAway:"absent",
    gGood:"good", gAgain:"again", gNotReady:"not ready",
    /* One tooltip per kind, because round 23 made the rules different. The
       tooltip must never say something the rule printed above the section
       contradicts — a teacher trusts whichever one is under their thumb. */
    gGoodTipNew:"Recited to standard — one mistake a page or fewer",
    gGoodTipRev:"Recited to standard — up to three mistakes",
    gAgainTipNew:"More than one mistake a page. It comes back next week by itself.",
    gAgainTipRev:"Six mistakes or more. It comes back next week by itself.",
    gNotReadyTip:"Here, but had not worked on it. A conversation with the family, not a teaching problem.",
    week1:"week ago",
    mtSolid:"solid", mtReview:"review", mtClear:"clear",
    /* The audit judges a page, not a recitation, so it has no mistake count
       to quote. It used to borrow the grading tooltips and talk about
       mistakes a page, which is not the question being asked here. */
    mtSolidTip:"Memorised and holding — no need to come back to it soon",
    mtReviewTip:"Memorised once but slipping. It joins the review rotation.",
    findSurah:"Find a surah — name or number",
    trend:"Trend",
    tr_up:"moving forward", tr_flat:"standing still",
    tr_down:"going backwards", tr_away:"not enough to say",
    mtClearTip:"Remove this from the child's record — use it to correct a mistake, not to mark forgetting",
    mtClearAsk:"Clear this from the record?",
    mtClearBody:"It stops counting as memorized. If the child has forgotten it, mark it review instead — that keeps the history and puts it back in the rotation.",
    mtPagesSolid:"{n} pages solid across the mushaf",
    mtHelp:"Tap a juz to open it. You can mark a whole juz, a hizb, a page or a few ayat — whichever matches what you actually know. Nothing here says the child recited today; it records what they already have.",
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
    aheadNote:"لَمْ تَبْدَأْ هَذِهِ الحَلْقَةُ بَعْدُ. يُمْكِنُكَ تَعْيِينُ الوَاجِبِ الآن — وَيُفْتَحُ الحُضُورُ وَالتَّقْيِيمُ فِي يَوْمِ الحِصَّةِ نَفْسِه.",
    gateTitle:"تَسْجِيلُ الدُّخُول",
    gateHelp:"اُكْتُبْ كَلِمَةَ مُرُورِ المَدْرَسَة. تَفْعَلُ ذَلِكَ مَرَّةً وَاحِدَةً عَلَى هَذَا الهَاتِفِ فَقَط.",
    gateGo:"دُخُول",
    whoTitle:"مَنْ يُدَرِّسُ اليَوْم؟",
    whoHelp:"اخْتَرِ اسْمَكَ. كُلُّ مَا تُسَجِّلُهُ اليَوْمَ يُنْسَبُ إِلَيْك، فَيُمْكِنُ تَتَبُّعُ أَيِّ خَطَإٍ وَتَصْحِيحُه.",
    whoAdd:"اسْمِي لَيْسَ فِي القَائِمَة",
    whoAddTitle:"أَضِفِ اسْمَك",
    whoAddHelp:"يُمْكِنُكَ التَّدْرِيسُ فَوْرًا. يُؤَكِّدُ المُنَسِّقُ اسْمَكَ لَاحِقًا.",
    markAll:"تَسْجِيلُ الجَمِيعِ حَاضِرِين", bulkHw:"+ وَاجِبٌ لِلْحَلْقَةِ كُلِّهَا",
    bulkKind:"مَا نَوْعُ الوَاجِب؟",
    bulkKindNew:"حِفْظٌ جَدِيد", bulkKindRev:"مُرَاجَعَة",
    bulkTitleNew:"حِفْظٌ جَدِيدٌ لِلْحَلْقَةِ كُلِّهَا",
    bulkTitleRev:"مُرَاجَعَةٌ لِلْحَلْقَةِ كُلِّهَا",
    bulkWho:"الحَلْقَةُ كُلُّهَا",
    bulkNote:"يُنْشَأُ وَاجِبٌ مُنْفَصِلٌ لِكُلِّ طَالِب، فَيُمْكِنُ تَعْدِيلُ أَيِّ وَاحِدٍ لَاحِقًا. وَالغَائِبُونَ مَشْمُولُون — لَهُمُ الوَاجِبُ نَفْسُه.",

    undo:"↶ تَرَاجُعٌ عَنْ آخِرِ تَغْيِير", undoShort:"تَرَاجُع",
    clsHint:"انْقُرْ <b>اسْمَ</b> الطَّالِبِ لِتَسْمَعَهُ وَتُقَيِّمَ كُلَّ مَقْطَع. وَيَلْزَمُ الحُضُورُ <b>وَ</b> التِّلَاوَةُ لِيُعَدَّ اليَوْمُ كَامِلًا. وَكُلُّ شَيْءٍ يُحْفَظُ فَوْرًا.",
    coordMode:"أَدَوَاتُ المُنَسِّق", signOut:"تَسْجِيلُ الخُرُوج",
    back:"› رُجُوع", fullMushaf:"☰ المُصْحَف",
    present:"حَاضِر", late:"مُتَأَخِّر", excused:"بِعُذْر", noreason:"بِدُونِ عُذْر",
    dueback:"لِلْإِعَادَة", heard:"سُمِعَتْ", recited:"سُجِّلَ", carries:"الوَاجِبُ مُسْتَمِرّ",
    notMarked:"لَمْ يُسَجَّلْ بَعْد",
    doneAll:"اكْتَمَلَ اليَوْم", doneAllSub:"جَمِيعُ الـ{n} طُلَّاب: الحُضُورُ وَالتِّلَاوَةُ مُسَجَّلَان",
    donePart:"مِنْ {n} لَمْ تَكْتَمِلْ بَيَانَاتُهُمْ",
    donePartSub:"سَجِّلِ الحُضُورَ <b>وَ</b> تِلَاوَةَ كُلِّ طَالِبٍ — كِلَاهُمَا مَطْلُوب",
    gDue:"لِلسَّمَاعِ اليَوْم", gNew:"الحِفْظُ الجَدِيد", gRot:"المُرَاجَعَة — الأَقْدَمُ أَوَّلًا",
    cnTitle:"مَا قَامَتْ بِهِ الحَلْقَةُ اليَوْم",
    cnHint:"يَرَى هَذَا كُلُّ وَلِيِّ أَمْرٍ فِي الحَلْقَة. اُكْتُبْ عَنِ الحَلْقَة، وَلَا تَذْكُرِ اسْمَ طَالِبٍ أَبَدًا.",
    cnPlaceholder:"مِثَال: رَاجَعْنَا سُورَةَ المُلْكِ مَعًا وَمَرَرْنَا عَلَى أَحْكَامِ المَدّ.",
    cnSave:"حِفْظُ المُلَاحَظَة", cnClear:"إِزَالَةُ المُلَاحَظَة", cnSaved:"حُفِظَتْ",
    cnBy:"كَتَبَهَا {t}", cnEmpty:"لَا مُلَاحَظَةَ لِهَذِهِ الحَلْقَةِ بَعْد.",
    cnTooLong:"هَذَا {n} حَرْفًا — وَالحَدُّ سِتُّمِائَة.",
    cnClearAsk:"هَلْ تُزِيلُ مُلَاحَظَةَ الحَلْقَة؟",
    cnClearBody:"سَيَتَوَقَّفُ أَوْلِيَاءُ الأُمُورِ فِي هَذِهِ الحَلْقَةِ عَنْ رُؤْيَتِهَا. وَيُمْكِنُكَ كِتَابَةُ وَاحِدَةٍ جَدِيدَةٍ مَتَى شِئْت.",
    gDueGrade:"وَاجِبٌ سَابِقٌ مُسْتَحَقٌّ لِلتَّقْيِيم",
    /* ---- الإِصْدَار ٣١ ---- */
    gNothingNextBut:"لَمْ يُحَدَّدْ جَدِيدٌ لِـ{d} — غَيْرَ أَنَّ {n} مَا زَالَتْ تَنْتَظِرُ السَّمَاعَ أَعْلَاه.",
    gNothingNextBut1:"لَمْ يُحَدَّدْ جَدِيدٌ لِـ{d} — غَيْرَ أَنَّ وَاحِدًا مَا زَالَ يَنْتَظِرُ السَّمَاعَ أَعْلَاه.",
    gDueOn:"مَوْعِدُه {d}", gDueLabel:"مَوْعِدُ التَّسْمِيع",
    gDueChange:"تَغْيِير",
    dueTitle:"مَتَى مَوْعِدُ تَسْمِيعِه؟",
    dueSoonTitle:"هَذَا {n} أَيَّامٍ فَقَط",
    dueSoonBody:"حِفْظٌ جَدِيدٌ مَوْعِدُهُ {d} يُعْطِي الطِّفْلَ {n} أَيَّام. وَأَكْثَرُهُمْ يَحْتَاجُ الأُسْبُوع — فَمَا بَيْنَ الجُمُعَةِ وَالأَحَدِ نَحْوُ سِتٍّ وَثَلَاثِينَ سَاعَة. وَلَكَ أَنْ تُثَبِّتَهُ عَلَى كُلِّ حَال.",
    dueSoonKeep:"ثَبِّتْهُ عَلَى {d} رَغْمَ ذَلِك", dueSoonUse:"اِسْتَعْمِلْ {d} بَدَلًا مِنْه",
    gapNext:"{n} بِلَا وَاجِبٍ لِـ{d}", gapNext1:"طَالِبٌ وَاحِدٌ بِلَا وَاجِبٍ لِـ{d}",
    gapNextNone:"{n} بِلَا وَاجِبٍ مُحَدَّد", gapNextNone1:"طَالِبٌ وَاحِدٌ بِلَا وَاجِبٍ مُحَدَّد",
    gapTapHint:"اِضْغَطْ عَلَى السَّطْرِ لِتَرَى مَنْ هُم",
    gapAll:"اِعْرِضِ الجَمِيع",
    gapNoneLeft:"لَمْ يَبْقَ أَحَدٌ فِي تِلْكَ القَائِمَة — تَمَّ الأَمْر.",
    gapOnly:"عَرْضُ {n} مِنْ {t}",
    hwOpenMark:"{n} مَا زَالَتْ مَفْتُوحَة",
    spHas:"مُحَدَّدٌ سَلَفًا: {w}",
    spHasShort:"مُحَدَّدٌ سَلَفًا",
    ntTitle:"إِعْلَانٌ لِلْأَهَالِي", ntSchool:"المَدْرَسَةُ كُلُّهَا", ntClass:"هَذِهِ الحَلْقَةُ فَقَط",
    ntBody:"مَا تُرِيدُ أَنْ يَرَاهُ الأَهَالِي", ntUntil:"يُعْرَضُ حَتَّى",
    ntSave:"اِنْشُرْه", ntRemove:"أَنْزِلْه", ntRemoveQ:"هَلْ تُنْزِلُ هَذَا الإِعْلَان؟",
    ntNone:"لَا إِعْلَانَاتٍ مَعْرُوضَةً الآن.",
    ntAdd:"اُكْتُبْ إِعْلَانًا", ntLive:"مَعْرُوض", ntLapsed:"اِنْتَهَى",
    ntUntilShort:"حَتَّى {d}", ntBy:"نَشَرَهُ {w}",
    ntSchoolOnly:"لَا يَنْشُرُ لِلْمَدْرَسَةِ كُلِّهَا إِلَّا المُنَسِّق.",
    ntPosted:"نُشِرَ الإِعْلَان", ntTookDown:"أُنْزِلَ الإِعْلَان",
    ntHeading:"مِنَ المَدْرَسَة", ntHeadingClass:"مِنَ الحَلْقَة",
    pvOpen:"اُنْظُرْ مَا يَرَاهُ الأَهْل", pvTitle:"صَفْحَةُ الأَهْل",
    pvNote:"هَذَا بِعَيْنِهِ مَا يَرَاهُ أَهْلُ {w} فِي رَابِطِهِمْ. لَا يُمْكِنُ تَغْيِيرُ شَيْءٍ هُنَا، وَلَا يُعْرَضُ رَابِطُهُم.",
    lgFrom:"مِنْ", lgTo:"إِلَى", lgTeacher:"المُعَلِّم", lgKind:"النَّوْع", lgSearch:"بَحْث",
    lgAnyone:"أَيُّ أَحَد", lgAnything:"أَيُّ نَوْع",
    lgSearchHint:"اِسْمُ طَالِبٍ أَوْ سُورَة\u2026",
    lgGo:"اِبْحَثْ", lgClear:"مَسْح", lgNewer:"\u2039 الأَحْدَث", lgOlder:"الأَقْدَم \u203a",
    lgShowing:"عَرْضُ {a}–{b} مِنْ {n}", lgNoMatch:"لَا شَيْءَ يُطَابِقُ هَذِهِ المُرَشِّحَات.",
    joinedLater:"{n} طُلَّابٍ الْتَحَقُوا بَعْدَ هَذِهِ الحِصَّة — وَيَظْهَرُونَ مِنَ {d}.",
    joinedLater1:"{w} الْتَحَقَ بَعْدَ هَذِهِ الحِصَّة — وَيَظْهَرُ مِنَ {d}.",
    joinedSoon:"{n} طُلَّابٍ الْتَحَقُوا بَعْدَ هَذِهِ الحِصَّة — وَيَظْهَرُونَ عِنْدَ إِضَافَةِ حِصَّةٍ أُخْرَى إِلَى التَّقْوِيم.",
    joinedSoon1:"{w} الْتَحَقَ بَعْدَ هَذِهِ الحِصَّة — وَيَظْهَرُ عِنْدَ إِضَافَةِ حِصَّةٍ أُخْرَى إِلَى التَّقْوِيم.",
    gNotesSeen:"يَقْرَأُ الأَهْلُ هَذِهِ المُلَاحَظَاتِ فِي صَفْحَتِهِمْ، وَعَلَى كُلٍّ مِنْهَا اسْمُ المُعَلِّمِ وَيَوْمُ كِتَابَتِهَا.",
    nsFrom:"أَوَّلُ يَوْمٍ فِي هَذِهِ الحَلْقَة",
    nsFromHint:"الكَشْفُ لَا يَعْرِضُ إِلَّا مَنْ كَانَ مُسَجَّلًا فِي ذَلِكَ اليَوْم، فَاخْتَرِ اليَوْمَ الَّذِي بَدَأَ فِيهِ فِعْلًا — لَا اليَوْمَ الحَالِيَّ إِلَّا أَنْ يَكُونَ أَوَّلَ يَوْمٍ لَه.",
    gNextClass:"وَاجِبُ الحِصَّةِ القَادِمَة",
    gNoNextClass:"لَمْ تُجْدَوَلْ حِصَّةٌ بَعْد",
    gNothingDue:"لَا شَيْءَ يَنْتَظِرُ التَّقْيِيم.",
    gNothingNext:"لَمْ يُحَدَّدْ شَيْءٌ بَعْدُ لِحِصَّةِ {d}.",
    gSetOn:"حُدِّدَ {d}",
    gDueGroup:"لِلْمُرَاجَعَة",
    gHearNow:"اِسْمَعْهُ الآنَ", gHearNowTip:"اِنْقُلْهُ إِلَى الأَعْلَى وَاسْمَعْهُ فِي حِصَّةِ اليَوْم",
    ruleNew:"<b>خَطَأٌ وَاحِدٌ فِي الصَّفْحَة.</b> وَمَا زَادَ عَلَى ذَلِكَ يُعَادُ الأُسْبُوعَ القَادِم.",
    ruleReview:"<b>حَتَّى ثَلَاثَةِ أَخْطَاء</b> جَيِّد · <b>٤–٥</b> مُتَوَسِّط · <b>٦ فَأَكْثَر</b> يُعَادُ الأُسْبُوعَ القَادِم.",
    gAverage:"مُتَوَسِّط", gAverageTip:"مِنْ أَرْبَعَةِ إِلَى خَمْسَةِ أَخْطَاء — يُحْتَسَب، لَكِنَّهُ يَعُودُ أَسْرَع",
    spMulti:"اِخْتَرْ مَا شِئْتَ — كُلُّ سُورَةٍ تُصْبِحُ وَاجِبًا مُسْتَقِلًّا.",
    spNarrow:"تَحْدِيدُ مَقْطَع (اِخْتِيَارِيّ)",
    spFromAyah:"مِنْ آيَة", spToAyah:"إِلَى آيَة",
    spFromPage:"مِنْ صَفْحَة", spToPage:"إِلَى صَفْحَة", spPage:"ص.",
    spPageFail:"تَعَذَّرَ تَحْمِيلُ أَرْقَامِ الصَّفَحَات، فَاخْتَرْ بِالآيَةِ بَدَلًا مِنْ ذَلِك.",
    spPageFailWhy:"لَمْ يُجِبِ الخَادِم — أَبْلِغْ طَارِق.",
    spBad:"هَذَا لَيْسَ مَقْطَعًا دَاخِلَ هَذِهِ السُّورَة (١–{n}).",
    spPickOne:"اِخْتَرْ سُورَةً أَوَّلًا.",
    spFullName:"الاِسْمُ الكَامِل", spNameHint:"الاِسْمُ الأَوَّلُ وَالحَرْفُ الأَوَّلُ مِنَ العَائِلَة، مِثْل: بِلَال ن.",
    spFindChild:"اِبْحَثْ عَنْ طِفْل", spUnsent:"اِعْتَبِرْهُ غَيْرَ مُرْسَل",
    ofAyat:"مِنْ {n}", rotShowAll:"أَظْهِرِ الكُلَّ ({n})", rotCollapse:"أَظْهِرْ أَقَلَّ",
    rotNeeds:"يَحْتَاجُ انْتِبَاهًا", rotAvg:"كَانَ مُتَوَسِّطًا",
    nextWeek:"وَاجِبُ الأُسْبُوعِ القَادِم", recentCls:"الحِصَصُ الأَخِيرَة",
    assignNew:"حِفْظٌ جَدِيد", addReview:"مُرَاجَعَة — حِفْظٌ قَدِيم",
    assignNewSub:"إِسْنَادُ مَقْطَعٍ جَدِيدٍ مِنَ القُرْآنِ لِلْحِفْظ",
    addReviewSub:"مُرَاجَعَةُ سُورَةٍ حُفِظَتْ مِنْ قَبْل",
    hwAdded:"أُضِيفَ: {k}", hwUndone:"تَمَّ التَّرَاجُع",
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
    tabGaps:"لِلْمُتَابَعَة",
    dowFriday:"الجُمُعَة", dowSunday:"الأَحَد",
    dShort_friday:"الجُمُعَة", dShort_sunday:"الأَحَد",
    dayEarlier:"أَقْدَم\u2026",
    histMore:"اِعْرِضْ حِصَصًا أَقْدَم",
    calMonth:"الشَّهْر",
    calPrev:"الشَّهْرُ السَّابِق", calNext:"الشَّهْرُ التَّالِي", calToday:"هَذَا الشَّهْر",
    calPick:"اِضْغَطْ يَوْمًا لِتَرَى مَا فِيه.",
    calChanges:"تَغْيِيرَاتُ ذَلِكَ اليَوْم",
    calOpenReg:"اِفْتَحِ الكَشْف",
    calChase:"مَا زَالَ بِحَاجَةٍ إِلَى تَسْجِيل",
    calChaseNone:"كُلُّ يَوْمِ حِصَّةٍ انْعَقَدَ مُسَجَّلٌ بِالكَامِل.",
    calCounts:"{a} مِنْ {n} مُسَجَّل \u00b7 {r} سُمِعُوا",
    calClose:"إِغْلَاقُ يَوْم",
    loadFailed:"لَمْ يُحَمَّلْ ذَلِك.", retry:"أَعِدِ المُحَاوَلَة",
    shNoClass:"لَا حَلْقَاتٍ بَعْد.",
    shHow:"وَرَقَةٌ لِكُلِّ طَالِب.", shHowBody:"اِخْتَرْ حَلْقَةً وَاضْغَطِ الطِّبَاعَة — وَيُتْرَكُ التَّطْبِيقُ حَوْلَ هَذَا خَارِجَ الصَّفْحَة، وَكُلُّ طَالِبٍ يَبْدَأُ وَرَقَةً جَدِيدَة.",
    shPrint:"اِطْبَعْ", shCount:"{n} طَالِبًا",
    shTrend:"كَيْفَ يَسِير", shWhere:"أَيْنَ وَصَل",
    shJuz:"الجُزْء {j}", shPages:"{s} مِنْ {n} صَفَحَاتٍ مُتْقَنَة", shPartial:"{n} جُزْئِيَّة",
    shNotAssessed:"لَمْ يُجْرَ جَرْدُ هَذَا العَامِ بَعْد",
    shSolid:"سُوَرٌ مُتْقَنَة", shAttendance:"الحُضُور",
    shAttDetail:"{p} حَاضِر · {l} مُتَأَخِّر · {e} بِعُذْر · {u} بِدُونِ عُذْر، مِنْ {n} حِصَّةٍ أُخِذَ كَشْفُهَا",
    shUnmarked:"{n} لَمْ يُسَجَّلْ قَطّ", shNoClasses:"لَا حِصَصَ بَعْد",
    shNoneMarked:"لَمْ يُؤْخَذِ الكَشْفُ فِي أَيٍّ مِنْ حِصَصِهِ الـ{n}",
    shSet:"المُحَدَّدُ الآن", shWhole:"السُّورَةُ كَامِلَة", shNothingSet:"لَمْ يُحَدَّدْ شَيْء",
    shReview:"يَحْتَاجُ مُرَاجَعَة", shNotes:"مُلَاحَظَاتٌ لِلْأَهْل",
    shFooter:"Qur\u2019an School \u00b7 مَدْرَسَةُ القُرْآنِ \u00b7 Assalam Mosque, Ottawa",
    excSome:"اِعْذِرْ بَعْضَهُم\u2026",
    excTitle:"اِعْذِرْ هَؤُلَاءِ الطُّلَّاب",
    excBody:"{c} يَوْمَ {d}. أَشِّرْ عَلَى مَنْ غَابَ بِعُذْر — وَبَقِيَّةُ الكَشْفِ لَا تُمَسّ.",
    excReasonLab:"السَّبَب", excWhy:"السَّبَب — جَنَازَة، سَفَرٌ عَائِلِيّ\u2026",
    excUnmarked:"لَمْ يُسَجَّل",
    excOverwrite:"يَحِلُّ هَذَا مَحَلَّ مَا سُجِّلَ لِمَنْ أَشَّرْتَ عَلَيْهِمْ، وَلَا يَمَسُّ غَيْرَهُم. وَكُلُّ وَاحِدٍ يُسَجَّلُ فِي سِجِلِّ التَّغْيِيرَاتِ وَيُمْكِنُ التَّرَاجُعُ عَنْه.",
    excSave:"سَجِّلْهُمْ بِعُذْر", excDone:"{n} سُجِّلُوا بِعُذْر",
    excNobody:"لَمْ يَكُنْ أَحَدٌ مُسَجَّلًا فِي تِلْكَ الحَلْقَةِ ذَلِكَ اليَوْم.",
    rotAssign:"+ اِجْعَلْهَا وَاجِبًا", rotHasHw:"مُحَدَّدٌ سَلَفًا",
    rotAssignTitle:"وَاجِبُ مُرَاجَعَة",
    rotAssignBody:"{w} — السُّورَةُ كَامِلَةً، لِلْمُرَاجَعَةِ فِي البَيْت.",
    rotAssigned:"حُدِّدَتْ وَاجِبَ مُرَاجَعَة",
    rotNoDay:"لَا يُوجَدُ يَوْمُ حِصَّةٍ بَعْدُ لِيُسْتَحَقَّ فِيه. سَيُحَدَّدُ عَلَى كُلِّ حَال، وَتَأْخُذُهُ أَوَّلُ حِصَّةٍ تَنْعَقِد.",
    st_s_complete:"سُجِّلَ كُلُّ شَيْء", st_s_partial:"سُجِّلَ جُزْءٌ مِنْه",
    st_s_empty:"لَمْ يُسَجَّلْ شَيْءٌ بَعْد", st_s_closed:"الحَلْقَةُ مُغْلَقَة",
    st_s_ahead:"لَمْ تَحْدُثْ بَعْد",
    backTitle:"أَنْتَ تَنْظُرُ إِلَى {d}.",
    backBody:"كُلُّ مَا تُسَجِّلُهُ يُحْسَبُ عَلَى تِلْكَ الحِصَّة، لَا عَلَى حِصَّةِ اليَوْم. اِضْغَطْ أَحْدَثَ يَوْمٍ فِي الشَّرِيطِ أَعْلَاهُ لِلْعَوْدَة.",
    backClosed:"تِلْكَ الحِصَّةُ مُغْلَقَة. وَيُمْكِنُ لِلْمُنَسِّقِ إِعَادَةُ فَتْحِهَا مِنَ الإِدَارَة ← التَّقْوِيم.",
    lateMark:"سُجِّلَ لَاحِقًا",
    gapAtt:"{n} لَمْ يُسَجَّلْ حُضُورُهُم",
    gapMark:"{n} لَمْ يُقَيَّمْ وَاجِبُهُم",
    gapAtt1:"طَالِبٌ وَاحِدٌ لَمْ يُسَجَّلْ حُضُورُه",
    gapMark1:"طَالِبٌ وَاحِدٌ لَمْ يُقَيَّمْ وَاجِبُه",
    gapNone:"لَا شَيْءَ مُعَلَّق — كُلُّ الحَلْقَاتِ مُكْتَمِلَة.",
    gapCutoff:"تَظْهَرُ الحِصَّةُ هُنَا بَعْدَ انْتِهَائِهَا — {t}. وَمَا زَالَ جَارِيًا لَا يُذْكَر، وَيَرَاهُ المُعَلِّمُونَ فِي كَشْفِهِم.",
    gapCutoffOne:"{d} بَعْدَ {h}",
    gapWindow:"آخِرُ {n} مِنْ أَيَّامِ كُلِّ حَلْقَة.",
    gapTouched:"آخِرُ مَنْ عَمِلَ عَلَيْهِ {t}", gapUntouched:"لَمْ يَفْتَحْ أَحَدٌ هَذَا اليَوْم",
    gapCopy:"نَسْخٌ لِلْوَاتْسَاب", gapCopied:"نُسِخَ",
    gapOpen:"اِفْتَحْ هَذَا اليَوْم",
    gapRoll:"{n} فِي الحَلْقَة",
    gapNotStarted:"لَمْ يَفْتَحْ أَحَدٌ هَذَا اليَوْمَ بَعْد — الطُّلَّابُ الـ{n} جَمِيعًا",

    student:"الطَّالِب", classW:"الحَلْقَة", attendance:"الحُضُور", flags:"يَحْتَاجُ اِنْتِبَاهًا",
    lastHeard:"آخِرُ سَمَاع", pages:"صَفَحَات", none:"—",
    weeks:"أَسَابِيعَ مَضَتْ", never:"لَمْ يُسْمَعْ بَعْدُ", thisTerm:"هَذَا الفَصْل",

    mHere:"حَاضِر", mLate:"مُتَأَخِّر", mAway:"غَائِب",
    gGood:"جَيِّد", gAgain:"أَعِدْ", gNotReady:"لَمْ يُحَضِّرْ",
    gGoodTipNew:"تَلَا عَلَى المُسْتَوَى المَطْلُوب — خَطَأٌ وَاحِدٌ فِي الصَّفْحَةِ أَوْ أَقَلّ",
    gGoodTipRev:"تَلَا عَلَى المُسْتَوَى المَطْلُوب — حَتَّى ثَلَاثَةِ أَخْطَاء",
    gAgainTipNew:"أَكْثَرُ مِنْ خَطَإٍ وَاحِدٍ فِي الصَّفْحَة. يَعُودُ الأُسْبُوعَ القَادِمَ تِلْقَائِيًّا.",
    gAgainTipRev:"سِتَّةُ أَخْطَاءٍ أَوْ أَكْثَر. يَعُودُ الأُسْبُوعَ القَادِمَ تِلْقَائِيًّا.",
    gNotReadyTip:"حَاضِرٌ لَكِنَّهُ لَمْ يَعْمَلْ عَلَيْه. هَذَا حَدِيثٌ مَعَ الأُسْرَة، لَا مُشْكِلَةٌ تَعْلِيمِيَّة.",
    week1:"أُسْبُوعٌ مَضَى",
    mtSolid:"مُتْقَن", mtReview:"مُرَاجَعَة", mtClear:"مَسْح",
    mtSolidTip:"مَحْفُوظٌ وَثَابِت — لَا حَاجَةَ لِلْعَوْدَةِ إِلَيْهِ قَرِيبًا",
    mtReviewTip:"حُفِظَ مِنْ قَبْلُ لَكِنَّهُ يَضْعُف. يَدْخُلُ فِي دَوْرَةِ المُرَاجَعَة.",
    findSurah:"ابْحَثْ عَنْ سُورَة — بِالاِسْمِ أَوْ بِالرَّقَم",
    trend:"الاِتِّجَاه",
    tr_up:"يَتَقَدَّم", tr_flat:"ثَابِتٌ بِلَا تَقَدُّم",
    tr_down:"يَتَرَاجَع", tr_away:"لَا يَكْفِي لِلْحُكْم",
    mtClearTip:"يُزِيلُ هَذَا مِنْ سِجِلِّ الطَّالِب — لِتَصْحِيحِ خَطَإٍ، لَا لِتَسْجِيلِ النِّسْيَان",
    mtClearAsk:"هَلْ تَمْسَحُ هَذَا مِنَ السِّجِلّ؟",
    mtClearBody:"لَنْ يُحْسَبَ مَحْفُوظًا بَعْدَ الآن. إِنْ كَانَ الطَّالِبُ قَدْ نَسِيَهُ فَاخْتَرْ مُرَاجَعَة، فَذَلِكَ يَحْفَظُ التَّارِيخَ وَيُعِيدُهُ إِلَى دَوْرَةِ المُرَاجَعَة.",
    mtPagesSolid:"{n} صَفْحَةً مُتْقَنَةً فِي المُصْحَفِ كُلِّهِ",
    mtHelp:"اُنْقُرْ عَلَى جُزْءٍ لِفَتْحِه. يُمْكِنُكَ تَعْلِيمُ جُزْءٍ كَامِلٍ أَوْ حِزْبٍ أَوْ صَفْحَةٍ أَوْ بِضْعِ آيَاتٍ، بِحَسَبِ مَا تَعْرِفُهُ فِعْلًا. لَا شَيْءَ هُنَا يَقُولُ إِنَّ الطَّالِبَ تَلَا اليَوْم؛ هَذَا تَسْجِيلٌ لِمَا هُوَ حَافِظُهُ أَصْلًا.",
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

  /* Arabic month and weekday names, vowelled, because everything this app
     writes in Arabic is vowelled and dates were the one exception.

     They used to come from toLocaleDateString("ar"), which returns them
     BARE — so a calendar tile read "الأَحَد / أكتوبر", the weekday with its
     tashkeel and the month without, one above the other. In a running
     sentence that was easy to miss; stacked on a tile it is the first thing
     you see.

     The locale had a second problem worth being rid of: which digits it
     returns depends on the device's own ICU build, so the same date showed
     as 25 on one phone and ٢٥ on another. Formatting it here makes every
     phone agree. Digits stay Latin, matching the ayah numbers the app has
     always printed. */
  var AR_MONTHS = ["يَنَايِر", "فِبْرَايِر", "مَارِس", "أَبْرِيل", "مَايُو", "يُونْيُو",
                   "يُولْيُو", "أَغُسْطُس", "سِبْتَمْبِر", "أُكْتُوبَر", "نُوفَمْبِر", "دِيسَمْبِر"];
  var AR_DOW = ["الأَحَد", "الاِثْنَيْن", "الثُّلَاثَاء", "الأَرْبِعَاء",
                "الخَمِيس", "الجُمُعَة", "السَّبْت"];

  /* Dates are always shown the way a person reads them, in their language,
     and never as a bare ISO string. */
  function fmtDate(iso, withWeekday) {
    if (!iso) return "—";
    var d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
    if (isNaN(d.getTime())) return String(iso);
    if (lang === "ar") {
      return (withWeekday ? AR_DOW[d.getDay()] + "\u060C " : "") +
             d.getDate() + " " + AR_MONTHS[d.getMonth()] + " " + d.getFullYear();
    }
    var o = { day: "numeric", month: "short", year: "numeric" };
    if (withWeekday) o.weekday = "long";
    try { return d.toLocaleDateString("en-GB", o); } catch (e) { return iso; }
  }

  /* Just the month, for the calendar tiles. Same source as fmtDate so the
     two can never name a month differently.

     English abbreviates; ARABIC DOES NOT. There is no conventional
     three-letter Arabic month, and أكتوبر cut to أكت is not an abbreviation,
     it is a fragment. The full name fits the Arabic chip, which is already
     wider to hold الجُمُعَة. */
  function fmtMonth(iso) {
    if (!iso) return "";
    var d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
    if (isNaN(d.getTime())) return String(iso).slice(5, 7);
    if (lang === "ar") return AR_MONTHS[d.getMonth()];
    try { return d.toLocaleDateString("en-GB", { month: "short" }); }
    catch (e) { return String(iso).slice(5, 7); }
  }

  window.i18n = { t: t, isAr: isAr, setLang: setLang, get lang() { return lang; },
                  fmtDate: fmtDate, fmtMonth: fmtMonth };
})();
