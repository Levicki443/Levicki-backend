/**
 * @file adminRoutes.js
 * @description Routeur Express pour les points de terminaison d'administration et de supervision de la gare.
 */

import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';

const router = Router();

/**
 * @route   GET /api/admin/statistics
 * @desc    Obtenir les indicateurs clés de performance (KPIs) en temps réel
 * @access  Privé / Administration
 */
router.get('/statistics', AdminController.getStatistics);

/**
 * @route   GET /api/admin/departures
 * @desc    Obtenir la liste des départs supervisés avec statut d'embarquement
 * @access  Privé / Administration
 */
router.get('/departures', AdminController.getDeparturesList);

export default router;
