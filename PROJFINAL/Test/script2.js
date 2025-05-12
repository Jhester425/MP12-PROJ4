document.addEventListener("DOMContentLoaded", async () => {
    const ccaaSelect = document.getElementById("ccaa");
    const provinciaSelect = document.getElementById("provincia");
    const poblacionSelect = document.getElementById("poblacion");
    const submitButton = document.getElementById("submit");
    const locationText = document.getElementById("location");
    const descriptionText = document.getElementById("description-text");
    const geoapifyApiKey = "b67aea39f187481ab5e5062a8e3cf645"; // Your Geoapify API key

    async function loadCCAA() {
        const response = await fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/master/ccaa.json");
        const ccaaList = await response.json();
        ccaaList.forEach(ccaa => {
            let option = document.createElement("option");
            option.value = ccaa.code;
            option.textContent = ccaa.label;
            ccaaSelect.appendChild(option);
        });
    }

    async function loadProvincias(ccaaId) {
        provinciaSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        provinciaSelect.disabled = true;
        poblacionSelect.disabled = true;

        const response = await fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/master/provincias.json");
        const provinciaList = await response.json();
        const filtered = provinciaList.filter(p => p.parent_code === ccaaId);
        filtered.forEach(provincia => {
            let option = document.createElement("option");
            option.value = provincia.code;
            option.textContent = provincia.label;
            provinciaSelect.appendChild(option);
        });
        provinciaSelect.disabled = false;
    }

    async function loadPoblaciones(provinciaId) {
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        poblacionSelect.disabled = true;

        const response = await fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/master/poblaciones.json");
        const poblacionList = await response.json();
        const filtered = poblacionList.filter(p => String(p.parent_code) === String(provinciaId));
        filtered.forEach(poblacion => {
            let option = document.createElement("option");
            option.value = poblacion.label;
            option.textContent = poblacion.label;
            poblacionSelect.appendChild(option);
        });
        poblacionSelect.disabled = false;
    }

    async function fetchDescription(poblacion) {
        try {
            const response = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(poblacion)}`);
            const data = await response.json();
            descriptionText.textContent = data.extract || "No se encontró descripción en Wikipedia.";
        } catch {
            descriptionText.textContent = "Error al obtener la descripción.";
        }
    }

    function getUserLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                err => reject(err)
            );
        });
    }

    async function fetchLocation(poblacion) {
        try {
            const userLoc = await getUserLocation();
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(poblacion + ', España')}`);
            const data = await res.json();
            if (!data.length) return locationText.textContent = "No se encontró la ubicación.";

            const lat2 = parseFloat(data[0].lat);
            const lon2 = parseFloat(data[0].lon);

            const R = 6371;
            const dLat = (lat2 - userLoc.lat) * Math.PI / 180;
            const dLon = (lon2 - userLoc.lon) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = (R * c).toFixed(2);

            locationText.innerHTML = `
                <b>Coordenadas del lugar:</b><br>Lat: ${lat2}, Lon: ${lon2}<br><br>
                <b>Tu ubicación:</b><br>Lat: ${userLoc.lat}, Lon: ${userLoc.lon}<br><br>
                <b>Distancia:</b> ${distance} km
            `;
        } catch {
            locationText.textContent = "Error obteniendo la ubicación.";
        }
    }

    async function fetchNearbyPlaces(poblacion) {
        try {
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(poblacion + ', España')}`);
            const data = await nomRes.json();
            if (!data.length) return;

            const lat = data[0].lat;
            const lon = data[0].lon;
            const categories = "activity,commercial,entertainment,leisure,natural,tourism,ski,sport";
            const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},10000&limit=20&apiKey=${geoapifyApiKey}`;
            const placesRes = await fetch(url);
            const places = await placesRes.json();

            const container = document.getElementById("places-container") || document.createElement("div");
            container.id = "places-container";
            container.innerHTML = "<h3>Lugares de interés:</h3>";

            if (places.features.length === 0) {
                container.innerHTML += "<p>No se encontraron lugares cercanos.</p>";
            } else {
                const list = document.createElement("ul");
                places.features.forEach(place => {
                    const item = document.createElement("li");
                    item.textContent = `${place.properties.name || "Sin nombre"} — ${place.properties.categories.join(", ")}`;
                    list.appendChild(item);
                });
                container.appendChild(list);
            }

            document.body.appendChild(container);
        } catch (error) {
            console.error("Error en lugares cercanos:", error);
        }
    }

    async function fetchNearbyActivities(poblacion) {
        try {
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(poblacion + ', España')}`);
            const data = await nomRes.json();
            if (!data.length) return;

            const lat = data[0].lat;
            const lon = data[0].lon;
            const categories = "natural.beach,tourism.attraction,leisure.park,sport.swimming_pool,entertainment.cinema";
            const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},10000&limit=10&apiKey=${geoapifyApiKey}`;
            const res = await fetch(url);
            const activityData = await res.json();

            const activityContainer = document.getElementById("activity-container");
            activityContainer.innerHTML = "<h3>Actividades cercanas:</h3>";

            if (activityData.features.length === 0) {
                activityContainer.innerHTML += "<p>No se encontraron actividades.</p>";
                return;
            }

            activityData.features.forEach(act => {
                const div = document.createElement("div");
                div.classList.add("activity-item");
                div.innerHTML = `
                    <h4>${act.properties.name || "Sin nombre"}</h4>
                    <p><strong>Categoría:</strong> ${act.properties.categories.join(", ")}</p>
                    <p><strong>Dirección:</strong> ${act.properties.address_line1 || "No disponible"}</p>
                `;
                activityContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Error en actividades:", error);
        }
    }

    ccaaSelect.addEventListener("change", () => loadProvincias(ccaaSelect.value));
    provinciaSelect.addEventListener("change", () => loadPoblaciones(provinciaSelect.value));

    submitButton.addEventListener("click", async (event) => {
        event.preventDefault();
        const poblacion = poblacionSelect.value;
        if (poblacion) {
            fetchDescription(poblacion);
            fetchLocation(poblacion);
            fetchNearbyPlaces(poblacion);
            fetchNearbyActivities(poblacion);
        } else {
            alert("Por favor selecciona una población.");
        }
    });

    loadCCAA();
});
