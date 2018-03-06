const mappedPos = new Map();
const calcDistance = function ({ from, coords = { latitude: -25.4639371, longitude: -49.300210899999996 } }) {
    const R = 6371e3;
    const φ1 = from.latitude * (Math.PI / 180);
    const φ2 = coords.latitude * (Math.PI / 180);
    const Δφ = (coords.latitude - from.latitude) * (Math.PI / 180);
    const Δλ = (coords.longitude - from.longitude) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function postPosition({ id, position }) {
    fetch('/position', {
        method: 'POST',
        body: JSON.stringify({
            id,
            position
        })
    });
    return 'Position sent';
}

function postPresence(id) {
    fetch('/presence', {
        method: 'POST',
        body: JSON.stringify({
            id
        })
    });

    return 'Presence sent';
}

function push({ id, position }) {
    mappedPos.set(id, position);
    return 'Sucess adding';
}

const methods = {
    distance: (values) => {        
        return [...mappedPos].map(e => calcDistance({ from: values.from, coords: e[1] }));
    },
    postPosition,
    postPresence,
    push
}

self.onmessage = function (e) {
    const data = JSON.parse(e.data);
    const result = methods[data.func](data.value);

    postMessage(JSON.stringify({ func: data.func, value: result }));
}