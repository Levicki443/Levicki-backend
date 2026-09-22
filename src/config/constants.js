/**
 * @file constants.js
 * @description Centralisation des constantes immuables, codes HTTP et règles de sécurité.
 * Conforme aux exigences d'audit de sécurité et aux principes SOLID d'AGENTS.MD.
 */

/**
 * Codes de statut HTTP standardisés.
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
});

/**
 * Limites et seuils de sécurité applicative.
 */
export const SECURITY_CONFIG = Object.freeze({
  MAX_BODY_SIZE: '50kb',
  DEFAULT_PORT: 5000,
  DEFAULT_CORS_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5500'
  ]
});

/**
 * Expressions rationnelles pour la validation stricte des entrées (whitelisting).
 */
export const VALIDATION_PATTERNS = Object.freeze({
  // Format téléphone Côte d'Ivoire (+225 XX XX XX XX XX ou 10 chiffres locaux)
  PHONE_CI: /^(?:\+225\s?|00225\s?)?[0-9\s-]{8,14}$/,
  // Adresse courriel standardisée
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Nom d'utilisateur sécurisé (caractères alphabétiques avec accents français)
  SAFE_NAME: /^[a-zA-ZÀ-ÿ\s'-]{2,60}$/
});

/**
 * Rôles applicatifs immuables avec privilèges granulaires.
 */
export const USER_ROLES = Object.freeze({
  PASSENGER: 'PASSENGER',
  STATION_AGENT: 'STATION_AGENT',
  SUPER_ADMIN: 'SUPER_ADMIN'
});

/**
 * Paramètres de sécurité de l'authentification et des sessions.
 */
export const AUTH_CONFIG = Object.freeze({
  TOKEN_HEADER: 'authorization',
  TOKEN_PREFIX: 'Bearer ',
  TOKEN_TTL_MS: 1000 * 60 * 60 * 24 * 7, // 7 jours
  MIN_PASSWORD_LENGTH: 6,
  SALT_ROUNDS: 10
});

/**
 * Opérateurs de paiement Mobile Money certifiés en Côte d'Ivoire.
 */
export const PAYMENT_OPERATORS = Object.freeze({
  WAVE: {
    id: 'wave',
    name: 'Wave Côte d\'Ivoire',
    code: 'WAVE_CI',
    currency: 'XOF',
    feeRate: 0.01 // 1%
  },
  ORANGE_MONEY: {
    id: 'orange',
    name: 'Orange Money Côte d\'Ivoire',
    code: 'OM_CI',
    currency: 'XOF',
    feeRate: 0.01
  },
  MTN_MOMO: {
    id: 'mtn',
    name: 'MTN Mobile Money',
    code: 'MOMO_CI',
    currency: 'XOF',
    feeRate: 0.01
  },
  MOOV_MONEY: {
    id: 'moov',
    name: 'Moov Money Flooz',
    code: 'MOOV_CI',
    currency: 'XOF',
    feeRate: 0.01
  }
});

/**
 * Statuts du cycle de vie d'une transaction de paiement.
 */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
});

/**
 * Messages d'erreur génériques sécurisés (aucune fuite d'information technique).
 */
export const ERROR_MESSAGES = Object.freeze({
  NOT_FOUND: 'La ressource demandée est introuvable.',
  INVALID_INPUT: 'Données d\'entrée non conformes ou incomplètes.',
  UNAUTHORIZED: 'Accès non autorisé. Veuillez vous authentifier.',
  FORBIDDEN: 'Action refusée. Privilèges insuffisants.',
  INVALID_CREDENTIALS: 'Numéro de téléphone ou mot de passe incorrect.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec ce numéro de téléphone ou cette adresse email.',
  INVALID_PAYMENT_OPERATOR: 'L\'opérateur de paiement sélectionné n\'est pas pris en charge.',
  INVALID_PAYMENT_AMOUNT: 'Le montant de la transaction est invalide.',
  PAYMENT_FAILED: 'Le règlement par Mobile Money a échoué auprès de l\'opérateur.',
  INTERNAL_ERROR: 'Une erreur interne est survenue. Veuillez réessayer ultérieurement.'
});


