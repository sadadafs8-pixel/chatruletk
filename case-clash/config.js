'use strict';
const CONFIG = Object.freeze({
  key:'caseclash.v4', season:'FOUNDERS', passXP:100, upgrade:Object.freeze({margin:0.8,maxChance:0.9,animationMs:1400}), battleCost:49, rounds:3,
  gems:[{id:'g80',gems:80,price:99},{id:'g250',gems:250,price:299},{id:'g550',gems:550,price:599,label:'MOST POPULAR'},{id:'g1200',gems:1200,price:1190},{id:'g2600',gems:2600,price:2490,label:'BEST VALUE'}],
  premium:[{id:'monthly',name:'Premium Monthly',price:299,days:30},{id:'yearly',name:'Premium Yearly',price:1990,days:365}],
  pass:{id:'pass',name:'Premium Battle Pass',price:399},
  wheel:[{name:'50 Coins',weight:4500,coins:50},{name:'100 Coins',weight:2800,coins:100},{name:'Free Case',weight:1500,case:1},{name:'500 Coins',weight:800,coins:500},{name:'Rare Case',weight:300,case:2},{name:'Epic Case',weight:80,case:3},{name:'Legendary Case',weight:19,case:5},{name:'Ultra Rare',weight:1,skin:3}],
  drops:[3000,1300,2000,110,900,450,240,2000],
  rarity:['COMMON','RARE','RARE','LEGENDARY','EPIC','LEGENDARY','LEGENDARY','COMMON'],
  colors:{COMMON:'#86a3c8',RARE:'#668eff',EPIC:'#c073ff',LEGENDARY:'#f2c771'},
  missions:[{id:'opens',label:'Open 3 cases',count:3,coins:100,xp:60},{id:'wins',label:'Win 1 battle',count:1,coins:150,xp:100,gems:5},{id:'ads',label:'Watch 2 rewarded ads',count:2,coins:75,xp:50},{id:'upgrades',label:'Try 1 upgrade',count:1,coins:50,xp:60}],
});
