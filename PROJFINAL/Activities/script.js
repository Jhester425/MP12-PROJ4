document.addEventListener("DOMContentLoaded", async () => {
    const ccaaSelect = document.getElementById("ccaa");
    const provinciaSelect = document.getElementById("provincia");
    const poblacionSelect = document.getElementById("poblacion");
    const submitButton = document.getElementById("submit");
    const imageContainer = document.getElementById("image-container");
    const locationText = document.getElementById("location");
    const descriptionText = document.getElementById("description-text");

    // Load Autonomous Communities (CCAA)
    async function loadCCAA() {
        try {
            const response = await fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json");
            const ccaaList = await response.json();

            ccaaList.forEach(ccaa => {
                let option = document.createElement("option");
                option.value = ccaa.code;
                option.textContent = ccaa.label;
                ccaaSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error loading CCAA:", error);
        }
    }

    // Load Provinces when a CCAA is selected
    async function loadProvincias(ccaaId) {
        provinciaSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        provinciaSelect.disabled = true;
        poblacionSelect.disabled = true;

        try {
            const response = await fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json");
            const provinciaList = await response.json();

            let filteredProvincias = provinciaList.filter(provincia => provincia.parent_code === ccaaId);
            if (filteredProvincias.length > 0) provinciaSelect.disabled = false;

            filteredProvincias.forEach(provincia => {
                let option = document.createElement("option");
                option.value = provincia.code;
                option.textContent = provincia.label;
                provinciaSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error loading provinces:", error);
        }
    }

    // Load Towns when a Province is selected
    async function loadPoblaciones(provinciaId) {
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        poblacionSelect.disabled = true;

        try {
            const response = await fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json");
            const poblacionList = await response.json();

            let filteredPoblaciones = poblacionList.filter(poblacion => String(poblacion.parent_code) === String(provinciaId));
            
            if (filteredPoblaciones.length > 0) {
                poblacionSelect.disabled = false;
            }

            filteredPoblaciones.forEach(poblacion => {
                let option = document.createElement("option");
                option.value = poblacion.label;
                option.textContent = poblacion.label;
                poblacionSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error loading towns:", error);
        }
    }

    // Fetch description of the selected town from Wikipedia
    async function fetchDescription(poblacion) {
        try {
            const response = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(poblacion)}`);
            const data = await response.json();

            if (data.extract) {
                descriptionText.textContent = data.extract;
            } else {
                descriptionText.textContent = "No description available for this town.";
            }
        } catch (error) {
            console.error("Error fetching description:", error);
            descriptionText.textContent = "Failed to load description.";
        }
    }

    // Use the Geolocation API to get user's current location (latitude and longitude)
    function getUserLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    resolve({ lat, lon });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    // Geolocation API to get the user's location and fetch nearby town's location
    async function fetchLocation(poblacion) {
        try {
            const userLocation = await getUserLocation();
            const { lat, lon } = userLocation;
    
            // Fetch the location using Nominatim API and compare it with the user's location
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(poblacion + ', España')}`);
            const data = await response.json();
    
            if (data.length > 0) {
                const townLat = parseFloat(data[0].lat);
                const townLon = parseFloat(data[0].lon);
    
                // Function to calculate distance using Haversine formula
                function haversine(lat1, lon1, lat2, lon2) {
                    const R = 6371; // Radius of the Earth in km
                    const dLat = (lat2 - lat1) * Math.PI / 180;
                    const dLon = (lon2 - lon1) * Math.PI / 180;
                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c; // Distance in km
                    return distance;
                }
    
                // Calculate distance
                const distance = haversine(lat, lon, townLat, townLon).toFixed(2);
    
                // Display the result
                locationText.innerHTML = `<b>Poblacion </b><br>
                                          Lat: ${townLat}, Lon: ${townLon} <br><br>
                                          <b>Tu ubicación</b><br>
                                          Latid: ${lat}, Longtitude: ${lon} <br><br>
                                          <b>Tu distancia de la poblacion:</b><br>
                                           ${distance} km`;
            } else {
                locationText.textContent = "Location not found.";
            }
        } catch (error) {
            console.error("Error fetching location:", error);
            locationText.textContent = "Failed to load location.";
        }
    }
    

    // Fetch Images from Wikimedia
    async function fetchImages(poblacion) {
        imageContainer.innerHTML = "<p>Loading images...</p>";

        try {
            const response = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(poblacion)}&gimlimit=10&prop=imageinfo&iiprop=url`);
            const data = await response.json();

            imageContainer.innerHTML = "";
            if (data.query && data.query.pages) {
                Object.values(data.query.pages).forEach(page => {
                    if (page.imageinfo) {
                        let img = document.createElement("img");
                        img.src = page.imageinfo[0].url;
                        img.alt = poblacion;
                        img.style.width = "400px";
                        img.style.margin = "10px";
                        imageContainer.appendChild(img);
                    }
                });
            } else {
                imageContainer.innerHTML = "<p>No images found for this town.</p>";
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            imageContainer.innerHTML = "<p>Failed to load images.</p>";
        }
    }

    // Event Listeners
    ccaaSelect.addEventListener("change", () => loadProvincias(ccaaSelect.value));
    provinciaSelect.addEventListener("change", () => loadPoblaciones(provinciaSelect.value));

    submitButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent form submission
        const poblacion = poblacionSelect.value;
        if (poblacion) {
            fetchImages(poblacion);
            fetchDescription(poblacion);
            fetchLocation(poblacion); // Fetch location for the selected town
        } else {
            alert("Please select a town.");
        }
    });

    // Initialize the form
    loadCCAA();
});
