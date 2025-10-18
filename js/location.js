// COFFEE LIFE — Google Maps Final Locations with Cart Integration
let map;
let markers = [];
let bounds;

function initMap() {
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

  // Create map
  map = new google.maps.Map(document.getElementById("map"), {
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
      map: map,
      title: loc.name,
      icon: `https://maps.google.com/mapfiles/ms/icons/${loc.color}-dot.png`,
      customId: loc.id
    });

    const waLinks = loc.contacts.map(c => `<a href="https://wa.me/${c}" target="_blank">+${c}</a>`).join("<br>");

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="min-width:200px;">
                  <strong>${loc.name}</strong><br>
                  ${loc.desc}<br><br>
                  <strong>WhatsApp Contacts:</strong><br>${waLinks}
                </div>`
    });

    marker.addListener("click", () => infoWindow.open(map, marker));
    markers.push({ marker, id: loc.id, infoWindow });
    bounds.extend(marker.position);
  });

  map.fitBounds(bounds);

  // Responsive: recenter on window resize
  window.addEventListener("resize", () => map.fitBounds(bounds));

  // Highlight marker when a location group is selected
  const locationGroupSelect = document.getElementById("location-group");
  if (locationGroupSelect) {
    locationGroupSelect.addEventListener("change", () => highlightMarker(locationGroupSelect.value));
  }
}

// Highlight selected marker
function highlightMarker(id) {
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
}
