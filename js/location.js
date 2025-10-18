/* ============================
   location.js — COFFEE LIFE CAFE Locations & Delivery (Final)
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
  const mapLocationStatus = document.getElementById("mapLocationStatus");
  const btnUseLocation = document.getElementById("btnUseLocation");
  const mapContainer = document.getElementById("map");
  const deliverySelect = document.getElementById("delivery-zone");
  if (!mapContainer || !deliverySelect) return;

  // HQ coordinates — COFFEE LIFE CAFE, Jinja
  const HQ_LAT = 0.440927;
  const HQ_LNG = 33.212291;
  const HQ_NAME = "COFFEE LIFE CAFE";

  // Delivery locations with coordinates (approximate)
  const DELIVERY_LOCATIONS = [
    { name: "Jinja Town", lat: 0.4375, lng: 33.203, group: "jinja-highway", fee: 2000 },
    { name: "Milo Mbili", lat: 0.435, lng: 33.209, group: "jinja-highway", fee: 2000 },
    { name: "Walukuba West", lat: 0.433, lng: 33.218, group: "jinja-highway", fee: 2000 },
    { name: "Walukuba East", lat: 0.434, lng: 33.222, group: "jinja-highway", fee: 3000 },
    { name: "Mafubira", lat: 0.428, lng: 33.230, group: "jinja-highway", fee: 3000 },
    { name: "Mpumudde", lat: 0.442, lng: 33.228, group: "jinja-highway", fee: 3000 },
    { name: "Bugembe", lat: 0.455, lng: 33.220, group: "jinja-highway", fee: 3000 },
    { name: "Nile", lat: 0.462, lng: 33.218, group: "jinja-highway", fee: 3000 },
    { name: "Masese", lat: 0.470, lng: 33.210, group: "jinja-highway", fee: 4000 },
    { name: "Wakitaka", lat: 0.468, lng: 33.225, group: "jinja-highway", fee: 4000 },
    { name: "Namuleesa", lat: 0.475, lng: 33.215, group: "jinja-highway", fee: 4000 },

    { name: "Lakeview Central", lat: 0.429, lng: 33.210, group: "jinja-lakeview", fee: 2000 },
    { name: "Mailombili", lat: 0.430, lng: 33.212, group: "jinja-lakeview", fee: 2000 },

    { name: "Makerere", lat: 0.338, lng: 32.572, group: "kampala-kasangalinke", fee: 3000 },
    { name: "Kira Road", lat: 0.3385, lng: 32.584, group: "kampala-kasangalinke", fee: 3000 },
    { name: "Gabba Road", lat: 0.336, lng: 32.578, group: "kampala-kasangalinke", fee: 3500 },
    { name: "Other Kampala", lat: 0.340, lng: 32.590, group: "kampala-kasangalinke", fee: 4000 }
  ];

  // Initialize Leaflet map
  const map = L.map(mapContainer).setView([HQ_LAT, HQ_LNG], 13);

  // OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  // HQ Marker
  const hqMarker = L.marker([HQ_LAT, HQ_LNG], {
    icon: L.icon({
      iconUrl: "images/map-red-pin.png",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      className: "hq-pin"
    })
  }).addTo(map).bindPopup(`<strong>${HQ_NAME}</strong><br>Opposite Gadhafi Police Barracks, Jinja<br>
    <a href="https://www.google.com/maps/dir/?api=1&destination=${HQ_LAT},${HQ_LNG}" target="_blank">Get Directions</a>`).openPopup();

  let userMarker = null;

  // Utilities
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function formatDistance(km) {
    return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(2)} km`;
  }

  function updateCartDelivery(areaName, fee) {
    if (!window.cart) return;
    window.DELIVERY_FEE = fee;
    if (typeof window.updateCartDisplay === "function") window.updateCartDisplay();
  }

  // Add delivery location markers (clickable)
  DELIVERY_LOCATIONS.forEach(loc => {
    L.marker([loc.lat, loc.lng], {
      icon: L.icon({
        iconUrl: "images/map-orange-pin.png",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: "delivery-pin"
      })
    }).addTo(map)
      .bindPopup(`<strong>${loc.name}</strong><br>Group: ${loc.group}<br>Fee: UGX ${loc.fee.toLocaleString()}<br>
        <button class="select-location-btn" data-name="${loc.name}" data-fee="${loc.fee}">Select This Area</button>`);
  });

  // Handle user selecting delivery area from map
  map.on("popupopen", e => {
    const btn = e.popup._contentNode.querySelector(".select-location-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const area = btn.dataset.name;
      const fee = parseInt(btn.dataset.fee);
      const option = Array.from(deliverySelect.options).find(opt => opt.value === area);
      if (option) {
        deliverySelect.value = area;
        updateCartDelivery(area, fee);
        map.closePopup();
      }
    });
  });

  // Locate user
  function locateUser() {
    if (!navigator.geolocation) {
      mapLocationStatus.textContent = "Geolocation not supported by your browser.";
      mapLocationStatus.classList.add("location-error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        if (userMarker) map.removeLayer(userMarker);

        userMarker = L.marker([userLat, userLng], {
          icon: L.icon({
            iconUrl: "images/map-blue-pin.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            className: "user-pin"
          })
        }).addTo(map).bindPopup("You are here").openPopup();

        const distanceKm = calculateDistance(userLat, userLng, HQ_LAT, HQ_LNG);
        const deliveryFee = Math.ceil(distanceKm * 1000);

        mapLocationStatus.innerHTML = `
          <div class="location-banner">
            <p>Distance from ${HQ_NAME}:</p>
            <span class="distance">${formatDistance(distanceKm)}</span>
          </div>
          <div class="location-info">
            <span class="fee">Estimated Delivery Fee: UGX ${deliveryFee.toLocaleString()}</span>
          </div>
        `;
        mapLocationStatus.classList.remove("location-error");

        if (typeof window.cartUpdateDistance === "function") {
          window.cartUpdateDistance(distanceKm, deliveryFee);
        }

        map.fitBounds(L.latLngBounds([
          [HQ_LAT, HQ_LNG],
          [userLat, userLng],
          ...DELIVERY_LOCATIONS.map(l => [l.lat, l.lng])
        ]), { padding: [60, 60] });
      },
      err => {
        mapLocationStatus.textContent = "Unable to get your location. Delivery fee will default.";
        mapLocationStatus.classList.add("location-error");
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  btnUseLocation.addEventListener("click", locateUser);
});
