import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url),
  ts = require('typescript'),
  root = fileURLToPath(new URL('../src/', import.meta.url));
const plans = [
  { plan_id: 1, plan_code: 'freemium', duration_months: null, price_amount: 0, currency: 'INR' },
  { plan_id: 2, plan_code: 'core', duration_months: 3, price_amount: 5000, currency: 'INR' },
  {
    plan_id: 3,
    plan_code: 'core_annual',
    duration_months: 12,
    price_amount: 18750,
    currency: 'INR',
  },
];
let db = {},
  queries = [],
  downloads = 0,
  createdOrders = [],
  providerOrders = new Map(),
  failReads = false;
function reset() {
  db = {
    users: [
      {
        id: 'member',
        email: 'test@example.test',
        phone: '9000000000',
        role: 'core_subscriber',
        status: 'active',
        plan_id: 2,
        subscription_start_date: '2024-03-11',
        subscription_end_date: '2099-10-30',
      },
    ],
    membership_plans: structuredClone(plans),
    payment_history: [],
    coupons: [],
    recommendations: [
      {
        company_symbol: 'PREM',
        tags: 'core',
        stock_performance_url: [{ business_note: 'supabase://premium-research/doc.pdf' }],
      },
      { company_symbol: 'FREE', tags: 'freemium' },
    ],
  };
  queries = [];
  createdOrders = [];
  providerOrders = new Map();
  failReads = false;
}
const storage = {
  from: () => ({
    download: async () => {
      downloads++;
      return { data: new Blob(['synthetic-pdf'], { type: 'application/pdf' }), error: null };
    },
  }),
};
const supabase = {
  storage,
  from(table) {
    const filters = [];
    let mode = 'select',
      payload,
      one = false,
      limit = Infinity;
    const q = {
      select() {
        return q;
      },
      eq(k, v) {
        filters.push((r) => r[k] === v);
        return q;
      },
      neq(k, v) {
        filters.push((r) => r[k] !== v);
        return q;
      },
      in(k, values) {
        filters.push((r) => values.includes(r[k]));
        return q;
      },
      is(k, v) {
        filters.push((r) => r[k] == null && v === null);
        return q;
      },
      order() {
        return q;
      },
      limit(n) {
        limit = n;
        return q;
      },
      maybeSingle() {
        one = true;
        return q;
      },
      single() {
        one = true;
        return q;
      },
      insert(v) {
        mode = 'insert';
        payload = v;
        return q;
      },
      update(v) {
        mode = 'update';
        payload = v;
        return q;
      },
      upsert(v) {
        mode = 'upsert';
        payload = v;
        return q;
      },
      then(resolve, reject) {
        return Promise.resolve()
          .then(() => {
            queries.push({ table, mode });
            if (failReads && mode === 'select')
              return { data: null, error: { message: 'offline' } };
            db[table] ??= [];
            let data;
            if (mode === 'insert' || mode === 'upsert') {
              const rows = Array.isArray(payload) ? payload : [payload];
              data = [];
              for (const row of rows) {
                const existing =
                  table === 'payment_history' &&
                  db[table].find((r) => r.transaction_id === row.transaction_id);
                if (existing && mode === 'insert') return { data: null, error: { code: '23505' } };
                if (existing) Object.assign(existing, row);
                else db[table].push({ ...row });
                data.push(existing || row);
              }
            } else {
              data = db[table].filter((r) => filters.every((f) => f(r))).slice(0, limit);
              if (mode === 'update') for (const row of data) Object.assign(row, payload);
            }
            return { data: structuredClone(one ? data[0] || null : data), error: null };
          })
          .then(resolve, reject);
      },
    };
    return q;
  },
};
const pg = {
  pgCreateOrder: async (request) => {
    if (providerOrders.has(request.order_id)) {
      const e = Error('duplicate order');
      e.response = { status: 409 };
      throw e;
    }
    createdOrders.push(request);
    const order = { ...request, order_status: 'ACTIVE', payment_session_id: 'synthetic-session' };
    providerOrders.set(request.order_id, order);
    return { data: order };
  },
  pgFetchOrder: async (id) => {
    if (!providerOrders.has(id)) {
      const e = Error('not found');
      e.response = { status: 404 };
      throw e;
    }
    return { data: providerOrders.get(id) };
  },
};
process.env.CORE_INTRO_RESERVATIONS_VERIFIED = 'true';
const cache = new Map();
function load(file) {
  const filename = path.resolve(root, file);
  if (filename.endsWith('/supabase/index.ts')) return { supabase };
  if (filename.endsWith('/cashfree-pg.service.ts')) return pg;
  if (/(?:emailNotification|mailchimpAudience)\.service\.ts$/.test(filename))
    return {
      sendWelcomeEmailForUser: async () => {},
      syncOnboardedUserToMailchimp: async () => {},
    };
  if (filename.endsWith('/onboardingDropOff.scheduler.ts'))
    return { clearOnboardingDropOffForUser: () => {} };
  if (cache.has(filename)) return cache.get(filename).exports;
  const m = { exports: {} };
  cache.set(filename, m);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  new Function('module', 'exports', 'require', code)(m, m.exports, (s) => {
    if (s.startsWith('.')) {
      let next = path.resolve(path.dirname(filename), s);
      next = fs.existsSync(next + '.ts') ? next + '.ts' : path.join(next, 'index.ts');
      return load(path.relative(root, next));
    }
    return require(s);
  });
  return m.exports;
}
const access = load('services/premium-access.service.ts'),
  checkout = load('services/core-checkout.service.ts'),
  orders = load('services/cashfree-plans-orders.service.ts'),
  assets = load('services/research-assets.service.ts'),
  recommendations = load('controllers/recommendations.controller.ts'),
  webhooks = load('services/cashfree-webhook.service.ts');
