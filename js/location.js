// ============================
// location.js — COFFEE LIFE Premium Map & Delivery
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const mapLocationStatus = document.getElementById("mapLocationStatus");
  const btnUseLocation = document.getElementById("btnUseLocation");
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  // HQ coordinates — Jinja Roundabout opposite Gadhafi Police Barracks at Total
  const HQ_LAT = 0.44425; // Exact latitude
  const HQ_LNG = 33.20312; // Exact longitude
  const HQ_NAME = "COFFEE LIFE CAFE";

  let map = L.map(mapContainer).setView([HQ_LAT, HQ_LNG], 17); // Zoomed in

  // OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  // HQ Red Pin
  const hqMarker = L.marker([HQ_LAT, HQ_LNG], {
      icon: L.icon({
          iconUrl: "images/map-red-pin.png",
          iconSize: [36, 36],
          iconAnchor: [18, 36]
      })
  }).addTo(map)
    .bindPopup(`<strong>${HQ_NAME}</strong><br>Opposite Gadhafi Police Barracks at Total, Jinja Roundabout`)
    .openPopup();

  let userMarker = null;

  function formatDistance(km) {
      return km < 1 ? `${(km*1000).toFixed(0)} m` : `${km.toFixed(2)} km`;
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // km
      const dLat = (lat2-lat1) * Math.PI/180;
      const dLon = (lon2-lon1) * Math.PI/180;
      const a = Math.sin(dLat/2)**2 +
                Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
                Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
  }

  function getDeliveryFee(distanceKm){
      return Math.ceil(distanceKm * 1000); // 1000 UGX per km
  }

  function locateUser(){
      if (!navigator.geolocation){
          mapLocationStatus.textContent = "Geolocation not supported by your browser.";
          mapLocationStatus.classList.add("muted");
          return;
      }

      navigator.geolocation.getCurrentPosition(
          (pos) => {
              const userLat = pos.coords.latitude;
              const userLng = pos.coords.longitude;

              // Remove previous marker if exists
              if(userMarker) map.removeLayer(userMarker);

              userMarker = L.marker([userLat, userLng], {
                  icon: L.icon({
                      iconUrl: "images/map-blue-pin.png",
                      iconSize: [32, 32],
                      iconAnchor: [16, 32]
                  })
              }).addTo(map).bindPopup("You are here").openPopup();

              // Fit map bounds
              const bounds = L.latLngBounds([[HQ_LAT,HQ_LNG],[userLat,userLng]]);
              map.fitBounds(bounds, { padding: [60,60] });

              const distanceKm = calculateDistance(userLat, userLng, HQ_LAT, HQ_LNG);
              const deliveryFee = getDeliveryFee(distanceKm);

              mapLocationStatus.textContent = `You are ${formatDistance(distanceKm)} away from ${HQ_NAME}. Estimated Delivery Fee: UGX ${deliveryFee.toLocaleString()}`;
              mapLocationStatus.classList.remove("muted");

              // Optional: update cart if present
              if(window.cart && typeof window.cartUpdateDistance === "function"){
                  window.cartUpdateDistance(distanceKm, deliveryFee);
              }

          },
          (err) => {
              mapLocationStatus.textContent = "Unable to get your location. Delivery fee will default.";
              mapLocationStatus.classList.add("muted");
              console.error(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
  }

  btnUseLocation.addEventListener("click", locateUser);
});
