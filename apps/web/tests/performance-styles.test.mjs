import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {execFileSync} from 'node:child_process';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),postcss=require('postcss');
const root=fileURLToPath(new URL('../',import.meta.url)),temp=fs.mkdtempSync(path.join(os.tmpdir(),'bastion-performance-css-'));
try {
 const input=path.join(temp,'input.css'),output=path.join(temp,'output.css');fs.writeFileSync(input,'@tailwind utilities;');
 execFileSync(process.execPath,[require.resolve('tailwindcss/lib/cli.js'),'-c','tailwind.performance.config.ts','-i',input,'-o',output,'--minify'],{cwd:root,stdio:'pipe'});
 const css=postcss.parse(fs.readFileSync(output,'utf8'));let count=0;
 css.walkRules(rule=>{if(rule.parent.type==='atrule'&&rule.parent.name.includes('keyframes'))return;for(const selector of rule.selectors){assert.ok(selector.startsWith('#bastion-performance '),'Unscoped rule may break app navigation: '+selector);count++;}});
 assert.ok(count>30);const component=fs.readFileSync(path.join(root,'src/pages/UserAdmin/app/ChartDashboard.tsx'),'utf8');assert.match(component,/id="bastion-performance"/);
 console.log('Dashboard supplemental CSS is scoped; global navigation cannot be overridden.');
} finally {fs.rmSync(temp,{recursive:true,force:true});}
