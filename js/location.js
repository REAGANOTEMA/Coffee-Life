// contact-map.js
(function () {
  let map;
  let markers = [];
  let bounds;

  // Branch locations
  const locations = [
    {
      id: "jinja-highway",
      name: "Jinja — Highway (Total Energies)",
      desc: "Opposite Gadhafi Police Barracks, Jinja Roundabout",
      lat: 0.4356,
      lng: 33.2039,
      contacts: ["256746888730", "256784305795"],
      color: "red"
    },
    {
      id: "jinja-lakeview",
      name: "Jinja — Lakeview (Total Lakeview)",
      desc: "Mailo Mbili, Jinja",
      lat: 0.4425,
      lng: 33.2107,
      contacts: ["256746888730"],
      color: "orange"
    },
    {
      id: "kampala-kasangalinke",
      name: "Kansanga — Ggaba Road",
      desc: "Opposite University of East Africa, Kansanga",
      lat: 0.3190,
      lng: 32.5955,
      contacts: ["256748888730"],
      color: "green"
    }
  ];

  // Initialize map
  window.initMap = function () {
    const mapEl = document.querySelector(".map-preview");
    if (!mapEl) return console.error("Map container (.map-preview) not found!");

    map = new google.maps.Map(mapEl, {
      zoom: 12,
      center: { lat: locations[0].lat, lng: locations[0].lng },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    bounds = new google.maps.LatLngBounds();

    locations.forEach(loc => {
      const marker = new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map,
        title: loc.name,
        icon: `https://maps.google.com/mapfiles/ms/icons/${loc.color}-dot.png`
      });

      const waLinks = loc.contacts.map(c => `<a href="https://wa.me/${c}" target="_blank">+${c}</a>`).join("<br>");

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="min-width:200px;">
                            <strong>${loc.name}</strong><br>${loc.desc}<br><br>
                            <strong>WhatsApp:</strong><br>${waLinks}
                          </div>`
      });

      marker.addListener("click", () => infoWindow.open(map, marker));

      markers.push({ marker, infoWindow });
      bounds.extend(marker.position);
    });

    map.fitBounds(bounds);

    // Refit map on window resize
    window.addEventListener("resize", () => map.fitBounds(bounds));
  };
})();
