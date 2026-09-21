/**
 * @file paymentController.js
 * @description Contrôleur REST pour les paiements Mobile Money (Wave, Orange, MTN, Moov).
 */

import { PaymentService } from '../services/paymentService.js';
import { 
  HTTP_STATUS, 
  ERROR_MESSAGES, 
  VALIDATION_PATTERNS 
} from '../config/constants.js';

export class PaymentController {
  /**
   * Retourne la liste des opérateurs Mobile Money disponibles.
   */
  static getOperators(req, res) {
    const operators = PaymentService.getAvailableOperators();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: operators
    });
  }

  /**
   * Initie et confirme un paiement Mobile Money pour un ticket.
   */
  static initiatePayment(req, res) {
    const { bookingRef, operatorId, phone, amountCfa, passengerName } = req.body || {};

    // 1. Validation de l'opérateur
    if (!operatorId || typeof operatorId !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'MISSING_OPERATOR',
          message: 'L\'opérateur de paiement (wave, orange, mtn, moov) est obligatoire.'
        }
      });
    }

    // 2. Validation du numéro de téléphone
    if (!phone || !VALIDATION_PATTERNS.PHONE_CI.test(phone.trim())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_PHONE_NUMBER',
          message: 'Le numéro de téléphone du compte Mobile Money est invalide.'
        }
      });
    }

    // 3. Validation du montant
    const parsedAmount = Number(amountCfa);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Le montant du ticket doit être un nombre positif supérieur à zéro.'
        }
      });
    }

    try {
      const result = PaymentService.processPayment({
        bookingRef,
        operatorId,
        phone,
        amountCfa: parsedAmount,
        passengerName
      });

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Paiement Mobile Money validé avec succès.',
        data: result
      });
    } catch (err) {
      if (err.message === 'INVALID_PAYMENT_OPERATOR') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'INVALID_PAYMENT_OPERATOR',
            message: ERROR_MESSAGES.INVALID_PAYMENT_OPERATOR
          }
        });
      }

      if (err.message === 'INVALID_PAYMENT_AMOUNT') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'INVALID_PAYMENT_AMOUNT',
            message: ERROR_MESSAGES.INVALID_PAYMENT_AMOUNT
          }
        });
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          code: 'PAYMENT_PROCESSING_ERROR',
          message: ERROR_MESSAGES.PAYMENT_FAILED
        }
      });
    }
  }

  /**
   * Vérifie le statut d'une transaction de paiement par son identifiant.
   */
  static verifyPayment(req, res) {
    const { transactionId } = req.params;

    if (!transactionId || typeof transactionId !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_TRANSACTION_ID',
          message: 'L\'identifiant de transaction est obligatoire.'
        }
      });
    }

    const transaction = PaymentService.getTransactionById(transactionId);

    if (!transaction) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: `Aucune transaction trouvée pour la référence "${transactionId}".`
        }
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: transaction
    });
  }

  /**
   * Récupère l'historique des paiements liés à un numéro de téléphone.
   */
  static getPaymentHistoryByPhone(req, res) {
    const { phone } = req.params;

    if (!phone || typeof phone !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Le numéro de téléphone est obligatoire.'
        }
      });
    }

    const transactions = PaymentService.getTransactionsByPhone(phone);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  }
}
