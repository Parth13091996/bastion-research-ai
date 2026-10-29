import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const ts=require('typescript');
async function load(entry,shims={}){
 const cache=new Map();
 function evaluate(source,filename){
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  const m={exports:{}};
  const localRequire=(specifier)=>{
   if(shims[specifier])return evaluate(shims[specifier],filename+'-mock');
   if(specifier.startsWith('.')){
    let target=path.resolve(path.dirname(filename),specifier);
    if(fs.existsSync(target+'.ts'))target+='.ts';else target=path.join(target,'index.ts');
    if(!cache.has(target))cache.set(target,evaluate(fs.readFileSync(target,'utf8'),target));
    return cache.get(target);
   }
   return require(specifier);
  };
  new Function('module','exports','require',output)(m,m.exports,localRequire);return m.exports;
 }
 return evaluate(fs.readFileSync(entry,'utf8'),path.resolve(entry));
}
const root=fileURLToPath(new URL('../src/',import.meta.url));
const dates=await load(root+'utils/reminder-date.ts');
const configUtils=await load(root+'utils/subscription-reminder-config.ts');
globalThis.currentReminderCampaigns=configUtils.resolveReminderCampaigns();
assert.equal(dates.reminderDate(new Date('2026-10-29T18:30:00Z')),'2026-10-30');
assert.equal(dates.reminderDate(new Date('2026-10-29T18:29:59Z'),7),'2026-11-05');
assert.equal(dates.reminderDayDifference('2026-11-06',new Date('2026-10-29T18:30:00Z')),7);
assert.equal(dates.reminderDayDifference('2026-02-30'),null);
let request;
globalThis.testAxios={post:async(url,body)=>{request=body;return {data:{status:'success'}}}};
const api=await load(root+'services/aisensy.service.ts',{'axios':'export default globalThis.testAxios'});
process.env.AISENSY_API_KEY='synthetic-test-key';
await api.sendAiSensyCampaign({destination:'+91 (98765) 43210',userName:'Test Member',campaignName:'test',source:'subscription-expiry-reminder',templateParams:['Test','Date']});
assert.equal(request.userName,'Test Member');assert.equal(request.destination,'+919876543210');assert.deepEqual(request.templateParams,['Test','Date']);
await api.sendAiSensyCampaign({destination:'9876543210',userName:'Test',campaignName:'unrelated',templateParams:['Existing']});
assert.deepEqual(request.templateParams,['Existing','N/A','N/A']);
globalThis.testAxios.post=async()=>({data:{success:false}});
assert.equal((await api.sendAiSensyCampaign({destination:'9876543210',userName:'Test',campaignName:'test',source:'subscription-expiry-reminder'})).sent,false);
globalThis.testAxios.post=async()=>({data:{success:'false'}});
assert.equal((await api.sendAiSensyCampaign({destination:'9876543210',userName:'Test',campaignName:'test',source:'subscription-expiry-reminder'})).sent,false);
delete process.env.AISENSY_API_KEY;
assert.equal((await api.sendAiSensyCampaign({destination:'9876543210',userName:'Test',campaignName:'test'})).sent,false);
let record=null,lookupError=false,waCalls=0,emailCalls=0,waSuccess=true,emailFail=false,holdResolve;
globalThis.testDb={from:()=>{
 let op='read',data;
 const q={select(){return q},eq(){return q},insert(d){op='insert';data=d;return q},update(d){op='update';data=d;return q},
 maybeSingle:async()=>({data:record,error:lookupError?{message:'unavailable'}:null}),
 single:async()=>{record={id:'synthetic-log',...data};return {data:record,error:null}},
 then(resolve,reject){if(op==='update')record={...record,...data};return Promise.resolve({data:record,error:null}).then(resolve,reject)}};return q;
}};
globalThis.testSend=async()=>{waCalls++;if(holdResolve)await new Promise(r=>holdResolve.release=r);return {sent:waSuccess,skipped:false}};
globalThis.testEmail=async()=>{emailCalls++;if(emailFail)throw Error('Synthetic SMTP failure')};
const controller=await load(root+'controllers/subscription-whatsapp.controller.ts',{
 '../supabase':'export const supabase=globalThis.testDb',
 '../services/subscription-reminder-settings.service':'export const getSubscriptionReminderCampaigns=async()=>globalThis.currentReminderCampaigns',
 '../services/aisensy.service':'export const sendAiSensyCampaign=(...args)=>globalThis.testSend(...args)',
 '../services/emailNotification.service':'export const sendSubscriptionRenewalReminderEmail=(...args)=>globalThis.testEmail(...args)',
});
const user={id:'synthetic-member',first_name:'Test',email:'test@example.invalid',phone:'9876543210',subscription_end_date:'2026-11-06'};
const send=()=>controller.sendReminderForUser(user,'one_week_before','Bastion CORE Renewal Reminder #1');
process.env.NODE_ENV='development';await assert.rejects(send,/disabled outside production/);assert.equal(waCalls,0);
process.env.NODE_ENV='production';
waSuccess=false;await send();assert.equal(record.whatsapp_sent,false);assert.equal(record.email_sent,true);
waSuccess=true;await send();assert.equal(waCalls,2);assert.equal(emailCalls,1);assert.equal(record.whatsapp_sent,true);
await send();assert.equal(waCalls,2);assert.equal(emailCalls,1);
record=null;waCalls=emailCalls=0;emailFail=true;
let result=await send();assert.equal(result.emailSent,false);assert.equal(record.whatsapp_sent,true);assert.equal(record.email_sent,false);
emailFail=false;await send();assert.equal(waCalls,1);assert.equal(emailCalls,2);assert.equal(record.email_sent,true);
record=null;lookupError=true;waCalls=emailCalls=0;await assert.rejects(send,/Cannot verify reminder history/);assert.equal(waCalls,0);assert.equal(emailCalls,0);
lookupError=false;holdResolve={};const pending=send();
while(!holdResolve.release)await new Promise(r=>setTimeout(r,1));
await assert.rejects(send,/already in progress/);holdResolve.release();await pending;holdResolve=null;
console.log('Reminder regression checks passed: India dates, exact AiSensy parameters, recipient name, missing key, non-production guard, failed WhatsApp retry, email-only retry, completed-delivery dedupe, log failure and concurrent-call guard. No network messages were sent.');
let scheduleLog=null,attempts=0,lastTarget,lastStoredRole;
globalThis.scheduleDb={from:table=>{
 const q={select(){return q},eq(field,value){if(table==='users'&&field==='subscription_end_date')lastTarget=value;if(table==='users'&&field==='role')lastStoredRole=value;return q},lt(){return q},gte(){return q},in(field,values){if(field==='role')assert.equal(values.includes('ex_core_subscriber'),false,'UI-only roles must not be used in database enum queries');return q},order(){return q},
 maybeSingle:async()=>({data:scheduleLog,error:null}),
 then(resolve,reject){return Promise.resolve({data:table==='users'?[user]:[],error:null}).then(resolve,reject)}};return q;
}};
globalThis.scheduleSend=async()=>{attempts++;scheduleLog={id:'test',whatsapp_sent:attempts>1,email_sent:true};return {whatsapp:{sent:attempts>1},emailSent:true}};
const scheduler=await load(root+'automations/subscriptionReminder.scheduler.ts',{
 '../supabase':'export const supabase=globalThis.scheduleDb',
 '../services/subscription-reminder-settings.service':'export const getSubscriptionReminderCampaigns=async()=>globalThis.currentReminderCampaigns',
 '../controllers/subscription-whatsapp.controller':`export const reminderConfigByType={one_week_before:{dayDiff:7,campaignName:'Bastion CORE Renewal Reminder #1'}};export const sendReminderForUser=(...a)=>globalThis.scheduleSend(...a)`,
 '../services/emailNotification.service':'export const sendMonthlySubscriptionExpirySummaryEmail=async()=>{};export const sendDropOffSummaryEmail=async()=>{}',
 '../services/mailchimpAudience.service':'export const syncExpiredPremiumUserToMailchimp=async()=>{}',
});
const realTimeout=globalThis.setTimeout;
globalThis.setTimeout=(fn)=>{queueMicrotask(fn);return 0};
await scheduler.runSubscriptionExpiryReminder();await scheduler.runSubscriptionExpiryReminder();await scheduler.runSubscriptionExpiryReminder();
globalThis.setTimeout=realTimeout;
assert.equal(attempts,2,'Failed delivery must retry; completed delivery must be skipped');
assert.equal(lastTarget,dates.reminderDate(new Date(),7));
assert.equal(lastStoredRole,'core_subscriber');
console.log('Scheduler checks passed: failed logged WhatsApp is retried, completed delivery is skipped, and due-date selection uses India calendar dates.');

