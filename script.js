/* ============================================================
   KrishiVed (कृषिवेद) — Precision Agriculture Prototype Logic
   Hackathon MVP · Stage 3 Finalized Edition
   Core Philosophy: OBSERVE → ANALYSE → VALIDATE → ADVISE
   ============================================================ */

(() => {
  "use strict";

  // DOM Query Helpers
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Toast Notification System
  const toast = $("#toast");
  let toastTimer;
  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  // Active Farmer State (in-memory demo session)
  let activeFarmer = {
    name: "Ramesh Kumar",
    crop: "Wheat",
    location: "Ghaziabad, Uttar Pradesh",
    mobile: "9876543210",
    experience: "6–10 years",
    fieldSize: "2.5",
    latitude: "28.6692",
    longitude: "77.4538"
  };

  // Illustrative Field Zones (matching deck Slide 4 & 6)
  // Zone B: Moisture check
  // Zone C: Potential nutrient-stress clue (soil test recommended)
  // Zone E: Scout crop stress (pests/disease)
  // Zones A, D, F: Routine watch
  const zoneData = {
    A: {
      p: "watch",
      label: "ROUTINE WATCH",
      title: "Typical illustrative pattern",
      hint: "Continue regular field observation",
      detail: "Vegetation indices show uniform growth. Continue routine scouting and compare with next satellite pass.",
      vigour: "82% · Good",
      vigourNum: 82,
      moisture: "68% · Adequate",
      moistureNum: 68,
      stress: "14% · Low risk",
      stressNum: 14
    },
    B: {
      p: "moisture",
      label: "MOISTURE CHECK",
      title: "Surface moisture differs from nearby zones",
      hint: "Check soil moisture at root depth",
      detail: "Illustrative moisture pattern indicates a localized deficit. Check 10–15 cm root depth before running irrigation.",
      vigour: "68% · Moderate",
      vigourNum: 68,
      moisture: "44% · Check at root depth",
      moistureNum: 44,
      stress: "56% · Moisture deficit clue",
      stressNum: 56
    },
    C: {
      p: "soiltest",
      label: "NUTRIENT-STRESS CLUE",
      title: "Potential nutrient-stress clue",
      hint: "Soil testing recommended",
      detail: "Crop vigour differs from nearby zones. Nutrient stress is only one possible cause. Do NOT guess chemical inputs: collect a representative soil sample for lab validation.",
      vigour: "62% · Review needed",
      vigourNum: 62,
      moisture: "58% · Moderate",
      moistureNum: 58,
      stress: "68% · Nutrient-stress clue",
      stressNum: 68
    },
    D: {
      p: "watch",
      label: "ROUTINE WATCH",
      title: "Monitor crop development",
      hint: "Compare with next observation",
      detail: "Stable reflectance patterns observed. Maintain standard crop calendar.",
      vigour: "79% · Good",
      vigourNum: 79,
      moisture: "70% · Adequate",
      moistureNum: 70,
      stress: "16% · Low risk",
      stressNum: 16
    },
    E: {
      p: "scout",
      label: "SCOUT CROP STRESS",
      title: "Potential crop-stress pattern",
      hint: "Field inspection recommended",
      detail: "Elevated canopy stress detected while moisture appears normal. Walk this zone and inspect leaf undersides for pests, leaf rust, or root disease.",
      vigour: "64% · Review needed",
      vigourNum: 64,
      moisture: "62% · Moderate",
      moistureNum: 62,
      stress: "65% · Crop stress pattern",
      stressNum: 65
    },
    F: {
      p: "watch",
      label: "ROUTINE WATCH",
      title: "Keep observing this zone",
      hint: "Record changes during next field visit",
      detail: "Healthy canopy signals. No immediate priority action needed.",
      vigour: "81% · Good",
      vigourNum: 81,
      moisture: "66% · Adequate",
      moistureNum: 66,
      stress: "15% · Low risk",
      stressNum: 15
    }
  };

  // Initialize Zone Priority Data Attributes
  $$("[data-zone]").forEach(el => {
    const z = el.dataset.zone;
    if (zoneData[z]) el.dataset.priority = zoneData[z].p;
  });

  // Update Interactive Zone Views Across Hero, Dashboard, and Field Report
  let currentZone = "C"; // Start with Zone C (the nutrient-stress clue demonstration)

  function updateZone(zone) {
    currentZone = zone;
    const data = zoneData[zone] || zoneData.C;

    // Toggle button active states across all maps
    $$("[data-zone]").forEach(el => {
      const match = el.dataset.zone === zone;
      el.classList.toggle("selected", match);
      if (el.tagName === "BUTTON") el.setAttribute("aria-pressed", String(match));
    });

    // Update Hero Popover
    if ($("#selectedZoneLabel")) $("#selectedZoneLabel").textContent = `ZONE ${zone} · ${data.label}`;
    if ($("#selectedZoneText")) $("#selectedZoneText").textContent = data.title;
    if ($("#selectedZoneHint")) $("#selectedZoneHint").textContent = data.hint;

    // Update Dashboard Zone Panel
    if ($("#dashZoneName")) $("#dashZoneName").textContent = `ZONE ${zone}`;
    if ($("#dashZoneTitle")) $("#dashZoneTitle").textContent = data.title;

    // Update Dashboard Metric Cards dynamically
    if ($("#dashVigourVal")) $("#dashVigourVal").textContent = data.vigour;
    if ($("#dashVigourBar")) $("#dashVigourBar").style.width = `${data.vigourNum}%`;

    if ($("#dashMoistureVal")) $("#dashMoistureVal").textContent = data.moisture;
    if ($("#dashMoistureBar")) $("#dashMoistureBar").style.width = `${data.moistureNum}%`;

    if ($("#dashStressBar")) $("#dashStressBar").style.width = `${data.stressNum}%`;

    // Update Field Report Zone Card
    if ($("#reportZoneTag")) $("#reportZoneTag").textContent = `ZONE ${zone} · ${data.label}`;
    if ($("#reportZoneTitle")) $("#reportZoneTitle").textContent = data.hint;
    if ($("#reportZoneDesc")) $("#reportZoneDesc").textContent = data.detail;

    // Update Field Summary Panel
    if (typeof renderFieldSummary === "function") {
      renderFieldSummary();
    }

    // Update Voice Advisory text
    if (typeof updateVoiceTranscript === "function") {
      updateVoiceTranscript();
    }
  }

  $$("[data-zone]").forEach(el => el.addEventListener("click", () => updateZone(el.dataset.zone)));

  // Coordinate Formatting & Display Helper
  function setCoords(lat, lng) {
    const f = v => Math.abs(Number(v)).toFixed(4);
    const ns = lat >= 0 ? "N" : "S";
    const ew = lng >= 0 ? "E" : "W";
    const coordsStr = `${f(lat)}° ${ns}, ${f(lng)}° ${ew}`;
    if ($("#heroCoords")) $("#heroCoords").textContent = coordsStr;
    if ($("#reportCoords")) $("#reportCoords").textContent = `${f(lat)}° ${ns} · ${f(lng)}° ${ew}`;
    if ($("#fallbackMarkerTooltip")) $("#fallbackMarkerTooltip").textContent = `${f(lat)}° ${ns}, ${f(lng)}° ${ew}`;
    if ($("#reportLatInput") && document.activeElement !== $("#reportLatInput")) {
      $("#reportLatInput").value = Number(lat).toFixed(4);
    }
    if ($("#reportLngInput") && document.activeElement !== $("#reportLngInput")) {
      $("#reportLngInput").value = Number(lng).toFixed(4);
    }
    if (typeof renderFieldSummary === "function") {
      renderFieldSummary();
    }
  }

  // Geolocation Request (User-initiated only)
  if ($("#locateBtn")) {
    $("#locateBtn").addEventListener("click", () => {
      const status = $("#geoStatus");
      if (!navigator.geolocation) {
        if (status) status.textContent = "Geolocation is not supported by your browser. Coordinates can be entered manually.";
        notify("Geolocation not supported. Enter manually.");
        return;
      }
      if (status) status.textContent = "Requesting device GPS permission…";
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latField = $("#latitude");
          const lngField = $("#longitude");
          if (latField) latField.value = lat.toFixed(6);
          if (lngField) lngField.value = lng.toFixed(6);
          setCoords(lat, lng);
          if (status) status.textContent = `Location captured (±${Math.round(position.coords.accuracy)} m accuracy). Coordinates saved for session.`;
          notify("Field coordinates captured via GPS.");
        },
        error => {
          const msg = error.code === 1 ? "Location permission denied. Enter coordinates manually." :
            error.code === 2 ? "Position unavailable. Please type coordinates." :
            "GPS request timed out. Enter coordinates manually.";
          if (status) status.textContent = msg;
          notify(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // Mobile Navigation Toggle
  const menuToggle = $("#menuToggle");
  const nav = $("#mainNav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.textContent = open ? "×" : "☰";
    });
    $$("#mainNav a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    }));
  }

  // Farmer Registration Form
  const regForm = $("#registerForm");
  if (regForm) {
    regForm.addEventListener("submit", e => {
      e.preventDefault();
      const form = e.currentTarget;
      const la = $("#latitude");
      const lo = $("#longitude");

      if (la && la.value && !(Math.abs(+la.value) <= 90)) {
        la.setCustomValidity("Latitude must be between -90 and 90.");
      } else if (la) {
        la.setCustomValidity("");
      }

      if (lo && lo.value && !(Math.abs(+lo.value) <= 180)) {
        lo.setCustomValidity("Longitude must be between -180 and 180.");
      } else if (lo) {
        lo.setCustomValidity("");
      }

      if (!form.reportValidity()) return;

      activeFarmer = {
        name: $("#fullName").value.trim() || "Ramesh Kumar",
        mobile: $("#mobile").value.trim(),
        experience: $("#experience") ? $("#experience").value : "6–10 years",
        location: $("#locationInput").value.trim() || "Ghaziabad, Uttar Pradesh",
        crop: $("#cropSelect").value || "Wheat",
        fieldSize: $("#fieldSize") ? $("#fieldSize").value : "2.5",
        latitude: $("#latitude") ? $("#latitude").value.trim() : "28.6692",
        longitude: $("#longitude") ? $("#longitude").value.trim() : "77.4538"
      };

      // Update Dashboard view
      if ($("#dashFarmerName")) $("#dashFarmerName").textContent = activeFarmer.name;
      if ($("#dashAvatar")) $("#dashAvatar").textContent = activeFarmer.name.charAt(0).toUpperCase();
      if ($("#dashFieldMeta")) {
        $("#dashFieldMeta").textContent = `${activeFarmer.location} · ${activeFarmer.crop}${activeFarmer.fieldSize ? " · " + activeFarmer.fieldSize + " acres" : ""} · Sample field`;
      }

      // Update Report view
      if ($("#reportCrop")) $("#reportCrop").textContent = activeFarmer.crop;
      if ($("#reportLocation")) $("#reportLocation").textContent = activeFarmer.location;
      if (activeFarmer.latitude && activeFarmer.longitude) {
        setCoords(+activeFarmer.latitude, +activeFarmer.longitude);
      }

      if ($("#loginMessage")) {
        $("#loginMessage").textContent = `Demo profile loaded for ${activeFarmer.name}.`;
      }

      notify(`Profile created for ${activeFarmer.name}. Opening dashboard…`);
      const dash = $("#dashboard");
      if (dash) dash.scrollIntoView({ behavior: "smooth" });
    });
  }

  if ($("#editFieldBtn")) {
    $("#editFieldBtn").addEventListener("click", () => {
      const reg = $("#register");
      if (reg) reg.scrollIntoView({ behavior: "smooth" });
      notify("Update your field profile details below.");
    });
  }

  // Demo Login Form
  const loginForm = $("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!e.currentTarget.reportValidity()) return;
      const msg = $("#loginMessage");
      if (msg) msg.textContent = `Demo sign-in complete for ${$("#loginMobile").value}. (No backend auth).`;
      notify("Demo login successful.");
      const dash = $("#dashboard");
      if (dash) dash.scrollIntoView({ behavior: "smooth" });
    });
  }

  const demoLoginBtn = $("#demoLogin");
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener("click", () => {
      if ($("#loginMobile")) $("#loginMobile").value = "9876543210";
      if ($("#loginPassword")) $("#loginPassword").value = "demo123";
      activeFarmer = {
        name: "Ramesh Kumar",
        crop: "Wheat",
        location: "Ghaziabad, Uttar Pradesh",
        mobile: "9876543210",
        experience: "6–10 years",
        fieldSize: "2.5",
        latitude: "28.6692",
        longitude: "77.4538"
      };
      if ($("#dashFarmerName")) $("#dashFarmerName").textContent = activeFarmer.name;
      if ($("#dashAvatar")) $("#dashAvatar").textContent = "R";
      if ($("#reportCrop")) $("#reportCrop").textContent = activeFarmer.crop;
      if ($("#loginMessage")) $("#loginMessage").textContent = "Signed in as sample farmer Ramesh Kumar. Demo session active.";
      notify("Sample profile loaded. Welcome Ramesh Kumar!");
      const dash = $("#dashboard");
      if (dash) dash.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Report Actions: Copy Coordinates & Download Text Report
  if ($("#copyCoords")) {
    $("#copyCoords").addEventListener("click", async () => {
      const coords = `${activeFarmer.latitude || "28.669200"}, ${activeFarmer.longitude || "77.453800"}`;
      try {
        await navigator.clipboard.writeText(coords);
        notify("Field coordinates copied to clipboard.");
      } catch {
        const text = document.createElement("textarea");
        text.value = coords;
        document.body.appendChild(text);
        text.select();
        try {
          document.execCommand("copy");
          notify("Coordinates copied.");
        } catch {
          notify(coords);
        }
        text.remove();
      }
    });
  }

  // ============================================================
  // ENHANCED SOIL REPORTS: GOOGLE MAPS, LIVE LOCATION, FIELD SUMMARY,
  // DOWNLOAD SUMMARY PAGE & MULTILINGUAL VOICE ADVISORY
  // ============================================================

  // 1. Google Maps API Key Extractor
  function getGoogleMapsApiKey() {
    const cfg = window.KRISHIVED_CONFIG && window.KRISHIVED_CONFIG.GOOGLE_MAPS_API_KEY;
    if (!cfg || typeof cfg !== "string") return "";
    if (cfg.includes("https://maps.googleapis.com/maps/api/js?key=INSERT_YOUR_API_KEY&callback=initMap&libraries=marker&v=beta&solution_channel=GMP_CCS_reversegeocoding_v3")) return "";
    if (cfg.startsWith("http://") || cfg.startsWith("https://")) {
      try {
        const url = new URL(cfg);
        const k = url.searchParams.get("key");
        return (k && k !== "https://maps.googleapis.com/maps/api/js?key=INSERT_YOUR_API_KEY&callback=initMap&libraries=marker&v=beta&solution_channel=GMP_CCS_reversegeocoding_v3") ? k : "";
      } catch {
        return "";
      }
    }
    return cfg.trim();
  }

  // Map state
  let googleMapInstance = null;
  let googleMapMarker = null;
  let isGoogleMapsActive = false;

  function updateMapMarker(lat, lng) {
    if (isGoogleMapsActive && googleMapMarker && googleMapInstance) {
      const pos = { lat: Number(lat), lng: Number(lng) };
      googleMapMarker.setPosition(pos);
      googleMapInstance.setCenter(pos);
    } else {
      const marker = $("#fallbackMapMarker");
      if (marker) {
        marker.style.left = "50%";
        marker.style.top = "50%";
      }
    }
  }

  function initReportMap() {
    const mapContainer = $("#reportGoogleMap");
    const fallbackContainer = $("#reportDemoMapFallback");
    const badge = $("#mapModeBadge");
    const status = $("#reportLocStatus");
    const key = getGoogleMapsApiKey();

    const currentLat = parseFloat(activeFarmer.latitude) || 28.6692;
    const currentLng = parseFloat(activeFarmer.longitude) || 77.4538;

    if (key) {
      if (status) status.textContent = "Connecting to Google Maps satellite imagery…";
      const scriptId = "googleMapsApiScript";
      if (!document.getElementById(scriptId)) {
        window.gm_authFailure = () => {
          console.warn("KrishiVed: Google Maps authentication failure. Switched to interactive demo map.");
          activateFallbackMap("Google Maps API key rejected. Switched to interactive demo map.");
        };

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=marker&v=beta`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.google && window.google.maps) {
            mountGoogleMap(currentLat, currentLng);
          } else {
            activateFallbackMap("Google Maps library unavailable. Interactive demo map active.");
          }
        };
        script.onerror = () => {
          activateFallbackMap("Could not connect to Google Maps servers. Interactive demo map active.");
        };
        document.head.appendChild(script);
      } else if (window.google && window.google.maps) {
        mountGoogleMap(currentLat, currentLng);
      }
    } else {
      activateFallbackMap("Demo mode: Valid Google Maps API key required for live tiles. Interactive pin & GPS active.");
    }

    function mountGoogleMap(lat, lng) {
      try {
        if (!mapContainer) return;
        mapContainer.style.display = "block";
        if (fallbackContainer) fallbackContainer.style.display = "none";

        googleMapInstance = new google.maps.Map(mapContainer, {
          center: { lat, lng },
          zoom: 15,
          mapTypeId: "hybrid",
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false
        });

        googleMapMarker = new google.maps.Marker({
          position: { lat, lng },
          map: googleMapInstance,
          draggable: true,
          title: "KrishiVed Field Center"
        });

        // Click map to select location
        googleMapInstance.addListener("click", e => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          handleLocationUpdate(newLat, newLng, "Selected via map click");
        });

        // Drag marker to select location
        googleMapMarker.addListener("dragend", e => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          handleLocationUpdate(newLat, newLng, "Marker moved to new plot coordinates");
        });

        isGoogleMapsActive = true;
        if (badge) {
          badge.textContent = "Google Maps Satellite (Live)";
          badge.classList.add("live");
        }
        if (status) {
          status.textContent = "Live Google Maps active. Click or drag marker to reposition.";
          status.className = "report-loc-status success";
        }
      } catch (err) {
        console.warn("Failed to mount Google Maps:", err);
        activateFallbackMap("Error mounting Google Maps. Interactive demo map active.");
      }
    }

    function activateFallbackMap(reasonText) {
      isGoogleMapsActive = false;
      if (mapContainer) mapContainer.style.display = "none";
      if (fallbackContainer) fallbackContainer.style.display = "flex";
      if (badge) {
        badge.textContent = "Demo Map Mode";
        badge.classList.remove("live");
      }
      if (status) {
        status.textContent = reasonText;
        status.className = "report-loc-status";
      }

      // Interactive click on fallback map grid
      const grid = $("#fallbackMapGrid");
      if (grid && !grid.dataset.bound) {
        grid.dataset.bound = "true";
        grid.addEventListener("click", e => {
          const rect = grid.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const pctX = Math.max(10, Math.min(90, (x / rect.width) * 100));
          const pctY = Math.max(10, Math.min(90, (y / rect.height) * 100));

          const marker = $("#fallbackMapMarker");
          if (marker) {
            marker.style.left = `${pctX.toFixed(1)}%`;
            marker.style.top = `${pctY.toFixed(1)}%`;
          }

          // Offset around current base coordinates
          const baseLat = parseFloat(activeFarmer.latitude) || 28.6692;
          const baseLng = parseFloat(activeFarmer.longitude) || 77.4538;
          const deltaLat = ((50 - pctY) * 0.0006);
          const deltaLng = ((pctX - 50) * 0.0006);
          const newLat = +(baseLat + deltaLat).toFixed(4);
          const newLng = +(baseLng + deltaLng).toFixed(4);

          handleLocationUpdate(newLat, newLng, "Interactive demo map position updated");
        });
      }
    }
  }

  function handleLocationUpdate(lat, lng, statusMsg) {
    activeFarmer.latitude = Number(lat).toFixed(6);
    activeFarmer.longitude = Number(lng).toFixed(6);

    const latInput = $("#reportLatInput");
    const lngInput = $("#reportLngInput");
    if (latInput && document.activeElement !== latInput) latInput.value = Number(lat).toFixed(4);
    if (lngInput && document.activeElement !== lngInput) lngInput.value = Number(lng).toFixed(4);

    setCoords(lat, lng);
    updateMapMarker(lat, lng);
    renderFieldSummary();
    if (typeof updateVoiceTranscript === "function") updateVoiceTranscript();

    const status = $("#reportLocStatus");
    if (status) {
      status.textContent = `✓ ${statusMsg}: ${Number(lat).toFixed(4)}° N, ${Number(lng).toFixed(4)}° E`;
      status.className = "report-loc-status success";
    }
  }

  // Location Controls Setup: "Use Live Location" Button
  const liveLocationBtn = $("#reportLiveLocationBtn");
  if (liveLocationBtn) {
    liveLocationBtn.addEventListener("click", () => {
      const status = $("#reportLocStatus");
      if (!navigator.geolocation) {
        if (status) {
          status.textContent = "Geolocation is not supported by your browser. Please enter coordinates manually.";
          status.className = "report-loc-status error";
        }
        notify("Geolocation not supported by browser.");
        return;
      }

      if (status) {
        status.textContent = "Acquiring high-precision device GPS fix…";
        status.className = "report-loc-status";
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);
          handleLocationUpdate(lat, lng, `Live GPS position verified (±${acc} m accuracy)`);
          notify("Soil report updated with live device location.");
        },
        err => {
          let errText = "GPS request timed out. Enter coordinates manually.";
          if (err.code === 1) errText = "Location access denied. Please allow GPS permission or enter coordinates manually.";
          else if (err.code === 2) errText = "GPS position unavailable. Please enter coordinates manually.";
          if (status) {
            status.textContent = errText;
            status.className = "report-loc-status error";
          }
          notify(errText);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // Apply Manual Coordinates
  function applyManualCoords() {
    const latInput = $("#reportLatInput");
    const lngInput = $("#reportLngInput");
    const status = $("#reportLocStatus");
    if (!latInput || !lngInput) return;

    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      if (status) {
        status.textContent = "Error: Latitude must be a valid number between -90 and 90.";
        status.className = "report-loc-status error";
      }
      notify("Invalid Latitude. Must be between -90 and 90.");
      latInput.focus();
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      if (status) {
        status.textContent = "Error: Longitude must be a valid number between -180 and 180.";
        status.className = "report-loc-status error";
      }
      notify("Invalid Longitude. Must be between -180 and 180.");
      lngInput.focus();
      return;
    }

    handleLocationUpdate(lat, lng, "Coordinates applied manually");
    notify("Field coordinates updated.");
  }

  if ($("#reportApplyCoordsBtn")) {
    $("#reportApplyCoordsBtn").addEventListener("click", applyManualCoords);
  }
  if ($("#reportLatInput")) {
    $("#reportLatInput").addEventListener("keydown", e => { if (e.key === "Enter") applyManualCoords(); });
  }
  if ($("#reportLngInput")) {
    $("#reportLngInput").addEventListener("keydown", e => { if (e.key === "Enter") applyManualCoords(); });
  }

  // 2. Dynamic Field Summary Panel Renderer
  function renderFieldSummary() {
    const zone = currentZone || "C";
    const data = zoneData[zone] || zoneData.C;
    const farmer = activeFarmer;
    const lang = currentLang || "en";

    // Update Zone Pill in header
    if ($("#summaryZonePill")) {
      $("#summaryZonePill").textContent = `Zone ${zone} · ${data.label}`;
    }

    // SECTION 1: Field Overview
    const sumOverview = $("#sumOverviewContent");
    if (sumOverview) {
      if (lang === "hi") {
        sumOverview.innerHTML = `
          <div class="summary-meta-grid">
            <div class="summary-meta-item"><small>किसान का नाम</small><strong>${farmer.name}</strong></div>
            <div class="summary-meta-item"><small>चुनी गई फसल</small><strong>${farmer.crop}</strong></div>
            <div class="summary-meta-item"><small>खेत का आकार</small><strong>${farmer.fieldSize || "2.5"} एकड़ (नॉर्थ प्लॉट)</strong></div>
            <div class="summary-meta-item"><small>सक्रिय ज़ोन</small><strong>ज़ोन ${zone} (${data.label})</strong></div>
          </div>
          <p style="margin:8px 0 0;font-size:11.5px;color:#6b7c64;">
            📍 <strong>स्थान:</strong> ${farmer.location} · <strong>निर्देशांक:</strong> ${farmer.latitude || "28.6692"}° N, ${farmer.longitude || "77.4538"}° E
          </p>
        `;
      } else if (lang === "ur") {
        sumOverview.innerHTML = `
          <div class="summary-meta-grid">
            <div class="summary-meta-item"><small>کسان کا نام</small><strong>${farmer.name}</strong></div>
            <div class="summary-meta-item"><small>منتخب فصل</small><strong>${farmer.crop}</strong></div>
            <div class="summary-meta-item"><small>کھیت کا رقبہ</small><strong>${farmer.fieldSize || "2.5"} ایکڑ (شمالی پلاٹ)</strong></div>
            <div class="summary-meta-item"><small>فعال حصہ</small><strong>حصہ ${zone} (${data.label})</strong></div>
          </div>
          <p style="margin:8px 0 0;font-size:11.5px;color:#6b7c64;">
            📍 <strong>مقام:</strong> ${farmer.location} · <strong>متوازی نقاط:</strong> ${farmer.latitude || "28.6692"}° N, ${farmer.longitude || "77.4538"}° E
          </p>
        `;
      } else {
        sumOverview.innerHTML = `
          <div class="summary-meta-grid">
            <div class="summary-meta-item"><small>Farmer Name</small><strong>${farmer.name}</strong></div>
            <div class="summary-meta-item"><small>Primary Crop</small><strong>${farmer.crop}</strong></div>
            <div class="summary-meta-item"><small>Plot Area</small><strong>${farmer.fieldSize || "2.5"} acres (North Plot)</strong></div>
            <div class="summary-meta-item"><small>Active Zone</small><strong>Zone ${zone} (${data.label})</strong></div>
          </div>
          <p style="margin:8px 0 0;font-size:11.5px;color:#6b7c64;">
            📍 <strong>Location:</strong> ${farmer.location} · <strong>Coordinates:</strong> ${farmer.latitude || "28.6692"}° N, ${farmer.longitude || "77.4538"}° E
          </p>
        `;
      }
    }

    // SECTION 2: Observed Field Condition
    const sumCondition = $("#sumConditionContent");
    if (sumCondition) {
      let tagClass = "tag-routine";
      if (zone === "B") tagClass = "tag-moisture";
      else if (zone === "C") tagClass = "tag-nutrient";
      else if (zone === "E") tagClass = "tag-scout";

      if (lang === "hi") {
        sumCondition.innerHTML = `
          <span class="summary-highlight-tag ${tagClass}">ज़ोन ${zone} स्थिति: ${data.label}</span>
          <p style="margin:0 0 8px;font-weight:700;color:#2c4929;">${data.title}</p>
          <div class="summary-meta-grid" style="margin-bottom:8px;">
            <div class="summary-meta-item"><small>फसल ओज (NDVI)</small><strong>${data.vigour}</strong></div>
            <div class="summary-meta-item"><small>सतही नमी सूचकांक</small><strong>${data.moisture}</strong></div>
            <div class="summary-meta-item"><small>तनाव विसंगति स्तर</small><strong>${data.stress}</strong></div>
            <div class="summary-meta-item"><small>पास के ज़ोन से तुलना</small><strong>ज़ोन A: 82% | ज़ोन C: 62%</strong></div>
          </div>
          <p style="margin:0;font-size:11.5px;color:#64735e;">${data.detail}</p>
        `;
      } else if (lang === "ur") {
        sumCondition.innerHTML = `
          <span class="summary-highlight-tag ${tagClass}">حصہ ${zone} کی حالت: ${data.label}</span>
          <p style="margin:0 0 8px;font-weight:700;color:#2c4929;">${data.title}</p>
          <div class="summary-meta-grid" style="margin-bottom:8px;">
            <div class="summary-meta-item"><small>فصل کی شادابی (NDVI)</small><strong>${data.vigour}</strong></div>
            <div class="summary-meta-item"><small>سطحی نمی کا انڈیکس</small><strong>${data.moisture}</strong></div>
            <div class="summary-meta-item"><small>تناؤ کا انومالی لیول</small><strong>${data.stress}</strong></div>
            <div class="summary-meta-item"><small>قریبی حصوں سے موازنہ</small><strong>حصہ A: 82% | حصہ C: 62%</strong></div>
          </div>
          <p style="margin:0;font-size:11.5px;color:#64735e;">${data.detail}</p>
        `;
      } else {
        sumCondition.innerHTML = `
          <span class="summary-highlight-tag ${tagClass}">Zone ${zone} Status: ${data.label}</span>
          <p style="margin:0 0 8px;font-weight:700;color:#2c4929;">${data.title}</p>
          <div class="summary-meta-grid" style="margin-bottom:8px;">
            <div class="summary-meta-item"><small>Crop Vigour (NDVI)</small><strong>${data.vigour}</strong></div>
            <div class="summary-meta-item"><small>Surface Moisture Index</small><strong>${data.moisture}</strong></div>
            <div class="summary-meta-item"><small>Stress Anomaly Level</small><strong>${data.stress}</strong></div>
            <div class="summary-meta-item"><small>Spatial Comparison</small><strong>Zone A: 82% vs Zone C: 62%</strong></div>
          </div>
          <p style="margin:0;font-size:11.5px;color:#64735e;">${data.detail}</p>
        `;
      }
    }

    // SECTION 3: Recommended Next Steps (Numbered)
    const sumSteps = $("#sumStepsContent");
    if (sumSteps) {
      let steps = [];
      if (zone === "A") {
        if (lang === "hi") {
          steps = [
            "नियमित साप्ताहिक निरीक्षण के दौरान ज़ोन A में फसल विकास की एकरूपता देखें।",
            "कल्ले फूटने की स्थिति नोट करें और अगले उपग्रह पास से तुलना करें।",
            "मानक फसल कैलेंडर के अनुसार सामान्य सिंचाई और निराई-गुड़ाई जारी रखें।"
          ];
        } else if (lang === "ur") {
          steps = [
            "ہفتہ وار معمول کے معائنے کے دوران حصہ A میں فصل کی یکسانیت دیکھیں۔",
            "شگوفے پھوٹنے کی صورتحال نوٹ کریں اور اگلے سیٹلائٹ پاس سے موازنہ کریں۔",
            "معمول کے مطابق فصل کی آبپاشی اور گوڈی جاری رکھیں۔"
          ];
        } else {
          steps = [
            "Conduct routine weekly crop walk through Zone A to observe tiller uniformity.",
            "Log canopy development milestones and compare with upcoming satellite pass.",
            "Maintain standard irrigation and weeding schedule per crop calendar."
          ];
        }
      } else if (zone === "B") {
        if (lang === "hi") {
          steps = [
            "सिंचाई शुरू करने से पहले ज़ोन B में 10–15 सेमी जड़ की गहराई पर मिट्टी की नमी जाँचें।",
            "खेत की ढलान या मिट्टी के प्रकार में अंतर का निरीक्षण करें जहाँ पानी कम ठहरता हो।",
            "यदि केवल जड़ सूखी हो तभी लक्षित सिंचाई करें; पूरे खेत में अनावश्यक पानी न भरें।"
          ];
        } else if (lang === "ur") {
          steps = [
            "ٹیوب ویل چلانے سے پہلے حصہ B میں 10–15 سینٹی میٹر جڑ کی گہرائی پر مٹی کی نمی دیکھیں۔",
            "زمین کی اونچ نیچ یا مٹی کی ساخت کا جائزہ لیں جہاں پانی جلد خشک ہوتا ہو۔",
            "صرف خشک ہونے کی صورت میں ضرورت کے مطابق پانی دیں؛ بے جا آبپاشی سے گریز کریں۔"
          ];
        } else {
          steps = [
            "Inspect soil moisture at 10–15 cm root depth using an auger or spade before irrigating.",
            "Examine micro-topography or sandy subsoil pockets causing localized drainage.",
            "Apply targeted light watering only if root zone is deficient; avoid field inundation."
          ];
        }
      } else if (zone === "C") {
        if (lang === "hi") {
          steps = [
            "ज़ोन C में जाकर पत्तियों के रंग (पीलापन या हल्कापन) का सीधे निरीक्षण करें।",
            "ज़ोन C के विभिन्न कोनों से 0–15 सेमी की गहराई से 15–20 मिश्रित मिट्टी के नमूने एकत्र करें।",
            "कोई भी खाद खरीदने या डालने से पहले नमूना मान्यता प्राप्त लैब में N-P-K व जैविक कार्बन जाँच हेतु भेजें।",
            "लैब रिपोर्ट आने के बाद स्थानीय कृषि विज्ञान केंद्र (KVK) से सटीक खुराक तय करें।"
          ];
        } else if (lang === "ur") {
          steps = [
            "حصہ C میں چل کر پودوں کے رنگ اور زردی کا معائنہ کریں۔",
            "حصہ C سے 0–15 سینٹی میٹر گہرائی سے 15–20 مٹی کے نمونے اکٹھے کر کے مکس کریں۔",
            "کوئی بھی کھاد خریدنے سے پہلے مٹی کا نمونہ تصدیق شدہ لیب میں ٹیسٹ کے لیے بھیجیں۔",
            "لیب رپورٹ ملنے پر مقامی زرعی ماہر (KVK) سے کھاد کی درست مقدار کا مشورہ لیں۔"
          ];
        } else {
          steps = [
            "Walk Zone C on foot to inspect leaf coloration and stunted tillering in person.",
            "Collect a composite soil sample (15–20 cores at 0–15 cm root depth) across Zone C.",
            "Send sample to a certified laboratory for soil organic carbon, pH, and available N-P-K testing before ordering fertilizers.",
            "Review lab report with local KVK / extension agronomist to calculate precise, balanced nutrition."
          ];
        }
      } else if (zone === "D") {
        if (lang === "hi") {
          steps = [
            "फसल कैलेंडर के अनुसार सामान्य निगरानी जारी रखें।",
            "कल्लों की संख्या और पौधों के फैलाव की नियमित पुष्टि करें।",
            "आने वाले मौसम के आधार पर अगली सिंचाई की योजना बनाएँ।"
          ];
        } else if (lang === "ur") {
          steps = [
            "زرعی کیلنڈر کے مطابق معمول کی نگرانی جاری رکھیں۔",
            "پودوں کی تعداد اور شادابی کا باقاعدگی سے جائزہ لیں۔",
            "موسم کی پیشگوئی کے مطابق آئندہ آبپاشی کی منصوبہ بندی کریں۔"
          ];
        } else {
          steps = [
            "Maintain standard monitoring in sync with local crop stage schedule.",
            "Verify plant population density and canopy biomass closure.",
            "Record observations into field records for seasonal comparison."
          ];
        }
      } else if (zone === "E") {
        if (lang === "hi") {
          steps = [
            "ज़ोन E में तुरंत पैदल निरीक्षण करें: पत्तियों के नीचे माहू, सुंडी या फफूंद के लक्षण देखें।",
            "जड़ों की जाँच करें कि कहीं दीमक, सूत्रकृमि या जड़ सड़न की समस्या तो नहीं है।",
            "कीट या बीमारी दिखने पर पौधे का नमूना लें और स्थानीय कृषि अधिकारी से एकीकृत कीट प्रबंधन (IPM) सलाह लें।"
          ];
        } else if (lang === "ur") {
          steps = [
            "حصہ E میں فوری پیدل معائنہ کریں: پتوں کے نیچے کیڑے، سنڈی یا پھپھوندی کی علامات دیکھیں۔",
            "جڑوں کا معائنہ کریں کہ کہیں جڑ سڑن یا کیڑوں کا حملہ تو نہیں ہے۔",
            "کیڑے یا بیماری کی صورت میں پودے کا نمونہ لے کر مقامی زرعی افسر سے کیمیائی و حیاتیاتی علاج پوچھیں۔"
          ];
        } else {
          steps = [
            "Immediately scout Zone E on foot: inspect leaf undersides and stems for insect pests, aphids, or rust pustules.",
            "Examine root systems for nematode galls, wireworms, or fungal root rot.",
            "If pest or disease symptoms appear, collect specimens and consult local KVK officer for Integrated Pest Management (IPM)."
          ];
        }
      } else {
        if (lang === "hi") {
          steps = [
            "नियमित रूप से ज़ोन F का निरीक्षण जारी रखें और बदलाव दर्ज करें।",
            "अगले उपग्रह पास में वर्णक्रमीय परावर्तन की स्थिरता देखें।",
            "मानक कृषि कार्यों का पालन करते रहें।"
          ];
        } else if (lang === "ur") {
          steps = [
            "حصہ F کا باقاعدہ معائنہ جاری رکھیں اور تبدیلیاں نوٹ کریں۔",
            "اگلے سیٹلائٹ پاس میں شادابی کے استحکام کا جائزہ لیں۔",
            "معمول کی زرعی دیکھ بھال جاری رکھیں۔"
          ];
        } else {
          steps = [
            "Continue regular monitoring of Zone F and record vegetative changes.",
            "Compare reflectance stability against upcoming Sentinel satellite revisit pass.",
            "Maintain standard balanced agronomic practices."
          ];
        }
      }

      sumSteps.innerHTML = `
        <ol class="summary-steps-list">
          ${steps.map((s, idx) => `<li><span class="step-badge">${idx + 1}</span><span>${s}</span></li>`).join("")}
        </ol>
      `;
    }

    // SECTION 4: Irrigation and Moisture Guidance
    const sumIrrigation = $("#sumIrrigationContent");
    if (sumIrrigation) {
      if (lang === "hi") {
        sumIrrigation.innerHTML = `
          <p style="margin:0 0 6px;"><strong>सतही नमी सूचक:</strong> ${data.moisture}</p>
          <p style="margin:0;font-size:11.5px;color:#5a6854;">
            💡 <strong>मार्गदर्शन:</strong> उपग्रह केवल ऊपरी मिट्टी और पत्तियों का परावर्तन देखते हैं। नलकूप चलाने से पहले 10–15 सेमी गहराई पर मिट्टी हाथ में लेकर नमी परखें। यदि आगामी 48 घंटों में बारिश का अनुमान हो तो सिंचाई टालें ताकि जलभराव न हो।
          </p>
        `;
      } else if (lang === "ur") {
        sumIrrigation.innerHTML = `
          <p style="margin:0 0 6px;"><strong>سطحی نمی کا اشارہ:</strong> ${data.moisture}</p>
          <p style="margin:0;font-size:11.5px;color:#5a6854;">
            💡 <strong>رہنمائی:</strong> سیٹلائٹ صرف اوپری سطح کا عکس دیکھتا ہے۔ ٹیوب ویل چلانے سے پہلے 10–15 سینٹی میٹر گہرائی پر مٹی دیکھ کر نمی جانچیں۔ اگر بارش کی پیشگوئی ہو تو آبپاشی مؤخر کریں تاکہ جڑیں نہ گلیں۔
          </p>
        `;
      } else {
        sumIrrigation.innerHTML = `
          <p style="margin:0 0 6px;"><strong>Surface Moisture Signal:</strong> ${data.moisture}</p>
          <p style="margin:0;font-size:11.5px;color:#5a6854;">
            💡 <strong>Practical Guide:</strong> Satellites observe canopy and topsoil reflectance. Always physically verify soil cohesion at 10–15 cm root depth before running tube wells. If rain is forecast within 48 hours, defer irrigation to avoid waterlogging and nitrogen leaching.
          </p>
        `;
      }
    }

    // SECTION 5: Fertilizer and Soil Testing Guidance
    const sumFertilizer = $("#sumFertilizerContent");
    if (sumFertilizer) {
      if (lang === "hi") {
        sumFertilizer.innerHTML = `
          <div class="summary-caveat-box">
            <span class="summary-caveat-icon">⚠️</span>
            <div>
              <strong>महत्वपूर्ण वैज्ञानिक नियम (Scientific Caveat):</strong>
              <p style="margin:3px 0 0;">उपग्रह चित्र केवल परावर्तन पैटर्न और पोषक तनाव के <u>संकेत</u> देते हैं। वे सीधे नाइट्रोजन, फॉस्फोरस या पोटाश (N-P-K) की मात्रा <u>नहीं मापते</u>।</p>
            </div>
          </div>
          <p style="margin:8px 0 0;font-size:11.5px;color:#52644d;">
            🧪 <strong>मिट्टी परीक्षण अनिवार्य:</strong> कोई भी खाद डालने से पहले ज़ोन से 15–20 जगह से मिट्टी का नमूना लेकर अधिकृत प्रयोगशाला से जाँच कराएँ। रिपोर्ट मिलने के बाद उपयुक्त जैविक खाद (केंचुआ खाद, कम्पोस्ट) से मिट्टी का जैविक कार्बन सुधारें।
          </p>
        `;
      } else if (lang === "ur") {
        sumFertilizer.innerHTML = `
          <div class="summary-caveat-box">
            <span class="summary-caveat-icon">⚠️</span>
            <div>
              <strong>اہم سائنسی اصول (Scientific Caveat):</strong>
              <p style="margin:3px 0 0;">سیٹلائٹ صرف انعکاس اور غذائی تناؤ کے <u>اشارے</u> فراہم کرتا ہے۔ یہ براہ راست N-P-K کی مقدار <u>نہیں ناپتا</u>۔</p>
            </div>
          </div>
          <p style="margin:8px 0 0;font-size:11.5px;color:#52644d;">
            🧪 <strong>مٹی ٹیسٹ لازمی:</strong> کھاد ڈالنے سے پہلے مٹی کا لیب ٹیسٹ کرائیں۔ رپورٹ آنے کے بعد مناسب قدرتی کھاد (کیچوا کھاد، کمپوسٹ) کے ذریعے نامیاتی مادہ بہتر بنائیں۔
          </p>
        `;
      } else {
        sumFertilizer.innerHTML = `
          <div class="summary-caveat-box">
            <span class="summary-caveat-icon">⚠️</span>
            <div>
              <strong>Critical Scientific Principle:</strong>
              <p style="margin:3px 0 0;">Satellite observations identify canopy optical reflectance clues. They <u>do NOT directly measure</u> soil nitrogen, phosphorus, or potassium (N-P-K) quantities.</p>
            </div>
          </div>
          <p style="margin:8px 0 0;font-size:11.5px;color:#52644d;">
            🧪 <strong>Soil Validation Required:</strong> Collect representative core samples (0–15 cm depth) across Zone ${zone} for accredited laboratory testing before altering fertilizer applications. After validation, prioritize organic compost/vermicompost to build long-term soil organic carbon.
          </p>
        `;
      }
    }

    // SECTION 6: Pest and Disease Inspection
    const sumPest = $("#sumPestContent");
    if (sumPest) {
      const isUrgent = zone === "E";
      if (lang === "hi") {
        sumPest.innerHTML = `
          <p style="margin:0 0 6px;">
            ${isUrgent ? '<strong style="color:#b23b2b;">🚨 प्राथमिकता निरीक्षण आवश्यक:</strong>' : '<strong>🔍 सामान्य निगरानी:</strong>'}
            ${isUrgent ? 'ज़ोन E में पत्तियों पर असामान्य तनाव देखा गया है।' : 'वर्तमान में कोई गंभीर कीट प्रकोप नहीं दिखा है।'}
          </p>
          <ul style="margin:0;padding-left:18px;font-size:11.5px;color:#5a6854;line-height:1.6;">
            <li>पत्तियों की निचली सतह पर माहू (aphids), सफेद मक्खी या माइट्स देखें।</li>
            <li>पत्तियों पर पीले या भूरे फफूंदीय धब्बे (rust lesions) की जाँच करें।</li>
            <li>तने के निचले हिस्से पर दीमक या कॉलर रॉट के लक्षण देखें।</li>
          </ul>
        `;
      } else if (lang === "ur") {
        sumPest.innerHTML = `
          <p style="margin:0 0 6px;">
            ${isUrgent ? '<strong style="color:#b23b2b;">🚨 ترجیحی معائنہ درکار:</strong>' : '<strong>🔍 معمول کی نگرانی:</strong>'}
            ${isUrgent ? 'حصہ E میں فصل پر غیر معمولی تناؤ پایا گیا ہے۔' : 'فی الحال کسی شدید بیماری کی علامت نہیں ہے۔'}
          </p>
          <ul style="margin:0;padding-right:18px;font-size:11.5px;color:#5a6854;line-height:1.6;">
            <li>پتوں کے نچلے حصے پر سست تیلہ، سفید مکھی یا کیڑے تلاش کریں۔</li>
            <li>پتوں پر پیلے یا بھورے دھبے (رسٹ/رتوا) دیکھیں۔</li>
            <li>تنے کی بنیاد پر دیمک یا فنگس کی علامات جانچیں۔</li>
          </ul>
        `;
      } else {
        sumPest.innerHTML = `
          <p style="margin:0 0 6px;">
            ${isUrgent ? '<strong style="color:#b23b2b;">🚨 Priority Scouting Alert:</strong>' : '<strong>🔍 Routine Monitoring:</strong>'}
            ${isUrgent ? 'Elevated canopy stress detected in Zone E.' : 'No anomalous pathogen signal detected in this zone.'}
          </p>
          <ul style="margin:0;padding-left:18px;font-size:11.5px;color:#5a6854;line-height:1.6;">
            <li>Inspect undersides of flag leaves for aphids, thrips, or mites.</li>
            <li>Check leaf blades for yellow or brown rust pustules and blight lesions.</li>
            <li>Check root crowns for collar rot or nematode galling.</li>
          </ul>
        `;
      }
    }

    // SECTION 7: When to Contact an Expert
    const sumExpert = $("#sumExpertContent");
    if (sumExpert) {
      if (lang === "hi") {
        sumExpert.innerHTML = `
          <p style="margin:0;font-size:11.5px;line-height:1.65;color:#55664f;">
            👨‍🌾 <strong>कृषि विज्ञान केंद्र (KVK) या स्थानीय कृषि अधिकारी से संपर्क करें यदि:</strong><br>
            1. लगातार दो उपग्रह पासों में ज़ोन का तनाव बना रहता है या बढ़ता है।<br>
            2. खेत में 10% से अधिक पौधों पर अज्ञात कीट या फफूंदी के लक्षण दिखें।<br>
            3. प्रयोगशाला की मिट्टी जाँच रिपोर्ट के आधार पर खाद व सूक्ष्म पोषक तत्वों की सटीक मात्रा तय करनी हो।
          </p>
        `;
      } else if (lang === "ur") {
        sumExpert.innerHTML = `
          <p style="margin:0;font-size:11.5px;line-height:1.65;color:#55664f;">
            👨‍🌾 <strong>مقامی زرعی ماہر یا KVK سے کب رابطہ کریں:</strong><br>
            1. اگر دو مسلسل سیٹلائٹ پاسوں میں تناؤ برقرار رہے یا بڑھے۔<br>
            2. پودوں پر نامعلوم کیڑوں یا بیماری کا اچانک حملہ ہو۔<br>
            3. لیب سے حاصل شدہ مٹی ٹیسٹ رپورٹ کی روشنی میں کھاد کی مقدار طے کرنی ہو۔
          </p>
        `;
      } else {
        sumExpert.innerHTML = `
          <p style="margin:0;font-size:11.5px;line-height:1.65;color:#55664f;">
            👨‍🌾 <strong>Escalate to local Krishi Vigyan Kendra (KVK) or Extension Officer when:</strong><br>
            1. Canopy stress anomaly persists across two consecutive satellite revisits.<br>
            2. Over 10% of surveyed plants exhibit unknown wilting, leaf scorch, or pest colonization.<br>
            3. Formulating prescription dosage from your certified laboratory soil health card.
          </p>
        `;
      }
    }
  }

  // 3. Download Clean, Printable HTML Summary Page
  function downloadSummaryPage() {
    const zone = currentZone || "C";
    const data = zoneData[zone] || zoneData.C;
    const farmer = activeFarmer;
    const dateStr = new Date().toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });

    const stepsHtml = $("#sumStepsContent ol") ? $("#sumStepsContent ol").innerHTML : `
      <li>Walk Zone ${zone} on foot to inspect canopy vigour and color variation.</li>
      <li>Check soil moisture at 10–15 cm root depth before irrigation decisions.</li>
      <li>Collect representative composite soil sample for lab validation before altering chemical or natural inputs.</li>
    `;

    const htmlContent = `<!DOCTYPE html>
<html lang="${currentLang || 'en'}" dir="${currentLang === 'ur' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <title>KrishiVed Field Intelligence Summary — Zone ${zone} (${farmer.name})</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      --forest: #1c381e;
      --leaf: #5e964b;
      --sand: #fbfcf9;
      --border: #dbe4d2;
      --text: #2c3e29;
      --muted: #6f8069;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--sand);
      color: var(--text);
      line-height: 1.6;
      padding: 30px;
    }
    .sheet {
      max-width: 860px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 36px 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid var(--forest);
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .brand { font-size: 26px; font-weight: 800; color: var(--forest); display: flex; align-items: center; gap: 10px; }
    .brand-mark { background: var(--forest); color: #b7e38f; border-radius: 8px; padding: 4px 10px; font-size: 20px; }
    .doc-meta { text-align: right; font-size: 11px; color: var(--muted); }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px; }
    .card { background: #f8faf5; border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; }
    .card small { font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700; display: block; }
    .card strong { font-size: 14px; color: var(--forest); display: block; margin-top: 3px; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .metric-box { background: #eef5e6; border: 1px solid #cce0bf; border-radius: 8px; padding: 12px; text-align: center; }
    .metric-box small { font-size: 11px; color: var(--muted); }
    .metric-box strong { font-size: 16px; color: #2e5927; display: block; margin-top: 4px; }
    .section-title { font-size: 15px; font-weight: 800; color: var(--forest); border-bottom: 1px solid #e2ebd8; padding-bottom: 6px; margin: 20px 0 10px; }
    .steps-list { margin-left: 20px; margin-bottom: 16px; }
    .steps-list li { margin-bottom: 8px; font-size: 13px; }
    .caveat-box { background: #fff8e8; border: 1px solid #f2d99d; border-radius: 8px; padding: 14px 16px; margin: 20px 0; font-size: 12.5px; color: #7a5416; }
    .caveat-box strong { display: block; margin-bottom: 4px; color: #5c3c0a; font-size: 13px; }
    .print-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .print-btn { background: var(--forest); color: #fff; border: 0; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .signature-row { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed var(--border); font-size: 12px; color: var(--muted); }
    @media print {
      body { padding: 0; background: #fff; }
      .sheet { border: 0; box-shadow: none; padding: 0; }
      .print-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="print-bar">
      <span style="font-size:12px;color:var(--muted);">KrishiVed Field Intelligence Advisory Report (Printable HTML Document)</span>
      <button class="print-btn" onclick="window.print()">Print / Save as PDF 🖨️</button>
    </div>

    <header class="header">
      <div>
        <div class="brand"><span class="brand-mark">कृ</span> कृषिवेद (KrishiVed)</div>
        <p style="font-size:12px;color:var(--muted);margin-top:4px;">Precision Agriculture &amp; Spatial Field Intelligence</p>
      </div>
      <div class="doc-meta">
        <strong>FIELD ADVISORY SUMMARY</strong><br>
        Date: ${dateStr}<br>
        Report ID: KV-RPT-${zone}-${Date.now().toString().slice(-6)}
      </div>
    </header>

    <div class="grid">
      <div class="card"><small>Farmer Name</small><strong>${farmer.name}</strong></div>
      <div class="card"><small>Plot &amp; Area</small><strong>North Plot (${farmer.fieldSize || '2.5'} acres)</strong></div>
      <div class="card"><small>Primary Crop</small><strong>${farmer.crop}</strong></div>
      <div class="card"><small>Field Coordinates</small><strong>${farmer.latitude || '28.6692'}° N, ${farmer.longitude || '77.4538'}° E</strong></div>
    </div>

    <div class="metrics">
      <div class="metric-box"><small>Selected Zone</small><strong>Zone ${zone} (${data.label})</strong></div>
      <div class="metric-box"><small>Crop Vigour (NDVI)</small><strong>${data.vigour}</strong></div>
      <div class="metric-box"><small>Surface Moisture</small><strong>${data.moisture}</strong></div>
    </div>

    <div class="section-title">1. Observed Field Condition</div>
    <p style="font-size:13px;margin-bottom:12px;"><strong>${data.title}</strong> — ${data.detail}</p>

    <div class="section-title">2. Recommended Next Steps for Zone ${zone}</div>
    <ol class="steps-list">
      ${stepsHtml}
    </ol>

    <div class="section-title">3. Moisture &amp; Irrigation Guidance</div>
    <p style="font-size:13px;margin-bottom:12px;">
      Surface reflectance indicates: <strong>${data.moisture}</strong>. Satellites monitor top-layer patterns. Always physically confirm moisture cohesion at active root depth (10–15 cm) using a spade or auger. Defer irrigation if rainfall is forecast within 48 hours.
    </p>

    <div class="caveat-box">
      <strong>CRITICAL SCIENTIFIC PRINCIPLE:</strong>
      Satellite observations detect optical reflection patterns and potential nutrient-stress clues. They DO NOT directly measure exact nitrogen, phosphorus, or potassium (N-P-K) quantities. Exact nutrient requirements must always be validated through certified laboratory soil testing and qualified local agricultural expertise.
    </div>

    <div class="section-title">4. Soil Validation &amp; Natural Inputs Status</div>
    <p style="font-size:13px;margin-bottom:12px;">
      Status: <strong>${soilState === 'result' ? 'Soil Test Validated (Demo: pH 7.3, Organic Carbon 0.51% Low, Available N Low, P Medium, K Adequate)' : 'Soil Validation Pending / Sample in Transit'}</strong>.
      Following laboratory confirmation, natural organic fertilizers (compost, vermicompost) may be integrated into crop management to restore soil organic carbon.
    </p>

    <div class="signature-row">
      <div>Field Inspector / Local Agronomist: ____________________</div>
      <div>Farmer Signature: ____________________</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KrishiVed-Field-Summary.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify("Field Summary HTML report downloaded. Open in browser to view or print.");
  }

  if ($("#downloadSummaryBtn")) {
    $("#downloadSummaryBtn").addEventListener("click", downloadSummaryPage);
  }

  // 4. Multilingual Farmer Voice Advisory (Web Speech API)
  let currentUtterance = null;
  let voiceAdvisoryActive = false;

  const voiceLangCodes = {
    en: "en-IN",
    hi: "hi-IN",
    ur: "ur-PK",
    mr: "mr-IN",
    bn: "bn-IN",
    pa: "pa-IN",
    gu: "gu-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    or: "or-IN",
    as: "as-IN",
    mai: "hi-IN",
    sat: "hi-IN",
    ks: "ur-IN",
    ne: "ne-NP",
    kok: "mr-IN",
    sd: "ur-PK",
    doi: "hi-IN",
    brx: "as-IN",
    mni: "bn-IN",
    sa: "sa-IN"
  };

  function generateVoiceAdvisoryText(langCode) {
    const zone = currentZone || "C";
    const farmer = activeFarmer;

    if (langCode === "hi") {
      if (zone === "C") {
        return `नमस्ते ${farmer.name} जी। आपके ${farmer.crop} के खेत के ज़ोन सी में संभावित पोषक तनाव का संकेत देखा गया है। ध्यान रहे, उपग्रह केवल संकेत देते हैं, एन-पी-के की मात्रा नहीं मापते। कोई भी खाद डालने से पहले ज़ोन सी से मिट्टी का नमूना लेकर लैब में जाँच अवश्य कराएँ।`;
      } else if (zone === "B") {
        return `नमस्ते ${farmer.name} जी। आपके खेत के ज़ोन बी में सतही नमी की कमी का संकेत मिला है। सिंचाई चलाने से पहले दस से पंद्रह सेंटीमीटर जड़ की गहराई पर मिट्टी की नमी स्वयं जाँचें।`;
      } else if (zone === "E") {
        return `नमस्ते ${farmer.name} जी। ज़ोन ई में फसल पर अतिरिक्त तनाव दिखाई दे रहा है। कृपया ज़ोन ई में तुरंत जाकर पत्तियों के नीचे कीड़े या बीमारी की जाँच करें और विशेषज्ञ से सलाह लें।`;
      } else {
        return `नमस्ते ${farmer.name} जी। ज़ोन ${zone} में फसल की बढ़वार सामान्य और स्थिर है। नियमित निगरानी जारी रखें।`;
      }
    } else if (langCode === "ur") {
      if (zone === "C") {
        return `محترم ${farmer.name} صاحب۔ آپ کے ${farmer.crop} کے کھیت کے حصہ سی میں ممکنہ غذائی کمی کا اشارہ ملا ہے۔ یاد رہے کہ سیٹلائٹ صرف اشارے دیتا ہے، براہ راست کھاد نہیں ناپتا۔ کوئی بھی کھاد استعمال کرنے سے پہلے مٹی کا ٹیسٹ ضرور کروائیں۔`;
      } else if (zone === "B") {
        return `محترم ${farmer.name} صاحب۔ حصہ بی میں سطحی نمی میں کمی نوٹ کی گئی ہے۔ ٹیوب ویل چلانے سے پہلے دس سے پندرہ سینٹی میٹر جڑ کے پاس نمی ضرور چیک کریں۔`;
      } else if (zone === "E") {
        return `محترم ${farmer.name} صاحب۔ حصہ ای میں فصل پر غیر معمولی تناؤ دیکھا گیا ہے۔ پودوں اور پتوں کا فوری معائنہ کریں تاکہ کیڑوں یا بیماری کا بروقت علاج کیا جا سکے۔`;
      } else {
        return `محترم ${farmer.name} صاحب۔ حصہ ${zone} میں فصل کی حالت مستحکم ہے۔ معمول کا معائنہ جاری رکھیں۔`;
      }
    } else {
      if (zone === "C") {
        return `Hello ${farmer.name}. In your ${farmer.crop} field, Zone C displays a potential nutrient-stress clue. Please remember: satellite signals detect optical reflectance, not direct N-P-K. We strongly advise collecting a laboratory soil sample before selecting fertilizers.`;
      } else if (zone === "B") {
        return `Hello ${farmer.name}. Zone B shows a localized moisture deficit pattern. Please check soil moisture at 10 to 15 centimeters root depth before running irrigation.`;
      } else if (zone === "E") {
        return `Hello ${farmer.name}. Elevated canopy stress detected in Zone E. Please scout this zone on foot to inspect leaf undersides for pests or disease, and consult your local agricultural expert.`;
      } else {
        return `Hello ${farmer.name}. Zone ${zone} exhibits healthy, uniform vegetative vigour. Continue routine field scouting.`;
      }
    }
  }

  function updateVoiceTranscript() {
    const picker = $("#voiceLangSelect");
    const lang = picker ? picker.value : (currentLang || "hi");
    const text = generateVoiceAdvisoryText(lang);
    const box = $("#voiceTranscriptText");
    if (box) box.textContent = text;
  }

  function initVoiceAdvisory() {
    const playBtn = $("#voicePlayBtn");
    const pauseBtn = $("#voicePauseBtn");
    const resumeBtn = $("#voiceResumeBtn");
    const stopBtn = $("#voiceStopBtn");
    const badge = $("#voiceStatusBadge");
    const langSelect = $("#voiceLangSelect");

    if (!window.speechSynthesis) {
      if (badge) {
        badge.textContent = "Not Supported";
        badge.className = "voice-status-badge";
      }
      if (playBtn) playBtn.disabled = true;
      return;
    }

    function setBadgeState(state) {
      if (!badge) return;
      badge.className = "voice-status-badge";
      if (state === "playing") {
        badge.textContent = "▶ Playing";
        badge.classList.add("playing");
        if (playBtn) playBtn.disabled = true;
        if (pauseBtn) { pauseBtn.disabled = false; pauseBtn.style.display = "inline-flex"; }
        if (resumeBtn) resumeBtn.style.display = "none";
        if (stopBtn) stopBtn.disabled = false;
      } else if (state === "paused") {
        badge.textContent = "⏸ Paused";
        badge.classList.add("paused");
        if (pauseBtn) pauseBtn.style.display = "none";
        if (resumeBtn) { resumeBtn.style.display = "inline-flex"; resumeBtn.disabled = false; }
      } else {
        badge.textContent = "● Ready";
        if (playBtn) playBtn.disabled = false;
        if (pauseBtn) { pauseBtn.disabled = true; pauseBtn.style.display = "inline-flex"; }
        if (resumeBtn) resumeBtn.style.display = "none";
        if (stopBtn) stopBtn.disabled = true;
      }
    }

    function stopVoice() {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      currentUtterance = null;
      voiceAdvisoryActive = false;
      setBadgeState("ready");
    }

    function playVoice() {
      stopVoice();
      const lang = langSelect ? langSelect.value : "hi";
      const text = generateVoiceAdvisoryText(lang);
      updateVoiceTranscript();

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      const targetTag = voiceLangCodes[lang] || "hi-IN";
      utterance.lang = targetTag;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        const exactVoice = voices.find(v => v.lang === targetTag || v.lang.startsWith(lang));
        if (exactVoice) {
          utterance.voice = exactVoice;
        } else {
          const fallbackVoice = voices.find(v => v.lang.startsWith("hi") || v.lang.startsWith("en"));
          if (fallbackVoice) utterance.voice = fallbackVoice;
        }
      }

      utterance.onstart = () => {
        voiceAdvisoryActive = true;
        setBadgeState("playing");
      };

      utterance.onpause = () => {
        setBadgeState("paused");
      };

      utterance.onresume = () => {
        setBadgeState("playing");
      };

      utterance.onend = () => {
        voiceAdvisoryActive = false;
        setBadgeState("ready");
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        voiceAdvisoryActive = false;
        setBadgeState("ready");
      };

      window.speechSynthesis.speak(utterance);
    }

    if (playBtn) playBtn.addEventListener("click", playVoice);
    if (pauseBtn) pauseBtn.addEventListener("click", () => {
      if (window.speechSynthesis) window.speechSynthesis.pause();
    });
    if (resumeBtn) resumeBtn.addEventListener("click", () => {
      if (window.speechSynthesis) window.speechSynthesis.resume();
    });
    if (stopBtn) stopBtn.addEventListener("click", stopVoice);

    if (langSelect) {
      langSelect.addEventListener("change", () => {
        stopVoice();
        updateVoiceTranscript();
      });
    }

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }

    updateVoiceTranscript();
    setBadgeState("ready");
  }

  // Initialize Soil Report Modules on startup
  initReportMap();
  renderFieldSummary();
  initVoiceAdvisory();

  // Multilingual Dictionaries (English, Hindi, Urdu RTL)
  const languages = {
    en: {
      ribbon: '<span class="pulse"></span> HACKATHON MVP · DEMO / ILLUSTRATIVE DATA · SATELLITE + AI + FIELD KNOWLEDGE',
      brandSub: 'KRISHIVED · FIELD INTELLIGENCE',
      navHome: 'Home',
      navProblem: 'Challenge',
      navSolution: 'Solution',
      navHow: 'How it works',
      navDashboard: 'Dashboard',
      navReport: 'Field report',
      navAssistant: 'AI Farmer Friend',
      navHub: 'Natural Fertilizer Hub',
      navAbout: 'About',
      signIn: 'Farmer login ↗',
      heroEye: 'SATELLITE + AI + FIELD KNOWLEDGE',
      heroTitle: 'See the field.<br><em>Understand the need.</em><br>Act at the right time.',
      heroSub: 'Location-specific crop insights that help farmers know where to look, what to validate, and when to act.',
      exploreDashboard: 'Explore demo dashboard',
      seeHow: 'See how it works',
      heroProofTitle: 'One field. Different needs.',
      heroProofSub: 'Built around local context, not guesswork.',
      heroVisualTop: 'FIELD OVERVIEW',
      heroVisualDemo: 'ILLUSTRATIVE',
      heroFootVigour: '◉ Crop vigour pattern',
      heroFootMoisture: '◌ Surface moisture context',
      heroDeckTag: 'PRECISION AGRICULTURE FOR INDIA',
      heroDeckScroll: '↓ SCROLL TO EXPLORE',
      trustLookTitle: 'Know where to look',
      trustLookSub: 'Identify zones for closer field checks',
      trustActTitle: 'Know when to act',
      trustActSub: 'Bring weather and crop stage together',
      trustInputTitle: 'Use inputs more precisely',
      trustInputSub: 'Validate before choosing a treatment',
      probEye: 'THE CHALLENGE',
      probTitle: 'One farm is not<br><em>one uniform field.</em>',
      probDesc: 'Soil moisture, crop vigour, and nutrient needs can vary within a single plot. Blanket decisions can miss the zones that need attention most.',
      p1Title: 'Signals get missed',
      p1Desc: 'Small changes in crop vigour and moisture are difficult to notice when the whole field is evaluated as a single unit.',
      p2Title: 'Inputs can be mistimed',
      p2Desc: 'Weather fluctuations, crop stage, and moisture deficits all influence whether irrigation or fertilizer will help or harm.',
      p3Title: 'Advice needs validation',
      p3Desc: 'Satellite maps provide spatial clues; targeted soil testing and agronomy are essential to confirm actual nutrient requirements.',
      solEye: 'THE SOLUTION · PRECISION AGRICULTURE',
      solTitle: 'From space data to<br><em>smarter decisions.</em>',
      solDesc: 'KrishiVed combines satellite observations, weather context, and AI pattern detection with local soil testing and agronomy—delivering clear guidance in the farmer\'s language.',
      ben1Title: 'Right input, right place',
      ben1Desc: 'Focus fertilizer and scouting only where needed instead of blanket broadcast applications across the entire farm.',
      ben2Title: 'Smarter water use',
      ben2Desc: 'Prioritise irrigation timing using moisture patterns and rainfall forecasts, avoiding water stress and root waterlogging.',
      ben3Title: 'Earlier crop-stress alerts',
      ben3Desc: 'Spot unusual canopy patterns 5–7 days sooner than naked eye scouting to inspect problems before yield loss occurs.',
      ben4Title: 'Lower unnecessary spending',
      ben4Desc: 'Avoid over-spending on ineffective chemical inputs by confirming true soil nutrient needs through lab validation.',
      ben5Title: 'Better field records',
      ben5Desc: 'Track crop development and compare zone health across multiple seasons to build institutional field knowledge.',
      ben6Title: 'Local-language access',
      ben6Desc: 'Share simple, actionable advisories through mobile app, SMS or voice in Hindi, Urdu, and regional languages.',
      solTag: 'ONE FARM ≠ ONE UNIFORM FIELD',
      solFooterNote: 'Designed to complement farmers\' lived experience, soil testing, and local agricultural extension officers.',
      howEye: 'FROM SPACE TO SOIL',
      howTitle: 'Four steps.<br><em>One clearer decision.</em>',
      howDesc: 'A simple, scientifically grounded pipeline connecting satellite observations with field validation and practical farmer guidance.',
      step1Title: 'OBSERVE',
      step1Desc: 'Satellite imagery + weather + crop calendar. Track vegetation indices, surface moisture trends, and field changes.',
      step1Meta: 'Vegetation · Surface moisture · Field changes',
      step2Title: 'ANALYSE',
      step2Desc: 'AI models + field history. Create illustrative zone heatmaps and flag unusual growth patterns for review.',
      step2Meta: 'AI models · Anomaly detection · Priority flags',
      step3Title: 'VALIDATE',
      step3Desc: 'Soil test + local agronomy + field inspection. Confirm true nutrient and moisture needs before recommending any dosage.',
      step3Meta: 'Targeted scouting · Soil test · Agronomic check',
      step4Title: 'ADVISE',
      step4Desc: 'Farmer-friendly, location-specific actions delivered via mobile app, SMS, or local-language advisory voice.',
      step4Meta: 'Actionable step · Right timing · Local language',
      scienceNote: '<strong>Scientific note:</strong> Satellite observations detect patterns and nutrient-stress clues. They do <u>not</u> directly measure exact N–P–K values. Exact nutrient requirements must always be confirmed through certified laboratory soil testing and qualified local agricultural expertise.',
      regEye: 'START WITH YOUR FIELD',
      regTitle: 'Good advice begins<br>with <em>local context.</em>',
      regDesc: 'Set up a sample farmer profile to explore the prototype. Information stays safely in this browser session and is not transmitted to a public server.',
      regP1: '✓ Field-specific zone intelligence',
      regP2: '✓ Local-language voice & text ready',
      regP3: '✓ Built for future Supabase & Map backend',
      regCardTag: 'FARMER REGISTRATION',
      regCardTitle: 'Create demo profile',
      fldName: 'Full name',
      fldMobile: 'Mobile number',
      fldExp: 'Farming experience',
      fldLoc: 'Current location',
      fldCrop: 'Primary crop',
      fldSize: 'Field size (acres)',
      geoHeading: 'Field coordinates',
      optTag: 'OPTIONAL',
      geoStatusText: 'Use browser GPS location or enter coordinates manually.',
      geoBtn: 'Use my location',
      btnCreateProfile: 'Save & Open Dashboard',
      regPrivacyNote: 'Demo session only · Stored locally in memory · No backend transmission.',
      loginEye: 'YOUR FARM, YOUR VIEW',
      loginTitle: 'Welcome back<br>to <em>KrishiVed.</em>',
      loginDesc: 'Use the demo sign-in to review the hackathon prototype. Real OTP and database authentication will integrate with Supabase.',
      demoAuthTag: 'DEMO AUTH',
      loginCardTitle: 'Farmer login',
      loginCardSub: 'Access your sample field workspace.',
      fldPass: 'Demo password',
      btnLogin: 'Login to dashboard',
      btnQuickDemo: 'Continue with sample farmer (Ramesh Kumar) →',
      loginNote: 'Demo mode: No OTP is sent. Credentials are not verified or stored.',
      dashEye: 'FARMER WORKSPACE',
      dashTitle: 'Your field, at<br><em>a glance.</em>',
      dashSub: 'A sample interactive view of how satellite signals translate into clear next steps.',
      dashSidebarTag: 'FARMER VIEW',
      sampleFarmerLabel: 'Sample farmer profile',
      sideWorkspace: 'WORKSPACE',
      sideOverview: 'Overview',
      sideReport: 'Field report',
      sideAssistant: 'Ask Farmer Friend',
      sideHub: 'Natural Fertilizer Hub',
      weatherTag: 'LOCAL WEATHER · DEMO',
      weatherSky: 'Partly cloudy',
      weatherRain: 'Rain chance: 30%',
      dashPlotTag: 'MONITORING / SAMPLE FIELD',
      statusMonitoring: 'Monitoring',
      btnEditField: '＋ Edit field',
      metricVigour: 'Crop vigour',
      metricVigourSub: 'Illustrative NDVI index',
      metricMoisture: 'Surface moisture',
      metricMoistureSub: 'Weather context needed',
      metricStress: 'Stress indicators',
      metricStressSub: 'Not a diagnostic N-P-K',
      panelZoneTitle: 'Field zone overview',
      panelZoneDesc: 'Tap any zone to see its priority and advice.',
      legRoutine: 'Routine watch',
      legMoist: 'Moisture check',
      legSoil: 'Nutrient clue (Soil test)',
      legScout: 'Scout crop stress',
      linkOpenReport: 'Open report ↗',
      actionPanelTitle: 'Recommended next steps',
      actionPanelDesc: 'Validate in field before changing inputs.',
      act1Title: 'Inspect Zone C',
      act1Desc: 'Check leaf discoloration; do not guess chemical fertilizer.',
      act2Title: 'Check soil moisture',
      act2Desc: 'Verify 10–15 cm root depth before running tube well.',
      act3Title: 'Collect soil core sample',
      act3Desc: 'Send to local lab to validate exact N-P-K requirements.',
      tagToday: 'Today',
      tagNext: 'Next',
      btnViewFullReport: 'View field report ↗',
      histHeading: 'Field history',
      histSub: 'Sentinel-2 observations & logs',
      hist1: 'Sentinel-2 pass: Zone C NDVI at 0.62; flagged for soil validation',
      hist2: 'Farmer log: Zone B surface moisture dip noted at root depth',
      hist3: 'Rain event: 14mm localized showers; tillering stage entered',
      repEye: 'FIELD INTELLIGENCE REPORT',
      repTitle: 'From a map signal<br><em>to a field action.</em>',
      repSub: 'All values and zones below are illustrative to demonstrate precision agriculture workflow.',
      repMapHead: 'Plot Location & Satellite Coordinates',
      fieldSummaryTitle: 'Field Summary / खेत का सारांश',
      sumSec1Title: 'Field Overview',
      sumSec2Title: 'Observed Field Condition',
      sumSec3Title: 'Recommended Next Steps',
      sumSec4Title: 'Irrigation & Moisture Guidance',
      sumSec5Title: 'Fertilizer & Soil Testing Guidance',
      sumSec6Title: 'Pest & Disease Inspection',
      sumSec7Title: 'When to Contact an Expert',
      btnDownloadSummary: 'Download Summary Page ↓',
      thermalCardTitle: 'Thermal & Vegetation Stress Map',
      voiceCardTitle: 'Listen to Farmer Advice / किसान की सलाह सुनें',
      voiceCardSub: 'Interactive Text-to-Speech Advisory · 23 Indian Languages',
      voiceLangLabel: 'Voice Language:',
      voicePlay: 'Listen',
      voicePause: 'Pause',
      voiceResume: 'Resume',
      voiceStop: 'Stop',
      voiceToggleOn: 'Voice ON',
      voiceToggleOff: 'Voice OFF',
      voiceListenAdv: 'Listen',
      btnLiveLocation: 'Use Live Location',
      btnSetCoords: 'Set',
      fallbackTitle: 'Interactive Demo Fallback Map',
      fallbackDesc: 'A valid Google Maps API key is required for live satellite imagery tiles. Click map or "Use Live Location" to interactively update coordinates.',
      statCrop: 'Crop',
      statStage: 'Crop stage',
      statStageVal: 'Tillering · sample',
      statWeather: 'Weather context',
      statMoisture: 'Surface moisture',
      statMoistVal: 'Verify at root depth',
      valBoxTitle: 'Validate before recommending nutrients',
      valBoxDesc: 'Collect a representative soil sample and consult a local agronomist. Satellite patterns flag clues—they are not direct N–P–K measurements.',
      flowTitle: 'Soil Validation → Advisory Flow (Demo)',
      soilNone: '1 · Soil test not done',
      soilSent: '2 · Sample sent to lab',
      soilResult: '3 · Lab result received (demo)',
      goHub: 'Explore natural fertilizer options ↗',
      btnDownloadReport: 'Download sample report ↓',
      btnAskAssistant: 'Ask Farmer Friend ↗',
      reportDisclaimerNote: '*Weather is illustrative demo content. No live satellite, weather, or soil-test API is connected.',
      aiEye: 'ASK IN SIMPLE LANGUAGE',
      aiTitle: 'Your <em>AI Farmer Friend.</em>',
      aiDesc: 'Ask a practical question about crop stress, irrigation timing, soil testing protocols, or natural fertilizer options. This is a rule-based demo assistant—not an external live AI service.',
      badgeDemo: '● DEMO PROTOTYPE',
      badgeGuide: 'Farmer-friendly guidance',
      badgeLanguages: 'Hindi · Urdu · English',
      aiExpertNote: 'For acute crop disease or severe infestation, always cross-verify symptoms with your local Krishi Vigyan Kendra (KVK) officer or qualified agronomist.',
      botName: 'KrishiVed Saathi (AI Farmer Friend)',
      botStatus: 'Demo assistant · Multilingual rule engine',
      chatDate: 'TODAY · DEMO SESSION',
      chatGreeting: 'Namaste! 🌱 I’m your demo Farmer Friend. Tell me what you’re noticing in your field (e.g. Zone B moisture, Zone C nutrient clues, irrigation timing, or soil testing), and I’ll suggest a sensible next step.',
      chipVigour: 'Low crop vigour',
      chipIrrig: 'Irrigation timing',
      chipSoil: 'Soil testing (N-P-K)',
      chipFert: 'Natural fertilizer',
      chipZoneC: 'Zone C clue',
      chipLivelihood: 'Off-season income',
      chatFootnote: 'Demo replies are general guidance grounded in agronomy, not a clinical prescription.',
      hubEye: 'FUTURE / PILOT CONCEPT',
      hubTitle: 'Natural Fertilizer Hub.<br><em>Local knowledge, local opportunity.</em>',
      stampPilot: 'FUTURE MODULE',
      stampPilotSub: 'Pilot concept · Not a live shop',
      hubLede: 'After field validation and laboratory soil testing, a future KrishiVed ecosystem could help farmers explore suitable natural agricultural inputs and discover verified local producers. Product suitability and dosage always require independent agronomic checks.',
      fltAll: 'All options',
      fltSoil: 'Soil building',
      fltPlant: 'Plant-based',
      fltFarm: 'Farm-made',
      tagDemoListings: 'ALL LISTINGS ARE DEMO PRODUCTS · NOT REAL TRANSACTIONS',
      typeSoil: 'SOIL BUILDING · DEMO',
      typeVermi: 'SOIL BUILDING · DEMO',
      typeNeem: 'PLANT-BASED INPUT · DEMO',
      typeBio: 'FARM-MADE · DEMO',
      p1Name: 'Natural Compost',
      p2Name: 'Vermicompost',
      p3Name: 'Neem-based input',
      p4Name: 'Farm-made bio-input',
      p4Desc: 'A fermented bio-fertilizer concept prepared from cattle rearing and crop residues. Requires local expert guidance.',
      btnViewDetails: 'View details ↗',
      qualityNoticeText: '<strong>Quality & suitability first.</strong> These are fictional demo listings with illustrative prices and suppliers. No product is certified, verified, or sold through KrishiVed today. Natural does not automatically mean safe or appropriate for every crop and soil condition. Always verify labels, moisture, maturity, and local agronomist recommendations before field application.',
      ecoNode1Title: 'Farmers',
      ecoNode1Desc: 'Access validated field advisory & test soil',
      ecoNode2Title: 'Local farmer-producers',
      ecoNode2Desc: 'Prepare natural compost with training & skill',
      ecoNode3Title: 'Local suppliers / dealers',
      ecoNode3Desc: 'Transparent distribution to nearby farms',
      ecoSeasonsText: '<strong>Off-season & drought opportunity:</strong> During low-income periods or drought, participating farmers can earn supplementary income by preparing and supplying quality-tested organic inputs. This is a future pilot concept: no guaranteed earnings; training, quality checks, and local agricultural standards apply.',
      liveEye: 'FUTURE CONCEPT / PILOT',
      liveTitle: 'From farmer<br>to local agri-entrepreneur.',
      liveDesc: 'In off-seasons or low agricultural earning periods, participating farmers could produce or supply suitable natural agricultural inputs, building local networks and generating supplementary income—subject to training, local demand, quality checks, and regulations.',
      liveLink: 'Explore the livelihood network concept',
      liveS1Title: 'Learn & prepare',
      liveS1Desc: 'Agronomic training on compost maturity & safety',
      liveS2Title: 'Quality check',
      liveS2Desc: 'Lab testing for moisture, pathogens & heavy metals',
      liveS3Title: 'Supply locally',
      liveS3Desc: 'Transparent local listings for nearby farmers',
      prodEye: 'LOCAL PRODUCER NETWORK · CONCEPT',
      prodTitle: 'Potential local supply partners',
      prodDesc: 'Example profiles demonstrate how a future pilot network could display local production transparently.',
      btnJoinProducer: 'Register producer interest (demo) ＋',
      abtEye: 'WHY KRISHIVED',
      abtTitle: 'Technology in the sky.<br><em>Prosperity on the ground.</em>',
      abtDesc: 'KrishiVed is a precision-agriculture concept for India: satellite observations and AI-assisted pattern analysis, combined with soil testing, field inspection, and local agronomy to make practical advice accessible to every farmer.',
      btnTryDemo: 'Try the demo',
      abtP1Title: 'Precision agriculture',
      abtP1Desc: 'Prioritise zones for field scouting rather than treating the whole farm uniformly.',
      abtP2Title: 'Human-validated advice',
      abtP2Desc: 'Combine remote sensing with farmer wisdom, soil testing, and local extension workers.',
      abtP3Title: 'Local-language access',
      abtP3Desc: 'Designed mobile-first with native support for Hindi, Urdu, and 20+ Indian regional languages.',
      abtP4Title: 'Future livelihood network',
      abtP4Desc: 'Empower farmers to produce and supply quality natural inputs for off-season resilience.',
      priceEye: 'PRICING & PLANS',
      priceTitle: 'Built for farmers.<br><em>Coming soon.</em>',
      priceDesc: 'Subscriptions, cooperative plans, and input marketplace connections are planned for a future commercial release.',
      priceCardTag: 'KRISHIVED PLANS',
      comingSoon: 'COMING SOON',
      priceCardSub: 'No payments or real transactions are active in this hackathon prototype.',
      badgeInDev: 'IN DEVELOPMENT',
      finalEye: 'THE NEXT FIELD SEASON',
      finalTitle: 'See more.<br><em>Waste less. Grow better.</em>',
      finalDesc: 'Start with one field, validate the signals with soil testing, and turn space insights into prosperity on the ground.',
      btnFinalCreate: 'Create demo profile ↗',
      btnFinalProcess: 'Review the process',
      footerTagline: 'Satellite-inspired insights. Grounded in field validation. Dedicated to India\'s farming communities.',
      footAbout: 'About',
      footSolution: 'Solution',
      footHow: 'How it works',
      footHub: 'Future Hub',
      footLogin: 'Farmer login',
      footerLegal: 'Demo data only · No live satellite, AI API, payment gateway, or external database connected.',
      dlgPrice: 'Demo price',
      dlgProducer: 'Producer',
      dlgLocation: 'Location',
      dlgAvail: 'Availability',
      dlgStatus: 'Listing status',
      dlgQuality: 'Quality check',
      dlgDisclaimer: 'This is a concept listing for a future pilot ecosystem, not a real commercial transaction. Verify composition, label directions, quality standards, and crop suitability with a qualified local agronomist.',
      dlgBtnGotIt: 'Got it',
      prodDlgTitle: 'Register Producer Interest',
      prodDlgDesc: 'Join the future pilot network as a farmer-producer to prepare and supply certified natural inputs during off-seasons.',
      prodInputLabel: 'Input category you can prepare:',
      prodSeasonLabel: 'Availability period:',
      btnSubmitProducer: 'Submit Demo Interest ＋',
      prodDlgNote: 'Demo only · Stored locally in memory session · No real contract.'
    },

    hi: {
      ribbon: '<span class="pulse"></span> हैकथॉन MVP · डेमो / उदाहरण डेटा · उपग्रह + AI + खेत का ज्ञान',
      brandSub: 'कृषिवेद · खेत की बुद्धिमत्ता',
      navHome: 'होम',
      navProblem: 'चुनौती',
      navSolution: 'समाधान',
      navHow: 'कैसे काम करता है',
      navDashboard: 'डैशबोर्ड',
      navReport: 'खेत की रिपोर्ट',
      navAssistant: 'AI किसान मित्र',
      navHub: 'प्राकृतिक खाद केंद्र',
      navAbout: 'हमारे बारे में',
      signIn: 'किसान लॉगिन ↗',
      heroEye: 'उपग्रह + AI + खेत का ज्ञान',
      heroTitle: 'खेत को देखें।<br><em>ज़रूरत को समझें।</em><br>सही समय पर कदम उठाएँ।',
      heroSub: 'स्थान के अनुसार फसल की जानकारी, जिससे किसान जान सकें कि कहाँ देखना है, क्या जांचना है और कब कार्रवाई करनी है।',
      exploreDashboard: 'डेमो डैशबोर्ड देखें',
      seeHow: 'जानें कैसे काम करता है',
      heroProofTitle: 'एक खेत। अलग-अलग ज़रूरतें।',
      heroProofSub: 'स्थानीय संदर्भ और प्रमाण पर आधारित, अंदाज़े पर नहीं।',
      heroVisualTop: 'खेत का अवलोकन',
      heroVisualDemo: 'उदाहरणात्मक',
      heroFootVigour: '◉ फसल स्वास्थ्य का पैटर्न',
      heroFootMoisture: '◌ सतही नमी का संदर्भ',
      heroDeckTag: 'भारत के लिए प्रिसिजन एग्रीकल्चर',
      heroDeckScroll: '↓ नीचे स्क्रॉल करें',
      trustLookTitle: 'कहाँ देखना है, जानें',
      trustLookSub: 'नज़दीकी जांच के लिए प्राथमिकता वाले हिस्से पहचानें',
      trustActTitle: 'कब काम करना है, जानें',
      trustActSub: 'मौसम और फसल की अवस्था को एक साथ जोड़ें',
      trustInputTitle: 'सटीक खाद-पानी दें',
      trustInputSub: 'खर्च से पहले मिट्टी जांच से पुष्टि करें',
      probEye: 'चुनौती',
      probTitle: 'एक खेत का मतलब हमेशा<br><em>एक जैसी स्थिति नहीं होता।</em>',
      probDesc: 'एक ही खेत में मिट्टी की नमी, फसल की सेहत और पोषक तत्वों की ज़रूरत भिन्न हो सकती है। पूरे खेत में एक समान काम करने से ज़रूरतमंद हिस्से छूट जाते हैं।',
      p1Title: 'संकेत छूट जाते हैं',
      p1Desc: 'जब पूरे खेत को एक इकाई मान लिया जाता है, तो फसल और नमी के छोटे बदलाव नज़र नहीं आते।',
      p2Title: 'समय गलत हो सकता है',
      p2Desc: 'मौसम, फसल की अवस्था और नमी यह तय करते हैं कि खाद या सिंचाई से फायदा होगा या नुकसान।',
      p3Title: 'सलाह की जांच ज़रूरी',
      p3Desc: 'उपग्रह नक्शे संकेत देते हैं; असली पोषक ज़रूरत मिट्टी परीक्षण और कृषि विशेषज्ञों से पक्की होती है।',
      solEye: 'समाधान · प्रिसिजन एग्रीकल्चर',
      solTitle: 'आसमान के डेटा से<br><em>समझदार फैसलों तक।</em>',
      solDesc: 'कृषिवेद उपग्रह अवलोकन, मौसम और AI पैटर्न को स्थानीय मिट्टी परीक्षण और कृषि सलाह से जोड़कर किसान की भाषा में सीधी सलाह देता है।',
      ben1Title: 'सही खाद, सही जगह',
      ben1Desc: 'पूरे खेत में अंधाधुंध छिड़काव के बजाय केवल वहीं खाद दें जहाँ ज़रूरत हो।',
      ben2Title: 'पानी का बेहतर उपयोग',
      ben2Desc: 'नमी के पैटर्न और बारिश के अनुमान से सिंचाई का सही समय चुनें, जिससे फसल और पानी दोनों बचें।',
      ben3Title: 'समय से पहले तनाव के संकेत',
      ben3Desc: 'आँखों से दिखने से 5–7 दिन पहले पत्तियों के बदलाव पहचानें और नुकसान से पहले जांचें।',
      ben4Title: 'अनावश्यक खर्च में कमी',
      ben4Desc: 'बिना ज़रूरत रासायनिक खादों पर पैसे बर्बाद करने से बचें; मिट्टी जांच से सही ज़रूरत जानें।',
      ben5Title: 'खेत का बेहतर रिकॉर्ड',
      ben5Desc: 'हर मौसम में खेत के अलग-अलग हिस्सों के विकास को दर्ज करें और सीखें।',
      ben6Title: 'अपनी भाषा में जानकारी',
      ben6Desc: 'मोबाइल ऐप, SMS या आवाज़ के ज़रिए हिन्दी, उर्दू और अपनी क्षेत्रीय भाषा में सलाह पाएँ।',
      solTag: 'एक खेत ≠ एक समान स्थिति',
      solFooterNote: 'किसानों के अनुभव, मिट्टी जांच और स्थानीय कृषि अधिकारियों की मदद के लिए तैयार।',
      howEye: 'आसमान से ज़मीन तक',
      howTitle: 'चार चरण।<br><em>एक स्पष्ट फैसला।</em>',
      howDesc: 'उपग्रह अवलोकन को ज़मीनी जांच और किसान-अनुकूल सलाह से जोड़ने वाली वैज्ञानिक प्रक्रिया।',
      step1Title: 'देखें (OBSERVE)',
      step1Desc: 'उपग्रह चित्र + मौसम + फसल कैलेंडर। वनस्पति सूचकांक और सतही नमी पर नज़र रखें।',
      step1Meta: 'वनस्पति · सतही नमी · खेत में बदलाव',
      step2Title: 'विश्लेषण (ANALYSE)',
      step2Desc: 'AI मॉडल + खेत का इतिहास। असामान्य पैटर्न पहचानकर प्राथमिकता वाले हिस्से चिह्नित करें।',
      step2Meta: 'AI मॉडल · विसंगति पहचान · प्राथमिकता',
      step3Title: 'जांचें (VALIDATE)',
      step3Desc: 'मिट्टी परीक्षण + स्थानीय कृषि ज्ञान + खेत निरीक्षण। मात्रा तय करने से पहले असली ज़रूरत पक्की करें।',
      step3Meta: 'खेत निरीक्षण · मिट्टी जांच · कृषि परामर्श',
      step4Title: 'सलाह (ADVISE)',
      step4Desc: 'मोबाइल ऐप, SMS या आवाज़ के ज़रिए किसान की भाषा में काम के अगले कदम।',
      step4Meta: 'व्यावहारिक कदम · सही समय · स्थानीय भाषा',
      scienceNote: '<strong>वैज्ञानिक नोट:</strong> उपग्रह अवलोकन पैटर्न और पोषक-तनाव के संकेत देते हैं। वे N–P–K के सटीक मान सीधे <u>नहीं</u> मापते। पोषक तत्वों की सही मात्रा की पुष्टि हमेशा प्रयोगशाला मिट्टी परीक्षण और कृषि विशेषज्ञ से करें।',
      regEye: 'अपने खेत से शुरू करें',
      regTitle: 'सच्ची सलाह<br><em>स्थानीय संदर्भ</em> से शुरू होती है।',
      regDesc: 'प्रोटोटाइप देखने के लिए एक नमूना किसान प्रोफ़ाइल बनाएँ। यह जानकारी आपके ब्राउज़र में ही रहती है।',
      regP1: '✓ खेत के हिस्सों की सटीक समझ',
      regP2: '✓ स्थानीय भाषा में सलाह',
      regP3: '✓ भविष्य के डेटाबेस से जुड़ने के लिए तैयार',
      regCardTag: 'किसान पंजीकरण',
      regCardTitle: 'डेमो प्रोफ़ाइल बनाएँ',
      fldName: 'पूरा नाम',
      fldMobile: 'मोबाइल नंबर',
      fldExp: 'खेती का अनुभव',
      fldLoc: 'वर्तमान स्थान',
      fldCrop: 'मुख्य फसल',
      fldSize: 'खेत का आकार (एकड़)',
      geoHeading: 'खेत के निर्देशांक',
      optTag: 'वैकल्पिक',
      geoStatusText: 'डिवाइस GPS का उपयोग करें या हाथ से निर्देशांक भरें।',
      geoBtn: 'मेरा स्थान लें',
      btnCreateProfile: 'सहेजें और डैशबोर्ड खोलें',
      regPrivacyNote: 'केवल डेमो सत्र · जानकारी केवल ब्राउज़र में सुरक्षित है।',
      loginEye: 'आपका खेत, आपका डैशबोर्ड',
      loginTitle: 'कृषिवेद में<br><em>वापसी पर स्वागत है।</em>',
      loginDesc: 'प्रोटोटाइप देखने के लिए डेमो साइन-इन का उपयोग करें। वास्तविक संस्करण में Supabase OTP होगा।',
      demoAuthTag: 'डेमो प्रमाणीकरण',
      loginCardTitle: 'किसान लॉगिन',
      loginCardSub: 'अपने खेत के डैशबोर्ड में प्रवेश करें।',
      fldPass: 'डेमो पासवर्ड',
      btnLogin: 'डैशबोर्ड में लॉगिन करें',
      btnQuickDemo: 'नमूना किसान (रमेश कुमार) के रूप में आगे बढ़ें →',
      loginNote: 'डेमो मोड: कोई OTP नहीं भेजा जाता। कोई पासवर्ड सहेजा नहीं जाता।',
      dashEye: 'किसान कार्यस्थल',
      dashTitle: 'आज आपका खेत,<br><em>एक नज़र में।</em>',
      dashSub: 'उपग्रह संकेतों से अगले स्पष्ट कदम तक का नमूना इंटरैक्टिव दृश्य।',
      dashSidebarTag: 'किसान दृश्य',
      sampleFarmerLabel: 'नमूना किसान प्रोफ़ाइल',
      sideWorkspace: 'कार्यक्षेत्र',
      sideOverview: 'अवलोकन',
      sideReport: 'खेत की रिपोर्ट',
      sideAssistant: 'किसान मित्र से पूछें',
      sideHub: 'प्राकृतिक खाद केंद्र',
      weatherTag: 'स्थानीय मौसम · डेमो',
      weatherSky: 'आंशिक बादल',
      weatherRain: 'बारिश की संभावना: 30%',
      dashPlotTag: 'निगरानी / नमूना खेत',
      statusMonitoring: 'निगरानी सक्रिय',
      btnEditField: '＋ खेत बदलें',
      metricVigour: 'फसल की ताकत',
      metricVigourSub: 'उदाहरणात्मक NDVI सूचकांक',
      metricMoisture: 'सतही नमी',
      metricMoistureSub: 'मौसम संदर्भ आवश्यक',
      metricStress: 'तनाव संकेतक',
      metricStressSub: 'N-P-K का सीधा निदान नहीं',
      panelZoneTitle: 'खेत के हिस्सों का नक्शा',
      panelZoneDesc: 'किसी भी हिस्से पर टैप करके उसकी प्राथमिकता देखें।',
      legRoutine: 'सामान्य देखरेख',
      legMoist: 'नमी जांच',
      legSoil: 'पोषक संकेत (मिट्टी जांच)',
      legScout: 'फसल तनाव जांच',
      linkOpenReport: 'पूरी रिपोर्ट खोलें ↗',
      actionPanelTitle: 'सुझाए गए अगले कदम',
      actionPanelDesc: 'खाद-पानी बदलने से पहले खेत में पुष्टि करें।',
      act1Title: 'हिस्सा C का निरीक्षण करें',
      act1Desc: 'पत्तियों का पीलापन देखें; अंदाज़े से रासायनिक खाद न डालें।',
      act2Title: 'मिट्टी की नमी जांचें',
      act2Desc: 'नलकूप चलाने से पहले 10–15 सेमी जड़ की गहराई पर नमी देखें।',
      act3Title: 'मिट्टी का नमूना लें',
      act3Desc: 'सटीक N-P-K जानने के लिए लैब में नमूना भेजें।',
      tagToday: 'आज',
      tagNext: 'अगला',
      btnViewFullReport: 'खेत रिपोर्ट देखें ↗',
      histHeading: 'खेत का इतिहास',
      histSub: 'सेंटिनल-2 उपग्रह अवलोकन और लॉग',
      hist1: 'सेंटिनल-2 पास: हिस्सा C में 0.62 NDVI; मिट्टी जांच के लिए चिह्नित',
      hist2: 'किसान लॉग: हिस्सा B में जड़ के पास नमी की कमी दर्ज',
      hist3: 'बारिश घटना: 14 मिमी स्थानीय वर्षा; कल्ले फूटने की अवस्था',
      repEye: 'खेत व मिट्टी की रिपोर्ट',
      repTitle: 'नक्शे के संकेत से<br><em>खेत के कदम तक।</em>',
      repSub: 'नीचे दिए गए सभी मान और हिस्से प्रिसिजन एग्रीकल्चर समझाने के लिए उदाहरणात्मक हैं।',
      repMapHead: 'खेत का भू-स्थान एवं उपग्रह निर्देशांक',
      fieldSummaryTitle: 'खेत का सारांश / Field Summary',
      sumSec1Title: 'खेत का अवलोकन',
      sumSec2Title: 'प्रेक्षित खेत की स्थिति',
      sumSec3Title: 'अनुशंसित अगले कदम',
      sumSec4Title: 'सिंचाई एवं नमी मार्गदर्शन',
      sumSec5Title: 'उर्वरक एवं मिट्टी परीक्षण मार्गदर्शन',
      sumSec6Title: 'कीट एवं रोग निरीक्षण',
      sumSec7Title: 'कृषि विशेषज्ञ से कब संपर्क करें',
      btnDownloadSummary: 'सारांश पृष्ठ डाउनलोड करें ↓',
      thermalCardTitle: 'थर्मल एवं वनस्पति तनाव मानचित्र',
      voiceCardTitle: 'किसान की सलाह सुनें / Listen to Advice',
      voiceCardSub: 'इंटरैक्टिव वाक् सलाह · 23 भारतीय भाषाएं',
      voiceLangLabel: 'आवाज़ की भाषा:',
      voicePlay: 'सुनें',
      voicePause: 'रोकें',
      voiceResume: 'फिर सुनें',
      voiceStop: 'बंद करें',
      voiceToggleOn: 'आवाज़ चालू',
      voiceToggleOff: 'आवाज़ बंद',
      voiceListenAdv: 'सुनें',
      btnLiveLocation: 'लाइव लोकेशन का उपयोग करें',
      btnSetCoords: 'लागू करें',
      fallbackTitle: 'इंटरैक्टिव डेमो फॉलबैक मैप',
      fallbackDesc: 'लाइव सैटेलाइट टाइल्स के लिए वैध Google Maps API कुंजी आवश्यक है। निर्देशांक बदलने के लिए मैप पर क्लिक करें या "लाइव लोकेशन" चुनें।',
      statCrop: 'फसल',
      statStage: 'फसल अवस्था',
      statStageVal: 'कल्ले निकलना · नमूना',
      statWeather: 'मौसम संदर्भ',
      statMoisture: 'सतही नमी',
      statMoistVal: 'जड़ की गहराई पर जांचें',
      valBoxTitle: 'खाद देने से पहले पुष्टि करें',
      valBoxDesc: 'प्रतिनिधि मिट्टी का नमूना लें और स्थानीय कृषि विशेषज्ञ से सलाह लें। उपग्रह पैटर्न केवल संकेत हैं—सीधे खनिज मान नहीं।',
      flowTitle: 'मिट्टी जांच सत्यापन → सलाह (डेमो)',
      soilNone: '1 · मिट्टी जांच नहीं हुई',
      soilSent: '2 · नमूना लैब भेजा गया',
      soilResult: '3 · लैब रिपोर्ट मिली (डेमो)',
      goHub: 'प्राकृतिक खाद के विकल्प देखें ↗',
      btnDownloadReport: 'नमूना रिपोर्ट डाउनलोड करें ↓',
      btnAskAssistant: 'किसान मित्र से पूछें ↗',
      reportDisclaimerNote: '*मौसम उदाहरणात्मक सामग्री है। कोई लाइव API कनेक्ट नहीं है।',
      aiEye: 'सरल भाषा में पूछें',
      aiTitle: 'आपका <em>AI किसान मित्र।</em>',
      aiDesc: 'फसल तनाव, सिंचाई का समय, मिट्टी जांच या प्राकृतिक खाद के बारे में पूछें। यह नियमों पर आधारित डेमो सहायक है—कोई बाहरी AI नहीं।',
      badgeDemo: '● डेमो प्रोटोटाइप',
      badgeGuide: 'किसान-हितैषी सलाह',
      badgeLanguages: 'हिन्दी · उर्दू · अंग्रेज़ी',
      aiExpertNote: 'गंभीर रोग या कीट प्रकोप के लिए हमेशा नज़दीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।',
      botName: 'कृषिवेद साथी (AI किसान मित्र)',
      botStatus: 'डेमो सहायक · बहुभाषी नियम इंजन',
      chatDate: 'आज · डेमो सत्र',
      chatGreeting: 'नमस्ते! 🌱 मैं आपका डेमो किसान मित्र हूँ। अपने खेत के बारे में पूछिए (जैसे हिस्सा B की नमी, हिस्सा C के पोषक संकेत, सिंचाई या मिट्टी जांच)।',
      chipVigour: 'कम फसल ताकत',
      chipIrrig: 'सिंचाई का समय',
      chipSoil: 'मिट्टी जांच (N-P-K)',
      chipFert: 'प्राकृतिक खाद',
      chipZoneC: 'हिस्सा C का संकेत',
      chipLivelihood: 'खाली समय में आय',
      chatFootnote: 'डेमो उत्तर सामान्य कृषि सलाह हैं, कोई दवा का नुस्खा नहीं।',
      hubEye: 'भविष्य की अवधारणा / पायलट',
      hubTitle: 'प्राकृतिक खाद केंद्र।<br><em>स्थानीय ज्ञान, स्थानीय अवसर।</em>',
      stampPilot: 'भविष्य का मॉड्यूल',
      stampPilotSub: 'पायलट सोच · अभी कोई दुकान नहीं',
      hubLede: 'खेत निरीक्षण और मिट्टी जांच के बाद, भविष्य का कृषिवेद नेटवर्क किसानों को उपयुक्त प्राकृतिक व जैविक खाद विकल्पों और स्थानीय उत्पादकों से जोड़ सकता है।',
      fltAll: 'सभी विकल्प',
      fltSoil: 'मिट्टी सुधार',
      fltPlant: 'पौधों से निर्मित',
      fltFarm: 'खेत में तैयार',
      tagDemoListings: 'सभी उत्पाद केवल डेमो सूची हैं · कोई असली लेन-देन नहीं',
      typeSoil: 'मिट्टी सुधार · डेमो',
      typeVermi: 'मिट्टी सुधार · डेमो',
      typeNeem: 'पौधों से निर्मित · डेमो',
      typeBio: 'खेत में निर्मित · डेमो',
      p1Name: 'प्राकृतिक कम्पोस्ट',
      p2Name: 'केंचुआ खाद (वर्मीकम्पोस्ट)',
      p3Name: 'नीम-आधारित उत्पाद',
      p4Name: 'खेत में बना जैविक उत्पाद',
      p4Desc: 'पशुपालन और फसल अवशेषों से तैयार किण्वित जैविक खाद। स्थानीय विशेषज्ञ मार्गदर्शन आवश्यक है।',
      btnViewDetails: 'विवरण देखें ↗',
      qualityNoticeText: '<strong>गुणवत्ता और उपयुक्तता पहले।</strong> ये केवल काल्पनिक डेमो उत्पाद हैं। कृषिवेद किसी उत्पाद को प्रमाणित या बेचता नहीं है। प्राकृतिक होने का मतलब यह नहीं कि वह हर फसल के लिए सही है। प्रयोग से पहले लैब रिपोर्ट और कृषि सलाह लें।',
      ecoNode1Title: 'किसान',
      ecoNode1Desc: 'प्रमाणित सलाह पाएँ और मिट्टी जांचें',
      ecoNode2Title: 'स्थानीय किसान-उत्पादक',
      ecoNode2Desc: 'कौशल और प्रशिक्षण से खाद तैयार करें',
      ecoNode3Title: 'स्थानीय डीलर व आपूर्तिकर्ता',
      ecoNode3Desc: 'पारदर्शी रूप से पास के खेतों तक पहुँचाएँ',
      ecoSeasonsText: '<strong>ऑफ-सीज़न व सूखे में अवसर:</strong> खाली समय में किसान प्रशिक्षित होकर गुणवत्ता वाली खाद तैयार कर सकते हैं और अतिरिक्त आजीविका कमा सकते हैं। यह भविष्य की पायलट अवधारणा है।',
      liveEye: 'भविष्य की अवधारणा / पायलट',
      liveTitle: 'किसान से<br>स्थानीय कृषि-उद्यमी तक।',
      liveDesc: 'ऑफ-सीज़न या कम कमाई के दिनों में किसान गुणवत्ता वाली प्राकृतिक खाद तैयार करके स्थानीय स्तर पर बेच सकते हैं, जिससे ग्रामीण रोजगार बढ़ता है।',
      liveLink: 'आजीविका नेटवर्क की अवधारणा देखें',
      liveS1Title: 'सीखें व तैयार करें',
      liveS1Desc: 'खाद की परिपक्वता और सुरक्षा का प्रशिक्षण',
      liveS2Title: 'गुणवत्ता जांच',
      liveS2Desc: 'नमी और पोषक तत्वों की लैब जांच',
      liveS3Title: 'स्थानीय आपूर्ति',
      liveS3Desc: 'पास के किसानों के लिए पारदर्शी सूची',
      prodEye: 'स्थानीय उत्पादक नेटवर्क · अवधारणा',
      prodTitle: 'संभावित स्थानीय आपूर्ति साझेदार',
      prodDesc: 'नमूना प्रोफ़ाइल दर्शाती हैं कि भविष्य का नेटवर्क स्थानीय उत्पादन कैसे दिखाएगा।',
      btnJoinProducer: 'उत्पादक रुचि दर्ज करें (डेमो) ＋',
      abtEye: 'कृषिवेद क्यों',
      abtTitle: 'आसमान में तकनीक।<br><em>ज़मीन पर समृद्धि।</em>',
      abtDesc: 'कृषिवेद भारत के लिए प्रिसिजन एग्रीकल्चर की सोच है: उपग्रह और AI के साथ मिट्टी परीक्षण और किसान के अनुभव को जोड़कर सही सलाह देना।',
      btnTryDemo: 'डेमो चलाएँ',
      abtP1Title: 'सटीक खेती',
      abtP1Desc: 'पूरे खेत को एक समान मानने के बजाय ज़रूरतमंद हिस्सों पर ध्यान दें।',
      abtP2Title: 'प्रमाणित सलाह',
      abtP2Desc: 'उपग्रह संकेतों को मिट्टी जांच और कृषि विशेषज्ञों से पक्का करें।',
      abtP3Title: 'स्थानीय भाषा में पहुँच',
      abtP3Desc: 'मोबाइल-फ़र्स्ट डिज़ाइन: हिन्दी, उर्दू और 20+ भारतीय भाषाओं में सुलभ।',
      abtP4Title: 'भविष्य का आजीविका नेटवर्क',
      abtP4Desc: 'खाली समय में किसानों को प्राकृतिक खाद बनाकर आमदनी बढ़ाने का अवसर।',
      priceEye: 'मूल्य और योजनाएँ',
      priceTitle: 'किसानों के लिए।<br><em>जल्द आ रहा है।</em>',
      priceDesc: 'सशुल्क योजनाएँ और बाज़ार की सुविधाएँ भविष्य के संस्करण के लिए नियोजित हैं।',
      priceCardTag: 'कृषिवेद योजनाएँ',
      comingSoon: 'जल्द आ रहा है',
      priceCardSub: 'इस प्रोटोटाइप में कोई भुगतान या वास्तविक लेन-देन सक्रिय नहीं है।',
      badgeInDev: 'विकास में',
      finalEye: 'खेती का अगला मौसम',
      finalTitle: 'अधिक देखें।<br><em>कम बर्बाद करें। बेहतर उगाएँ।</em>',
      finalDesc: 'एक खेत से शुरुआत करें, मिट्टी जांच से संकेतों की पुष्टि करें और आसमान की तकनीक से ज़मीन पर समृद्धि लाएँ।',
      btnFinalCreate: 'डेमो प्रोफ़ाइल बनाएँ ↗',
      btnFinalProcess: 'प्रक्रिया दोबारा देखें',
      footerTagline: 'उपग्रह-प्रेरित अंतर्दृष्टि। ज़मीनी जांच पर आधारित। भारत के अन्नदाताओं को समर्पित।',
      footAbout: 'हमारे बारे में',
      footSolution: 'समाधान',
      footHow: 'कैसे काम करता है',
      footHub: 'खाद केंद्र',
      footLogin: 'किसान लॉगिन',
      footerLegal: 'केवल डेमो डेटा · कोई लाइव उपग्रह, AI, भुगतान या डेटाबेस सेवा कनेक्ट नहीं है।',
      dlgPrice: 'डेमो मूल्य',
      dlgProducer: 'उत्पादक',
      dlgLocation: 'स्थान',
      dlgAvail: 'उपलब्धता',
      dlgStatus: 'स्थिति',
      dlgQuality: 'गुणवत्ता जांच',
      dlgDisclaimer: 'यह केवल भविष्य के पायलट की उदाहरणात्मक सूची है। प्रयोग से पहले स्थानीय कृषि विशेषज्ञ से सलाह लें।',
      dlgBtnGotIt: 'समझ गया',
      prodDlgTitle: 'उत्पादक के रूप में रुचि दर्ज करें',
      prodDlgDesc: 'ऑफ-सीज़न में प्राकृतिक खाद तैयार करने और आपूर्ति करने के लिए पायलट नेटवर्क से जुड़ें।',
      prodInputLabel: 'उत्पाद श्रेणी जो आप तैयार कर सकते हैं:',
      prodSeasonLabel: 'उपलब्धता अवधि:',
      btnSubmitProducer: 'डेमो रुचि दर्ज करें ＋',
      prodDlgNote: 'केवल डेमो सत्र · कोई अनुबंध नहीं।'
    },

    ur: {
      ribbon: '<span class="pulse"></span> ہیکاتھون MVP · ڈیمو / مثالی ڈیٹا · سیٹلائٹ + AI + فیلڈ کا علم',
      brandSub: 'کرشی وید · فیلڈ انٹیلی جنس',
      navHome: 'ہوم',
      navProblem: 'چیلنج',
      navSolution: 'حل',
      navHow: 'طریقۂ کار',
      navDashboard: 'ڈیش بورڈ',
      navReport: 'کھیت کی رپورٹ',
      navAssistant: 'AI کسان دوست',
      navHub: 'قدرتی کھاد مرکز',
      navAbout: 'تعارف',
      signIn: 'کسان لاگ اِن ↗',
      heroEye: 'سیٹلائٹ + AI + کھیت کا علم',
      heroTitle: 'کھیت کو دیکھیں۔<br><em>ضرورت کو سمجھیں۔</em><br>صحیح وقت پر قدم اٹھائیں۔',
      heroSub: 'مقام کے مطابق فصل کی معلومات، تاکہ کسان جان سکیں کہاں دیکھنا ہے، کیا جانچنا ہے اور کب عمل کرنا ہے۔',
      exploreDashboard: 'ڈیمو ڈیش بورڈ دیکھیں',
      seeHow: 'طریقۂ کار دیکھیں',
      heroProofTitle: 'ایک کھیت۔ مختلف ضروریات۔',
      heroProofSub: 'مقامی ماحول اور تصدیق پر مبنی، قیاس پر نہیں۔',
      heroVisualTop: 'کھیت کا جائزہ',
      heroVisualDemo: 'مثالی ڈیٹا',
      heroFootVigour: '◉ فصل کی قوت کا نمونہ',
      heroFootMoisture: '◌ سطحی نمی کا سیاق',
      heroDeckTag: 'ہندوستان کے لیے پریسیژن ایگریکلچر',
      heroDeckScroll: '↓ نیچے دیکھیں',
      trustLookTitle: 'کہاں دیکھنا ہے، جانیں',
      trustLookSub: 'قریبی معائنے کے لیے ترجیحی حصے پہچانیں',
      trustActTitle: 'کب عمل کرنا ہے، جانیں',
      trustActSub: 'موسم اور فصل کے مرحلے کو یکجا کریں',
      trustInputTitle: 'درست کھاد اور پانی دیں',
      trustInputSub: 'خرچ سے پہلے مٹی کی جانچ سے تصدیق کریں',
      probEye: 'چیلنج',
      probTitle: 'ایک کھیت کا مطلب ہمیشہ<br><em>ایک جیسی حالت نہیں ہوتا۔</em>',
      probDesc: 'ایک ہی پلاٹ میں مٹی کی نمی، فصل کی قوت اور غذائی ضروریات مختلف ہو سکتی ہیں۔ پورے کھیت میں یکساں عمل سے کمزور حصے نظر انداز ہو جاتے ہیں۔',
      p1Title: 'اشارے چھوٹ جاتے ہیں',
      p1Desc: 'پورے کھیت کو ایک جیسا سمجھنے سے فصل اور نمی کے باریک تغیرات پر نظر نہیں پڑتی۔',
      p2Title: 'وقت غلط ہو سکتا ہے',
      p2Desc: 'موسم، فصل کی عمر اور نمی کا تناسب طے کرتے ہیں کہ پانی یا کھاد سے فائدہ ہوگا یا نقصان۔',
      p3Title: 'مشورے کی تصدیق ضروری',
      p3Desc: 'سیٹلائٹ نقشے اشارے دیتے ہیں؛ حقیقی غذائی ضرورت مٹی کے لیب ٹیسٹ اور زرعی ماہرین سے طے ہوتی ہے۔',
      solEye: 'حل · پریسیژن ایگریکلچر',
      solTitle: 'خلائی ڈیٹا سے<br><em>بہتر فیصلوں تک۔</em>',
      solDesc: 'کرشی وید سیٹلائٹ تصاویر، موسم اور AI تجزیے کو مٹی کی جانچ سے جوڑ کر کسان کی زبان میں قابلِ عمل مشورہ فراہم کرتا ہے۔',
      ben1Title: 'درست کھاد، درست جگہ',
      ben1Desc: 'پورے کھیت پر اندھا دھند چھڑکاؤ کے بجائے صرف ضرورت والے حصوں میں کھاد دیں۔',
      ben2Title: 'پانی کا دانشمندانہ استعمال',
      ben2Desc: 'نمی اور بارش کی پیش گوئی دیکھ کر آبپاشی کریں تاکہ پانی اور جڑ دونوں محفوظ رہیں۔',
      ben3Title: 'دباؤ کی بروقت اطلاع',
      ben3Desc: 'پتوں کی تبدیلیوں کو آنکھوں سے دکھنے سے 5–7 دن پہلے پہچانیں اور معائنہ کریں۔',
      ben4Title: 'غیر ضروری اخراجات میں کمی',
      ben4Desc: 'کیمیائی کھادوں پر غیر ضروری خرچ سے بچیں؛ مٹی ٹیسٹ سے اصل ضرورت معلوم کریں۔',
      ben5Title: 'کھیت کا منظم ریکارڈ',
      ben5Desc: 'ہر سیزن میں اپنے کھیت کے مختلف حصوں کی نشوونما کا باقاعدہ ریکارڈ رکھیں۔',
      ben6Title: 'اپنی مادری زبان میں رسائی',
      ben6Desc: 'موبائل ایپ، SMS یا آواز کے ذریعے اردو، ہندی اور علاقائی زبانوں میں ہدایات پائیں۔',
      solTag: 'ایک کھیت ≠ یکساں حالت',
      solFooterNote: 'کسانوں کے عملی تجربے، مٹی کی جانچ اور مقامی زرعی ماہرین کے تعاون کے لیے تیار۔',
      howEye: 'خلا سے زمین تک',
      howTitle: 'چار مراحل۔<br><em>ایک واضح فیصلہ۔</em>',
      howDesc: 'سیٹلائٹ مشاہدات کو زمینی جانچ اور آسان کسان رہنمائی سے جوڑنے والا سائنسی عمل۔',
      step1Title: 'مشاہدہ (OBSERVE)',
      step1Desc: 'سیٹلائٹ تصاویر + موسم + فصل کیلنڈر۔ سبزے کے اشاریے اور سطحی نمی پر نظر رکھیں۔',
      step1Meta: 'سبزہ · سطحی نمی · کھیت کی تبدیلیاں',
      step2Title: 'تجزیہ (ANALYSE)',
      step2Desc: 'AI ماڈل + فیلڈ ہسٹری۔ غیر معمولی نمونے اور ترجیحی حصے نشان زد کریں۔',
      step2Meta: 'AI ماڈل · بے ترتیبی کی پہچان · ترجیحات',
      step3Title: 'تصدیق (VALIDATE)',
      step3Desc: 'مٹی کی جانچ + زرعی علم + کھیت کا معائنہ۔ کھاد کی مقدار طے کرنے سے پہلے تصدیق کریں۔',
      step3Meta: 'کھیت کا معائنہ · مٹی ٹیسٹ · زرعی مشاورت',
      step4Title: 'مشورہ (ADVISE)',
      step4Desc: 'موبائل ایپ، SMS یا آواز سے کسان کی زبان میں قابلِ عمل رہنمائی۔',
      step4Meta: 'عملی قدم · درست وقت · مقامی زبان',
      scienceNote: '<strong>سائنسی نوٹ:</strong> سیٹلائٹ مشاہدات پیٹرن اور ممکنہ غذائی دباؤ کے اشارے دیتے ہیں۔ وہ N–P–K کی درست مقدار براہِ راست <u>نہیں</u> ناپتے۔ غذائی ضروریات کی تصدیق ہمیشہ مٹی کی لیب جانچ اور زرعی ماہرین سے کریں۔',
      regEye: 'اپنے کھیت سے آغاز کریں',
      regTitle: 'بہتر مشورہ<br><em>مقامی ماحول</em> سے شروع ہوتا ہے۔',
      regDesc: 'پروٹوٹائپ دیکھنے کے لیے ایک نمونہ کسان پروفائل بنائیں۔ یہ ڈیٹا براؤزر سیشن میں ہی محفوظ رہتا ہے۔',
      regP1: '✓ کھیت کے مخصوص حصوں کی بصیرت',
      regP2: '✓ مقامی زبان میں آواز و متن',
      regP3: '✓ مستقبل کے ڈیٹا بیس اور نقشہ جات کے لیے تیار',
      regCardTag: 'کسان رجسٹریشن',
      regCardTitle: 'ڈیمو پروفائل بنائیں',
      fldName: 'پورا نام',
      fldMobile: 'موبائل نمبر',
      fldExp: 'کاشتکاری کا تجربہ',
      fldLoc: 'موجودہ مقام',
      fldCrop: 'بنیادی فصل',
      fldSize: 'کھیت کا رقبہ (ایکڑ)',
      geoHeading: 'کھیت کے نقاط (Coordinates)',
      optTag: 'اختیاری',
      geoStatusText: 'براؤزر GPS استعمال کریں یا ہاتھ سے نقاط درج کریں۔',
      geoBtn: 'میرا مقام حاصل کریں',
      btnCreateProfile: 'محفوظ کریں اور ڈیش بورڈ کھولیں',
      regPrivacyNote: 'صرف ڈیمو سیشن · ڈیٹا مقامی میموری میں محفوظ ہے · کوئی بیرونی ترسیل نہیں۔',
      loginEye: 'آپ کا فارم، آپ کا ویو',
      loginTitle: 'کرشی وید میں<br><em>خوش آمدید۔</em>',
      loginDesc: 'ہیکاتھون پروٹوٹائپ دیکھنے کے لیے ڈیمو سائن اِن کریں۔ اصل ورژن میں Supabase OTP ہوگا۔',
      demoAuthTag: 'ڈیمو لاگ اِن',
      loginCardTitle: 'کسان لاگ اِن',
      loginCardSub: 'اپنے فیلڈ ڈیش بورڈ میں داخل ہوں۔',
      fldPass: 'ڈیمو پاس ورڈ',
      btnLogin: 'ڈیش بورڈ میں داخل ہوں',
      btnQuickDemo: 'نمونہ کسان (رمیش کمار) کے ساتھ جاری رکھیں ←',
      loginNote: 'ڈیمو موڈ: کوئی OTP نہیں بھیجا جاتا۔ کوئی پاس ورڈ محفوظ نہیں ہوتا۔',
      dashEye: 'کسان ورک اسپیس',
      dashTitle: 'آج آپ کا کھیت،<br><em>ایک نظر میں۔</em>',
      dashSub: 'سیٹلائٹ اشاروں سے واضح اگلے قدم تک کا انٹرایکٹو نمونہ۔',
      dashSidebarTag: 'کسان منظر',
      sampleFarmerLabel: 'نمونہ کسان پروفائل',
      sideWorkspace: 'ورک اسپیس',
      sideOverview: 'جائزہ',
      sideReport: 'کھیت کی رپورٹ',
      sideAssistant: 'کسان دوست سے پوچھیں',
      sideHub: 'قدرتی کھاد مرکز',
      weatherTag: 'مقامی موسم · ڈیمو',
      weatherSky: 'جزوی ابر آلود',
      weatherRain: 'بارش کا امکان: 30%',
      dashPlotTag: 'نگرانی / نمونہ پلاٹ',
      statusMonitoring: 'نگرانی جاری',
      btnEditField: '＋ فیلڈ تبدیل کریں',
      metricVigour: 'فصل کی قوت',
      metricVigourSub: 'مثالی NDVI انڈیکس',
      metricMoisture: 'سطحی نمی',
      metricMoistureSub: 'موسمی سیاق درکار ہے',
      metricStress: 'دباؤ کے اشارے',
      metricStressSub: 'N-P-K کی براہ راست تشخیص نہیں',
      panelZoneTitle: 'کھیت کے حصوں کا نقشہ',
      panelZoneDesc: 'کسی بھی حصے پر ٹیپ کر کے ترجیح دیکھیں۔',
      legRoutine: 'معمول کا مشاہدہ',
      legMoist: 'نمی کی جانچ',
      legSoil: 'غذائی اشارہ (مٹی ٹیسٹ)',
      legScout: 'فصل کا معائنہ',
      linkOpenReport: 'مکمل رپورٹ کھولیں ↗',
      actionPanelTitle: 'تجویز کردہ اگلے اقدامات',
      actionPanelDesc: 'کھاد یا پانی بدلنے سے پہلے کھیت میں تصدیق کریں۔',
      act1Title: 'حصہ C کا معائنہ کریں',
      act1Desc: 'پتوں کی زردی دیکھیں؛ اندازے سے کیمیائی کھاد نہ ڈالیں۔',
      act2Title: 'مٹی کی نمی چیک کریں',
      act2Desc: 'ٹیوب ویل چلانے سے پہلے 10–15 سینٹی میٹر جڑ پر نمی دیکھیں۔',
      act3Title: 'مٹی کا نمونہ لیں',
      act3Desc: 'N-P-K کی درست ضرورت جاننے کے لیے لیب بھیجیں۔',
      tagToday: 'آج',
      tagNext: 'اگلا',
      btnViewFullReport: 'کھیت کی رپورٹ دیکھیں ↗',
      histHeading: 'فیلڈ ہسٹری',
      histSub: 'سینٹینیل-2 سیٹلائٹ پاس اور لاگز',
      hist1: 'سینٹینیل-2 پاس: حصہ C میں 0.62 NDVI؛ مٹی ٹیسٹ کے لیے نشان زد',
      hist2: 'کسان لاگ: حصہ B میں جڑ کے پاس نمی کی کمی نوٹ کی گئی',
      hist3: 'بارش: 14 ملی میٹر مقامی بارش؛ شگوفے پھوٹنے کا مرحلہ',
      repEye: 'فیلڈ و سوائل رپورٹ',
      repTitle: 'نقشے کے اشارے سے<br><em>کھیت کے عمل تک۔</em>',
      repSub: 'تمام اقدار اور حصے پریسیژن ایگریکلچر کا طریقۂ کار دکھانے کے لیے مثالی ہیں۔',
      repMapHead: 'کھیت کا مقام اور سیٹلائٹ نقاط',
      fieldSummaryTitle: 'کھیت کا خلاصہ / Field Summary',
      sumSec1Title: 'کھیت کا جائزہ',
      sumSec2Title: 'مشاہدہ شدہ حالت',
      sumSec3Title: 'تجویز کردہ اگلے اقدامات',
      sumSec4Title: 'آبپاشی اور نمی کی رہنمائی',
      sumSec5Title: 'کھاد اور مٹی کے ٹیسٹ کی رہنمائی',
      sumSec6Title: 'کیڑوں اور بیماریوں کا معائنہ',
      sumSec7Title: 'زرعی ماہر سے کب رابطہ کریں',
      btnDownloadSummary: 'خلاصہ رپورٹ ڈاؤن لوڈ کریں ↓',
      thermalCardTitle: 'تھرمل اور پودوں کے تناؤ کا نقشہ',
      voiceCardTitle: 'کسان مشورہ سنیں / Voice Advisory',
      voiceCardSub: 'آواز میں رہنمائی · 23 ہندوستانی زبانیں',
      voiceLangLabel: 'آواز کی زبان:',
      voicePlay: 'سنیں',
      voicePause: 'وقفہ',
      voiceResume: 'دوبارہ سنیں',
      voiceStop: 'بند کریں',
      voiceToggleOn: 'آواز آن',
      voiceToggleOff: 'آواز آف',
      voiceListenAdv: 'سنیں',
      btnLiveLocation: 'لائیو لوکیشن استعمال کریں',
      btnSetCoords: 'سیٹ کریں',
      fallbackTitle: 'انٹرایکٹو ڈیمو فال بیک نقشہ',
      fallbackDesc: 'براہ راست سیٹلائٹ تصویر کے لیے درست Google Maps API کلید درکار ہے۔ نقشے پر کلک کر کے یا لائیو لوکیشن سے متوازی نقاط تبدیل کریں۔',
      statCrop: 'فصل',
      statStage: 'فصل کا مرحلہ',
      statStageVal: 'پھوٹ نکلنا · نمونہ',
      statWeather: 'موسم کا سیاق',
      statMoisture: 'سطحی نمی',
      statMoistVal: 'جڑ کی گہرائی پر جانچیں',
      valBoxTitle: 'کھاد تجویز کرنے سے پہلے تصدیق کریں',
      valBoxDesc: 'مٹی کا نمونہ لیں اور مقامی زرعی ماہر سے مشورہ کریں۔ سیٹلائٹ پیٹرن صرف اشارے ہیں—براہ راست N-P-K کی مقدار نہیں۔',
      flowTitle: 'مٹی کی جانچ کی تصدیق ← مشورہ (ڈیمو)',
      soilNone: '1 · مٹی ٹیسٹ نہیں ہوا',
      soilSent: '2 · نمونہ لیب بھیجا گیا',
      soilResult: '3 · لیب رپورٹ موصول (ڈیمو)',
      goHub: 'قدرتی کھاد کے اختیارات دیکھیں ↗',
      btnDownloadReport: 'نمونہ رپورٹ ڈاؤن لوڈ کریں ↓',
      btnAskAssistant: 'کسان دوست سے پوچھیں ↗',
      reportDisclaimerNote: '*موسم مثالی مواد ہے۔ کوئی لائیو API منسلک نہیں۔',
      aiEye: 'آسان زبان میں پوچھیں',
      aiTitle: 'آپ کا <em>AI کسان دوست۔</em>',
      aiDesc: 'فصل پر دباؤ، آبپاشی، مٹی کی جانچ یا قدرتی کھاد کے بارے میں پوچھیں۔ یہ اصولوں پر مبنی ڈیمو معاون ہے—کوئی بیرونی AI سروس نہیں۔',
      badgeDemo: '● ڈیمو پروٹوٹائپ',
      badgeGuide: 'کسان دوست رہنمائی',
      badgeLanguages: 'اردو · ہندی · انگریزی',
      aiExpertNote: 'شدید کیڑوں یا بیماری کے لیے ہمیشہ مقامی کرشی وگیان کیندر (KVK) سے رجوع کریں۔',
      botName: 'کرشی وید ساتھی (AI کسان دوست)',
      botStatus: 'ڈیمو معاون · کثیر لسانی رول انجن',
      chatDate: 'آج · ڈیمو سیشن',
      chatGreeting: 'السلام علیکم! 🌱 میں آپ کا ڈیمو کسان دوست ہوں۔ اپنے کھیت کے بارے میں پوچھیں (مثلاً حصہ B کی نمی، حصہ C کا غذائی اشارہ، آبپاشی یا مٹی کی جانچ)۔',
      chipVigour: 'کمزور فصل',
      chipIrrig: 'آبپاشی کا وقت',
      chipSoil: 'مٹی ٹیسٹ (N-P-K)',
      chipFert: 'قدرتی کھاد',
      chipZoneC: 'حصہ C کا اشارہ',
      chipLivelihood: 'آف سیزن آمدنی',
      chatFootnote: 'ڈیمو جوابات زرعی رہنمائی ہیں، کوئی نسخہ نہیں۔',
      hubEye: 'مستقبل کا تصور / پائلٹ',
      hubTitle: 'قدرتی کھاد مرکز۔<br><em>مقامی علم، مقامی موقع۔</em>',
      stampPilot: 'مستقبل کا ماڈیول',
      stampPilotSub: 'پائلٹ سوچ · لائیو دکان نہیں',
      hubLede: 'کھیت کے معائنے اور مٹی کی جانچ کے بعد، مستقبل کا کرشی وید نیٹ ورک کسانوں کو مناسب قدرتی اور نامیاتی کھادوں اور مقامی پیدا کنندگان سے جوڑ سکتا ہے۔',
      fltAll: 'تمام اختیارات',
      fltSoil: 'مٹی کی اصلاح',
      fltPlant: 'پودوں سے تیار',
      fltFarm: 'کھیت میں تیار',
      tagDemoListings: 'تمام لسٹنگز ڈیمو مصنوعات ہیں · حقیقی خرید و فروخت نہیں',
      typeSoil: 'مٹی کی اصلاح · ڈیمو',
      typeVermi: 'مٹی کی اصلاح · ڈیمو',
      typeNeem: 'پودوں سے تیار · ڈیمو',
      typeBio: 'کھیت میں تیار · ڈیمو',
      p1Name: 'قدرتی کمپوسٹ',
      p2Name: 'کیچوا کھاد (ورمی کمپوسٹ)',
      p3Name: 'نیم پر مبنی زرعی ان پٹ',
      p4Name: 'کھیت میں تیار حیاتیاتی ان پٹ',
      p4Desc: 'مویشیوں اور زرعی باقیات سے تیار کردہ خمیر شدہ کھاد۔ مقامی زرعی ماہر کی رہنمائی درکار ہے۔',
      btnViewDetails: 'تفصیل دیکھیں ↗',
      qualityNoticeText: '<strong>معیار اور موزونیت سب سے پہلے۔</strong> یہ فرضی ڈیمو لسٹنگز ہیں۔ کرشی وید فی الحال کسی پروڈکٹ کی تصدیق یا فروخت نہیں کرتا۔ قدرتی ہونے کا مطلب ہر فصل کے لیے محفوظ ہونا نہیں ہے۔ استعمال سے پہلے لیب رپورٹ اور زرعی مشورہ لیں۔',
      ecoNode1Title: 'کسان',
      ecoNode1Desc: 'تصدیق شدہ مشورہ پائیں اور مٹی جانچیں',
      ecoNode2Title: 'مقامی کسان-پیدا کنندگان',
      ecoNode2Desc: 'تربیت کے ساتھ قدرتی کھاد تیار کریں',
      ecoNode3Title: 'مقامی ڈیلرز و سپلائرز',
      ecoNode3Desc: 'قریبی کھیتوں تک شفاف ترسیل کریں',
      ecoSeasonsText: '<strong>آف سیزن اور خشک سالی میں موقع:</strong> خالی موسم میں کسان تربیت یافتہ ہو کر معیاری نامیاتی کھاد تیار کر سکتے ہیں اور اضافی روزگار کما سکتے ہیں۔ یہ مستقبل کا پائلٹ تصور ہے۔',
      liveEye: 'مستقبل کا تصور / پائلٹ',
      liveTitle: 'کسان سے<br>مقامی زرعی کاروباری تک۔',
      liveDesc: 'آف سیزن یا کم آمدنی کے دنوں میں حصہ لینے والے کسان مناسب قدرتی کھاد تیار کر کے قریبی مارکیٹ کو فراہم کر سکتے ہیں، جس سے دیہی روزگار میں اضافہ ہوتا ہے۔',
      liveLink: 'روزگار نیٹ ورک کا تصور دیکھیں',
      liveS1Title: 'سیکھیں اور تیار کریں',
      liveS1Desc: 'کھاد کی پختگی اور حفاظت کی زرعی تربیت',
      liveS2Title: 'معیار کی جانچ',
      liveS2Desc: 'نمی اور جراثیم کی لیب جانچ',
      liveS3Title: 'مقامی ترسیل',
      liveS3Desc: 'قریبی کسانوں کے لیے شفاف لسٹنگ',
      prodEye: 'مقامی پیدا کنندگان نیٹ ورک · تصور',
      prodTitle: 'ممکنہ مقامی سپلائی پارٹنرز',
      prodDesc: 'یہ نمونہ پروفائلز ظاہر کرتی ہیں کہ مستقبل کا پائلٹ نیٹ ورک مقامی پیداوار کو شفاف طریقے سے کیسے دکھا سکتا ہے۔',
      btnJoinProducer: 'پیدا کنندہ کی حیثیت سے اندراج (ڈیمو) ＋',
      abtEye: 'کرشی وید کیوں',
      abtTitle: 'آسمان میں ٹیکنالوجی۔<br><em>زمین پر خوشحالی۔</em>',
      abtDesc: 'کرشی وید ہندوستان کے لیے پریسیژن ایگریکلچر کا خواب ہے: خلائی سیٹلائٹ اور AI کو مٹی کی جانچ اور کسان کے عملی علم سے ملا کر درست مشورہ فراہم کرنا۔',
      btnTryDemo: 'ڈیمو دیکھیں',
      abtP1Title: 'درست زراعت',
      abtP1Desc: 'پورے کھیت کو ایک جیسا سمجھنے کے بجائے مخصوص حصوں کو ترجیح دیں۔',
      abtP2Title: 'تصدیق شدہ مشورہ',
      abtP2Desc: 'سیٹلائٹ اشاروں کو مٹی کی لیب جانچ اور ماہرین سے پکا کریں۔',
      abtP3Title: 'مقامی زبانوں میں رسائی',
      abtP3Desc: 'موبائل فرسٹ ڈیزائن: اردو، ہندی اور 20+ ہندوستانی زبانوں میں دستیاب۔',
      abtP4Title: 'مستقبل کا روزگار نیٹ ورک',
      abtP4Desc: 'خالی وقت میں کسانوں کو قدرتی کھاد تیار کر کے آمدنی بڑھانے کا موقع۔',
      priceEye: 'قیمتیں اور منصوبے',
      priceTitle: 'کسانوں کے لیے۔<br><em>جلد آ رہا ہے۔</em>',
      priceDesc: 'باقاعدہ سبسکرپشن اور مارکیٹ کی سہولیات مستقبل کے تجارتی ورژن میں پیش کی جائیں گی۔',
      priceCardTag: 'کرشی وید منصوبے',
      comingSoon: 'جلد آ رہا ہے',
      priceCardSub: 'اس ہیکاتھون پروٹوٹائپ میں کوئی ادائیگیاں یا مالی لین دین فعال نہیں ہے۔',
      badgeInDev: 'زیرِ تکمیل',
      finalEye: 'کھیتی کا اگلا سیزن',
      finalTitle: 'زیادہ دیکھیں۔<br><em>کم ضائع کریں۔ بہتر اگائیں۔</em>',
      finalDesc: 'ایک کھیت سے آغاز کریں، مٹی ٹیسٹ سے تصدیق کریں اور خلائی بصیرت کو زمین پر خوشحالی میں بدلیں۔',
      btnFinalCreate: 'ڈیمو پروفائل بنائیں ↗',
      btnFinalProcess: 'طریقۂ کار دوبارہ دیکھیں',
      footerTagline: 'خلائی سیٹلائٹ بصیرت۔ زمینی جانچ پر قائم۔ ہندوستان کے کسانوں کو وقف۔',
      footAbout: 'تعارف',
      footSolution: 'حل',
      footHow: 'طریقۂ کار',
      footHub: 'کھاد مرکز',
      footLogin: 'کسان لاگ اِن',
      footerLegal: 'صرف ڈیمو ڈیٹا · کوئی لائیو سیٹلائٹ، AI، ادائیگی یا ڈیٹا بیس سروس منسلک نہیں ہے۔',
      dlgPrice: 'ڈیمو قیمت',
      dlgProducer: 'پیدا کنندہ',
      dlgLocation: 'مقام',
      dlgAvail: 'دستیابی',
      dlgStatus: 'حیثیت',
      dlgQuality: 'معیار کی جانچ',
      dlgDisclaimer: 'یہ صرف مستقبل کے پائلٹ کی مثالی لسٹنگ ہے۔ استعمال سے پہلے مقامی زرعی ماہر سے مشورہ لیں۔',
      dlgBtnGotIt: 'سمجھ گیا',
      prodDlgTitle: 'پیدا کنندہ کے طور پر دلچسپی درج کریں',
      prodDlgDesc: 'آف سیزن میں قدرتی کھاد تیار کرنے اور سپلائی کرنے کے لیے پائلٹ نیٹ ورک میں شامل ہوں۔',
      prodInputLabel: 'کھاد کی قسم جو آپ تیار کر سکتے ہیں:',
      prodSeasonLabel: 'دستیابی کا دورانیہ:',
      btnSubmitProducer: 'ڈیمو دلچسپی درج کریں ＋',
      prodDlgNote: 'صرف ڈیمو سیشن · کوئی حقیقی معاہدہ نہیں۔'
    }
  };

  // Advisory text mappings for Soil Validation Flow
  const advisories = {
    en: {
      none: "Satellite patterns are only clues. Collect a representative soil sample and consult a local agronomist before choosing any chemical or natural fertilizer.",
      sent: "Soil sample sent to laboratory. Await lab results before ordering nutrients. Do not change fertilizers based on satellite imagery alone.",
      result: "Soil test result received (demo: pH 7.3, Organic Carbon 0.51% Low, Available N Low, P Medium, K Adequate). You can now explore suitable natural compost or vermicompost options below to discuss application rates with your local agronomist.",
      gateLocked: "🔒 NATURAL FERTILIZER HUB GATED IN PROTOTYPE: Soil test validation required first. Satellite imagery flags nutrient-stress clues but cannot measure N-P-K. Complete or mark a soil test in the Field Report above to unlock suitable natural input recommendations.",
      gateOpen: "✓ SOIL TEST VALIDATED (DEMO): Lab report received. You can now explore suitable natural and organic fertilizer categories below to discuss with your local agronomist."
    },
    hi: {
      none: "उपग्रह पैटर्न केवल संकेत हैं। कोई भी रासायनिक या प्राकृतिक खाद चुनने से पहले प्रतिनिधि मिट्टी का नमूना लें और स्थानीय कृषि विशेषज्ञ से सलाह लें।",
      sent: "मिट्टी का नमूना लैब भेज दिया गया। पोषक तत्वों का चुनाव करने से पहले लैब रिपोर्ट का इंतज़ार करें। केवल उपग्रह नक्शे के आधार पर खाद न बदलें।",
      result: "मिट्टी जांच रिपोर्ट मिली (डेमो: pH 7.3, जैविक कार्बन 0.51% कम, उपलब्ध नाइट्रोजन कम, फास्फोरस मध्यम, पोटाश पर्याप्त)। अब आप नीचे उपयुक्त प्राकृतिक खाद या केंचुआ खाद के विकल्प देख सकते हैं और कृषि विशेषज्ञ से मात्रा तय कर सकते हैं।",
      gateLocked: "🔒 प्राकृतिक खाद केंद्र बंद: पहले मिट्टी जांच आवश्यक है। उपग्रह चित्र केवल संकेत देते हैं, N-P-K नहीं मापते। ऊपर खेत रिपोर्ट में मिट्टी जांच रिपोर्ट चिह्नित करें।",
      gateOpen: "✓ मिट्टी जांच रिपोर्ट प्राप्त (डेमो): नीचे उपयुक्त प्राकृतिक व जैविक खाद विकल्प देखें और स्थानीय कृषि विशेषज्ञ से उपयुक्तता की पुष्टि करें।"
    },
    ur: {
      none: "سیٹلائٹ پیٹرن صرف اشارے ہیں۔ کوئی بھی کھاد چننے سے پہلے مٹی کا نمائندہ نمونہ لیں اور مقامی زرعی ماہر سے مشورہ کریں۔",
      sent: "مٹی کا نمونہ لیبارٹری بھیج دیا گیا۔ لیب رپورٹ آنے تک کھاد کے انتخاب میں جلد بازی نہ کریں۔ صرف سیٹلائٹ تصویر پر کھاد نہ بدلیں۔",
      result: "مٹی کی جانچ کی رپورٹ موصول (ڈیمو: pH 7.3، نامیاتی مادہ 0.51% کم، نائٹروجن کم، فاسفورس درمیانی)۔ اب آپ نیچے مناسب قدرتی یا کیچوا کھاد کے اختیارات دیکھ سکتے ہیں اور مقدار طے کر سکتے ہیں۔",
      gateLocked: "🔒 قدرتی کھاد مرکز لاک ہے: پہلے مٹی کی جانچ ضروری ہے۔ سیٹلائٹ N-P-K نہیں ناپتا۔ اوپر فیلڈ رپورٹ میں مٹی ٹیسٹ کی تصدیق کریں۔",
      gateOpen: "✓ مٹی کی جانچ کی تصدیق ہو گئی (ڈیمو): نیچے مثالی قدرتی اختیارات دیکھیں اور مقامی زرعی مشیر سے تصدیق کریں۔"
    }
  };

  let currentLang = "en";
  let isBotVoiceAuto = true;
  let soilState = "result"; // default demo state starts validated so all prototype features are accessible

  function renderSoil() {
    $$("[data-soil]").forEach(b => {
      const match = b.dataset.soil === soilState;
      b.classList.toggle("active", match);
      b.setAttribute("aria-pressed", String(match));
    });

    const langAdv = advisories[currentLang] || advisories.en;
    const ok = soilState === "result";

    if ($("#advisoryText")) {
      $("#advisoryText").textContent = langAdv[soilState] || langAdv.none;
    }

    if ($("#hubGate")) {
      $("#hubGate").textContent = ok ? langAdv.gateOpen : langAdv.gateLocked;
      $("#hubGate").classList.toggle("open", ok);
    }

    if ($("#productGrid")) {
      $("#productGrid").classList.toggle("locked", !ok);
    }
  }

  $$("[data-soil]").forEach(b => {
    b.addEventListener("click", () => {
      soilState = b.dataset.soil;
      renderSoil();
      if (soilState === "result") {
        notify("Soil test marked received (demo). Fertilizer hub unlocked!");
      } else {
        notify("Soil validation status updated.");
      }
    });
  });

  // Language Switching Handler
  const languageSelect = $("#languageSelect");

  function setLanguage(code) {
    currentLang = languages[code] ? code : "en";
    const dict = languages[currentLang];

    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ur" ? "rtl" : "ltr";

    // Update all data-i18n elements
    $$("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        el.innerHTML = dict[key];
      } else if (languages.en[key]) {
        el.innerHTML = languages.en[key];
      }
    });

    // Update dynamic text
    const voicePicker = $("#voiceLangSelect");
    if (voicePicker) {
      voicePicker.value = code;
    }
    renderSoil();
    updateZone(currentZone);

    // Update chatbot greeting
    if ($("#chatGreeting") && dict.chatGreeting) {
      $("#chatGreeting").textContent = dict.chatGreeting;
    }

    // Update bot voice toggle label according to active state
    const voiceToggleBtn = $("#botVoiceToggle");
    if (voiceToggleBtn) {
      const label = voiceToggleBtn.querySelector(".voice-toggle-label");
      if (label) {
        label.textContent = isBotVoiceAuto
          ? (dict.voiceToggleOn || "Voice ON")
          : (dict.voiceToggleOff || "Voice OFF");
      }
    }

    // Notify user
    if (code === "hi") {
      notify("भाषा हिन्दी चुनी गई। पूरी वेबसाइट हिन्दी में उपलब्ध है।");
    } else if (code === "ur") {
      notify("زبان اردو منتخب کی گئی۔ مکمل ویب سائٹ اردو (RTL) میں دستیاب ہے۔");
    } else if (code === "en") {
      notify("Language switched to English.");
    } else {
      const selectedName = languageSelect.options[languageSelect.selectedIndex]?.text || code;
      notify(`Language: ${selectedName}. Demonstrating with English fallback; regional localization model ready.`);
    }
  }

  if (languageSelect) {
    languageSelect.addEventListener("change", e => setLanguage(e.target.value));
  }

  // AI Farmer Friend Chatbot (Multilingual Agronomic Rule Engine)
  const botAnswers = [
    {
      keys: ["soil test", "soil-test", "soil sample", "npk", "n-p-k", "nitrogen", "phosph", "potash", "nutrient", "मिट्टी", "जांच", "परीक्षण", "ٹیسٹ", "مٹی", "غذائی"],
      en: "A certified laboratory soil test is the essential next step to measure soil pH, organic carbon, and available N-P-K. Satellite observations only flag potential nutrient-stress clues; they cannot measure mineral quantities. Take 15–20 cm core samples in a zigzag pattern across Zone C and send them to your local Krishi Vigyan Kendra (KVK).",
      hi: "प्रयोगशाला मिट्टी परीक्षण pH, जैविक कार्बन और N-P-K जानने का एकमात्र सही तरीका है। उपग्रह चित्र केवल पत्तियों के रंग से पोषक-तनाव के संकेत देते हैं—वे खाद की सटीक मात्रा नहीं माप सकते। हिस्सा C से 15-20 सेमी गहराई पर मिट्टी का नमूना लेकर नज़दीकी कृषि विज्ञान केंद्र (KVK) भेजें।",
      ur: "مٹی کی لیبارٹری جانچ pH، نامیاتی مادے اور N-P-K معلوم کرنے کا واحد درست طریقہ ہے۔ سیٹلائٹ صرف غذائی دباؤ کے اشارے دیتا ہے؛ وہ کیمیائی اجزا کی درست مقدار نہیں ناپ سکتا۔ حصہ C سے مٹی کا نمونہ لے کر قریبی کرشی وگیان کیندر (KVK) بھیجیں۔"
    },
    {
      keys: ["fertiliz", "compost", "vermi", "neem", "organic", "natural", "manure", "खाद", "कम्पोस्ट", "केंचुआ", "जैविक", "کھاد", "نامیاتی"],
      en: "Fertilizer choices must follow soil testing, never satellite maps alone. Once your soil test confirms nutrient levels, discuss balanced nutrition with an agronomist. Well-decomposed natural compost or vermicompost builds soil organic carbon and water-holding capacity. Check our Natural Fertilizer Hub below for local pilot options.",
      hi: "खाद का चुनाव हमेशा मिट्टी परीक्षण के बाद होना चाहिए, सीधे उपग्रह नक्शे से नहीं। जब रिपोर्ट आ जाए, तो संतुलित पोषण के लिए कृषि विशेषज्ञ से सलाह लें। अच्छी सड़ी गोबर खाद या केंचुआ खाद मिट्टी में जैविक कार्बन और नमी सोखने की क्षमता बढ़ाती है। नीचे हमारे प्राकृतिक खाद केंद्र में डेमो विकल्प देखें।",
      ur: "کھاد کا انتخاب ہمیشہ مٹی ٹیسٹ کے بعد ہونا چاہیے، براہ راست سیٹلائٹ نقشے سے نہیں۔ لیب رپورٹ آنے پر ماہرِ زراعت سے بات کریں۔ معیاری قدرتی کمپوسٹ یا کیچوا کھاد مٹی کی نمی برقرار رکھنے کی صلاحیت بڑھاتی ہے۔ نیچے ہمارے کھاد مرکز میں اختیارات دیکھیں۔"
    },
    {
      keys: ["irrigat", "water", "moisture", "rain", "पानी", "सिंचाई", "नमी", "بارش", "آبپاشی"],
      en: "Before irrigating, manually verify soil moisture at 10–15 cm root depth. If local rain probability exceeds 40% within the next 48 hours, delay irrigation. Over-irrigation causes root waterlogging and nutrient leaching. In your plot, Zone B currently shows a localized moisture deficit that needs field checking.",
      hi: "सिंचाई से पहले 10–15 सेमी जड़ की गहराई पर हाथ से मिट्टी की नमी जांचें। यदि अगले 48 घंटों में बारिश की 40% से अधिक संभावना हो, तो सिंचाई टालें। अधिक पानी देने से जड़ें सड़ सकती हैं। आपके खेत में हिस्सा B में सतही नमी की कमी दिख रही है, जिसकी जांच आवश्यक है।",
      ur: "آبپاشی سے پہلے 10–15 سینٹی میٹر جڑ کے پاس ہاتھ سے مٹی کی نمی چیک کریں۔ اگر آئندہ 48 گھنٹوں میں بارش کا امکان ہو تو پانی نہ لگائیں۔ زیادہ پانی سے جڑوں کو نقصان پہنچتا ہے۔ آپ کے پلاٹ میں حصہ B میں نمی کی کمی ہے جس کا معائنہ ضروری ہے۔"
    },
    {
      keys: ["pest", "insect", "disease", "spot", "fung", "rust", "कीट", "रोग", "फफूंद", "कीड़े", "بیماری"],
      en: "Inspect both affected and healthy zones in your field. Examine the undersides of leaves and roots for signs of aphids, stem borers, or fungal leaf rust. Take clear photographs and share them with your local block agriculture officer. Avoid blanket chemical spraying until the exact pathogen is diagnosed.",
      hi: "खेत के प्रभावित और स्वस्थ दोनों हिस्सों के पौधे देखें। पत्तियों के नीचे और जड़ों में कीट, तना छेदक या फफूंद के लक्षण जांचें। साफ़ तस्वीरें लेकर अपने स्थानीय कृषि अधिकारी या KVK को दिखाएँ। बीमारी की पहचान से पहले कोई ज़हरीला छिड़काव न करें।",
      ur: "متاثرہ اور صحت مند دونوں حصوں کے پودوں کا معائنہ کریں۔ پتوں کے نچلے حصے میں کیڑوں یا فنگس کی علامات دیکھیں۔ واضح تصاویر لے کر مقامی زراعت آفیسر کو دکھائیں۔ درست تشخیص سے پہلے کوئی زہریلا اسپرے نہ کریں۔"
    },
    {
      keys: ["vigour", "vigor", "yellow", "stress", "weak", "wilt", "low", "ताकत", "पीला", "तनाव", "زردی", "دباؤ"],
      en: "Low vigour or yellowing canopy can arise from moisture deficit, waterlogging, nitrogen deficiency, or soil salinity. Compare the flagged zone with thriving areas like Zone A. Check root health and arrange a soil test before applying any corrective fertilizers.",
      hi: "फसल में पीलापन या कम ताकत पानी की कमी, ज़्यादा पानी, नाइट्रोजन की कमी या मिट्टी में क्षारीयता के कारण हो सकती है। हिस्सा A जैसे हरे हिस्से से तुलना करें। जड़ की सेहत देखें और खाद डालने से पहले मिट्टी जांच कराएँ।",
      ur: "فصل کا پیلا پن پانی کی کمی، زیادہ نمی، نائٹروجن کی کمی یا مٹی کی خرابی سے ہو سکتا ہے۔ حصہ A جیسے سرسبز حصے سے موازنہ کریں۔ جڑوں کا معائنہ کریں اور مٹی ٹیسٹ کروائیں۔"
    },
    {
      keys: ["zone c", "clue", "हिस्सा c", "حصہ c"],
      en: "Zone C Advisory: Sentinel-2 imagery shows a 62% vigour index, flagging a potential nutrient-stress clue. Satellites cannot measure chemical N-P-K. We recommend collecting a soil core sample for laboratory testing before changing fertilizers.",
      hi: "हिस्सा C सलाह: उपग्रह डेटा यहाँ 62% फसल ताकत दिखा रहा है, जो पोषक-तनाव का संकेत है। उपग्रह सीधे N-P-K नहीं नाप सकता। खाद बदलने से पहले मिट्टी का नमूना लेकर लैब जांच कराएँ।",
      ur: "حصہ C مشورہ: سیٹلائٹ میں 62% قوت دیکھی گئی ہے جو غذائی دباؤ کا اشارہ ہے۔ سیٹلائٹ براہ راست N-P-K نہیں ناپتا۔ کھاد بدلنے سے پہلے مٹی کا ٹیسٹ کروائیں۔"
    },
    {
      keys: ["zone b", "moisture check", "हिस्सा b", "حصہ b"],
      en: "Zone B Advisory: Zone B shows a 44% surface moisture index, indicating a localized moisture deficit compared to neighbouring plots. Check soil moisture at root depth before turning on your tube well.",
      hi: "हिस्सा B सलाह: हिस्सा B में सतही नमी 44% दर्ज हुई है, जो आसपास के हिस्सों से कम है। नलकूप चलाने से पहले जड़ के पास हाथ से नमी जांचें।",
      ur: "حصہ B مشورہ: حصہ B میں سطحی نمی 44% ہے جو ملحقہ حصوں سے کم ہے۔ ٹیوب ویل چلانے سے پہلے جڑ کے قریب نمی خود چیک کریں۔"
    },
    {
      keys: ["zone e", "scout", "हिस्सा e", "حصہ e"],
      en: "Zone E Advisory: Zone E displays elevated canopy stress (65%) despite adequate soil moisture. We recommend field scouting for visible pests, leaf rust, or fungal spots.",
      hi: "हिस्सा E सलाह: हिस्सा E में नमी सामान्य होने के बावजूद फसल तनाव 65% है। पत्तियों में कीट या फफूंद की ध्यान से जांच करें।",
      ur: "حصہ E مشورہ: حصہ E میں نمی ٹھیک ہونے کے باوجود 65% تناؤ ہے۔ پتوں پر کیڑوں یا بیماری کا قریب سے معائنہ کریں۔"
    },
    {
      keys: ["earn", "income", "livelihood", "producer", "dealer", "supplier", "sell", "off-season", "आमदनी", "आजीविका", "रोजगार", "آمدنی", "روزگار"],
      en: "The Farmer Livelihood module is a future pilot concept: during off-seasons, drought, or low agricultural earning periods, participating farmers can be trained to prepare certified natural compost or vermicompost and supply local farmer groups. This creates supplemental income and sustainable rural enterprise.",
      hi: "किसान आजीविका मॉड्यूल भविष्य की पायलट सोच है: ऑफ-सीज़न या कम कमाई के दिनों में किसान उच्च गुणवत्ता वाली जैविक खाद व केंचुआ खाद तैयार कर सकते हैं और स्थानीय स्तर पर बेचकर अतिरिक्त आमदनी कमा सकते हैं।",
      ur: "کسان روزگار ماڈیول مستقبل کا پائلٹ وژن ہے: آف سیزن میں کسان تربیت یافتہ ہو کر معیاری نامیاتی کھاد تیار کر سکتے ہیں اور مقامی زرعی مارکیٹ کو فراہم کر کے اضافی روزگار کما سکتے ہیں۔"
    }
  ];

  function getChatbotReply(question) {
    const q = question.toLowerCase();

    // Check for polite greetings
    if (/^(hello|namaste|hi|hey|help|नमस्ते|سلام|السلام علیکم)/i.test(q.trim()) && q.length < 25) {
      if (currentLang === "hi") return "नमस्ते! मैं आपका कृषिवेद किसान मित्र हूँ। अपने खेत, मिट्टी जांच, सिंचाई या खाद के बारे में पूछिए!";
      if (currentLang === "ur") return "وعلیکم السلام! میں آپ کا کرشی وید کسان دوست ہوں۔ اپنے کھیت، مٹی ٹیسٹ، آبپاشی یا کھاد کے بارے میں پوچھیے!";
      return "Namaste! I’m your KrishiVed farmer advisor. Ask me about crop stress, irrigation timing, soil testing protocols, or natural fertilizer options.";
    }

    // Match keywords
    for (const item of botAnswers) {
      if (item.keys.some(k => q.includes(k.toLowerCase()))) {
        return item[currentLang] || item.en;
      }
    }

    // Default agronomic guidance
    if (currentLang === "hi") {
      return "एक समझदार पहला कदम यह है कि आप खेत में जाकर पत्तियों का रंग, जड़ की सेहत और नमी देखें। पोषक तत्वों के किसी भी फैसले से पहले मिट्टी परीक्षण और स्थानीय कृषि विशेषज्ञ से सलाह लें। (यह डेमो सामान्य मार्गदर्शन है, नैदानिक नुस्खा नहीं)।";
    }
    if (currentLang === "ur") {
      return "بہترین پہلا قدم یہ ہے کہ آپ کھیت میں جا کر پتوں، جڑوں اور نمی کا معائنہ کریں۔ کھاد کے فیصلے سے پہلے مٹی ٹیسٹ اور زرعی ماہر سے مشورہ لیں۔ (یہ ڈیمو عمومی رہنمائی ہے، کوئی طبی نسخہ نہیں)۔";
    }
    return "A sensible first step is to scout the flagged zone, compare affected plants with healthy neighbouring areas, and verify root-depth moisture. For nutrient decisions, always rely on certified laboratory soil testing and local agronomic expertise. This demo provides guidance, not a diagnosis.";
  }

  // Voice on the Adviser: Text-to-Speech & Speech-to-Text
  let activeAdvisorUtterance = null;
  let activeSpeakBtn = null;

  function speakAdvisorText(text, btnElement) {
    if (!window.speechSynthesis) {
      notify("Text-to-speech is not supported by your browser.");
      return;
    }

    // Toggle off if currently speaking from this button
    if (window.speechSynthesis.speaking && activeSpeakBtn === btnElement) {
      window.speechSynthesis.cancel();
      if (activeSpeakBtn) {
        activeSpeakBtn.classList.remove("speaking");
        const label = activeSpeakBtn.querySelector(".speak-label") || activeSpeakBtn.querySelector("span:last-child");
        if (label) label.textContent = currentLang === "hi" ? "सुनें" : currentLang === "ur" ? "سنیں" : "Listen";
      }
      activeSpeakBtn = null;
      return;
    }

    // Cancel any running utterance
    window.speechSynthesis.cancel();
    if (activeSpeakBtn) {
      activeSpeakBtn.classList.remove("speaking");
      const label = activeSpeakBtn.querySelector(".speak-label") || activeSpeakBtn.querySelector("span:last-child");
      if (label) label.textContent = currentLang === "hi" ? "सुनें" : currentLang === "ur" ? "سنیں" : "Listen";
    }

    const utterance = new SpeechSynthesisUtterance(text);
    activeAdvisorUtterance = utterance;
    activeSpeakBtn = btnElement;

    const targetTag = voiceLangCodes[currentLang] || "hi-IN";
    utterance.lang = targetTag;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      const exactVoice = voices.find(v => v.lang === targetTag || v.lang.startsWith(currentLang));
      if (exactVoice) {
        utterance.voice = exactVoice;
      } else {
        const fallbackVoice = voices.find(v => v.lang.startsWith("hi") || v.lang.startsWith("en"));
        if (fallbackVoice) utterance.voice = fallbackVoice;
      }
    }

    if (btnElement) {
      btnElement.classList.add("speaking");
      const label = btnElement.querySelector(".speak-label") || btnElement.querySelector("span:last-child");
      if (label) label.textContent = currentLang === "hi" ? "रुकें" : currentLang === "ur" ? "روکیں" : "Stop";
    }

    utterance.onend = () => {
      if (btnElement) {
        btnElement.classList.remove("speaking");
        const label = btnElement.querySelector(".speak-label") || btnElement.querySelector("span:last-child");
        if (label) label.textContent = currentLang === "hi" ? "सुनें" : currentLang === "ur" ? "سنیں" : "Listen";
      }
      if (activeSpeakBtn === btnElement) activeSpeakBtn = null;
    };

    utterance.onerror = () => {
      if (btnElement) {
        btnElement.classList.remove("speaking");
        const label = btnElement.querySelector(".speak-label") || btnElement.querySelector("span:last-child");
        if (label) label.textContent = currentLang === "hi" ? "सुनें" : currentLang === "ur" ? "سنیں" : "Listen";
      }
      if (activeSpeakBtn === btnElement) activeSpeakBtn = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  function addChatMessage(text, sender) {
    const chatContainer = $("#chatMessages");
    if (!chatContainer) return;

    const wrap = document.createElement("div");
    wrap.className = `message ${sender === "user" ? "user-message" : "bot-message"}`;

    if (sender !== "user") {
      const avatar = document.createElement("div");
      avatar.className = "message-avatar";
      avatar.textContent = "कृ";
      wrap.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    const p = document.createElement("p");
    p.textContent = text;
    bubble.appendChild(p);

    const time = document.createElement("small");
    time.textContent = `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · DEMO`;

    if (sender !== "user") {
      const foot = document.createElement("div");
      foot.className = "bubble-foot";
      foot.appendChild(time);

      const speakBtn = document.createElement("button");
      speakBtn.type = "button";
      speakBtn.className = "bubble-speak-btn";
      speakBtn.innerHTML = `<span>🔊</span> <span class="speak-label">${currentLang === "hi" ? "सुनें" : currentLang === "ur" ? "سنیں" : "Listen"}</span>`;
      speakBtn.title = "Listen to advice";
      speakBtn.addEventListener("click", () => {
        speakAdvisorText(text, speakBtn);
      });
      foot.appendChild(speakBtn);
      bubble.appendChild(foot);

      // Auto-speak reply if enabled
      if (isBotVoiceAuto) {
        speakAdvisorText(text, speakBtn);
      }
    } else {
      bubble.appendChild(time);
    }

    wrap.appendChild(bubble);
    chatContainer.appendChild(wrap);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function handleUserQuestion(q) {
    if (!q || !q.trim()) return;
    addChatMessage(q.trim(), "user");
    setTimeout(() => {
      addChatMessage(getChatbotReply(q.trim()), "bot");
    }, 280);
  }

  const chatForm = $("#chatForm");
  if (chatForm) {
    chatForm.addEventListener("submit", e => {
      e.preventDefault();
      const input = $("#chatInput");
      if (input && input.value) {
        handleUserQuestion(input.value);
        input.value = "";
        input.focus();
      }
    });
  }

  // Voice Input via Microphone (Web Speech Recognition)
  const chatMicBtn = $("#chatMicBtn");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognitionInstance = null;
  let isListening = false;

  if (chatMicBtn) {
    if (SpeechRecognition) {
      try {
        recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;

        recognitionInstance.onstart = () => {
          isListening = true;
          chatMicBtn.classList.add("listening");
          const input = $("#chatInput");
          if (input) input.placeholder = currentLang === "hi" ? "सुन रहे हैं... बोलिए 🎙️" : currentLang === "ur" ? "سن رہے ہیں... بولیے 🎙️" : "Listening... speak now 🎙️";
          notify("Microphone active. Speak your question to the advisor.");
        };

        recognitionInstance.onresult = event => {
          const transcript = event.results[0][0].transcript;
          const input = $("#chatInput");
          if (input) {
            input.value = transcript;
            handleUserQuestion(transcript);
            input.value = "";
          }
        };

        recognitionInstance.onerror = event => {
          console.warn("Speech recognition error:", event.error);
          notify(event.error === "not-allowed" ? "Microphone permission denied." : "Speech recognition: " + (event.error || "Could not hear audio"));
          resetMicState();
        };

        recognitionInstance.onend = () => {
          resetMicState();
        };

        function resetMicState() {
          isListening = false;
          chatMicBtn.classList.remove("listening");
          const input = $("#chatInput");
          if (input) input.placeholder = "Ask about your field (e.g. Zone C, soil test, watering)...";
        }

        chatMicBtn.addEventListener("click", () => {
          if (isListening) {
            recognitionInstance.stop();
          } else {
            try {
              recognitionInstance.lang = voiceLangCodes[currentLang] || "hi-IN";
              recognitionInstance.start();
            } catch (e) {
              console.warn("Recognition start failed:", e);
            }
          }
        });
      } catch (err) {
        console.warn("Could not instantiate SpeechRecognition:", err);
      }
    } else {
      chatMicBtn.addEventListener("click", () => {
        notify("Speech recognition is not supported in this browser. Please type your query in the box.");
      });
    }
  }

  // Auto-Voice Toggle in Chat Header
  const botVoiceToggle = $("#botVoiceToggle");
  if (botVoiceToggle) {
    botVoiceToggle.addEventListener("click", () => {
      isBotVoiceAuto = !isBotVoiceAuto;
      botVoiceToggle.classList.toggle("off", !isBotVoiceAuto);
      botVoiceToggle.setAttribute("aria-pressed", String(isBotVoiceAuto));
      const icon = botVoiceToggle.querySelector(".voice-toggle-icon");
      const label = botVoiceToggle.querySelector(".voice-toggle-label");
      if (icon) icon.textContent = isBotVoiceAuto ? "🔊" : "🔈";
      if (label) {
        if (currentLang === "hi") {
          label.textContent = isBotVoiceAuto ? "आवाज़ चालू" : "आवाज़ बंद";
        } else if (currentLang === "ur") {
          label.textContent = isBotVoiceAuto ? "آواز آن" : "آواز آف";
        } else {
          label.textContent = isBotVoiceAuto ? "Voice ON" : "Voice OFF";
        }
      }
      notify(`Advisor voice is now ${isBotVoiceAuto ? "ENABLED (Auto-readout on)" : "MUTED"}.`);
    });
  }

  // Initial Greeting Speak Button
  const initialGreetingBtn = $("#initialGreetingSpeakBtn");
  if (initialGreetingBtn) {
    initialGreetingBtn.addEventListener("click", () => {
      const text = $("#chatGreeting") ? $("#chatGreeting").textContent : "Namaste! I am your demo Farmer Friend.";
      speakAdvisorText(text, initialGreetingBtn);
    });
  }

  // Soil Validation Advisory Speak Button
  const speakSoilAdvisoryBtn = $("#speakSoilAdvisoryBtn");
  if (speakSoilAdvisoryBtn) {
    speakSoilAdvisoryBtn.addEventListener("click", () => {
      const advText = $("#advisoryText") ? $("#advisoryText").textContent : "";
      if (advText) {
        speakAdvisorText(advText, speakSoilAdvisoryBtn);
      }
    });
  }

  $$(".suggested-questions button").forEach(btn => {
    btn.addEventListener("click", () => {
      handleUserQuestion(btn.dataset.question || btn.textContent);
    });
  });

  if ($("#clearChat")) {
    $("#clearChat").addEventListener("click", () => {
      const chatContainer = $("#chatMessages");
      if (chatContainer) {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        chatContainer.innerHTML = `<div class="chat-date">${currentLang === "hi" ? "आज · डेमो सत्र" : currentLang === "ur" ? "آج · ڈیمو سیشن" : "TODAY · DEMO SESSION"}</div>`;
        const initialGreeting = (languages[currentLang] || languages.en).chatGreeting;
        addChatMessage(initialGreeting, "bot");
        notify("Chat session reset.");
      }
    });
  }

  // Natural Fertilizer Hub Category Filtering
  $$(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
      const cat = btn.dataset.filter;
      $$(".product-card").forEach(card => {
        card.hidden = cat !== "all" && card.dataset.category !== cat;
      });
    });
  });

  // Product Details Modal Dialog
  const productDialog = $("#productDialog");
  const productMetaDescriptions = {
    "Natural Compost": {
      desc: "A demo product representing well-decomposed organic matter composted from farm biomass. Intended to build soil organic carbon, microbial life, and water holding capacity.",
      cat: "Soil building · Demo"
    },
    "Vermicompost": {
      desc: "A demo product representing organic matter processed by earthworms. Rich in plant-available macronutrients and beneficial microbes. Check maturity before field broadcasting.",
      cat: "Soil building · Demo"
    },
    "Neem-based input": {
      desc: "A demo botanical input derived from cold-pressed neem seed kernels and cake. Acts as a natural nitrification inhibitor and suppresses soil-dwelling nematode larvae.",
      cat: "Plant-based · Demo"
    },
    "Farm-made bio-input": {
      desc: "A demo fermented liquid microbial formulation (e.g. Jeevamrit / Beejamrit) prepared from cattle dung, urine, and jaggery. Enhances beneficial soil biology.",
      cat: "Farm-made · Demo"
    }
  };

  $$(".product-details").forEach(btn => {
    btn.addEventListener("click", () => {
      const pName = btn.dataset.product;
      const meta = productMetaDescriptions[pName] || { desc: "Illustrative demo product.", cat: "Organic input · Demo" };

      if ($("#dialogProductName")) $("#dialogProductName").textContent = pName;
      if ($("#dialogProductCategory")) $("#dialogProductCategory").textContent = btn.dataset.category || meta.cat;
      if ($("#dialogProductDescription")) $("#dialogProductDescription").textContent = meta.desc;
      if ($("#dialogProductPrice")) $("#dialogProductPrice").textContent = btn.dataset.price || "₹180 / pack (demo)";
      if ($("#dialogProductProducer")) $("#dialogProductProducer").textContent = btn.dataset.producer || "Sample Farmer Producer";
      if ($("#dialogProductLocation")) $("#dialogProductLocation").textContent = btn.dataset.location || "Local District Hub";
      if ($("#dialogProductAvail")) $("#dialogProductAvail").textContent = btn.dataset.avail || "Available in demo batch";

      if (productDialog && typeof productDialog.showModal === "function") {
        productDialog.showModal();
      } else {
        notify(`${pName}: Prototype demo listing only.`);
      }
    });
  });

  if ($("#closeProductDialog")) $("#closeProductDialog").addEventListener("click", () => productDialog.close());
  if ($("#closeProductBtn")) $("#closeProductBtn").addEventListener("click", () => productDialog.close());
  if (productDialog) {
    productDialog.addEventListener("click", e => {
      if (e.target === productDialog) productDialog.close();
    });
  }

  // Producer Interest Modal Dialog & Submission
  const producerDialog = $("#producerDialog");
  if ($("#joinProducer") && producerDialog) {
    $("#joinProducer").addEventListener("click", () => {
      if (typeof producerDialog.showModal === "function") {
        producerDialog.showModal();
      } else {
        notify("Demo producer registration modal.");
      }
    });
  }

  if ($("#closeProducerDialog") && producerDialog) {
    $("#closeProducerDialog").addEventListener("click", () => producerDialog.close());
  }

  const producerForm = $("#producerInterestForm");
  if (producerForm) {
    producerForm.addEventListener("submit", e => {
      e.preventDefault();
      const product = $("#producerProductSelect") ? $("#producerProductSelect").value : "Natural Compost";
      const season = $("#producerSeasonSelect") ? $("#producerSeasonSelect").value : "Off-season";

      const list = $(".producer-list");
      if (list) {
        const row = document.createElement("div");
        row.className = "producer-row";
        const initial = (activeFarmer.name || "K").charAt(0).toUpperCase();

        row.innerHTML = `
          <span class="producer-avatar">${initial}</span>
          <span>
            <strong>${activeFarmer.name} (You)</strong>
            <small>${activeFarmer.location} · ${product} · ${season} · Registered Interest (demo)</small>
          </span>
          <span class="demo-tag">REGISTERED DEMO</span>
        `;
        list.prepend(row);
      }

      if (producerDialog) producerDialog.close();
      notify(`Producer interest registered for ${activeFarmer.name}!`);
    });
  }

  // Initialize Default State
  updateZone("C");
  renderSoil();

  // Public Architecture Interface (Ready for live Supabase, Maps, Weather, and AI APIs)
  window.KrishiVed = {
    version: "2.0-anti-final",
    demoMode: true,
    getActiveFarmer: () => ({ ...activeFarmer }),
    getZoneData: () => ({ ...zoneData }),
    getCurrentZone: () => currentZone,
    setZone: updateZone,
    setSoilStatus: (s) => { soilState = s; renderSoil(); },
    adapters: {
      auth: null,        // Supabase GoTrue client
      database: null,    // Supabase PostgREST client
      satellite: null,   // Sentinel Hub / Planet / Earth Engine client
      weather: null,     // IMD / Open-Meteo client
      maps: null,        // Google Maps JS SDK client
      ai: null,          // Gemini API client
      payments: null,    // Razorpay client
      marketplace: null  // FPO Directory API client
    }
  };
})();
