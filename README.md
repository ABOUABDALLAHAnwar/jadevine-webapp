# 🌿 Jade Vine AI : Dashboard Eco-Actions & Impact CO2

## 🎯 Objectif
Cette application permet aux habitants et aux élus de **visualiser les initiatives écologiques locales** et leur **impact estimé sur la réduction de CO2**. En utilisant des modèles de calcul avancés (PhD expertise), elle aide à mieux valoriser et planifier les actions éco-responsables à Bordeaux et Cenon.

---

## 🏗️ Architecture du Système
L'application repose sur une architecture **Cloud-Hybride** optimisée pour la performance et la scalabilité :

![Architecture Jade Vine](data/archiactuelle.png)

* **Frontend (React)** : Interface utilisateur réactive pour la visualisation des données.
* **Backend (FastAPI)** : API haute performance gérant la logique métier et les calculs d'impact.
* **Cache (Redis)** : Couche d'accélération locale pour supprimer la latence d'affichage des statistiques et badges.
* **Database (MongoDB Atlas)** : Stockage persistant et sécurisé sur le Cloud.

---

## ✨ Fonctionnalités Principales

* **📍 Carte Interactive** : Localise les actions (compost, recyclage, jardins) avec code couleur selon l'impact CO2 via Leaflet.
* **📊 Bilan d'Activité** : Suivi en temps réel du $CO_2e$ évité (ex: 0.008867 t) et des récompenses générées (ex: 0.62 €).
* **🏅 Gamification** : Système de badges et barre de progression pour encourager l'engagement citoyen.
* **🚀 Caching Stratégique** : Utilisation de Redis pour un chargement instantané du dashboard.

---

## 🛠️ Stack Technique

* **Backend** : FastAPI (Python 3.12)
* **Cache** : Redis (Dockerized)
* **Base de données** : MongoDB Atlas
* **Frontend** : React.js & Leaflet (Cartographie)
* **Orchestration** : Docker & Docker Compose

---

## 🚀 Installation & Lancement

L'ensemble de l'infrastructure est géré via Docker pour garantir un environnement de développement stable.

### Commandes Makefile

```bash
# Construire et lancer tous les services (Backend, Front, Redis)
make build

# Lancer l'infrastructure déjà construite
make compose

# Arrêter tous les services
make down