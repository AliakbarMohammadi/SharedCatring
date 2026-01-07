const { walletService } = require('../../services');
const logger = require('../../utils/logger');

class WalletController {
  // Get user wallet balance
  async getBalance(req, res, next) {
    try {
      const wallet = await walletService.getBalance(req.user.id);
      
      res.json({
        success: true,
        data: wallet,
        message: 'موجودی کیف پول دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transactions history
  async getTransactions(req, res, next) {
    try {
      const result = await walletService.getTransactions(req.user.id, req.query);
      
      res.json({
        success: true,
        data: result.transactions,
        message: 'تاریخچه تراکنش‌ها دریافت شد',
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Topup personal wallet
  async topup(req, res, next) {
    try {
      const result = await walletService.topupPersonal(
        req.user.id,
        req.body.amount,
        null,
        req.body.description
      );
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'کیف پول با موفقیت شارژ شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get company wallet pool
  async getCompanyPool(req, res, next) {
    try {
      const pool = await walletService.getCompanyPool(req.params.companyId);
      
      res.json({
        success: true,
        data: pool,
        message: 'اطلاعات حساب شرکت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Topup company pool
  async topupCompany(req, res, next) {
    try {
      const pool = await walletService.topupCompanyPool(
        req.params.companyId,
        req.body.amount,
        req.body.description
      );
      
      res.status(201).json({
        success: true,
        data: pool,
        message: 'حساب شرکت با موفقیت شارژ شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Allocate subsidy to employee
  async allocateSubsidy(req, res, next) {
    try {
      const result = await walletService.allocateSubsidy(
        req.params.companyId,
        req.body.employeeUserId,
        req.body.amount,
        req.body.description
      );
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'یارانه با موفقیت تخصیص داده شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get company employees wallets
  async getCompanyEmployees(req, res, next) {
    try {
      const result = await walletService.getCompanyEmployees(
        req.params.companyId,
        req.query
      );
      
      res.json({
        success: true,
        data: result.employees,
        message: 'لیست کیف پول کارمندان دریافت شد',
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Internal: Deduct from wallet
  async internalDeduct(req, res, next) {
    try {
      const result = await walletService.deduct(
        req.body.userId,
        req.body.amount,
        req.body.balanceType,
        req.body.referenceType,
        req.body.referenceId,
        req.body.description
      );
      
      res.json({
        success: true,
        data: result,
        message: 'مبلغ از کیف پول کسر شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Internal: Refund to wallet
  async internalRefund(req, res, next) {
    try {
      const result = await walletService.refund(
        req.body.userId,
        req.body.amount,
        req.body.balanceType,
        req.body.referenceType,
        req.body.referenceId,
        req.body.description
      );
      
      res.json({
        success: true,
        data: result,
        message: 'مبلغ به کیف پول برگشت داده شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Internal: Check balance
  async internalCheckBalance(req, res, next) {
    try {
      const result = await walletService.checkBalance(
        req.body.userId,
        req.body.amount,
        req.body.balanceType
      );
      
      res.json({
        success: true,
        data: result,
        message: 'موجودی بررسی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Internal: Check company pool balance
  async checkCompanyBalance(req, res, next) {
    try {
      const result = await walletService.checkCompanyPoolBalance(
        req.params.companyId,
        req.body.amount
      );
      
      res.json({
        success: true,
        data: result,
        message: 'موجودی حساب شرکت بررسی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Internal: Deduct subsidy from company pool
  async deductCompanySubsidy(req, res, next) {
    try {
      const result = await walletService.deductCompanySubsidy(
        req.params.companyId,
        req.body.employeeUserId,
        req.body.amount,
        req.body.orderId,
        req.body.description
      );
      
      res.json({
        success: true,
        data: result,
        message: 'یارانه از حساب شرکت کسر شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
