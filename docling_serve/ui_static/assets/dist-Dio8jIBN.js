var e=Object.defineProperty,t=Object.getOwnPropertyDescriptor,n=(n,r,i,a)=>{for(var o=a>1?void 0:a?t(r,i):r,s=n.length-1,c;s>=0;s--)(c=n[s])&&(o=(a?c(r,i,o):c(o))||o);return a&&o&&e(r,i,o),o},r=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer((()=>{customElements.define(e,t)}))},i=class{get shadowRoot(){return this.__host.__shadowRoot}constructor(e){this.ariaAtomic=``,this.ariaAutoComplete=``,this.ariaBrailleLabel=``,this.ariaBrailleRoleDescription=``,this.ariaBusy=``,this.ariaChecked=``,this.ariaColCount=``,this.ariaColIndex=``,this.ariaColSpan=``,this.ariaCurrent=``,this.ariaDescription=``,this.ariaDisabled=``,this.ariaExpanded=``,this.ariaHasPopup=``,this.ariaHidden=``,this.ariaInvalid=``,this.ariaKeyShortcuts=``,this.ariaLabel=``,this.ariaLevel=``,this.ariaLive=``,this.ariaModal=``,this.ariaMultiLine=``,this.ariaMultiSelectable=``,this.ariaOrientation=``,this.ariaPlaceholder=``,this.ariaPosInSet=``,this.ariaPressed=``,this.ariaReadOnly=``,this.ariaRequired=``,this.ariaRoleDescription=``,this.ariaRowCount=``,this.ariaRowIndex=``,this.ariaRowSpan=``,this.ariaSelected=``,this.ariaSetSize=``,this.ariaSort=``,this.ariaValueMax=``,this.ariaValueMin=``,this.ariaValueNow=``,this.ariaValueText=``,this.role=``,this.form=null,this.labels=[],this.states=new Set,this.validationMessage=``,this.validity={},this.willValidate=!0,this.__host=e}checkValidity(){return console.warn("`ElementInternals.checkValidity()` was called on the server.This method always returns true."),!0}reportValidity(){return!0}setFormValue(){}setValidity(){}},a=function(e,t,n,r,i){if(r===`m`)throw TypeError(`Private method is not writable`);if(r===`a`&&!i)throw TypeError(`Private accessor was defined without a setter`);if(typeof t==`function`?e!==t||!i:!t.has(e))throw TypeError(`Cannot write private member to an object whose class did not declare it`);return r===`a`?i.call(e,n):i?i.value=n:t.set(e,n),n},o=function(e,t,n,r){if(n===`a`&&!r)throw TypeError(`Private accessor was defined without a getter`);if(typeof t==`function`?e!==t||!r:!t.has(e))throw TypeError(`Cannot read private member from an object whose class did not declare it`);return n===`m`?r:n===`a`?r.call(e):r?r.value:t.get(e)},s,c,l,u,d,f,p,m,h,g,ee,te,ne=e=>typeof e==`boolean`?e:e?.capture??!1,re=0,ie=1,ae=2,oe=3,se=class{constructor(){this.__eventListeners=new Map,this.__captureEventListeners=new Map}addEventListener(e,t,n){if(t==null)return;let r=ne(n)?this.__captureEventListeners:this.__eventListeners,i=r.get(e);if(i===void 0)i=new Map,r.set(e,i);else if(i.has(t))return;let a=typeof n==`object`&&n?n:{};a.signal?.addEventListener(`abort`,()=>this.removeEventListener(e,t,n)),i.set(t,a??{})}removeEventListener(e,t,n){if(t==null)return;let r=ne(n)?this.__captureEventListeners:this.__eventListeners,i=r.get(e);i!==void 0&&(i.delete(t),i.size||r.delete(e))}dispatchEvent(e){let t=[this],n=this.__eventTargetParent;if(e.composed)for(;n;)t.push(n),n=n.__eventTargetParent;else for(;n&&n!==this.__host;)t.push(n),n=n.__eventTargetParent;let r=!1,i=!1,a=re,o=null,s=null,c=null,l=e.stopPropagation,u=e.stopImmediatePropagation;Object.defineProperties(e,{target:{get(){return o??s},..._},srcElement:{get(){return e.target},..._},currentTarget:{get(){return c},..._},eventPhase:{get(){return a},..._},composedPath:{value:()=>t,..._},stopPropagation:{value:()=>{r=!0,l.call(e)},..._},stopImmediatePropagation:{value:()=>{i=!0,u.call(e)},..._}});let d=(t,n,r)=>{typeof t==`function`?t(e):typeof t?.handleEvent==`function`&&t.handleEvent(e),n.once&&r.delete(t)},f=()=>(c=null,a=re,!e.defaultPrevented),p=t.slice().reverse();o=!this.__host||!e.composed?this:null;let m=e=>{for(s=this;s.__host&&e.includes(s.__host);)s=s.__host};for(let t of p){!o&&(!s||s===t.__host)&&m(p.slice(p.indexOf(t))),c=t,a=t===e.target?ae:ie;let n=t.__captureEventListeners.get(e.type);if(n){for(let[e,t]of n)if(d(e,t,n),i)return f()}if(r)return f()}let h=e.bubbles?t:[this];s=null;for(let t of h){!o&&(!s||t===s.__host)&&m(h.slice(0,h.indexOf(t)+1)),c=t,a=t===e.target?ae:oe;let n=t.__eventListeners.get(e.type);if(n){for(let[e,t]of n)if(d(e,t,n),i)return f()}if(r)return f()}return f()}},_={__proto__:null};_.enumerable=!0,Object.freeze(_);var ce=(g=class{constructor(e,t={}){if(s.set(this,!1),c.set(this,!1),l.set(this,!1),u.set(this,!1),d.set(this,Date.now()),f.set(this,!1),p.set(this,void 0),m.set(this,void 0),h.set(this,void 0),this.NONE=re,this.CAPTURING_PHASE=ie,this.AT_TARGET=ae,this.BUBBLING_PHASE=oe,arguments.length===0)throw Error(`The type argument must be specified`);if(typeof t!=`object`||!t)throw Error(`The "options" argument must be an object`);let{bubbles:n,cancelable:r,composed:i}=t;a(this,s,!!r,`f`),a(this,c,!!n,`f`),a(this,l,!!i,`f`),a(this,p,`${e}`,`f`),a(this,m,null,`f`),a(this,h,!1,`f`)}initEvent(e,t,n){throw Error(`Method not implemented.`)}stopImmediatePropagation(){this.stopPropagation()}preventDefault(){a(this,u,!0,`f`)}get target(){return o(this,m,`f`)}get currentTarget(){return o(this,m,`f`)}get srcElement(){return o(this,m,`f`)}get type(){return o(this,p,`f`)}get cancelable(){return o(this,s,`f`)}get defaultPrevented(){return o(this,s,`f`)&&o(this,u,`f`)}get timeStamp(){return o(this,d,`f`)}composedPath(){return o(this,h,`f`)?[o(this,m,`f`)]:[]}get returnValue(){return!o(this,s,`f`)||!o(this,u,`f`)}get bubbles(){return o(this,c,`f`)}get composed(){return o(this,l,`f`)}get eventPhase(){return o(this,h,`f`)?g.AT_TARGET:g.NONE}get cancelBubble(){return o(this,f,`f`)}set cancelBubble(e){e&&a(this,f,!0,`f`)}stopPropagation(){a(this,f,!0,`f`)}get isTrusted(){return!1}},s=new WeakMap,c=new WeakMap,l=new WeakMap,u=new WeakMap,d=new WeakMap,f=new WeakMap,p=new WeakMap,m=new WeakMap,h=new WeakMap,g.NONE=re,g.CAPTURING_PHASE=ie,g.AT_TARGET=ae,g.BUBBLING_PHASE=oe,g);Object.defineProperties(ce.prototype,{initEvent:_,stopImmediatePropagation:_,preventDefault:_,target:_,currentTarget:_,srcElement:_,type:_,cancelable:_,defaultPrevented:_,timeStamp:_,composedPath:_,returnValue:_,bubbles:_,composed:_,eventPhase:_,cancelBubble:_,stopPropagation:_,isTrusted:_});var le=(te=class extends ce{constructor(e,t={}){super(e,t),ee.set(this,void 0),a(this,ee,t?.detail??null,`f`)}initCustomEvent(e,t,n,r){throw Error(`Method not implemented.`)}get detail(){return o(this,ee,`f`)}},ee=new WeakMap,te);Object.defineProperties(le.prototype,{detail:_});var ue=ce,de=le;globalThis.Event??=ue,globalThis.CustomEvent??=de;var fe=new WeakMap,v=e=>{let t=fe.get(e);return t===void 0&&fe.set(e,t=new Map),t},pe=class extends se{constructor(){super(...arguments),this.__shadowRootMode=null,this.__shadowRoot=null,this.__internals=null}get attributes(){return Array.from(v(this)).map(([e,t])=>({name:e,value:t}))}get shadowRoot(){return this.__shadowRootMode===`closed`?null:this.__shadowRoot}get localName(){return this.constructor.__localName}get tagName(){return this.localName?.toUpperCase()}setAttribute(e,t){v(this).set(e,String(t))}removeAttribute(e){v(this).delete(e)}toggleAttribute(e,t){if(this.hasAttribute(e)){if(t===void 0||!t)return this.removeAttribute(e),!1}else if(t===void 0||t)return this.setAttribute(e,``),!0;else return!1;return!0}hasAttribute(e){return v(this).has(e)}attachShadow(e){let t={host:this};return this.__shadowRootMode=e.mode,e&&e.mode===`open`&&(this.__shadowRoot=t),t}attachInternals(){if(this.__internals!==null)throw Error(`Failed to execute 'attachInternals' on 'HTMLElement': ElementInternals for the specified element was already attached.`);let e=new i(this);return this.__internals=e,e}getAttribute(e){return v(this).get(e)??null}},me=class extends pe{};globalThis.litServerRoot??=Object.defineProperty(new me,"localName",{get(){return`lit-server-root`}});var he=new class{constructor(){this.__definitions=new Map}define(e,t){if(this.__definitions.has(e))throw Error(`Failed to execute 'define' on 'CustomElementRegistry': the name "${e}" has already been used with this registry`);t.__localName=e,this.__definitions.set(e,{ctor:t,observedAttributes:t.observedAttributes??[]})}get(e){return this.__definitions.get(e)?.ctor}},y=globalThis,ge=y.ShadowRoot&&(y.ShadyCSS===void 0||y.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,_e=Symbol(),ve=new WeakMap,ye=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==_e)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(ge&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=ve.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&ve.set(t,e))}return e}toString(){return this.cssText}},be=e=>new ye(typeof e==`string`?e:e+``,void 0,_e),b=(e,...t)=>new ye(e.length===1?e[0]:t.reduce(((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1]),e[0]),e,_e),xe=(e,t)=>{if(ge)e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(let n of t){let t=document.createElement(`style`),r=y.litNonce;r!==void 0&&t.setAttribute(`nonce`,r),t.textContent=n.cssText,e.appendChild(t)}},Se=ge||y.CSSStyleSheet===void 0?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return be(t)})(e):e,{is:Ce,defineProperty:we,getOwnPropertyDescriptor:Te,getOwnPropertyNames:Ee,getOwnPropertySymbols:De,getPrototypeOf:Oe}=Object,x=globalThis;x.customElements??=he;var ke=x.trustedTypes,Ae=ke?ke.emptyScript:``,je=x.reactiveElementPolyfillSupport,S=(e,t)=>e,Me={toAttribute(e,t){switch(t){case Boolean:e=e?Ae:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},Ne=(e,t)=>!Ce(e,t),Pe={attribute:!0,type:String,converter:Me,reflect:!1,useDefault:!1,hasChanged:Ne};Symbol.metadata??=Symbol(`metadata`),x.litPropertyMetadata??=new WeakMap;var C=class extends (globalThis.HTMLElement??me){static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Pe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&we(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=Te(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Pe}static _$Ei(){if(this.hasOwnProperty(S(`elementProperties`)))return;let e=Oe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(S(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(S(`properties`))){let e=this.properties,t=[...Ee(e),...De(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(Se(e))}else e!==void 0&&t.push(Se(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return xe(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?Me:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?Me:e.converter;this._$Em=r,this[r]=i.fromAttribute(t,e.type)??this._$Ej?.get(r)??null,this._$Em=null}}requestUpdate(e,t,n){if(e!==void 0){let r=this.constructor,i=this[e];if(n??=r.getPropertyOptions(e),!((n.hasChanged??Ne)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(e){}firstUpdated(e){}};C.elementStyles=[],C.shadowRootOptions={mode:`open`},C[S(`elementProperties`)]=new Map,C[S(`finalized`)]=new Map,je?.({ReactiveElement:C}),(x.reactiveElementVersions??=[]).push(`2.1.0`);var Fe={attribute:!0,type:String,converter:Me,reflect:!1,hasChanged:Ne},Ie=(e=Fe,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e)}}throw Error(`Unsupported decorator location: `+r)};function w(e){return(t,n)=>typeof n==`object`?Ie(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}var Le=[];function Re(e){let t=r(e);return function(e,n){return Le.push(e),t(e,n)}}var ze=globalThis,Be=ze.trustedTypes,Ve=Be?Be.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,He=`$lit$`,T=`lit$${Math.random().toFixed(9).slice(2)}$`,Ue=`?`+T,We=`<${Ue}>`,E=ze.document===void 0?{createTreeWalker:()=>({})}:document,D=()=>E.createComment(``),O=e=>e===null||typeof e!=`object`&&typeof e!=`function`,Ge=Array.isArray,Ke=e=>Ge(e)||typeof e?.[Symbol.iterator]==`function`,qe=`[ 	
\f\r]`,k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Je=/-->/g,Ye=/>/g,A=RegExp(`>|${qe}(?:([^\\s"'>=/]+)(${qe}*=${qe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,`g`),Xe=/'/g,Ze=/"/g,Qe=/^(?:script|style|textarea|title)$/i,$e=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),j=$e(1),et=$e(2),M=Symbol.for(`lit-noChange`),N=Symbol.for(`lit-nothing`),tt=new WeakMap,P=E.createTreeWalker(E,129);function nt(e,t){if(!Ge(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return Ve===void 0?t:Ve.createHTML(t)}var rt=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=k;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===k?c[1]===`!--`?o=Je:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=A):(Qe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=A):o=Ye:o===A?c[0]===`>`?(o=i??k,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?A:c[3]===`"`?Ze:Xe):o===Ze||o===Xe?o=A:o===Je||o===Ye?o=k:(o=A,i=void 0);let d=o===A&&e[t+1].startsWith(`/>`)?` `:``;a+=o===k?n+We:l>=0?(r.push(s),n.slice(0,l)+He+n.slice(l)+T+d):n+T+(l===-2?t:d)}return[nt(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},it=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=rt(t,n);if(this.el=e.createElement(l,r),P.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=P.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(He)){let t=u[o++],n=i.getAttribute(e).split(T),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?ct:r[1]===`?`?lt:r[1]===`@`?ut:st}),i.removeAttribute(e)}else e.startsWith(T)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(Qe.test(i.tagName)){let e=i.textContent.split(T),t=e.length-1;if(t>0){i.textContent=Be?Be.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],D()),P.nextNode(),c.push({type:2,index:++a});i.append(e[t],D())}}}else if(i.nodeType===8){if(i.data===Ue)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(T,e+1))!==-1;)c.push({type:7,index:a}),e+=T.length-1}}a++}}static createElement(e,t){let n=E.createElement(`template`);return n.innerHTML=e,n}};function F(e,t,n=e,r){if(t===M)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=O(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=F(e,i._$AS(e,t.values),i,r)),t}var at=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??E).importNode(t,!0);P.currentNode=r;let i=P.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new ot(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new dt(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=P.nextNode(),a++)}return P.currentNode=E,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},ot=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=N,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=F(this,e,t),O(e)?e===N||e==null||e===``?(this._$AH!==N&&this._$AR(),this._$AH=N):e!==this._$AH&&e!==M&&this._(e):e._$litType$===void 0?e.nodeType===void 0?Ke(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==N&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=it.createElement(nt(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new at(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=tt.get(e.strings);return t===void 0&&tt.set(e.strings,t=new it(e)),t}k(t){Ge(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(D()),this.O(D()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e&&e!==this._$AB;){let t=e.nextSibling;e.remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},st=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=N,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=N}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=F(this,e,t,0),a=!O(e)||e!==this._$AH&&e!==M,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=F(this,r[n+o],t,o),s===M&&(s=this._$AH[o]),a||=!O(s)||s!==this._$AH[o],s===N?e=N:e!==N&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===N?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},ct=class extends st{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===N?void 0:e}},lt=class extends st{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==N)}},ut=class extends st{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=F(this,e,t,0)??N)===M)return;let n=this._$AH,r=e===N&&n!==N||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==N&&(n===N||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},dt=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){F(this,e)}},ft=ze.litHtmlPolyfillSupport;ft?.(it,ot),(ze.litHtmlVersions??=[]).push(`3.3.0`);var pt=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new ot(t.insertBefore(D(),e),e,void 0,n??{})}return i._$AI(e),i},mt=globalThis,I=class extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=pt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return M}};I._$litElement$=!0,I.finalized=!0,mt.litElementHydrateSupport?.({LitElement:I});var ht=mt.litElementPolyfillSupport;ht?.({LitElement:I}),(mt.litElementVersions??=[]).push(`4.2.0`);var L=class extends I{render(){if(this.annotation&&this.item&&this.page&&this.canDrawAnnotation(this.annotation)&&this.canDrawItem(this.item))return this.renderAnnotation(this.annotation,this.item,this.page,this.prov)}};n([w({attribute:!1})],L.prototype,`annotation`,2),n([w({attribute:!1})],L.prototype,`item`,2),n([w({attribute:!1})],L.prototype,`page`,2),n([w({attribute:!1})],L.prototype,`prov`,2);function R(...e){return function(t){return V.DocItem(t)&&e.includes(t.label)}}var z={CodeItem:R(`code`),FieldHeadingItem:R(`field_heading`),FieldItem:R(`field_item`),FieldRegionItem:R(`field_region`),FieldValueItem:R(`field_value`),FormItem:R(`form`),FormulaItem:R(`formula`),KeyValueItem:R(`key_value_region`),ListItem:R(`list_item`),PictureItem:R(`chart`,`picture`),SectionHeaderItem:R(`section_header`),TableItem:R(`document_index`,`table`),TextItem:R(`caption`,`checkbox_selected`,`checkbox_unselected`,`empty_value`,`field_hint`,`field_key`,`footnote`,`grading_scale`,`handwritten_text`,`marker`,`page_footer`,`page_header`,`paragraph`,`reference`,`text`),TitleItem:R(`title`)};function B(...e){return function(t){return e.includes(t.kind)}}var gt={PictureBarChart:B(`bar_chart_data`),PictureClassification:B(`classification`),PictureDescription:B(`description`),PictureMisc:B(`misc`),PictureMolecule:B(`molecule_data`),PictureLineChart:B(`line_chart_data`),PicturePieChart:B(`pie_chart_data`),PictureScatterChart:B(`scatter_chart_data`),PictureStackedBarChart:B(`stacked_bar_chart_data`),PictureTabularChart:B(`tabular_chart_data`)},V={DocItem(e){return V.NodeItem(e)&&!V.GroupItem(e)},Document(e){return`schema_name`in e&&e.schema_name===`DoclingDocument`},GroupItem(e){return V.NodeItem(e)&&(e.self_ref.startsWith(`#/groups/`)||e.self_ref===`#/body`||e.self_ref===`#/furniture`)},ListGroup(e){return V.GroupItem(e)&&`label`in e&&e.label===`list`},OrderedList(e){return V.GroupItem(e)&&`label`in e&&e.label===`ordered_list`},InlineGroup(e){return V.GroupItem(e)&&`label`in e&&e.label===`inline`},NodeItem(e){return`self_ref`in e},...gt,...z};function*_t(e,t={}){e&&(yield*n(t.root??e.body));function*n(r,i=0){(!V.GroupItem(r)||t.withGroups)&&(V.DocItem(r)?(t.pageNo===void 0||r.prov?.some(e=>e.page_no===t.pageNo))&&(yield[r,i]):yield[r,i]);let a=V.PictureItem(r),o=new Set(a?(r.captions??[]).map(e=>e.$ref):[]);for(let s of r.children??[]){if(a&&!t.traversePictures&&!o.has(s.$ref))continue;let r=vt(e,s);V.NodeItem(r)&&(yield*n(r,i+1))}}}function vt(e,t){return t.$ref.split(`/`).slice(1).reduce((e,t)=>e[t],e)}var H=class extends L{constructor(){super(...arguments),this.precision=2}renderAnnotation(e,t,n,r){let i=e.predicted_classes??[],a=10**(-1*this.precision),o=i.filter(e=>a<e.confidence),s=i.filter(e=>e.confidence<a),c=e=>e.toLocaleString(void 0,{maximumFractionDigits:this.precision});return j`<table>
      <thead>
        <tr>
          <th>Class</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>
        ${o.map(({class_name:e,confidence:t})=>j`<tr>
              <td>${e}</td>
              <td>${c(t)}</td>
            </tr>`)}
        ${s.length===0?N:j`<tr
                class="more"
                title=${s.map(e=>`${e.class_name}			${e.confidence}`).join(`
`)}
              >
                <td>${s.length} more</td>
                <td>< ${c(a)}</td>
              </tr>`}
      </tbody>
    </table>`}canDrawAnnotation(e){return gt.PictureClassification(e)}canDrawItem(e){return z.PictureItem(e)}};H.styles=b`
    table {
      margin: 0.5rem;
      font-size: inherit;
      line-height: 1.25;
    }

    td,
    th {
      padding: 0 1rem 0 0;
    }

    th {
      font-weight: bold;
      text-align: left;
    }

    tr.more td {
      padding-top: 0.25rem;
      color: gray;
    }
  `,n([w()],H.prototype,`precision`,2),H=n([Re(`docling-picture-classification`)],H);var yt=class extends L{renderAnnotation(e,t,n,r){return j`<p><span>Description</span>${e.text}</p>`}canDrawAnnotation(e){return gt.PictureDescription(e)}canDrawItem(e){return z.PictureItem(e)}};yt.styles=b`
    p {
      margin: 0.5rem;
      font-size: inherit;
      line-height: 1.25;
      white-space: pre-line;
    }

    span {
      padding-right: 0.5rem;
      font-weight: bold;
    }
  `,yt=n([Re(`docling-picture-description`)],yt);var bt=[];function U(e){let t=r(e);return function(e,n){return bt.push(e),t(e,n)}}var W=class extends I{render(){if(this.item&&this.page&&this.canDrawItem(this.item)){let e=this.item.level??0;return this.setAttribute(`data-level`,String(e)),this.style.setProperty(`--docling-level`,String(e)),this.setAttribute(`data-layer`,this.item.content_layer??``),this.renderItem(this.item,this.page,this.prov)}}static{this.styles=b`
    :host([data-layer='furniture']) {
      opacity: 0.33;
    }
  `}};n([w({attribute:!1})],W.prototype,`item`,2),n([w({attribute:!1})],W.prototype,`page`,2),n([w({attribute:!1})],W.prototype,`prov`,2);var xt=class extends W{renderItem(e,t,n){return j`
      <div class="code-block">
        ${e.code_language?j`<span class="lang">${e.code_language}</span>`:N}
        <pre><code>${e.text}</code></pre>
      </div>
    `}canDrawItem(e){return z.CodeItem(e)}};xt.styles=b`
    .code-block {
      position: relative;
      margin: 0;
      background: #f4f4f4;
      border-left: 3px solid #bbb;
      border-radius: 2px;
      overflow: auto;
    }

    .lang {
      position: absolute;
      top: 0.15rem;
      right: 0.4rem;
      font-size: 0.65rem;
      color: #888;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    pre {
      margin: 0;
      padding: 0.4rem 0.5rem;
      font-size: 0.75rem;
      line-height: 1.4;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      font-family: monospace;
    }

    code {
      font-family: inherit;
    }
  `,xt=n([U(`docling-item-code`)],xt);var St=class extends W{renderItem(e,t,n){let r=e.graph?.cells??[],i=e.graph?.links??[],a=new Map(r.map(e=>[e.cell_id,e])),o=[];for(let e of i)if(e.label===`to_value`){let t=a.get(e.source_cell_id),n=a.get(e.target_cell_id);t&&n&&o.push({key:t.text,value:n.text})}if(o.length===0){let e=r.filter(e=>e.label===`key`),t=r.filter(e=>e.label===`value`),n=Math.max(e.length,t.length);for(let r=0;r<n;r++)o.push({key:e[r]?.text??``,value:t[r]?.text??``})}return o.length===0?j`${N}`:j`
      <table class="kv">
        <tbody>
          ${o.map(({key:e,value:t})=>j`
              <tr>
                <td class="key">${e}</td>
                <td class="value">${t}</td>
              </tr>
            `)}
        </tbody>
      </table>
    `}canDrawItem(e){return z.KeyValueItem(e)}};St.styles=b`
    .kv {
      border-collapse: collapse;
      font-size: 75%;
      line-height: 1.25;
      width: 100%;
    }

    td {
      padding: 0.1rem 0.3rem;
      border: 1px solid rgb(220, 220, 220);
      vertical-align: top;
      word-break: break-word;
    }

    td.key {
      font-weight: bold;
      white-space: nowrap;
      color: #444;
      width: 40%;
    }

    td.value {
      color: #111;
    }
  `,St=n([U(`docling-item-key-value`)],St);var G=class extends W{renderItem(e,t){let{image:n}=t,r=e.prov?.find(e=>e.page_no===this.page?.page_no);if(n&&r){let{width:e=1,height:i=1}=this.page.size,{l:a,r:o,t:s,b:c}=J(r.bbox,t),l=(n.size.width??1)/e,u=(o-a)*l,d=(c-s)*l;return j`
        <svg
          data-width=${u}
          data-height=${d}
          style="--docling-width: ${u}px; --docling-height: ${d}px;"
          viewBox="${a} ${s} ${o-a} ${c-s}"
        >
          <image href=${n.uri} width=${e} height=${i} />
        </svg>
      `}return j`<span>Invalid provenance.</span>`}canDrawItem(e){return V.DocItem(e)}};G.styles=b`
    svg {
      width: calc(
        var(--docling-width, 100%) * var(--docling-provenance-scale, 1)
      );
      max-width: 100%;
    }
  `,G=n([r(`docling-item-provenance`)],G);var Ct=class extends W{renderItem(e){let t=new Set;return j`
      <div class="container">
        <table>
          <tbody>
            ${e.data.grid.map(e=>j`<tr>
                  ${e.map(e=>{if(!n(e))return j`<td
                        class=${e.column_header||e.row_header?`header`:``}
                        colspan=${e.col_span??1}
                        rowspan=${e.row_span??1}
                      >
                        ${e.text}
                      </td>`})}
                </tr>`)}
          </tbody>
        </table>
      </div>
    `;function n(e){let n=t.has([e.start_col_offset_idx,e.start_row_offset_idx].join());if(!n)for(let n=e.start_col_offset_idx;n<e.end_col_offset_idx;n++)for(let r=e.start_row_offset_idx;r<e.end_row_offset_idx;r++)t.add([n,r].join());return n}}canDrawItem(e){return z.TableItem(e)}};Ct.styles=b`
    .container {
      position: relative;
      min-width: 0;
      max-width: 100%;
      min-height: 0;
      overflow: auto;
    }

    table {
      border-collapse: collapse;
      font-size: 75%;
      line-height: 1.25;
    }

    td {
      padding: 0.125rem 0.25rem;
      background-color: var(--cds-layer);
      border: 1px solid rgb(220, 220, 220);

      color: black;
      text-decoration: none;
      word-break: normal;
      text-align: left;
    }

    td.header {
      font-weight: bold;
    }

    td:hover {
      filter: brightness(95%);
    }

    td:target {
      outline: 3px solid blue;
    }
  `,Ct=n([U(`docling-item-table`)],Ct);var wt=class extends W{constructor(){super(...arguments),this.renderItem=Function(`item`,`page`,`"use strict"; return this.html\`${this.innerHTML}\`;`).bind({html:j})}canDrawItem(e){return V.DocItem(e)}};wt=n([r(`docling-item-template`)],wt);var Tt=class extends W{renderItem(e,t,n){let r=e.formatting,i=[r?.bold?`font-weight:bold`:``,r?.italic?`font-style:italic`:``,r?.underline?`text-decoration:underline`:``,r?.strikethrough?`text-decoration:line-through`:``].filter(Boolean).join(`;`);if(n){let{l:r,r:a,t:o,b:s}=J(n.bbox,t),c=Math.sqrt((a-r)*(s-o)/e.text.length),l=Math.min(Math.floor(1.25*c),(s-o)/1.25),[u,d]=n.charspan??[0,e.text.length],f=e.text.substring(u,d);return j`<p
        class=${this.textClass(e)}
        style="font-size:${l}px;line-height:${1.25*l}px;${i}"
      >
        ${this.listPrefix(e)}${f}
      </p>`}return j`<p class=${this.textClass(e)} style=${i||N}>
        ${this.listPrefix(e)}${e.text}
      </p>`}textClass(e){if(z.TitleItem(e))return`title`;if(z.SectionHeaderItem(e)){let t=e.level??1;return`header header-${Math.min(t,6)}`}return z.ListItem(e)?`list-item`:``}listPrefix(e){if(!z.ListItem(e))return N;let t=e;return t.marker?j`<span class="marker">${t.marker}</span>`:t.enumerated?j`<span class="marker bullet">•</span>`:j`<span class="marker bullet">–</span>`}canDrawItem(e){return z.TextItem(e)||z.TitleItem(e)||z.SectionHeaderItem(e)||z.ListItem(e)||z.FormulaItem(e)}};Tt.styles=b`
    p {
      margin: 0;
      overflow-wrap: anywhere;
      font-size: 1rem;
      line-height: 1.25rem;
    }

    .title {
      font-size: 1.1rem;
      font-weight: bold;
    }

    /* header-1 is largest (document section), header-6 is smallest. */
    .header {
      font-weight: bold;
    }
    .header-1 {
      font-size: 1rem;
    }
    .header-2 {
      font-size: 0.95rem;
    }
    .header-3 {
      font-size: 0.9rem;
    }
    .header-4,
    .header-5,
    .header-6 {
      font-size: 0.85rem;
    }

    .list-item {
      display: flex;
      gap: 0.25rem;
    }

    .marker {
      flex-shrink: 0;
      min-width: 1rem;
    }
  `,Tt=n([U(`docling-item-text`)],Tt);var K=class extends W{get itemChildren(){return Array.from(this.childNodes??[]).filter(e=>e instanceof W)}get annotationChildren(){return Array.from(this.childNodes).filter(e=>e instanceof L)}get isCustomized(){return this.itemChildren.length>0||this.annotationChildren.length>0}renderItem(e,t,n){let r=[],i=this.isCustomized;i?this.itemChildren.filter(t=>t.canDrawItem(e)).forEach(e=>r.push(e)):bt.filter(t=>t.prototype.canDrawItem(e)).forEach(e=>r.push(new e));let a=[];if(z.PictureItem(e)){let t=e.meta;if(t?.description?.text){let e={kind:`description`,text:t.description.text,provenance:t.description.created_by??``};a.push(e)}t?.classification?.predictions?.length&&a.push({kind:`classification`,provenance:`meta`,predicted_classes:t.classification.predictions.map(e=>({class_name:e.class_name,confidence:e.confidence??1}))})}for(let t of a){let n=[];i?this.annotationChildren.filter(e=>e.canDrawItem(e)&&e.canDrawAnnotation(t)).forEach(e=>n.push(e.cloneNode(!0))):Le.filter(n=>n.prototype.canDrawItem(e)&&n.prototype.canDrawAnnotation(t)).forEach(e=>n.push(new e));for(let e of n)e.annotation=t;r.push(...n)}for(let i of r)i.item=e,i.page=t,i.prov=n;return j`${r}`}canDrawItem(e){return V.DocItem(e)&&this.isCustomized?this.itemChildren.some(t=>t.canDrawItem(e))||this.annotationChildren.some(t=>t.canDrawItem(e)&&e.annotations?.some(e=>t.canDrawAnnotation(e))):bt.some(t=>t.prototype.canDrawItem(e))||Le.some(t=>t.prototype.canDrawItem(e)&&e.annotations?.some(e=>t.prototype.canDrawAnnotation(e)))}};K=n([r(`docling-view`)],K);var q=class extends K{constructor(){super(...arguments),this.type=`overlay`}};q=n([r(`docling-overlay`)],q);var Et=class extends K{constructor(){super(...arguments),this.type=`tooltip`}};Et=n([r(`docling-tooltip`)],Et);function J(e,t){let{height:n=1}=t.size;return e.coord_origin===`TOPLEFT`?e:{...e,t:n-e.t,b:n-e.b}}var Y=class extends I{constructor(){super(...arguments),this.pagenumbers=!1}render(){if(this.page?.image){let{image:e,size:t,page_no:n}=this.page,{width:r=1,height:i=1}=t,a=this.onClickItem&&this.page?(e,t)=>this.onClickItem?.(e,this.page,t):void 0;return j`
        <div class="page" @onclick=${e=>a?.(e)}>
          <svg
            class="base"
            width=${e.size.width}
            viewBox="0 0 ${r} ${i}"
          >
            ${this.backdrop?et`
                <image
                  class="backdrop"
                  href=${e.uri}
                  width=${r}
                  height=${i}
                />

                <clippath id="clip-page-${n}">
                  ${this.items?.map(e=>{let t=e.prov?.find(e=>e.page_no===n);if(t){let{l:e,r:n,t:r,b:i}=J(t.bbox,this.page);return et`<rect
                        x=${e}
                        y=${r}
                        width=${n-e}
                        height=${i-r}
                      />`}})}
                </clippath>
              `:N}

            <image
              id="image"
              href=${e.uri}
              clip-path="url(#clip-page-${n})"
              width=${r}
              height=${i}
            />

            ${this.items?.flatMap(e=>(e.prov??[]).filter(e=>e.page_no===n).map(t=>{let{l:n,r,t:i,b:o}=J(t.bbox,this.page);return et`
                  ${this.layOver(e,t)}

                  <rect
                  part=${`item`+(this.itemPart?` `+this.itemPart(this.page,e):``)}
                  style=${this.itemStyle?.(this.page,e)}
                  x=${n}
                  y=${i}
                  width=${r-n}
                  height=${o-i}
                  vector-effect="non-scaling-stroke"
                  @click=${t=>{t.stopPropagation(),a?.(t,e)}}
                  @mouseenter=${n=>{let r=n.currentTarget.getBoundingClientRect(),i=[r.top*window.innerWidth,(window.innerWidth-r.right)*window.innerHeight,(window.innerHeight-r.bottom)*window.innerWidth,r.left*window.innerHeight],a=Math.max(...i),o=i.findIndex(e=>e===a);this.attachTooltip(e,t,r,o)}}
                  @mouseleave=${()=>this.removeTooltip()}
                  />
                `}))}
          </svg>

          ${this.renderTrace()}
          ${this.pagenumbers?j`<header
                    part="page-number-top"
                    class="page-number-top"
                    title="Page ${n}"
                  >
                    ${n}
                  </header>

                  <header
                    part="page-number-bottom"
                    class="page-number-bottom"
                    title="Page ${n}"
                  >
                    ${n}
                  </header>`:N}
        </div>
      `}return j`Invalid page image.`}layOver(e,t){if(this.overlay?.canDrawItem(e)){let n=this.overlay.cloneNode(!0);n.item=e,n.page=this.page,n.prov=t;let{l:r,r:i,t:a,b:o}=J(t.bbox,this.page);return et`<foreignObject part="overlay" class=${z.PictureItem(e)?`softOverlay`:`hardOverlay`} x=${r} y=${a} width=${i-r} height=${o-a}>${n}</foreignObject>`}}attachTooltip(e,t,n,r){if(this.tooltip?.canDrawItem(e)){let i=this.tooltip.cloneNode(!0);i.id=`tooltip`,i.setAttribute(`part`,`tooltip`),i.className=`tooltip`,i.setAttribute(`style`,`
        ${r===1?`left: ${n.right}px`:r===3?`right: ${window.outerWidth-n.left}px`:`left: calc(${n.left}px - 2rem)`};
        ${r===0?`bottom: ${window.innerHeight-n.top}px`:r===2?`top: ${n.bottom}px`:`top: calc(${n.top}px - 2rem)`};
        max-width: ${2*Math.max(t.bbox.r-t.bbox.l,200)}px;
        `),i.item=e,i.page=this.page,this.renderRoot.appendChild(i)}}removeTooltip(){this.renderRoot.querySelector(`#tooltip`)?.remove()}renderTrace(){if(this.trace){let e=this.trace.cloneNode(!0);return e.page=this.page,e.items=this.items,e}}};Y.styles=b`
    .page {
      position: relative;
      width: fit-content;
      color: black;
    }

    .base {
      max-width: 100%;
    }

    svg:not(.base) {
      position: absolute;
      inset: 0;
    }

    .backdrop {
      opacity: 0.3;
    }

    .page-number-top,
    .page-number-bottom {
      position: absolute;
      left: 0;
      width: fit-content;
      padding: 0 0.25rem;

      font-size: 0.75rem;
      line-height: 1rem;
      color: rgb(120, 120, 120);
      mix-blend-mode: difference;
    }

    .page-number-top {
      top: 0;
    }

    .page-number-bottom {
      bottom: 0;
    }

    rect {
      fill: blue;
      fill-opacity: 0.0001; /* To activate hover. */
      stroke: grey;
      stroke-width: 1px;
      stroke-dasharray: 1;
      cursor: pointer;
    }

    rect:hover {
      fill-opacity: 0.1;
      stroke: blue;
    }

    rect:target {
      stroke: blue;
      stroke-width: 3px;
      stroke-dasharray: none;
    }

    .hardOverlay,
    .softOverlay {
      font-size: 62.5%;
      background-color: white;
    }

    .softOverlay {
      opacity: 0.9;
    }

    .tooltip {
      position: fixed;
      z-index: 100;
      padding: 1rem;
      margin: 1rem;

      background: white;
      border: 1px solid rgb(230, 230, 230);
      box-shadow: 0 0.5rem 1rem 0 rgba(0, 0, 0, 0.2);
    }
  `,n([w({type:Object})],Y.prototype,`page`,2),n([w({type:Array})],Y.prototype,`items`,2),n([w({type:Boolean})],Y.prototype,`pagenumbers`,2),n([w()],Y.prototype,`itemPart`,2),n([w()],Y.prototype,`itemStyle`,2),n([w()],Y.prototype,`onClickItem`,2),n([w({type:Boolean})],Y.prototype,`backdrop`,2),n([w({type:Object})],Y.prototype,`overlay`,2),n([w({type:Object})],Y.prototype,`tooltip`,2),n([w({type:Object})],Y.prototype,`trace`,2),Y=n([r(`docling-img-page`)],Y);var Dt=Symbol(),Ot=class{get taskComplete(){return this.t||=this.i===1?new Promise(((e,t)=>{this.o=e,this.h=t})):this.i===3?Promise.reject(this.l):Promise.resolve(this.u),this.t}constructor(e,t,n){this.p=0,this.i=0,(this._=e).addController(this);let r=typeof t==`object`?t:{task:t,args:n};this.v=r.task,this.j=r.args,this.m=r.argsEqual??kt,this.k=r.onComplete,this.A=r.onError,this.autoRun=r.autoRun??!0,`initialValue`in r&&(this.u=r.initialValue,this.i=2,this.O=this.T?.())}hostUpdate(){!0===this.autoRun&&this.S()}hostUpdated(){this.autoRun===`afterUpdate`&&this.S()}T(){if(this.j===void 0)return;let e=this.j();if(!Array.isArray(e))throw Error(`The args function must return an array`);return e}async S(){let e=this.T(),t=this.O;this.O=e,e===t||e===void 0||t!==void 0&&this.m(t,e)||await this.run(e)}async run(e){let t,n;e??=this.T(),this.O=e,this.i===1?this.q?.abort():(this.t=void 0,this.o=void 0,this.h=void 0),this.i=1,this.autoRun===`afterUpdate`?queueMicrotask((()=>this._.requestUpdate())):this._.requestUpdate();let r=++this.p;this.q=new AbortController;let i=!1;try{t=await this.v(e,{signal:this.q.signal})}catch(e){i=!0,n=e}if(this.p===r){if(t===Dt)this.i=0;else{if(!1===i){try{this.k?.(t)}catch{}this.i=2,this.o?.(t)}else{try{this.A?.(n)}catch{}this.i=3,this.h?.(n)}this.u=t,this.l=n}this._.requestUpdate()}}abort(e){this.i===1&&this.q?.abort(e)}get value(){return this.u}get error(){return this.l}get status(){return this.i}render(e){switch(this.i){case 0:return e.initial?.();case 1:return e.pending?.();case 2:return e.complete?.(this.value);case 3:return e.error?.(this.error);default:throw Error(`Unexpected status: `+this.i)}}},kt=(e,t)=>e===t||e.length===t.length&&e.every(((e,n)=>!Ne(e,t[n])));function At(e){return Object.values(e?.pages??{}).sort((e,t)=>e.page_no-t.page_no)}async function jt(e,t={}){let n;typeof e==`string`?n=await(await fetch(e)).json():typeof e==`object`&&V.Document(e)&&(n=e);let r=At(n),i=Array.from(_t(n,{traversePictures:!0})).map(([e,t])=>Object.assign(e,{level:t})),a=i,o=new Set;if(typeof t.items==`string`){let e=new Set(t.items.split(`,`).map(e=>e.trim()).filter(e=>e.length>0));if(e.size>0){a=[];for(let t of i){let n=t.self_ref.split(`/`),r=[];for(let e=2;e<n.length+1;e++)r.push(n.slice(0,e).join(`/`));t.prov?.forEach(e=>r.push(`#/pages/${e.page_no}`)),r.some(t=>e.has(t))?a.push(t):t.prov?.forEach(e=>o.add(e.page_no))}}}else if(Array.isArray(t.items)){a=[];let e=new Set(t.items);for(let t of i)e.has(t)?a.push(t):t.prov?.forEach(e=>o.add(e.page_no))}let s={};for(let e of r)s[e.page_no]=[];for(let e of a)for(let t of e.prov??[])s[t.page_no].at(-1)!==e&&s[t.page_no].push(e);return r.map(e=>({page:e,items:s[e.page_no],trimmed:o.has(e.page_no)}))}var X=class extends I{render(){if(this.page&&this.items&&this.items.length>0){let{page_no:e,size:t}=this.page,{width:n=1,height:r=1}=t,i=this.items.map(t=>{let n=t.prov?.find(t=>t.page_no===e)?.bbox,r=J(n??{l:0,t:0,r:0,b:0},this.page);return[(r.l+r.r)/2,(r.t+r.b)/2]}),a=`M${i[0][0]} 0 ${i.slice(0).map(e=>`L${e[0]} ${e[1]}`)} L${i.at(-1)[0]} ${r}`;return j`<svg viewBox="0 0 ${n} ${r}">
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="0"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10" />
        </marker>

        <path
          class="halo"
          vector-effect="non-scaling-stroke"
          d=${a}
          marker-start="url(#arrow)"
        />

        <path
          class="trace"
          vector-effect="non-scaling-stroke"
          d=${a}
          marker-start="url(#arrow)"
        />
      </svg>`}}};X.styles=b`
    svg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .halo {
      fill: none;
      stroke-width: 5px;
      stroke: white;
      stroke-linejoin: round;
    }

    .trace {
      fill: none;
      stroke-width: 3px;
      stroke: rgba(0, 0, 255);
      stroke-linejoin: round;
    }

    marker > path {
      fill: rgba(0, 0, 255);
      stroke: none;
    }
  `,n([w({type:Object})],X.prototype,`page`,2),n([w({type:Array})],X.prototype,`items`,2),X=n([r(`docling-trace`)],X);var Z=class extends I{constructor(){super(...arguments),this.src=``,this.trim=`pages`,this.fetchTask=new Ot(this,{task:async([e,t])=>jt(e,{items:t}),args:()=>[this.src,this.items]})}render(){let e=Array.from(this.childNodes);return this.fetchTask.render({pending:()=>j`<p>...</p>`,complete:t=>j`
        ${t.filter(e=>!this.trim||e.items.length>0).map(({page:t,items:n})=>j`<docling-img-page
                part="page"
                .page=${t}
                .items=${n}
                .pagenumbers=${this.pagenumbers!==void 0}
                .itemPart=${this.itemPart}
                .itemStyle=${this.itemStyle}
                .onClickItem=${this.onClickItem}
                .backdrop=${this.backdrop!==void 0}
                .overlay=${e.find(e=>e instanceof q)}
                .tooltip=${e.find(e=>e instanceof Et)}
                .trace=${e.find(e=>e instanceof X)}
              />`)}
      `})}};Z.styles=b`
    :host {
      width: fit-content;

      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;

      color: black;
    }
  `,n([w()],Z.prototype,`alt`,2),n([w()],Z.prototype,`backdrop`,2),n([w()],Z.prototype,`items`,2),n([w({type:Boolean})],Z.prototype,`pagenumbers`,2),n([w()],Z.prototype,`src`,2),n([w()],Z.prototype,`trim`,2),n([w()],Z.prototype,`itemPart`,2),n([w()],Z.prototype,`itemStyle`,2),n([w()],Z.prototype,`onClickItem`,2),Z=n([r(`docling-img`)],Z);var Q=class extends I{constructor(){super(...arguments),this.columns=[]}render(){return j`
      ${this.pagenumbers?j`
              <tr>
                <td
                  part="page-number-top"
                  class="page-number"
                  title="Page ${this.page?.page_no}"
                  colspan=${this.columns?.length??1}
                >
                  ${this.page?.page_no}
                </td>
              </tr>
            `:N}
      ${this.items?.map(e=>{let t=e.level??0,n=this.itemStyle?.(this.page,e);return j`<tr
          part=${`item`+(this.itemPart?` `+this.itemPart(this.page,e):``)}
          data-level=${t}
          style="--docling-level: ${t}; ${n??``}"
        >
          ${this.columns.map(t=>{let n=t.cloneNode(!0);return n.item=e,n.page=this.page,j`
              <td
                @onclick=${t=>this.onClickItem?.(t,this.page,e)}
              >
                ${n}
              </td>
            `})}
        </tr>`})}
      ${this.pagenumbers?j`<tr>
              <td
                part="page-number-bottom"
                class="page-number"
                title="Page ${this.page?.page_no}"
                colspan=${this.columns?.length??1}
              >
                ${this.page?.page_no}
              </td>
            </tr>`:N}
    `}};Q.styles=b`
    :host {
      display: table-row-group;
    }

    tbody {
      border-bottom: 1px solid rgb(220, 220, 220);
    }

    .page-number {
      padding: 0.25rem;

      background-color: white;
      color: rgb(120, 120, 120);
      font-size: 0.75rem;
      line-height: 1rem;
    }

    tr {
      cursor: pointer;
    }

    tr:not(:nth-last-child(2)) {
      border-bottom: 1px dotted rgb(220, 220, 220);
    }

    td {
      padding: 1rem;
      background-color: white;
      vertical-align: top;
    }

    td:first-child {
      border-left: calc(
          max(var(--docling-level, 0) - 1, 0) * var(--docling-depth-width, 4px)
        )
        solid var(--docling-depth-color, rgb(160, 160, 160));
    }

    tr:hover td {
      filter: brightness(95%);
    }
  `,n([w({type:Object})],Q.prototype,`page`,2),n([w({type:Array})],Q.prototype,`items`,2),n([w({type:Array})],Q.prototype,`columns`,2),n([w({type:Boolean})],Q.prototype,`pagenumbers`,2),n([w()],Q.prototype,`itemPart`,2),n([w()],Q.prototype,`itemStyle`,2),n([w()],Q.prototype,`onClickItem`,2),Q=n([r(`docling-table-page`)],Q);var Mt=class extends K{constructor(){super(...arguments),this.type=`column`}};Mt=n([r(`docling-column`)],Mt);var $=class extends I{constructor(){super(...arguments),this.src=``,this.fetchTask=new Ot(this,{task:async([e,t])=>jt(e,{items:t}),args:()=>[this.src,this.items]})}render(){let e=Array.from(this.childNodes).filter(e=>e.nodeName.toLowerCase().startsWith(`docling-column`)),t=e.length>0?e:[new Mt,new Mt];return e.length===0&&t[1].appendChild(new G),this.fetchTask.render({pending:()=>j`<p>...</p>`,complete:e=>j`
        <table part="pages">
          ${e.filter(e=>e.items.length>0).map(({page:e,items:n})=>j`<docling-table-page
                  .page=${e}
                  .items=${n}
                  .columns=${t}
                  .pagenumbers=${this.pagenumbers!==void 0}
                  .itemPart=${this.itemPart}
                  .itemStyle=${this.itemStyle}
                  .onClickItem=${this.onClickItem}
                />`)}
        </table>
      `})}};$.styles=b`
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      background-color: white;
    }
  `,n([w()],$.prototype,`alt`,2),n([w()],$.prototype,`items`,2),n([w({type:Boolean})],$.prototype,`pagenumbers`,2),n([w()],$.prototype,`src`,2),n([w()],$.prototype,`itemPart`,2),n([w()],$.prototype,`itemStyle`,2),n([w()],$.prototype,`onClickItem`,2),$=n([r(`docling-table`)],$);export{H as AnnotationPictureClassification,yt as AnnotationPictureDescription,L as DoclingAnnotationElement,W as DoclingItemElement,Y as ImgPage,Z as ImgPages,X as ImgTrace,xt as ItemCode,St as ItemKeyValue,q as ItemOverlay,G as ItemProvenance,Ct as ItemTable,wt as ItemTemplate,Tt as ItemText,Et as ItemTooltip,K as ItemView,Q as TablePage,$ as TablePages,Re as customDoclingAnnotationElement,U as customDoclingItemElement,J as normalBbox};