const zarinpalGateway = require('./zarinpal.gateway');
const idpayGateway = require('./idpay.gateway');
const config = require('../config');

const gateways = {
  zarinpal: zarinpalGateway,
  idpay: idpayGateway
};

const getGateway = (name) => {
  const gatewayName = name || config.gateways.default;
  const gateway = gateways[gatewayName];
  
  if (!gateway) {
    throw new Error(`درگاه پرداخت ${gatewayName} پشتیبانی نمی‌شود`);
  }
  
  return gateway;
};

module.exports = {
  getGateway,
  zarinpalGateway,
  idpayGateway
};
