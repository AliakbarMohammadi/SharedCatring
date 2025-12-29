const express = require('express');
const router = express.Router();
const walletService = require('../../../services/walletService');

router.post('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const companyId = req.headers['x-company-id'];
    const wallet = await walletService.createWallet(userId, companyId);
    res.status(201).json({ success: true, data: wallet, message: 'کیف پول با موفقیت ایجاد شد' });
  } catch (error) { next(error); }
});

router.get('/balance', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const balance = await walletService.getBalance(userId);
    res.json({ success: true, data: balance, message: 'موجودی با موفقیت دریافت شد' });
  } catch (error) { next(error); }
});

router.post('/deposit', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const { amount, description } = req.body;
    const result = await walletService.deposit(userId, amount, description || 'شارژ کیف پول');
    res.json({ success: true, data: result, message: 'مبلغ با موفقیت به کیف پول اضافه شد' });
  } catch (error) { next(error); }
});

router.post('/withdraw', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const { amount, description } = req.body;
    const result = await walletService.withdraw(userId, amount, description || 'برداشت از کیف پول');
    res.json({ success: true, data: result, message: 'مبلغ با موفقیت از کیف پول کسر شد' });
  } catch (error) { next(error); }
});

router.post('/pay', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const { amount, orderId, description } = req.body;
    const result = await walletService.pay(userId, amount, orderId, description);
    res.json({ success: true, data: result, message: 'پرداخت با موفقیت انجام شد' });
  } catch (error) { next(error); }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const result = await walletService.getTransactions(userId, req.query);
    res.json({
      success: true,
      data: result.transactions,
      message: 'تراکنش‌ها با موفقیت دریافت شد',
      meta: { page: result.page, limit: result.limit, total: result.total }
    });
  } catch (error) { next(error); }
});

module.exports = router;
