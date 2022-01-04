
const yaml = require('js-yaml')
const url = require('url')
const fs = require("fs")
const fetchSchema = require("./fetch-schema")
const composePaths = require("./compose-paths")

module.exports = function (specPath, headers, introspectionUrl) {
    // read spec file content
    const fileContent = fs.readFileSync(specPath, "utf8")
    // deserialise
    const spec = yaml.safeLoad(fileContent)
    // fetch graphQL Schema, if given an introspection url use that over the value in
    // the spec
    const graphUrl = introspectionUrl ? introspectionUrl : spec.introspection
    const { graphQLSchema, jsonSchema } = fetchSchema(graphUrl, headers)

    // Remove unnecessary key
    spec.schema.except.forEach(key => delete jsonSchema.definitions[key]);

    // parse URL
    const parsedUrl = url.parse(graphUrl)
    // generate specification
    const swaggerSpec = {
        openapi: '3.0.0',
        info: spec.info,
        servers: spec.servers,
        host: parsedUrl.host,
        schemes: [parsedUrl.protocol.slice(0, -1)],
        basePath: parsedUrl.pathname,
        externalDocs: spec.externalDocs,
        tags: spec.domains.map(_ => ({
            name: _.name,
            description: _.description,
            diagram_image_name: _.diagram_image_name,
            sections: _.sections,
            externalDocs: _.externalDocs
        })),
        paths: composePaths(spec.domains, graphQLSchema),
        securityDefinitions: spec.securityDefinitions,
        definitions: jsonSchema.definitions
    }

    return swaggerSpec
}