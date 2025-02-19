const { hdkey } = require("ethereumjs-wallet");
const bip39 = require("bip39");
const crypto = require("crypto");
const { Wallet } = require("../models");

// טוען את ה-Master Mnemonic מהסביבה
const MASTER_MNEMONIC = process.env.MASTER_MNEMONIC;

async function generateUserWallet(userId) {
    if (!MASTER_MNEMONIC) throw new Error("MASTER_MNEMONIC is not set");

    // גוזרים את ה-Seed מה-Mnemonic
    const seed = await bip39.mnemonicToSeed(MASTER_MNEMONIC);
    const hdWallet = hdkey.fromMasterSeed(seed);

    // 🔹 המרה ל-Index מספרי תקין עבור BIP-44
    const userHash = crypto.createHash("sha256").update(userId).digest("hex");
    const userIndex = BigInt("0x" + userHash.slice(0, 8)) % 2n ** 31n; // ערך תקף בתוך גבולות BIP-44

    // 🔹 יוצרים את ה-Path לפי BIP44 (Ethereum: 60')
    const userPath = `m/44'/60'/0'/0/${userIndex}`;
    const userNode = hdWallet.derivePath(userPath);

    // 🔹 יוצרים את כתובת הארנק
    const userWallet = userNode.getWallet();
    const userAddress = `0x${userWallet.getAddress().toString("hex")}`;

    return userAddress;
}

// 🔹 יצירת רשומת ארנק במסד הנתונים
async function createUserWallet(userId) {
    const blockchainAddress = await generateUserWallet(userId);

    const wallet = await Wallet.create({
        userId,
        blockchainAddress,
        balance: 0
    });

    return wallet;
}

module.exports = { generateUserWallet, createUserWallet };
