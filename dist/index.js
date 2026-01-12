var m={local:"http://localhost:3100",development:"https://dev-wallet.settopay.com",production:"https://wallet.settopay.com"};function l(a){return m[a]}var t={USER_CANCELLED:"USER_CANCELLED",PAYMENT_FAILED:"PAYMENT_FAILED",INSUFFICIENT_BALANCE:"INSUFFICIENT_BALANCE",TRANSACTION_REJECTED:"TRANSACTION_REJECTED",NETWORK_ERROR:"NETWORK_ERROR",SESSION_EXPIRED:"SESSION_EXPIRED",INVALID_PARAMS:"INVALID_PARAMS",INVALID_MERCHANT:"INVALID_MERCHANT"},r=class extends Error{constructor(e,n){super(n??e),this.name="SettoError",this.code=e;}isUserCancelled(){return this.code===t.USER_CANCELLED}isPaymentError(){return [t.PAYMENT_FAILED,t.INSUFFICIENT_BALANCE,t.TRANSACTION_REJECTED].includes(this.code)}};var d={SUCCESS:"success",FAILED:"failed",CANCELLED:"cancelled"},o={INIT_PAYMENT:"INIT_PAYMENT",PAYMENT_SUCCESS:"PAYMENT_SUCCESS",PAYMENT_FAILED:"PAYMENT_FAILED",PAYMENT_CANCELLED:"PAYMENT_CANCELLED"};var y=`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
`,c=`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 600px;
  max-width: 95vw;
  max-height: 90vh;
  border: none;
  border-radius: 12px;
  z-index: 10000;
`,p=class{constructor(e){this.iframe=null;this.overlay=null;this.messageHandler=null;this.rejectHandler=null;this.merchantId=e.merchantId,this.baseUrl=l(e.environment);}openPayment(e){return new Promise((n,E)=>{this.rejectHandler=E,this.createOverlay(),this.createIframe(),this.iframe.onload=()=>{let s={type:o.INIT_PAYMENT,merchantId:this.merchantId,orderId:e.orderId,amount:e.amount,currency:e.currency,idpToken:e.idpToken};this.iframe.contentWindow?.postMessage(s,this.baseUrl);},this.messageHandler=s=>{if(s.origin!==this.baseUrl)return;let{type:S,data:i}=s.data;switch(S){case o.PAYMENT_SUCCESS:this.cleanup(),n(i);break;case o.PAYMENT_FAILED:this.cleanup(),E(new r(t.PAYMENT_FAILED,i.error));break;case o.PAYMENT_CANCELLED:this.cleanup(),E(new r(t.USER_CANCELLED));break}},window.addEventListener("message",this.messageHandler);})}createOverlay(){this.overlay=document.createElement("div"),this.overlay.id="setto-overlay",this.overlay.style.cssText=y,this.overlay.onclick=e=>{if(e.target===this.overlay){let n=this.rejectHandler;this.cleanup(),n?.(new r(t.USER_CANCELLED));}},document.body.appendChild(this.overlay);}createIframe(){this.iframe=document.createElement("iframe"),this.iframe.id="setto-iframe",this.iframe.src=`${this.baseUrl}/embed`,this.iframe.style.cssText=c,document.body.appendChild(this.iframe);}cleanup(){this.messageHandler&&(window.removeEventListener("message",this.messageHandler),this.messageHandler=null),this.iframe?.remove(),this.overlay?.remove(),this.iframe=null,this.overlay=null,this.rejectHandler=null;}close(){let e=this.rejectHandler;this.cleanup(),e?.(new r(t.USER_CANCELLED));}};export{o as MESSAGE_TYPES,d as PaymentStatus,m as SETTO_ENVIRONMENTS,r as SettoError,t as SettoErrorCode,p as SettoSDK};//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map