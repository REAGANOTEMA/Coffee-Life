// ===== COFFEE LIFE — Google Maps Final JS =====
(function () {
  let map;
  let markers = [];
  let bounds;

  // Initialize the map
  window.initMap = function () {
    const locations = [
      {
        id: "jinja-highway",
        name: "Jinja — Highway (Total Energies)",
        desc: "Opposite Gadhafi Police Barracks, Jinja Roundabout",
        lat: 0.4356,
        lng: 33.2039,
        contacts: ["256752746763", "256749958799", "256751054138"],
        color: "red"
      },
      {
        id: "jinja-lakeview",
        name: "Jinja — Lakeview (Total Lakeview)",
        desc: "Mailombili",
        lat: 0.4425,
        lng: 33.2107,
        contacts: ["256750038032"],
        color: "orange"
      },
      {
        id: "kampala-kasangalinke",
        name: "Kampala — Kasangalinke (Gabba Road)",
        desc: "Opposite University of East Africa",
        lat: 0.3190,
        lng: 32.5955,
        contacts: ["256783070102"],
        color: "green"
      }
    ];

    const mapEl = document.getElementById("map");
    if (!mapEl) return console.error("Map container (#map) not found!");

    // Create the map
    map = new google.maps.Map(mapEl, {
      zoom: 12,
      center: { lat: locations[0].lat, lng: locations[0].lng },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    bounds = new google.maps.LatLngBounds();

    // Add markers
    locations.forEach(loc => {
      const marker = new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map,
        title: loc.name,
        icon: `https://maps.google.com/mapfiles/ms/icons/${loc.color}-dot.png`,
        customId: loc.id
      });

      const waLinks = loc.contacts
        .map(c => `<a href="https://wa.me/${c}" target="_blank">+${c}</a>`)
        .join("<br>");

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="min-width:200px;">
                            <strong>${loc.name}</strong><br>
                            ${loc.desc}<br><br>
                            <strong>WhatsApp:</strong><br>${waLinks}
                          </div>`
      });

      marker.addListener("click", () => infoWindow.open(map, marker));

      markers.push({ marker, id: loc.id, infoWindow });
      bounds.extend(marker.position);
    });

    // Fit all markers into view
    map.fitBounds(bounds);

    // Keep map bounds on window resize
    window.addEventListener("resize", () => map.fitBounds(bounds));
  };

  // Highlight a marker by ID
  window.highlightMarker = function (id) {
    markers.forEach(m => {
      if (m.id === id) {
        m.marker.setAnimation(google.maps.Animation.BOUNCE);
        m.infoWindow.open(map, m.marker);
        map.setCenter(m.marker.getPosition());
        map.setZoom(14);
      } else {
        m.marker.setAnimation(null);
        m.infoWindow.close();
      }
    });
  };
})();
