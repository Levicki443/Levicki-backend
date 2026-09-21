# API REST — Plateforme de Gestion d'une Gare Routière

API REST sécurisée, modulaire et hautement disponible conçue pour la plateforme de réservation de tickets de transport interurbain en Côte d'Ivoire.

---

## 🏛️ Architecture Technique & Principes SOLID

Le backend est structuré selon une stricte séparation des responsabilités :
* `src/config/` : Constantes immuables, codes de statut HTTP standardisés, expressions de validation.
* `src/middlewares/` : En-têtes HTTP de sécurité renforcés, filtrage CORS d'origine, assainissement contre les injections NoSQL et XSS.
* `src/routes/` : Routage déclaratif des points de terminaison REST.
* `src/controllers/` : Contrôleurs REST légers assurant la validation des entrées (whitelisting).
* `src/services/` : Logique métier pure (gestion des convois, calculs d'itinéraires et persistance des tickets).
* `src/server.js` : Gestionnaire de démarrage et arrêt gracieux (`SIGTERM`, `SIGINT`).

---

## 🔒 Sécurité Niveau Audit Bancaire

1. **Protection contre le DoS :** Limitation stricte de la taille des requêtes JSON (`50kb`).
2. **Anti-Injections NoSQL & XSS :** Neutralisation systématique des opérateurs `$` et des balises malveillantes via `payloadSanitizerMiddleware`.
3. **En-têtes HTTP stricts :** `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`.
4. **Gestion propre des erreurs :** Aucune fuite d'informations sensibles ou de stack trace en production.

---

## 📡 Points de Terminaison (Endpoints)

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Vérification de l'état de fonctionnement du serveur. |
| `GET` | `/api/trips/cities` | Liste des villes ivoiriennes desservies. |
| `GET` | `/api/trips/search?from=Abidjan&to=Bondoukou` | Recherche des départs disponibles, gares et indications. |
| `POST` | `/api/trips/reservations` | Émission et enregistrement d'un ticket de réservation. |

---

## 🚀 Installation & Démarrage

```bash
# 1. Installation des dépendances
npm install

# 2. Démarrage en mode développement (rechargement automatique)
npm run dev

# 3. Démarrage en mode production
npm start
```
