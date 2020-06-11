import * as Koa from "koa";
import * as Router from "koa-router";
import * as bodyParser from "koa-bodyparser";
import * as cors from "@koa/cors";
import * as http from "http";
import * as fs from "fs";
import config from "./config";
import GeoJSONService from "./util/GeoJSONService";
import Search from "./db/search";

const { port, root, SSLport } = config.server;
const options = {
    key: fs.readFileSync(__dirname + "/../constants/server.key"),
    cert: fs.readFileSync(__dirname + "/../constants/server.crt"),
    passphrase: "hisgeomap776",
};

const search = new Search();

const createRouter = () => {
    const app = new Koa();
    const router = new Router();
    router.get(`${root}`, async (ctx) => {
        ctx.body = "Hello World!";
    });

    router.get(`${root}/geojson`, async (ctx) => {
        const getValue = (attr) => {
            const attrString = ctx.query[attr];
            if (attrString !== undefined) {
                return JSON.parse(attrString);
            }
            return undefined;
        };
        const config = {
            index: {
                index: ctx.query["index"],
                type: ctx.query["type"],
            },
            filter: getValue("filter"),
            sort: getValue("sort"),
            fields: getValue("fields"),
            aggregation: getValue("aggregation"),
            size: getValue("size"),
        };

        const result = await search.searchPlaces(config);

        ctx.body = new GeoJSONService().toGeoJSON(result);
    });

    router.get(`${root}/test`, async (ctx) => {
        ctx.body = "Hello World!";
    });

    router.post(`${root}/get-years-suggestion`, async (ctx: any) => {
        const { year } = ctx.request.body;
        ctx.body = {
            year: await search.getYearsAutoComplete(year),
        };
    });

    router.post(`${root}/get-years`, async (ctx: any) => {
        const { year } = ctx.request.body;
        ctx.body = {
            year: await search.getYears(year),
        };
    });

    router.post(`${root}/search-places`, async (ctx: any) => {
        const { place, year } = ctx.request.body;
        ctx.body = {
            places: await search.getPlaces(place, year),
        };
    });

    router.post(`${root}/search-places-suggestion`, async (ctx: any) => {
        const { place, year } = ctx.request.body;
        ctx.body = {
            places: await search.getPlacesAutoComplete(place, year),
        };
    });

    router.post(`${root}/search-places-year`, async (ctx: any) => {
        const { year, zoom, bound } = ctx.request.body;
        ctx.body = {
            places: await search.getPlacesByYear(year, zoom, bound),
        };
    });

    app.use(cors());
    app.use(bodyParser());
    app.use(router.routes());

    return app;
};

// HTTP 1 Config
const http1App = createRouter();
http.createServer(http1App.callback()).listen(port);
console.log(`HTTP 1 Server running on port ${port}.`);
