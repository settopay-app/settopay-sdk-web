var p={dev:"https://dev-wallet.settopay.com",prod:"https://wallet.settopay.com"},y={SETTO_PAYMENT_SUCCESS:"SETTO_PAYMENT_SUCCESS",SETTO_PAYMENT_FAILED:"SETTO_PAYMENT_FAILED",SETTO_PAYMENT_CANCELLED:"SETTO_PAYMENT_CANCELLED"},s=null;function f(){if(!s)throw new Error("SettoSDK not initialized. Call SettoSDK.initialize() first.");return s}function a(...t){s?.debug&&console.log("[SettoSDK]",...t)}var g={initialize(t){if(s){console.warn("[SettoSDK] Already initialized");return}s=t,a("Initialized:",{...s,idpToken:s.idpToken?"[REDACTED]":void 0})},async openPayment(t){let o=f(),i=p[o.environment],e;if(o.idpToken){a("Requesting PaymentToken...");try{let n=await(await fetch(`${i}/api/external/payment/token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({merchant_id:o.merchantId,amount:t.amount,order_id:t.orderId,idp_token:o.idpToken})})).json();if(n.payment_error||n.system_error)return a("PaymentToken error:",n),{status:"failed",error:n.payment_error||n.system_error};if(!n.payment_token)return a("PaymentToken not received"),{status:"failed",error:"Payment token not received"};e=`${i}/pay/wallet#pt=${encodeURIComponent(n.payment_token)}`,a("Opening payment with auto-login")}catch(r){return a("PaymentToken request error:",r),{status:"failed",error:"Network error"}}}else{let r=new URL(`${i}/pay/wallet`);r.searchParams.set("merchant_id",o.merchantId),r.searchParams.set("amount",t.amount),t.orderId&&r.searchParams.set("order_id",t.orderId),e=r.toString(),a("Opening payment with Setto login")}return T(e,o)},async getPaymentInfo(t){let o=f(),i=p[o.environment],e=await fetch(`${i}/api/external/payment/${t.paymentId}`,{headers:{"X-Merchant-ID":o.merchantId}});if(!e.ok)throw new Error(`Failed to get payment info: ${e.status}`);return e.json()},isInitialized(){return s!==null},reset(){s=null}};function T(t,o){return new Promise(i=>{let e=document.createElement("div");e.id="setto-overlay",e.style.cssText=`
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
    `;let r=document.createElement("iframe");r.id="setto-iframe",r.src=t,r.style.cssText=`
      width: 420px;
      height: 680px;
      max-width: 95vw;
      max-height: 90vh;
      border: none;
      border-radius: 16px;
      background: white;
    `,e.appendChild(r),document.body.appendChild(e);let n=()=>{window.removeEventListener("message",u),e.remove()};e.addEventListener("click",d=>{d.target===e&&(a("Payment cancelled by user (overlay click)"),n(),i({status:"cancelled"}))});let c=d=>{d.key==="Escape"&&(a("Payment cancelled by user (ESC key)"),n(),window.removeEventListener("keydown",c),i({status:"cancelled"}))};window.addEventListener("keydown",c);let u=d=>{let E=p[o.environment];if(d.origin!==E)return;let{type:m,data:l}=d.data;a("Received message:",m,l),m===y.SETTO_PAYMENT_SUCCESS?(n(),window.removeEventListener("keydown",c),i({status:"success",paymentId:l.paymentId,txHash:l.txHash})):m===y.SETTO_PAYMENT_FAILED?(n(),window.removeEventListener("keydown",c),i({status:"failed",error:l.error})):m===y.SETTO_PAYMENT_CANCELLED&&(n(),window.removeEventListener("keydown",c),i({status:"cancelled"}))};window.addEventListener("message",u)})}var w=g;export{g as SettoSDK,w as default};
//# sourceMappingURL=index.mjs.map