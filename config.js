/* ============================================================
   KrishiVed (कृषिवेद) — Integration Configuration
   ARCHITECTURE SEAMS ONLY · NO FAKE API KEYS
   Replace empty strings with verified credentials when deploying live backend services.
   ============================================================ */

window.KRISHIVED_CONFIG = {
  // 1. Backend & Database: Supabase (Auth, Farmers, Fields, Reports)
  SUPABASE_URL: "",        // e.g. https://your-project.supabase.co
  SUPABASE_ANON_KEY: "",   // Public client key (not service_role)

  // 2. Mapping: Google Maps JavaScript API
  GOOGLE_MAPS_API_KEY: "", // Google Maps API key (restricted to your domain)

  // 3. Earth Observation: Satellite Imagery & Vegetation Index APIs
  SATELLITE_API_URL: "",   // Sentinel Hub, Planet Labs, or Google Earth Engine endpoint

  // 4. Meteorological: Weather & Agro-climate context
  WEATHER_API_URL: "",     // IMD (India Meteorological Dept), Open-Meteo, or OpenWeatherMap

  // 5. Artificial Intelligence: Agronomic Chatbot & Reasoning
  AI_API_URL: "",          // Gemini API or secure backend proxy endpoint

  // 6. Payment & Billing: Subscription & Farmer Plans (Coming Soon)
  PAYMENT_PUBLIC_KEY: "",  // Razorpay or Stripe test key

  // 7. Future Ecosystem: Farmer Producer Organizations (FPO) & Local Input Directory
  MARKETPLACE_API_URL: ""  // Future pilot registry API
};
