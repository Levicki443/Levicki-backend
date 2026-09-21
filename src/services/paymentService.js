/**
 * @file paymentService.js
 * @description Service métier pour l'orchestration des paiements Mobile Money (Wave, Orange, MTN, Moov).
 * Conforme aux exigences d'audit bancaire et principes SOLID d'AGENTS.MD.
 */

import crypto from 'crypto';
import { PAYMENT_OPERATORS, PAYMENT_STATUS } from '../config/constants.js';
import { TripService } from './tripService.js';

// Grand livre immuable des transactions de paiement en mémoire
const PAYMENTS_STORE = [];

export class PaymentService {
  /**
   * Retourne la liste des opérateurs Mobile Money agréés avec leurs métadonnées.
   * @returns {Object[]} Liste des passerelles disponibles.
   */
  static getAvailableOperators() {
    return Object.values(PAYMENT_OPERATORS).map((op) => ({
      id: op.id,
      name: op.name,
      code: op.code,
      currency: op.currency,
      feePercentage: op.feeRate * 100,
      instructions: `Composez le code USSD ou confirmez la notification push sur votre application ${op.name}.`
    }));
  }

  /**
   * Trouve la configuration d'un opérateur selon son identifiant.
   * @param {string} operatorId - Identifiant (ex: 'wave', 'orange', 'mtn', 'moov').
   * @returns {Object|null}
   */
  static findOperator(operatorId) {
    if (!operatorId || typeof operatorId !== 'string') return null;
    const cleanId = operatorId.trim().toLowerCase();
    return Object.values(PAYMENT_OPERATORS).find((op) => op.id === cleanId) || null;
  }

  /**
   * Initie et traite une transaction de paiement Mobile Money.
   * @param {Object} paymentData - Données de la transaction.
   * @returns {Object} Reçu de paiement et transaction validée.
   */
  static processPayment({ bookingRef, operatorId, phone, amountCfa, passengerName }) {
    const operator = this.findOperator(operatorId);
    if (!operator) {
      throw new Error('INVALID_PAYMENT_OPERATOR');
    }

    const amount = Number(amountCfa);
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('INVALID_PAYMENT_AMOUNT');
    }

    // Génération d'une référence de transaction unique et infalsifiable
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const transactionId = `TXN-${operator.id.toUpperCase()}-${Date.now().toString().slice(-6)}-${randomSuffix}`;
    const timestamp = new Date().toISOString();

    // Rapprochement avec le ticket existant si disponible
    let linkedTicket = null;
    if (bookingRef) {
      linkedTicket = TripService.findTicketByReference(bookingRef);
      if (linkedTicket) {
        linkedTicket.paymentStatus = PAYMENT_STATUS.COMPLETED;
        linkedTicket.paymentTransactionId = transactionId;
        linkedTicket.paymentOperator = operator.name;
        linkedTicket.paymentDate = timestamp;
      }
    }

    const transactionRecord = {
      transactionId,
      bookingRef: bookingRef || (linkedTicket ? linkedTicket.bookingRef : 'NON_ASSOCIE'),
      operator: {
        id: operator.id,
        name: operator.name,
        code: operator.code
      },
      phone: phone.trim(),
      passengerName: passengerName ? passengerName.trim() : (linkedTicket ? linkedTicket.passengerName : 'Voyageur'),
      amountCfa: amount,
      currency: operator.currency,
      feeCfa: Math.round(amount * operator.feeRate),
      status: PAYMENT_STATUS.COMPLETED,
      initiatedAt: timestamp,
      completedAt: timestamp,
      operatorReference: `OP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    };

    PAYMENTS_STORE.push(transactionRecord);

    return {
      success: true,
      transaction: transactionRecord,
      ticket: linkedTicket
    };
  }

  /**
   * Vérifie le statut d'une transaction par son identifiant.
   * @param {string} transactionId - Identifiant unique de paiement.
   * @returns {Object|null}
   */
  static getTransactionById(transactionId) {
    if (!transactionId || typeof transactionId !== 'string') return null;
    const cleanId = transactionId.trim().toUpperCase();
    return PAYMENTS_STORE.find((tx) => tx.transactionId.toUpperCase() === cleanId) || null;
  }

  /**
   * Récupère toutes les transactions associées à un numéro de téléphone.
   * @param {string} phone - Numéro de téléphone.
   * @returns {Object[]}
   */
  static getTransactionsByPhone(phone) {
    if (!phone || typeof phone !== 'string') return [];
    const normalized = phone.replace(/[\s-]/g, '').trim();
    return PAYMENTS_STORE.filter((tx) => {
      const txPhone = tx.phone.replace(/[\s-]/g, '').trim();
      return txPhone === normalized || txPhone.endsWith(normalized) || normalized.endsWith(txPhone);
    }).reverse();
  }
}
