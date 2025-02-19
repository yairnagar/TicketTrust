// require('dotenv').config();
// const { createWalletIfNotExists, getWhitelistedWallets, isUserWhitelisted, updateWhitelistIfNeeded} = require('../services/blockchainService');

// async function testCreateWallet() {
//     console.log("\n🔄 Checking if wallet needs to be created...");
//     const userAddress = "0x8FC0D008a1cB0c84a5Ec379330595F4b086e7a54";
//     await createWalletIfNotExists(userAddress);

// }

// async function testWalletCreation() {
//     const userAddress = process.env.DEVELOPER_WALLET;
//     console.log("\n🔄 Checking if user exists in contract...");
//     const isWhitelisted = await isUserWhitelisted(userAddress);
//     console.log("✅ Does wallet exist in contract?", isWhitelisted);
// }

// async function testGetWhitelistedWallets() {
//     console.log("\n🔄 Fetching whitelisted wallets...");
//     const wallets = await getWhitelistedWallets();
//     console.log("✅ Whitelisted Wallets:", wallets);
// }

// async function testUpdateWhitelist() {
//     const userAddress = process.env.DEVELOPER_WALLET;
//     console.log("\n🔄 Checking if whitelist update is needed...");
//     await updateWhitelistIfNeeded(userAddress, false);
//     console.log("✅ User removed from whitelist!");

//     let isWhitelisted = await isUserWhitelisted(userAddress);
//     console.log("✅ Is user whitelisted after removal?", isWhitelisted);
//     console.log("\n🔄 Checking if re-adding to whitelist is needed...");
//     await updateWhitelistIfNeeded(userAddress, true);
//     console.log("✅ User added back to whitelist!");

//     isWhitelisted = await isUserWhitelisted(userAddress);
//     console.log("✅ Is user whitelisted after re-adding?", isWhitelisted);
// }



// async function runTests() {
//     await testCreateWallet();
//     await testWalletCreation();
//     await testGetWhitelistedWallets();
//     await testUpdateWhitelist();
// }

// runTests();




require('dotenv').config();
const { 
    createWalletIfNotExists, 
    getWhitelistedWallets, 
    isUserWhitelisted, 
    addToWhitelist, 
    removeFromWhitelist 
} = require('../services/blockchainService');

const userAddress = process.env.DEVELOPER_WALLET;

async function testCreateWallet() {
    console.log("\n🔄 Checking if wallet needs to be created...");
    await createWalletIfNotExists(userAddress);
}

async function testWhitelistStatus() {
    console.log("\n🔄 Checking if user exists in contract...");
    const isWhitelisted = await isUserWhitelisted(userAddress);
    console.log(`✅ Is user whitelisted? ${isWhitelisted}`);
}

async function testGetWhitelistedWallets() {
    console.log("\n🔄 Fetching whitelisted wallets...");
    const wallets = await getWhitelistedWallets();
    console.log("✅ Whitelisted Wallets:", wallets);
}

async function testWhitelistUpdate() {
    console.log("\n🔄 Removing user from whitelist...");
    await removeFromWhitelist(userAddress);
    let isWhitelisted = await isUserWhitelisted(userAddress);
    console.log(`✅ Is user whitelisted after removal? ${isWhitelisted}`);

    console.log("\n🔄 Adding user back to whitelist...");
    await addToWhitelist(userAddress);
    isWhitelisted = await isUserWhitelisted(userAddress);
    console.log(`✅ Is user whitelisted after re-adding? ${isWhitelisted}`);
}

async function runTests() {
    await testCreateWallet();
    await testWhitelistStatus();
    await testGetWhitelistedWallets();
    await testWhitelistUpdate();
}

runTests();
