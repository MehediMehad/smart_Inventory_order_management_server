/* eslint no-undef: "off" */
import fs from 'fs';
import { getModulePaths } from './utils/helpers.js';
import routeTemplate from './templates/route.template.js';
import controllerTemplate from './templates/controller.template.js';
import serviceTemplate from './templates/service.template.js';
import constantsTemplate from './templates/constants.template.js';
import validationsTemplate from './templates/validation.template.js';
import interfaceTemplate from './templates/interface.template.js';

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('❌ Please provide a module name. Example: npm run generate:module Investor');
  process.exit(1);
}

const { baseDir, pascal, camel, lower } = getModulePaths(moduleName);

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
  console.log(`📁 Created: ${baseDir}`);
}

const files = [
  { name: `${camel}.route.ts`, content: routeTemplate({ pascal, camel, lower }) },
  { name: `${camel}.interface.ts`, content: interfaceTemplate({ pascal, camel }) },
  { name: `${camel}.controller.ts`, content: controllerTemplate({ pascal, camel }) },
  { name: `${camel}.service.ts`, content: serviceTemplate({ pascal, camel, lower }) },
  { name: `${camel}.constant.ts`, content: constantsTemplate({ pascal, camel, lower }) },
  { name: `${camel}.validation.ts`, content: validationsTemplate({ pascal, camel, lower }) },
];

files.forEach(({ name, content }) => {
  const filePath = `${baseDir}/${name}`;
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Created: ${filePath}`);
  } else {
    console.log(`⚠️ Skipped (already exists): ${filePath}`);
  }
});
