// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserWalletManager is Ownable {
    struct Wallet {
        address userAddress;
        bool isWhitelisted;
    }

    mapping(address => Wallet) private wallets;
    mapping(address => bool) private blacklistedUsers; // ✅ ניהול משתמשים חסומים
    address[] private walletOwners;

    event WalletCreated(address indexed user, address wallet);
    event WalletDeleted(address indexed user); // ✅ אירוע למחיקת ארנק
    event WhitelistUpdated(address indexed user, bool status);
    event UserBlacklisted(address indexed user, bool status);

    modifier onlyWhitelisted() {
        require(wallets[msg.sender].isWhitelisted, "Not allowed: Not in whitelist");
        _;
    }

    modifier notBlacklisted() {
        require(!blacklistedUsers[msg.sender], "User is blacklisted");
        _;
    }

    constructor() Ownable(msg.sender) {}

    // ✅ יצירת ארנק חדש אם לא קיים
    function createWallet(address _user) external onlyOwner {
        require(wallets[_user].userAddress == address(0), "Wallet already exists");

        wallets[_user] = Wallet({
            userAddress: _user,
            isWhitelisted: true
        });

        walletOwners.push(_user);
        emit WalletCreated(_user, _user);
    }

    // ✅ מחיקת ארנק לחלוטין
    function deleteWallet(address _user) external onlyOwner {
        require(wallets[_user].userAddress != address(0), "Wallet does not exist");

        // מחיקת המשתמש מהמיפוי
        delete wallets[_user];

        // מחיקת הכתובת מהמערך `walletOwners`
        for (uint256 i = 0; i < walletOwners.length; i++) {
            if (walletOwners[i] == _user) {
                walletOwners[i] = walletOwners[walletOwners.length - 1]; // מעבירים את האחרון למיקום הזה
                walletOwners.pop(); // מוחקים את האחרון
                break;
            }
        }

        emit WalletDeleted(_user);
    }

    // ✅ עדכון Whitelist רק אם יש שינוי במצב
    function updateWhitelist(address _user, bool _status) external onlyOwner {
        require(wallets[_user].userAddress != address(0), "Wallet does not exist");
        require(wallets[_user].isWhitelisted != _status, "Already set to this status");

        wallets[_user].isWhitelisted = _status;
        emit WhitelistUpdated(_user, _status);
    }

    // ✅ פונקציה להוספת משתמש ל-Blacklist
    function addToBlacklist(address _user) external onlyOwner {
        require(!blacklistedUsers[_user], "User is already blacklisted");
        blacklistedUsers[_user] = true;
        emit UserBlacklisted(_user, true);
    }

    // ✅ פונקציה להסרת משתמש מה-Blacklist
    function removeFromBlacklist(address _user) external onlyOwner {
        require(blacklistedUsers[_user], "User is not blacklisted");
        blacklistedUsers[_user] = false;
        emit UserBlacklisted(_user, false);
    }

    // ✅ בדיקת סטטוס Whitelist
    function isWhitelisted(address _user) external view returns (bool) {
        return wallets[_user].isWhitelisted;
    }

    // ✅ בדיקת סטטוס Blacklist
    function isBlacklisted(address _user) external view returns (bool) {
        return blacklistedUsers[_user];
    }

    // ✅ שליפת כל בעלי הארנקים
    function getWalletOwners() external view returns (address[] memory) {
        return walletOwners;
    }
}
