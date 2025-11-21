# 2- CONTRAINTES

- La LP + dashboard devront obligatoirement être en ligne
- Contraintes stylistiques :
    - utilisation du framework [Tailwind](https://tailwindcss.com/) ou [UnoCSS](https://unocss.dev/) (*formez-vous et placez vos recherches en commun. Faites-vous des documentations*)
- Angular pour le front
- Choisissez ce que vous voulez pour le back
- API entre front et back
- Conformité (CNIL + GDPR)
- votre réalisation devra être accessible (*WAI, ARIA, WCAG,…*)

# 3- ETAPES TECH
> *Vera souhaite développer une plateforme complète de fact-checking en 3 étapes progressives, allant de la présentation institutionnelle à l'analyse automatisée de contenus sur les réseaux sociaux.
Commencez déjà par comprendre le fonctionnement. Ouvrez WhatsApp et contactez-la au 09 74 99 12 95. V
era est présent sur les réseaux sociaux. Votre but : 
- **MISSION 1  :** créer une LP permettant de gérer l’accessibilité de Vera au-delà des réseaux sociaux ⇒ VERA WEB* 😃
- ***MISSION 2 :** Intégration du module de fact-checking sur d’autres réseaux sociaux*
> 

## **1️⃣ - LP (Vera Web) + dashboard**

- **BUT :**
    - Comment valoriser la page du module **de fact-checking ?**
    - Présentation de Vera et de ses valeurs (cf. WD)
    - Explication des objectifs, protocoles et méthodologie de l'enquête (cf. UX)
- **Votre mission :**
    - Intégration
    - Formulaire de connexion sécurisé pour accéder au dashboard
    - Intégration du module **de fact-checking**

---

## **2️⃣ - Système de sondage**

<aside>
💡

Intégration des résultats de sondage Instagram dans le dashboard 

</aside>

**Fonctionnalités :**

- Création d’un compte Instagram (cf. MKTI)
    - Diffusion de sondages auprès des utilisateurs Instagram de Vera (*exemple : si un utilisateur parle avec Vera, à un moment un sondage peut apparaître*)
    - Collecte et stockage des réponses
- Visualisation des données depuis le dashboard créé à l’étape 1 :
    - Interface interactive
    - Design responsive
    - Affichage temps réel des statistiques

---

## **3️⃣ - Intégration du module de fact-checking sur d’autres réseaux sociaux**

<aside>
💡

Système de vérification automatisée des contenus extraits (vidéos et images)

</aside>

**Plateformes ciblées :**

- TikTok (obligatoire) **+ 1 plateforme au choix à justifier** parmi : Telegram ou Signal

**Processus technique :**

- Création d'un compte dédié
- Intégration d'un bot d'extraction de vidéos
- Récupération des métadonnées complètes (contexte, sources, données de contenu)
- Transmission automatique à Vera pour vérification (via l’API de Vera).
    - Documentation : [DOC VERA](https://www.notion.so/DOC-VERA-2b13a840d5f28038ac3eeefaf7f89176?pvs=21).
    - Clé API : adressez-vous à votre référent
- Format de livraison :
    - Tests si fonctionnel
    - REX si échec

Accéder à l’API de Vera
Authentication
All requests require an API key provided in the X-API-Key header. To obtain an API key
Endpoint
POST /api/v1/chat
​
Request Format
Headers
X-API-Key: your-api-key
Content-Type: application/json
​
Body
{  
	"userId": "your-internal-unique-user-identifier",  
	"query": "Your fact to verify"
}
​
Parameters
userId (string, required) : Uniquer identifier for the user in your system
query (string, required) : Question of claim to fact-check
Response
Content-Type : text/plain
Format :  Streaming response (chunks are sent as they are generated)
HTTP Status Codes
Code
Description
200
Request successful
401
Missing or invalid API key
403
Partner account disabled 
422
Invalid request body
429
Rate limit exceeded 
500
Internal Server Error
How to test
cURL
curl -X POST https://your-server.com/api/v1/chat \  
-H "X-API-Key: YOUR_API_KEY" \  
-H "Content-Type: application/json" \  
-d '{    
	"userId": "user123",    
	"query": "Is climate change real?"  
	}