const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const memory=new Map();const context={console,crypto:require('crypto').webcrypto,structuredClone,Date,Math,Uint32Array,setTimeout,clearTimeout,setInterval,clearInterval,navigator:{},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},document:{querySelector:()=>({addEventListener(){}}),addEventListener(){}},window:{addEventListener(){}},assert};
vm.createContext(context);
const source=fs.readFileSync(__dirname+'/app.js','utf8')+'\n'+fs.readFileSync(__dirname+'/config.js','utf8')+'\n'+fs.readFileSync(__dirname+'/services.js','utf8')+'\n'+fs.readFileSync(__dirname+'/game.js','utf8').replace('finishInit();','');
vm.runInContext(source,context);
vm.runInContext(`sync=()=>{};toastMsg=()=>{};passPage=()=>{};dailyReward=()=>{};missionPage=()=>{};
(async()=>{
 state=fresh();localStorage.setItem(CONFIG.key,JSON.stringify(state));
 assert.equal(CONFIG.wheel.reduce((n,r)=>n+r.weight,0),10000);
 assert.equal(CONFIG.drops.reduce((n,r)=>n+r,0),10000);
 const counts=CONFIG.wheel.map(()=>0);for(let i=0;i<10000;i++)counts[weighted(CONFIG.wheel.map(x=>x.weight),(i+.5)/10000)]++;
 assert.equal(JSON.stringify(counts),JSON.stringify(CONFIG.wheel.map(x=>x.weight)));
 const payment=await paymentProvider.createPayment('g80');await paymentProvider.complete(payment.id,'success');assert.equal(state.gems,80);await paymentProvider.complete(payment.id,'success');assert.equal(state.gems,80);await paymentProvider.complete(payment.id,'failure');assert.equal(state.gems,80);
 for(const status of ['failure','cancel']){const p=await paymentProvider.createPayment('g250');await paymentProvider.complete(p.id,status);assert.equal(state.gems,80);assert.equal(await paymentProvider.complete(p.id,'success'),false);}
 const p=await paymentProvider.createPayment('monthly');await paymentProvider.complete(p.id,'success');assert.ok(premium());
 await transact('test XP',s=>{xp(s,1000);});await claimPass(1,false);const balance=state.coins;await claimPass(1,false);assert.equal(state.coins,balance);await claimPass(1,true);assert.equal(state.gems,80);
 const bp=await paymentProvider.createPayment('pass');await paymentProvider.complete(bp.id,'success');await claimPass(1,true);assert.equal(state.gems,100);await claimPass(1,true);assert.equal(state.gems,100);
 await claimLogin();const daily=state.coins;await claimLogin();assert.equal(state.coins,daily);
 await transact('mission',s=>{progress(s,'opens',3);});await claimTask('opens');const mission=state.coins;await claimTask('opens');assert.equal(state.coins,mission);
 assert.equal(readState().coins,state.coins);assert.equal(readState().gems,state.gems);
 const bad=normalize({coins:NaN,gems:-1,inv:[null,{id:'1',skin:40}]});assert.equal(bad.coins,0);assert.equal(bad.gems,0);assert.equal(bad.inv.length,0);
 const roll=fresh();grant(roll,CONFIG.wheel[2]);assert.equal(roll.caseTokens.length,1);grant(roll,CONFIG.wheel[7]);assert.equal(roll.inv[0].skin,3);
 assert.equal(leaderboard().length,101);const before=netWorth();await transact('gems independent',s=>{s.gems+=9999;});assert.equal(netWorth(),before);
 console.log('PASS: exact 10,000 wheel buckets; catalog odds; payment success/failure/cancel/replay; Premium; free/premium pass replay; daily and mission replay; persistence; malformed balances; tokens; 100 bots + player; NW excludes purchased balances');
})().catch(e=>{console.error(e);throw e;});`,context);
