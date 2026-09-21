/**
 * @file tripService.js
 * @description Logique métier pour la gestion des villes, des trajets, des départs et des réservations de tickets.
 */

const CITIES_LIST = [
  'Abidjan',
  'Bondoukou',
  'Bouaké',
  'Yamoussoukro',
  'Korhogo',
  'San-Pédro',
  'Man',
  'Daloa'
];

const TRIPS_STORE = [
  {
    id: 'trip-abj-bdk',
    departureCity: 'Abidjan',
    arrivalCity: 'Bondoukou',
    distanceKm: 420,
    estimatedDuration: '7h 30min',
    departures: [
      {
        id: 'dep-abj-bdk-1',
        rankLabel: '1er Départ',
        time: '06h30',
        stationName: 'Gare Principale d\'Adjamé (Quai Nord)',
        stationAddress: 'Adjamé Liberté, à 100m du grand carrefour',
        directions: 'Emprunter le boulevard principal, quai n°3 réservé aux lignes de l\'Est (Bondoukou / Bouna). Présentation recommandée 30 minutes avant le départ.',
        busType: 'Car Grand Confort VIP (Climatisé, Wifi, Prises USB)',
        company: 'Compagnie Express du Zanzan',
        priceCfa: 7500,
        availableSeats: 18
      },
      {
        id: 'dep-abj-bdk-2',
        rankLabel: '2e Départ',
        time: '10h00',
        stationName: 'Gare Routière d\'Adjamé — Pôle Est',
        stationAddress: 'Boulevard Nangui Abrogoua, Face Pharmacie Centrale',
        directions: 'Accès direct par le couloir central des cars interurbains. Guichet d\'enregistrement et dépose bagages Quai 2.',
        busType: 'Car Standard 60 places (Climatisation active)',
        company: 'Compagnie Express du Zanzan',
        priceCfa: 7000,
        availableSeats: 24
      },
      {
        id: 'dep-abj-bdk-3',
        rankLabel: '3e Départ',
        time: '14h30',
        stationName: 'Gare de Yopougon Siporex',
        stationAddress: 'Carrefour Siporex, Terminus des lignes Est',
        directions: 'Point d\'embarquement côté autoroute du Nord avant bifurcation vers l\'Est. Parking voyageurs disponible.',
        busType: 'Car VIP Confort Plus (Climatisé, Écrans individuels)',
        company: 'Union des Transporteurs de l\'Est',
        priceCfa: 8000,
        availableSeats: 12
      }
    ]
  },
  {
    id: 'trip-abj-bke',
    departureCity: 'Abidjan',
    arrivalCity: 'Bouaké',
    distanceKm: 350,
    estimatedDuration: '4h 45min',
    departures: [
      {
        id: 'dep-abj-bke-1',
        rankLabel: '1er Départ',
        time: '07h00',
        stationName: 'Gare d\'Adjamé Renaissance',
        stationAddress: 'Boulevard de la Paix, Adjamé',
        directions: 'Quai réservé aux lignes Centre & Nord. Voie express directe autoroute.',
        busType: 'Car VIP Grand Tourisme',
        company: 'Société Nationale de Transport',
        priceCfa: 6000,
        availableSeats: 15
      }
    ]
  }
];

// Stockage en mémoire des réservations enregistrées
const RESERVATIONS_STORE = [];

export class TripService {
  /**
   * Retourne la liste des villes desservies.
   * @returns {string[]} Liste des noms de villes.
   */
  static getCities() {
    return [...CITIES_LIST];
  }

  /**
   * Recherche un trajet et ses départs associés.
   * @param {string} from - Ville de départ.
   * @param {string} to - Ville d'arrivée.
   * @returns {Object} Objet trajet avec départs détaillés.
   */
  static findTripByCities(from, to) {
    const formattedFrom = from.trim();
    const formattedTo = to.trim();

    const existingTrip = TRIPS_STORE.find(
      (t) => t.departureCity.toLowerCase() === formattedFrom.toLowerCase() &&
             t.arrivalCity.toLowerCase() === formattedTo.toLowerCase()
    );

    if (existingTrip) {
      return existingTrip;
    }

    // Trajet dynamique si la paire de villes est valide
    return {
      id: `trip-${formattedFrom.toLowerCase()}-${formattedTo.toLowerCase()}`,
      departureCity: formattedFrom,
      arrivalCity: formattedTo,
      distanceKm: 300,
      estimatedDuration: '4h 30min',
      departures: [
        {
          id: `dep-${formattedFrom.toLowerCase()}-1`,
          rankLabel: '1er Départ',
          time: '07h30',
          stationName: `Gare Centrale de ${formattedFrom}`,
          stationAddress: `Boulevard principal de ${formattedFrom}`,
          directions: `Se présenter au guichet central d'embarquement de ${formattedFrom}.`,
          busType: 'Car Grand Confort',
          company: 'Réseau Express National',
          priceCfa: 6000,
          availableSeats: 20
        },
        {
          id: `dep-${formattedFrom.toLowerCase()}-2`,
          rankLabel: '2e Départ',
          time: '13h00',
          stationName: `Gare Routière Sud de ${formattedFrom}`,
          stationAddress: `Carrefour de la Paix, ${formattedFrom}`,
          directions: `Accès direct voie express. Dépose bagages 20 minutes avant départ.`,
          busType: 'Car Grand Confort',
          company: 'Réseau Express National',
          priceCfa: 6000,
          availableSeats: 16
        }
      ]
    };
  }

  /**
   * Crée et enregistre un ticket de réservation.
   * @param {Object} bookingData - Détails de la réservation.
   * @returns {Object} Ticket généré avec référence unique.
   */
  static createReservation(bookingData) {
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
    } = bookingData;

    const newTicket = {
      bookingRef: `GR-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      passengerName: passengerName.trim(),
      passengerPhone: passengerPhone.trim(),
      departureCity,
      arrivalCity,
      departureTime,
      departureRank,
      stationName,
      stationAddress,
      directions,
      priceCfa: Number(priceCfa) || 7000,
      company: company || 'Gare Routière Express',
      status: 'CONFIRMED'
    };

    RESERVATIONS_STORE.push(newTicket);
    return newTicket;
  }

  /**
   * Recherche un ticket de réservation par son identifiant ou sa référence unique.
   * @param {string} reference - Référence du ticket (ex: GR-123456).
   * @returns {Object|null} Le ticket trouvé ou null.
   */
  static findTicketByReference(reference) {
    if (!reference || typeof reference !== 'string') {
      return null;
    }
    const cleanRef = reference.trim().toUpperCase();
    return RESERVATIONS_STORE.find(
      (ticket) => ticket.bookingRef.toUpperCase() === cleanRef
    ) || null;
  }

  /**
   * Récupère l'historique complet des réservations associées à un numéro de téléphone passager.
   * @param {string} phone - Numéro de téléphone du voyageur.
   * @returns {Object[]} Liste des tickets triés du plus récent au plus ancien.
   */
  static getPassengerReservations(phone) {
    if (!phone || typeof phone !== 'string') {
      return [];
    }
    const normalizedPhone = phone.replace(/[\s-]/g, '').trim();
    return RESERVATIONS_STORE.filter((ticket) => {
      const ticketPhone = ticket.passengerPhone.replace(/[\s-]/g, '').trim();
      return ticketPhone === normalizedPhone || ticketPhone.endsWith(normalizedPhone) || normalizedPhone.endsWith(ticketPhone);
    }).reverse();
  }
}

