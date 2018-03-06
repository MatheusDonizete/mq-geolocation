'use strict';

const id = Math.random();
const lat = document.getElementById('lat');
const lon = document.getElementById('lon');
const dist = document.getElementById('dist');

function handlers(fct, value) {
    const data = {
        distance: () => {
            console.log(value)
            dist.innerHTML = `${value} m`;
        }
    }
    return data[fct] || (() => { });
}

const worker = new Worker('workers/worker.js');
worker.onmessage = function (evt) {
    const data = JSON.parse(evt.data);
    handlers(data.func, data.value)();
}

const erroFn = err => console.warn('ERROR(' + err.code + '): ' + err.message);
const sucess = coords => {
    lat.innerHTML = coords.latitude;
    lon.innerHTML = coords.longitude;
    worker.postMessage(JSON.stringify({
        func: 'distance',
        value: {
            from: {
                latitude: coords.latitude, longitude: coords.longitude
            }
        }
    }));
};

function listenSockets() {
    const currentSocket = new WebSocket(`wss://localhost/ws/location`, 'echo_protocol');

    currentSocket.onerror = function (ev) {
        console.error(ev);
        setTimeout(listenSockets, 0);
    };

    currentSocket.onmessage = function (ev) {
        const incoming = JSON.parse(ev.data);
        if (incoming.id !== id) {
            worker.postMessage(JSON.stringify({
                func: 'push', value: {
                    position: incoming.position,
                    id: incoming.id
                }
            }));
        }
    };
}

function callGeoAPI() {
    let geoId;

    navigator.geolocation.getCurrentPosition(function (position) {
        sucess(position.coords);
    });

    geoId = navigator.geolocation.watchPosition(function (position) {
        sucess(position.coords);
        worker.postMessage(JSON.stringify({
            func: 'postPosition', value: {
                position: {
                    latitude: position.coords.latitude, longitude: position.coords.longitude
                }, id
            }
        }));
        // navigator.geolocation.clearWatch(geoId);
    }, erroFn, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
}

if ('geolocation' in navigator) {
    callGeoAPI();
    worker.postMessage(JSON.stringify({ func: 'postPresence', value: id }));
    listenSockets();
} else {
    document.body.innerHTML = 'Não tem geo';
}