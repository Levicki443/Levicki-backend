/**
 * @file server.js
 * @description Point d'entrée d'exécution du serveur HTTP Node.js.
 */

import app from './app.js';
import { SECURITY_CONFIG } from './config/constants.js';

const PORT = process.env.PORT || SECURITY_CONFIG.DEFAULT_PORT;

const server = app.listen(PORT, () => {
  console.log(`[SERVEUR] API de Gestion de Gare Routière démarrée sur le port : ${PORT}`);
  console.log(`[SERVEUR] Environnement : ${process.env.NODE_ENV || 'développement'}`);
  console.log(`[SERVEUR] Point de santé disponible sur : http://localhost:${PORT}/api/health`);
});

/**
 * Arrêt gracieux du serveur HTTP en cas de signal système.
 * @param {string} signal - Nom du signal reçu.
 */
function gracefulShutdown(signal) {
  console.log(`[SERVEUR] Signal ${signal} reçu. Fermeture sécurisée en cours...`);
  server.close(() => {
    console.log('[SERVEUR] Toutes les connexions ont été closes proprement.');
    process.exit(0);
  });

  // Forcer l'arrêt après un délai de sécurité de 5 secondes si des requêtes traînent
  setTimeout(() => {
    console.error('[SERVEUR] Fermeture forcée suite à l\'expiration du délai de sécurité.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('[SERVEUR] Exception non interceptée :', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('[SERVEUR] Rejet de promesse non traité :', reason);
});
