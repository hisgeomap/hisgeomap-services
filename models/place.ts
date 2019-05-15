import { LessThanOrEqual, MoreThanOrEqual, Between, getManager } from "typeorm";

export abstract class Place {
    y_coor: number | null;
    x_coor: number | null;
    name_ch: string | null;
    geom: string | null;

    static async get(repo, year, zoom, bound): Promise<Place[]> {
        return await repo.find({
            select: ["x_coor", "geom", "y_coor", "name_ch"],
            where: {
                beg_yr: LessThanOrEqual(year),
                end_yr: MoreThanOrEqual(year)
            }
        });
    }

    static toGeoJSON(places: Place[]) {
        return {
            type: "FeatureCollection",
            features: places.map(place => ({
                type: "Feature",
                properties: {
                    name_ch: place.name_ch,
                    x_coor: place.x_coor,
                    y_coor: place.y_coor,
                },
                geometry: place.geom
            }))
        };
    }
}
export class countyptsImp extends Place {}

export class prefcturepgnImp extends Place {}

export class prefctureptsImp extends Place {}
