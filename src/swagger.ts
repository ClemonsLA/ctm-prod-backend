//import swaggerJSDoc from "swagger-jsdoc"
//import swaggerAutogen from 'swagger-autogen';
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' })


const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CTM API Docs",
            version: "1.0.0",
            description:
                "CTM all endpoints"
        },
        servers: [
            {
                url: `http://localhost:8080`,
                description: 'Development server'
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['id', 'name'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'The id of user'
                        },
                        name: {
                            type: 'string',
                            description: 'The name of user'
                        },
                    },
                    example: {
                        id: 12,
                        name: "Robert"
                    }
                },
                Listing: {

                }
            },
            responses: {
                400: {
                    description: 'Missing API key - include it in the Authorization header',
                    contents: 'application/json'
                },
                401: {
                    description: 'Unauthorized - incorrect API key or incorrect format',
                    contents: 'application/json'
                },
                404: {
                    description: 'Not found - the book was not found',
                    contents: 'application/json'
                }
            },
            securityDefinitions: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                },
            },
        },
        security: [{
            ApiKeyAuth: []
        }]

    },
    apis: ["src/routes/*.ts"],
}
//const swaggerDocs = swaggerJSDoc(swaggerOptions)



//export { swaggerDocs }



const doc = {
    info: {
        title: "CTM API Docs",
        version: "1.0.1",
        description:
            "CTM all endpoints"
    },
    servers: [
        {
            url: `http://localhost:8080`,
            description: 'Development server'
        },

    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            },
        },
    },
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

//swaggerAutogen(outputFile, endpointsFiles, doc);

