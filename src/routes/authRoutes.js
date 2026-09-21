/**
 * @file authRoutes.js
 * @description Routeur Express pour les points de terminaison d'authentification et gestion de compte.
 */

import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscrire un nouveau voyageur ou agent
 * @access  Public
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion et obtention d'un jeton de session
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Récupération du profil utilisateur connecté
 * @access  Privé (Bearer Token)
 */
router.get('/me', AuthController.getMe);

export default router;
