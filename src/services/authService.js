/**
 * @file authService.js
 * @description Logique métier pour l'authentification, la gestion des sessions et le contrôle des accès.
 * Conforme aux exigences de sécurité bancaire d'AGENTS.MD (hachage salé, tokens de session, whitelisting).
 */

import crypto from 'crypto';
import { USER_ROLES, AUTH_CONFIG } from '../config/constants.js';

/**
 * Fonction interne de hachage cryptographique sécurisé (SHA-256 avec salage unique).
 * @param {string} password - Mot de passe en clair.
 * @param {string} salt - Sel cryptographique.
 * @returns {string} Empreinte hexadécimale.
 */
function hashWithSalt(password, salt) {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Référentiel initial des utilisateurs (avec comptes d'administration et passager préconfigurés)
const USERS_STORE = [
  {
    id: 'usr-admin-01',
    fullName: 'Superviseur Gare Adjamé',
    phone: '+225 07 00 00 00 01',
    email: 'admin.gare@transport.ci',
    salt: 'c102a9b3c4d5e6f7',
    passwordHash: hashWithSalt('Admin2026!', 'c102a9b3c4d5e6f7'),
    role: USER_ROLES.SUPER_ADMIN,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-pass-01',
    fullName: 'Kouassi Jean-Philippe',
    phone: '+225 05 12 34 56 78',
    email: 'jean.kouassi@email.ci',
    salt: 'a9f8e7d6c5b4a321',
    passwordHash: hashWithSalt('Passager2026!', 'a9f8e7d6c5b4a321'),
    role: USER_ROLES.PASSENGER,
    createdAt: '2026-01-15T08:30:00.000Z'
  }
];

// Table des sessions actives en mémoire (Token ➔ User ID & Expiration)
const ACTIVE_SESSIONS = new Map();

/**
 * Nettoie l'objet utilisateur pour ne jamais exposer les informations cryptographiques sensibles.
 * @param {Object} user - Entité utilisateur brute.
 * @returns {Object} Profil public sécurisé.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

export class AuthService {
  /**
   * Enregistre un nouveau voyageur ou agent.
   * @param {Object} userData - Données d'inscription.
   * @returns {Object} Utilisateur créé et jeton de session.
   */
  static registerUser({ fullName, phone, email, password, role = USER_ROLES.PASSENGER }) {
    const normalizedPhone = phone.trim();
    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    // Vérification d'unicité sur le téléphone
    const existingPhone = USERS_STORE.find(
      (u) => u.phone.replace(/[\s-]/g, '') === normalizedPhone.replace(/[\s-]/g, '')
    );
    if (existingPhone) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    // Vérification d'unicité sur l'email si renseigné
    if (normalizedEmail) {
      const existingEmail = USERS_STORE.find((u) => u.email === normalizedEmail);
      if (existingEmail) {
        throw new Error('USER_ALREADY_EXISTS');
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashWithSalt(password, salt);

    const newUser = {
      id: `usr-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`,
      fullName: fullName.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      salt,
      passwordHash,
      role: Object.values(USER_ROLES).includes(role) ? role : USER_ROLES.PASSENGER,
      createdAt: new Date().toISOString()
    };

    USERS_STORE.push(newUser);

    const token = this.createSessionToken(newUser.id);
    return {
      user: sanitizeUser(newUser),
      token
    };
  }

  /**
   * Authentifie un utilisateur par son téléphone/email et son mot de passe.
   * @param {string} identifier - Numéro de téléphone ou email.
   * @param {string} password - Mot de passe en clair.
   * @returns {Object} Profil utilisateur et jeton de session.
   */
  static loginUser(identifier, password) {
    if (!identifier || !password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[\s-]/g, '');

    const user = USERS_STORE.find((u) => {
      const uPhone = u.phone.replace(/[\s-]/g, '');
      return uPhone === cleanPhone || (u.email && u.email.toLowerCase() === cleanIdentifier);
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const computedHash = hashWithSalt(password, user.salt);
    if (computedHash !== user.passwordHash) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = this.createSessionToken(user.id);
    return {
      user: sanitizeUser(user),
      token
    };
  }

  /**
   * Génère un jeton de session cryptographique et l'enregistre.
   * @param {string} userId - Identifiant de l'utilisateur.
   * @returns {string} Jeton Bearer sécurisé.
   */
  static createSessionToken(userId) {
    const rawToken = `tkn_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = Date.now() + AUTH_CONFIG.TOKEN_TTL_MS;

    ACTIVE_SESSIONS.set(rawToken, {
      userId,
      expiresAt
    });

    return rawToken;
  }

  /**
   * Vérifie un jeton d'accès et retourne l'utilisateur associé.
   * @param {string} token - Jeton de session.
   * @returns {Object|null} Profil utilisateur assaini ou null si invalide/expiré.
   */
  static verifyTokenAndGetUser(token) {
    if (!token || typeof token !== 'string') return null;

    const session = ACTIVE_SESSIONS.get(token);
    if (!session) return null;

    // Vérification de la validité temporelle
    if (Date.now() > session.expiresAt) {
      ACTIVE_SESSIONS.delete(token);
      return null;
    }

    const user = USERS_STORE.find((u) => u.id === session.userId);
    return sanitizeUser(user);
  }

  /**
   * Met à jour le profil d'un passager.
   * @param {string} userId - Identifiant utilisateur.
   * @param {Object} updates - Données à modifier.
   * @returns {Object} Profil mis à jour.
   */
  static updateUserProfile(userId, updates) {
    const userIndex = USERS_STORE.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error('USER_NOT_FOUND');
    }

    const current = USERS_STORE[userIndex];
    if (updates.fullName) current.fullName = updates.fullName.trim();
    if (updates.username) current.username = updates.username.trim();
    if (updates.phone) current.phone = updates.phone.trim();
    if (updates.email !== undefined) current.email = updates.email ? updates.email.trim().toLowerCase() : null;
    if (updates.city) current.city = updates.city;
    if (updates.emergencyContactName !== undefined) current.emergencyContactName = updates.emergencyContactName;
    if (updates.emergencyContactPhone !== undefined) current.emergencyContactPhone = updates.emergencyContactPhone;
    if (updates.preferredPayment) current.preferredPayment = updates.preferredPayment;
    if (updates.preferredCompany) current.preferredCompany = updates.preferredCompany;
    if (updates.seatPreference) current.seatPreference = updates.seatPreference;
    if (updates.smsAlerts !== undefined) current.smsAlerts = updates.smsAlerts;

    return sanitizeUser(current);
  }

  /**
   * Modifie le mot de passe d'un utilisateur.
   * @param {string} userId - Identifiant utilisateur.
   * @param {string} oldPassword - Ancien mot de passe.
   * @param {string} newPassword - Nouveau mot de passe.
   * @returns {boolean} Succès de l'opération.
   */
  static changePassword(userId, oldPassword, newPassword) {
    const user = USERS_STORE.find((u) => u.id === userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const oldHash = hashWithSalt(oldPassword, user.salt);
    if (oldHash !== user.passwordHash) {
      throw new Error('INVALID_OLD_PASSWORD');
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    user.salt = newSalt;
    user.passwordHash = hashWithSalt(newPassword, newSalt);
    return true;
  }
}
