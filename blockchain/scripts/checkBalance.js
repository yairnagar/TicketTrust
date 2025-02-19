require('dotenv').config();
const { ethers } = require('ethers');


console.log(process.env.POLYGON_RPC_URL);
console.log(process.env.DEPLOYER_PRIVATE_KEY);
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

async function main() {
    const balance = await provider.getBalance(wallet.address);
    console.log(`Wallet Address: ${wallet.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} MATIC`);
}

main();
