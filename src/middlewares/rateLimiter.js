/**
 * @file rateLimiter.js
 * @description Middleware de limitation de débit (Rate Limiting) avec fenêtre glissante en mémoire.
 * Conforme aux exigences de résistance aux attaques par force brute et DoS d'AGENTS.MD.
 */

import { HTTP_STATUS } from '../config/constants.js';

/**
 * Génère un middleware de limitation de débit configurable.
 * @param {Object} options - Options de configuration du limiteur.
 * @param {number} [options.windowMs=60000] - Fenêtre temporelle en millisecondes (défaut : 1 minute).
 * @param {number} [options.maxRequests=30] - Nombre maximal de requêtes autorisées dans la fenêtre.
 * @param {string} [options.message='Trop de requêtes. Veuillez patienter.'] - Message renvoyé en cas de dépassement.
 * @returns {import('express').RequestHandler}
 */
export function createRateLimiter({
  windowMs = 60 * 1000,
  maxRequests = 30,
  message = 'Trop de requêtes effectuées depuis cette adresse IP. Veuillez réessayer ultérieurement.'
} = {}) {
  // Table de traçabilité des requêtes : IP ➔ [timestamps]
  const requestRecords = new Map();

  // Nettoyage périodique pour éviter toute fuite de mémoire (toutes les 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of requestRecords.entries()) {
      const activeTimestamps = timestamps.filter((t) => now - t < windowMs);
      if (activeTimestamps.length === 0) {
        requestRecords.delete(ip);
      } else {
        requestRecords.set(ip, activeTimestamps);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const clientIp = (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress ||
      '127.0.0.1'
    ).trim();

    const now = Date.now();
    const timestamps = requestRecords.get(clientIp) || [];

    // Ne conserver que les requêtes comprises dans la fenêtre glissante
    const recentRequests = timestamps.filter((time) => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      const oldestInWindow = recentRequests[0];
      const retryAfterSec = Math.ceil((windowMs - (now - oldestInWindow)) / 1000);

      res.setHeader('Retry-After', retryAfterSec > 0 ? retryAfterSec : 1);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);

      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfterSeconds: retryAfterSec > 0 ? retryAfterSec : 1
        }
      });
    }

    recentRequests.push(now);
    requestRecords.set(clientIp, recentRequests);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - recentRequests.length));

    next();
  };
}

// Limiteur dédié aux routes d'authentification (stricte protection anti-brute force)
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,
  message: 'Trop de tentatives d\'authentification. Veuillez patienter une minute avant de réessayer.'
});

// Limiteur dédié aux passerelles de paiement (protection anti-spam de transactions)
export const paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  message: 'Limite de requêtes de paiement atteinte. Veuillez patienter quelques instants.'
});
