import * as ethers from "https://esm.sh/ethers@6.13.4";

/* ---------- CONFIG + URL OVERRIDES ---------- */
const C = window.APP_CONFIG;
const q = new URLSearchParams(location.search);
if (q.get("ca")) C.CA = q.get("ca");
if (q.get("ticker")) C.TICKER = q.get("ticker");
if (q.get("name")) C.TOKEN_NAME = q.get("name");
if (q.get("pair")) C.PAIR_ADDRESS = q.get("pair");
const validCA = ethers.isAddress(C.CA);
const DEMO = C.DEMO_MODE === true || !validCA;
const $ = id => document.getElementById(id);
const short = a => a ? a.slice(0, 6) + "..." + a.slice(-4) : "";
const spoken = a => "Wallet zero X " + a.slice(2, 5).split("").join(" ");

/* ---------- UI BASICS ---------- */
$("buyTop").href = $("buyBtn").href = C.BUY_URL;
$("tgLink").href = C.TELEGRAM_URL; $("xLink").href = C.X_URL;
$("bridgeLink").href = C.EXPLORER_URL.replace("robinhoodchain.blockscout.com", "robinhoodchain.blockscout.com") + "/bridge-tokens";
$("copyCA").onclick = async () => {
  const t = C.CA || "CA not set (demo)";
  try { await navigator.clipboard.writeText(t); } catch { prompt("Copy CA:", t); }
  $("copyCA").textContent = "COPIED ✓"; setTimeout(() => $("copyCA").textContent = "COPY CA", 1500);
};
$("chartBtn").onclick = () => {
  $("tv").classList.toggle("open");
  const pair = state.pair || C.PAIR_ADDRESS || C.CA;
  if (pair && !$("chartFrame").src) $("chartFrame").src = `https://dexscreener.com/robinhood/${pair}?embed=1&theme=dark&trades=0&info=0`;
};
const vid = $("anchor");
vid.addEventListener("error", () => vid.style.display = "none");
vid.play?.().catch(() => { vid.style.display = "none"; });

/* ---------- STATE ---------- */
const state = { pair: C.PAIR_ADDRESS, price: 0, mcap: 0, vol: 0, muted: true, lastBlock: 0, tickerItems: [], fib: [] };
const fmt = n => n >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? "$" + (n / 1e3).toFixed(1) + "K" : "$" + Number(n).toFixed(2);

/* ---------- TICKER ---------- */
function pushTicker(text) {
  state.tickerItems.unshift(text);
  state.tickerItems = state.tickerItems.slice(0, 14);
  renderTicker();
}
function renderTicker() {
  const base = [`${C.TICKER} MCAP ${state.mcap ? fmt(state.mcap) : "--"}`, `PRICE ${state.price ? "$" + state.price : "--"}`, `24H VOL ${state.vol ? fmt(state.vol) : "--"}`];
  $("tickerInner").innerHTML = [...state.tickerItems, ...base].map(t => `<span>${t.replace(/</g, "&lt;")}</span>`).join("");
}
renderTicker();

