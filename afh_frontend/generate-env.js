const fs = require("fs");
const path = require("path");

// Ruta correcta al environment.ts
const targetPath = path.join(
  __dirname,
  "./src/app/environments/environment.ts"
);

// Construir el contenido con las variables de entorno de Docker
const envConfig = `
export const environment = {
  production: true,
  API_URL: '${process.env.API_URL || 'http://72.60.125.23:8000/'}',
  API_KEY: '${process.env.API_KEY || ''}',
  APP_KEY: '${process.env.APP_KEY || ''}',
  CLUSTER: '${process.env.CLUSTER || ''}'
};
`;

// Escribir el archivo
fs.writeFileSync(targetPath, envConfig);

console.log("✅ environment.ts generado con las variables de entorno.");
