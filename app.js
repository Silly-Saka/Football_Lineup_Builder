// Formation definitions and layout data.
const FORMATION_NAMES = [
    "5–4–1",
    "5–3–2",
    "5–2–2–1",
    "4–6–0",
    "4–5–1",
    "4–4–2",
    "4–4–1–1",
    "4–3–3 (Holding)",
    "4–3–3 (Attack)",
    "4–3–3 (Defend)",
    "4–3–2–1",
    "4–3–1–2",
    "4–2–4",
    "4–2–2–2",
    "4–2–1–3",
    "4–1–3–2",
    "4–1–2–3",
    "4–1–2–1–2",
    "3–6–1",
    "3–5–2",
    "3–4–3",
    "3–4–1–2",
    "3–3–3–1",
    "3–3–1–3",
    "3–2–4–1"
];
const DEFAULT_FORMATION = "4–3–3 (Holding)";
const FORMATIONS = Object.fromEntries(FORMATION_NAMES.map(name => [name, buildFormation(name)]));
let formationOpen = false;
// Formation parsing and automatic positioning helpers.
function formationNums(label) { return String(label || "").match(/\d+/g)?.map(Number) || []; }
function normalizeFormationName(name) {
    const raw = String(name || "").trim().replace(/-/g, "–");
    if (FORMATION_NAMES.includes(raw))
        return raw;
    const nums = formationNums(raw).join("–");
    if (nums === "4–3–3")
        return DEFAULT_FORMATION;
    const match = FORMATION_NAMES.find(label => formationNums(label).join("–") === nums);
    return match || DEFAULT_FORMATION;
}
function xPositions(n) {
    if (n <= 1)
        return [50];
    if (n === 2)
        return [42, 58];
    if (n === 3)
        return [28, 50, 72];
    if (n === 4)
        return [18, 39, 61, 82];
    if (n === 5)
        return [12, 31, 50, 69, 88];
    if (n === 6)
        return [9, 25, 41, 59, 75, 91];
    return Array.from({ length: n }, (_, i) => 12 + (76 * (i / (n - 1))));
}
function labelsForRow(n, rowIndex, rowCount, formationName) {
    const isDef = rowIndex === 0;
    const isForward = rowIndex === rowCount - 1;
    const lowerMid = rowIndex === 1;
    const upperMid = rowIndex === rowCount - 2;
    if (isDef) {
        if (n === 5)
            return ["LWB", "LCB", "CB", "RCB", "RWB"];
        if (n === 4)
            return ["LB", "CB", "CB", "RB"];
        if (n === 3)
            return ["LCB", "CB", "RCB"];
        if (n === 2)
            return ["CB", "CB"];
    }
    if (isForward) {
        if (n === 0)
            return [];
        if (n === 1)
            return ["ST"];
        if (n === 2)
            return ["ST", "ST"];
        if (n === 3)
            return ["LW", "ST", "RW"];
        if (n === 4)
            return ["LW", "ST", "ST", "RW"];
    }
    if (/4–3–3/.test(formationName) && n === 3) {
        if (/Attack/i.test(formationName))
            return ["CM", "CAM", "CM"];
        if (/Defend/i.test(formationName))
            return ["CDM", "CM", "CDM"];
        return ["CM", "CDM", "CM"];
    }
    if (n === 1)
        return [lowerMid ? "CDM" : upperMid ? "CAM" : "CM"];
    if (n === 2)
        return [lowerMid ? "CDM" : "CM", upperMid ? "CAM" : "CM"];
    if (n === 3)
        return upperMid ? ["LAM", "CAM", "RAM"] : lowerMid && rowCount > 3 ? ["LCM", "CDM", "RCM"] : ["CM", "CM", "CM"];
    if (n === 4)
        return upperMid ? ["LW", "CAM", "CAM", "RW"] : ["LM", "CM", "CM", "RM"];
    if (n === 5)
        return ["LM", "CM", "CDM", "CM", "RM"];
    if (n === 6)
        return ["LM", "LCM", "CM", "CM", "RCM", "RM"];
    return Array.from({ length: n }, (_, i) => `P${i + 1}`);
}
function buildFormation(label) {
    const name = String(label || DEFAULT_FORMATION).replace(/-/g, "–");
    if (/4–3–3/.test(name)) {
        const backFour = [["LB", 20, 76], ["CB", 40, 78], ["CB", 60, 78], ["RB", 80, 76]];
        const frontThree = [["LW", 24, 30], ["ST", 50, 25], ["RW", 76, 30]];
        if (/Attack/i.test(name)) {
            return [
                ["GK", 50, 91],
                ...backFour,
                ["CM", 35, 58], ["CM", 65, 58], ["CAM", 50, 47],
                ...frontThree
            ];
        }
        if (/Defend/i.test(name)) {
            return [
                ["GK", 50, 91],
                ...backFour,
                ["CDM", 42, 64], ["CDM", 58, 64], ["CM", 50, 54],
                ...frontThree
            ];
        }
        return [
            ["GK", 50, 91],
            ...backFour,
            ["CM", 35, 58], ["CM", 65, 58], ["CDM", 50, 66],
            ...frontThree
        ];
    }
    let nums = formationNums(name);
    if (!nums.length)
        nums = formationNums(DEFAULT_FORMATION);
    if (nums[nums.length - 1] === 0)
        nums = nums.slice(0, -1);
    const rowCount = nums.length;
    let ys;
    if (rowCount === 2)
        ys = [76, 43];
    else if (rowCount === 3)
        ys = [76, 58, 30];
    else if (rowCount === 4)
        ys = [76, 64, 48, 30];
    else if (rowCount === 5)
        ys = [76, 67, 55, 43, 28];
    else
        ys = nums.map((_, i) => 76 - (46 * (i / (Math.max(1, rowCount - 1)))));
    const items = [["GK", 50, 91]];
    nums.forEach((n, rowIndex) => {
        const labels = labelsForRow(n, rowIndex, rowCount, name);
        const xs = xPositions(n);
        for (let i = 0; i < n; i++)
            items.push([labels[i] || `P${i + 1}`, xs[i], ys[rowIndex]]);
    });
    return items;
}
// Shared DOM and state helpers.
const $ = id => document.getElementById(id);
const uid = p => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));
const safeFile = n => String(n || "lineup").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lineup";
const compactLabel = n => String(n || "?").trim().slice(0, 2).toUpperCase() || "?";
let state = createInitialState(), selectedId = "", draggingId = "", suppress = false;
// State creation, import normalization, and escaping helpers.
function makePlayers(f = DEFAULT_FORMATION) { const key = normalizeFormationName(f); return (FORMATIONS[key] || FORMATIONS[DEFAULT_FORMATION]).map(([pos, x, y], i) => ({ id: uid("player"), type: "player", name: pos, short: String(i + 1), x, y, subs: "" })); }
function makeBall(name = "Ball") { return { id: uid("ball"), type: "ball", name, short: "⚽", x: 50, y: 50, subs: "" }; }
function createLineup(name = "Starting XI", formation = DEFAULT_FORMATION) { return { id: uid("lineup"), name, formation, compact: false, items: [...makePlayers(formation), makeBall()] }; }
function createInitialState() { const first = createLineup(); return { title: "My Football Lineup", activeLineupId: first.id, lineups: [first] }; }
function activeLineup() { return state.lineups.find(l => l.id === state.activeLineupId) || state.lineups[0]; }
function selectedItem() { const l = activeLineup(); return l?.items.find(i => i.id === selectedId) || l?.items[0]; }
function updateActiveLineup(updater) { state.lineups = state.lineups.map(l => l.id === state.activeLineupId ? (typeof updater === "function" ? updater(l) : { ...l, ...updater }) : l); }
function normalizeImportedState(raw) {
    if (!raw)
        return createInitialState();
    if (Array.isArray(raw.lineups) && raw.lineups.length) {
        const lineups = raw.lineups.map((l, i) => ({ id: l.id || uid("lineup"), name: l.name || `Lineup ${i + 1}`, formation: normalizeFormationName(l.formation), compact: Boolean(l.compact), items: Array.isArray(l.items) && l.items.length ? l.items.map(item => ({ id: item.id || uid(item.type || "item"), type: item.type || "player", name: item.name || "Unnamed", short: item.short || "?", x: Number(item.x ?? 50), y: Number(item.y ?? 50), subs: item.subs || "" })) : [...makePlayers(normalizeFormationName(l.formation)), makeBall()] }));
        return { title: raw.title || "My Football Lineup", activeLineupId: lineups.some(l => l.id === raw.activeLineupId) ? raw.activeLineupId : lineups[0].id, lineups };
    }
    if (Array.isArray(raw.items) && raw.items.length) {
        const l = { id: uid("lineup"), name: raw.formation ? `${raw.formation} lineup` : "Starting XI", formation: normalizeFormationName(raw.formation), compact: false, items: raw.items };
        return { title: raw.title || "My Football Lineup", activeLineupId: l.id, lineups: [l] };
    }
    return createInitialState();
}
function escapeHtml(v) { return String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }
function escapeAttr(v) { return escapeHtml(v).replace(/`/g, "&#96;"); }
// Rendering functions for the controls, pitch, and editor.
function render() {
    renderControls();
    renderPitch();
    renderEditor();
}
function renderControls() {
    const l = activeLineup();
    $("buildTitle").value = state.title;
    $("lineupName").value = l?.name || "";
    $("formationSearch").value = l?.formation || DEFAULT_FORMATION;
    renderFormationOptions("");
    $("lineupTabs").innerHTML = state.lineups.map(lineup => `<button class="tab ${lineup.id === state.activeLineupId ? "active" : ""}" data-lineup="${escapeAttr(lineup.id)}">${escapeHtml(lineup.name || "Unnamed lineup")}</button>`).join("");
    document.querySelectorAll("[data-lineup]").forEach(btn => btn.onclick = () => switchLineup(btn.dataset.lineup));
    $("deleteLineupBtn").disabled = state.lineups.length <= 1;
    $("compactBtn").textContent = `Compact: ${l?.compact ? "On" : "Off"}`;
    $("compactBtn").className = `btn ${l?.compact ? "green" : "dark"}`;
    const players = l?.items.filter(i => i.type === "player").length || 0, balls = l?.items.filter(i => i.type === "ball").length || 0;
    $("counts").textContent = `${state.lineups.length} lineup${state.lineups.length === 1 ? "" : "s"} · ${players} players · ${balls} ball${balls === 1 ? "" : "s"}`;
}
function renderFormationOptions(query = "") {
    const q = String(query || "").toLowerCase().replace(/-/g, "–").trim();
    const active = normalizeFormationName(activeLineup()?.formation || DEFAULT_FORMATION);
    const matches = FORMATION_NAMES.filter(name => name.toLowerCase().includes(q));
    $("formationOptions").className = `formation-options ${formationOpen ? "open" : ""}`;
    $("formationOptions").innerHTML = matches.length ? matches.map(name => `<button type="button" class="formation-option ${name === active ? "active" : ""}" data-formation="${escapeAttr(name)}">${escapeHtml(name)}</button>`).join("") : `<div class="formation-empty">No formations found</div>`;
    document.querySelectorAll("[data-formation]").forEach(btn => btn.onclick = () => { formationOpen = false; applyFormation(btn.dataset.formation); });
}
function renderPitch() {
    const l = activeLineup();
    $("pitch").innerHTML = `<div class="pitch-lines"><div class="half"></div><div class="circle"></div><div class="dot" style="left:50%;top:50%"></div><div class="box big top"></div><div class="box small top"></div><div class="dot" style="left:50%;top:22%"></div><div class="box big bottom"></div><div class="box small bottom"></div><div class="dot" style="left:50%;top:78%"></div></div>` + (l?.items || []).map(item => {
        const selected = item.id === selectedId ? "selected" : "", style = `left:${item.x}%;top:${item.y}%`;
        if (item.type === "ball")
            return `<button class="ball-tile ${selected}" data-item="${escapeAttr(item.id)}" style="${style}"><span class="ball-icon">⚽</span><span class="ball-label">${escapeHtml(item.name || "Ball")}</span></button>`;
        if (l.compact)
            return `<button class="compact-tile ${selected}" data-item="${escapeAttr(item.id)}" style="${style}">${escapeHtml(compactLabel(item.name))}</button>`;
        const subs = String(item.subs || "").split("\n").map(s => s.trim()).filter(Boolean).slice(0, 4);
        return `<button class="tile ${selected}" data-item="${escapeAttr(item.id)}" style="${style}"><div class="tile-head"><span class="num">${escapeHtml(item.short || "?")}</span><div><div class="tile-name">${escapeHtml(item.name || "Unnamed")}</div></div></div>${subs.length ? `<div class="subs-mini">${subs.map(s => `<div>${escapeHtml(s)}</div>`).join("")}</div>` : ""}</button>`;
    }).join("");
    document.querySelectorAll("[data-item]").forEach(btn => btn.onpointerdown = e => { selectedId = btn.dataset.item; draggingId = selectedId; renderPitch(); renderEditor(); e.preventDefault(); });
}
function renderEditor() {
    const item = selectedItem(), l = activeLineup();
    $("selectedTitle").textContent = item?.name || "Nothing selected";
    $("selectedLineup").textContent = l?.name || "";
    if (!item) {
        $("editor").style.display = "none";
        return;
    }
    $("editor").style.display = "block";
    suppress = true;
    $("tileName").value = item.name || "";
    $("tileShort").value = item.short || "";
    $("tileSubs").value = item.subs || "";
    $("tileX").value = Math.round(item.x || 0);
    $("tileY").value = Math.round(item.y || 0);
    $("deleteTileBtn").disabled = (l?.items.length || 0) <= 1;
    suppress = false;
}
// User actions that mutate the current build.
function switchLineup(id) { const l = state.lineups.find(x => x.id === id); if (!l)
    return; state.activeLineupId = id; selectedId = l.items[0]?.id || ""; render(); }
function updateSelected(patch) { const item = selectedItem(); if (!item)
    return; updateActiveLineup(l => ({ ...l, items: l.items.map(i => i.id === item.id ? { ...i, ...patch } : i) })); }
function copyToNewLineup() { const src = activeLineup(); const copy = { id: uid("lineup"), name: `Lineup ${state.lineups.length + 1}`, formation: src.formation, compact: src.compact, items: src.items.map(i => ({ ...i, id: uid(i.type || "item") })) }; state.lineups.push(copy); state.activeLineupId = copy.id; selectedId = copy.items[0]?.id || ""; render(); }
function deleteLineup() { if (state.lineups.length <= 1)
    return; state.lineups = state.lineups.filter(l => l.id !== state.activeLineupId); state.activeLineupId = state.lineups[0].id; selectedId = state.lineups[0].items[0]?.id || ""; render(); }
function applyFormation(name) { name = normalizeFormationName(name); const l = activeLineup(), fresh = makePlayers(name), old = l.items.filter(i => i.type === "player"), other = l.items.filter(i => i.type !== "player"); const merged = fresh.map((p, i) => ({ ...p, name: old[i]?.name || p.name, short: old[i]?.short || p.short, subs: old[i]?.subs || p.subs })); updateActiveLineup({ formation: name, items: [...merged, ...other] }); selectedId = merged[0]?.id || other[0]?.id || ""; render(); }
function addPlayer() { const l = activeLineup(), count = l.items.filter(i => i.type === "player").length + 1, p = { id: uid("player"), type: "player", name: `Player ${count}`, short: String(count), x: 50, y: 50, subs: "" }; updateActiveLineup({ items: [...l.items, p] }); selectedId = p.id; render(); }
function addBall() { const l = activeLineup(), b = makeBall(`Ball ${l.items.filter(i => i.type === "ball").length + 1}`); updateActiveLineup({ items: [...l.items, b] }); selectedId = b.id; render(); }
function deleteSelectedTile() { const item = selectedItem(); if (!item)
    return; const l = activeLineup(), items = l.items.filter(i => i.id !== item.id); updateActiveLineup({ items }); selectedId = items[0]?.id || ""; render(); }
function saveBuild() { localStorage.setItem("football-lineup-builder-v5", JSON.stringify(state)); message("Saved"); }
function resetBuild() { state = createInitialState(); selectedId = activeLineup().items[0]?.id || ""; render(); }
function message(text) { $("savedMsg").textContent = text; setTimeout(() => $("savedMsg").textContent = "", 1800); }
function exportBuild() { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" })); a.download = `${safeFile(state.title)}.json`; a.click(); URL.revokeObjectURL(a.href); }
function importBuild(file) { if (!file)
    return; const reader = new FileReader(); reader.onload = () => { try {
    state = normalizeImportedState(JSON.parse(String(reader.result)));
    selectedId = activeLineup().items[0]?.id || "";
    render();
}
catch {
    alert("That file could not be imported. Please use an exported lineup JSON file.");
} }; reader.readAsText(file); }
// PNG export drawing helpers.
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }
function fitText(ctx, text, maxWidth) { let s = String(text || ""); if (ctx.measureText(s).width <= maxWidth)
    return s; while (s.length && ctx.measureText(s + "…").width > maxWidth)
    s = s.slice(0, -1); return s + "…"; }
function drawPitch(ctx, w, h) {
    ctx.fillStyle = "#047857";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
        ctx.fillStyle = i % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.045)";
        ctx.fillRect(w / 9 * i, 0, w / 9, h);
    }
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 7;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.beginPath();
    ctx.moveTo(8, h / 2);
    ctx.lineTo(w - 8, h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 90, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    const boxW = 330, boxH = 150, smallW = 170, smallH = 70;
    ctx.strokeRect((w - boxW) / 2, 8, boxW, boxH);
    ctx.strokeRect((w - smallW) / 2, 8, smallW, smallH);
    ctx.strokeRect((w - boxW) / 2, h - boxH - 8, boxW, boxH);
    ctx.strokeRect((w - smallW) / 2, h - smallH - 8, smallW, smallH);
    ctx.beginPath();
    ctx.arc(w / 2, h * .22, 6, 0, Math.PI * 2);
    ctx.arc(w / 2, h * .78, 6, 0, Math.PI * 2);
    ctx.fill();
}
function drawLineupPng(lineup, title) {
    const canvas = document.createElement("canvas"), w = 1600, h = 1200;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    drawPitch(ctx, w, h);
    ctx.fillStyle = "rgba(2,6,23,.75)";
    roundRect(ctx, 34, 28, 760, 82, 24);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "900 34px Arial";
    ctx.fillText(title || "Football Lineup", 58, 73);
    ctx.fillStyle = "#a7f3d0";
    ctx.font = "800 22px Arial";
    ctx.fillText(`${lineup.name || "Lineup"} • ${lineup.formation || ""}${lineup.compact ? " • compact" : ""}`, 58, 101);
    lineup.items.forEach(item => {
        let x = item.x / 100 * w, y = item.y / 100 * h;
        if (item.type === "ball") {
            x = clamp(x, 42, w - 42);
            y = clamp(y, 42, h - 42);
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x, y, 32, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = "32px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⚽", x, y + 1);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            return;
        }
        if (lineup.compact) {
            const radius = 36;
            x = clamp(x, radius + 10, w - radius - 10);
            y = clamp(y, radius + 10, h - radius - 10);
            ctx.fillStyle = "#f8fafc";
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#020617";
            ctx.lineWidth = 7;
            ctx.stroke();
            ctx.fillStyle = "#020617";
            ctx.font = "900 30px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(compactLabel(item.name), x, y + 1);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            return;
        }
        const cw = 220, ch = item.subs ? 124 : 82;
        x = clamp(x, cw / 2 + 10, w - cw / 2 - 10);
        y = clamp(y, ch / 2 + 10, h - ch / 2 - 10);
        ctx.fillStyle = "rgba(2,6,23,.88)";
        roundRect(ctx, x - cw / 2, y - ch / 2, cw, ch, 22);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x - cw / 2 + 38, y - ch / 2 + 38, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.font = "900 19px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.short || "?", x - cw / 2 + 38, y - ch / 2 + 38);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "white";
        ctx.font = "900 25px Arial";
        ctx.fillText(fitText(ctx, item.name || "Unnamed", cw - 86), x - cw / 2 + 76, y - ch / 2 + 38);
        if (item.subs) {
            const sx = x - cw / 2 + 14, sy = y - ch / 2 + 76, sw = cw - 28;
            ctx.fillStyle = "rgba(255,255,255,.1)";
            roundRect(ctx, sx, sy, sw, 38, 12);
            ctx.fill();
            ctx.fillStyle = "#e2e8f0";
            ctx.font = "700 15px Arial";
            String(item.subs).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 2).forEach((line, i) => ctx.fillText(fitText(ctx, line, sw - 18), sx + 9, sy + 16 + i * 17));
        }
    });
    return canvas;
}
async function savePNGs() {
    for (let i = 0; i < state.lineups.length; i++) {
        const lineup = state.lineups[i], canvas = drawLineupPng(lineup, state.title), a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${String(i + 1).padStart(2, "0")}-${safeFile(lineup.name)}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        await new Promise(r => setTimeout(r, 350));
    }
    message(state.lineups.length === 1 ? "PNG saved" : "PNGs saved");
}
// Event bindings.
$("buildTitle").oninput = e => state.title = e.target.value;
$("lineupName").oninput = e => { updateActiveLineup({ name: e.target.value }); renderControls(); $("lineupName").focus(); $("lineupName").setSelectionRange(e.target.value.length, e.target.value.length); };
$("copyLineupBtn").onclick = copyToNewLineup;
$("deleteLineupBtn").onclick = deleteLineup;
$("formationSearch").onfocus = e => { formationOpen = true; e.target.select(); renderFormationOptions(""); };
$("formationSearch").oninput = e => { formationOpen = true; renderFormationOptions(e.target.value); };
$("formationSearch").onkeydown = e => { if (e.key === "Enter") {
    const first = $("formationOptions").querySelector("[data-formation]");
    if (first) {
        formationOpen = false;
        applyFormation(first.dataset.formation);
    }
}
else if (e.key === "Escape") {
    formationOpen = false;
    renderFormationOptions("");
} };
document.addEventListener("click", e => { if (!e.target.closest(".formation-picker")) {
    formationOpen = false;
    renderFormationOptions("");
} });
$("addPlayerBtn").onclick = addPlayer;
$("addBallBtn").onclick = addBall;
$("compactBtn").onclick = () => { updateActiveLineup({ compact: !activeLineup().compact }); render(); };
$("resetBtn").onclick = resetBuild;
$("saveBtn").onclick = saveBuild;
$("pngBtn").onclick = savePNGs;
$("exportBtn").onclick = exportBuild;
$("importBtn").onclick = () => $("fileInput").click();
$("fileInput").onchange = e => { importBuild(e.target.files?.[0]); e.target.value = ""; };
$("tileName").oninput = e => { if (suppress)
    return; updateSelected({ name: e.target.value }); renderPitch(); $("selectedTitle").textContent = e.target.value || "Unnamed"; };
$("tileShort").oninput = e => { if (suppress)
    return; updateSelected({ short: e.target.value.slice(0, 4) }); renderPitch(); };
$("tileSubs").oninput = e => { if (suppress)
    return; updateSelected({ subs: e.target.value }); renderPitch(); };
$("tileX").oninput = e => { if (suppress)
    return; updateSelected({ x: clamp(e.target.value, 0, 100) }); renderPitch(); };
$("tileY").oninput = e => { if (suppress)
    return; updateSelected({ y: clamp(e.target.value, 0, 100) }); renderPitch(); };
$("deleteTileBtn").onclick = deleteSelectedTile;
window.onpointermove = e => { if (!draggingId)
    return; const r = $("pitch").getBoundingClientRect(), x = clamp((e.clientX - r.left) / r.width * 100, 4, 96), y = clamp((e.clientY - r.top) / r.height * 100, 4, 96); updateActiveLineup(l => ({ ...l, items: l.items.map(i => i.id === draggingId ? { ...i, x, y } : i) })); renderPitch(); renderEditor(); };
window.onpointerup = () => draggingId = "";
// Restore saved builds from previous versions, then render the app.
try {
    const saved = localStorage.getItem("football-lineup-builder-v5") || localStorage.getItem("football-lineup-builder-v4") || localStorage.getItem("football-lineup-builder-v2") || localStorage.getItem("football-lineup-builder-v1");
    if (saved)
        state = normalizeImportedState(JSON.parse(saved));
}
catch { }
selectedId = activeLineup()?.items[0]?.id || "";
render();
