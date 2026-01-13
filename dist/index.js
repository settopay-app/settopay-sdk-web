"use strict";var p=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var v=Object.prototype.hasOwnProperty;var P=(e,n)=>{for(var o in n)p(e,o,{get:n[o],enumerable:!0})},I=(e,n,o,t)=>{if(n&&typeof n=="object"||typeof n=="function")for(let r of w(n))!v.call(e,r)&&r!==o&&p(e,r,{get:()=>n[r],enumerable:!(t=S(n,r))||t.enumerable});return e};var h=e=>I(p({},"__esModule",{value:!0}),e);var A={};P(A,{SettoSDK:()=>g,default:()=>_});module.exports=h(A);var y={dev:"https://dev-wallet.settopay.com",prod:"https://wallet.settopay.com"},u={SETTO_PAYMENT_SUCCESS:"SETTO_PAYMENT_SUCCESS",SETTO_PAYMENT_FAILED:"SETTO_PAYMENT_FAILED",SETTO_PAYMENT_CANCELLED:"SETTO_PAYMENT_CANCELLED"},d=null;function E(){if(!d)throw new Error("SettoSDK not initialized. Call SettoSDK.initialize() first.");return d}function a(...e){d?.debug&&console.log("[SettoSDK]",...e)}var g={initialize(e){if(d){console.warn("[SettoSDK] Already initialized");return}d=e,a("Initialized:",d)},async openPayment(e){let n=E(),o=y[n.environment];a("Requesting PaymentToken...");try{let t={merchant_id:e.merchantId,amount:e.amount};e.idpToken&&(t.idp_token=e.idpToken);let i=await(await fetch(`${o}/api/external/payment/token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})).json();if(i.payment_error||i.system_error)return a("PaymentToken error:",i),{status:"failed",error:i.payment_error||i.system_error};if(!i.payment_token)return a("PaymentToken not received"),{status:"failed",error:"Payment token not received"};let c=`${o}/pay/wallet#pt=${encodeURIComponent(i.payment_token)}`;return a("Opening payment page"),k(c,n)}catch(t){return a("PaymentToken request error:",t),{status:"failed",error:"Network error"}}},async getPaymentInfo(e){let n=E(),o=y[n.environment],t=await fetch(`${o}/api/external/payment/${e.paymentId}`,{headers:{"X-Merchant-ID":e.merchantId}});if(!t.ok)throw new Error(`Failed to get payment info: ${t.status}`);return t.json()},isInitialized(){return d!==null},reset(){d=null}};function k(e,n){return new Promise(o=>{let t=document.createElement("div");t.id="setto-overlay",t.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 99999;
      pointer-events: none;
    `;let r=document.createElement("iframe");r.id="setto-iframe",r.src=e,r.allow="clipboard-write",r.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      pointer-events: auto;
    `,t.appendChild(r),document.body.appendChild(t);let i=()=>{window.removeEventListener("message",f),t.remove()},c=m=>{m.key==="Escape"&&(a("Payment cancelled by user (ESC key)"),i(),window.removeEventListener("keydown",c),o({status:"cancelled"}))};window.addEventListener("keydown",c);let f=m=>{let T=y[n.environment];if(m.origin!==T)return;let{type:l,data:s}=m.data;a("Received message:",l,s),l===u.SETTO_PAYMENT_SUCCESS?(i(),window.removeEventListener("keydown",c),o({status:"success",paymentId:s.paymentId,txHash:s.txHash,fromAddress:s.fromAddress,toAddress:s.toAddress,amount:s.amount,chainId:s.chainId,tokenSymbol:s.tokenSymbol})):l===u.SETTO_PAYMENT_FAILED?(i(),window.removeEventListener("keydown",c),o({status:"failed",error:s.error})):l===u.SETTO_PAYMENT_CANCELLED&&(i(),window.removeEventListener("keydown",c),o({status:"cancelled"}))};window.addEventListener("message",f)})}var _=g;0&&(module.exports={SettoSDK});
//# sourceMappingURL=index.js.map