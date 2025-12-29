const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const setupSwagger = (app) => {
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API Gateway - سیستم کترینگ'
    }));
  } catch (error) {
    console.error('Failed to load Swagger documentation:', error.message);
  }
};

module.exports = setupSwagger;
