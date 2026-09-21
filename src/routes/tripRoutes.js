/**
 * @file tripRoutes.js
 * @description Routeur Express pour les points de terminaison de l'API des départs et réservations.
 */

import { Router } from 'express';
import { TripController } from '../controllers/tripController.js';

const router = Router();

/**
 * @route   GET /api/trips/cities
 * @desc    Obtenir la liste des villes desservies en Côte d'Ivoire
 * @access  Public
 */
router.get('/cities', TripController.getCities);

/**
 * @route   GET /api/trips/search
 * @desc    Rechercher les départs pour un trajet donné (?from=...&to=...)
 * @access  Public
 */
router.get('/search', TripController.searchTrips);

/**
 * @route   POST /api/trips/reservations
 * @desc    Créer et enregistrer une nouvelle réservation de ticket
 * @access  Public
 */
router.post('/reservations', TripController.createReservation);

/**
 * @route   GET /api/trips/tickets/:reference
 * @desc    Consulter les détails d'un ticket de réservation par son code de référence
 * @access  Public
 */
router.get('/tickets/:reference', TripController.getTicketByReference);

/**
 * @route   GET /api/trips/passenger/:phone/history
 * @desc    Récupérer l'historique de toutes les réservations associées à un numéro de téléphone
 * @access  Public
 */
router.get('/passenger/:phone/history', TripController.getPassengerHistory);

export default router;

