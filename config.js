// ============================================================
// WEAZEL NEWS LIVE — SINGLE SOURCE OF TRUTH FOR LAUNCH DAY
// Edit values here. URL params (?ca=&ticker=&name=&pair=) override at runtime.
// ============================================================
window.APP_CONFIG = {
  TOKEN_NAME: "Weazel News",
  TICKER: "$WEAZEL",
  CA: "",                       // Token contract. Leave empty => Demo Mode auto-activates
  PAIR_ADDRESS: "",             // Optional DexScreener liquidity pool address
  BUY_URL: "https://pools.trade",
  TELEGRAM_URL: "https://t.me/",
  X_URL: "https://x.com/",
  REOWN_PROJECT_ID: "YOUR_REOWN_PROJECT_ID", // from cloud.reown.com
  PRIMARY_RPC: "https://rpc.mainnet.chain.robinhood.com", // paste Alchemy RPC here if you have one
  FALLBACK_RPC: "https://robinhood-rpc.publicnode.com",
  CHAIN_ID: 4663,
  EXPLORER_URL: "https://robinhoodchain.blockscout.com",
  DEMO_MODE: true,              // set false on launch day (and set CA)
  MIN_TIP_TOKENS: 1000          // minimum balance needed to send a news tip
};