/* ---------- AUDIO (synth) + SPEECH ---------- */
let ac;
const ctx = () => ac || (ac = new (window.AudioContext || window.webkitAudioContext)());
function tone(f, t0, dur, type = "sine", vol = .15, f2) {
  if (state.muted) return;
  const a = ctx(), o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, a.currentTime + t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + t0 + dur);
  g.gain.setValueAtTime(vol, a.currentTime + t0); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t0 + dur);
  o.connect(g).connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur);
}
const chime = () => { tone(880, 0, .25, "triangle"); tone(1175, .18, .25, "triangle"); tone(1480, .36, .45, "triangle"); };
const siren = () => { tone(700, 0, .3, "square", .08, 1200); tone(1200, .3, .3, "square", .08, 700); };
const wasted = () => { tone(90, 0, 1.2, "sine", .5, 30); tone(55, 0, 1.4, "sawtooth", .2, 25); };
let voice;
function pickVoice() {
  const v = speechSynthesis.getVoices();
  voice = v.find(x => /en-(US|GB)/.test(x.lang) && /(Google|Daniel|Alex|Samantha|Microsoft)/.test(x.name)) || v.find(x => x.lang.startsWith("en"));
}
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text) {
  if (state.muted || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice; u.rate = 1.05; u.pitch = .9;
  speechSynthesis.speak(u);
}
$("muteBtn").onclick = () => {
  state.muted = !state.muted;
  $("muteBtn").textContent = state.muted ? "🔇 UNMUTE WEAZEL AUDIO" : "🔊 MUTE";
  if (!state.muted) { ctx().resume(); chime(); say("Weazel News is live from Leonida."); } else speechSynthesis.cancel();
};

/* ---------- EVENTS ---------- */
const setHeadline = t => $("hlText").textContent = t;
function flash(id) { const e = $(id); e.classList.remove("show"); void e.offsetWidth; e.classList.add("show"); }
function cashDrop() {
  for (let i = 0; i < 24; i++) {
    const b = document.createElement("div"); b.className = "bill"; b.textContent = "$";
    b.style.left = Math.random() * 100 + "%"; b.style.animationDuration = 1.5 + Math.random() * 1.5 + "s";
    $("bills").appendChild(b); setTimeout(() => b.remove(), 3200);
  }
}
function onBuy(addr, line) {
  flash("whale"); cashDrop(); chime();
  setHeadline(`${short(addr)} APED INTO ${C.TICKER}`);
  pushTicker(`BUY: ${short(addr)} aped in${line ? " — " + line : ""}`);
  say(`Breaking out of Vice Port: ${spoken(addr)} just aped into ${C.TOKEN_NAME}. Five star power move.`);
}
function onSell(addr, line) {
  flash("busted"); siren(); setTimeout(wasted, 350);
  document.body.classList.add("busted"); setTimeout(() => document.body.classList.remove("busted"), 2500);
  setHeadline(`BUSTED: ${short(addr)} JEETED`);
  pushTicker(`SELL: ${short(addr)} got BUSTED${line ? " — " + line : ""}`);
  state.fib.unshift(short(addr)); state.fib = state.fib.slice(0, 10);
  $("fibList").innerHTML = state.fib.map(a => `<li>${a}</li>`).join("");
  say(`Fugitive alert: Jeet ${spoken(addr)} just dumped their bag. FIB units are closing in.`);
}

/* ---------- WANTED STARS ---------- */
function updateStars() {
  const tiers = [1e4, 5e4, 1e5, 5e5, 1e6];
  document.querySelectorAll("#stars i").forEach((s, i) => s.classList.toggle("on", state.mcap >= tiers[i]));
}
function updateStats() {
  $("stPrice").textContent = state.price ? "$" + Number(state.price).toPrecision(4) : "--";
  $("stMcap").textContent = state.mcap ? fmt(state.mcap) : "--";
  $("stVol").textContent = state.vol ? fmt(state.vol) : "--";
  updateStars(); renderTicker();
}

/* ---------- RPC WITH FAILOVER ---------- */
let providers = [C.PRIMARY_RPC, C.FALLBACK_RPC].map(u => new ethers.JsonRpcProvider(u, C.CHAIN_ID, { staticNetwork: true }));
async function rpc(fn) {
  let err;
  for (const p of providers) { try { return await fn(p); } catch (e) { err = e; } }
  throw err;
}
const ERC20 = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
const TRANSFER = ethers.id("Transfer(address,address,uint256)");

/* ---------- DEMO MODE ---------- */
const randAddr = () => ethers.hexlify(ethers.randomBytes(20));
const buyRoasts = ["Vice Port is printing money.", "Tommy Vercetti would be proud.", "Lambo bought with Leonida gas money.", "Bro thinks he's Lance Vance."];
const sellRoasts = ["Paper hands, prison hands.", "Jeet fled to Ocean Beach.", "FIB found him at the Malibu Club.", "He sold the bottom again."];
function demoTick() {
  state.mcap = Math.max(5000, state.mcap * (0.9 + Math.random() * 0.25));
  state.price = state.mcap / 1e9; state.vol += Math.random() * 3000; updateStats();
  const a = randAddr();
  if (Math.random() < .6) onBuy(a, buyRoasts[Math.floor(Math.random() * 4)]); else onSell(a, sellRoasts[Math.floor(Math.random() * 4)]);
}
/* ---------- LIVE MODE ---------- */
async function pollDex() {
  try {
    const r = await fetch(`https://api.dexscreener.com/tokens/v1/robinhood/${C.CA}`); const j = await r.json();
    const p = (Array.isArray(j) ? j : j.pairs || []).sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    if (!p) return;
    if (!state.pair && p.pairAddress) state.pair = p.pairAddress;
    state.price = p.priceUsd; state.mcap = p.marketCap || p.fdv || 0; state.vol = p.volume?.h24 || 0; updateStats();
  } catch (e) { console.warn("dex", e); }
}
async function pollLogs() {
  try {
    const pool = (state.pair || "").toLowerCase();
    const head = await rpc(p => p.getBlockNumber());
    if (!state.lastBlock) { state.lastBlock = head; return; }
    if (head <= state.lastBlock) return;
    const logs = await rpc(p => p.getLogs({ address: C.CA, topics: [TRANSFER], fromBlock: state.lastBlock + 1, toBlock: head }));
    state.lastBlock = head;
    if (!pool) return;
    for (const l of logs) {
      const from = ethers.getAddress("0x" + l.topics[1].slice(26)), to = ethers.getAddress("0x" + l.topics[2].slice(26));
      if (from.toLowerCase() === pool) onBuy(to); else if (to.toLowerCase() === pool) onSell(from);
    }
  } catch (e) { console.warn("logs", e); }
}

/* ---------- HOLDER CHECK / VIP ---------- */
let user = { addr: "", status: "", bal: 0 };
function saveSession() { localStorage.setItem("weazel_user", JSON.stringify(user)); }
function renderUser() {
  const has = !!user.addr;
  $("walletState").textContent = has ? short(user.addr) : "NOT CONNECTED";
  $("connectBtn").classList.toggle("hide", has); $("disconnectBtn").classList.toggle("hide", !has);
  $("status").classList.toggle("hide", !has); $("tweetBtn").classList.toggle("hide", !has);
  const vip = user.status === "VIP";
  $("status").className = vip ? "vip" : "tourist";
  $("status").classList.toggle("hide", !has);
  $("status").textContent = vip ? "VIP CITIZEN" : "BROKE TOURIST (0 TOKENS)";
  $("balance").textContent = has ? `Balance: ${Number(user.bal).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${C.TICKER}` : "";
  $("buyBtn").classList.toggle("hide", !has || vip);
  $("tipBox").classList.toggle("hide", !vip);
}
async function checkHolder(addr) {
  user.addr = addr;
  if (DEMO) { user.status = "VIP"; user.bal = 12345; }
  else {
    try {
      const [bal, dec] = await rpc(async p => { const c = new ethers.Contract(C.CA, ERC20, p); return [await c.balanceOf(addr), await c.decimals()]; });
      user.bal = ethers.formatUnits(bal, dec); user.status = bal > 0n ? "VIP" : "TOURIST";
    } catch (e) { $("walletState").textContent = "RPC error, try again"; return; }
  }
  saveSession(); renderUser();
}
function disconnect() {
  user = { addr: "", status: "", bal: 0 }; localStorage.removeItem("weazel_user");
  try { appKit?.disconnect(); } catch {} renderUser();
}
$("disconnectBtn").onclick = disconnect;
$("pasteBtn").onclick = () => {
  const v = $("pasteAddr").value.trim();
  if (!ethers.isAddress(v)) return alert("Invalid 0x address");
  checkHolder(ethers.getAddress(v));
};
$("buyBtn").onclick = null;
$("tweetBtn").onclick = () => {
  const xh = (C.X_URL.split("x.com/")[1] || "").replace(/\/.*/, "");
  const txt = `${user.status === "VIP" ? "I'm a VIP CITIZEN" : "I'm a BROKE TOURIST"} of Leonida on ${C.TICKER}. ${xh ? "@" + xh : ""} Watch live:`;
  window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(txt) + "&url=" + encodeURIComponent(location.origin + location.pathname), "_blank");
};

