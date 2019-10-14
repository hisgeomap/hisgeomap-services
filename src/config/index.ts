const config =
    process.env.NODE_ENV === "production"
        ? {
              search: {
                  host: "http://search:9200"
              },
              server: {
                  SSLport: 8082,
                  port: 8083,
                  root: "/api"
              }
          }
        : {
              search: {
                  host: "http://localhost:9200"
              },
              server: {
                  SSLport: 8082,
                  port: 8083,
                  root: "/api"
              }
          };

export default config;
