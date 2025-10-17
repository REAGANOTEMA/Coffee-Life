/* ============================
   location.js — COFFEE LIFE CAFE Location & Delivery (Final Premium)
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
  const mapLocationStatus = document.getElementById("mapLocationStatus");
  const btnUseLocation = document.getElementById("btnUseLocation");
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  // ================================================
  // HQ coordinates — COFFEE LIFE CAFE, Jinja, Uganda
  // ================================================
  const HQ_LAT = 0.440927;
  const HQ_LNG = 33.212291;
  const HQ_NAME = "COFFEE LIFE CAFE";

  // Initialize Leaflet map
  const map = L.map(mapContainer).setView([HQ_LAT, HQ_LNG], 17);

  // OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  // HQ Red Pin
  const hqMarker = L.marker([HQ_LAT, HQ_LNG], {
    icon: L.icon({
      iconUrl: "images/map-red-pin.png",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      className: "hq-pin"
    }),
  })
    .addTo(map)
    .bindPopup(`<strong>${HQ_NAME}</strong><br>Opposite Gadhafi Police Barracks, Jinja Roundabout
                <br><a href="https://www.google.com/maps/dir/?api=1&destination=${HQ_LAT},${HQ_LNG}" target="_blank">Get Directions</a>`)
    .openPopup();

  let userMarker = null;

  // Utilities
  function formatDistance(km) {
    return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(2)} km`;
  }

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

  function getDeliveryFee(distanceKm) {
    return Math.ceil(distanceKm * 1000); // 1000 UGX per km
  }

  // Locate User
  function locateUser() {
    if (!navigator.geolocation) {
      mapLocationStatus.textContent = "Geolocation not supported by your browser.";
      mapLocationStatus.classList.add("location-error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        if (userMarker) map.removeLayer(userMarker);

        userMarker = L.marker([userLat, userLng], {
          icon: L.icon({
            iconUrl: "images/map-blue-pin.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            className: "user-pin"
          }),
        })
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();

        const bounds = L.latLngBounds([
          [HQ_LAT, HQ_LNG],
          [userLat, userLng],
        ]);
        map.fitBounds(bounds, { padding: [60, 60] });

        const distanceKm = calculateDistance(userLat, userLng, HQ_LAT, HQ_LNG);
        const deliveryFee = getDeliveryFee(distanceKm);

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

        if (window.cart && typeof window.cartUpdateDistance === "function") {
          window.cartUpdateDistance(distanceKm, deliveryFee);
        }
      },
      (err) => {
        mapLocationStatus.textContent = "Unable to get your location. Delivery fee will default.";
        mapLocationStatus.classList.add("location-error");
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  btnUseLocation.addEventListener("click", locateUser);
});