assert.equal(configUtils.resolveReminderCampaigns().one_week_before.campaignName,'Bastion CORE Renewal Reminder #1');
assert.throws(()=>configUtils.resolveReminderCampaigns({one_week_before:{templateParams:['{{unknown}}']}}),/Unknown variable/);
assert.throws(()=>configUtils.resolveReminderCampaigns({one_week_before:{mediaUrl:'http://unsafe.example/image.png'}}),/HTTPS/);
assert.throws(()=>configUtils.resolveReminderCampaigns({one_week_before:{campaignName:' '}}),/campaign name/);
assert.throws(()=>configUtils.resolveReminderCampaigns({one_week_before:{templateParams:['{{name']}}),/syntax/);
assert.throws(()=>configUtils.resolveReminderCampaigns({one_week_before:{templateParams:Array(21).fill('text')}}),/20 variables/);
assert.deepEqual(configUtils.renderReminderVariables(['{{name}}','{{expiry_date}}','{{plan_name}}','https://example.com/renew'],user,'one_week_before'),['Test','2026-11-06','Bastion CORE','https://example.com/renew']);
record=null;waCalls=emailCalls=0;
let actualPayload;
globalThis.testSend=async payload=>{actualPayload=payload;waCalls++;return {sent:true}};
globalThis.currentReminderCampaigns=configUtils.resolveReminderCampaigns({one_week_before:{campaignName:'Updated renewal campaign',templateParams:['{{name}}','{{expiry_date}}','Fixed renewal link'],mediaUrl:''}});
await send();
assert.equal(actualPayload.campaignName,'Updated renewal campaign');
assert.deepEqual(actualPayload.templateParams,['Test','2026-11-06','Fixed renewal link']);
assert.equal(actualPayload.media,undefined);
const alreadySentCalls=waCalls;globalThis.currentReminderCampaigns.one_week_before.campaignName='Another campaign after delivery';await send();assert.equal(waCalls,alreadySentCalls);assert.equal(record.campaign_name,'Updated renewal campaign');
record=null;globalThis.currentReminderCampaigns.one_week_before.enabled=false;
const callsBefore=waCalls;const disabled=await send();assert.equal(disabled.whatsapp.reason,'disabled');assert.equal(waCalls,callsBefore);
globalThis.currentReminderCampaigns=configUtils.resolveReminderCampaigns();
console.log('Admin campaign tests passed: defaults, validation, variable order, custom literals, media, saved-config changes without restart, and disabled-stage delivery guard.');
let settingsRow={singleton:true,data:{site_name:'Existing site',unrelated:'preserve',aisensy_subscription_reminders:configUtils.resolveReminderCampaigns()}};
let settingsReads=0,settingsWrites=0;
globalThis.settingsDb={from:()=>({select(){return this},async maybeSingle(){settingsReads++;return {data:settingsRow,error:null}},async upsert(payload){settingsWrites++;settingsRow=payload;return {error:null}}})};
const settingsController=await load(root+'controllers/settings.controller.ts',{'../supabase':'export const supabase=globalThis.settingsDb'});
const response=()=>({statusCode:200,body:null,status(code){this.statusCode=code;return this},json(body){this.body=body;return this}});
let res=response();await settingsController.getAdminSettings({},res);assert.equal(res.body.aisensy_subscription_reminders.one_week_before.campaignName,'Bastion CORE Renewal Reminder #1');
res=response();await settingsController.updateAdminSettings({body:{aisensy_subscription_reminders:{one_week_before:{campaignName:'Saved campaign',templateParams:['{{name}}']}}}},res);
assert.equal(res.statusCode,200);assert.equal(settingsRow.data.unrelated,'preserve');assert.equal(settingsRow.data.aisensy_subscription_reminders.expiry_day.campaignName,'Bastion CORE Renewal Reminder #2');
const writes=settingsWrites;res=response();await settingsController.updateAdminSettings({body:{aisensy_subscription_reminders:{one_week_before:{templateParams:['{{bad_key}}']}}}},res);assert.equal(res.statusCode,400);assert.equal(settingsWrites,writes);assert.equal(settingsRow.data.aisensy_subscription_reminders.one_week_before.campaignName,'Saved campaign');
res=response();await settingsController.getPublicSettings({},res);assert.equal(Object.hasOwn(res.body,'aisensy_subscription_reminders'),false);
const loader=await load(root+'services/subscription-reminder-settings.service.ts',{'../controllers/settings.controller':'export const getSettingsData=async()=>globalThis.settingsDb.from().select().maybeSingle().then(r=>r.data.data)'});
assert.equal((await loader.getSubscriptionReminderCampaigns()).one_week_before.campaignName,'Saved campaign');settingsRow.data.aisensy_subscription_reminders.one_week_before.campaignName='Changed without restart';assert.equal((await loader.getSubscriptionReminderCampaigns()).one_week_before.campaignName,'Changed without restart');
console.log('Settings API tests passed: persisted update/partial merge, unrelated settings preserved, invalid save rejected without writes, reminder config excluded from public settings, and live config reload.');
