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
  var C = { tab: "dash", dash: null, stats: null, mtab: "students" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c];
    });
  }
  function busy(el) { el.innerHTML = '<div class="loading"><span class="spin"></span></div>'; }

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
    ["v-gate","v-who","v-class","v-student","v-coord"].forEach(function (v) {
      $(v).hidden = (v !== "v-coord");
    });
    window.scrollTo(0, 0);
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

    h += '<div class="filters"><input type="search" id="dSearch" placeholder="' +
         (ar ? "ابْحَثْ عَنْ طَالِب" : "Find a student") + '" style="flex:1;max-width:260px">' +
         '<select id="dFlag"><option value="">' + (ar ? "كُلُّ الطُّلَّاب" : "All students") + '</option>' +
         '<option value="crit">' + (ar ? "أَحْمَر" : "Red flags only") + '</option>' +
         '<option value="any">' + (ar ? "يَحْتَاجُ اِنْتِبَاهًا" : "Needs attention") + '</option></select>' +
         '<span style="flex:1"></span><button class="btn ghost sm" id="dCsv">Export CSV</button></div>';

    h += '<div class="tw"><table><thead><tr>' +
      ['', T("student"), T("classW"), T("attendance"), T("flags"), T("pages"), T("lastHeard")]
        .slice(1).map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") +
      '</tr></thead><tbody id="dRows"></tbody></table></div>';
    $("cbody").innerHTML = h;
    fillRows();
    $("dSearch").oninput = fillRows;
    $("dFlag").onchange = fillRows;
    $("dCsv").onclick = exportCsv;
  }

  function tile(k, v, f, alert) {
    return '<div class="tile' + (alert ? " alert" : "") + '"><div class="k">' + esc(k) +
           '</div><div class="v">' + esc(v) + '</div><div class="f">' + esc(f) + '</div></div>';
  }

  function visibleRows() {
    var q = ($("dSearch") && $("dSearch").value || "").toLowerCase();
    var fl = ($("dFlag") && $("dFlag").value) || "";
    return C.dash.students.filter(function (s) {
      if (q && s.name.toLowerCase().indexOf(q) < 0) return false;
      if (fl === "crit" && (!s.flags || s.flags.kind !== "crit")) return false;
      if (fl === "any" && (!s.flags || !s.flags.kind)) return false;
      return true;
    });
  }

  function fillRows() {
    var rows = visibleRows();
    $("dRows").innerHTML = rows.length ? rows.map(function (s) {
      var f = s.flags || {};
      return '<tr data-id="' + esc(s.id) + '"><td><b>' + esc(s.name) + '</b></td>' +
        '<td>' + esc(s["class"] || "—") + '</td>' +
        '<td class="n">' + (f.rate == null ? "—" : f.rate + "%") + '</td>' +
        '<td>' + (f.kind ? '<span class="pill ' + f.kind + '"><i></i>' + esc(f.message) + '</span>'
                         : '<span style="color:var(--ink-3)">—</span>') + '</td>' +
        '<td class="n">' + (s.pages ? s.pages.solid + (s.pages.partial ? "+" + s.pages.partial : "") +
            ' <span style="color:var(--ink-3)">juz ' + s.pages.juz + '</span>' : "—") + '</td>' +
        '<td class="n">' + (s.last_heard ? i18n.fmtDate(s.last_heard) : "—") + '</td></tr>';
    }).join("") : '<tr><td colspan="6" style="color:var(--ink-3);padding:18px">No students match.</td></tr>';
  }

  function exportCsv() {
    var rows = visibleRows();
    var head = ["Student","Class","Attendance %","Needs attention","Pages solid","Juz","Last heard"];
    var lines = [head.join(",")].concat(rows.map(function (s) {
      var f = s.flags || {};
      return [s.name, s["class"] || "", f.rate == null ? "" : f.rate, f.message || "",
              s.pages ? s.pages.solid : "", s.pages ? s.pages.juz : "", s.last_heard || ""]
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
                ["links",    ar ? "الرَّوَابِط" : "Links"],
                ["calendar", ar ? "التَّقْوِيم" : "Calendar"],
                ["log",      ar ? "سِجِلُّ التَّغْيِيرَات" : "Change log"],
                ["maint",    ar ? "الصِّيَانَة" : "Maintenance"]];
    $("cbody").innerHTML =
      '<div class="mtabs" id="mtabs">' + tabs.map(function (x) {
        return '<button data-m="' + x[0] + '" aria-pressed="' + (C.mtab === x[0]) + '">' + esc(x[1]) + '</button>';
      }).join("") + '</div><div id="mbody"></div>';
    $("mtabs").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () { C.mtab = b.dataset.m; renderManage(); };
    });
    var body = $("mbody"); busy(body);
    if (C.mtab === "students") return manageStudents(body);
    if (C.mtab === "links")    return manageLinks(body);
    if (C.mtab === "calendar") return manageCalendar(body);
    if (C.mtab === "log")      return manageLog(body);
    return manageMaint(body);
  }

  function manageStudents(body) {
    api.read("api_dashboard", {}).then(function (d) {
      body.innerHTML =
        '<div class="filters"><span style="flex:1"></span>' +
        '<button class="btn sm" id="addStu">+ Add student</button></div>' +
        '<div class="tw"><table><thead><tr><th>Student</th><th>Class</th><th>Open homework</th>' +
        '<th>Not revisited</th><th></th></tr></thead><tbody>' +
        d.students.map(function (s) {
          return '<tr><td><b>' + esc(s.name) + '</b></td><td>' + esc(s["class"] || "—") + '</td>' +
            '<td class="n">' + s.open_homework + '</td><td class="n">' + s.not_revisited + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="mini stu-go" data-id="' + esc(s.id) + '">Open</button> ' +
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
    window.SijillSheet("Remove " + name + " from the madrasah?",
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
    var url = location.origin + location.pathname.replace(/[^/]*$/, "") + "family.html#c=" + encodeURIComponent(token);
    window.SijillSheet("Send this now — it cannot be shown again",
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

  function manageLinks(body) {
    Promise.all([api.read("api_links"), api.read("api_dashboard", {})]).then(function (r) {
      var links = r[0], students = r[1].students;
      body.innerHTML =
        '<div class="filters"><span style="flex:1"></span><button class="btn sm" id="newLink">+ Issue a link</button></div>' +
        '<div class="tw"><table><thead><tr><th>Link covers</th><th>Whose</th><th>Sent on</th>' +
        '<th>Opens (30d)</th><th>Last opened</th><th></th></tr></thead><tbody>' +
        (links.length ? links.map(function (g) {
          return '<tr><td><b>' + esc(g.children || "—") + '</b></td><td>' + esc(g.label) + '</td>' +
            '<td>' + esc(g.channel || "—") + '</td><td class="n">' + g.opens_30d + '</td>' +
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
      '<option>grandfather</option><option>guardian</option></select>' +
      '<select id="nlChan" class="mini"><option value="classdojo">ClassDojo</option>' +
      '<option value="whatsapp">WhatsApp</option><option value="email">Email</option></select></div>' +
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
          p_label: $("nlLabel").value, p_channel: $("nlChan").value
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
    api.read("api_classes").then(function (cs) {
      var today = new Date().toISOString().slice(0, 10);
      body.innerHTML =
        '<div class="note"><b>Close a day.</b> Snow, Eid, no teacher available. A closed day stops counting ' +
        'as an absence for every child in it — that is the whole point of it, and it is why teachers cannot ' +
        'do it themselves.<div style="height:10px"></div>' +
        '<div class="filters" style="margin:0"><input type="date" id="cdDate" value="' + today + '">' +
        '<select id="cdScope"><option value="">Whole school</option>' +
        cs.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join("") +
        '</select><input type="search" id="cdNote" placeholder="Reason — snow, Eid, no teacher…">' +
        '<button class="btn sm" id="cdGo">Mark closed</button>' +
        '<button class="btn ghost sm" id="cdOpen">Reopen</button></div>' +
        '<div id="cdOut" style="margin-top:10px"></div></div>';
      $("cdGo").onclick = function () {
        api.write("api_close_day", { p_on: $("cdDate").value, p_class: $("cdScope").value || null,
                                     p_note: $("cdNote").value || null }, "closure")
          .then(function (r) {
            $("cdOut").innerHTML = '<span class="pill ' + (r.closed ? "mute" : "late") + '"><i></i>' +
              (r.closed ? r.closed + " class(es) closed on " + i18n.fmtDate($("cdDate").value)
                        : esc(r.note || "nothing to close that day")) + '</span>';
          }).catch(err);
      };
      $("cdOpen").onclick = function () {
        api.write("api_reopen_day", { p_on: $("cdDate").value, p_class: $("cdScope").value || null }, "reopen")
          .then(function (r) {
            $("cdOut").innerHTML = '<span class="pill mute"><i></i>' + r.reopened + " reopened</span>";
          }).catch(err);
      };
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
          return '<tr><td class="n">' + esc(String(r.at).slice(0, 16).replace("T", " ")) + '</td>' +
            '<td>' + esc(r.actor_name) + '</td><td>' + esc(r.entity) + '</td>' +
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
