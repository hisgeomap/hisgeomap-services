import { Client } from "@elastic/elasticsearch";
import config from "../env.config";
import { TimeTranslator } from "../util/Time";
import assert = require("assert");
import { resolve } from "url";
import { sortSortedArrays, SortedHashMap } from "../util/Sort";

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
                                    source: `doc['endYear'].value - doc['startYear'].value + doc['from'].value >= ${
                                        timeTranslator.year
                                    }`,
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
                                must: year
                                    ? [
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
                                    : {
                                          match_phrase: {
                                              NAME_CH: place
                                          }
                                      }
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
