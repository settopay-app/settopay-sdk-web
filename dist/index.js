"use strict";var y=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var P=Object.prototype.hasOwnProperty;var S=(e,t)=>{for(var o in t)y(e,o,{get:t[o],enumerable:!0})},v=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of h(t))!P.call(e,r)&&r!==o&&y(e,r,{get:()=>t[r],enumerable:!(n=w(t,r))||n.enumerable});return e};var I=e=>v(y({},"__esModule",{value:!0}),e);var C={};S(C,{SettoSDK:()=>g,default:()=>k});module.exports=I(C);var u={dev:"https://dev-wallet.settopay.com",prod:"https://wallet.settopay.com"},p={SETTO_PAYMENT_SUCCESS:"SETTO_PAYMENT_SUCCESS",SETTO_PAYMENT_FAILED:"SETTO_PAYMENT_FAILED",SETTO_PAYMENT_CANCELLED:"SETTO_PAYMENT_CANCELLED"},s=null;function E(){if(!s)throw new Error("SettoSDK not initialized. Call SettoSDK.initialize() first.");return s}function a(...e){s?.debug&&console.log("[SettoSDK]",...e)}var g={initialize(e){if(s){console.warn("[SettoSDK] Already initialized");return}s=e,a("Initialized:",{...s,idpToken:s.idpToken?"[REDACTED]":void 0})},async openPayment(e){let t=E(),o=u[t.environment],n;if(t.idpToken){a("Requesting PaymentToken...");try{let i=await(await fetch(`${o}/api/external/payment/token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({merchant_id:t.merchantId,amount:e.amount,order_id:e.orderId,idp_token:t.idpToken})})).json();if(i.payment_error||i.system_error)return a("PaymentToken error:",i),{status:"failed",error:i.payment_error||i.system_error};if(!i.payment_token)return a("PaymentToken not received"),{status:"failed",error:"Payment token not received"};n=`${o}/pay/wallet#pt=${encodeURIComponent(i.payment_token)}`,a("Opening payment with auto-login")}catch(r){return a("PaymentToken request error:",r),{status:"failed",error:"Network error"}}}else{let r=new URL(`${o}/pay/wallet`);r.searchParams.set("merchant_id",t.merchantId),r.searchParams.set("amount",e.amount),e.orderId&&r.searchParams.set("order_id",e.orderId),n=r.toString(),a("Opening payment with Setto login")}return _(n,t)},async getPaymentInfo(e){let t=E(),o=u[t.environment],n=await fetch(`${o}/api/external/payment/${e.paymentId}`,{headers:{"X-Merchant-ID":t.merchantId}});if(!n.ok)throw new Error(`Failed to get payment info: ${n.status}`);return n.json()},isInitialized(){return s!==null},reset(){s=null}};function _(e,t){return new Promise(o=>{let n=document.createElement("div");n.id="setto-overlay",n.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;let r=document.createElement("iframe");r.id="setto-iframe",r.src=e,r.style.cssText=`
      width: 420px;
      height: 680px;
      max-width: 95vw;
      max-height: 90vh;
      border: none;
      border-radius: 16px;
      background: white;
    `,n.appendChild(r),document.body.appendChild(n);let i=()=>{window.removeEventListener("message",f),n.remove()};n.addEventListener("click",d=>{d.target===n&&(a("Payment cancelled by user (overlay click)"),i(),o({status:"cancelled"}))});let c=d=>{d.key==="Escape"&&(a("Payment cancelled by user (ESC key)"),i(),window.removeEventListener("keydown",c),o({status:"cancelled"}))};window.addEventListener("keydown",c);let f=d=>{let T=u[t.environment];if(d.origin!==T)return;let{type:m,data:l}=d.data;a("Received message:",m,l),m===p.SETTO_PAYMENT_SUCCESS?(i(),window.removeEventListener("keydown",c),o({status:"success",paymentId:l.paymentId,txHash:l.txHash})):m===p.SETTO_PAYMENT_FAILED?(i(),window.removeEventListener("keydown",c),o({status:"failed",error:l.error})):m===p.SETTO_PAYMENT_CANCELLED&&(i(),window.removeEventListener("keydown",c),o({status:"cancelled"}))};window.addEventListener("message",f)})}var k=g;0&&(module.exports={SettoSDK});
//# sourceMappingURL=index.js.map