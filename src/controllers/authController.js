/**
 * @file authController.js
 * @description Contrôleur REST pour l'inscription, l'authentification et la consultation de session.
 */

import { AuthService } from '../services/authService.js';
import { 
  HTTP_STATUS, 
  ERROR_MESSAGES, 
  VALIDATION_PATTERNS, 
  AUTH_CONFIG 
} from '../config/constants.js';

export class AuthController {
  /**
   * Enregistre un nouveau compte utilisateur.
   */
  static register(req, res) {
    const { fullName, phone, email, password } = req.body || {};

    // 1. Validation du nom
    if (!fullName || !VALIDATION_PATTERNS.SAFE_NAME.test(fullName.trim())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Le nom complet est requis et doit comporter entre 2 et 60 caractères valides.'
        }
      });
    }

    // 2. Validation du numéro de téléphone
    if (!phone || !VALIDATION_PATTERNS.PHONE_CI.test(phone.trim())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Le numéro de téléphone est obligatoire et doit être un format valide.'
        }
      });
    }

    // 3. Validation de l'email (si fourni)
    if (email && !VALIDATION_PATTERNS.EMAIL.test(email.trim())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Le format de l\'adresse courriel est invalide.'
        }
      });
    }

    // 4. Validation de la robustesse du mot de passe
    if (!password || typeof password !== 'string' || password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: `Le mot de passe doit comporter au moins ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} caractères.`
        }
      });
    }

    try {
      const result = AuthService.registerUser({ fullName, phone, email, password });
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Compte créé avec succès.',
        data: result
      });
    } catch (err) {
      if (err.message === 'USER_ALREADY_EXISTS') {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: ERROR_MESSAGES.USER_ALREADY_EXISTS
          }
        });
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: ERROR_MESSAGES.INTERNAL_ERROR
        }
      });
    }
  }

  /**
   * Authentifie un utilisateur existant.
   */
  static login(req, res) {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'L\'identifiant (téléphone ou email) et le mot de passe sont obligatoires.'
        }
      });
    }

    try {
      const result = AuthService.loginUser(identifier, password);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Connexion réussie.',
        data: result
      });
    } catch {
      // Protection anti-énumération : message d'erreur générique standard
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: ERROR_MESSAGES.INVALID_CREDENTIALS
        }
      });
    }
  }

  /**
   * Récupère le profil de l'utilisateur actuellement authentifié via son token Bearer.
   */
  static getMe(req, res) {
    const authHeader = req.headers[AUTH_CONFIG.TOKEN_HEADER] || req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(AUTH_CONFIG.TOKEN_PREFIX)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: ERROR_MESSAGES.UNAUTHORIZED
        }
      });
    }

    const token = authHeader.substring(AUTH_CONFIG.TOKEN_PREFIX.length).trim();
    const user = AuthService.verifyTokenAndGetUser(token);

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'La session est expirée ou invalide. Veuillez vous reconnecter.'
        }
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user
    });
  }
}
