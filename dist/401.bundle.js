/*! For license information please see 401.bundle.js.LICENSE.txt */
exports.id=401,exports.ids=[401],exports.modules={157:(t,e,i)=>{if(!globalThis.DOMException)try{const{MessageChannel:t}=i(167),e=(new t).port1,r=new ArrayBuffer;e.postMessage(r,[r,r])}catch(t){"DOMException"===t.constructor.name&&(globalThis.DOMException=t.constructor)}t.exports=globalThis.DOMException},401:(t,e,i)=>{"use strict";i.d(e,{fileFromPath:()=>u});var r=i(896),s=i(928),o=i(157),a=i(831);const n=function(t){if("object"!==(t=>Object.prototype.toString.call(t).slice(8,-1).toLowerCase())(t))return!1;const e=Object.getPrototypeOf(t);return null==e||(e.constructor&&e.constructor.toString())===Object.toString()};i(699);var c,l,d=function(t,e,i,r,s){if("m"===r)throw new TypeError("Private method is not writable");if("a"===r&&!s)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof e?t!==e||!s:!e.has(t))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===r?s.call(t,i):s?s.value=i:e.set(t,i),i},f=function(t,e,i,r){if("a"===i&&!r)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof e?t!==e||!r:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===i?r:"a"===i?r.call(t):r?r.value:e.get(t)};class h{constructor(t){c.set(this,void 0),l.set(this,void 0),d(this,c,t.path,"f"),d(this,l,t.start||0,"f"),this.name=(0,s.basename)(f(this,c,"f")),this.size=t.size,this.lastModified=t.lastModified}slice(t,e){return new h({path:f(this,c,"f"),lastModified:this.lastModified,size:e-t,start:t})}async*stream(){const{mtimeMs:t}=await r.promises.stat(f(this,c,"f"));if(t>this.lastModified)throw new o("The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.","NotReadableError");this.size&&(yield*(0,r.createReadStream)(f(this,c,"f"),{start:f(this,l,"f"),end:f(this,l,"f")+this.size-1}))}get[(c=new WeakMap,l=new WeakMap,Symbol.toStringTag)](){return"File"}}async function u(t,e,i){return function(t,{mtimeMs:e,size:i},r,s={}){let o;n(r)?[s,o]=[r,void 0]:o=r;const c=new h({path:t,size:i,lastModified:e});return o||(o=c.name),new a.Z([c],o,{...s,lastModified:c.lastModified})}(t,await r.promises.stat(t),e,i)}}};