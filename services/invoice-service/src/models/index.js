const Invoice = require('./invoice.model');
const InvoiceItem = require('./invoiceItem.model');
const InvoiceSequence = require('./invoiceSequence.model');

// Associations
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

module.exports = {
  Invoice,
  InvoiceItem,
  InvoiceSequence
};
