var u={dev:"https://dev-wallet.settopay.com",prod:"https://wallet.settopay.com"},p={SETTO_PAYMENT_SUCCESS:"SETTO_PAYMENT_SUCCESS",SETTO_PAYMENT_FAILED:"SETTO_PAYMENT_FAILED",SETTO_PAYMENT_CANCELLED:"SETTO_PAYMENT_CANCELLED"},s=null;function f(){if(!s)throw new Error("SettoSDK not initialized. Call SettoSDK.initialize() first.");return s}function i(...t){s?.debug&&console.log("[SettoSDK]",...t)}var g={initialize(t){if(s){console.warn("[SettoSDK] Already initialized");return}s=t,i("Initialized:",s)},async openPayment(t){let d=f(),o=u[d.environment];i("Requesting PaymentToken...");try{let e={merchant_id:t.merchantId,amount:t.amount};t.idpToken&&(e.idp_token=t.idpToken);let n=await(await fetch(`${o}/api/external/payment/token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json();if(n.payment_error||n.system_error)return i("PaymentToken error:",n),{status:"failed",error:n.payment_error||n.system_error};if(!n.payment_token)return i("PaymentToken not received"),{status:"failed",error:"Payment token not received"};let a=`${o}/pay/wallet#pt=${encodeURIComponent(n.payment_token)}`;return i("Opening payment page"),T(a,d)}catch(e){return i("PaymentToken request error:",e),{status:"failed",error:"Network error"}}},async getPaymentInfo(t){let d=f(),o=u[d.environment],e=await fetch(`${o}/api/external/payment/${t.paymentId}`,{headers:{"X-Merchant-ID":t.merchantId}});if(!e.ok)throw new Error(`Failed to get payment info: ${e.status}`);return e.json()},isInitialized(){return s!==null},reset(){s=null}};function T(t,d){return new Promise(o=>{let e=document.createElement("div");e.id="setto-overlay",e.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 99999;
      pointer-events: none;
    `;let c=document.createElement("iframe");c.id="setto-iframe",c.src=t,c.allow="clipboard-write",c.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      pointer-events: auto;
    `,e.appendChild(c),document.body.appendChild(e);let n=()=>{window.removeEventListener("message",y),e.remove()},a=m=>{m.key==="Escape"&&(i("Payment cancelled by user (ESC key)"),n(),window.removeEventListener("keydown",a),o({status:"cancelled"}))};window.addEventListener("keydown",a);let y=m=>{let E=u[d.environment];if(m.origin!==E)return;let{type:l,data:r}=m.data;i("Received message:",l,r),l===p.SETTO_PAYMENT_SUCCESS?(n(),window.removeEventListener("keydown",a),o({status:"success",paymentId:r.paymentId,txHash:r.txHash,fromAddress:r.fromAddress,toAddress:r.toAddress,amount:r.amount,chainId:r.chainId,tokenSymbol:r.tokenSymbol})):l===p.SETTO_PAYMENT_FAILED?(n(),window.removeEventListener("keydown",a),o({status:"failed",error:r.error})):l===p.SETTO_PAYMENT_CANCELLED&&(n(),window.removeEventListener("keydown",a),o({status:"cancelled"}))};window.addEventListener("message",y)})}var S=g;export{g as SettoSDK,S as default};
//# sourceMappingURL=index.mjs.map