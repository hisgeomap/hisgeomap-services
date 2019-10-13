import { createConnection, createQueryBuilder, getManager } from "typeorm";
import config from "../config";
import { countypts } from "../models/entities/countypts";
import { Place } from "../models/place";
import { prefecturepgn } from "../models/entities/prefecturepgn";
import { prefecturepts } from "../models/entities/prefecturepts";
// import { County, Prefecture, PrefecturePTS } from "../models/place";
export default class GeoInfoCollector {
    conn;
    repo;

    constructor() {
        GeoInfoCollector.connectToDatabase(conn => {
            this.conn = conn;

            this.repo = {
                countypts: conn.getRepository(countypts),
                prefecturepgn: conn.getRepository(prefecturepgn),
                prefecturepts: conn.getRepository(prefecturepts)
            };

            console.log("connected to the database");
        });
    }

    async getPlaces(year: number, zoom: number, bound) {
        return await Promise.all([
            Place.toGeoJSON(
                await countypts.get(this.repo.countypts, year, zoom, bound)
            ),
            Place.toGeoJSON(
                await prefecturepts.get(
                    this.repo.prefecturepts,
                    year,
                    zoom,
                    bound
                )
            ),
            Place.toGeoJSON([])
            // Place.toGeoJSON(
            //     await prefecturepgn.get(
            //         this.repo.prefecturepgn,
            //         year,
            //         zoom,
            //         bound
            //     )
            // )
        ]);
    }

    static connectToDatabase(callback: Function) {
        createConnection({
            type: "postgres",
            host: config.database.host,
            port: config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database,
            entities: [countypts, prefecturepgn, prefecturepts],
            synchronize: false,
            logging: false
        })
            .then(connection => {
                callback(connection);
            })
            .catch(error => {
                console.log(error);
                setTimeout(() => {
                    GeoInfoCollector.connectToDatabase(callback);
                }, 5000);
            });
    }
}
