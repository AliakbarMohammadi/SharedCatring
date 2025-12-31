const Wallet = require('./wallet.model');
const WalletTransaction = require('./walletTransaction.model');
const CompanyWalletPool = require('./companyWalletPool.model');

// Associations
Wallet.hasMany(WalletTransaction, { foreignKey: 'walletId', as: 'transactions' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

module.exports = {
  Wallet,
  WalletTransaction,
  CompanyWalletPool
};
