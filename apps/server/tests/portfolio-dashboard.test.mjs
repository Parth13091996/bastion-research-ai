import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), ts=require('typescript');
function load(file, axios) {
 const source=ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 const m={exports:{}};new Function('module','exports','require',source)(m,m.exports,s=>s==='axios'?axios:require(s));return m.exports;
}
let calls=0, fail=false;
const table={rows:[29,12,4,13,null,null,null,0.09600992608499154,0.040819645059963904].map(v=>({c:[{v}]}))};
const response='/*O_o*/\ngoogle.visualization.Query.setResponse('+JSON.stringify({status:'ok',table})+');';
const sheet=load('../src/utils/portfolioDashboardSheet.ts',{get:async(url)=>{calls++;await new Promise(r=>setTimeout(r,5));if(fail)throw Error('offline');const row=Number(new URL(url).searchParams.get('range').slice(1))-35;return {data:'google.visualization.Query.setResponse('+JSON.stringify({status:'ok',table:{rows:[table.rows[row]]}})+');'};}});
const expected={totalRecommendations:29,activeBuy:12,activeHold:4,exitedClosed:13,recommendedStocksXirr:0.09600992608499154,nifty500Xirr:0.040819645059963904};
assert.deepEqual(sheet.mapPortfolioDashboardCells(sheet.parsePortfolioSheetResponse(response)),expected);
const altered=structuredClone(table);altered.rows[0].c[0].v=0;altered.rows[1].c[0].v=-1;altered.rows[2].c[0].v=2.5;altered.rows[3].c[0].v='';altered.rows[7].c[0].v='-9.60%';altered.rows[8].c[0].v='0%';
assert.deepEqual(sheet.mapPortfolioDashboardCells(altered),{totalRecommendations:0,activeBuy:null,activeHold:null,exitedClosed:null,recommendedStocksXirr:-0.096,nifty500Xirr:0});
assert.equal(sheet.mapPortfolioDashboardCells({rows:[]}).recommendedStocksXirr,null);
assert.throws(()=>sheet.parsePortfolioSheetResponse('login html'));
assert.throws(()=>sheet.parsePortfolioSheetResponse('google.visualization.Query.setResponse({"status":"error"});'));
for(const url of ['https://docs.google.com/spreadsheets/d/test/edit?gid=123','https://docs.google.com/spreadsheets/d/test/edit#gid=123']) {
 const target=new URL(sheet.portfolioDashboardUrl(url));assert.equal(target.searchParams.get('gid'),'123');assert.equal(target.searchParams.get('headers'),'0');assert.equal(target.searchParams.get('range'),'B35');
}
assert.equal(new URL(sheet.portfolioDashboardUrl('https://docs.google.com/spreadsheets/d/test/edit')).searchParams.get('sheet'),'Dashboard');
assert.throws(()=>sheet.portfolioDashboardUrl('https://example.com/spreadsheets/d/test/edit'));
const url='https://docs.google.com/spreadsheets/d/test/edit?gid=123';
assert.deepEqual(await Promise.all([sheet.fetchPortfolioDashboard(url),sheet.fetchPortfolioDashboard(url)]),[expected,expected]);assert.equal(calls,6);
await sheet.fetchPortfolioDashboard(url);assert.equal(calls,6);
fail=true;await assert.rejects(sheet.fetchPortfolioDashboard(url+'4'));fail=false;await sheet.fetchPortfolioDashboard(url+'4');assert.equal(calls,18);
const chart=load('../../web/src/pages/UserAdmin/app/portfolio-chart.ts');
for(const values of [[.096,.04],[-.1,.04],[-.1,-.04],[0,0],[null,null]]) {
 const axis=chart.xirrAxis(values);assert.ok(axis.min<=0&&axis.max>axis.min&&axis.max>=0);assert.ok(axis.ticks.some(t=>Math.abs(t)<1e-9));for(const v of values)if(v!==null)assert.ok(axis.min<=v*100&&axis.max>=v*100);
}
assert.equal(chart.formatXirr(.096009926),'9.60%');assert.equal(chart.formatXirr(0),'0.00%');assert.equal(chart.formatXirr(null),'Not available');assert.equal(chart.formatXirr(-.1),'-10.00%');
console.log('Portfolio dashboard checks passed: exact cells, blanks, percentages, URLs, caching, retries and chart axes.');
