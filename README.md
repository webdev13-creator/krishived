# कृषिवेद (KrishiVed) — Precision Agriculture Hackathon Prototype

> **Stage 3 Finalized Edition**  
> **Core Concept:** Satellite + AI + Field Knowledge + Farmer Advisory  
> **Main Workflow:** OBSERVE → ANALYSE → VALIDATE → ADVISE  

KrishiVed (कृषिवेद) is a hackathon-ready precision agriculture web prototype designed for Indian farming conditions. It translates complex satellite earth observation and meteorological data into simple, actionable, location-specific advice while keeping the farmer, laboratory soil testing, and local agricultural extension officers firmly at the centre.

---

## 1. Quick Start / How to Run

1. Keep all project files in the same directory:
   - `index.html` — Semantic, accessible HTML markup with full i18n hooks.
   - `style.css` — Modern, mobile-first CSS design system with Urdu RTL support.
   - `script.js` — Interactive UI logic, multilingual engine, and integration seams.
   - `config.js` — Configuration architecture placeholders for future live APIs.
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
3. **No build step, npm install, compilation, or server setup is required.**
4. For GPS geolocation, run on `localhost` (e.g. using `python -m http.server 8000` or VS Code Live Server) or via HTTPS, and grant location permission when prompted.

---

## 2. Hackathon Demo Video Walkthrough (13 Scenes)

This prototype is specifically sequenced to make recording a 3–5 minute hackathon demo video effortless and high-impact:

| Scene | Section | Description & Key Interaction |
| :--- | :--- | :--- |
| **SCENE 1** | **KrishiVed Home** (`#home`) | Hero section with high-tech agriculture branding, vision tagline, interactive 6-zone field visual, and live coordinate display. |
| **SCENE 2** | **The Challenge** (`#problem`) | Highlights *"One farm is not one uniform field"* and why blanket farming inputs cause waste and mistiming. |
| **SCENE 3** | **The Solution** (`#solution`) | 6 farmer-centric benefits matching Slide 5 of the deck: Right input right place, Smarter water use, Early stress alerts, Lower spending, Field records, Local languages. |
| **SCENE 4** | **How It Works** (`#how`) | The 4-step scientific pipeline: **OBSERVE → ANALYSE → VALIDATE → ADVISE** + prominent Scientific Note emphasizing that satellites provide clues, not direct mineral measurements. |
| **SCENE 5** | **Registration & Login** (`#register`, `#login`) | Demo registration form with device GPS geolocation button, input validation, and a 1-click sample login button (*"Continue with sample farmer"*). |
| **SCENE 6** | **Farmer Dashboard** (`#dashboard`) | Farmer overview showing North Plot (Wheat, 2.5 acres), weather widget (29°C), and interactive next steps checklist. |
| **SCENE 7** | **Field Zones Matrix** | Interactive zones (A to F). Tapping any zone dynamically updates vigour, surface moisture, and stress bars. Starts on **Zone C** (*Potential nutrient-stress clue*). |
| **SCENE 8** | **Field / Soil Report** (`#report`) | Comprehensive agronomic intelligence: **Field Summary panel** (7 dynamic subsections), **Google Maps & interactive fallback map** with live device GPS and coordinate validation, **Thermal-style field stress heatmap**, downloadable printable HTML summary (`KrishiVed-Field-Summary.html`), **Multilingual Farmer Voice Advisory** (Web Speech API in 23 languages), and the 3-step **Soil Validation Flow**. |
| **SCENE 9** | **AI Farmer Friend & Voice Adviser** (`#assistant`) | *KrishiVed Saathi* prototype chatbot answering agronomic queries on irrigation, soil testing, crop vigour, Zone C, and fertilizers in simple language. Equipped with full **Voice on the Adviser**: interactive text-to-speech narration (`🔊 Listen`), automatic voice readout toggle (`🔊 Voice ON/OFF`), and speech-to-text microphone input (`🎙️ Speak`). Also features an inline `🔊 Listen` button on the Soil Validation advisory text in `#report`. |
| **SCENE 10** | **Natural Fertilizer Hub** (`#hub`) | Clearly tagged **FUTURE / PILOT CONCEPT**. Unlocked upon soil test validation. Shows 4 category cards with demo prices, producers, locations, stock, and modal dialogs. |
| **SCENE 11** | **Farmer Livelihood Concept** (`#producer`) | Off-season and drought income model: Farmer ⇄ Producer ⇄ Supplier. Interactive modal to register farmer-producer interest into the local directory. |
| **SCENE 12** | **Multilingual Demonstration** | Switch between **English**, **हिन्दी (Hindi)**, and **اردو (Urdu with native RTL)**. Every section translates authentically without layout breaks. |
| **SCENE 13** | **Vision for India** (`#about`) | Final concluding narrative from Slide 8: *"Technology in the sky. Prosperity on the ground. See more. Waste less. Grow better."* |

