import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Manually recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toPascal = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toCamel = (str) => str.charAt(0).toLowerCase() + str.slice(1);

const getModulePaths = (moduleName) => {
  const pascal = toPascal(moduleName);
  return {
    baseDir: path.join(__dirname, '..', '..', 'src/app/modules', pascal).toLowerCase(),
    pascal,
    camel: toCamel(moduleName),
    lower: moduleName.toLowerCase(),
    upper: moduleName.toUpperCase(),
  };
};

export { getModulePaths, toPascal, toCamel };
