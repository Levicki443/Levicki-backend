/**
 * @file security.js
 * @description Middlewares de protection contre les injections, en-têtes HTTP stricts et filtrage CORS.
 * Conforme à la section « SÉCURITÉ AVANCÉE (MENTALITÉ AUDIT) » d'AGENTS.MD.
 */

import { HTTP_STATUS, SECURITY_CONFIG } from '../config/constants.js';

/**
 * Middleware d'en-têtes de sécurité renforcés.
 * @param {import('express').Request} req - Requête entrante.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Poursuite de la chaîne.
 */
export function secureHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
}

/**
 * Middleware de configuration CORS avec validation stricte de l'origine.
 * @param {import('express').Request} req - Requête entrante.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Poursuite.
 */
export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin && SECURITY_CONFIG.CORS_ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Requêtes de même origine ou directes (Postman/cURL de test)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(HTTP_STATUS.NO_CONTENT).end();
  }

  next();
}

/**
 * Nettoie récursivement un objet pour neutraliser les injections NoSQL (clés commençant par $)
 * et les balises de scripts XSS basiques.
 * @param {any} value - Valeur ou objet à assainir.
 * @returns {any} Valeur assainie.
 */
export function sanitizePayload(value) {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string') {
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizePayload);
  }

  const sanitized = {};
  for (const [key, val] of Object.entries(value)) {
    // Whitelisting : rejet des clés commençant par $ (attaques NoSQL)
    if (!key.startsWith('$')) {
      sanitized[key] = sanitizePayload(val);
    }
  }
  return sanitized;
}

/**
 * Middleware appliquant l'assainissement systématique du corps de la requête.
 */
export function payloadSanitizerMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }
  next();
}
