/**
 * @file app.js
 * @description Configuration de l'application Express, intégration des middlewares et montage des routes REST.
 */

import express from 'express';
import { HTTP_STATUS, SECURITY_CONFIG, ERROR_MESSAGES } from './config/constants.js';
import { 
  secureHeadersMiddleware, 
  corsMiddleware, 
  payloadSanitizerMiddleware 
} from './middlewares/security.js';
import tripRoutes from './routes/tripRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { authRateLimiter, paymentRateLimiter } from './middlewares/rateLimiter.js';

const app = express();

// 1. Limite stricte de la taille des requêtes JSON (protection DoS)
app.use(express.json({ limit: SECURITY_CONFIG.MAX_BODY_SIZE }));
app.use(express.urlencoded({ extended: true, limit: SECURITY_CONFIG.MAX_BODY_SIZE }));

// 2. Middlewares de sécurité et assainissement
app.use(secureHeadersMiddleware);
app.use(corsMiddleware);
app.use(payloadSanitizerMiddleware);

// 3. Endpoint de vérification d'état (Health Check)
app.get('/api/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'healthy',
    service: 'Gare Routière API',
    environment: process.env.NODE_ENV || 'développement',
    timestamp: new Date().toISOString()
  });
});

// 4. Montage des routes métier protégées par limitation de débit
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/payments', paymentRateLimiter, paymentRoutes);

// 5. Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: ERROR_MESSAGES.NOT_FOUND,
      path: req.originalUrl
    }
  });
});

// 6. Gestionnaire d'erreurs centralisé (Zéro stack trace en production)
app.use((err, req, res, next) => {
  const statusCode = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isProduction = process.env.NODE_ENV === 'production';

  const responsePayload = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: isProduction && statusCode === 500 
        ? ERROR_MESSAGES.INTERNAL_ERROR 
        : (err.message || ERROR_MESSAGES.INTERNAL_ERROR)
    }
  };

  // Stack trace réservée au débogage local
  if (!isProduction && err.stack) {
    responsePayload.error.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
});

export default app;
