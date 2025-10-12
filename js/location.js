document.addEventListener("DOMContentLoaded", () => {
    const mapLocationStatus = document.getElementById("mapLocationStatus");

    // Ask for location automatically
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                mapLocationStatus.textContent = `Location shared: Latitude ${lat}, Longitude ${lng}`;
                mapLocationStatus.classList.remove("muted");

                console.log("User location:", { lat, lng });

                // Optional: send to your server via fetch/AJAX
                fetch("your-server-endpoint", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ latitude: lat, longitude: lng })
                });
            },
            (error) => {
                mapLocationStatus.textContent = "Unable to get location.";
                console.error(error);
            }
        );
    } else {
        mapLocationStatus.textContent = "Geolocation not supported by your browser.";
    }
});
