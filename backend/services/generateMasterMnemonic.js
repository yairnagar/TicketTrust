const bip39 = require("bip39");

function generateMasterMnemonic() {
    const masterMnemonic = bip39.generateMnemonic(256); // 256 ביט = 24 מילים
    console.log("🔑 MASTER_MNEMONIC (24 words):", masterMnemonic);
}

generateMasterMnemonic();
