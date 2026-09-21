/**
 * @file tripController.js
 * @description Contrôleur REST pour les routes de recherche de trajets, gares et réservations de tickets.
 */

import { TripService } from '../services/tripService.js';
import { HTTP_STATUS, ERROR_MESSAGES, VALIDATION_PATTERNS } from '../config/constants.js';

export class TripController {
  /**
   * Retourne la liste des villes ivoiriennes desservies.
   */
  static getCities(req, res) {
    const cities = TripService.getCities();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: cities
    });
  }

  /**
   * Recherche un itinéraire et ses départs disponibles.
   */
  static searchTrips(req, res) {
    const { from, to } = req.query;

    if (!from || !to || typeof from !== 'string' || typeof to !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Les paramètres "from" (départ) et "to" (destination) sont obligatoires.'
        }
      });
    }

    const trip = TripService.findTripByCities(from, to);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: trip
    });
  }

  /**
   * Crée et enregistre un nouveau ticket de réservation en ligne.
   */
  static createReservation(req, res) {
    const {
      passengerName,
      passengerPhone,
      departureCity,
      arrivalCity,
      departureTime,
      departureRank,
      stationName,
      stationAddress,
      directions,
      priceCfa,
      company
    } = req.body;

    // Validation stricte du nom du passager
    if (!passengerName || !VALIDATION_PATTERNS.SAFE_NAME.test(passengerName.trim())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_PASSENGER_NAME',
          message: 'Le nom du passager est invalide ou contient des caractères non autorisés.'
        }
      });
    }

    // Validation du numéro de téléphone
    if (!passengerPhone || !VALIDATION_PATTERNS.PHONE_CI.test(passengerPhone.trim())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_PHONE_NUMBER',
          message: 'Le numéro de téléphone du passager est invalide.'
        }
      });
    }

    // Validation des villes
    if (!departureCity || !arrivalCity) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_ROUTE',
          message: 'Les villes de départ et de destination sont obligatoires.'
        }
      });
    }

    const ticket = TripService.createReservation({
      passengerName,
      passengerPhone,
      departureCity,
      arrivalCity,
      departureTime,
      departureRank,
      stationName,
      stationAddress,
      directions,
      priceCfa,
      company
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Réservation validée avec succès.',
      data: ticket
    });
  }

  /**
   * Recherche un ticket de réservation par son code de référence unique.
   */
  static getTicketByReference(req, res) {
    const { reference } = req.params;

    if (!reference || typeof reference !== 'string' || reference.trim().length < 3) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_REFERENCE',
          message: 'La référence de ticket fournie est invalide.'
        }
      });
    }

    const ticket = TripService.findTicketByReference(reference);

    if (!ticket) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: `Aucun ticket trouvé pour la référence "${reference}".`
        }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: ticket
    });
  }

  /**
   * Récupère l'historique des réservations d'un passager selon son numéro de téléphone.
   */
  static getPassengerHistory(req, res) {
    const { phone } = req.params;

    if (!phone || typeof phone !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Le numéro de téléphone du passager est obligatoire.'
        }
      });
    }

    const reservations = TripService.getPassengerReservations(phone);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  }
}

