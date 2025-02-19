require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🚀 Deploying contract with account: ${deployer.address}`);

    // 📌 יצירת החוזה
    const UserWalletManager = await ethers.getContractFactory("UserWalletManager");
    const contract = await UserWalletManager.deploy();

    await contract.waitForDeployment();
    console.log(`✅ Contract deployed at: ${await contract.getAddress()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });



