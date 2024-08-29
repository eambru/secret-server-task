declare module 'swagger-jsdoc' {
    import { OpenAPIObject } from 'openapi3-ts';
  
    interface SwaggerJsdocOptions {
      definition: OpenAPIObject;
      apis: string | string[];
    }
  
    function swaggerJsdoc(options: SwaggerJsdocOptions): OpenAPIObject;
  
    export default swaggerJsdoc;
  }