/* ---------- NEWS TIPS (cooldown + filter) ---------- */
const BAD = /\b(fuck\w*|shit\w*|bitch\w*|cunt|nigg\w*|fag\w*|retard\w*|slut|whore|dick|rape)\b/gi;
const LINK = /(https?:\/\/\S+|www\.\S+|\b\S+\.(com|io|xyz|net|org|app|gg|me|co|ly)\b\S*|t\.me\S*)/gi;
let lastTip = 0;
$("tipBtn").onclick = () => {
  const left = 60 - Math.floor((Date.now() - lastTip) / 1000);
  if (left > 0) { $("tipMsg").textContent = `Cooldown: ${left}s`; return; }
  if (user.status !== "VIP" || (!DEMO && Number(user.bal) < C.MIN_TIP_TOKENS)) { $("tipMsg").textContent = `Need ${C.MIN_TIP_TOKENS}+ ${C.TICKER}`; return; }
  let t = $("tipInput").value.replace(LINK, "").replace(BAD, "***").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!t) return;
  lastTip = Date.now(); $("tipInput").value = ""; $("tipMsg").textContent = "Tip aired!";
  pushTicker(`CITIZEN TIP (${short(user.addr)}): ${t}`); setHeadline(t); chime();
  say(`Citizen tip from ${spoken(user.addr)}: ${t}.`);
};

