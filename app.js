/* ============================================================================
   Sijill · سِجِلّ — teacher and coordinator app.
   ============================================================================ */
(function () {
  "use strict";
  var T = i18n.t, $ = function (id) { return document.getElementById(id); };

  var S = {                       // everything the screen is currently showing
    me: null,                     // {teacher_id, teacher, coordinator}
    classes: [], clsId: null, day: null, dayData: null,
    student: null, studentData: null,
    undo: null, ctab: "dash"
  };

  /* ------------------------------------------------------------- plumbing */
  /* Every screen in the app, in one place.
     This list used to be written out by hand here AND again in coord.js, and
     when the mushaf screen was added neither copy learned about it — so going
     to the coordinator from the mushaf left the mushaf sitting on top and you
     landed on whichever child you had open last. Reading the sections out of
     the page means a screen added later cannot be forgotten. */
  function allViews() {
    return Array.prototype.slice.call(document.querySelectorAll("section.view"))
      .map(function (el) { return el.id; });
  }
  function show(id) {
    allViews().forEach(function (v) { $(v).hidden = (v !== id); });
    window.scrollTo(0, 0);
  }
  window.SijillShow = show;
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c];
    });
  }
  function toast(msg, undoFn) {
    var t = $("toast");
    $("toastMsg").textContent = msg;
    var b = $("toastUndo");
    b.hidden = !undoFn;
    b.textContent = T("undo").replace("↶ ", "");
    b.onclick = function () { t.hidden = true; if (undoFn) undoFn(); };
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, undoFn ? 7000 : 2600);
  }
  function sheet(title, bodyHtml, okLabel, onOk, noLabel) {
    var s = $("sheet");
    $("shTitle").textContent = title;
    $("shBody").innerHTML = bodyHtml;
    $("shOk").textContent = okLabel || T("save");
    $("shOk").hidden = !onOk;
    // One button serves every sheet, so anything a previous sheet put on it
    // has to come off here — otherwise the red "Remove it" styling follows
    // the next sheet around and Save turns up looking like a delete.
    $("shOk").classList.remove("danger");
    $("shNo").textContent = noLabel || T("cancel");
    s.hidden = false;
    $("shOk").onclick = function () { if (onOk && onOk() !== false) closeSheet(); };
    $("shNo").onclick = function () { closeSheet(); };
    return s;
  }
  /* Every close goes through here, because the settings sheet borrows the
     language and theme buttons out of the page and they must be put back
     however the sheet is dismissed — OK, Cancel or anything added later. */
  function closeSheet() {
    if (window.SijillReturnChrome) window.SijillReturnChrome();
    $("sheet").hidden = true;
  }

  /* A failed write must be impossible to miss. This is the banner that makes
     it impossible to miss. */
  api.onSaveState(function (st) {
    var el = $("saveBar"); if (!el) return;
    if (st.failed) {
      el.innerHTML =
        '<div class="banner crit"><span class="ic">●</span><div>' +
        '<b>' + st.failed + ' ' + (st.failed === 1 ? T("failOne") : T("failMany")) + '.</b> ' +
        esc(T("failHelp")) +
        '<button class="btn sm" id="retryNow" style="margin-top:8px">' + esc(T("retryNow")) + '</button>' +
        '</div></div>';
      $("retryNow").onclick = function () {
        api.retryFailed().then(function (ok) {
          if (ok) { toast(T("savedAll")); refreshDay(); }
        });
      };
    } else if (st.pending) {
      el.innerHTML = '<div class="note" style="margin-bottom:12px">↻ ' + st.pending + ' ' + esc(T("saving")) + '</div>';
    } else { el.innerHTML = ""; }
  });

  function fail(err) {
    if (api.isSignedOut(err)) { api.setToken(null); startup(); return; }
    toast(err.message || String(err));
    if (api.config.DEV) console.error(err);
  }

  /* ------------------------------------------------------------- sign in */
  $("gateForm").onsubmit = function (e) {
    e.preventDefault();
    var pass = $("gatePass").value, btn = $("gateGo"), err = $("gateErr");
    if (!pass) return;
    btn.disabled = true; btn.innerHTML = '<span class="spin"></span>';
    err.hidden = true;
    api.rpc("api_sign_in", { p_pass: pass }).then(function (r) {
      btn.disabled = false; btn.textContent = T("gateGo");
      if (!r || r.ok === false) {
        err.textContent = (r && r.error) || "Not right."; err.hidden = false;
        $("gatePass").select(); return;
      }
      api.setToken(r.token);
      $("gatePass").value = "";
      pickWho(r.teachers || []);
    }).catch(function (e2) {
      btn.disabled = false; btn.textContent = T("gateGo");
      err.textContent = e2.message; err.hidden = false;
    });
  };

  function pickWho(teachers) {
    var box = $("whoList");
    box.innerHTML = teachers.map(function (t) {
      return '<button data-id="' + esc(t.id) + '">' + esc(t.name) + '</button>';
    }).join("") || '<div class="empty">No teachers on the list yet.</div>';
    box.querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        b.innerHTML = '<span class="spin"></span>';
        api.rpc("api_set_teacher", { p_token: api.getToken(), p_teacher: b.dataset.id })
          .then(function (me) { S.me = me; openClasses(); })
          .catch(function (e) { $("whoErr").textContent = e.message; $("whoErr").hidden = false; });
      };
    });
    show("v-who");
  }

  $("whoAdd").onclick = function () {
    sheet(T("whoAddTitle"),
      '<p style="margin:0 0 12px;font-size:13.5px;color:var(--ink-2)">' + esc(T("whoAddHelp")) + '</p>' +
      '<input id="newName" type="text" placeholder="' + esc(T("spFullName")) + '" style="width:100%;padding:12px;font-size:16px;' +
      'border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink)">',
      T("add"), function () {
        var n = ($("newName").value || "").trim();
        if (n.length < 3) return false;
        api.rpc("api_add_myself", { p_token: api.getToken(), p_name: n })
          .then(function () { return api.rpc("api_whoami", { p_token: api.getToken() }); })
          .then(function (me) { S.me = me; closeSheet(); openClasses(); })
          .catch(function (e) { toast(e.message); });
        return false;
      });
  };

  /* -------------------------------------------------------------- classes */
  function openClasses() {
    show("v-class");
    // The caret says this is a button, not a caption. Picking the wrong name
    // from the sign-in list is the commonest first-night mistake and this is
    // the only way back from it.
    // First name only. The bar was wrapping onto a second line on a 390px
    // phone, which cost the register 40px of the space it needs most; the
    // full name is one tap away on the picker this button opens.
    var full = (S.me && S.me.teacher) || "—";
    $("whoAmI").textContent = full.split(" ")[0] + " ⌄";
    $("whoAmI").title = full;
    return api.read("api_classes").then(function (cs) {
      S.classes = cs || [];
      var sel = $("classPick");
      sel.innerHTML = S.classes.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.name) + ' (' + c.size + ')</option>';
      }).join("");
      if (!S.clsId || !S.classes.some(function (c) { return c.id === S.clsId; })) {
        S.clsId = S.classes.length ? S.classes[0].id : null;
      }
      sel.value = S.clsId;
      return refreshDay();
    }).catch(fail);
  }

  $("classPick").onchange = function () { S.clsId = this.value; S.day = null; refreshDay(); };

  function currentClass() {
    return S.classes.filter(function (c) { return c.id === S.clsId; })[0] || null;
  }

  function refreshDay() {
    var c = currentClass();
    if (!c) { $("slist").innerHTML = '<div class="empty">No classes yet.</div>'; return Promise.resolve(); }
    // today if today is a class day, otherwise the most recent one that ran
    var on = S.day || (c.today ? null : (c.last && c.last.held_on));
    // A class whose first day has not arrived yet — one added midweek, say —
    // still has a roster, and homework for it is set in advance. This used to
    // dead-end on "has not met yet this year" with no way through, even
    // though api_classes has been returning the next date all along. Opening
    // it is safe: the database refuses attendance and recitation on a day
    // that has not happened, so only homework can be set from here.
    if (!c.today && !on && c.next && c.next.held_on) { on = c.next.held_on; }
    if (!c.today && !on) {
      $("clsTitle").textContent = c.name;
      $("clsDate").textContent = "—";
      $("slist").innerHTML = '<div class="empty">This class has not met yet this year.</div>';
      $("doneBar").innerHTML = ""; $("tally").innerHTML = "";
      return Promise.resolve();
    }
    $("slist").innerHTML = '<div class="loading"><span class="spin"></span></div>';
    return api.read("api_class_day", { p_class: S.clsId, p_on: on }).then(function (d) {
      S.dayData = d; S.day = d.session.held_on;
      renderDay();
    }).catch(fail);
  }

  var REASONS = [
    ["absent_unjustified", "No reason", "بِدُونِ عُذْر", false],
    ["absent_sick",        "Sick",      "مَرَض",        true],
    ["absent_travel",      "Travel",    "سَفَر",        true],
    ["absent_other",       "Excused — other", "عُذْرٌ آخَر", true]
  ];
  function isAbsent(st) { return st && st.indexOf("absent") === 0; }
  function isExcused(st) { return isAbsent(st) && st !== "absent_unjustified"; }

  function renderDay() {
    var d = S.dayData, ar = i18n.isAr();
    var c = currentClass();
    // Is the day on screen still ahead of us? c.last is the most recent day
    // that has already run, so anything past it, with no class today, has not
    // happened. ISO dates compare correctly as strings.
    var ahead = !!c && !c.today && (!c.last || d.session.held_on > c.last.held_on);
    // Today is not a class day and the register has quietly opened the last
    // one that ran. That is the right thing to open — a teacher catching up
    // on Saturday wants Friday — but the screen never said so, and a date in
    // small grey type under the class name is easy to read straight past.
    var behind = !!c && !c.today && !ahead;
    $("clsTitle").textContent = d["class"].name;
    $("clsDate").textContent = i18n.fmtDate(d.session.held_on, true) +
      (behind ? " · " + T("lastHeld") : "") +
      " · " + d.students.length + " " + (ar ? "طُلَّاب" : "students") +
      (d.session.status === "cancelled" ? " · " + (ar ? "مُغْلَقَة" : "closed") : "");

    $("slist").classList.toggle("ahead", ahead);
    $("aheadNote").hidden = !ahead;
    if (ahead) $("aheadNote").textContent = T("aheadNote");
    $("slist").innerHTML = d.students.map(function (s, i) {
      var reasonIdx = Math.max(0, REASONS.findIndex(function (r) { return r[0] === s.state; }));
      var flag = s.flags && s.flags.kind
        ? '<span class="pill ' + s.flags.kind + '"><i></i>' + esc(s.flags.message) + '</span>' : "";
      var tr = trendHtml(s.trend, false);
      // "Heard it, all fine" straight from the list. This is the whole point
      // of the row: the ordinary child has nothing to discuss, and making
      // that case cost a trip into their page and back is what turns a
      // two-minute register into a twenty-minute one. It only appears when
      // there is something open to hear and the child is actually here.
      var canHear = s.due > 0 && !isAbsent(s.state) && s.state;
      var heard = canHear
        ? '<button class="heard" data-heard="' + i + '" title="' + esc(T("heardAllTip")) + '">' +
            '<span class="ic">✓</span><small>' + esc(T("heardAll")) + '</small></button>'
        : "";
      return '' +
      '<div class="srow ' + (isAbsent(s.state) ? "absent" : "") + '" data-i="' + i + '">' +
        // The name gets its own element. With the trend arrow and the chevron
        // living in the same box, "the text of .nm" stopped being the child's
        // name — which broke the tests and would have broken anything else
        // that needed it.
        '<button class="nmb"><span class="nm">' + tr +
          '<span class="nmtext">' + esc(s.name) + '</span>' +
          '<span class="chev" aria-hidden="true">›</span></span><span class="meta">' +
          (s.due ? s.due + " " + T("dueback") + " · " : "") +
          (s.last_heard ? T("heard") + " " + i18n.fmtDate(s.last_heard) : T("never")) +
          (isAbsent(s.state) ? ' <span class="pill ' + (isExcused(s.state) ? "exc" : "crit") + '"><i></i>' +
              esc(ar ? REASONS[reasonIdx][2] : REASONS[reasonIdx][1]) + '</span>' : "") +
          flag +
          (isAbsent(s.state) ? ' <span class="pill mute"><i></i>' + esc(T("carries")) + '</span>' : "") +
          (s.recited ? ' <span class="pill ok"><i></i>' + esc(T("recited")) + '</span>' : "") +
        '</span></button>' +
        heard +
        // Word labels under the icons. "L" meant nothing to anyone and meant
        // less than nothing in Arabic.
        '<div class="seg3">' +
          '<button class="p" data-a="present" aria-pressed="' + (s.state === "present") + '">' +
            '<span class="ic">✓</span><small>' + esc(T("mHere")) + '</small></button>' +
          '<button class="l" data-a="late" aria-pressed="' + (s.state === "late") + '">' +
            '<span class="ic">L</span><small>' + esc(T("mLate")) + '</small></button>' +
          '<button class="a' + (isExcused(s.state) ? " exc" : "") + '" data-a="absent" aria-pressed="' + isAbsent(s.state) + '">' +
            '<span class="ic">✗</span><small>' + esc(T("mAway")) + '</small></button>' +
        '</div>' +
      '</div>' +
      '<div class="reasons" data-r="' + i + '"' + (isAbsent(s.state) ? "" : " hidden") + '>' +
        REASONS.map(function (r, j) {
          return '<button class="chip ' + (r[3] ? "ex" : "un") + '" data-j="' + j + '" aria-pressed="' +
            (s.state === r[0]) + '">' + esc(ar ? r[2] : r[1]) + '</button>';
        }).join("") +
      '</div>';
    }).join("") || '<div class="empty">Nobody is enrolled in this class.</div>';

    /* A closed day looks almost identical to an open one, and a teacher who
       cannot tell will keep tapping and keep failing. Say what happened, and
       say what is still possible — homework for next week still is, which is
       the whole reason the day being closed does not mean the class stops
       being prepared for. */
    if (d.session.status === "cancelled") {
      $("doneBar").innerHTML =
        '<div class="banner exc"><span class="ic">●</span><div>' +
        '<b>' + esc(ar ? "هَذَا اليَوْمُ مُغْلَق" : "This day is closed") +
        (d.session.closed_note || d.session.note
          ? " — " + esc(d.session.closed_note || d.session.note) : "") + '.</b> ' +
        esc(ar
          ? "كُلُّ الطُّلَّابِ مُسَجَّلُونَ غَائِبِينَ بِعُذْر، وَلَا يُحْسَبُ عَلَى أَحَد. لَا يُمْكِنُ تَسْجِيلُ تِلَاوَة، لَكِنْ يُمْكِنُكَ إِسْنَادُ وَاجِبِ الأُسْبُوعِ القَادِم."
          : "Everyone is recorded excused and it counts against nobody. Recitation cannot be recorded — none happened — but you can still set homework for next week.") +
        '</div></div>';
      $("allPresent").hidden = true;
    } else {
      // Also hidden when the day has not arrived: the database would only
      // refuse it. Homework stays available, because setting it in advance is
      // the whole reason for opening a future day early.
      $("allPresent").hidden = ahead;
    }

    // "3 of 8 not yet marked" — Tarek asked for this up top and very visible
    var done = d.students.filter(function (s) { return s.state && s.recited > 0; }).length;
    var tot = d.students.length;
    // One line, not two. The explanatory sentence underneath was read once on
    // the first evening and then cost 22px of the register every week after.
    // It moved to the hint under the list, where it is still there to be
    // found and is not in the way.
    // Nothing can be "complete" on a day that has not happened, and the
    // notice above already says so — the counter would just be noise. A
    // CLOSED day is usually in the future too, and its own message is
    // already in this element, so leave that one alone.
    if (d.session.status !== "cancelled")
    $("doneBar").innerHTML = ahead ? "" : (tot && done >= tot)
      ? '<div class="donebar all"><span class="big">✓</span><div>' + esc(T("doneAll")) +
        ' <span style="font-weight:400;color:var(--ink-2)">· ' + T("doneAllSub", { n: tot }) + '</span></div></div>'
      : '<div class="donebar part"><span class="big">' + (tot - done) + '</span><div>' +
        T("donePart", { n: tot }) + '</div></div>';

    // The register's arrows carry no words — there is no room beside a name —
    // so the key goes directly under the list.
    var lg = $("trendKey");
    if (lg) lg.innerHTML = trendLegend();

    var c = { present: 0, late: 0, exc: 0, crit: 0 };
    d.students.forEach(function (s) {
      if (s.state === "present") c.present++;
      else if (s.state === "late") c.late++;
      else if (isExcused(s.state)) c.exc++;
      else if (s.state === "absent_unjustified") c.crit++;
    });
    $("tally").innerHTML =
      (c.present ? '<span class="pill ok"><i></i>' + c.present + " " + T("present") + "</span>" : "") +
      (c.late ? '<span class="pill late"><i></i>' + c.late + " " + T("late") + "</span>" : "") +
      (c.exc ? '<span class="pill exc"><i></i>' + c.exc + " " + T("excused") + "</span>" : "") +
      (c.crit ? '<span class="pill crit"><i></i>' + c.crit + " " + T("noreason") + "</span>" : "");

    renderClassNote(ahead);
  }

  /* ------------------------------------------------------------ class note
     What the class did together, written once and read by every family in
     it. It belongs to the class DAY, which is what keeps it honest: it is
     dated, so it cannot go stale, and nobody has to remember to take it
     down — next Sunday's note simply becomes the latest one.

     Not shown on a cancelled day (nothing happened), on a day still AHEAD
     of us (nothing has happened YET — the register is locked for the same
     reason), or to a coordinator looking in read-only, who is not the one
     who taught it. */
  function renderClassNote(ahead) {
    var box = $("cnoteBox");
    if (!box) return;
    var d = S.dayData, sess = d && d.session;
    var show = !!sess && sess.status !== "cancelled" && !S.readOnly && !ahead;
    box.hidden = !show;
    if (!show) return;

    var txt = sess.class_note || "";
    $("cnoteText").value = txt;
    $("cnoteText").placeholder = T("cnPlaceholder");
    $("cnoteClear").hidden = !txt;
    $("cnoteBy").textContent = (txt && sess.class_note_by)
      ? T("cnBy", { t: sess.class_note_by })
      : (txt ? "" : T("cnEmpty"));
    cnoteCount();
  }

  function cnoteCount() {
    var n = ($("cnoteText").value || "").length;
    var el = $("cnoteCount");
    el.textContent = n + "/600";
    el.classList.toggle("over", n > 600);
  }

  function saveClassNote(text) {
    var sess = S.dayData && S.dayData.session;
    if (!sess) return;
    api.write("api_class_note",
      { p_session: sess.id, p_note: text },
      T("cnTitle")
    ).then(function () {
      // Keep the local copy in step rather than refetching the whole day:
      // a teacher mid-register must not have the list redrawn under them.
      sess.class_note = text || null;
      sess.class_note_by = text ? ((S.me && S.me.teacher) || sess.class_note_by) : null;
      renderClassNote();
      toast(T("cnSaved"));
    });
  }

  /* ------------------------------------------------------- marking people */
  $("slist").addEventListener("click", function (e) {
    var seg = e.target.closest(".seg3 button");
    if (seg) {
      var row = seg.closest(".srow"), s = S.dayData.students[+row.dataset.i];
      var want = seg.dataset.a;
      var state = (want === "absent") ? (isAbsent(s.state) ? s.state : "absent_unjustified") : want;
      return mark(s, state);
    }
    var chip = e.target.closest(".reasons .chip");
    if (chip) {
      var s2 = S.dayData.students[+chip.closest(".reasons").dataset.r];
      return mark(s2, REASONS[+chip.dataset.j][0]);
    }
    var hb = e.target.closest("[data-heard]");
    if (hb) {
      var sh = S.dayData.students[+hb.dataset.heard];
      hb.disabled = true;
      return markAllGood(sh);
    }
    var nm = e.target.closest(".nmb");
    if (nm) openStudent(S.dayData.students[+nm.closest(".srow").dataset.i]);
  });

  /* One tap on the class row: everything this child had open, recited well.
     The database does it in a single call so a dropped signal can never leave
     a child credited with two of their three items. */
  function markAllGood(s) {
    return api.write("api_mark_all_good",
      { p_session: S.dayData.session.id, p_student: s.id }, s.name
    ).then(function (r) {
      var ids = (r && r.ids) || [];
      S.undo = {
        label: s.name,
        fn: function () {
          // Newest first — the same order a teacher would undo them by hand,
          // and the order the undo check expects.
          return ids.slice().reverse().reduce(function (p, id) {
            return p.then(function () {
              return api.write("api_undo_record", { p_record: id }, s.name);
            });
          }, Promise.resolve());
        }
      };
      showUndo();
      toast(T("heardDone", { name: s.name, n: (r && r.marked) || 0 }), S.undo.fn);
      return refreshDay();
    }).catch(function (e) { refreshDay(); fail(e); });
  }

  function mark(s, state) {
    var was = s.state, wasReason = s.reason;
    s.state = state; renderDay();
    S.undo = { label: s.name, fn: function () { return mark(s, was); } };
    showUndo();
    return api.write("api_mark_attendance",
      { p_session: S.dayData.session.id, p_student: s.id, p_state: state, p_reason: null },
      s.name
    ).then(function (r) {
      if (r && r.flags) s.flags = r.flags;
      renderDay();
    }).catch(function (e) { s.state = was; s.reason = wasReason; renderDay(); fail(e); });
  }

  $("allPresent").onclick = function () {
    var snapshot = S.dayData.students.map(function (s) { return s.state; });
    S.dayData.students.forEach(function (s) { s.state = "present"; });
    renderDay();
    S.undo = {
      label: T("markAll"),
      fn: function () {
        return Promise.all(S.dayData.students.map(function (s, i) {
          return snapshot[i] ? mark(s, snapshot[i]) : Promise.resolve();
        }));
      }
    };
    showUndo();
    api.write("api_mark_all_present", { p_session: S.dayData.session.id }, T("markAll"))
      .then(refreshDay).catch(fail);
  };

  /* The undo button used to sit there disabled from the moment the screen
     opened, holding a third of a button row above the register for something
     that cannot happen yet. It now appears the first time there is something
     to undo. */
  function showUndo() { $("undoBtn").disabled = false; $("undoBtn").hidden = false; }
  function hideUndo() { $("undoBtn").disabled = true;  $("undoBtn").hidden = true; }
  hideUndo();

  $("undoBtn").onclick = function () {
    if (!S.undo) return;
    var u = S.undo; S.undo = null; hideUndo();
    Promise.resolve(u.fn()).then(refreshDay);
  };

  /* ------------------------------------------------- the class note's buttons */
  $("cnoteText").oninput = cnoteCount;
  $("cnoteSave").onclick = function () {
    var t = ($("cnoteText").value || "").trim();
    if (t.length > 600) { toast(T("cnTooLong", { n: t.length })); return; }
    if (!t) {
      // An empty box and Save means "take it down". Route it through the
      // same confirmation as Remove rather than deleting on a stray tap.
      if (!(S.dayData && S.dayData.session && S.dayData.session.class_note)) return;
      $("cnoteClear").onclick();
      return;
    }
    saveClassNote(t);
  };
  $("cnoteClear").onclick = function () {
    sheet(T("cnClearAsk"), '<p>' + esc(T("cnClearBody")) + '</p>', T("cnClear"), function () {
      closeSheet();
      $("cnoteText").value = "";
      saveClassNote("");
    }, T("cancel"));
    $("shOk").classList.add("danger");
  };

  /* ---------------------------------------------------------- the trend */
  /* One renderer for all three screens. The database decides the direction
     (see _trend); this only draws it, so the student page, the register and
     the coordinator's table can never disagree about the same child.

     Tarek asked for a double arrow for stagnation. I have used a horizontal
     one instead: a double arrow reads as "more, faster" in every other
     interface a person has used, which is the opposite of what standing still
     means. Easy to change back if the teachers read it differently. */
  /* Drawn, not typed. The text glyphs ↑ → ↓ come out of the system font as
     hairlines — fine in a paragraph, invisible on a phone at 14px next to a
     name. These are strokes we control: 2.8px, round caps, currentColor, so
     they inherit the trend's colour and stay crisp at any size.

     Diagonals rather than verticals, because a trend line is what this is —
     the same shape a person already reads on any chart. */
  var TRENDS = {
    up:   { cls: "tr-up",   d: "M3 13 L13 3",  head: "M13 3 L8 3 M13 3 L13 8" },
    flat: { cls: "tr-flat", d: "M3 8 L13 8",   head: "M13 8 L9 5 M13 8 L9 11" },
    down: { cls: "tr-down", d: "M3 3 L13 13",  head: "M13 13 L8 13 M13 13 L13 8" },
    away: { cls: "tr-away", d: "M3.5 8 L12.5 8", head: "" }
  };
  function arrowSvg(dir) {
    var k = TRENDS[dir] || TRENDS.away;
    return '<svg class="tarrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" ' +
      'fill="none" stroke="currentColor" stroke-width="2.8" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + k.d + '"/>' + (k.head ? '<path d="' + k.head + '"/>' : "") +
    '</svg>';
  }
  function trendHtml(t, withWords) {
    if (!t || !t.dir) return "";
    var k = TRENDS[t.dir] || TRENDS.away;
    var label = T("tr_" + t.dir);
    return '<span class="trend ' + k.cls + '" title="' + esc(label + (t.detail ? " — " + t.detail : "")) + '">' +
      arrowSvg(t.dir) +
      (withWords ? '<span class="t">' + esc(label) + '</span>' : "") +
    '</span>';
  }
  /* The same four, spelled out. Wherever a bare arrow appears with no words
     beside it, this goes underneath — an arrow nobody can decode is just
     decoration. */
  function trendLegend() {
    return '<div class="trlegend">' +
      ["up", "flat", "down", "away"].map(function (dir) {
        return '<span class="trend ' + TRENDS[dir].cls + '">' + arrowSvg(dir) +
               '<span class="t">' + esc(T("tr_" + dir)) + '</span></span>';
      }).join("") + '</div>';
  }
  window.SijillTrend = trendHtml;
  window.SijillTrendLegend = trendLegend;

  /* ------------------------------------------------------- student sheet */
  function openStudent(s) {
    // A new child starts with nothing pulled forward from the last one, and
    // with the rotation collapsed again.
    S.pulled = {}; S.rotAll = false;
    S.student = s;
    show("v-student");
    window.scrollTo(0, 0);
    $("stuName").textContent = s.name;
    $("stuSub").textContent = "—";
    $("stuBody").innerHTML = '<div class="loading"><span class="spin"></span></div>';
    renderNav();
    // The notes come back alongside the rest rather than on a second screen.
    // The database has been able to list, edit and delete them since day one;
    // the app simply never asked, which is why Tarek could not find them.
    return Promise.all([
      api.read("api_student", { p_student: s.id, p_history: 4 }),
      api.read("api_notes", { p_student: s.id }).catch(function () { return []; })
    ]).then(function (r) {
      S.studentData = r[0];
      S.notes = r[1] || [];
      renderStudent();
    }).catch(fail);
  }

  /* ------------------------------------------------- walking the class */
  function classList() {
    return (S.dayData && S.dayData.students) || [];
  }
  function stuIndex() {
    var l = classList(), id = S.student && S.student.id;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return i;
    return -1;
  }
  function renderNav() {
    var l = classList(), i = stuIndex(), ar = i18n.isAr();
    var can = !S.readOnly && i >= 0 && l.length > 1;
    $("stuPos").hidden = !can;
    $("stuNav").hidden = !can;
    if (!can) return;
    $("stuPos").textContent = T("ofN", { i: i + 1, n: l.length }) + " ⌄";
    var next = nextUnfinished(i);
    $("nextStu").textContent = next < 0
      ? T("allDone")
      : T("nextStu") + " · " + l[next].name + " ›";
    $("nextStu").disabled = next < 0;
  }
  /* Where "next" goes. Walking straight down the list is right until the end
     of it, at which point wrapping round to whoever is still unmarked is more
     useful than stopping — a teacher rarely hears the class in list order and
     the ones left over are exactly the ones they still need. */
  function nextUnfinished(from) {
    var l = classList();
    if (!l.length) return -1;
    for (var k = 1; k <= l.length; k++) {
      var j = (from + k) % l.length;
      if (j === from) break;
      if (!isAbsent(l[j].state) && !(l[j].state && l[j].recited > 0)) return j;
    }
    // everyone is done: just offer the literal next one, unless we are at the end
    return (from + 1 < l.length) ? from + 1 : -1;
  }
  $("nextStu").onclick = function () {
    var i = stuIndex(), j = nextUnfinished(i);
    if (j >= 0) openStudent(classList()[j]);
  };
  $("stuPos").onclick = function () {
    var l = classList(), ar = i18n.isAr(), cur = S.student && S.student.id;
    sheet(T("pickStu"),
      '<div class="pick" id="stuPickList">' + l.map(function (s, i) {
        var done = s.state && s.recited > 0;
        return '<button data-i="' + i + '"' + (s.id === cur ? ' class="on"' : '') + '>' +
          '<span>' + esc(s.name) + '</span>' +
          '<span class="pill ' + (done ? "ok" : isAbsent(s.state) ? "exc" : "mute") + '"><i></i>' +
            esc(done ? T("recited") : isAbsent(s.state) ? (ar ? "غَائِب" : "away") : T("notMarked")) +
          '</span></button>';
      }).join("") + '</div>', null, null, T("cancel"));
    $("stuPickList").onclick = function (e) {
      var b = e.target.closest("button[data-i]");
      if (!b) return;
      closeSheet();
      openStudent(l[+b.dataset.i]);
    };
  };

  $("backCls").onclick = function () {
    if (S.readOnly) { S.readOnly = false; return window.SijillCoord.open(); }
    show("v-class"); refreshDay();
  };

  function surahLabel(x) {
    var ar = '<span class="ar" dir="rtl">' + esc(x.name_ar) + "</span>";
    var en = '<span class="tr">' + esc(x.name_en) + rangeLabel(x) + "</span>";
    return ar + en;
  }
  /* How long a piece of homework has been sitting there. Only open homework
     reaches this box, so anything more than a couple of weeks old is a child
     who has not been heard on it — which is worth seeing without having to
     work it out from a date. Weeks, not days: this school meets twice a week
     and nobody counts in days. */
  function weeksSince(iso) {
    if (!iso) return -1;
    // The browser's own clock. There is no server "today" on this screen, and
    // at week granularity a few hours of skew cannot change the answer.
    var days = Math.floor((Date.now() - new Date(iso + "T12:00:00").getTime()) / 86400000);
    return days < 0 ? 0 : Math.floor(days / 7);
  }

  function hwAge(h) {
    if (!h.set_on) return "";
    // The browser's own clock. There is no server "today" on this screen, and
    // at week granularity a few hours of skew cannot change the answer.
    var days = Math.floor((Date.now() - new Date(h.set_on + "T12:00:00").getTime()) / 86400000);
    if (!isFinite(days) || days < 0) days = 0;
    var weeks = Math.floor(days / 7), txt, old = weeks >= 3;
    if (weeks === 0)      txt = T("hwSetThis");
    else if (weeks === 1) txt = T("hwSetLast");
    else                  txt = T("hwSetWeeks").split("{n}").join(weeks);
    return '<div class="hwage' + (old ? " old" : "") + '">' + esc(txt) +
           (old ? ' · ' + esc(T("hwStillOpen")) : "") + '</div>';
  }

  /* A range with no total is hard to judge: "1–12" could be most of a surah
     or a tenth of it. The server sends the surah's length on every row that
     carries a range, so say it. A range that IS the whole surah says nothing
     extra — "1–4 of 4" is noise. */
  function rangeLabel(x) {
    if (x.ayah_from == null && x.ayah_to == null) return "";
    if (x.whole_surah) return "";
    var span = " " + x.ayah_from + "–" + x.ayah_to;
    if (!x.ayat) return span;
    if (x.ayah_from === 1 && x.ayah_to === x.ayat) return "";
    return span + " " + T("ofAyat").split("{n}").join(x.ayat);
  }

  function renderStudent() {
    var d = S.studentData, ar = i18n.isAr();
    var f = d.flags || {};
    $("stuName").textContent = d.student.name;
    $("stuSub").textContent = [
      d.student["class"],
      (f.rate != null ? f.rate + "% " + T("attendance") : null),
      (d.rotation && d.rotation.length && d.rotation[0].last_heard
        ? T("lastHeard") + " " + i18n.fmtDate(d.rotation[d.rotation.length - 1].last_heard) : null)
    ].filter(Boolean).join(" · ");

    var html = "";
    if (d.trend && d.trend.dir) {
      html += '<div class="trendbar ' + (TRENDS[d.trend.dir] || TRENDS.away).cls + '">' +
        trendHtml(d.trend, true) +
        '<span class="why">' + esc(d.trend.detail || "") + '</span></div>';
    }
    if (f.kind) {
      html += '<div class="banner ' + f.kind + '"><span class="ic">●</span><div><b>' +
              esc(f.message) + '.</b></div></div>';
    }

    /* The two sections used to be "due back" and "homework for next week",
       split by KIND — and since both read "every open homework row", the same
       surah appeared in both the moment it was assigned. Teachers could not
       tell what they were meant to be hearing.

       They are split by WHEN it was set instead. Homework set before today is
       what the child took home and what this lesson is for; homework set
       today goes home tonight and there is nothing to hear yet. One surah,
       one place.

       The exception is real and was asked for: a child was away, or no
       teacher came, so the work was never set — the teacher assigns it and
       hears it in the same lesson. "Hear it now" pulls a row forward, and
       S.pulled remembers which, for as long as this child is on screen. */
    if (!S.pulled) S.pulled = {};
    var isNow = function (h) { return h.due_today || S.pulled[h.homework_id]; };
    var todayRev = (d.due_back || []).filter(isNow);
    var todayNew = (d.new_memorisation || []).filter(isNow);
    var later    = (d.due_back || []).concat(d.new_memorisation || [])
                     .filter(function (h) { return !isNow(h); });

    /* The day this screen is marking, and the day the work it sets is due
       back. Both come from the server so a parent's page cannot disagree
       with a teacher's about which section a surah is in. nextClass is null
       at the end of the year, which every use below has to survive. */
    var classDay  = d.class_day || null;
    var nextClass = d.next_class || null;
    var nextLabel = nextClass ? i18n.fmtDate(nextClass, true) : T("gNoNextClass");

    /* No date on this heading, deliberately. Its rows can come from several
       different classes, and the usual reason one is sitting here is that
       nobody got to hear the child — sometimes for weeks. Naming a class day
       would be wrong in exactly the case that matters most. Each row carries
       its own date and goes amber once it is three weeks old. */
    html += '<div class="grp sect"><div class="grph"><h2>' + esc(T("gDueGrade")) + '</h2>' +
            (todayRev.length + todayNew.length
              ? '<span class="n">' + (todayRev.length + todayNew.length) + '</span>' : '') +
            '</div>';
    if (!todayRev.length && !todayNew.length) {
      html += '<div class="card"><div class="empty">' + esc(T("gNothingDue")) + '</div></div>';
    } else {
      /* The rule lives inside the group it applies to. The thresholds differ
         between the two now, so one line at the bottom of the screen would be
         wrong for whichever section you were not looking at. */
      if (todayRev.length) {
        html += '<div class="subh">' + esc(T("gDueGroup")) + '</div>' +
                '<div class="note rule">' + T("ruleReview") + '</div>' +
                '<div class="card">' + todayRev.map(function (x) { return itemRow(x, "due"); }).join("") + '</div>';
      }
      /* CAREFUL: "memorise" and "new_memorisation" are spelled the British way
         on purpose — they are not words here, they are a value stored in
         homework.kind and a key the SQL builds. The visible English says
         "memorization"; changing these to match it silently stops the app
         matching its own database. */
      if (todayNew.length) {
        html += '<div class="subh">' + esc(T("gNew")) + '</div>' +
                '<div class="note rule">' + T("ruleNew") + '</div>' +
                '<div class="card">' + todayNew.map(function (x) { return itemRow(x, "new"); }).join("") + '</div>';
      }
    }
    html += '</div>';

    html += (S.readOnly ? '<div class="note" style="margin-bottom:16px">Viewing from the coordinator ' +
              'screen, so nothing here can be marked. Open the class to record a recitation.</div>'
            : '<div class="actionrow" style="margin:-6px 0 14px">' +
              '<button class="btn ghost sm" id="assignNew">' + esc(T("assignNew")) + '</button>' +
              '<button class="btn ghost sm" id="addReview">' + esc(T("addReview")) + '</button></div>' +
              '<div class="note" style="margin-bottom:16px">' + T("markKey") + '</div>');

    // what goes home tonight
    var hw = later;
    html += '<div class="grp sect next"><div class="grph"><h2>' + esc(T("gNextClass")) +
            '<span class="when">' + esc(nextLabel) + '</span></h2>' +
            (hw.length ? '<span class="n">' + hw.length + '</span>' : '') +
            '</div><div class="hwbox">' +
            (hw.length ? hw.map(function (h) {
              /* The control used to be a bare ✎, 38x26, with its only
                 explanation in a title= tooltip — which does not exist on a
                 phone, and a phone is the only thing this is used on. Nobody
                 knew homework could be corrected at all. It says a word now,
                 and it is a real tap target.

                 The age line is here because this box lists every piece of
                 OPEN homework, not just this week's: a review set five weeks
                 ago that the child has never been heard on sits in it looking
                 exactly like something set yesterday. */
              return '<div class="hwrow"><div class="hwmain">' +
                '<b class="k">' +
                  (h.kind === "memorise" ? esc(ar ? "لِلْحِفْظ" : "Memorize") : esc(ar ? "لِلْمُرَاجَعَة" : "Review")) +
                '</b> <span class="ar" style="font-family:var(--serif);font-size:18px;font-weight:700">' +
                esc(h.name_ar) + '</span> <span style="color:var(--ink-2)">' + esc(h.name_en) + rangeLabel(h) + '</span>' +
                /* The date it was set, not "today". A teacher finishing
                   Sunday's register on the Monday is not setting it today,
                   and a line that says so is the kind of small untruth that
                   makes a teacher stop trusting the rest of the screen. */
                '<div class="hwage">' +
                  esc(T("gSetOn").split("{d}").join(i18n.fmtDate(h.set_on))) + '</div>' +
                '</div><div class="hwside">' + (h.source === "auto"
                  ? '<span class="pill late"><i></i>' + (ar ? "مِنْ ↻ إِعَادَة" : "from ↻ repeat") + '</span>'
                  : '<span class="pill mute"><i></i>' + (ar ? "أَضَافَهُ المُعَلِّم" : "set by teacher") + '</span>') +
                /* Both buttons behind the same guard. Change sat outside it,
                   so the coordinator's read-only view — the one that says in
                   plain words that nothing here can be marked — still offered
                   a working homework editor, and the server would have taken
                   the write, because a coordinator's session is a teacher's
                   session. A screen that promises it cannot change anything
                   must not hand you a button that does. */
                (S.readOnly ? '' :
                  '<button class="btn ghost sm hw-now" data-hw="' + esc(h.homework_id) + '" title="' +
                  esc(T("gHearNowTip")) + '">' + esc(T("gHearNow")) + '</button>' +
                  '<button class="btn ghost sm hw-edit" data-hw="' + esc(h.homework_id) + '">' +
                  esc(T("hwChange")) + '</button>') + '</div></div>';
            }).join("")
              : '<div style="font-size:13.5px">' +
                esc(T("gNothingNext").split("{d}").join(nextLabel)) + '</div>') +
            '</div>' +
            // The key explains the two pills on the rows. With no rows it is
            // explaining something that is not on the screen.
            (hw.length ? '<div style="height:8px"></div><div class="note">' +
                         T("hwHint") + '</div>' : '') +
            '</div>';

    // Adab for today's class. Optional, and placed after the recitation work
    // rather than among it: conduct is a judgement made at the end of a
    // lesson, not while a child is still reciting.
    if (!S.readOnly && S.dayData && S.dayData.session) {
      var me = (S.dayData.students || []).filter(function (x) { return x.id === S.student.id; })[0];
      html += adabCard(me && me.adab);
    }

    // recent classes
    html += '<div class="grp"><div class="grph"><h2>' + esc(T("recentCls")) + '</h2>' +
            '<span class="n">' + (d.history || []).length + '</span></div><div class="card">' +
            ((d.history || []).length ? d.history.map(function (h) {
              /* Each recitation is now its own line with a way back.
                 Marking something good clears the homework and the item
                 leaves the list, so a mis-tap used to be unrecoverable
                 without the coordinator digging through the change log —
                 which in practice meant it was never recovered. */
              var recited = (h.recited || []).map(function (r) {
                var tone = r.outcome === "repeat" ? "t-rev"
                         : r.outcome === "average" ? "t-avg"
                         : r.outcome === "not_prepared" ? "t-np" : "t-ok";
                var mark = r.outcome === "repeat" ? "↻"
                         : r.outcome === "average" ? "≈"
                         : r.outcome === "not_prepared" ? "–" : "✓";
                var word = r.outcome === "repeat" ? T("gAgain")
                         : r.outcome === "average" ? T("gAverage")
                         : r.outcome === "not_prepared" ? T("gNotReady") : T("gGood");
                return '<span class="rec">' +
                  '<span class="outc ' + tone + '">' + mark + ' ' + esc(word) + '</span>' +
                  '<span class="w">' + esc(r.name_en) + rangeLabel(r) +
                  '</span>' + starsRead(r.tajweed) +
                  // The teacher who actually heard this passage, on the
                  // passage. Never one name standing for the whole day.
                  (r.by ? '<span class="who">' + (ar ? "سَمِعَ" : "heard by") + ' ' +
                          esc(r.by) + '</span>' : '') +
                  // What this recitation did to the mushaf. It has always
                  // happened; nothing on the screen ever said so, so teachers
                  // could not tell the audit was keeping itself up to date.
                  (r.outcome === "good" || r.outcome === "average"
                     ? '<span class="basel">' + esc(T("baselineSet")) + '</span>'
                   : r.outcome === "repeat" ? '<span class="basel rev">' + esc(T("baselineRev")) + '</span>'
                   : '') +
                  (S.readOnly || !r.id ? "" :
                    '<button class="undoRec" data-rec="' + esc(r.id) + '" data-what="' +
                    esc(r.name_en) + '">↶ ' + esc(T("undoMark")) + '</button>') +
                '</span>';
              }).join("");
              var notes = (h.notes || []).map(function (n) {
                return '<span style="font-size:12.5px;color:var(--ink-2);font-style:italic">“' +
                  esc(n.body) + '”' + (n.by ? ' <span style="font-style:normal;color:var(--ink-3)">— ' + esc(n.by) + '</span>' : '') + '</span>';
              }).join("<br>");
              return '<div class="irow" style="align-items:flex-start"><div class="lab" style="gap:4px">' +
                '<span class="tr" style="font-size:13.5px">' + i18n.fmtDate(h.held_on, true) +
                (h.status === "cancelled" ? ' <span class="pill mute"><i></i>' + (ar ? "مُغْلَقَة" : "closed") + '</span>' : '') +
                // On a closed day every enrolled child is excused automatically,
                // so an "absent" pill beside "closed" is an artefact of the
                // closure, not something the child did. It read like a mark
                // against them and could not be cleared without reopening the
                // day. The closure is the whole story; show only that.
                (h.status !== "cancelled" && h.attendance && h.attendance.indexOf("absent") === 0
                  ? ' <span class="pill ' + (h.attendance === "absent_unjustified" ? "crit" : "exc") + '"><i></i>' +
                    (ar ? "غَائِب" : "absent") + '</span>' : '') +
                // Whoever took the register, named next to the register and
                // nowhere else.
                (h.status !== "cancelled" && h.attendance_by
                  /* "register taken by", not "register by". The latter was
                     meant as a credit line — "photo by" — but it sits
                     directly beside "heard by", which sets up a verb and
                     then breaks it, so it reads as an instruction to go and
                     register something. Not "registered by" either: at a
                     school that means enrolled, which is a different fact
                     about a different thing. The Arabic was never ambiguous
                     and is unchanged. */
                  ? ' <span class="who">' + (ar ? "الحُضُورَ سَجَّلَ" : "register taken by") + ' ' +
                    esc(h.attendance_by) + '</span>' : '') + '</span>' +
                (recited ? '<span class="m">' + recited + '</span>' : '') +
                (notes || '') +
                (h.adab && h.adab.stars
                  ? '<span class="adabline">' + faceSvg(h.adab.stars) +
                    '<span>' + esc(T("adab")) + ' ' + h.adab.stars + '/5' +
                    (h.adab.note ? ' \u00b7 \u201c' + esc(h.adab.note) + '\u201d' : '') + '</span></span>'
                  : '') +
                /* This line used to sit here saying "marked by X" for the
                   whole day, where X was whoever marked ATTENDANCE — so one
                   teacher tapping "mark all present" was credited with every
                   recitation under it. Each fact names its own teacher now,
                   beside the fact itself. */
                (h.adab && h.adab.stars && h.adab_by
                  ? '<span class="m" style="opacity:.8">' + esc(T("adab")) + ' · ' +
                    (ar ? "سَجَّلَ" : "by") + ' ' + esc(h.adab_by) + '</span>' : '') +
                '</div></div>';
            }).join("") : '<div class="empty">' + esc(T("noneHist")) + '</div>') + '</div></div>';

    // notes — readable, editable and removable, which they have never been
    html += '<div class="grp"><div class="grph"><h2>' + esc(T("gNotes")) + '</h2>' +
            '<span class="n">' + (S.notes || []).length + '</span></div><div class="card">' +
            ((S.notes || []).length ? S.notes.map(function (n) {
              return '<div class="irow noterow" style="align-items:flex-start">' +
                '<div class="lab">' +
                  '<span class="tr" style="font-weight:400;font-style:italic">“' + esc(n.body) + '”</span>' +
                  '<span class="m">' +
                    (n.name_en ? esc(n.name_en) + " · " : "") +
                    i18n.fmtDate(n.created_at ? String(n.created_at).slice(0, 10) : null) +
                    (n.by ? " · " + T("noteBy") + " " + esc(n.by) : "") +
                    (n.edited_at ? " · " + T("noteEdited") : "") +
                  '</span>' +
                '</div>' +
                (S.readOnly ? "" :
                  '<button class="gb note" data-nedit="' + esc(n.id) + '" title="' + esc(T("edit")) + '">✎</button>' +
                  '<button class="gb note" data-ndel="' + esc(n.id) + '" title="' + esc(T("remove")) + '">🗑</button>') +
              '</div>';
            }).join("") : '<div class="empty">' + esc(T("noneNotes")) + '</div>') +
            '</div>' +
            (S.readOnly ? "" :
              '<div class="actionrow" style="margin-top:8px">' +
              '<button class="btn ghost sm" id="noteAdd">' + esc(T("noteAdd")) + '</button></div>') +
            '</div>';

    /* The rotation. For a child who knows most of juz 30 this was twelve
       rows of four buttons each, and it sat between the teacher and the
       bottom of the page every single time. Three now — and because the
       order puts anything owed or average first, those three are the three
       worth hearing. The rest is one tap away and stays open while you work
       through it. */
    var rot = d.rotation || [];
    var rotN = S.rotAll ? rot.length : 3;
    html += '<div class="grp"><div class="grph"><h2>' + esc(T("gRot")) + '</h2>' +
            '<span class="n">' + rot.length + '</span></div><div class="card">' +
            (rot.length ? rot.slice(0, rotN).map(function (r) {
              return itemRow(r, "rot");
            }).join("") : '<div class="empty">—</div>') + '</div>' +
            (rot.length > 3
              ? '<div class="actionrow" style="margin-top:8px"><button class="btn ghost sm" id="rotMore">' +
                esc(S.rotAll ? T("rotCollapse") : T("rotShowAll").split("{n}").join(rot.length)) +
                '</button></div>'
              : '') + '</div>';

    $("stuBody").innerHTML = html;
    var rm = $("rotMore");
    if (rm) rm.onclick = function () { S.rotAll = !S.rotAll; renderStudent(); };
    renderNav();
    wireStudent();
  }

  function group(title, items, emptyKey, kind) {
    return '<div class="grp"><div class="grph"><h2>' + esc(title) + '</h2>' +
      '<span class="n">' + (items || []).length + '</span></div><div class="card">' +
      ((items || []).length ? items.map(function (x) { return itemRow(x, kind); }).join("")
                            : '<div class="empty">' + esc(T(emptyKey)) + '</div>') +
      '</div></div>';
  }

  function itemRow(x, kind) {
    var meta = "";
    if (kind === "rot") {
      meta = x.last_heard
        ? T("heard") + " " + i18n.fmtDate(x.last_heard) +
          (x.weeks != null ? " · " + x.weeks + " " + T(x.weeks === 1 ? "week1" : "weeks") : "")
        : T("never");
    } else {
      /* How long it has been waiting. This used to live in the homework box
         below; that box now holds only what was set today, so the age had
         nowhere to be — and "to hear today" is exactly where an item set five
         weeks ago and never heard needs to stand out. */
      meta = (x.set_on ? i18n.fmtDate(x.set_on) : "") + (x.source === "auto" ? " · ↻" : "");
      var wk = weeksSince(x.set_on);
      if (wk >= 1) meta += " · " + (wk === 1 ? T("hwSetLast")
                                             : T("hwSetWeeks").split("{n}").join(wk));
    }
    var old = (kind !== "rot") && weeksSince(x.set_on) >= 3;
    var stale = (kind === "rot" && (x.weeks == null || x.weeks >= 4)) ? " stale" : "";
    /* The rotation is no longer plain oldest-first, so a row near the top
       that was heard recently needs to say why it is there. */
    if (kind === "rot" && x.band === 1) meta = T("rotNeeds") + " · " + meta;
    else if (kind === "rot" && x.band === 2) meta = T("rotAvg") + " · " + meta;
    // 'grad' marks a row that can be graded. The history rows below reuse
    // .irow for looks but carry no buttons, and without a separate class a
    // tap (or a test) can aim at the wrong one.
    return '<div class="irow grad' + (kind === "new" ? "" : " g4") + '" data-surah="' + x.surah + '"' +
      ' data-from="' + (x.ayah_from == null ? "" : x.ayah_from) + '"' +
      ' data-to="' + (x.ayah_to == null ? "" : x.ayah_to) + '"' +
      ' data-kind="' + (kind === "new" ? "new" : "review") + '">' +
      '<div class="lab"><span class="ar" dir="rtl">' + esc(x.name_ar) + '</span>' +
      '<span class="tr">' + esc(x.name_en) + rangeLabel(x) + '</span>' +
      '<span class="m' + stale + (old ? " old" : "") + '">' + esc(meta) + '</span></div>' +
      (S.readOnly ? '' :
        /* The note button and the grades travel together in one block. The
           row already wraps so the tajwid line can have its own line; without
           this the buttons wrapped among themselves too and "not ready" ended
           up alone on a third line looking like a mistake. */
        '<div class="gbrow">' +
        '<button class="gb note" data-note="1" title="' + esc(T("noteAdd")) + '">✎</button>' +
        /* The tooltips have to follow the kind too. Round 23 split the rules
           in two and left these behind saying "three mistakes a page or
           fewer" on both — which is now wrong on a new-memorisation row (one
           a page) and wrong on a review row (good is up to 3, again is 6+).
           A tooltip that contradicts the rule printed above it is worse than
           no tooltip, because a teacher trusts the one under their thumb. */
        '<button class="gb g lab3 t-ok" data-g="good" title="' +
          esc(T(kind === "new" ? "gGoodTipNew" : "gGoodTipRev")) + '">' +
          '<span class="ic">✓</span><small>' + esc(T("gGood")) + '</small></button>' +
        /* Average sits between good and again because that is what it means,
           and only on review. New memorisation allows one mistake a page —
           there is no room for a middle grade between that and "again". */
        (kind === "new" ? "" :
          '<button class="gb g lab3 t-avg" data-g="average" title="' + esc(T("gAverageTip")) + '">' +
            '<span class="ic">≈</span><small>' + esc(T("gAverage")) + '</small></button>') +
        '<button class="gb g lab3 t-rev" data-g="repeat" title="' +
          esc(T(kind === "new" ? "gAgainTipNew" : "gAgainTipRev")) + '">' +
          '<span class="ic">↻</span><small>' + esc(T("gAgain")) + '</small></button>' +
        '<button class="gb g lab3 t-np" data-g="not_prepared" title="' + esc(T("gNotReadyTip")) + '">' +
          '<span class="ic">–</span><small>' + esc(T("gNotReady")) + '</small></button></div>' +
        // Second line: the tajwid grade for THIS passage. It belongs to the
        // recitation, not to the child, so it lives on the row.
        '<div class="tjline"><span class="tjlab">' + esc(T("tajweed")) + '</span>' +
          starStrip(0) + '<span class="tjask">' + esc(T("tajweedAsk")) + '</span></div>') +
      '</div>';
  }

  /* Adab, 1-5, drawn as faces. Deliberately NOT stars: tajwid is already
     stars, and two five-point scales on one screen that mean different things
     is how a teacher grades conduct by accident. The mouth carries the
     meaning on its own, so the scale survives colour blindness and a bad
     screen — the colour only reinforces it. */
  var FACE_MOUTH = {
    1: "M5.6 11.4a3.2 3.2 0 0 1 4.8 0",       // frown
    2: "M5.6 10.9a3.4 3.4 0 0 1 4.8 .5",       // slight frown
    3: "M5.5 10.8h5",                          // flat
    4: "M5.6 10.3a3.4 3.4 0 0 0 4.8 .5",       // slight smile
    5: "M5.4 9.9a3.4 3.4 0 0 0 5.2 0"          // smile
  };
  function faceSvg(n, extra) {
    n = Math.min(5, Math.max(1, n || 3));
    return '<svg class="face f' + n + ' ' + (extra || "") + '" viewBox="0 0 16 16" aria-hidden="true">' +
      '<circle cx="8" cy="8" r="6.6"/><circle class="eye" cx="5.9" cy="6.3" r=".85"/>' +
      '<circle class="eye" cx="10.1" cy="6.3" r=".85"/>' +
      '<path d="' + FACE_MOUTH[n] + '"/></svg>';
  }
  /* The card. Optional by design: most children never get a mark, and the
     empty state says so rather than inviting one. */
  function adabCard(cur) {
    var picked = cur && cur.stars ? cur.stars : 0;
    var h = '<div class="grp"><div class="grph"><h2>' + esc(T("adab")) + '</h2>' +
            '<span class="n">' + (picked ? picked + "/5" : "\u2014") + '</span></div>' +
            '<div class="card adabcard">' +
            '<div class="faces" role="group" aria-label="' + esc(T("adab")) + '">';
    for (var i = 1; i <= 5; i++) {
      h += '<button type="button" class="fb' + (picked === i ? " on" : "") +
           '" data-adab="' + i + '" aria-label="' + i + ' / 5" aria-pressed="' + (picked === i) + '">' +
           faceSvg(i) + '</button>';
    }
    h += '</div>' +
      '<div class="adabnote"><input id="adabNote" type="text" maxlength="200" placeholder="' +
        esc(T("adabNotePh")) + '" value="' + esc((cur && cur.note) || "") + '">' +
      '<button class="mini" id="adabClear"' + (picked ? '' : ' hidden') + '>' + esc(T("adabClear")) + '</button></div>' +
      '<div class="hint">' + esc(T("adabHint")) + '</div></div></div>';
    return h;
  }

  /* Tajwīd, 1–5, on every recitation. Drawn as buttons rather than a slider
     so a thumb can hit one in a noisy classroom, and labelled so a screen
     reader says "tajwid 3 of 5" rather than "button". */
  function starStrip(value, cls) {
    var out = '<span class="stars ' + (cls || "") + '" role="group" aria-label="' + esc(T("tajweed")) + '">';
    for (var i = 1; i <= 5; i++) {
      out += '<button type="button" class="st' + (value && i <= value ? " on" : "") +
             '" data-star="' + i + '" aria-label="' + i + ' / 5"><svg viewBox="0 0 16 16" aria-hidden="true">' +
             '<path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2-.7-4.3-3.1-3 4.3-.6z"/></svg></button>';
    }
    return out + '</span>';
  }
  /* Read-only version for history and for a grade already given. */
  function starsRead(value) {
    if (!value) return "";
    var out = '<span class="stars ro" aria-label="' + esc(T("tajweed")) + ' ' + value + '/5">';
    for (var i = 1; i <= 5; i++) {
      out += '<span class="st' + (i <= value ? " on" : "") + '"><svg viewBox="0 0 16 16" aria-hidden="true">' +
             '<path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2-.7-4.3-3.1-3 4.3-.6z"/></svg></span>';
    }
    return out + '</span>';
  }

  function wireStudent() {
    /* One submit, used by both halves. The grade and the tajwid arrive in
       either order: whichever the teacher taps second is the one that sends.
       Tapping a grade is never thrown away for want of a star — the row just
       asks for the missing half and waits. */
    function sendGrade(row, outcome) {
      var tj = row.dataset.tajweed ? +row.dataset.tajweed : null;
      row.classList.remove("needtj");
      return api.write("api_record", {
        p_session: S.dayData.session.id,
        p_student: S.student.id,
        p_kind: row.dataset.kind === "new" ? "new" : "review",
        p_surah: +row.dataset.surah,
        p_from: row.dataset.from === "" ? null : +row.dataset.from,
        p_to:   row.dataset.to   === "" ? null : +row.dataset.to,
        p_outcome: outcome,
        p_note: null,
        p_tajweed: outcome === "not_prepared" ? null : tj
      }, S.student.name).then(function () {
        return api.read("api_student", { p_student: S.student.id, p_history: 4 });
      }).then(function (d) { S.studentData = d; renderStudent(); }).catch(fail);
    }

    $("stuBody").querySelectorAll(".gb.g").forEach(function (b) {
      b.onclick = function () {
        var row = b.closest(".irow");
        var cls = { good: "on-ok", average: "on-avg", repeat: "on-rev", not_prepared: "on-np" }[b.dataset.g];
        row.querySelectorAll(".gb").forEach(function (x) { x.classList.remove("on-ok","on-avg","on-rev","on-np"); });
        b.classList.add(cls);
        // Nothing was recited, so there is no reading to grade.
        if (b.dataset.g === "not_prepared") return sendGrade(row, "not_prepared");
        if (!row.dataset.tajweed) {           // ask for the other half
          row.dataset.pending = b.dataset.g;
          row.classList.add("needtj");
          return;
        }
        sendGrade(row, b.dataset.g);
      };
    });

    $("stuBody").querySelectorAll(".irow.grad .stars .st").forEach(function (b) {
      b.onclick = function () {
        var row = b.closest(".irow");
        var v = +b.dataset.star;
        row.dataset.tajweed = v;
        row.querySelectorAll(".stars .st").forEach(function (x) {
          x.classList.toggle("on", +x.dataset.star <= v);
        });
        if (row.dataset.pending) {
          var out = row.dataset.pending; delete row.dataset.pending;
          sendGrade(row, out);
        }
      };
    });
    /* Adab. A 1 must carry a sentence — the database refuses it otherwise,
       and a teacher should find that out here, not as a raw error. A 2 is
       "unsettled, worth mentioning" and does not need one. */
    var fbs = $("stuBody").querySelectorAll(".faces .fb");
    function sendAdab(stars) {
      var note = ($("adabNote") && $("adabNote").value || "").trim();
      if (stars && stars <= 1 && !note) {
        $("adabNote").classList.add("need");
        $("adabNote").focus();
        window.SijillToast(T("adabNeedNote"));
        return;
      }
      api.write("api_set_behaviour", {
        p_session: S.dayData.session.id,
        p_student: S.student.id,
        p_stars: stars,
        p_note: note || null
      }, S.student.name).then(function () {
        return Promise.all([
          api.read("api_student", { p_student: S.student.id, p_history: 4 }),
          api.read("api_class_day", { p_class: S.clsId, p_on: S.dayData.session.held_on })
        ]);
      }).then(function (r) {
        S.studentData = r[0]; S.dayData = r[1]; renderStudent();
      }).catch(fail);
    }
    fbs.forEach(function (b) {
      b.onclick = function () { sendAdab(+b.dataset.adab); };
    });
    if ($("adabClear")) $("adabClear").onclick = function () { sendAdab(null); };
    if ($("adabNote")) {
      $("adabNote").oninput = function () { this.classList.remove("need"); };
      // A note typed after the face is tapped still has to reach the record.
      // But if the blur was caused by tapping a FACE, that tap is about to
      // save anyway — and saving here first would write the OLD face, then
      // race the new one. Let the tap win.
      var noteWas = $("adabNote").value;
      $("adabNote").onblur = function (e) {
        if (e && e.relatedTarget && e.relatedTarget.closest &&
            e.relatedTarget.closest(".faces")) return;
        if (this.value === noteWas) return;      // nothing actually changed
        noteWas = this.value;
        var on = $("stuBody").querySelector(".faces .fb.on");
        if (on) sendAdab(+on.dataset.adab);
      };
    }
    $("stuBody").querySelectorAll('.gb.note[data-note]').forEach(function (b) {
      b.onclick = function () {
        var row = b.closest(".irow");
        noteSheet(+row.dataset.surah);
      };
    });
    /* The pencil on a homework line. It was a button that did nothing, which
       is worse than no button — a teacher taps it, nothing happens, and they
       stop trusting the rest of the screen. */
    $("stuBody").querySelectorAll(".hw-now").forEach(function (b) {
      b.onclick = function () {
        /* Client-side only, and deliberately. Nothing about the homework has
           changed — the teacher has simply decided to hear it today — so
           there is nothing to write down. It lasts until they leave this
           child, which is longer than the decision needs to. */
        S.pulled[b.dataset.hw] = true;
        renderStudent();
      };
    });
    $("stuBody").querySelectorAll(".hw-edit").forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        editHomework(b.dataset.hw);
      };
    });
    var an = $("assignNew"), ad = $("addReview");
    if (an) an.onclick = function () { pickSurah("memorise"); };
    if (ad) ad.onclick = function () { pickSurah("review"); };

    /* Taking a recitation back. */
    $("stuBody").querySelectorAll(".undoRec").forEach(function (b) {
      b.onclick = function () {
        var ar = i18n.isAr();
        sheet(T("undoMarkTitle"),
          '<div style="font-size:13.5px;line-height:1.6">' +
            '<b>' + esc(b.dataset.what) + '</b><br>' +
            T("undoMarkBody", { who: ar ? "الطَّالِب" : "the student's" }) + '</div>',
          T("undoMark"), function () {
            closeSheet();
            api.write("api_undo_record", { p_record: b.dataset.rec }, S.student.name)
              .then(function (r) {
                // The database refuses rather than guessing when the same
                // surah has moved on since. That answer arrives as ok:false,
                // not as an error, so it has to be checked for.
                if (r && r.ok === false) { toast(T("undoTooLate")); return; }
                toast(T("undoneOk"));
                return reloadStudent();
              }).catch(fail);
            return false;
          });
      };
    });

    /* Notes: read, change, remove. */
    var na = $("noteAdd");
    if (na) na.onclick = function () { noteSheet(null); };
    $("stuBody").querySelectorAll("[data-nedit]").forEach(function (b) {
      b.onclick = function () {
        var n = (S.notes || []).filter(function (x) { return x.id === b.dataset.nedit; })[0];
        if (!n) return;
        sheet(T("noteEdit"),
          '<textarea id="nBody" rows="3" style="width:100%;padding:11px;font-size:15px;' +
          'border:1px solid var(--line);border-radius:10px;background:var(--surface);' +
          'color:var(--ink);font-family:inherit"></textarea>',
          T("save"), function () {
            var v = ($("nBody").value || "").trim();
            if (!v) return false;
            closeSheet();
            api.write("api_note_edit", { p_id: n.id, p_body: v }, S.student.name)
              .then(reloadStudent).catch(fail);
            return false;
          });
        $("nBody").value = n.body || "";
        $("nBody").focus();
      };
    });
    $("stuBody").querySelectorAll("[data-ndel]").forEach(function (b) {
      b.onclick = function () {
        sheet(T("noteDelete"),
          '<div style="font-size:13.5px;line-height:1.55">' + esc(T("noteDeleteBody")) + '</div>',
          T("remove"), function () {
            closeSheet();
            api.write("api_note_delete", { p_id: b.dataset.ndel }, S.student.name)
              .then(reloadStudent).catch(fail);
            return false;
          });
      };
    });
  }

  function editHomework(id) {
    var ar = i18n.isAr();
    // What this row currently says, so the sheet opens filled in rather than
    // blank. Editing something you cannot see is how you fix the wrong thing.
    var cur = ((S.studentData.due_back || []).concat(S.studentData.new_memorisation || []))
      .filter(function (h) { return h.homework_id === id; })[0] || {};

    sheet(ar ? "تَعْدِيلُ الوَاجِب" : "Change this homework",
      '<div class="loading"><span class="spin"></span></div>', T("save"), null);

    api.read("api_mushaf", { p_student: S.student.id, p_juz: null }).then(function (list) {
      $("shBody").innerHTML =
        /* The surah is editable now. Picking the wrong one from a list of 114
           on a phone is the easiest mistake to make here, and until now the
           only repair was to delete the row and start again — which loses who
           set it and when. */
        '<label class="lbl" style="font-size:11px;font-weight:700;letter-spacing:.09em;' +
          'text-transform:uppercase;color:var(--ink-3)">' +
          esc(ar ? "السُّورَة" : "Surah") + '</label>' +
        '<select id="hwSurah" style="width:100%;padding:11px;font-size:16px;margin:4px 0 12px;' +
          'border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink)">' +
        list.map(function (x) {
          return '<option value="' + x.surah + '"' + (x.surah === cur.surah ? " selected" : "") + '>' +
            x.surah + " · " + esc(x.name_en) + " — " + esc(x.name_ar) + " (" + x.ayat + " " + T("ayat") + ")" +
          '</option>';
        }).join("") + '</select>' +

        '<div class="filters" style="margin:0 0 12px">' +
        '<select id="hwKind" class="mini">' +
          '<option value="memorise"' + (cur.kind === "memorise" ? " selected" : "") + '>' +
            esc(ar ? "لِلْحِفْظ" : "New memorization") + '</option>' +
          '<option value="review"' + (cur.kind === "review" ? " selected" : "") + '>' +
            esc(ar ? "لِلْمُرَاجَعَة" : "Review") + '</option>' +
        '</select>' +
        '<input id="hwFrom" class="mini" style="width:96px" placeholder="' +
          esc(ar ? "مِنْ آيَة" : "from ayah") + '" value="' + (cur.ayah_from == null ? "" : cur.ayah_from) + '">' +
        '<input id="hwTo" class="mini" style="width:96px" placeholder="' +
          esc(ar ? "إِلَى آيَة" : "to ayah") + '" value="' + (cur.ayah_to == null ? "" : cur.ayah_to) + '"></div>' +

        '<input id="hwNote" placeholder="' + esc(ar ? "مُلَاحَظَة لِلْأُسْرَة" : "A note for the family") + '" ' +
        'value="' + esc(cur.note || "") + '" ' +
        'style="width:100%;padding:11px;font-size:15px;border:1px solid var(--line);border-radius:10px;' +
        'background:var(--surface);color:var(--ink)">' +
        '<div class="note" style="margin-top:10px">' + esc(ar
          ? "إِذَا غَيَّرْتَ السُّورَةَ وَتَرَكْتَ الآيَاتِ فَارِغَةً، فَالوَاجِبُ هُوَ السُّورَةُ كَامِلَةً."
          : "Change the surah and leave the ayat empty, and the homework becomes the whole of the new surah.") +
        '</div>' +
        '<div class="actionrow" style="margin-top:12px">' +
        '<button class="btn ghost sm" id="hwRemove" style="border-color:var(--crit);color:var(--crit)">' +
        esc(ar ? "حَذْفُ هَذَا الوَاجِب" : "Remove this homework") + '</button></div>';

      // sheet() hides OK when it is created without a handler, and this one
      // is wired up after the surah list arrives. Unhide it, or the editor
      // offers Cancel and Remove and no way to say yes.
      $("shOk").hidden = false;
      $("shOk").textContent = T("save");
      $("shOk").onclick = function () {
        var newSurah = +$("hwSurah").value;
        var changedSurah = newSurah !== cur.surah;
        api.write("api_edit_homework", {
          p_id: id,
          p_surah: newSurah,
          p_kind: $("hwKind").value,
          // When the surah moves and the teacher has not retyped the range,
          // send nothing — the database then takes the whole new surah rather
          // than carrying over ayat that may not exist in it.
          p_from: $("hwFrom").value ? +$("hwFrom").value : (changedSurah ? null : cur.ayah_from),
          p_to:   $("hwTo").value   ? +$("hwTo").value   : (changedSurah ? null : cur.ayah_to),
          p_note: $("hwNote").value || null, p_remove: false
        }, S.student.name).then(function () { closeSheet(); return reloadStudent(); }).catch(fail);
        return false;
      };
      $("hwRemove").onclick = function () {
        /* Asked for. Everything else destructive in this app asks first, and
           this one sits directly under Save on a phone — one mis-tap and a
           family's page loses its homework with no warning at all. The
           question names the surah so it is answerable without scrolling
           back, and says who can put it back. */
        /* Name it the way the row names it — Arabic first, then the English
           and the range — so the question can be answered without scrolling
           back to see which one was tapped. surahLabel escapes its own parts. */
        sheet(T("hwRemoveAsk"),
          '<div class="note hwname" style="margin-bottom:10px">' +
            surahLabel(cur) + '</div>' +
          '<div class="note">' + esc(T("hwRemoveBody")) + '</div>',
          T("hwRemoveGo"), function () {
            api.write("api_edit_homework", { p_id: id, p_remove: true }, S.student.name)
              .then(function () {
                closeSheet();
                toast(T("hwRemoved"));
                return reloadStudent();
              }).catch(fail);
            return false;
          });
        // The confirm button deletes, so it is not the same green as Save.
        $("shOk").classList.add("danger");
        /* Answering "no" put you back on the student page having lost the
           editor you were in the middle of. Put it back instead — saying no
           to a delete is not a request to abandon the edit. */
        var no = $("shNo");
        if (no) no.onclick = function () { editHomework(id); };
      };
    }).catch(fail);
  }

  function reloadStudent() {
    return Promise.all([
      api.read("api_student", { p_student: S.student.id, p_history: 4 }),
      api.read("api_notes", { p_student: S.student.id }).catch(function () { return S.notes || []; })
    ]).then(function (r) { S.studentData = r[0]; S.notes = r[1] || []; renderStudent(); });
  }

  function noteSheet(surah) {
    sheet(i18n.isAr() ? "مُلَاحَظَة" : "Note",
      '<textarea id="noteBody" style="width:100%;min-height:96px;font-family:var(--sans);font-size:15px;' +
      'padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink)"></textarea>' +
      '<div class="note" style="margin-top:10px">' +
      (i18n.isAr()
        ? "كُلُّ تَعْدِيلٍ أَوْ حَذْفٍ يُسَجَّل. اُكْتُبْ مَا لَا تَمَانِعُ قِرَاءَتَهُ أَمَامَ وَالِدَيِ الطَّالِب."
        : "Edits and deletes are recorded. Write what you'd be comfortable reading aloud to the child's parent.") +
      '</div>',
      T("save"), function () {
        var body = ($("noteBody").value || "").trim();
        if (!body) return false;
        api.write("api_note_add", { p_student: S.student.id, p_body: body, p_surah: surah || null },
                  S.student.name)
          .then(function () { closeSheet(); toast(T("savedAll")); return reloadStudent(); })
          .catch(fail);
        return false;
      });
  }

  /* Pick what to assign. Loads the real mushaf from the database.

     Review takes several surahs at once — teachers set five old surahs in a
     sweep and were doing it five times. New memorisation stays one at a time,
     because it is one passage by nature and because the ayah range below only
     means anything for a single surah.

     The narrowing block appears only when exactly one surah is chosen. Pages
     are a second way of saying the same thing: they resolve to ayat before
     they are sent, so nothing downstream has to know pages exist. */
  /* One picker for one child and for a whole class.
     The class used to have a picker of its own — a radio list, no page
     numbers, no running total, no multi-select — which is exactly how it
     came to be missing the thing the student page had. Two pickers for one
     job will always drift; there is now one, and `target` is the only
     difference between the two callers.

     target === null  → the child currently open
     target === { ids, label, title, note, onDone } → everyone in the class */
  function pickSurah(kind, target) {
    var multi = (kind === "review");
    var detail = null;            // api_surah_pages for the single chosen surah
    var ids   = target ? target.ids : [S.student.id];
    var who   = target ? target.label : S.student.name;
    var done  = target ? target.onDone
                       : function () { closeSheet(); reloadStudent(); };
    sheet(target ? target.title
                 : (kind === "memorise" ? T("assignNew") : T("addReview")),
      '<div class="loading"><span class="spin"></span></div>', null, null, T("cancel"));
    /* api_mushaf annotates each surah with ONE child's status. That is the
       point for a child and meaningless for a class, so the class borrows
       the first student's list for its names and hides the status. Showing
       one child's "needs review" against everyone's homework would be a
       quiet lie. */
    api.read("api_mushaf", { p_student: ids[0], p_juz: null }).then(function (list) {
      var rows = list.map(function (x) {
        // The number matters: teachers say "surah 78", parents' mushafs are
        // numbered, and it is also the fastest thing to type into the filter.
        return '<label class="trow" style="cursor:pointer">' +
          '<input type="' + (multi ? "checkbox" : "radio") + '" name="sp" value="' + x.surah +
          '" data-ayat="' + x.ayat + '" style="width:18px;height:18px">' +
          '<span class="snum">' + x.surah + '</span>' +
          '<span class="lbl"><span class="ar" dir="rtl">' + esc(x.name_ar) +
          '</span><span>' + esc(x.name_en) + '</span></span><span class="dt">' + x.ayat + ' ' + T("ayat") +
          ((!target && x.status && x.status !== "not_started") ? ' · ' + esc(x.status) : '') + '</span></label>';
      }).join("");
      $("shBody").innerHTML =
        (target && target.note
          ? '<div class="note" style="margin:0 0 10px">' + esc(target.note) + '</div>' : '') +
        '<input id="spFilter" type="search" placeholder="' + esc(T("findSurah")) + '" style="width:100%;padding:10px;margin-bottom:10px;' +
        'border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);font-size:15px">' +
        (multi ? '<div class="note" style="margin:0 0 8px;font-size:12.5px">' + esc(T("spMulti")) + '</div>' : '') +
        '<div class="tree" style="max-height:260px;overflow:auto" id="spList">' + rows + '</div>' +
        /* Labels, not placeholders. A placeholder disappears the moment you
           type, so you cannot check afterwards which box you put which number
           in — and until now these two said "from ayah" and "to ayah" in
           English even when the whole app was in Arabic, which is how
           An-Naba came to be assigned as 20-1. */
        '<div id="spNarrow" hidden>' +
          '<div class="narrowh">' + esc(T("spNarrow")) + '</div>' +
          '<div class="fieldrow">' +
            '<label class="fld"><span>' + esc(T("spFromAyah")) + '</span>' +
              '<input id="spFrom" type="number" min="1" inputmode="numeric"></label>' +
            '<label class="fld"><span>' + esc(T("spToAyah")) + '</span>' +
              '<input id="spTo" type="number" min="1" inputmode="numeric"></label>' +
          '</div>' +
          '<div class="fieldrow" id="spPageRow">' +
            '<label class="fld"><span>' + esc(T("spFromPage")) + '</span>' +
              '<select id="spPageFrom"></select></label>' +
            '<label class="fld"><span>' + esc(T("spToPage")) + '</span>' +
              '<select id="spPageTo"></select></label>' +
          '</div>' +
          '<div class="note warn" id="spPageWhy" hidden ' +
            'style="margin:2px 0 6px;font-size:12.5px"></div>' +
          '<div class="note" id="spSum" style="margin:2px 0 0;font-size:12.5px"></div>' +
        '</div>';
      $("shOk").hidden = false;
      // The count on the button is the number of CHILDREN this will reach.
      $("shOk").textContent = T("add") + (target ? " (" + ids.length + ")" : "");

      function chosen() {
        return Array.prototype.slice.call($("spList").querySelectorAll('input[name=sp]:checked'));
      }
      /* Everything the narrowing block shows is derived from one place: the
         ayah boxes. The page dropdowns write into them and then this runs, so
         the two can never say different things. */
      function refresh() {
        var sel = chosen();
        var one = sel.length === 1 ? sel[0] : null;
        $("spNarrow").hidden = !one;
        if (!one) return;
        var ayat = +one.dataset.ayat;
        var lo = +$("spFrom").value || 1, hi = +$("spTo").value || ayat;
        var bad = lo < 1 || hi > ayat || lo > hi;
        $("spSum").className = "note" + (bad ? " warn" : "");
        $("spSum").textContent = bad
          ? T("spBad").split("{n}").join(ayat)
          : (lo === 1 && hi === ayat ? T("wholeSurah") + " · " + ayat + " " + T("ayat")
             : lo + "–" + hi + " " + T("ofAyat").split("{n}").join(ayat));
      }
      function loadPages(surah, ayat) {
        api.read("api_surah_pages", { p_surah: +surah }).then(function (d) {
          detail = d;
          var opts = (d.pages || []).map(function (pg) {
            return '<option value="' + pg.page + '" data-lo="' + pg.ayah_from +
                   '" data-hi="' + pg.ayah_to + '">' + T("spPage") + " " + pg.page + '</option>';
          }).join("");
          $("spPageFrom").innerHTML = opts;
          $("spPageTo").innerHTML = opts;
          if (d.pages && d.pages.length) {
            $("spPageTo").selectedIndex = d.pages.length - 1;
          }
          // One page means a page picker that can only say one thing.
          $("spPageRow").hidden = !(d.pages && d.pages.length > 1);
          $("spPageWhy").hidden = true;
        }).catch(function (e) {
          /* This used to hide the row and say nothing. The whole feature
             then vanished with no clue as to why — which is how it went
             unexplained for two weeks of real use. A failure that tells
             nobody is worse than a failure. The ayah boxes still work, so
             say that too rather than leaving a teacher stuck. */
          $("spPageRow").hidden = true;
          $("spPageWhy").hidden = false;
          $("spPageWhy").textContent = T("spPageFail") + " " +
            ((e && (e.message || e.hint)) || T("spPageFailWhy"));
        });
      }
      function fromPages() {
        var a = $("spPageFrom").selectedOptions[0], b2 = $("spPageTo").selectedOptions[0];
        if (!a || !b2) return;
        // Picked backwards: take what they span rather than refusing.
        var lo = Math.min(+a.dataset.lo, +b2.dataset.lo);
        var hi = Math.max(+a.dataset.hi, +b2.dataset.hi);
        $("spFrom").value = lo; $("spTo").value = hi;
        refresh();
      }

      $("spFilter").oninput = function () {
        var q = this.value.toLowerCase();
        $("spList").querySelectorAll(".trow").forEach(function (r) {
          r.style.display = r.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      };
      $("spList").onchange = function (e) {
        var r = e.target.closest(".trow");
        if (r) {
          $("spList").querySelectorAll(".trow").forEach(function (x) {
            var i = x.querySelector("input"); x.classList.toggle("on", !!(i && i.checked));
          });
        }
        var sel = chosen();
        if (sel.length === 1) {
          $("spFrom").value = ""; $("spTo").value = "";
          loadPages(sel[0].value, +sel[0].dataset.ayat);
          /* Choosing a surah writes its name into the search box, which both
             confirms the choice and collapses the list to it. Only for the
             single-pick case: collapsing the list while someone is ticking
             five surahs would hide the four they already have. */
          if (!multi) {
            var name = sel[0].closest(".trow").querySelector(".lbl span:last-child");
            if (name) { $("spFilter").value = name.textContent.trim(); $("spFilter").oninput(); }
          }
        }
        refresh();
      };
      ["spFrom", "spTo"].forEach(function (id) { $(id).oninput = refresh; });
      ["spPageFrom", "spPageTo"].forEach(function (id) { $(id).onchange = fromPages; });

      $("shOk").onclick = function () {
        var sel = chosen();
        if (!sel.length) { toast(T("spPickOne")); return; }
        var surahs = sel.map(function (x) { return +x.value; });
        var from = null, to = null;
        if (sel.length === 1) {
          var ayat = +sel[0].dataset.ayat;
          from = $("spFrom").value ? +$("spFrom").value : null;
          to   = $("spTo").value   ? +$("spTo").value   : null;
          if (from != null || to != null) {
            var lo = from == null ? 1 : from, hi = to == null ? ayat : to;
            // The server refuses this too — this is so the teacher is told
            // before the sheet closes, next to the boxes they typed into.
            if (lo < 1 || hi > ayat || lo > hi) {
              $("spSum").className = "note warn";
              $("spSum").textContent = T("spBad").split("{n}").join(ayat);
              return;
            }
            from = lo; to = hi;
            if (lo === 1 && hi === ayat) { from = null; to = null; }
          }
        }
        assignHomework({
          p_students: ids, p_kind: kind,
          p_surahs: surahs, p_from: from, p_to: to
        }, who, done);
        return false;
      };
    }).catch(fail);
  }

  /* F3 · setting the same passage twice.
     The database refuses the first attempt and hands back exactly who already
     has an overlapping passage open. That comes back as ok:false, not as an
     error, so it needs checking for rather than catching — and the second
     attempt carries p_confirm, which is the only difference between them.
     Sometimes assigning it again IS the point, so this warns and never
     blocks. */
  function assignHomework(args, label, onDone) {
    return api.write("api_assign_homework", args, label).then(function (r) {
      if (r && r.ok === false && r.error === "duplicate") {
        var d = r.duplicates || [];
        sheet(T("dupTitle"),
          '<div style="font-size:13.5px;line-height:1.6;margin-bottom:10px">' +
            T("dupBody", { n: d.length }) + '</div>' +
          '<div class="card">' + d.map(function (x) {
            return '<div class="irow"><div class="lab">' +
              '<span class="tr">' + esc(x.name) + '</span>' +
              '<span class="m">' + esc(x.kind === "memorise" ? T("gNew") : T("gDue")) +
                " · " + x.from + "–" + x.to +
                (x.set_on ? " · " + i18n.fmtDate(x.set_on) : "") + '</span>' +
              '</div></div>';
          }).join("") + '</div>',
          T("dupAnyway"), function () {
            closeSheet();
            var again = {};
            for (var k in args) if (args.hasOwnProperty(k)) again[k] = args[k];
            again.p_confirm = true;
            api.write("api_assign_homework", again, label)
              .then(function () { if (onDone) onDone(); }).catch(fail);
            return false;
          });
        return null;
      }
      if (onDone) onDone();
      return r;
    });
  }

  /* B3 · "Full mushaf" used to open the same surah picker as "Add old
     memorization" — a button that lied about what it did, which is worse
     than one that is missing. It now opens the thing it always named. */
  $("openTree").onclick = function () {
    if (!S.student) return;
    window.SijillMushaf.open(S.student.id, S.studentData && S.studentData.student
      ? S.studentData.student.name : S.student.name);
  };
  $("mtBack").onclick = function () {
    show("v-student");
    // Coming back from the audit, the child's page is out of date by
    // definition — that is what the audit just changed.
    reloadStudent().catch(function () {});
  };

  /* ------------------------------------------------------------ whole class */
  /* Homework for everyone. The kind is asked first, as two buttons, rather
     than hidden in a dropdown inside the picker — partly because two big
     targets beat a select on a phone, and mostly because it lets the class
     open the SAME picker the student page opens, multi-select and page
     numbers and all, instead of a second one that has to be kept in step. */
  $("bulkHw").onclick = function () {
    if (!S.dayData || !S.dayData.students || !S.dayData.students.length) return;
    var ids = S.dayData.students.map(function (s) { return s.id; });

    function open(kind) {
      pickSurah(kind, {
        ids: ids,
        label: T("bulkWho"),
        // The count lives on the Add button, where the thumb is, and not
        // also in the title: two identical numbers on one sheet invite the
        // reading that one of them counts surahs.
        title: (kind === "memorise" ? T("bulkTitleNew") : T("bulkTitleRev")),
        note: T("bulkNote"),
        onDone: function () { closeSheet(); toast(T("savedAll")); refreshDay(); }
      });
    }

    sheet(T("bulkHw").replace("+ ", ""),
      '<div class="note" style="margin-bottom:12px">' + esc(T("bulkNote")) + '</div>' +
      '<div class="kindpick">' +
        '<button class="btn" id="bkNew">' + esc(T("bulkKindNew")) + '</button>' +
        '<button class="btn" id="bkRev">' + esc(T("bulkKindRev")) + '</button>' +
      '</div>',
      null, null, T("cancel"));
    $("shTitle").textContent = T("bulkKind");
    $("bkNew").onclick = function () { open("memorise"); };
    $("bkRev").onclick = function () { open("review"); };
  };

  /* ------------------------------------------------------------ chrome */
  $("backCls2").onclick = function () { S.readOnly = false; openClasses(); };

  function doSignOut() {
    api.rpc("api_sign_out", { p_token: api.getToken() }).catch(function () {});
    api.setToken(null); S.me = null; show("v-gate");
  }
  $("whoAmI").onclick = function () {
    api.read("api_whoami").then(function (me) { S.me = me; pickWho(me.teachers || []); }).catch(fail);
  };
  $("lang").onclick = function () {
    i18n.setLang(i18n.isAr() ? "en" : "ar");
  };
  window.addEventListener("sijill:lang", function () {
    if (S.dayData && !$("v-class").hidden) renderDay();
    if (S.studentData && !$("v-student").hidden) renderStudent();
  });
  $("theme").onclick = function () {
    var r = document.documentElement;
    var dark = r.getAttribute("data-theme") === "dark" ||
      (!r.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    r.setAttribute("data-theme", dark ? "light" : "dark");
    try { localStorage.setItem("sijill.theme", dark ? "light" : "dark"); } catch (e) {}
  };

  /* ----------------------------------------------------- settings sheet */
  /* Sign out used to sit at the foot of the register next to Coordinator
     tools. A mis-tap there means re-typing the school passphrase with a child
     standing in front of you, so it now lives behind the ⚙ and asks first.
     Language and theme come with it, which gives the register back the strip
     of screen the old bottom bar was holding. */
  function openSettings() {
    var ar = i18n.isAr();
    var body = document.createElement("div");
    body.innerHTML =
      '<div class="setrow"><span>' + (ar ? "اللُّغَة" : "Language") + '</span>' +
        '<span id="slotLang"></span></div>' +
      '<div class="setrow"><span>' + (ar ? "المَظْهَر" : "Appearance") + '</span>' +
        '<span id="slotTheme"></span></div>' +
      // The guide is a page in the app rather than a file in somebody's
      // WhatsApp history, because the moment a teacher needs it is mid-class
      // with the app already open.
      '<div class="setrow"><span>' + (ar ? "دَلِيلُ المُعَلِّم" : "Teacher's guide") + '</span>' +
        '<a class="mini" id="setGuide" href="guide.html" target="_blank" rel="noopener">' +
          (ar ? "افْتَحْ" : "Open") + ' ›</a></div>' +
      '<div class="setrow"><span>' + (ar ? "أَدَوَاتُ المُنَسِّق" : "Coordinator tools") + '</span>' +
        '<button class="mini" id="setCoord">' + (ar ? "افْتَحْ" : "Open") + ' ›</button></div>' +
      '<div class="setrow"><span>' + (ar ? "الخُرُوج" : "Sign out") + '</span>' +
        '<button class="mini danger" id="setOut">' + (ar ? "اخْرُجْ" : "Sign out") + '</button></div>' +
      '<div class="note" style="margin-top:12px">' +
        (ar ? "الخُرُوجُ يَعْنِي إِدْخَالَ كَلِمَةِ المَدْرَسَةِ مِنْ جَدِيد."
            : "Signing out means typing the school passphrase again.") + '</div>';

    sheet(ar ? "الإِعْدَادَات" : "Settings", "", null, null, ar ? "تَمَّ" : "Done");
    var host = $("shBody");
    host.innerHTML = ""; host.appendChild(body);
    // Borrow the real buttons rather than drawing new ones — see index.html.
    body.querySelector("#slotLang").appendChild($("lang"));
    body.querySelector("#slotTheme").appendChild($("theme"));
    body.querySelector("#setCoord").onclick = function () {
      returnChrome(); closeSheet();
      if (window.SijillCoord) window.SijillCoord.enter();
    };
    body.querySelector("#setOut").onclick = function () {
      returnChrome(); closeSheet();
      sheet(ar ? "الخُرُوجُ مِنَ الحِسَاب؟" : "Sign out?",
        '<div style="font-size:13.5px;line-height:1.55">' +
        (ar ? "سَتَحْتَاجُ إِلَى كَلِمَةِ المَدْرَسَةِ لِلدُّخُولِ مَرَّةً أُخْرَى."
            : "You will need the school passphrase to get back in.") + '</div>',
        ar ? "اخْرُجْ" : "Sign out", function () { closeSheet(); doSignOut(); });
    };
  }
  /* The borrowed buttons have to go home, or the next setLang() writes the
     language onto a node that is no longer in the page. */
  function returnChrome() {
    var f = $("footerBtns");
    if (!f) return;
    var l = $("lang"), t2 = $("theme");
    if (l && l.parentNode !== f) f.appendChild(l);
    if (t2 && t2.parentNode !== f) f.appendChild(t2);
  }
  /* Every screen gets the same way into settings. The mushaf screen had none,
     which meant a teacher deep in the audit had no way to switch language or
     reach the coordinator tools without navigating back out first. */
  ["gear", "gearStu", "gearCoord", "gearMushaf"].forEach(function (id) {
    var el = $(id); if (el) el.onclick = openSettings;
  });
  window.SijillReturnChrome = returnChrome;

  /* The lockup carries the school's name in BOTH scripts at once, the way
     the school's website does, so it is written into the markup rather than
     translated. config.SCHOOL_NAME is the one thing that overrides it, for
     anyone running this for a different school — and only then, or we would
     write the Arabic name into the English line and print it twice. */
  function setSchoolName() {
    var n = api.config && api.config.SCHOOL_NAME;
    if (!n) return;
    Array.prototype.forEach.call(document.querySelectorAll(".schoolname"),
      function (el) { el.textContent = n; });
  }

  /* ------------------------------------------------------------ start up */
  function startup() {
    setSchoolName();
    window.addEventListener("sijill:lang", setSchoolName);
    $("envTag").textContent = api.config.DEV ? "SIJILL · LOCAL TEST" : "SIJILL";
    try {
      var th = localStorage.getItem("sijill.theme");
      if (th) document.documentElement.setAttribute("data-theme", th);
    } catch (e) {}
    i18n.setLang(i18n.lang);

    if (!api.getToken()) { show("v-gate"); return; }
    api.rpc("api_whoami", { p_token: api.getToken() }).then(function (me) {
      if (!me || !me.signed_in) { api.setToken(null); show("v-gate"); return; }
      S.me = me;
      if (!me.teacher_id) { pickWho(me.teachers || []); return; }
      openClasses();
    }).catch(function () { show("v-gate"); });
  }

  window.SijillApp   = { S: S, startup: startup, openClasses: openClasses,
                       refreshDay: refreshDay,
                       // exposed so the suite can put a day into a state the
                       // fixture cannot easily reach (a cancelled one) and see
                       // what the screen decides
                       renderClassNote: renderClassNote };
  window.SijillSheet = sheet;
  window.SijillCloseSheet = closeSheet;
  window.SijillToast = toast;

  /* Opening a child from the coordinator's table. There is no class in
     progress there, so nothing can be graded — the sheet opens read-only and
     the grade buttons are left off rather than shown and then failing. */
  window.SijillOpenStudentById = function (id) {
    S.pulled = {};
    S.readOnly = true;
    openStudent({ id: id, name: "…" });
  };
  startup();
})();
