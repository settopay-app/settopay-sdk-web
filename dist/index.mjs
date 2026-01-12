var y={dev:"https://dev-wallet.settopay.com",prod:"https://wallet.settopay.com"},p={SETTO_PAYMENT_SUCCESS:"SETTO_PAYMENT_SUCCESS",SETTO_PAYMENT_FAILED:"SETTO_PAYMENT_FAILED",SETTO_PAYMENT_CANCELLED:"SETTO_PAYMENT_CANCELLED"},i=null;function f(){if(!i)throw new Error("SettoSDK not initialized. Call SettoSDK.initialize() first.");return i}function r(...t){i?.debug&&console.log("[SettoSDK]",...t)}var g={initialize(t){if(i){console.warn("[SettoSDK] Already initialized");return}i=t,r("Initialized:",i)},async openPayment(t){let s=f(),o=y[s.environment];r("Requesting PaymentToken...");try{let e={merchant_id:t.merchantId,amount:t.amount};t.idpToken&&(e.idp_token=t.idpToken);let n=await(await fetch(`${o}/api/external/payment/token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json();if(n.payment_error||n.system_error)return r("PaymentToken error:",n),{status:"failed",error:n.payment_error||n.system_error};if(!n.payment_token)return r("PaymentToken not received"),{status:"failed",error:"Payment token not received"};let a=`${o}/pay/wallet#pt=${encodeURIComponent(n.payment_token)}`;return r("Opening payment page"),T(a,s)}catch(e){return r("PaymentToken request error:",e),{status:"failed",error:"Network error"}}},async getPaymentInfo(t){let s=f(),o=y[s.environment],e=await fetch(`${o}/api/external/payment/${t.paymentId}`,{headers:{"X-Merchant-ID":t.merchantId}});if(!e.ok)throw new Error(`Failed to get payment info: ${e.status}`);return e.json()},isInitialized(){return i!==null},reset(){i=null}};function T(t,s){return new Promise(o=>{let e=document.createElement("div");e.id="setto-overlay",e.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 99999;
      pointer-events: none;
    `;let d=document.createElement("iframe");d.id="setto-iframe",d.src=t,d.allow="clipboard-write",d.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      pointer-events: auto;
    `,e.appendChild(d),document.body.appendChild(e);let n=()=>{window.removeEventListener("message",u),e.remove()},a=c=>{c.key==="Escape"&&(r("Payment cancelled by user (ESC key)"),n(),window.removeEventListener("keydown",a),o({status:"cancelled"}))};window.addEventListener("keydown",a);let u=c=>{let E=y[s.environment];if(c.origin!==E)return;let{type:m,data:l}=c.data;r("Received message:",m,l),m===p.SETTO_PAYMENT_SUCCESS?(n(),window.removeEventListener("keydown",a),o({status:"success",paymentId:l.paymentId,txHash:l.txHash})):m===p.SETTO_PAYMENT_FAILED?(n(),window.removeEventListener("keydown",a),o({status:"failed",error:l.error})):m===p.SETTO_PAYMENT_CANCELLED&&(n(),window.removeEventListener("keydown",a),o({status:"cancelled"}))};window.addEventListener("message",u)})}var w=g;export{g as SettoSDK,w as default};
//# sourceMappingURL=index.mjs.map