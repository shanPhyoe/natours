export const displayMap = locations => {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoic2hhbnBoeW9lIiwiYSI6ImNsNDZ3aWdhNTBja20zY3IzZzN2eno2Y3cifQ.e6VGG3Ldf8jB0xJui6wJBw';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/shanphyoe/cl46x0dbx002016op6teckh10',
        scrollZoom: false,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        new mapboxgl.Popup({
            offset: 30,
            closeOnMove: false,
            closeOnClick: false,
            focusAfterOpen: false,
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    });
};
