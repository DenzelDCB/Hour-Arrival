const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaG91ci1hcnJpdmFsIiwiYSI6ImNtOWdiMDR3MDF6MGgyanB2aXZ3cHVmOW4ifQ.q8ud6cqcax1bRTLNXSd3hg';
const OPENCAGE_API_KEY = '7c357094c06042b298bd37be8c620978';


if (!sessionStorage.getItem("user")) {
    alert("You must be logged in to access this page.");
    window.location.href = "home.html";
}

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hour-arrival/cm9n8otaa001q01qvbkrg6xe0',
    center: [83.9956, 28.2380],
    zoom: 11
});

map.addControl(new mapboxgl.NavigationControl());

let busMarker = null;
let userLocation = null;
let schoolLocation = null;

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            userLocation = [longitude, latitude];
            map.setCenter(userLocation);
            new mapboxgl.Marker({ color: 'blue' })
                .setLngLat(userLocation)
                .setPopup(new mapboxgl.Popup().setText('You are here'))
                .addTo(map);

            const randomBusLocation = getRandomLocationNearby(latitude, longitude, 0.5);
            busMarker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat([randomBusLocation.lng, randomBusLocation.lat])
                .addTo(map);
        },
        (error) => {
            console.error('Error getting user location:', error);
        }
    );
} else {
    console.error('Geolocation is not supported by this browser.');
}

function getRandomLocationNearby(lat, lng, radius) {
    const randomOffset = () => (Math.random() - 0.5) * (radius / 111);
    return { lat: lat + randomOffset(), lng: lng + randomOffset() };
}

async function fetchBusLocation(bus_id) {
    try {
        const response = await fetch(`https://192.168.0.28:3000/get-bus-location/${bus_id}`); // Changed http:// to https://
        if (!response.ok) throw new Error('Failed to fetch bus location');
        const { latitude, longitude } = await response.json();
        return [longitude, latitude];
    } catch (error) {
        console.error('Error fetching bus location:', error);
        return null;
    }
}

async function moveBus(bus_id) {
    try {
        const location = await fetchBusLocation(bus_id);
        if (location && busMarker) {
            busMarker.setLngLat(location);
        }
    } catch (error) {
        console.error('Error moving bus:', error);
    }
}


const busIds = ['6109'];


function updateBusLocations() {
    busIds.forEach(bus_id => {
        moveBus(bus_id);
    });
}

setInterval(updateBusLocations, 1000);

document.getElementById('school').addEventListener('change', async () => {
    const schoolName = document.getElementById('school').value;
    if (schoolName) {
        const url = `http://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(schoolName)}&key=${OPENCAGE_API_KEY}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch location data');
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry;
                schoolLocation = [lng, lat];

                new mapboxgl.Marker({ color: 'green' })
                    .setLngLat(schoolLocation)
                    .setPopup(new mapboxgl.Popup().setText('School Location'))
                    .addTo(map);

                if (userLocation) {
                    const route = await fetchRoute(userLocation, schoolLocation);
                    if (route) {
                        displayRoute(route);
                    }
                }
            } else {
                alert('No results found for the entered school name.');
            }
        } catch (error) {
            console.error('Error fetching school location:', error);
        }
    }
});

async function fetchRoute(start, end) {
    const url = `http://api.mapbox.com/directions/v5/mapbox/driving/${start.join(',')};${end.join(',')}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch route');
        const data = await response.json();
        return data.routes[0].geometry.coordinates;
    } catch (error) {
        console.error('Error fetching route:', error);
        return null;
    }
}

function displayRoute(routeCoordinates) {
    if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
    }z

    map.addSource('route', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
            }
        }
    });

    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#ff0000',
            'line-width': 4
        }
    });

    let index = 0;
    function animateBus() {
        if (index < routeCoordinates.length) {
            const [lng, lat] = routeCoordinates[index];
            busMarker.setLngLat([lng, lat]);
            index++;
            setTimeout(animateBus, 100);
        }
    }
    animateBus();
}