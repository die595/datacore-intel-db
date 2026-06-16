const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  //distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  productionBrowserSourceMaps: false,
  
  
  // 1. Movemos outputFileTracingRoot fuera de experimental (según la advertencia)
  //outputFileTracingRoot: path.join(__dirname, '../'),

  // 2. Agregamos esto para silenciar el error de Turbopack
  turbopack: {},

  // 3. ESLint y TypeScript se mueven a sus propios archivos de configuración (.eslintrc.json, tsconfig.json)
  // Eliminamos 'eslint' y 'typescript' de aquí para evitar errores.

  images: { unoptimized: true },

  // 4. Mantenemos tu configuración de Webpack, pero Turbopack la ignorará cuando esté activo
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.filename = 'static/chunks/[name]-[contenthash:8].js';
      config.output.chunkFilename = 'static/chunks/[contenthash:16].js';
    }
    return config;
  },
};

module.exports = nextConfig;