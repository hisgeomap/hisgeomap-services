import { Client } from "@elastic/elasticsearch";
import config from "../config";
import { TimeTranslator } from "../util/Time";
import { sortSortedArrays, SortedHashMap } from "../util/Sort";
import ConditionFormulaService from "../util/ConditionFormulaService";

interface SearchConfig {
    index: any;
    filter: any;
    sort: any;
    fields: any;
    aggregation: any;
    size: number;
}
export default class Search {
    client;

    constructor() {
        this.client = new Client({ node: config.search.host });
    }

    async getYearsAutoComplete(yearString: string) {
        const timeTranslator = new TimeTranslator(yearString.replace(" ", ""));
        const results = await this.client.search({
            index: "his",
            type: "year",
            body: {
                size: 25,
                query: {
                    bool: {
                        must: [{ match: { prefix: timeTranslator.prefix } }],
                        filter: {
                            script: {
                                script: {
                                    source: `doc['endYear'].value - doc['startYear'].value + doc['from'].value >= ${timeTranslator.year}`,
                                    lang: "painless"
                                }
                            }
                        }
                    }
                },
                sort: [{ _score: { order: "desc" } }]
            }
        });

        return {
            offset: timeTranslator.year,
            results: results.body.hits.hits.map(e => ({
                text: TimeTranslator.translate(
                    e._source.prefix,
                    timeTranslator.year - 1,
                    1
                ),
                ...e._source
            }))
        };
    }

    async getYears(year) {
        if (year == 0) {
            return null;
        }
        const results = await this.client.search({
            index: "his",
            type: "year",
            body: {
                query: {
                    bool: {
                        filter: [
                            {
                                range: {
                                    startYear: { lte: year }
                                }
                            },
                            {
                                range: {
                                    endYear: { gte: year }
                                }
                            }
                        ]
                    }
                }
            }
        });

        return {
            offset: year,
            results: results.body.hits.hits.map(e => ({
                text: TimeTranslator.translate(
                    e._source.prefix,
                    TimeTranslator.sub(year, e._source.startYear),
                    e._source.from
                ),
                ...e._source
            }))
        };
    }

    async searchPlaces(config: SearchConfig) {
        const { index, filter, fields, sort, aggregation, size } = config;
        const filterObj = new ConditionFormulaService().translate(filter);
        const query = {
            index: index.index,
            type: index.type,
            body: {
                size,
                query: {
                    bool: {
                        filter: filterObj
                    }
                }
            }
        };

        const data = (await this.client.search(query)).body.hits.hits;
        const result = data.map(e => {
            const preset = {
                _score: e._score,
                _index: e._index,
                _type: e._type,
                _id: e._id
            };
            if (fields) {
                return fields.reduce((prev, cur) => {
                    if (preset[cur] !== undefined) {
                        prev[cur] = preset[cur];
                    } else {
                        prev[cur] = e._source[cur];
                    }

                    return prev;
                }, {});
            } else {
                return { ...e._source, ...preset };
            }
        });
        return result;
    }

    async getPlaces(place, year) {
        const client = this.client;
        return await Promise.all([
            generatePromise("prefecturepts"),
            generatePromise("countypts")
        ]).then(values => {
            return {
                results: sortSortedArrays(values, (a, b) => a._score > b._score)
            };
        });

        function generatePromise(name) {
            return new Promise(async (resolve, reject) => {
                const results = await client.search({
                    index: name,
                    body: {
                        size: 25,
                        query: {
                            bool: {
                                must: [
                                    {
                                        match_phrase: {
                                            NAME_CH: place
                                        }
                                    },
                                    {
                                        range: {
                                            BEG_YR: { lte: year }
                                        }
                                    },
                                    {
                                        range: {
                                            END_YR: { gte: year }
                                        }
                                    }
                                ]
                            }
                        },
                        sort: [
                            {
                                BEG_YR: {
                                    order: "asc"
                                }
                            }
                        ]
                    }
                });

                resolve(results.body.hits.hits);
            });
        }
    }

    async getPlacesByYear(year: number, zoom: number, bound) {
        const client = this.client;

        const toGeoJSON = (places: any[]) => {
            const map = {
                POINT: "Point",
                multipolygon: "MultiPolygon",
                polygon: "Polygon"
            };
            return {
                type: "FeatureCollection",
                features: places.map(place => {
                    const geom = place._source.geometry;
                    geom.type = map[geom.type] ? map[geom.type] : geom.type;
                    return {
                        type: "Feature",
                        properties: {
                            name_ch: place._source.NAME_CH,
                            x_coor: place._source.X_COOR,
                            y_coor: place._source.Y_COOR
                        },
                        geometry: geom
                    };
                })
            };
        };

        const results = await client.search({
            index: "prefecturepts,countypts,prefecturepgn",
            body: {
                size: 10000,
                query: {
                    bool: {
                        must: [
                            {
                                range: {
                                    BEG_YR: { lte: year }
                                }
                            },
                            {
                                range: {
                                    END_YR: { gte: year }
                                }
                            }
                        ]
                    }
                }
            }
        });

        return toGeoJSON(results.body.hits.hits);
    }

    async getPlacesAutoComplete(place, year) {
        place = place.replace(" ", "");
        const client = this.client;
        return await Promise.all([
            generatePromise("prefecturepts"),
            generatePromise("countypts")
        ]).then(values => {
            return {
                results: new SortedHashMap(
                    values,
                    e => e._source.NAME_CH,
                    (a, b) => a._score > b._score,
                    20
                ).data
            };
        });

        function generatePromise(name) {
            return new Promise(async (resolve, reject) => {
                const results = await client.search({
                    index: name,
                    body: {
                        size: 20,
                        query: {
                            bool: {
                                must: year
                                    ? [
                                          {
                                              range: {
                                                  BEG_YR: { lte: year }
                                              }
                                          },
                                          {
                                              range: {
                                                  END_YR: { gte: year }
                                              }
                                          }
                                      ]
                                    : [],
                                should: [
                                    {
                                        match_phrase: {
                                            NAME_CH: place
                                        }
                                    },
                                    {
                                        match_phrase: {
                                            NAME_FT: place
                                        }
                                    },
                                    {
                                        match: {
                                            NAME_PY: place
                                        }
                                    }
                                ]
                            }
                        }
                    }
                });

                resolve(results.body.hits.hits);
            });
        }
    }
}
