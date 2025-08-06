const fs = require("fs");
const path = require("path");

// Ruta correcta al environment.ts
const targetPath = path.join(
  __dirname,
  "./src/app/environments/environment.ts"
);

// Construir el contenido con las variables de Vercel
const envConfig = `
export const environment = {
  production: true,
  API_URL: '${process.env.NG_APP_API_URL}',
  API_KEY: '${process.env.NG_APP_API_KEY}',
  APP_KEY: '${process.env.NG_APP_APP_KEY}',
  CLUSTER: '${process.env.NG_APP_CLUSTER}'
};
`;

// Escribir el archivo
fs.writeFileSync(targetPath, envConfig);

console.log("✅ environment.ts generado con las variables de entorno.");
