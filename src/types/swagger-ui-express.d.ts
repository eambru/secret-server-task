declare module 'swagger-ui-express' {
    import { RequestHandler } from 'express';
  
    const swaggerUi: {
      serve: RequestHandler;
      setup: (spec: any, options?: any) => RequestHandler;
    };
  
    export default swaggerUi;
  }