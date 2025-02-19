require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
module.exports = {
    solidity: "0.8.28",
    networks: {
        hardhat: {}, // רשת מקומית
        polygonAmoy: {
            url: process.env.POLYGON_RPC_URL, // ה-RPC שלך
            accounts: [process.env.DEPLOYER_PRIVATE_KEY] // המפתח הפרטי שלך
        }
    }
};
