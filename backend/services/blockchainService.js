require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// **🔹 חיבור לרשת Polygon Amoy**
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);

// **🔹 חיבור לארנק הראשי של הפלטפורמה**
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

// **🔹 טעינת ABI של החוזה החכם**
const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../blockchain/artifacts/contracts/UserWalletManager.sol/UserWalletManager.json'), 'utf8')).abi;

// **🔹 כתובת החוזה**
const contractAddress = process.env.USER_WALLET_MANAGER_CONTRACT;

// **🔹 יצירת חיבור לחוזה**
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// **🔹 שליפת כל הארנקים הרשומים**
async function getWalletOwners() {
    try {
        return await contract.getWalletOwners();
    } catch (error) {
        console.error("❌ Error fetching wallet owners:", error);
        return [];
    }
}

// **🔹 יצירת ארנק חדש**
async function createWalletForUser(userAddress) {
    try {
        const existsInContract = await walletExistsInContract(userAddress);
        if (existsInContract) {
            console.log(`🔹 Wallet already exists in contract for ${userAddress}. Skipping creation.`);
            return false;
        }

        const tx = await contract.createWallet(userAddress);
        await tx.wait();
        console.log(`✅ Wallet created for user: ${userAddress}`);
        return true;
    } catch (error) {
        console.error("❌ Error creating wallet:", error);
        return false;
    }
}

// **🔹 בדיקה אם משתמש נמצא ברשימה**
async function isUserWhitelisted(userAddress) {
    try {
        return await contract.isWhitelisted(userAddress);
    } catch (error) {
        console.error("❌ Error checking whitelist status:", error);
        return false;
    }
}

// **🔹 הוספת משתמש ל-Whitelist**
async function addToWhitelist(userAddress) {
    try {
        const tx = await contract.updateWhitelist(userAddress, true);
        await tx.wait();
        console.log(`✅ Added ${userAddress} to whitelist.`);
        return true;
    } catch (error) {
        console.error("❌ Error adding user to whitelist:", error);
        return false;
    }
}

// **🔹 הסרת משתמש מה-Whitelist**
async function removeFromWhitelist(userAddress) {
    try {
        const tx = await contract.updateWhitelist(userAddress, false);
        await tx.wait();
        console.log(`✅ Removed ${userAddress} from whitelist.`);
        return true;
    } catch (error) {
        console.error("❌ Error removing user from whitelist:", error);
        return false;
    }
}

// **🔹 בדיקה אם משתמש קיים בחוזה**
async function walletExistsInContract(userAddress) {
    try {
        const walletOwners = await getWalletOwners();
        return walletOwners.includes(userAddress);
    } catch (error) {
        console.error("❌ Error checking wallet existence:", error);
        return false;
    }
}

// **🔹 ניהול Blacklist**
async function addToBlacklist(userAddress) {
    try {
        const tx = await contract.addToBlacklist(userAddress);
        await tx.wait();
        console.log(`✅ Blacklisted ${userAddress}`);
        return true;
    } catch (error) {
        console.error("❌ Error blacklisting user:", error);
        return false;
    }
}

async function removeFromBlacklist(userAddress) {
    try {
        const tx = await contract.removeFromBlacklist(userAddress);
        await tx.wait();
        console.log(`✅ Removed ${userAddress} from blacklist.`);
        return true;
    } catch (error) {
        console.error("❌ Error removing user from blacklist:", error);
        return false;
    }
}

async function isUserBlacklisted(userAddress) {
    try {
        return await contract.isBlacklisted(userAddress);
    } catch (error) {
        console.error("❌ Error checking blacklist status:", error);
        return false;
    }
}

module.exports = {
    getWalletOwners,
    createWalletForUser,
    isUserWhitelisted,
    addToWhitelist,
    removeFromWhitelist,
    walletExistsInContract,
    addToBlacklist,
    removeFromBlacklist,
    isUserBlacklisted
};
