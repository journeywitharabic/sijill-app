/* ============================================================================
   Sijill · سِجِلّ — the coordinator's screens.
   Reached from the class screen, behind the SECOND passphrase. A teacher who
   knows only the school passphrase never gets in here, and every function
   below refuses them at the database as well — this file is convenience,
   not security.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var T = i18n.t;
  var C = { tab: "dash", dash: null, stats: null, mtab: "students", dclass: "", cal: null, calMsg: "" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c];
    });
  }
  function busy(el) { el.innerHTML = '<div class="loading"><span class="spin"></span></div>'; }

  /* These tables scroll sideways on a phone and nothing said so, which meant
     the buttons at the right-hand end simply did not exist as far as anyone
     using a phone was concerned. */
  function scrollHint() {
    var ar = i18n.isAr();
    return '<div class="scrollhint"><span class="ar">' + (ar ? "‹" : "›") + '</span>' +
      esc(ar ? "اسْحَبِ الجَدْوَلَ جَانِبًا لِرُؤْيَةِ بَقِيَّةِ الأَعْمِدَةِ وَالأَزْرَار"
             : "Swipe the table sideways for the rest of the columns and the buttons") + '</div>';
  }

  /* -------------------------------------------------------------- elevate */
  function enter() {
    var app = window.SijillApp;
    if (app.S.me && app.S.me.coordinator) return openCoord();
    window.SijillSheet(T("coordAsk"),
      '<p style="margin:0 0 12px;font-size:13.5px;color:var(--ink-2)">' + esc(T("coordHelp")) + '</p>' +
      '<input id="coPass" type="password" autocomplete="off" style="width:100%;padding:12px;font-size:16px;' +
      'border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink)">' +
      '<div class="err" id="coErr" hidden style="background:var(--crit-soft);border:1px solid var(--crit);' +
      'color:var(--crit);border-radius:10px;padding:10px 12px;font-size:13px;font-weight:600;margin-top:10px"></div>',
      T("gateGo"), function () {
        var v = ($("coPass").value || "").trim();
        if (!v) return false;
        api.rpc("api_elevate", { p_token: api.getToken(), p_pass: v }).then(function (r) {
          if (!r || r.ok === false) {
            $("coErr").textContent = (r && r.error) || "Not right.";
            $("coErr").hidden = false; return;
          }
          window.SijillApp.S.me = r;
          window.SijillCloseSheet();
          openCoord();
        }).catch(function (e) { $("coErr").textContent = e.message; $("coErr").hidden = false; });
        return false;
      });
    setTimeout(function () { var i = $("coPass"); if (i) i.focus(); }, 60);
  }

  function openCoord() {
    // One switcher for the whole app — the second hand-written copy of this
    // list is what made "Coordinator tools" land on the mushaf screen.
    window.SijillShow("v-coord");
    $("coordWho").textContent = (window.SijillApp.S.me && window.SijillApp.S.me.teacher) || "Coordinator";
    renderTabs();
    openTab(C.tab);
  }

  function renderTabs() {
    var tabs = [["dash", T("tabDash")], ["manage", T("tabManage")], ["stats", T("tabStats")]];
    $("ctabs").innerHTML = tabs.map(function (x) {
      return '<button data-c="' + x[0] + '" aria-pressed="' + (C.tab === x[0]) + '">' + esc(x[1]) + '</button>';
    }).join("");
    $("ctabs").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () { C.tab = b.dataset.c; renderTabs(); openTab(C.tab); };
    });
  }

  function openTab(t) {
    var body = $("cbody"); busy(body);
    if (t === "dash")  return loadDash();
    if (t === "stats") return loadStats();
    return renderManage();
  }

  /* B1 · the coordinator screens never re-translated.
     The class and student screens redraw on a language change because app.js
     listens for it; nothing here did, so these screens rendered once and
     froze in whichever language was active when they were first opened —
     which is worse than not offering the toggle at all. Cached data is
     re-rendered rather than re-fetched: switching language should not cost a
     round trip, and re-fetching would also throw away the search box. */
  window.addEventListener("sijill:lang", function () {
    if ($("v-coord").hidden) return;
    renderTabs();
    if (C.tab === "dash"  && C.dash)  return renderDash();
    if (C.tab === "stats" && C.stats) return renderStats();
    openTab(C.tab);
  });

  /* ---------------------------------------------------------- 1. the school */
  function loadDash() {
    api.read("api_dashboard", { p_class: null, p_search: null }).then(function (d) {
      C.dash = d; renderDash();
    }).catch(err);
  }

  function renderDash() {
    var d = C.dash, ar = i18n.isAr();
    var att = d.students.filter(function (s) { return s.flags && s.flags.kind; }).length;
    var h = '<div class="tiles">' +
      tile(ar ? "الطُّلَّاب" : "Students", d.tiles.students, ar ? "فِي " + d.tiles.classes + " حَلْقَات" : "across " + d.tiles.classes + " classes") +
      tile(ar ? "حِصَصٌ أُقِيمَتْ" : "Classes held", d.tiles.sessions_held, ar ? "حَتَّى الآن" : "so far this year") +
      tile(ar ? "يَحْتَاجُ اِنْتِبَاهًا" : "Needs attention", att, ar ? "طُلَّاب" : "students", att > 0) +
      tile(ar ? "تَمَّ جَرْدُهُمْ" : "Assessed", d.tiles.assessed + "/" + d.tiles.students, ar ? "الجَرْدُ السَّنَوِيّ" : "annual audit") +
      '</div>';

    /* B6 · a class filter. The list is filtered here rather than re-fetched
       with p_class: the dashboard already holds every student, so filtering
       in the browser is instant and one fewer thing to go wrong on a weak
       signal. The class list is derived from the rows themselves, so it
       cannot drift out of step with what is on screen. */
    var classes = [];
    d.students.forEach(function (s) {
      if (s["class"] && classes.indexOf(s["class"]) < 0) classes.push(s["class"]);
    });
    classes.sort();

    h += '<div class="filters"><input type="search" id="dSearch" placeholder="' +
         (ar ? "ابْحَثْ عَنْ طَالِب" : "Find a student") + '" style="flex:1;max-width:220px">' +
         '<select id="dClass"><option value="">' +
           (ar ? "كُلُّ الحَلْقَات" : "All classes") + '</option>' +
           classes.map(function (c) {
             return '<option value="' + esc(c) + '"' + (C.dclass === c ? " selected" : "") +
                    '>' + esc(c) + '</option>'; }).join("") +
         '</select>' +
         '<select id="dFlag"><option value="">' + (ar ? "كُلُّ الطُّلَّاب" : "All students") + '</option>' +
         '<option value="crit">' + (ar ? "أَحْمَر" : "Red flags only") + '</option>' +
         '<option value="any">' + (ar ? "يَحْتَاجُ اِنْتِبَاهًا" : "Needs attention") + '</option>' +
         '<option value="t-down">' + esc(T("tr_down")) + '</option>' +
         '<option value="t-flat">' + esc(T("tr_flat")) + '</option>' +
         '<option value="t-up">' + esc(T("tr_up")) + '</option></select>' +
         '<span style="flex:1"></span><button class="btn ghost sm" id="dCsv">' +
           (ar ? "تَصْدِيرُ CSV" : "Export CSV") + '</button></div>';

    /* U7 · the colours had no key anywhere, and a tooltip is no use on a
       phone. One line above the table, where it is read once and then
       available whenever anyone forgets. */
    /* Each colour and its sentence are ONE flex item now. They used to be
       separate items with a "·" between them, so when the row wrapped on a
       phone the separator landed at the start of the next line and the three
       colours no longer lined up under each other. */
    h += '<div class="legend">' +
      [["crit", ar ? "أَحْمَر" : "red",
               ar ? "غِيَابٌ مُتَكَرِّرٌ بِلَا عُذْر، أَوْ بَنْدٌ أُعِيدَ ثَلَاثَ مَرَّاتٍ فَأَكْثَر"
                  : "repeated unexplained absence, or an item repeated three times or more"],
       ["late", ar ? "بُرْتُقَالِيّ" : "amber",
               ar ? "تَعَثُّرٌ فِي التَّقَدُّمِ يَسْتَحِقُّ النَّظَر"
                  : "slipping — worth a look, not yet a problem"],
       ["exc",  ar ? "بَنَفْسَجِيّ" : "violet",
               ar ? "غِيَابٌ بِعُذْرٍ مَعْرُوف" : "away, with a reason the school knows"]
      ].map(function (r) {
        return '<span class="li"><span class="pill ' + r[0] + '"><i></i>' + esc(r[1]) +
               '</span><span class="d">' + esc(r[2]) + '</span></span>';
      }).join("") +
      '</div>' +
      (window.SijillTrendLegend ? window.SijillTrendLegend() : "");

    /* U8 · "Needs attention" was the fourth of six columns, so on a phone it
       sat off the right-hand edge — the one column anybody opens this screen
       for. It now comes straight after the name. */
    h += '<div class="tw"><table><thead><tr>' +
      [T("student"), T("trend"), T("flags"), T("classW"), T("attendance"), T("pages"), T("lastHeard")]
        .map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") +
      '</tr></thead><tbody id="dRows"></tbody></table></div>';
    $("cbody").innerHTML = h;
    fillRows();
    /* The rows have carried a data-id since the first version and nothing ever
       listened to it, so the only way into a child from the school table was
       to go to Manage, find them again, and press Open. The buttons at the
       end of the row are the ones that need a deliberate tap; the row itself
       just opens the child. */
    $("dRows").onclick = function (e) {
      if (e.target.closest("button, a, input, select")) return;
      var tr = e.target.closest("tr[data-id]");
      if (tr) window.SijillOpenStudentById(tr.dataset.id);
    };
    $("dSearch").oninput = fillRows;
    $("dFlag").onchange = fillRows;
    $("dClass").onchange = function () { C.dclass = this.value; fillRows(); };
    $("dCsv").onclick = exportCsv;
  }

  function tile(k, v, f, alert) {
    return '<div class="tile' + (alert ? " alert" : "") + '"><div class="k">' + esc(k) +
           '</div><div class="v">' + esc(v) + '</div><div class="f">' + esc(f) + '</div></div>';
  }

  function visibleRows() {
    var q = ($("dSearch") && $("dSearch").value || "").toLowerCase();
    var fl = ($("dFlag") && $("dFlag").value) || "";
    var cl = ($("dClass") && $("dClass").value) || "";
    return C.dash.students.filter(function (s) {
      if (cl && s["class"] !== cl) return false;
      if (q && s.name.toLowerCase().indexOf(q) < 0) return false;
      if (fl === "crit" && (!s.flags || s.flags.kind !== "crit")) return false;
      if (fl === "any" && (!s.flags || !s.flags.kind)) return false;
      // "Show me everyone standing still" is the question this table exists
      // to answer on a Saturday morning.
      if (fl.indexOf("t-") === 0 && (!s.trend || s.trend.dir !== fl.slice(2))) return false;
      return true;
    });
  }

  function fillRows() {
    var rows = visibleRows();
    $("dRows").innerHTML = rows.length ? rows.map(function (s) {
      var f = s.flags || {};
      var ar2 = i18n.isAr();
      return '<tr class="opens" data-id="' + esc(s.id) + '" title="' +
        esc(i18n.isAr() ? "افْتَحْ صَفْحَةَ الطَّالِب" : "Open this student") + '">' +
        '<td><b>' + esc(s.name) + '</b>' +
        '<span class="rowgo" aria-hidden="true">›</span></td>' +
        '<td>' + (window.SijillTrend ? window.SijillTrend(s.trend, true) : "") + '</td>' +
        '<td>' + (f.kind ? '<span class="pill ' + f.kind + '"><i></i>' + esc(f.message) + '</span>'
                         : '<span style="color:var(--ink-3)">—</span>') + '</td>' +
        '<td>' + esc(s["class"] || "—") + '</td>' +
        '<td class="n">' + (f.rate == null ? "—" : f.rate + "%") + '</td>' +
        /* U6 · this column used to read "11+3", which needed a tooltip nobody
           on a phone can open. It now says what it means. */
        '<td>' + (s.pages
            ? '<span class="pgcell"><b>' + s.pages.solid + '</b> ' +
                esc(ar2 ? "صَفْحَةً مُتْقَنَة" : (s.pages.solid === 1 ? "page solid" : "pages solid")) +
              (s.pages.partial ? '<span class="m">· ' + s.pages.partial + " " +
                 esc(ar2 ? "جُزْئِيَّة" : "part-done") + '</span>' : "") +
              '<span class="m">· ' + esc(ar2 ? "جُزْء " : "juz ") + s.pages.juz + '</span></span>'
            : "—") + '</td>' +
        '<td class="n">' + (s.last_heard ? i18n.fmtDate(s.last_heard) : "—") + '</td></tr>';
    }).join("") : '<tr><td colspan="7" style="color:var(--ink-3);padding:18px">' +
        esc(i18n.isAr() ? "لَا يُوجَدُ طَالِبٌ مُطَابِق." : "No students match.") + '</td></tr>';
  }

  function exportCsv() {
    var rows = visibleRows();
    // Same order as the table on screen, so the file and the page agree.
    var head = ["Student","Trend","Why","Needs attention","Class","Attendance %","Pages solid","Part done","Juz","Last heard"];
    var lines = [head.join(",")].concat(rows.map(function (s) {
      var f = s.flags || {};
      return [s.name, (s.trend && s.trend.label) || "", (s.trend && s.trend.detail) || "",
              f.message || "", s["class"] || "", f.rate == null ? "" : f.rate,
              s.pages ? s.pages.solid : "", s.pages ? s.pages.partial : "",
              s.pages ? s.pages.juz : "", s.last_heard || ""]
        .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
    }));
    var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sijill-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
  }

  /* -------------------------------------------------------------- 2. manage */
  function renderManage() {
    var ar = i18n.isAr();
    var tabs = [["students", ar ? "الطُّلَّاب" : "Students"],
                ["staff",    ar ? "المُعَلِّمُونَ وَالحَلْقَات" : "Teachers & classes"],
                ["links",    ar ? "الرَّوَابِط" : "Links"],
                ["calendar", ar ? "التَّقْوِيم" : "Calendar"],
                ["log",      ar ? "سِجِلُّ التَّغْيِيرَات" : "Change log"],
                ["maint",    ar ? "الصِّيَانَة" : "Maintenance"]];
    $("cbody").innerHTML =
      '<div class="mtabs" id="mtabs">' + tabs.map(function (x) {
        return '<button data-m="' + x[0] + '" aria-pressed="' + (C.mtab === x[0]) + '">' + esc(x[1]) + '</button>';
      }).join("") + '</div><div id="mbody"></div>';
    $("mtabs").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        if (b.dataset.m !== "calendar") C.calMsg = "";
        C.mtab = b.dataset.m; renderManage();
      };
    });
    var body = $("mbody"); busy(body);
    if (C.mtab === "students") return manageStudents(body);
    if (C.mtab === "staff")    return manageStaff(body);
    if (C.mtab === "links")    return manageLinks(body);
    if (C.mtab === "calendar") return manageCalendar(body);
    if (C.mtab === "log")      return manageLog(body);
    return manageMaint(body);
  }

  /* Renaming anything. The roster was imported as first-name-plus-initial and
     that rule mangles compound names — "Abu Bakr Sangirov" came out as
     "Abu S." when it should read "Abu Bakr S.". A name a family would not
     recognise is not a cosmetic problem on a page their parents read. */
  function renameSheet(kind, id, current) {
    var ar = i18n.isAr();
    var titles = {
      student: ar ? "تَعْدِيلُ اسْمِ الطَّالِب" : "Rename student",
      teacher: ar ? "تَعْدِيلُ اسْمِ المُعَلِّم" : "Rename teacher",
      klass:   ar ? "تَعْدِيلُ اسْمِ الحَلْقَة" : "Rename class"
    };
    var calls = {
      student: ["api_student_rename", "p_student"],
      teacher: ["api_teacher_rename", "p_teacher"],
      klass:   ["api_class_rename",   "p_class"]
    };
    window.SijillSheet(titles[kind],
      '<input id="rnName" style="width:100%;padding:11px;font-size:16px;border:1px solid var(--line);' +
      'border-radius:10px;background:var(--surface);color:var(--ink)">' +
      '<div class="note" style="margin-top:10px">' + esc(kind === "student"
        ? (ar ? "هَذَا الاِسْمُ يَرَاهُ الأَهْلُ فِي صَفْحَتِهِمْ. اُكْتُبْهُ كَمَا تُنَادِيهِ أُسْرَتُه."
              : "This is the name the child's family sees on their page. Write it the way they would.")
        : (ar ? "يَتَغَيَّرُ الاِسْمُ فِي كُلِّ مَكَانٍ فَوْرًا. لَا يُعَادُ كِتَابَةُ أَيِّ سِجِلّ."
              : "The name changes everywhere at once. No history is rewritten and nothing is re-attributed.")) +
      '</div>',
      T("save"), function () {
        var v = ($("rnName").value || "").trim();
        if (v.length < 2 || v === current) return false;
        var args = {}; args[calls[kind][1]] = id; args.p_name = v;
        api.write(calls[kind][0], args, v)
          .then(function () { window.SijillCloseSheet(); renderManage(); }).catch(err);
        return false;
      });
    /* Filled in straight away, not on a timer.
       SijillSheet writes the body synchronously, so the input already exists
       here — and a 60ms timer that sets .value would overwrite anything typed
       inside that window, which then compares equal to the old name and
       silently saves nothing. Focus can wait for the next frame; the value
       cannot. */
    var f = $("rnName");
    if (f) { f.value = current; setTimeout(function () { f.focus(); f.select(); }, 40); }
  }

  function manageStudents(body) {
    api.read("api_dashboard", {}).then(function (d) {
      body.innerHTML =
        '<div class="filters"><span style="flex:1"></span>' +
        '<button class="btn sm" id="addStu">+ Add student</button></div>' +
        (window.SijillTrendLegend ? window.SijillTrendLegend() : "") +
        scrollHint() +
        '<div class="tw"><table><thead><tr><th>Student</th><th>' + esc(T("trend")) + '</th>' +
        '<th>Class</th><th>Open homework</th>' +
        '<th>Not revisited</th><th></th></tr></thead><tbody>' +
        d.students.map(function (s) {
          return '<tr><td><b>' + esc(s.name) + '</b></td>' +
            '<td>' + (window.SijillTrend ? window.SijillTrend(s.trend, true) : "") + '</td>' +
            '<td>' + esc(s["class"] || "—") + '</td>' +
            '<td class="n">' + s.open_homework + '</td><td class="n">' + s.not_revisited + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="mini stu-go" data-id="' + esc(s.id) + '">Open</button> ' +
            '<button class="mini stu-ren" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">Rename</button> ' +
            '<button class="mini stu-link" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">Own link</button> ' +
            '<button class="mini stu-move" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">Move</button> ' +
            '<button class="mini stu-rm" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">Remove</button></td></tr>';
        }).join("") + '</tbody></table></div>' +
        '<div style="height:10px"></div><div class="note">Adding, moving and removing students is here. ' +
        '<b>Remove</b> closes the enrolment and revokes the links — it never deletes the history, so a child ' +
        'who comes back in September picks up where they left off.</div>';
      body.querySelectorAll(".stu-link").forEach(function (b) {
        b.onclick = function () { issueStudentLink(b.dataset.id, b.dataset.name); };
      });
      body.querySelectorAll(".stu-go").forEach(function (b) {
        b.onclick = function () { window.SijillOpenStudentById(b.dataset.id); };
      });
      body.querySelectorAll(".stu-ren").forEach(function (b) {
        b.onclick = function () { renameSheet("student", b.dataset.id, b.dataset.name); };
      });
      body.querySelectorAll(".stu-move").forEach(function (b) {
        b.onclick = function () { moveStudent(b.dataset.id, b.dataset.name); };
      });
      body.querySelectorAll(".stu-rm").forEach(function (b) {
        b.onclick = function () { removeStudent(b.dataset.id, b.dataset.name); };
      });
      $("addStu").onclick = addStudent;
    }).catch(err);
  }

  function addStudent() {
    api.read("api_classes").then(function (cs) {
      window.SijillSheet("Add a student",
        '<input id="nsName" placeholder="First name and surname initial, e.g. Bilal N." ' +
        'style="width:100%;padding:12px;font-size:16px;border:1px solid var(--line);border-radius:10px;' +
        'background:var(--surface);color:var(--ink)">' +
        '<div style="height:10px"></div><select id="nsClass" style="width:100%">' +
        cs.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join("") +
        '</select><div class="note" style="margin-top:10px">Use the same short form as the rest of the roster — ' +
        'first name plus the initial of the surname. That is deliberate: the database never holds a full surname.</div>',
        "Add", function () {
          var n = ($("nsName").value || "").trim();
          if (n.length < 2) return false;
          api.write("api_student_add", { p_name: n, p_class: $("nsClass").value, p_from: null }, n)
            .then(function () { window.SijillCloseSheet(); renderManage(); }).catch(err);
          return false;
        });
    }).catch(err);
  }

  /* Moving a child mid-year closes the old enrolment rather than editing it,
     so the autumn still records where they actually were. */
  function moveStudent(id, name) {
    api.read("api_classes").then(function (cs) {
      window.SijillSheet("Move " + name,
        '<select id="mvClass" style="width:100%">' +
        cs.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join("") +
        '</select><div class="note" style="margin-top:10px">The old enrolment closes today and a new one ' +
        'starts. Nothing is rewritten — last term still shows the class they were actually in, which is what ' +
        'makes the attendance history honest.</div>',
        "Move", function () {
          api.write("api_student_move", { p_student: id, p_class: $("mvClass").value, p_on: null }, name)
            .then(function () { window.SijillCloseSheet(); renderManage(); }).catch(err);
          return false;
        });
    }).catch(err);
  }

  /* Leaving is not deleting. */
  function removeStudent(id, name) {
    window.SijillSheet("Remove " + name + " from the school?",
      '<div class="banner exc"><span class="ic">●</span><div>This closes their enrolment and stops every ' +
      'link that covered them. <b>It does not delete anything.</b> Their attendance, marks and notes stay, ' +
      'so if they come back in September they pick up exactly where they left off.</div></div>' +
      '<div class="note" style="margin-top:10px">Actual erasure — for a family who asks for it — is a ' +
      'separate, deliberate job in the SQL editor. Ask me when you need it.</div>',
      "Remove", function () {
        api.write("api_student_remove", { p_student: id }, name).then(function (r) {
          window.SijillCloseSheet();
          window.SijillToast(name + " removed" + (r.links_revoked ? " · " + r.links_revoked + " link(s) revoked" : ""));
          renderManage();
        }).catch(err);
        return false;
      });
  }

  function issueStudentLink(id, name) {
    window.SijillSheet("Own link for " + name,
      '<div class="note">This is for an older child who wants their own link. It shows only them, ' +
      'no siblings, and never the attendance warning — that is a message for adults.</div>',
      "Issue link", function () {
        api.write("api_issue_student_link", { p_student: id }, name).then(function (r) {
          showLinkOnce(r.token, name);
        }).catch(err);
        return false;
      });
  }

  /* The one moment the plaintext link exists. It is never stored and can
     never be looked up again — only replaced. So the screen has to make
     copying it the obvious thing to do. */
  function showLinkOnce(token, who) {
    /* Which address the link is built from.
       Cloudflare gives every build its own address with a hash in front of
       it — 128ef441.sijill-app.pages.dev — alongside the permanent one.
       Both work, both look identical in the browser bar, and a link issued
       from the hashed one carries that hash for ever and points at a frozen
       copy of the app. A parent would never know; it would simply stop
       showing new homework one day.

       So the link is built from SITE_HOST when it is set, whatever page the
       coordinator happens to be standing on, and they are told when those
       two disagree. */
    var wanted = (api.config.SITE_HOST || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    var host = wanted || location.host;
    var origin = wanted ? "https://" + wanted : location.origin;
    var url = origin + location.pathname.replace(/[^/]*$/, "") + "family.html#c=" + encodeURIComponent(token);
    var offSite = wanted && location.host !== wanted;

    window.SijillSheet("Send this now — it cannot be shown again",
      (offSite
        ? '<div class="banner crit hostwarn" style="margin-bottom:10px"><span class="ic">●</span><div>' +
          '<b>You are on ' + esc(location.host) + ', not ' + esc(wanted) + '.</b> ' +
          'That is a one-off address for a single build. The link below has been ' +
          'written for the real address, so it is safe to send — but check it ' +
          'starts with <b>' + esc(wanted) + '</b> before you do.</div></div>'
        : "") +
      '<div class="note" style="margin-bottom:10px">Covers: <b>' + esc(who) + '</b></div>' +
      '<textarea id="lkUrl" readonly style="width:100%;min-height:92px;font-family:var(--mono);font-size:12px;' +
      'padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);color:var(--ink)">' +
      esc(url) + '</textarea>' +
      '<div class="actionrow" style="margin-top:10px"><button class="btn sm" id="lkCopy">Copy</button></div>' +
      '<div class="banner crit" style="margin-top:10px"><span class="ic">●</span><div>' +
      'Only the scrambled form of this link is kept. If it is lost you cannot look it up — you issue a new ' +
      'one, and the old one stops working. That is what makes a stolen database useless.</div></div>',
      null, null, "Done");
    setTimeout(function () {
      var c = $("lkCopy"); if (!c) return;
      c.onclick = function () {
        var ta = $("lkUrl"); ta.select();
        try { navigator.clipboard.writeText(url); } catch (e) { document.execCommand("copy"); }
        c.textContent = "Copied";
      };
    }, 50);
  }

  /* Tarek asked for the channel dropdown to become a status that looks after
     itself. It already could: every time a family opens their page the visit
     is recorded, so "issued and never opened" is something the database knows
     and the old dropdown only ever recorded an intention. Three states rather
     than two, because "opened once in September" and "reads it every week"
     are different problems and only one of them needs a phone call. */
  function linkStatus(g) {
    var ar = i18n.isAr();
    if (!g.opens_all_time) {
      return '<span class="pill crit"><i></i>' +
        esc(ar ? "أُصْدِرَ وَلَمْ يُفْتَحْ" : "issued, never opened") + '</span>';
    }
    if (g.engagement === "regular") {
      return '<span class="pill ok"><i></i>' +
        esc(ar ? "تُتَابِعُ الأُسْرَة" : "reading it") + '</span>';
    }
    return '<span class="pill late"><i></i>' +
      esc(ar ? "تَوَقَّفَتْ عَنِ المُتَابَعَة" : "stopped opening it") + '</span>';
  }

  /* F2 · teachers and classes.
     The database has been able to do all of this since the beginning; there
     was simply no screen for it, so the honest note in the deploy guide said
     "do it in the SQL editor". Asking a volunteer coordinator to open a SQL
     editor is the same as saying it cannot be done. */
  function manageStaff(body) {
    api.read("api_roster").then(function (r) {
      var ar = i18n.isAr();
      body.innerHTML =
        '<div class="filters"><b style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;' +
          'color:var(--ink-3)">' + esc(ar ? "المُعَلِّمُون" : "Teachers") + '</b>' +
          '<span style="flex:1"></span>' +
          '<button class="btn sm" id="addTeacher">+ ' + esc(ar ? "مُعَلِّم" : "Teacher") + '</button></div>' +
        scrollHint() +
        '<div class="tw"><table><thead><tr>' +
          '<th>' + esc(ar ? "الاِسْم" : "Name") + '</th>' +
          '<th>' + esc(ar ? "سَجَّلَ" : "Marked") + '</th>' +
          '<th>' + esc(ar ? "آخِرُ حِصَّة" : "Last class") + '</th>' +
          '<th></th></tr></thead><tbody>' +
        (r.teachers.length ? r.teachers.map(function (t) {
          return '<tr' + (t.active ? "" : ' style="opacity:.55"') + '>' +
            '<td><b>' + esc(t.name) + '</b>' +
              (t.active ? "" : ' <span class="pill mute"><i></i>' +
                 esc(ar ? "غَيْرُ نَشِط" : "switched off") + '</span>') + '</td>' +
            '<td class="n">' + t.marked + '</td>' +
            '<td class="n">' + (t.last_seen ? i18n.fmtDate(t.last_seen) : "—") + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="mini tg-ren" data-id="' + esc(t.id) + '" data-name="' + esc(t.name) + '">' +
              esc(ar ? "تَعْدِيل" : "Rename") + '</button> ' +
            '<button class="mini tg-act" data-id="' + esc(t.id) +
              '" data-name="' + esc(t.name) + '" data-to="' + (t.active ? "0" : "1") + '">' +
              esc(t.active ? (ar ? "أَوْقِفْ" : "Switch off") : (ar ? "أَعِدْ تَفْعِيلَه" : "Switch on")) +
            '</button></td></tr>';
        }).join("") : '<tr><td colspan="4" style="padding:18px;color:var(--ink-3)">—</td></tr>') +
        '</tbody></table></div>' +

        '<div class="note" style="margin:10px 0 20px">' +
          esc(ar
            ? "إِيقَافُ مُعَلِّمٍ يُخْرِجُهُ مِنْ قَائِمَةِ الدُّخُولِ وَيُنْهِي جَلَسَاتِه. كُلُّ مَا سَجَّلَهُ يَبْقَى كَمَا هُوَ وَمَنْسُوبًا إِلَيْه."
            : "Switching a teacher off takes them off the sign-in list and ends their sessions. Everything they recorded stays exactly as it is, still in their name — nothing is deleted.") +
        '</div>' +

        '<div class="filters"><b style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;' +
          'color:var(--ink-3)">' + esc(ar ? "الحَلْقَات" : "Classes") + '</b>' +
          '<span style="flex:1"></span>' +
          '<button class="btn sm" id="addClass">+ ' + esc(ar ? "حَلْقَة" : "Class") + '</button></div>' +
        scrollHint() +
        '<div class="tw"><table><thead><tr>' +
          '<th>' + esc(ar ? "الاِسْم" : "Name") + '</th>' +
          '<th>' + esc(ar ? "تَجْتَمِع" : "Meets") + '</th>' +
          '<th>' + esc(ar ? "طُلَّاب" : "Students") + '</th>' +
          '<th>' + esc(ar ? "حِصَص" : "Sessions") + '</th><th></th></tr></thead><tbody>' +
        (r.classes.length ? r.classes.map(function (c) {
          return '<tr><td><b>' + esc(c.name) + '</b></td>' +
            '<td>' + esc((c.meets || []).map(function (m) {
                return ar ? (m === "friday" ? "الجُمُعَة" : "الأَحَد")
                          : (m.charAt(0).toUpperCase() + m.slice(1));
              }).join(" · ")) + '</td>' +
            '<td class="n">' + c.students + '</td><td class="n">' + c.sessions + '</td>' +
            '<td style="text-align:right"><button class="mini cl-ren" data-id="' + esc(c.id) +
              '" data-name="' + esc(c.name) + '">' + esc(ar ? "تَعْدِيل" : "Rename") + '</button></td></tr>';
        }).join("") : '<tr><td colspan="5" style="padding:18px;color:var(--ink-3)">—</td></tr>') +
        '</tbody></table></div>' +
        '<div class="note" style="margin-top:10px">' +
          esc(ar
            ? "الحَلْقَاتُ الجَدِيدَةُ تَحْصُلُ عَلَى أَيَّامِهَا فِي التَّقْوِيمِ تِلْقَائِيًّا حَتَّى نِهَايَةِ العَام."
            : "A new class gets its calendar days generated automatically to the end of the year. Moving students into it is done from the Students tab.") +
        '</div>';

      $("addTeacher").onclick = function () {
        window.SijillSheet(ar ? "إِضَافَةُ مُعَلِّم" : "Add a teacher",
          '<input id="tName" placeholder="' + (ar ? "الاِسْمُ الكَامِل" : "Full name") + '" ' +
          'style="width:100%;padding:11px;font-size:16px;border:1px solid var(--line);' +
          'border-radius:10px;background:var(--surface);color:var(--ink)">',
          T("add"), function () {
            var n = ($("tName").value || "").trim();
            if (n.length < 3) return false;
            api.write("api_teacher_add", { p_name: n }, n)
              .then(function () { window.SijillCloseSheet(); renderManage(); }).catch(err);
            return false;
          });
        setTimeout(function () { var f = $("tName"); if (f) f.focus(); }, 60);
      };

      body.querySelectorAll(".tg-ren").forEach(function (b) {
        b.onclick = function () { renameSheet("teacher", b.dataset.id, b.dataset.name); };
      });
      body.querySelectorAll(".tg-act").forEach(function (b) {
        b.onclick = function () {
          var on = b.dataset.to === "1";
          window.SijillSheet(
            (on ? (ar ? "إِعَادَةُ تَفْعِيل" : "Switch back on") : (ar ? "إِيقَافُ مُعَلِّم" : "Switch off")) +
              " — " + b.dataset.name,
            '<div style="font-size:13.5px;line-height:1.55">' + esc(on
              ? (ar ? "سَيَظْهَرُ اسْمُهُ فِي قَائِمَةِ الدُّخُولِ مِنْ جَدِيد."
                    : "They will appear on the sign-in list again.")
              : (ar ? "سَيَخْتَفِي مِنْ قَائِمَةِ الدُّخُولِ وَسَتَنْتَهِي جَلَسَاتُهُ فَوْرًا. لَنْ يُحْذَفَ شَيْءٌ مِمَّا سَجَّلَه."
                    : "They disappear from the sign-in list and any phone they are signed in on is signed out. Nothing they recorded is deleted.")) +
            '</div>',
            on ? (ar ? "فَعِّلْ" : "Switch on") : (ar ? "أَوْقِفْ" : "Switch off"),
            function () {
              api.write("api_teacher_set_active",
                        { p_teacher: b.dataset.id, p_active: on }, b.dataset.name)
                .then(function () { window.SijillCloseSheet(); renderManage(); }).catch(err);
              return false;
            });
        };
      });

      body.querySelectorAll(".cl-ren").forEach(function (b) {
        b.onclick = function () { renameSheet("klass", b.dataset.id, b.dataset.name); };
      });

      $("addClass").onclick = function () {
        window.SijillSheet(ar ? "إِضَافَةُ حَلْقَة" : "Add a class",
          '<input id="cName" placeholder="' + (ar ? "اسْمُ الحَلْقَة" : "Class name") + '" ' +
          'style="width:100%;padding:11px;font-size:16px;border:1px solid var(--line);' +
          'border-radius:10px;background:var(--surface);color:var(--ink);margin-bottom:10px">' +
          '<div class="filters" style="margin:0"><label class="chip"><input type="checkbox" id="cFri" checked> ' +
          (ar ? "الجُمُعَة" : "Friday") + '</label>' +
          '<label class="chip"><input type="checkbox" id="cSun" checked> ' +
          (ar ? "الأَحَد" : "Sunday") + '</label></div>',
          T("add"), function () {
            var n = ($("cName").value || "").trim();
            if (n.length < 2) return false;
            var meets = [];
            if ($("cFri").checked) meets.push("friday");
            if ($("cSun").checked) meets.push("sunday");
            if (!meets.length) return false;
            api.write("api_class_add", { p_name: n, p_meets: meets }, n)
              .then(function (r) {
                window.SijillCloseSheet();
                // Say how many class days were created. Silence here would
                // leave you guessing whether the new class actually has a
                // year in front of it or is an empty shell.
                window.SijillToast(ar
                  ? n + " — أُنْشِئَ " + ((r && r.days_created) || 0) + " يَوْمَ دِرَاسَة"
                  : n + " — " + ((r && r.days_created) || 0) + " class days created");
                renderManage();
              }).catch(err);
            return false;
          });
        setTimeout(function () { var f = $("cName"); if (f) f.focus(); }, 60);
      };
    }).catch(err);
  }

  function manageLinks(body) {
    Promise.all([api.read("api_links"), api.read("api_dashboard", {})]).then(function (r) {
      var links = r[0], students = r[1].students;
      body.innerHTML =
        '<div class="filters"><span style="flex:1"></span><button class="btn sm" id="newLink">+ Issue a link</button></div>' +
        scrollHint() +
        '<div class="tw"><table><thead><tr><th>Link covers</th><th>Whose</th><th>Status</th>' +
        '<th>Opens (30d)</th><th>Last opened</th><th></th></tr></thead><tbody>' +
        (links.length ? links.map(function (g) {
          return '<tr><td><b>' + esc(g.children || "—") + '</b></td><td>' + esc(g.label) + '</td>' +
            '<td>' + linkStatus(g) + '</td><td class="n">' + g.opens_30d + '</td>' +
            '<td class="n">' + (g.last_opened ? i18n.fmtDate(g.last_opened.slice(0,10)) : "never") + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="mini lk-rot" data-id="' + esc(g.guardian_id) + '" data-who="' + esc(g.children || "") + '">Replace</button> ' +
            '<button class="mini lk-rev" data-id="' + esc(g.guardian_id) + '">Revoke</button></td></tr>';
        }).join("") : '<tr><td colspan="6" style="padding:18px;color:var(--ink-3)">No links issued yet.</td></tr>') +
        '</tbody></table></div><div style="height:10px"></div>' +
        '<div class="note"><b>No parent names, phone numbers or emails are stored anywhere.</b> A link is a ' +
        'random code, which children it covers, and whose it is. You find the actual person by looking the ' +
        'child up in ClassDojo, which already has all of that.</div>';
      body.querySelectorAll(".lk-rot").forEach(function (b) {
        b.onclick = function () {
          api.write("api_rotate_link", { p_guardian: b.dataset.id }, "link")
            .then(function (r) { showLinkOnce(r.token, b.dataset.who); }).catch(err);
        };
      });
      body.querySelectorAll(".lk-rev").forEach(function (b) {
        b.onclick = function () {
          window.SijillSheet("Revoke this link?",
            '<div class="note">It stops working immediately. The family will need a new one.</div>',
            "Revoke", function () {
              api.write("api_revoke_link", { p_guardian: b.dataset.id }, "link")
                .then(function () { window.SijillCloseSheet(); renderManage(); }).catch(err);
              return false;
            });
        };
      });
      $("newLink").onclick = function () { newLink(students); };
    }).catch(err);
  }

  function newLink(students) {
    window.SijillSheet("Issue a family link",
      '<div class="note" style="margin-bottom:10px">Tick every child this adult should see. One link covers ' +
      'all of them. Give each parent their own link rather than sharing one.</div>' +
      '<div class="filters" style="margin:0 0 10px"><select id="nlLabel" class="mini">' +
      '<option>mother</option><option>father</option><option>grandmother</option>' +
      '<option>grandfather</option><option>guardian</option></select></div>' +
      '<input id="nlFind" type="search" placeholder="Find a child" style="width:100%;padding:10px;margin-bottom:8px;' +
      'border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink)">' +
      '<div class="tree" style="max-height:260px;overflow:auto" id="nlList">' +
      students.map(function (s) {
        return '<label class="trow" style="cursor:pointer"><input type="checkbox" value="' + esc(s.id) +
          '" data-name="' + esc(s.name) + '" style="width:18px;height:18px">' +
          '<span class="lbl"><span>' + esc(s.name) + '</span></span>' +
          '<span class="dt">' + esc(s["class"] || "") + '</span></label>';
      }).join("") + '</div>',
      "Issue", function () {
        var boxes = Array.prototype.slice.call($("nlList").querySelectorAll("input:checked"));
        if (!boxes.length) return false;
        api.write("api_issue_link", {
          p_students: boxes.map(function (b) { return b.value; }),
          p_label: $("nlLabel").value
        }, "link").then(function (r) {
          showLinkOnce(r.token, boxes.map(function (b) { return b.dataset.name; }).join(" · "));
        }).catch(err);
        return false;
      });
    setTimeout(function () {
      var f = $("nlFind"); if (!f) return;
      f.oninput = function () {
        var q = this.value.toLowerCase();
        $("nlList").querySelectorAll(".trow").forEach(function (r) {
          r.style.display = r.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      };
    }, 50);
  }

  function manageCalendar(body) {
    var ar = i18n.isAr();
    Promise.all([api.read("api_classes"), api.read("api_closures")]).then(function (res) {
      var cs = res[0], closed = res[1] || [];
      /* Closing a day refreshes this screen so the table below updates, and
         that used to wipe the date, class and reason the coordinator had just
         typed — so pressing Reopen straight afterwards reopened TODAY rather
         than the day they were working on. The form remembers itself. */
      var form = C.cal || {};
      var today = form.date || new Date().toISOString().slice(0, 10);
      body.innerHTML =
        '<div class="note"><b>' + esc(ar ? "إِغْلَاقُ يَوْم." : "Close a day.") + '</b> ' +
        esc(ar
          ? "ثَلْجٌ أَوْ عِيدٌ أَوْ لَا مُعَلِّمَ مُتَاح. اليَوْمُ المُغْلَقُ يُسَجَّلُ فِيهِ كُلُّ الطُّلَّابِ غَائِبِينَ بِعُذْرٍ مَعَ السَّبَبِ الَّذِي تَكْتُبُه، فَلَا يُحْسَبُ غِيَابًا عَلَى أَحَد. وَيَبْقَى بِإِمْكَانِ المُعَلِّمِينَ إِسْنَادُ وَاجِبِ الأُسْبُوعِ القَادِم."
          : "Snow, Eid, no teacher available. Closing a day marks every child in it excused, with the reason you type, so it counts against nobody. Teachers can still set homework for the next class — only recitation is blocked, because none happened.") +
        '<div style="height:10px"></div>' +
        '<div class="filters" style="margin:0"><input type="date" id="cdDate" value="' + today + '">' +
        '<select id="cdScope"><option value="">' + esc(ar ? "المَدْرَسَةُ كُلُّهَا" : "Whole school") + '</option>' +
        cs.map(function (c) {
          return '<option value="' + esc(c.id) + '"' + (form.scope === c.id ? " selected" : "") + '>' +
                 esc(c.name) + '</option>'; }).join("") +
        '</select><input type="search" id="cdNote" value="' + esc(form.note || "") + '" placeholder="' +
          esc(ar ? "السَّبَب — ثَلْج، عِيد، لَا مُعَلِّم…" : "Reason — snow, Eid, no teacher…") + '">' +
        '<button class="btn sm" id="cdGo">' + esc(ar ? "أَغْلِقْ" : "Mark closed") + '</button>' +
        '<button class="btn ghost sm" id="cdOpen">' + esc(ar ? "أَعِدْ فَتْحَه" : "Reopen") + '</button></div>' +
        '<div id="cdOut" style="margin-top:10px">' + (C.calMsg || "") + '</div></div>' +

        /* Which days are already closed. The screen could close a day and
           reopen one but never showed you the answer to "did we cancel the
           20th?" — so the only way to know was to remember. */
        '<div class="grph" style="margin-top:18px"><h2>' +
          esc(ar ? "الأَيَّامُ المُغْلَقَة" : "Days already closed") +
        '</h2><span class="n">' + closed.length + '</span></div>' +
        (closed.length ? scrollHint() : "") +
        '<div class="tw"><table><thead><tr>' +
          '<th>' + esc(ar ? "التَّارِيخ" : "Date") + '</th>' +
          '<th>' + esc(ar ? "السَّبَب" : "Reason") + '</th>' +
          '<th>' + esc(ar ? "المَدَى" : "Scope") + '</th>' +
          '<th></th></tr></thead><tbody>' +
        (closed.length ? closed.map(function (x) {
          var whole = +x.classes_closed >= +x.classes_total;
          return '<tr><td><b>' + esc(i18n.fmtDate(x.held_on, true)) + '</b></td>' +
            '<td>' + esc(x.reason) + '</td>' +
            '<td>' + (whole
                ? '<span class="pill crit"><i></i>' + esc(ar ? "المَدْرَسَةُ كُلُّهَا" : "whole school") + '</span>'
                : '<span class="pill late"><i></i>' + x.classes_closed + "/" + x.classes_total + " " +
                  esc(ar ? "حَلْقَات" : "classes") + '</span>' +
                  '<div class="m" style="margin-top:3px">' + esc(x.which) + '</div>') + '</td>' +
            '<td style="text-align:right"><button class="mini cd-reopen" data-on="' + esc(x.held_on) + '">' +
              esc(ar ? "أَعِدْ فَتْحَه" : "Reopen") + '</button></td></tr>';
        }).join("") : '<tr><td colspan="4" style="padding:18px;color:var(--ink-3)">' +
            esc(ar ? "لَمْ يُغْلَقْ أَيُّ يَوْمٍ بَعْدُ." : "No days closed yet.") + '</td></tr>') +
        '</tbody></table></div>';

      function remember() {
        C.cal = { date: $("cdDate").value, scope: $("cdScope").value, note: $("cdNote").value };
      }
      ["cdDate", "cdScope", "cdNote"].forEach(function (id) {
        var el = $(id); if (el) el.onchange = remember;
      });

      $("cdGo").onclick = function () {
        remember();
        api.write("api_close_day", { p_on: $("cdDate").value, p_class: $("cdScope").value || null,
                                     p_note: $("cdNote").value || null }, "closure")
          .then(function (r) {
            // Say how many children were excused, not just how many classes
            // were closed — the excusing is the part that matters to families.
            // Kept in module state, because the re-render below rebuilds this
            // whole screen and would otherwise throw the message away before
            // anybody read it.
            C.calMsg = '<span class="pill ' + (r.closed ? "ok" : "late") + '"><i></i>' +
              (r.closed
                ? esc(r.closed + (ar ? " حَلْقَة أُغْلِقَتْ · " : " class(es) closed · ") +
                      r.excused + (ar ? " طَالِبًا غَائِبٌ بِعُذْر" : " students excused"))
                : esc(r.note || "nothing to close that day")) + '</span>' +
              // A closed day with recitation already on it is a contradiction
              // worth seeing, not worth silently tidying away.
              (r.recitations_kept ? ' <span class="pill late"><i></i>' +
                esc(r.recitations_kept + (ar
                  ? " تِلَاوَةً سُجِّلَتْ قَبْلَ الإِغْلَاقِ وَبَقِيَتْ"
                  : " recitations were already recorded that day and were kept")) +
                '</span>' : "");
            if (r.closed) renderManage(); else $("cdOut").innerHTML = C.calMsg;
          }).catch(err);
      };
      $("cdOpen").onclick = function () {
        remember();
        reopen($("cdDate").value, $("cdScope").value || null);
      };
      body.querySelectorAll(".cd-reopen").forEach(function (b) {
        b.onclick = function () { reopen(b.dataset.on, null); };
      });

      function reopen(on, cls) {
        window.SijillSheet(ar ? "إِعَادَةُ فَتْحِ اليَوْم؟" : "Reopen this day?",
          '<div style="font-size:13.5px;line-height:1.55">' + esc(ar
            ? "تُحْذَفُ الأَعْذَارُ الَّتِي أُنْشِئَتْ عِنْدَ الإِغْلَاق، وَيَعُودُ كُلُّ مَا سَجَّلَهُ المُعَلِّمُونَ قَبْلَهُ كَمَا كَانَ."
            : "The excused marks that closing created are removed, and anything teachers had recorded before the closure comes back exactly as it was.") + '</div>',
          ar ? "أَعِدْ فَتْحَه" : "Reopen", function () {
            window.SijillCloseSheet();
            api.write("api_reopen_day", { p_on: on, p_class: cls }, "reopen")
              .then(function () { renderManage(); }).catch(err);
            return false;
          });
      }
    }).catch(err);
  }

  function manageLog(body) {
    api.read("api_change_log", { p_limit: 60, p_entity: null }).then(function (rows) {
      body.innerHTML =
        '<div class="note" style="margin-bottom:10px">Every change that replaced something, newest first. ' +
        '<b>Undo</b> puts that one row back — it is the middle ground between the in-app undo and restoring ' +
        'a whole night\'s backup.</div>' +
        '<div class="tw"><table><thead><tr><th>When</th><th>Who</th><th>What</th><th></th></tr></thead><tbody>' +
        (rows.length ? rows.map(function (r) {
          // The table used to print the bare table name — "attendance",
          // "hifdh_state" — which told you nothing about WHICH child, WHICH
          // day, or what actually changed. An undo button you cannot aim is
          // worse than no undo button. The sentence comes from the database
          // so the names never have to be shipped to the browser separately.
          var what = r.summary
            ? '<b style="font-weight:600">' + esc(r.summary) + '</b>' +
              '<div class="m" style="color:var(--ink-3);font-size:11px;margin-top:2px">' + esc(r.entity) + '</div>'
            : esc(r.entity);
          return '<tr><td class="n">' + esc(String(r.at).slice(0, 16).replace("T", " ")) + '</td>' +
            '<td>' + esc(r.actor_name) + '</td><td>' + what + '</td>' +
            '<td style="text-align:right">' + (r.before && r.entity !== "sessions"
              ? '<button class="mini lg-undo" data-id="' + r.id + '">Undo</button>' : '') + '</td></tr>';
        }).join("") : '<tr><td colspan="4" style="padding:18px;color:var(--ink-3)">Nothing changed yet.</td></tr>') +
        '</tbody></table></div>';
      body.querySelectorAll(".lg-undo").forEach(function (b) {
        b.onclick = function () {
          api.write("api_revert", { p_change: +b.dataset.id }, "undo")
            .then(function (r) { window.SijillToast("Put back: " + r.reverted); renderManage(); })
            .catch(err);
        };
      });
    }).catch(err);
  }

  function manageMaint(body) {
    body.innerHTML =
      '<div class="card" style="padding:4px 16px">' +
      [["weekly", "Glance at the School tab. Any class with nothing logged on a Friday or Sunday is worth a look — classes run both days."],
       ["monthly", "GitHub → Actions. The nightly backup should be green every day. A red run means you have no backup."],
       ["quarterly", "<b>Restore a backup into a scratch project and count the rows.</b> A backup you have never restored is a hope, not a backup."],
       ["each term", "Rotate the school passphrase, especially if a teacher has left. This signs every phone out, so do it when teachers can sign in again — not five minutes before class."],
       ["each term", "Replace links for anyone who has lost theirs, and revoke links for children who have left."],
       ["yearly (June)", "Work through the year-end runbook — close enrolments, build next year's calendar, re-enrol, run the audit."],
       ["yearly (Sept)", "Expect Supabase to have paused the project over the summer. One click restores it; nothing is lost."],
       ["watch for", "Anyone new in the teacher list you did not add. Teachers can add themselves mid-class; they show up in Statistics as pending."]
      ].map(function (x) {
        return '<div class="chk"><span class="w">' + esc(x[0]) + '</span><span>' + x[1] + '</span></div>';
      }).join("") + '</div><div style="height:12px"></div>' +
      '<div class="banner crit"><span class="ic">●</span><div><b>The quarterly restore test is the one ' +
      'everyone skips.</b> Everything else here fails loudly. A broken backup fails silently, and you find ' +
      'out on the day you need it.</div></div>';
  }

  /* --------------------------------------------------------- 3. statistics */
  function loadStats() {
    api.read("api_statistics", { p_days: 30 }).then(function (d) {
      C.stats = d; renderStats();
    }).catch(err);
  }

  function renderStats() {
    var d = C.stats;
    var h = '<div class="tiles">' +
      tile("Families reading", d.reading + "/" + d.families_total, "opened in the last 30 days") +
      tile("Never opened", d.never_opened, "since links were sent", d.never_opened > 0) +
      tile("Student links", d.student_links, "older children") +
      tile("Pending teachers", (d.pending_teachers || []).length, "added themselves",
           (d.pending_teachers || []).length > 0) +
      '</div>';

    if ((d.pending_teachers || []).length) {
      h += '<div class="banner exc"><span class="ic">●</span><div><b>Waiting for you to confirm:</b> ' +
        d.pending_teachers.map(function (t) { return esc(t.name); }).join(", ") +
        '. They can already teach — this is just so nobody appears in the register without you knowing.</div></div>';
    }

    h += '<h4 style="margin:14px 0 8px">Teachers</h4><div class="tw"><table><thead><tr>' +
      '<th>Teacher</th><th>Classes</th><th>Sessions logged</th><th>Students marked</th>' +
      '<th>Notes</th><th>Last logged</th></tr></thead><tbody>' +
      (d.teachers || []).map(function (t) {
        return '<tr><td><b>' + esc(t.teacher) + '</b></td><td>' + esc(t.classes || "—") + '</td>' +
          '<td class="n">' + t.sessions_logged + '</td><td class="n">' + t.students_marked + '</td>' +
          '<td class="n">' + t.notes_written + '</td>' +
          '<td class="n">' + (t.last_logged ? i18n.fmtDate(t.last_logged) : "—") + '</td></tr>';
      }).join("") + '</tbody></table></div>';

    h += '<h4 style="margin:16px 0 8px">Every class day</h4><div class="tw"><table><thead><tr>' +
      '<th>Date</th><th>Class</th><th>Enrolled</th><th>Attendance</th><th>Recitation</th><th></th>' +
      '</tr></thead><tbody>' +
      (d.recent_classes || []).map(function (c) {
        var pill = { "complete":"ok", "partly logged":"late", "no recitation":"late",
                     "no attendance":"late", "nothing logged":"crit" }[c.state] || "mute";
        return '<tr><td class="n">' + i18n.fmtDate(c.held_on) + '</td><td>' + esc(c.class_name) + '</td>' +
          '<td class="n">' + c.enrolled + '</td><td class="n">' + c.attendance_marked + '</td>' +
          '<td class="n">' + c.students_recited + '</td>' +
          '<td><span class="pill ' + pill + '"><i></i>' + esc(c.state) + '</span></td></tr>';
      }).join("") + '</tbody></table></div>';

    h += '<h4 style="margin:16px 0 8px">Families</h4><div class="tw"><table><thead><tr>' +
      '<th>Link covers</th><th>Whose</th><th>Opens all time</th><th>Last 30d</th>' +
      '<th>Last opened</th><th></th></tr></thead><tbody>' +
      (d.families || []).map(function (f) {
        var pill = { "regular":"ok", "drifted off":"late", "never opened":"crit" }[f.engagement] || "mute";
        return '<tr><td><b>' + esc(f.children || "—") + '</b></td><td>' + esc(f.label) + '</td>' +
          '<td class="n">' + f.opens_all_time + '</td><td class="n">' + f.opens_30d + '</td>' +
          '<td class="n">' + (f.last_opened ? i18n.fmtDate(String(f.last_opened).slice(0,10)) : "—") + '</td>' +
          '<td><span class="pill ' + pill + '"><i></i>' + esc(f.engagement) + '</span></td></tr>';
      }).join("") + '</tbody></table></div>' +
      '<div style="height:10px"></div><div class="note"><b>On privacy.</b> This records only that a link was ' +
      'opened and when — no page trail, no location, nothing about what was read. It exists so you can tell ' +
      'whether the tool is worth keeping. The parent handbook says so plainly.</div>';

    $("cbody").innerHTML = h;
  }

  function err(e) {
    if (api.isSignedOut(e)) { api.setToken(null); location.reload(); return; }
    window.SijillToast(e.message || String(e));
  }

  window.SijillCoord = { enter: enter, open: openCoord };
})();
