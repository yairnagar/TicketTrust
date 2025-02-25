const { Wallet, User } = require('../models');
const { sendResponse } = require('./response');

/**
 * Get wallet details for the logged-in user
 */
const getMyWallet = async (req, res) => {
    try {
        const userId = req.user.id;

        const wallet = await Wallet.findOne({
            where: { userId },
            attributes: [
                'id',
                'blockchainAddress',
                'balance',
                'createdAt'
            ]
        });

        if (!wallet) {
            return sendResponse(res, false, 'Wallet not found', null, 'Not found', 404);
        }

        return sendResponse(res, true, 'Wallet details retrieved successfully', wallet);
    } catch (error) {
        console.error('❌ Error fetching wallet:', error);
        return sendResponse(res, false, 'Failed to fetch wallet details', null, error.message, 500);
    }
};

/**
 * Get all wallets (admin only)
 */
const getAllWallets = async (req, res) => {
    try {
        const wallets = await Wallet.findAll({
            include: [{
                model: User,
                attributes: ['id', 'fullName', 'email', 'userType']
            }],
            attributes: [
                'id',
                'blockchainAddress',
                'balance',
                'createdAt',
                'updatedAt'
            ]
        });

        return sendResponse(res, true, 'All wallets retrieved successfully', wallets);
    } catch (error) {
        console.error('❌ Error fetching all wallets:', error);
        return sendResponse(res, false, 'Failed to fetch wallets', null, error.message, 500);
    }
};

/**
 * Get wallet by user ID (admin only)
 */
const getWalletByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const wallet = await Wallet.findOne({
            where: { userId },
            include: [{
                model: User,
                attributes: ['id', 'fullName', 'email', 'userType', 'createdAt']
            }],
            attributes: [
                'id',
                'blockchainAddress',
                'balance',
                'createdAt',
                'updatedAt'
            ]
        });

        if (!wallet) {
            return sendResponse(res, false, 'Wallet not found for this user', null, 'Not found', 404);
        }

        return sendResponse(res, true, 'Wallet details retrieved successfully', wallet);
    } catch (error) {
        console.error('❌ Error fetching wallet:', error);
        return sendResponse(res, false, 'Failed to fetch wallet details', null, error.message, 500);
    }
};

module.exports = {
    getMyWallet,
    getAllWallets,
    getWalletByUserId
}; 