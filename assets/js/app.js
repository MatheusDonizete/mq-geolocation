'use strict';

const id = Math.random();
const calcDistance = function(coords){
    const R = 6371e3;
    const φ1 = houseCoords.latitude * (Math.PI / 180);
    const φ2 = coords.latitude * (Math.PI / 180);
    const Δφ = (coords.latitude - houseCoords.latitude) * (Math.PI / 180);
    const Δλ = (coords.longitude - houseCoords.longitude) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function postPosition(position){
    return fetch('/position', { 
        method: 'POST',
        body: JSON.stringify({
            id,
            position
        })
    });
}

function postPresence(position){
    return fetch('/presence', { 
        method: 'POST',
        body: JSON.stringify({
            id
        })
    });
}

const lat = document.getElementById('lat');
const lon = document.getElementById('lon');
const dist = document.getElementById('dist');
const erroFn = err => console.warn('ERROR(' + err.code + '): ' + err.message);
const sucess = coords => {
    console.log(coords.latitude, coords.longitude);
    lat.innerHTML = coords.latitude;
    lon.innerHTML = coords.longitude;
    dist.innerHTML = `${calcDistance(coords)} m`;
};

function listenSockets() {    
    const currentSocket = new WebSocket(`https://localhost:1880/ws/position`, 'echo_protocol');
    
    currentSocket.onerror = function (ev) {
        console.error(ev);
    };

    currentSocket.onmessage = function (ev) {
        debugger
        const incoming = JSON.parse(ev.data);
        console.log(incoming);
    };
}

function callGeoAPI() {
    let id;

    navigator.geolocation.getCurrentPosition(function (position) {
        sucess(position.coords);
    });

    id = navigator.geolocation.watchPosition(function (position) {
        sucess(position.coords);
        postPosition(position.coords);
        //navigator.geolocation.clearWatch(id);
    }, erroFn, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
}

if ('geolocation' in navigator) {
    callGeoAPI();
    postPresence();
} else {
    document.body.innerHTML = "Não tem geo"
}