'use strict';
// Replace these provider instances to integrate a backend. UI never grants purchases.
class DemoPaymentProvider {
 async createPayment(productId){return transact('Create demo payment',s=>{if(!product(productId))return false;const p={id:uid(),productId,status:'pending',created:Date.now()};s.payments.push(p);return p;});}
 async getPayment(id){return readState().payments.find(p=>p.id===id)||null;}
 async verifyPayment(id){const p=await this.getPayment(id);return p?{...p,verified:p.status==='success'}:null;}
 async complete(id,status){if(!['success','failure','cancel'].includes(status))return false;return transact('Payment '+status,s=>{const p=s.payments.find(x=>x.id===id);if(!p||p.status!=='pending')return false;const goods=product(p.productId);if(!goods)return false;p.status=status;if(status==='success'){if(goods.gems)s.gems+=goods.gems;else if(goods.days)s.premiumUntil=Math.max(Date.now(),s.premiumUntil)+goods.days*86400000;else if(goods.id==='pass')s.passOwned=true;}return {...p};});}
}
class DemoAdProvider {
 async watch(placement,onReward){await new Promise(resolve=>setTimeout(resolve,2200));const receipt={id:uid(),placement,at:Date.now()};return onReward(receipt);}
}
const paymentProvider=new DemoPaymentProvider(),adProvider=new DemoAdProvider();