const now = new Date('2026-10-30T12:00:00Z');
reset();
const base = { ...db.users[0], subscription_end_date: '2026-10-30' };
for (const [role, planId, status, expected] of [
  ['core_subscriber', 2, 'active', true],
  ['core_subscriber', 3, 'active', true],
  ['core_subscriber', 1, 'active', false],
  ['free_subscriber', 3, 'free', false],
  ['ipo_subscriber', 3, 'active', false],
  ['research_ally_subscriber', 3, 'active', false],
  ['admin', 1, 'active', true],
  ['employee', null, 'active', true],
  ['admin', 3, 'inactive', false],
  ['core_subscriber', 3, 'payment_pending', false],
])
  assert.equal(
    access.hasPremiumAccess(
      { ...base, role, plan_id: planId, status },
      plans.find((p) => p.plan_id === planId),
      now,
    ),
    expected,
    role + ' ' + planId,
  );
for (const end of [null, '', 'invalid', '2026-02-30', '2026-10-29'])
  assert.equal(
    access.hasPremiumAccess({ ...base, subscription_end_date: end }, plans[1], now),
    false,
  );
assert.equal(
  access.hasPremiumAccess({ ...base, subscription_start_date: '2026-10-31' }, plans[1], now),
  false,
);
assert.equal(access.hasPremiumAccess(base, plans[1], new Date('2026-10-30T18:29:59Z')), true);
assert.equal(access.hasPremiumAccess(base, plans[1], new Date('2026-10-30T18:30:00Z')), false);
assert.equal(access.hasPremiumAccess(base, { ...plans[1], plan_id: 99 }, now), false);
assert.equal(access.hasPremiumAccess(base, { ...plans[1], duration_months: 12 }, now), false);
assert.equal(access.addMonths('2026-01-31', 3), '2026-04-30');
assert.equal(access.addMonths('2024-02-29', 12), '2025-02-28');
function response() {
  return {
    code: 200,
    headers: {},
    body: null,
    status(n) {
      this.code = n;
      return this;
    },
    set(k, v) {
      this.headers[k] = v;
      return this;
    },
    json(v) {
      this.body = v;
      return this;
    },
    send(v) {
      this.body = v;
      return this;
    },
    end() {
      return this;
    },
    redirect(n, v) {
      this.code = n;
      this.body = v;
      return this;
    },
    type() {
      return this;
    },
  };
}
reset();
const requestBase = { ...base, subscription_end_date: '2099-10-30' };
for (const [user, expected] of [
  [null, ['FREE']],
  [{ ...base, role: 'free_subscriber', status: 'free', plan_id: 1 }, ['FREE']],
  [requestBase, ['PREM', 'FREE']],
  [{ ...base, role: 'admin', plan_id: 1 }, ['PREM', 'FREE']],
]) {
  const res = response();
  await recommendations.getRecommendations({ user, query: {} }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(
    res.body.map((r) => r.company_symbol),
    expected,
  );
}
let res = response();
await recommendations.getRecommendationByCompanySymbol(
  { params: { companySymbol: 'PREM' }, user: null, query: {} },
  res,
);
assert.equal(res.code, 401);
res = response();
await recommendations.getRecommendationByCompanySymbol(
  {
    params: { companySymbol: 'PREM' },
    user: { ...base, role: 'free_subscriber', status: 'free', plan_id: 1 },
    query: {},
  },
  res,
);
assert.equal(res.code, 403);
assert.equal(JSON.stringify(res.body).includes('doc.pdf'), false);
res = response();
await recommendations.getRecommendations({ user: null, query: { manage: 'true' } }, res);
assert.deepEqual(
  res.body.map((r) => r.company_symbol),
  ['FREE'],
);
res = response();
downloads = 0;
await assets.getResearchAsset(
  {
    params: { kind: 'recommendations', id: 'PREM' },
    query: { field: 'stock_performance_url.0.business_note' },
    user: null,
  },
  res,
);
assert.equal(res.code, 401);
assert.equal(downloads, 0);
res = response();
await assets.getResearchAsset(
  {
    params: { kind: 'recommendations', id: 'PREM' },
    query: { field: 'stock_performance_url.0.business_note' },
    user: { ...base, subscription_end_date: '2099-01-01' },
  },
  res,
);
assert.equal(res.code, 200);
assert.equal(downloads, 1);
assert.equal(res.body.toString(), 'synthetic-pdf');
assert.equal(
  assets.storageLocation('https://attacker.test/storage/v1/object/public/files/doc.pdf'),
  null,
);
assert.equal(assets.storageLocation('http://169.254.169.254/metadata'), null);
assert.match(
  assets.protectResearchLinks(db.recommendations[0], 'recommendations', 'PREM')
    .stock_performance_url[0].business_note,
  /\/api\/research-assets\//,
);
reset();
db.payment_history.push({ user_id: 'member', plan_id: 2, transaction_status: 'SUCCESS' });
await assert.rejects(
  checkout.reserveIntroCheckout('member', plans[1], 5000),
  /only be purchased once/,
);
assert.equal(await checkout.reserveIntroCheckout('member', plans[2], 18750), null);
reset();
let reservations = await Promise.allSettled([
  checkout.reserveIntroCheckout('member', plans[1], 0),
  checkout.reserveIntroCheckout('member', plans[1], 0),
]);
assert.equal(reservations.filter((r) => r.status === 'fulfilled').length, 1);
assert.equal(db.payment_history.length, 1);
reset();
db.users[0].subscription_end_date = '2020-01-01';
const customer = db.users[0];
const first = await orders.createOrderForPlanService({
  planId: 2,
  customer_id: 'member',
  customer_phone: '9000000000',
  discount_amount: 0,
  is_free: true,
});
assert.equal(createdOrders[0].order_amount, 5000, 'Client cannot grant a paid plan for free');
const resumed = await orders.createOrderForPlanService({
  planId: 2,
  customer_id: 'member',
  customer_phone: '9000000000',
  discount_amount: 1,
});
assert.equal(resumed.order.order_id, first.order.order_id);
assert.equal(createdOrders.length, 1, 'Pending checkout must reuse the same order');
const provider = providerOrders.get(first.order.order_id);
provider.order_status = 'PAID';
let event = {
  data: {
    order: { order_id: first.order.order_id },
    payment: {
      payment_status: 'SUCCESS',
      payment_amount: 5000,
      payment_time: '2026-10-30T12:00:00Z',
    },
  },
};
await webhooks.handlePaymentSuccess(event);
assert.equal(db.payment_history[0].transaction_status, 'SUCCESS');
assert.equal(db.users[0].subscription_end_date, '2027-01-30');
const savedEnd = db.users[0].subscription_end_date;
await webhooks.handlePaymentSuccess(event);
assert.equal(db.users[0].subscription_end_date, savedEnd, 'Webhook replay must not extend access');
db.users[0].role = 'free_subscriber';
await assert.rejects(
  orders.createOrderForPlanService({
    planId: 2,
    customer_id: 'member',
    customer_phone: '9000000000',
    discount_amount: 5000,
  }),
  /only be purchased once/,
);
for (let i = 0; i < 2; i++) {
  const annual = await orders.createOrderForPlanService({
    planId: 3,
    customer_id: 'member',
    customer_phone: '9000000000',
    discount_amount: 0,
  });
  assert.ok(annual.order.payment_session_id);
  const order = providerOrders.get(annual.order.order_id);
  order.order_status = 'PAID';
  await webhooks.handlePaymentSuccess({
    data: {
      order: { order_id: order.order_id },
      payment: {
        payment_status: 'SUCCESS',
        payment_amount: order.order_amount,
        payment_time: 2027 + i + '-02-02T12:00:00Z',
      },
    },
  });
  assert.equal(db.users[0].subscription_end_date, 2028 + i + '-02-02');
}
reset();
db.coupons.push({
  coupon_code: 'FREECORE',
  active: true,
  discount_type: 'percentage',
  discount_value: 100,
  max_uses: 10,
  used_count: 0,
});
await orders.createOrderForPlanService({
  planId: 2,
  customer_id: 'member',
  customer_phone: '9000000000',
  discount_amount: 1,
  coupon_code: 'FREECORE',
});
assert.equal(db.users[0].role, 'core_subscriber');
assert.equal(db.payment_history[0].transaction_status, 'SUCCESS');
await assert.rejects(
  orders.createOrderForPlanService({
    planId: 2,
    customer_id: 'member',
    customer_phone: '9000000000',
    discount_amount: 0,
    coupon_code: 'FREECORE',
  }),
  /only be purchased once/,
);
reset();
failReads = true;
await assert.rejects(access.accessForUser(base));
assert.equal((await access.accessForUser({ ...base, role: 'admin' })).premium, true);
failReads = false;
console.log(
  'Premium access checks passed: roles/plans/dates/India expiry, API and resource authorization, no raw premium leakage, intro history/concurrency, order resume, price tampering, paid/coupon activation, webhook replay and unlimited annual checkouts.',
);

reset();
delete process.env.CORE_INTRO_RESERVATIONS_VERIFIED;
await assert.rejects(
  checkout.reserveIntroCheckout('member', plans[1], 5000),
  /temporarily unavailable/,
);
assert.equal(await checkout.reserveIntroCheckout('member', plans[2], 18750), null);
process.env.CORE_INTRO_RESERVATIONS_VERIFIED = 'true';

// Mutation paths must not permit users to manufacture their own entitlement.
reset();
const users=load('controllers/user.controller.ts');
res=response();await users.updateUser({params:{id:'member'},body:{role:'admin',plan_id:3,subscription_end_date:'2099-01-01'},user:db.users[0]},res);assert.equal(res.code,403);assert.equal(db.users[0].role,'core_subscriber');
res=response();await users.updateUser({params:{id:'another-user'},body:{first_name:'Changed'},user:db.users[0]},res);assert.equal(res.code,403);
const auth=load('controllers/auth.controller.ts');
res=response();await auth.zeroAmountAccountCreation({user:db.users[0],body:{plan_id:3,user_id:'different-user'}},res);assert.equal(res.code,403);
res=response();await auth.zeroAmountAccountCreation({user:db.users[0],body:{plan_id:3,user_id:'member',is_free:true}},res);assert.equal(res.code,400);assert.equal(createdOrders.length,0);
res=response();await auth.onboardUser({body:{email:'new@example.test',phone:'9000000001',password:'Synthetic-password-123',firstName:'Synthetic',lastName:'Account',dateOfBirth:'1990-01-01',role:'admin',status:'active',plan_id:3,panCard:'SYNTHETIC',panVerification:{valid:true}}},res);assert.equal(res.code,200);const newUser=db.users.find(u=>u.email==='new@example.test');assert.equal(newUser.role,'core_subscriber');assert.equal(newUser.status,'onboarded');assert.equal(newUser.plan_id,null);assert.equal(newUser.subscription_end_date,null);
reset();const middleware=load('middleware/auth.middleware.ts');process.env.JWT_SECRET='synthetic-premium-test-secret';const token=require('jsonwebtoken').sign({id:'member'},process.env.JWT_SECRET);let next=0;res=response();await middleware.protect({cookies:{},headers:{authorization:'Bearer '+token}},res,()=>next++);assert.equal(next,1);db.users[0].status='inactive';next=0;res=response();await middleware.protect({cookies:{token},headers:{}},res,()=>next++);assert.equal(next,0);assert.equal(res.code,403);
reset();const content=load('controllers/content.controller.ts');db.webinars=[{id:'premium',is_premium:true,title:'Premium webinar',video_url:'private-video',contents:'private contents'},{id:'public',is_premium:false,title:'Public webinar',video_url:'public-video'}];res=response();await content.listWebinars({query:{},user:null},res);assert.equal(res.body[0].locked,true);assert.equal(res.body[0].video_url,undefined);assert.equal(res.body[0].contents,undefined);assert.equal(res.body[1].video_url,'public-video');res=response();await content.getWebinar({params:{id:'premium'},query:{},user:null},res);assert.equal(res.code,401);res=response();await content.getWebinar({params:{id:'premium'},query:{},user:{...requestBase,role:'employee',plan_id:1}},res);assert.equal(res.code,200);
const rich={content:'<a href="supabase://premium-research/private.pdf">Read</a>'};const protectedRich=assets.protectResearchLinks(rich,'scratchpad','note');assert.ok(!protectedRich.content.includes('supabase://'));assert.match(protectedRich.content,/asset=[a-f0-9]{64}/);
console.log('Mutation and content checks passed: self/other-account privilege changes blocked, forged free activation blocked, onboarding cannot grant staff/paid access, Bearer/cookie auth, inactive account denial, webinar redaction and embedded document links.');

// Migration copies/validates first, keeps public shared assets, and has no writes in dry run.
reset();const migration=load('scripts/secure-premium-documents.ts');
const originalFrom=storage.from;const objects=new Map([['files/private.pdf',Buffer.from('private document')],['files/shared.pdf',Buffer.from('shared document')]]),removed=[];
const privateUrl='https://ftuuyfhfrhvlllfwfbjx.supabase.co/storage/v1/object/public/files/private.pdf',sharedUrl=privateUrl.replace('private.pdf','shared.pdf');
db.recommendations=[{id:1,company_symbol:'PREM',tags:'core',stock_performance_url:[{business_note:privateUrl,quick_bite:sharedUrl}]},{id:2,company_symbol:'FREE',tags:'freemium',stock_performance_url:[{business_note:sharedUrl}]}];
storage.getBucket=async()=>({data:{public:false},error:null});storage.from=bucket=>({download:async key=>({data:objects.has(bucket+'/'+key)?new Blob([objects.get(bucket+'/'+key)],{type:'application/pdf'}):null,error:null}),upload:async(key,bytes)=>{objects.set(bucket+'/'+key,Buffer.from(bytes));return{error:null};},remove:async keys=>{for(const key of keys){removed.push(bucket+'/'+key);objects.delete(bucket+'/'+key);}return{error:null};}});
for(const table of ['tactical_ideas','scratch_pad_newsletters','webinars','manual_newsletters','podcasts','settings'])db[table]=[];
const before=JSON.stringify(db);await migration.securePremiumDocuments();assert.equal(JSON.stringify(db),before);assert.equal(objects.size,2);assert.equal(removed.length,0);
const backup=require('os').tmpdir()+'/bastion-premium-test-'+Date.now();await migration.securePremiumDocuments({apply:true,retire:true,backupDirectory:backup});assert.deepEqual(removed,['files/private.pdf']);assert.ok(objects.has('files/shared.pdf'));assert.ok(db.recommendations[0].stock_performance_url[0].business_note.startsWith('supabase://premium-research/'));assert.equal(db.recommendations[1].stock_performance_url[0].business_note,sharedUrl);const manifest=fs.readdirSync(backup)[0];assert.equal(fs.statSync(path.join(backup,manifest)).mode&0o777,0o600);fs.rmSync(backup,{recursive:true,force:true});storage.from=originalFrom;
console.log('Document migration checks passed: dry run is read-only, verified private copies precede DB changes/deletion, public shared files retained, private backup manifest created.');
