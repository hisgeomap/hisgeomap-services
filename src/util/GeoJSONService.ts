export default class GeoJSONService {
    toGeoJSON = (places: any[]) => {
        const map = {
            POINT: "Point",
            multipolygon: "MultiPolygon",
            polygon: "Polygon"
        };
        return {
            type: "FeatureCollection",
            features: places.map(place => {
                const { geometry, ...properties } = place;
                geometry.type = map[geometry.type]
                    ? map[geometry.type]
                    : geometry.type;
                return {
                    type: "Feature",
                    properties,
                    geometry
                };
            })
        };
    };
}
