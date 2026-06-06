import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Budget App API",
      version: "1.0.0",
      description: "API aplikacji do zarządzania finansami osobistymi z modułem doradztwa finansowego opartym na LLM",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            amount: { type: "number" },
            type: { type: "string", enum: ["income", "expense"] },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            categoryId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            name: { type: "string" },
            icon: { type: "string" },
            color: { type: "string" },
            type: { type: "string", enum: ["income", "expense"] },
            isProtected: { type: "boolean" },
          },
        },
        Budget: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            categoryId: { type: "string" },
            amount: { type: "number" },
            month: { type: "integer" },
            year: { type: "integer" },
          },
        },
        Goal: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            name: { type: "string" },
            targetAmount: { type: "number" },
            currentAmount: { type: "number" },
            deadline: { type: "string", format: "date" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/modules/*/*.router.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);