/* ---------- CHAIN HELPERS + ADD TO WALLET ---------- */
const hexId = "0x" + Number(C.CHAIN_ID).toString(16);
async function ensureChain(prov) {
  try { await prov.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] }); }
  catch (e) {
    if (e.code === 4902 || /Unrecognized|not added/i.test(e.message || "")) {
      await prov.request({ method: "wallet_addEthereumChain", params: [{ chainId: hexId, chainName: "Robinhood Chain", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: [C.PRIMARY_RPC], blockExplorerUrls: [C.EXPLORER_URL] }] });
    } else throw e;
  }
}
$("addWallet").onclick = async () => {
  const prov = (appKit && appKit.getWalletProvider && appKit.getWalletProvider()) || window.ethereum;
  if (!prov) return alert("Connect a wallet first (or open in a wallet browser).");
  if (!validCA) return alert("Token CA not set yet.");
  try {
    await ensureChain(prov);
    await prov.request({ method: "wallet_watchAsset", params: { type: "ERC20", options: { address: C.CA, symbol: C.TICKER.replace("$", "").slice(0, 11), decimals: 18 } } });
  } catch (e) { console.warn(e); }
};

/* ---------- REOWN APPKIT ---------- */
let appKit = null;
async function initAppKit() {
  try {
    const [{ createAppKit }, { EthersAdapter }, { defineChain }] = await Promise.all([
      import("https://esm.sh/@reown/appkit@1.7.8"),
      import("https://esm.sh/@reown/appkit-adapter-ethers@1.7.8"),
      import("https://esm.sh/@reown/appkit@1.7.8/networks")
    ]);
    const robin = defineChain({
      id: C.CHAIN_ID, caipNetworkId: `eip155:${C.CHAIN_ID}`, chainNamespace: "eip155", name: "Robinhood Chain",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [C.PRIMARY_RPC] } },
      blockExplorers: { default: { name: "Blockscout", url: C.EXPLORER_URL } }
    });
    appKit = createAppKit({
      adapters: [new EthersAdapter()], networks: [robin], defaultNetwork: robin,
      projectId: C.REOWN_PROJECT_ID, allWallets: "SHOW",
      metadata: { name: "Weazel News Live", description: "Leonida satirical news terminal", url: location.origin, icons: [] },
      features: { analytics: false, email: false, socials: false }
    });
    $("connectBtn").onclick = () => appKit.open();
    appKit.subscribeAccount(async acc => {
      if (acc.isConnected && acc.address) {
        try { const p = appKit.getWalletProvider(); if (p) await ensureChain(p); } catch (e) { console.warn("chain", e); }
        if (user.addr.toLowerCase() !== acc.address.toLowerCase()) checkHolder(acc.address);
      }
    });
  } catch (e) {
    console.warn("AppKit failed", e);
    $("connectBtn").onclick = async () => {
      if (!window.ethereum) return alert("No wallet found. Use the paste-address box.");
      const a = await window.ethereum.request({ method: "eth_requestAccounts" });
      try { await ensureChain(window.ethereum); } catch {}
      checkHolder(a[0]);
    };
  }
}

/* ---------- BOOT ---------- */
(function boot() {
  try { const s = JSON.parse(localStorage.getItem("weazel_user") || "null"); if (s?.addr) { user = s; renderUser(); } } catch {}
  initAppKit();
  if (DEMO) {
    state.mcap = 20000; updateStats();
    pushTicker(`DEMO MODE — simulated trades for ${C.TICKER}`);
    setInterval(demoTick, 12000); setTimeout(demoTick, 3000);
  } else {
    pollDex(); setInterval(pollDex, 10000);
    setInterval(pollLogs, 4000);
    pushTicker(`LIVE — watching ${short(C.CA)} on Robinhood Chain`);
  }
})();