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
  function show(id) {
    ["v-gate","v-who","v-class","v-student","v-coord"].forEach(function (v) {
      $(v).hidden = (v !== id);
    });
    window.scrollTo(0, 0);
  }
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
    $("shNo").textContent = noLabel || T("cancel");
    s.hidden = false;
    $("shOk").onclick = function () { if (onOk && onOk() !== false) s.hidden = true; };
    $("shNo").onclick = function () { s.hidden = true; };
    return s;
  }
  function closeSheet() { $("sheet").hidden = true; }

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
      '<input id="newName" type="text" placeholder="Full name" style="width:100%;padding:12px;font-size:16px;' +
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
    $("whoAmI").textContent = (S.me && S.me.teacher) || "—";
    $("goCoord").hidden = false;
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
    $("clsTitle").textContent = d["class"].name;
    $("clsDate").textContent = i18n.fmtDate(d.session.held_on, true) +
      " · " + d.students.length + " " + (ar ? "طُلَّاب" : "students") +
      (d.session.status === "cancelled" ? " · " + (ar ? "مُغْلَقَة" : "closed") : "");

    $("slist").innerHTML = d.students.map(function (s, i) {
      var reasonIdx = Math.max(0, REASONS.findIndex(function (r) { return r[0] === s.state; }));
      var flag = s.flags && s.flags.kind
        ? '<span class="pill ' + s.flags.kind + '"><i></i>' + esc(s.flags.message) + '</span>' : "";
      return '' +
      '<div class="srow ' + (isAbsent(s.state) ? "absent" : "") + '" data-i="' + i + '">' +
        '<button class="nmb"><span class="nm">' + esc(s.name) + '</span><span class="meta">' +
          (s.due ? s.due + " " + T("dueback") + " · " : "") +
          (s.last_heard ? T("heard") + " " + i18n.fmtDate(s.last_heard) : T("never")) +
          (isAbsent(s.state) ? ' <span class="pill ' + (isExcused(s.state) ? "exc" : "crit") + '"><i></i>' +
              esc(ar ? REASONS[reasonIdx][2] : REASONS[reasonIdx][1]) + '</span>' : "") +
          flag +
          (isAbsent(s.state) ? ' <span class="pill mute"><i></i>' + esc(T("carries")) + '</span>' : "") +
          (s.recited ? ' <span class="pill ok"><i></i>' + esc(T("recited")) + '</span>' : "") +
        '</span></button>' +
        '<div class="seg3">' +
          '<button class="p" data-a="present" aria-pressed="' + (s.state === "present") + '">✓</button>' +
          '<button class="l" data-a="late" aria-pressed="' + (s.state === "late") + '">L</button>' +
          '<button class="a' + (isExcused(s.state) ? " exc" : "") + '" data-a="absent" aria-pressed="' + isAbsent(s.state) + '">✗</button>' +
        '</div>' +
      '</div>' +
      '<div class="reasons" data-r="' + i + '"' + (isAbsent(s.state) ? "" : " hidden") + '>' +
        REASONS.map(function (r, j) {
          return '<button class="chip ' + (r[3] ? "ex" : "un") + '" data-j="' + j + '" aria-pressed="' +
            (s.state === r[0]) + '">' + esc(ar ? r[2] : r[1]) + '</button>';
        }).join("") +
      '</div>';
    }).join("") || '<div class="empty">Nobody is enrolled in this class.</div>';

    // "3 of 8 not yet marked" — Tarek asked for this up top and very visible
    var done = d.students.filter(function (s) { return s.state && s.recited > 0; }).length;
    var tot = d.students.length;
    $("doneBar").innerHTML = (tot && done >= tot)
      ? '<div class="donebar all"><span class="big">✓</span><div><div>' + esc(T("doneAll")) + '</div>' +
        '<div style="font-weight:400;font-size:12.5px;color:var(--ink-2)">' + T("doneAllSub", { n: tot }) + '</div></div></div>'
      : '<div class="donebar part"><span class="big">' + (tot - done) + '</span><div><div>' +
        T("donePart", { n: tot }) + '</div>' +
        '<div style="font-weight:400;font-size:12.5px;color:var(--ink-2)">' + T("donePartSub") + '</div></div></div>';

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
    var nm = e.target.closest(".nmb");
    if (nm) openStudent(S.dayData.students[+nm.closest(".srow").dataset.i]);
  });

  function mark(s, state) {
    var was = s.state, wasReason = s.reason;
    s.state = state; renderDay();
    S.undo = { label: s.name, fn: function () { return mark(s, was); } };
    $("undoBtn").disabled = false;
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
    $("undoBtn").disabled = false;
    api.write("api_mark_all_present", { p_session: S.dayData.session.id }, T("markAll"))
      .then(refreshDay).catch(fail);
  };

  $("undoBtn").onclick = function () {
    if (!S.undo) return;
    var u = S.undo; S.undo = null; $("undoBtn").disabled = true;
    Promise.resolve(u.fn()).then(refreshDay);
  };

  /* ------------------------------------------------------- student sheet */
  function openStudent(s) {
    S.student = s;
    show("v-student");
    $("stuName").textContent = s.name;
    $("stuSub").textContent = "—";
    $("stuBody").innerHTML = '<div class="loading"><span class="spin"></span></div>';
    api.read("api_student", { p_student: s.id, p_history: 4 })
      .then(function (d) { S.studentData = d; renderStudent(); }).catch(fail);
  }
  $("backCls").onclick = function () {
    if (S.readOnly) { S.readOnly = false; return window.SijillCoord.open(); }
    show("v-class"); refreshDay();
  };

  function surahLabel(x) {
    var ar = '<span class="ar" dir="rtl">' + esc(x.name_ar) + "</span>";
    var en = '<span class="tr">' + esc(x.name_en) + rangeLabel(x) + "</span>";
    return ar + en;
  }
  function rangeLabel(x) {
    if (x.ayah_from == null && x.ayah_to == null) return "";
    if (x.whole_surah) return "";
    return " " + x.ayah_from + "–" + x.ayah_to;
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
    if (f.kind) {
      html += '<div class="banner ' + f.kind + '"><span class="ic">●</span><div><b>' +
              esc(f.message) + '.</b></div></div>';
    }

    html += group(T("gDue"), d.due_back, "noneDue", "due");
    html += group(T("gNew"), d.new_memorisation, "noneNew", "new");
    html += (S.readOnly ? '<div class="note" style="margin-bottom:16px">Viewing from the coordinator ' +
              'screen, so nothing here can be marked. Open the class to record a recitation.</div>'
            : '<div class="actionrow" style="margin:-6px 0 14px">' +
              '<button class="btn ghost sm" id="assignNew">' + esc(T("assignNew")) + '</button>' +
              '<button class="btn ghost sm" id="addReview">' + esc(T("addReview")) + '</button></div>' +
              '<div class="note" style="margin-bottom:16px">' + T("markKey") + '</div>');

    // homework for next week
    var hw = (d.due_back || []).concat(d.new_memorisation || []);
    html += '<div class="grp"><div class="grph"><h2>' + esc(T("nextWeek")) + '</h2>' +
            '<span class="n">' + hw.length + '</span></div><div class="hwbox">' +
            (hw.length ? hw.map(function (h) {
              return '<div class="kv" style="border-color:transparent"><span>' +
                '<b style="font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3)">' +
                  (h.kind === "memorise" ? esc(ar ? "لِلْحِفْظ" : "Memorize") : esc(ar ? "لِلْمُرَاجَعَة" : "Review")) +
                '</b>&nbsp;<span class="ar" style="font-family:var(--serif);font-size:18px;font-weight:700">' +
                esc(h.name_ar) + '</span> <span style="color:var(--ink-2)">' + esc(h.name_en) + rangeLabel(h) + '</span></span>' +
                '<span>' + (h.source === "auto"
                  ? '<span class="pill late"><i></i>' + (ar ? "مِنْ ↻ إِعَادَة" : "from ↻ repeat") + '</span>'
                  : '<span class="pill mute"><i></i>' + (ar ? "أَضَافَهُ المُعَلِّم" : "set by teacher") + '</span>') +
                ' <button class="gb note hw-edit" data-hw="' + esc(h.homework_id) + '" title="Change or remove"' +
                ' style="width:28px;height:26px;font-size:11px">✎</button></span></div>';
            }).join("") : '<div style="font-size:13.5px">' + esc(T("noneHw")) + '</div>') +
            '</div><div style="height:8px"></div><div class="note">' + T("hwHint") + '</div></div>';

    // recent classes
    html += '<div class="grp"><div class="grph"><h2>' + esc(T("recentCls")) + '</h2>' +
            '<span class="n">' + (d.history || []).length + '</span></div><div class="card">' +
            ((d.history || []).length ? d.history.map(function (h) {
              var recited = (h.recited || []).map(function (r) {
                return esc(r.name_en) + (r.ayah_from ? " " + r.ayah_from + "–" + r.ayah_to : "") +
                       (r.outcome === "repeat" ? " ↻" : r.outcome === "not_prepared" ? " –" : " ✓");
              }).join(" · ");
              var notes = (h.notes || []).map(function (n) {
                return '<span style="font-size:12.5px;color:var(--ink-2);font-style:italic">“' +
                  esc(n.body) + '”' + (n.by ? ' <span style="font-style:normal;color:var(--ink-3)">— ' + esc(n.by) + '</span>' : '') + '</span>';
              }).join("<br>");
              return '<div class="irow" style="align-items:flex-start"><div class="lab" style="gap:4px">' +
                '<span class="tr" style="font-size:13.5px">' + i18n.fmtDate(h.held_on, true) +
                (h.status === "cancelled" ? ' <span class="pill mute"><i></i>' + (ar ? "مُغْلَقَة" : "closed") + '</span>' : '') +
                (h.attendance && h.attendance.indexOf("absent") === 0
                  ? ' <span class="pill ' + (h.attendance === "absent_unjustified" ? "crit" : "exc") + '"><i></i>' +
                    (ar ? "غَائِب" : "absent") + '</span>' : '') + '</span>' +
                (recited ? '<span class="m">' + recited + '</span>' : '') +
                (notes || '') +
                (h.by ? '<span class="m" style="opacity:.8">' + (ar ? "سَجَّلَ" : "marked by") + ' ' + esc(h.by) + '</span>' : '') +
                '</div></div>';
            }).join("") : '<div class="empty">' + esc(T("noneHist")) + '</div>') + '</div></div>';

    // rotation, oldest first
    html += '<div class="grp"><div class="grph"><h2>' + esc(T("gRot")) + '</h2>' +
            '<span class="n">' + (d.rotation || []).length + '</span></div><div class="card">' +
            ((d.rotation || []).length ? d.rotation.slice(0, 12).map(function (r) {
              return itemRow(r, "rot");
            }).join("") : '<div class="empty">—</div>') + '</div></div>';

    $("stuBody").innerHTML = html;
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
        ? T("heard") + " " + i18n.fmtDate(x.last_heard) + (x.weeks != null ? " · " + x.weeks + " " + T("weeks") : "")
        : T("never");
    } else {
      meta = (x.set_on ? i18n.fmtDate(x.set_on) : "") + (x.source === "auto" ? " · ↻" : "");
    }
    var stale = (kind === "rot" && (x.weeks == null || x.weeks >= 4)) ? " stale" : "";
    // 'grad' marks a row that can be graded. The history rows below reuse
    // .irow for looks but carry no buttons, and without a separate class a
    // tap (or a test) can aim at the wrong one.
    return '<div class="irow grad" data-surah="' + x.surah + '"' +
      ' data-from="' + (x.ayah_from == null ? "" : x.ayah_from) + '"' +
      ' data-to="' + (x.ayah_to == null ? "" : x.ayah_to) + '"' +
      ' data-kind="' + (kind === "new" ? "new" : "review") + '">' +
      '<div class="lab"><span class="ar" dir="rtl">' + esc(x.name_ar) + '</span>' +
      '<span class="tr">' + esc(x.name_en) + rangeLabel(x) + '</span>' +
      '<span class="m' + stale + '">' + esc(meta) + '</span></div>' +
      (S.readOnly ? '' :
        '<button class="gb note" data-note="1" title="Note">✎</button>' +
        '<button class="gb g" data-g="good" title="Recited well">✓</button>' +
        '<button class="gb g" data-g="repeat" title="More than 3 mistakes">↻</button>' +
        '<button class="gb g" data-g="not_prepared" title="Had not prepared it">–</button>') +
      '</div>';
  }

  function wireStudent() {
    $("stuBody").querySelectorAll(".gb.g").forEach(function (b) {
      b.onclick = function () {
        var row = b.closest(".irow");
        var cls = { good: "on-ok", repeat: "on-rev", not_prepared: "on-np" }[b.dataset.g];
        row.querySelectorAll(".gb").forEach(function (x) { x.classList.remove("on-ok","on-rev","on-np"); });
        b.classList.add(cls);
        api.write("api_record", {
          p_session: S.dayData.session.id,
          p_student: S.student.id,
          p_kind: row.dataset.kind === "new" ? "new" : "review",
          p_surah: +row.dataset.surah,
          p_from: row.dataset.from === "" ? null : +row.dataset.from,
          p_to:   row.dataset.to   === "" ? null : +row.dataset.to,
          p_outcome: b.dataset.g,
          p_note: null
        }, S.student.name).then(function () {
          return api.read("api_student", { p_student: S.student.id, p_history: 4 });
        }).then(function (d) { S.studentData = d; renderStudent(); }).catch(fail);
      };
    });
    $("stuBody").querySelectorAll('.gb.note[data-note]').forEach(function (b) {
      b.onclick = function () {
        var row = b.closest(".irow");
        noteSheet(+row.dataset.surah);
      };
    });
    /* The pencil on a homework line. It was a button that did nothing, which
       is worse than no button — a teacher taps it, nothing happens, and they
       stop trusting the rest of the screen. */
    $("stuBody").querySelectorAll(".hw-edit").forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        editHomework(b.dataset.hw);
      };
    });
    var an = $("assignNew"), ad = $("addReview");
    if (an) an.onclick = function () { pickSurah("memorise"); };
    if (ad) ad.onclick = function () { pickSurah("review"); };
  }

  function editHomework(id) {
    var ar = i18n.isAr();
    sheet(ar ? "تَعْدِيلُ الوَاجِب" : "Change this homework",
      '<div class="filters" style="margin:0 0 10px">' +
      '<input id="hwFrom" class="mini" style="width:100px" placeholder="from ayah">' +
      '<input id="hwTo" class="mini" style="width:100px" placeholder="to ayah"></div>' +
      '<input id="hwNote" placeholder="' + (ar ? "مُلَاحَظَة لِلْأُسْرَة" : "A note for the family") + '" ' +
      'style="width:100%;padding:11px;font-size:15px;border:1px solid var(--line);border-radius:10px;' +
      'background:var(--surface);color:var(--ink)">' +
      '<div class="note" style="margin-top:10px">' +
      (ar ? "اتْرُكِ الحُقُولَ فَارِغَةً لِتُبْقِيَهَا كَمَا هِيَ."
          : "Leave a box empty to keep what is already there.") + '</div>' +
      '<div class="actionrow" style="margin-top:12px">' +
      '<button class="btn ghost sm" id="hwRemove" style="border-color:var(--crit);color:var(--crit)">' +
      (ar ? "حَذْفُ هَذَا الوَاجِب" : "Remove this homework") + '</button></div>',
      T("save"), function () {
        api.write("api_edit_homework", {
          p_id: id,
          p_from: $("hwFrom").value ? +$("hwFrom").value : null,
          p_to:   $("hwTo").value   ? +$("hwTo").value   : null,
          p_note: $("hwNote").value || null, p_remove: false
        }, S.student.name).then(reloadStudent).catch(fail);
        return true;
      });
    setTimeout(function () {
      var r = $("hwRemove"); if (!r) return;
      r.onclick = function () {
        api.write("api_edit_homework", { p_id: id, p_remove: true }, S.student.name)
          .then(function () { closeSheet(); return reloadStudent(); }).catch(fail);
      };
    }, 40);
  }

  function reloadStudent() {
    return api.read("api_student", { p_student: S.student.id, p_history: 4 })
      .then(function (d) { S.studentData = d; renderStudent(); });
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
          .then(function () { closeSheet(); toast(T("savedAll")); })
          .catch(fail);
        return false;
      });
  }

  /* Pick a surah to assign. Loads the real mushaf from the database. */
  function pickSurah(kind) {
    sheet(kind === "memorise" ? T("assignNew") : T("addReview"),
      '<div class="loading"><span class="spin"></span></div>', null, null, T("cancel"));
    api.read("api_mushaf", { p_student: S.student.id, p_juz: null }).then(function (list) {
      var rows = list.map(function (x) {
        return '<label class="trow" style="cursor:pointer"><input type="radio" name="sp" value="' + x.surah +
          '" style="width:18px;height:18px"><span class="lbl"><span class="ar" dir="rtl">' + esc(x.name_ar) +
          '</span><span>' + esc(x.name_en) + '</span></span><span class="dt">' + x.ayat + ' ' + T("ayat") +
          (x.status && x.status !== "not_started" ? ' · ' + esc(x.status) : '') + '</span></label>';
      }).join("");
      $("shBody").innerHTML =
        '<input id="spFilter" type="search" placeholder="Find a surah" style="width:100%;padding:10px;margin-bottom:10px;' +
        'border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);font-size:15px">' +
        '<div class="filters" style="margin:0 0 8px"><input id="spFrom" class="mini" style="width:90px" placeholder="from ayah">' +
        '<input id="spTo" class="mini" style="width:90px" placeholder="to ayah">' +
        '<span class="mini" style="border:0;background:none">' + esc(T("wholeSurah")) + ' = leave blank</span></div>' +
        '<div class="tree" style="max-height:300px;overflow:auto" id="spList">' + rows + '</div>';
      $("shOk").hidden = false;
      $("shOk").textContent = T("add");
      $("spFilter").oninput = function () {
        var q = this.value.toLowerCase();
        $("spList").querySelectorAll(".trow").forEach(function (r) {
          r.style.display = r.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      };
      $("shOk").onclick = function () {
        var sel = $("shBody").querySelector('input[name=sp]:checked');
        if (!sel) { toast("Pick a surah first."); return; }
        var from = $("spFrom").value ? +$("spFrom").value : null;
        var to   = $("spTo").value   ? +$("spTo").value   : null;
        api.write("api_assign_homework", {
          p_students: [S.student.id], p_kind: kind, p_surah: +sel.value,
          p_from: from, p_to: to, p_note: null
        }, S.student.name).then(function () {
          closeSheet();
          return api.read("api_student", { p_student: S.student.id, p_history: 4 });
        }).then(function (d) { S.studentData = d; renderStudent(); }).catch(fail);
      };
    }).catch(fail);
  }

  $("openTree").onclick = function () { if (S.student && !S.readOnly) pickSurah("review"); };

  /* ------------------------------------------------------------ whole class */
  $("bulkHw").onclick = function () {
    if (!S.dayData) return;
    var ids = S.dayData.students.map(function (s) { return s.id; });
    sheet(T("bulkHw").replace("+ ", ""),
      '<div class="note" style="margin-bottom:10px">' +
      (i18n.isAr()
        ? "يُنْشَأُ وَاجِبٌ مُنْفَصِلٌ لِكُلِّ طَالِب، فَيُمْكِنُ تَعْدِيلُ أَيِّ وَاحِدٍ لَاحِقًا."
        : "This creates a separate homework item for each student, so you can still change any one of them afterwards. Absent students are included — they keep the same homework.") +
      '</div><div class="loading"><span class="spin"></span></div>', null, null, T("cancel"));
    api.read("api_mushaf", { p_student: S.dayData.students[0].id, p_juz: null }).then(function (list) {
      $("shBody").innerHTML =
        '<div class="filters" style="margin:0 0 10px">' +
        '<select id="bkKind" class="mini"><option value="memorise">' + (i18n.isAr() ? "حِفْظٌ جَدِيد" : "New memorization") +
        '</option><option value="review">' + (i18n.isAr() ? "مُرَاجَعَة" : "Review") + '</option></select>' +
        '<input id="bkFrom" class="mini" style="width:86px" placeholder="from ayah">' +
        '<input id="bkTo" class="mini" style="width:86px" placeholder="to ayah"></div>' +
        '<input id="bkFilter" type="search" placeholder="Find a surah" style="width:100%;padding:10px;margin-bottom:8px;' +
        'border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink)">' +
        '<div class="tree" style="max-height:220px;overflow:auto" id="bkList">' +
        list.map(function (x) {
          return '<label class="trow" style="cursor:pointer"><input type="radio" name="bk" value="' + x.surah +
            '" style="width:18px;height:18px"><span class="lbl"><span class="ar" dir="rtl">' + esc(x.name_ar) +
            '</span><span>' + esc(x.name_en) + '</span></span></label>';
        }).join("") + '</div>';
      $("bkFilter").oninput = function () {
        var q = this.value.toLowerCase();
        $("bkList").querySelectorAll(".trow").forEach(function (r) {
          r.style.display = r.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      };
      $("shOk").hidden = false;
      $("shOk").textContent = T("add") + " (" + ids.length + ")";
      $("shOk").onclick = function () {
        var sel = $("shBody").querySelector('input[name=bk]:checked');
        if (!sel) { toast("Pick a surah first."); return; }
        api.write("api_assign_homework", {
          p_students: ids, p_kind: $("bkKind").value, p_surah: +sel.value,
          p_from: $("bkFrom").value ? +$("bkFrom").value : null,
          p_to: $("bkTo").value ? +$("bkTo").value : null, p_note: null
        }, T("bulkHw")).then(function () { closeSheet(); toast(T("savedAll")); refreshDay(); }).catch(fail);
      };
    }).catch(fail);
  };

  /* ------------------------------------------------------------ chrome */
  $("goCoord").onclick = function () {
    if (window.SijillCoord) window.SijillCoord.enter();
  };
  $("backCls2").onclick = function () { S.readOnly = false; openClasses(); };

  $("signOut").onclick = function () {
    api.rpc("api_sign_out", { p_token: api.getToken() }).catch(function () {});
    api.setToken(null); S.me = null; show("v-gate");
  };
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

  /* ------------------------------------------------------------ start up */
  function startup() {
    document.getElementById("gateSchool").textContent = api.config.SCHOOL_NAME || "";
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

  window.SijillApp   = { S: S, startup: startup, openClasses: openClasses, refreshDay: refreshDay };
  window.SijillSheet = sheet;
  window.SijillCloseSheet = closeSheet;
  window.SijillToast = toast;

  /* Opening a child from the coordinator's table. There is no class in
     progress there, so nothing can be graded — the sheet opens read-only and
     the grade buttons are left off rather than shown and then failing. */
  window.SijillOpenStudentById = function (id) {
    S.readOnly = true;
    openStudent({ id: id, name: "…" });
  };
  startup();
})();
