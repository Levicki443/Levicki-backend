/**
 * @file adminController.js
 * @description Contrôleur REST pour les fonctions d'administration et de supervision de la gare (Section 12).
 */

import { HTTP_STATUS } from '../config/constants.js';

export class AdminController {
  /**
   * Retourne les indicateurs clés de performance (KPIs) en temps réel.
   */
  static getStatistics(req, res) {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        scheduledDeparturesCount: 12,
        totalPassengersRegistered: 284,
        averageLoadFactor: 86.5,
        totalRevenueCfa: 1988000,
        activeLines: ['Abidjan ➔ Bondoukou', 'Abidjan ➔ Bouaké', 'Abidjan ➔ Yamoussoukro']
      }
    });
  }

  /**
   * Retourne la liste des départs supervisés avec leur statut d'embarquement.
   */
  static getDeparturesList(req, res) {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: [
        {
          id: 'dep-abj-bdk-1',
          rankLabel: '1er Départ',
          route: 'Abidjan ➔ Bondoukou',
          time: '06h30',
          stationName: 'Gare d\'Adjamé Quai Nord',
          reservedSeats: 42,
          totalSeats: 60,
          status: 'ON_ROUTE'
        },
        {
          id: 'dep-abj-bdk-2',
          rankLabel: '2e Départ',
          route: 'Abidjan ➔ Bondoukou',
          time: '10h00',
          stationName: 'Gare d\'Adjamé Pôle Est',
          reservedSeats: 36,
          totalSeats: 60,
          status: 'BOARDING'
        },
        {
          id: 'dep-abj-bdk-3',
          rankLabel: '3e Départ',
          route: 'Abidjan ➔ Bondoukou',
          time: '14h30',
          stationName: 'Gare de Yopougon Siporex',
          reservedSeats: 48,
          totalSeats: 60,
          status: 'SCHEDULED'
        }
      ]
    });
  }
}