---

## 3. Core Agricultural Logic & Scientific Integrity

- **Satellite Imagery Role:** Sentinel-2 multispectral imagery and vegetation indices (NDVI) track surface canopy reflectance, moisture trends, and spatial anomalies.
- **No Direct N-P-K Claims:** The prototype strictly adheres to agronomic science: satellites do **not** directly measure nitrogen, phosphorus, or potassium in the soil. They flag **"Nutrient-stress clues"** or **"Moisture anomalies"**.
- **Mandatory Soil Validation:** Exact nutrient dosage requires certified laboratory soil testing and consultation with local Krishi Vigyan Kendras (KVK) or extension agronomists.
- **Fertilizer Flow Order:**  
  `FIELD` → `FIELD REPORT` → `POTENTIAL NUTRIENT-STRESS CLUE` → `SOIL TEST / VALIDATION` → `ADVISORY` → `EXPLORE NATURAL FERTILIZER OPTIONS` → `NATURAL FERTILIZER HUB` → `DEMO PRODUCER` → `FUTURE LIVELIHOOD`

---

## 4. Natural Fertilizer Hub & Farmer Livelihood Concept

- **Future Ecosystem / Pilot Concept:** Clearly framed as an illustrative future network, **not** an existing commercial marketplace.
- **No Fake Claims:** Does not invent government certifications, lab licenses, commercial transactions, or payment gateways.
- **Dual-Sided Opportunity:**
  1. *Farmer Buyer:* Discovers suitable natural input categories (Compost, Vermicompost, Neem cake, Bio-inputs) after soil test validation.
  2. *Farmer Producer:* During off-seasons or drought periods, trained farmers can prepare quality-tested natural inputs to supply nearby clusters, creating supplemental rural income.

---

## 5. Multilingual Architecture & Urdu RTL

- **Active Supported Dictionaries:**
  - `en` — English (Primary default)
  - `hi` — हिन्दी (Natural agronomic terminology: कल्ले निकलना, जैविक कार्बन, नलकूप, आदि)
  - `ur` — اردو (Authentic Urdu typography with `dir="rtl"`, Noto Naskh Arabic font, and inverted directional arrows)
- **Scalable Architecture:**
  The language picker lists all 23 Indian Scheduled & Core Languages. Selecting any of the remaining 20 languages activates regional locale flags with an English fallback, ready for future localized string integration.

---

## 6. Future Integration Seams (`config.js`)

All third-party service seams are cleanly isolated in `config.js` and exposed via `window.KrishiVed.adapters`:

```javascript
window.KRISHIVED_CONFIG = {
  SUPABASE_URL: "",        // Supabase Auth & PostgreSQL DB
  SUPABASE_ANON_KEY: "",   // Supabase Client Anonymous Key
  GOOGLE_MAPS_API_KEY: "", // Google Maps JavaScript API SDK
  SATELLITE_API_URL: "",   // Sentinel Hub / Planet / Earth Engine
  WEATHER_API_URL: "",     // IMD (India Met Dept) / Open-Meteo
  AI_API_URL: "",          // Google Gemini API backend proxy
  PAYMENT_PUBLIC_KEY: "",  // Razorpay test key
  MARKETPLACE_API_URL: ""  // Local FPO Directory Registry API
};
```

---

## 7. Verification & Quality Assurance

- [x] HTML5 semantic validation passed.
- [x] Zero JavaScript console errors in modern browsers.
- [x] Responsive on Desktop (1400px+), Laptop (1180px), Tablet (820px), and Mobile (375px–600px).
- [x] Full keyboard accessibility and WCAG contrast compliant.
- [x] No fake API keys or misleading certifications.
- [x] Automated headless Chrome test suite passed (`test_suite.js`).

---
*© 2026 KrishiVed (कृषिवेद) · Developed for Precision Agriculture in India.*
