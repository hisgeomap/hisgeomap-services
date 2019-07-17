import * as Koa from "koa";
import * as Router from "koa-router";
import * as bodyParser from "koa-bodyparser";
import * as compress from "koa-compress";
import * as cors from "@koa/cors";

import config from "./env.config";
import Database from "./db/database";
import Search from "./db/search";
import { clearInterval } from "timers";

const app = new Koa();
const router = new Router();
const { port, root } = config.server;
const db = new Database();

const search = new Search();

router.get(`${root}/test`, async ctx => {
    ctx.body = "Hello World!";
});

router.post(`${root}/get-places`, async ctx => {
    const { year, zoom, bound } = ctx.request.body;
    const places = await db.getPlaces(year, zoom, bound);
    ctx.compress = true;
    ctx.body = {
        prefecturePTS: places[1],
        prefecturePGN: places[2],
        countyPTS: places[0]
    };
});

router.post(`${root}/get-years-suggestion`, async ctx => {
    const { year } = ctx.request.body;
    ctx.body = {
        year: await search.getYearsAutoComplete(year)
    };
});

router.post(`${root}/get-years`, async ctx => {
    const { year } = ctx.request.body;
    ctx.body = {
        year: await search.getYears(year)
    };
});

router.post(`${root}/search-places`, async ctx => {
    const { place, year } = ctx.request.body;
    ctx.body = {
        places: await search.getPlaces(place, year)
    };
});

router.post(`${root}/search-places-suggestion`, async ctx => {
    const { place, year } = ctx.request.body;
    ctx.body = {
        places: await search.getPlacesAutoComplete(place, year)
    };
});

app.use(cors());
app.use(bodyParser());
app.use(
    compress({
        filter: function(content_type) {
            return /text/i.test(content_type);
        },
        threshold: 2048,
        flush: require("zlib").Z_SYNC_FLUSH
    })
);
app.use(router.routes());

app.listen(port);

console.log(`Server running on port ${port}`);
