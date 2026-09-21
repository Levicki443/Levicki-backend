/**
 * @file paymentRoutes.js
 * @description Routeur Express pour les transactions de paiement Mobile Money.
 */

import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';

const router = Router();

/**
 * @route   GET /api/payments/operators
 * @desc    Obtenir la liste des opérateurs Mobile Money agréés (Wave, Orange, MTN, Moov)
 * @access  Public
 */
router.get('/operators', PaymentController.getOperators);

/**
 * @route   POST /api/payments/initiate
 * @desc    Initier et régler un ticket de transport via Mobile Money
 * @access  Public
 */
router.post('/initiate', PaymentController.initiatePayment);

/**
 * @route   GET /api/payments/verify/:transactionId
 * @desc    Vérifier le statut d'une transaction de paiement par son identifiant
 * @access  Public
 */
router.get('/verify/:transactionId', PaymentController.verifyPayment);

/**
 * @route   GET /api/payments/history/:phone
 * @desc    Historique des paiements d'un voyageur selon son numéro de téléphone
 * @access  Public
 */
router.get('/history/:phone', PaymentController.getPaymentHistoryByPhone);

export default router;
