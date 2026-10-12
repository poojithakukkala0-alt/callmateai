import{r as F}from"./vendor-react-Cctt2C4z.js";import"./vendor-three-FFoOdVhZ.js";/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jn=e=>e==null?void 0:e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Qn(e,t,n=[]){if(t==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:Jn(e),size:24,node:t,...n.length>0?{aliases:n}:{}}}/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const er=e=>{let t="",n=!1;for(const r of e){if(r==="-"||r==="_"||r<=" "){n=t.length>0;continue}t.length===0?t+=r.toLowerCase():t+=n?r.toUpperCase():r,n=!1}return t};/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tr=e=>{const t=er(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=(...e)=>e.filter((t,n,r)=>!!t&&t.trim()!==""&&r.indexOf(t)===n).join(" ").trim();/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Me(e){return e!=null}function nr(e,t={}){var _,S;const n=t.attributeNames??{},r=E=>n[E]??E,s=e.size??e.width??U.width,i=e.size??e.height??U.height,c=((_=e.aliases)==null?void 0:_.filter(E=>typeof E=="string"&&E.trim()!=="").map(E=>`lucide-${E}`))??[],d=[...e.name?[`lucide-${e.name}`]:[],...c],u=((S=t.className)==null?void 0:S.split(" ").filter(Boolean))??[],f=t.includeDefaultClasses===!1?Ce(...u):Ce("lucide",...d,...u),v=t.absoluteStrokeWidth?Number(t.strokeWidth??U["stroke-width"])*Number(e.size??e.width??U.width)/Number(t.size??t.width??U.width):t.strokeWidth??U["stroke-width"];return["svg",{...Object.entries(U).reduce((E,[R,b])=>(E[r(R)]=b,E),{}),..."color"in t&&t.color&&{[r("stroke")]:t.color},..."size"in t&&Me(t.size)&&{[r("width")]:t.size,[r("height")]:t.size},..."width"in t&&Me(t.width)&&{[r("width")]:t.width},..."height"in t&&Me(t.height)&&{[r("height")]:t.height},[r("stroke-width")]:v,...f&&{[r("class")]:f},[r("viewBox")]:`0 0 ${s} ${i}`,...t.hasA11yProp===!1?{[r("aria-hidden")]:"true"}:{},..."attributes"in t&&t.attributes},e.node.map(E=>{const[R,b,B]=E,H=t.nonScalingStroke?{[r("vector-effect")]:"non-scaling-stroke",...b}:b;return B?[R,H,B]:[R,H]})]}/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function rr(e,t={}){return nr(e,{...t,attributeNames:{...t.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sr=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1},ar=F.createContext({}),or=()=>F.useContext(ar),ir=F.forwardRef(({color:e,size:t,width:n,height:r,strokeWidth:s,absoluteStrokeWidth:i,nonScalingStroke:c,className:d="",children:u,iconNode:f=[],icon:v={node:f,aliases:[],size:24},...x},_)=>{const{size:S=24,strokeWidth:E=2,absoluteStrokeWidth:R=!1,nonScalingStroke:b=!1,color:B="currentColor",className:H=""}=or()??{},P=!!u||sr(x),[L,Q,ee=[]]=rr(v,{color:e??B,width:n??t??S,height:r??t??S,strokeWidth:s??E,absoluteStrokeWidth:i??R,nonScalingStroke:c??b,className:Ce(H,d),hasA11yProp:P,attributes:x});return F.createElement(L,{ref:_,...Q},[...ee.map(([te,ne])=>F.createElement(te,ne)),...Array.isArray(u)?u:[u]])});/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function l(e,t=[],n=[]){const r=typeof e=="string"?Qn(e,t,n):e,s=F.forwardRef(({className:i,...c},d)=>F.createElement(ir,{ref:d,icon:r,className:i,...c}));return r.name&&(s.displayName=tr(r.name)),s}/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at={name:"activity",size:24,node:[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]};at.node;const Is=l(at);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot={name:"arrow-left",size:24,node:[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]};ot.node;const Os=l(ot);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const it={name:"arrow-right",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]};it.node;const Ns=l(it);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct={name:"bell-ring",size:24,node:[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M22 8c0-2.3-.8-4.3-2-6",key:"5bb3ad"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}],["path",{d:"M4 2C2.8 3.7 2 5.7 2 8",key:"tap9e0"}]]};ct.node;const Ws=l(ct);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt={name:"bell",size:24,node:[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]};lt.node;const Vs=l(lt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt={name:"book-open",size:24,node:[["path",{d:"M12 5v16",key:"1f6ucr"}],["path",{d:"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z",key:"1fyvmf"}]]};dt.node;const js=l(dt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht={name:"bot",size:24,node:[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]]};ht.node;const Bs=l(ht);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut={name:"calendar",size:24,node:[["path",{d:"M8 2v3",key:"1ioesn"}],["path",{d:"M16 2v3",key:"otl347"}],["rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",key:"h1oib"}],["path",{d:"M3 9h18",key:"1pudct"}]]};ut.node;const Hs=l(ut);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft={name:"check-check",size:24,node:[["path",{d:"M18 6 7 17l-5-5",key:"116fxf"}],["path",{d:"m22 10-7.5 7.5L13 16",key:"ke71qq"}]]};ft.node;const qs=l(ft);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};pt.node;const Us=l(pt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt={name:"chevron-right",size:24,node:[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]};mt.node;const Ks=l(mt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt={name:"circle-alert",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],aliases:["alert-circle"]};yt.node;const Zs=l(yt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt={name:"circle-check",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16 9-5.5 5.5L8 12",key:"xofnsj"}]],aliases:["check-circle-2"]};gt.node;const Gs=l(gt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt={name:"circle-x",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],aliases:["x-circle"]};vt.node;const Xs=l(vt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt={name:"clock",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]};kt.node;const Ys=l(kt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt={name:"eye-off",size:24,node:[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]};Mt.node;const Js=l(Mt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt={name:"eye",size:24,node:[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};wt.node;const Qs=l(wt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt={name:"file-text",size:24,node:[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]};bt.node;const ea=l(bt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt={name:"graduation-cap",size:24,node:[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]};xt.node;const ta=l(xt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt={name:"heart-handshake",size:24,node:[["path",{d:"M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762",key:"17lmqv"}]]};zt.node;const na=l(zt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct={name:"info",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]};Ct.node;const ra=l(Ct);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t={name:"layout-dashboard",size:24,node:[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]};_t.node;const sa=l(_t);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At={name:"loader-circle",size:24,node:[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],aliases:["loader-2"]};At.node;const aa=l(At);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt={name:"lock",size:24,node:[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]};Tt.node;const oa=l(Tt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et={name:"log-out",size:24,node:[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]};Et.node;const ia=l(Et);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St={name:"mail",size:24,node:[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]};St.node;const ca=l(St);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt={name:"menu",size:24,node:[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]]};Dt.node;const la=l(Dt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt={name:"mic-off",size:24,node:[["path",{d:"M12 19v3",key:"npa21l"}],["path",{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33",key:"1gzdoj"}],["path",{d:"M16.95 16.95A7 7 0 0 1 5 12v-2",key:"cqa7eg"}],["path",{d:"M18.89 13.23A7 7 0 0 0 19 12v-2",key:"16hl24"}],["path",{d:"m2 2 20 20",key:"1ooewy"}],["path",{d:"M9 9v3a3 3 0 0 0 5.12 2.12",key:"r2i35w"}]]};Pt.node;const da=l(Pt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt={name:"mic",size:24,node:[["path",{d:"M12 19v3",key:"npa21l"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["rect",{x:"9",y:"2",width:"6",height:"13",rx:"3",key:"s6n7sd"}]]};Lt.node;const ha=l(Lt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t={name:"moon",size:24,node:[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]};$t.node;const ua=l($t);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ft={name:"octagon-alert",size:24,node:[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]],aliases:["alert-octagon"]};Ft.node;const fa=l(Ft);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt={name:"palette",size:24,node:[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",key:"e79jfc"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}]]};Rt.node;const pa=l(Rt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It={name:"phone-call",size:24,node:[["path",{d:"M13 2a9 9 0 0 1 9 9",key:"1itnx2"}],["path",{d:"M13 6a5 5 0 0 1 5 5",key:"11nki7"}],["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]};It.node;const ma=l(It);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot={name:"phone-forwarded",size:24,node:[["path",{d:"M14 6h8",key:"yd68k4"}],["path",{d:"m18 2 4 4-4 4",key:"pucp1d"}],["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]};Ot.node;const ya=l(Ot);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt={name:"phone-incoming",size:24,node:[["path",{d:"M16 2v6h6",key:"1mfrl5"}],["path",{d:"m22 2-6 6",key:"6f0sa0"}],["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]};Nt.node;const ga=l(Nt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt={name:"phone-off",size:24,node:[["path",{d:"M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 18 18 0 0 1-12.728-5.272",key:"1wngk7"}],["path",{d:"M22 2 2 22",key:"y4kqgn"}],["path",{d:"M4.76 13.582A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473",key:"10hv5p"}]]};Wt.node;const va=l(Wt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt={name:"play",size:24,node:[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]]};Vt.node;const ka=l(Vt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt={name:"plus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]};jt.node;const Ma=l(jt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bt={name:"refresh-cw",size:24,node:[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]};Bt.node;const wa=l(Bt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht={name:"rotate-ccw-clock",size:24,node:[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]],aliases:["history"]};Ht.node;const ba=l(Ht);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt={name:"rotate-ccw",size:24,node:[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]};qt.node;const xa=l(qt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut={name:"save",size:24,node:[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]};Ut.node;const za=l(Ut);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kt={name:"search",size:24,node:[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]};Kt.node;const Ca=l(Kt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zt={name:"send",size:24,node:[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]};Zt.node;const _a=l(Zt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt={name:"settings",size:24,node:[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};Gt.node;const Aa=l(Gt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xt={name:"shield-alert",size:24,node:[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]};Xt.node;const Ta=l(Xt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt={name:"shield-check",size:24,node:[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]};Yt.node;const Ea=l(Yt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt={name:"shield",size:24,node:[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]};Jt.node;const Sa=l(Jt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qt={name:"sparkles",size:24,node:[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],aliases:["stars"]};Qt.node;const Da=l(Qt);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const en={name:"sun",size:24,node:[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]};en.node;const Pa=l(en);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tn={name:"toggle-right",size:24,node:[["circle",{cx:"15",cy:"12",r:"3",key:"1afu0r"}],["rect",{width:"20",height:"14",x:"2",y:"5",rx:"7",key:"g7kal2"}]]};tn.node;const La=l(tn);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nn={name:"toggle-left",size:24,node:[["circle",{cx:"9",cy:"12",r:"3",key:"u3jwor"}],["rect",{width:"20",height:"14",x:"2",y:"5",rx:"7",key:"g7kal2"}]]};nn.node;const $a=l(nn);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rn={name:"trash",size:24,node:[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],aliases:["trash-2"]};rn.node;const Fa=l(rn);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sn={name:"trending-up",size:24,node:[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]};sn.node;const Ra=l(sn);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const an={name:"triangle-alert",size:24,node:[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],aliases:["alert-triangle"]};an.node;const Ia=l(an);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const on={name:"user-check",size:24,node:[["path",{d:"m16 11 2 2 4-4",key:"9rsbq5"}],["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]};on.node;const Oa=l(on);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cn={name:"users-round",size:24,node:[["path",{d:"M18 21a8 8 0 0 0-16 0",key:"3ypg7q"}],["circle",{cx:"10",cy:"8",r:"5",key:"o932ke"}],["path",{d:"M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3",key:"10s06x"}]],aliases:["users-2"]};cn.node;const Na=l(cn);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ln={name:"user",size:24,node:[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]};ln.node;const Wa=l(ln);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dn={name:"users",size:24,node:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]};dn.node;const Va=l(dn);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hn={name:"volume-x",size:24,node:[["path",{d:"M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z",key:"1p7khw"}],["path",{d:"m16.5 14.5 5-5",key:"cul3yw"}],["path",{d:"m16.5 9.5 5 5",key:"1akey5"}]]};hn.node;const ja=l(hn);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const un={name:"volume-2",size:24,node:[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]};un.node;const Ba=l(un);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fn={name:"x",size:24,node:[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]};fn.node;const Ha=l(fn);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pn={name:"zap",size:24,node:[["path",{d:"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",key:"1v7up4"}]]};pn.node;const qa=l(pn);function cr(e){const t=F.useRef(null);return t.current===null&&(t.current=e()),t.current}const lr=typeof window<"u",dr=lr?F.useLayoutEffect:F.useEffect;function hr(e,t){e.indexOf(t)===-1&&e.push(t)}function ur(e,t){const n=e.indexOf(t);n>-1&&e.splice(n,1)}const me=(e,t,n)=>n>t?t:n<e?e:n;let fr=()=>{};const Pe={},mn=e=>typeof e=="object"&&e!==null;function pr(e){let t;return()=>(t===void 0&&(t=e()),t)}const ye=e=>e,yn=(...e)=>e.reduce((t,n)=>r=>n(t(r))),Le=(e,t,n)=>{const r=t-e;return r?(n-e)/r:1};class mr{constructor(){this.subscriptions=[]}add(t){return hr(this.subscriptions,t),()=>ur(this.subscriptions,t)}notify(t,n,r){const s=this.subscriptions.length;if(s)if(s===1)this.subscriptions[0](t,n,r);else for(let i=0;i<s;i++){const c=this.subscriptions[i];c&&c(t,n,r)}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}}const gn=(e,t)=>t?e*(1e3/t):0,oe=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender"];function yr(e){let t=new Set,n=new Set,r=!1,s=!1;const i=new WeakSet;let c={delta:0,timestamp:0,isProcessing:!1};function d(f){i.has(f)&&(u.schedule(f),e()),f(c)}const u={schedule:(f,v=!1,x=!1)=>{const S=x&&r?t:n;return v&&i.add(f),S.add(f),f},cancel:f=>{n.delete(f),i.delete(f)},process:f=>{if(c=f,r){s=!0;return}r=!0;const v=t;t=n,n=v,t.forEach(d),t.clear(),r=!1,s&&(s=!1,u.process(f))}};return u}const gr=40;function vn(e,t){let n=!1,r=!0;const s={delta:0,timestamp:0,isProcessing:!1},i=()=>n=!0,c=oe.reduce((P,L)=>(P[L]=yr(i),P),{}),{setup:d,read:u,resolveKeyframes:f,preUpdate:v,update:x,preRender:_,render:S,postRender:E}=c,R=()=>{const P=Pe.useManualTiming,L=P?s.timestamp:performance.now();n=!1,P||(s.delta=r?1e3/60:Math.max(Math.min(L-s.timestamp,gr),1)),s.timestamp=L,s.isProcessing=!0,d.process(s),u.process(s),f.process(s),v.process(s),x.process(s),_.process(s),S.process(s),E.process(s),s.isProcessing=!1,n&&t&&(r=!1,e(R))},b=()=>{n=!0,r=!0,s.isProcessing||e(R)};return{schedule:oe.reduce((P,L)=>{const Q=c[L];return P[L]=(ee,te=!1,ne=!1)=>(n||b(),Q.schedule(ee,te,ne)),P},{}),cancel:P=>{for(let L=0;L<oe.length;L++)c[oe[L]].cancel(P)},state:s,steps:c}}const{schedule:G,cancel:_e,state:Ae}=vn(typeof requestAnimationFrame<"u"?requestAnimationFrame:ye,!0);let le;function vr(){le=void 0}const de={now:()=>(le===void 0&&de.set(Ae.isProcessing||Pe.useManualTiming?Ae.timestamp:performance.now()),le),set:e=>{le=e,queueMicrotask(vr)}},kr=e=>t=>typeof t=="string"&&t.startsWith(e),Mr=kr("var(--"),wr=e=>Mr(e)?br.test(e.split("/*")[0].trim()):!1,br=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu,kn={test:e=>typeof e=="number",parse:parseFloat,transform:e=>e},Mn={...kn,transform:e=>me(0,1,e)},se=e=>Math.round(e*1e5)/1e5,wn=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function xr(e){return e==null}const zr=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,$e=(e,t)=>n=>!!(typeof n=="string"&&zr.test(n)&&n.startsWith(e)||t&&!xr(n)&&Object.prototype.hasOwnProperty.call(n,t)),bn=(e,t,n)=>r=>{if(typeof r!="string")return r;const[s,i,c,d]=r.match(wn);return{[e]:parseFloat(s),[t]:parseFloat(i),[n]:parseFloat(c),alpha:d!==void 0?parseFloat(d):1}},Cr=e=>me(0,255,e),we={...kn,transform:e=>Math.round(Cr(e))},K={test:$e("rgb","red"),parse:bn("red","green","blue"),transform:({red:e,green:t,blue:n,alpha:r=1})=>"rgba("+we.transform(e)+", "+we.transform(t)+", "+we.transform(n)+", "+se(Mn.transform(r))+")"};function _r(e){let t="",n="",r="",s="";return e.length>5?(t=e.substring(1,3),n=e.substring(3,5),r=e.substring(5,7),s=e.substring(7,9)):(t=e.substring(1,2),n=e.substring(2,3),r=e.substring(3,4),s=e.substring(4,5),t+=t,n+=n,r+=r,s+=s),{red:parseInt(t,16),green:parseInt(n,16),blue:parseInt(r,16),alpha:s?parseInt(s,16)/255:1}}const Te={test:$e("#"),parse:_r,transform:K.transform},Ar=e=>({test:t=>typeof t=="string"&&t.endsWith(e)&&t.split(" ").length===1,parse:parseFloat,transform:t=>`${t}${e}`}),He=Ar("%"),X={test:$e("hsl","hue"),parse:bn("hue","saturation","lightness"),transform:({hue:e,saturation:t,lightness:n,alpha:r=1})=>"hsla("+Math.round(e)+", "+He.transform(se(t))+", "+He.transform(se(n))+", "+se(Mn.transform(r))+")"},V={test:e=>K.test(e)||Te.test(e)||X.test(e),parse:e=>K.test(e)?K.parse(e):X.test(e)?X.parse(e):Te.parse(e),transform:e=>typeof e=="string"?e:e.hasOwnProperty("red")?K.transform(e):X.transform(e),getAnimatableNone:e=>{const t=V.parse(e);return t.alpha=0,V.transform(t)}},Tr=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function Er(e){var t,n;return isNaN(e)&&typeof e=="string"&&(((t=e.match(wn))==null?void 0:t.length)||0)+(((n=e.match(Tr))==null?void 0:n.length)||0)>0}const xn="number",zn="color",Sr="var",Dr="var(",qe="${}",Pr=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function ae(e){const t=e.toString(),n=[],r={color:[],number:[],var:[]},s=[];let i=0;const d=t.replace(Pr,u=>(V.test(u)?(r.color.push(i),s.push(zn),n.push(V.parse(u))):u.startsWith(Dr)?(r.var.push(i),s.push(Sr),n.push(u)):(r.number.push(i),s.push(xn),n.push(parseFloat(u))),++i,qe)).split(qe);return{values:n,split:d,indexes:r,types:s}}function Lr(e){return ae(e).values}function Cn({split:e,types:t}){const n=e.length;return r=>{let s="";for(let i=0;i<n;i++)if(s+=e[i],r[i]!==void 0){const c=t[i];c===xn?s+=se(r[i]):c===zn?s+=V.transform(r[i]):s+=r[i]}return s}}function $r(e){return Cn(ae(e))}const Fr=e=>typeof e=="number"?0:V.test(e)?V.getAnimatableNone(e):e,Rr=(e,t)=>typeof e=="number"?t!=null&&t.trim().endsWith("/")?e:0:Fr(e);function Ir(e){const t=ae(e);return Cn(t)(t.values.map((r,s)=>Rr(r,t.split[s])))}const Or={test:Er,parse:Lr,createTransformer:$r,getAnimatableNone:Ir};function be(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*(2/3-n)*6:e}function Nr({hue:e,saturation:t,lightness:n,alpha:r}){e/=360,t/=100,n/=100;let s=0,i=0,c=0;if(!t)s=i=c=n;else{const d=n<.5?n*(1+t):n+t-n*t,u=2*n-d;s=be(u,d,e+1/3),i=be(u,d,e),c=be(u,d,e-1/3)}return{red:Math.round(s*255),green:Math.round(i*255),blue:Math.round(c*255),alpha:r}}function fe(e,t){return n=>n>0?t:e}const ge=(e,t,n)=>e+(t-e)*n,xe=(e,t,n)=>{const r=e*e,s=n*(t*t-r)+r;return s<0?0:Math.sqrt(s)},Wr=[Te,K,X],Vr=e=>Wr.find(t=>t.test(e));function Ue(e){const t=Vr(e);if(!t)return!1;let n=t.parse(e);return t===X&&(n=Nr(n)),n}const Ke=(e,t)=>{const n=Ue(e),r=Ue(t);if(!n||!r)return fe(e,t);const s={...n};return i=>(s.red=xe(n.red,r.red,i),s.green=xe(n.green,r.green,i),s.blue=xe(n.blue,r.blue,i),s.alpha=ge(n.alpha,r.alpha,i),K.transform(s))},Ee=new Set(["none","hidden"]);function jr(e,t){return Ee.has(e)?n=>n<=0?e:t:n=>n>=1?t:e}function Br(e,t){return n=>ge(e,t,n)}function Fe(e){return typeof e=="number"?Br:typeof e=="string"?wr(e)?fe:V.test(e)?Ke:Ur:Array.isArray(e)?_n:typeof e=="object"?V.test(e)?Ke:Hr:fe}function _n(e,t){const n=[...e],r=n.length,s=e.map((i,c)=>Fe(i)(i,t[c]));return i=>{for(let c=0;c<r;c++)n[c]=s[c](i);return n}}function Hr(e,t){const n={...e,...t},r={};for(const s in n)e[s]!==void 0&&t[s]!==void 0&&(r[s]=Fe(e[s])(e[s],t[s]));return s=>{for(const i in r)n[i]=r[i](s);return n}}function qr(e,t){const n=[],r={color:0,var:0,number:0};for(let s=0;s<t.values.length;s++){const i=t.types[s],c=e.indexes[i][r[i]],d=e.values[c]??0;n[s]=d,r[i]++}return n}const Ur=(e,t)=>{const n=Or.createTransformer(t),r=ae(e),s=ae(t);return r.indexes.var.length===s.indexes.var.length&&r.indexes.color.length===s.indexes.color.length&&r.indexes.number.length>=s.indexes.number.length?Ee.has(e)&&!s.values.length||Ee.has(t)&&!r.values.length?jr(e,t):yn(_n(qr(r,s),s.values),n):fe(e,t)};function Kr(e,t,n){return typeof e=="number"&&typeof t=="number"&&typeof n=="number"?ge(e,t,n):Fe(e)(e,t)}function Zr(e,t,n){const r=[],s=n||Pe.mix||Kr,i=e.length-1;for(let c=0;c<i;c++){let d=s(e[c],e[c+1]);if(t){const u=Array.isArray(t)?t[c]||ye:t;d=yn(u,d)}r.push(d)}return r}function Gr(e,t,{clamp:n=!0,ease:r,mixer:s}={}){const i=e.length;if(fr(i===t.length),i===1)return()=>t[0];if(i===2&&t[0]===t[1])return()=>t[1];const c=e[0]===e[1];e[0]>e[i-1]&&(e=[...e].reverse(),t=[...t].reverse());const d=Zr(t,r,s),u=d.length,f=v=>{if(c&&v<e[0])return t[0];let x=0;if(u>1)for(;x<e.length-2&&!(v<e[x+1]);x++);const _=Le(e[x],e[x+1],v);return d[x](_)};return n?v=>f(me(e[0],e[i-1],v)):f}function Xr(e,t){const n=e[e.length-1];for(let r=1;r<=t;r++){const s=Le(0,t,r);e.push(ge(n,1,s))}}function Yr(e){const t=[0];return Xr(t,e.length-1),t}const Jr={};function An(e,t){const n=pr(e);return()=>Jr[t]??n()}const Tn=An(()=>window.ScrollTimeline!==void 0,"scrollTimeline"),En=An(()=>window.ViewTimeline!==void 0,"viewTimeline"),Ze=30,Qr=e=>!isNaN(parseFloat(e));class es{constructor(t,n={}){this.canTrackVelocity=null,this.events={},this.updateAndNotify=r=>{var i;const s=de.now();if(this.updatedAt!==s&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(r),this.current!==this.prev&&((i=this.events.change)==null||i.notify(this.current),this.dependents))for(const c of this.dependents)c.dirty()},this.hasAnimated=!1,this.setCurrent(t),this.owner=n.owner}setCurrent(t){this.current=t,this.updatedAt=de.now(),this.canTrackVelocity===null&&t!==void 0&&(this.canTrackVelocity=Qr(this.current))}setPrevFrameValue(t=this.current){this.prevFrameValue=t,this.prevUpdatedAt=this.updatedAt}onChange(t){return this.on("change",t)}on(t,n){this.events[t]||(this.events[t]=new mr);const r=this.events[t].add(n);return t==="change"?()=>{r(),G.read(()=>{this.events.change.getSize()||this.stop()})}:r}clearListeners(){for(const t in this.events)this.events[t].clear()}attach(t,n){this.passiveEffect=t,this.stopPassiveEffect=n}set(t){this.passiveEffect?this.passiveEffect(t,this.updateAndNotify):this.updateAndNotify(t)}setWithVelocity(t,n,r){this.set(n),this.prev=void 0,this.prevFrameValue=t,this.prevUpdatedAt=this.updatedAt-r}jump(t,n=!0){this.updateAndNotify(t),this.prev=t,this.prevUpdatedAt=this.prevFrameValue=void 0,n&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}dirty(){var t;(t=this.events.change)==null||t.notify(this.current)}addDependent(t){this.dependents||(this.dependents=new Set),this.dependents.add(t)}removeDependent(t){this.dependents&&this.dependents.delete(t)}get(){return this.current}getPrevious(){return this.prev}getVelocity(){const t=de.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||t-this.updatedAt>Ze)return 0;const n=Math.min(this.updatedAt-this.prevUpdatedAt,Ze);return gn(parseFloat(this.current)-parseFloat(this.prevFrameValue),n)}start(t){return this.stop(),new Promise(n=>{this.hasAnimated=!0,this.animation=t(n),this.events.animationStart&&this.events.animationStart.notify()}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){delete this.animation}destroy(){var t,n;(t=this.dependents)==null||t.clear(),(n=this.events.destroy)==null||n.notify(),this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}}function ie(e,t){return new es(e,t)}function ts(e,t,n){if(e==null)return[];if(e instanceof EventTarget)return[e];if(typeof e=="string"){const s=document.querySelectorAll(e);return s?Array.from(s):[]}return Array.from(e).filter(r=>r!=null)}function ns(e){return mn(e)&&"offsetHeight"in e&&!("ownerSVGElement"in e)}const{schedule:Se,cancel:Sn}=vn(queueMicrotask,!1);function rs(e){return mn(e)&&"ownerSVGElement"in e}const he=new WeakMap;let j;const Dn=(e,t,n)=>(r,s)=>s&&s[0]?s[0][e+"Size"]:rs(r)&&"getBBox"in r?r.getBBox()[t]:r[n],ss=Dn("inline","width","offsetWidth"),as=Dn("block","height","offsetHeight");function os({target:e,borderBoxSize:t}){var n;(n=he.get(e))==null||n.forEach(r=>{r(e,{get width(){return ss(e,t)},get height(){return as(e,t)}})})}function is(e){e.forEach(os)}function cs(){typeof ResizeObserver>"u"||(j=new ResizeObserver(is))}function ls(e,t){j||cs();const n=ts(e);return n.forEach(r=>{let s=he.get(r);s||(s=new Set,he.set(r,s)),s.add(t),j==null||j.observe(r)}),()=>{n.forEach(r=>{const s=he.get(r);s==null||s.delete(t),s!=null&&s.size||j==null||j.unobserve(r)})}}const ue=new Set;let Y;function ds(){Y=()=>{const e={get width(){return window.innerWidth},get height(){return window.innerHeight}};ue.forEach(t=>t(e))},window.addEventListener("resize",Y)}function hs(e){return ue.add(e),Y||ds(),()=>{ue.delete(e),!ue.size&&typeof Y=="function"&&(window.removeEventListener("resize",Y),Y=void 0)}}function us(e,t){return typeof e=="function"?hs(e):ls(e,t)}function Pn(e,t){let n;const r=()=>{const{currentTime:s}=t,c=(s===null?0:s.value)/100;n!==c&&e(c),n=c};return G.preUpdate(r,!0),()=>_e(r)}function pe(e){return typeof window>"u"?!1:e?En():Tn()}const fs=50,Ge=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),ps=()=>({time:0,x:Ge(),y:Ge()}),ms={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function Xe(e,t,n,r){const s=n[t],{length:i,position:c}=ms[t],d=s.current,u=n.time;s.current=Math.abs(e[`scroll${c}`]),s.scrollLength=e[`scroll${i}`]-e[`client${i}`],s.offset.length=0,s.offset[0]=0,s.offset[1]=s.scrollLength,s.progress=Le(0,s.scrollLength,s.current);const f=r-u;s.velocity=f>fs?0:gn(s.current-d,f)}function ys(e,t,n){Xe(e,"x",t,n),Xe(e,"y",t,n),t.time=n}function gs(e,t){const n={x:0,y:0};let r=e;for(;r&&r!==t;)if(ns(r))n.x+=r.offsetLeft,n.y+=r.offsetTop,r=r.offsetParent;else if(r.tagName==="svg"){const s=r.getBoundingClientRect();r=r.parentElement;const i=r.getBoundingClientRect();n.x+=s.left-i.left,n.y+=s.top-i.top}else if(r instanceof SVGGraphicsElement){const{x:s,y:i}=r.getBBox();n.x+=s,n.y+=i;let c=null,d=r.parentNode;for(;!c;)d.tagName==="svg"&&(c=d),d=r.parentNode;r=c}else break;return n}const De={start:0,center:.5,end:1};function Ye(e,t,n=0){let r=0;if(e in De&&(e=De[e]),typeof e=="string"){const s=parseFloat(e);e.endsWith("px")?r=s:e.endsWith("%")?e=s/100:e.endsWith("vw")?r=s/100*document.documentElement.clientWidth:e.endsWith("vh")?r=s/100*document.documentElement.clientHeight:e=s}return typeof e=="number"&&(r=t*e),n+r}const vs=[0,0];function ks(e,t,n,r){let s=Array.isArray(e)?e:vs,i=0,c=0;return typeof e=="number"?s=[e,e]:typeof e=="string"&&(e=e.trim(),e.includes(" ")?s=e.split(" "):s=[e,De[e]?e:"0"]),i=Ye(s[0],n,r),c=Ye(s[1],t),i-c}const re={Enter:[[0,1],[1,1]],Exit:[[0,0],[1,0]],Any:[[1,0],[0,1]],All:[[0,0],[1,1]]},Ms={x:0,y:0};function ws(e){return"getBBox"in e&&e.tagName!=="svg"?e.getBBox():{width:e.clientWidth,height:e.clientHeight}}function bs(e,t,n){const{offset:r=re.All}=n,{target:s=e,axis:i="y"}=n,c=i==="y"?"height":"width",d=s!==e?gs(s,e):Ms,u=s===e?{width:e.scrollWidth,height:e.scrollHeight}:ws(s),f={width:e.clientWidth,height:e.clientHeight};t[i].offset.length=0;let v=!t[i].interpolate;const x=r.length;for(let _=0;_<x;_++){const S=ks(r[_],f[c],u[c],d[i]);!v&&S!==t[i].interpolatorOffsets[_]&&(v=!0),t[i].offset[_]=S}v&&(t[i].interpolate=Gr(t[i].offset,Yr(r),{clamp:!1}),t[i].interpolatorOffsets=[...t[i].offset]),t[i].progress=me(0,1,t[i].interpolate(t[i].current))}function xs(e,t=e,n){if(n.x.targetOffset=0,n.y.targetOffset=0,t!==e){let r=t;for(;r&&r!==e;)n.x.targetOffset+=r.offsetLeft,n.y.targetOffset+=r.offsetTop,r=r.offsetParent}n.x.targetLength=t===e?t.scrollWidth:t.clientWidth,n.y.targetLength=t===e?t.scrollHeight:t.clientHeight,n.x.containerLength=e.clientWidth,n.y.containerLength=e.clientHeight}function zs(e,t,n,r={}){return{measure:s=>{xs(e,r.target,n),ys(e,n,s),(r.offset||r.target)&&bs(e,n,r)},notify:()=>t(n)}}const Z=new WeakMap,Je=new WeakMap,ze=new WeakMap,Qe=new WeakMap,ce=new WeakMap,et=e=>e===document.scrollingElement?window:e;function Ln(e,{container:t=document.scrollingElement,trackContentSize:n=!1,...r}={}){if(!t)return ye;let s=ze.get(t);s||(s=new Set,ze.set(t,s));const i=ps(),c=zs(t,e,i,r);if(s.add(c),!Z.has(t)){const u=()=>{for(const _ of s)_.measure(Ae.timestamp);G.preUpdate(f)},f=()=>{for(const _ of s)_.notify()},v=()=>G.read(u);Z.set(t,v);const x=et(t);window.addEventListener("resize",v),t!==document.documentElement&&Je.set(t,us(t,v)),x.addEventListener("scroll",v),v()}if(n&&!ce.has(t)){const u=Z.get(t),f={width:t.scrollWidth,height:t.scrollHeight};Qe.set(t,f);const v=()=>{const _=t.scrollWidth,S=t.scrollHeight;(f.width!==_||f.height!==S)&&(u(),f.width=_,f.height=S)},x=G.read(v,!0);ce.set(t,x)}const d=Z.get(t);return G.read(d,!1,!0),()=>{var x;_e(d);const u=ze.get(t);if(!u||(u.delete(c),u.size))return;const f=Z.get(t);Z.delete(t),f&&(et(t).removeEventListener("scroll",f),(x=Je.get(t))==null||x(),window.removeEventListener("resize",f));const v=ce.get(t);v&&(_e(v),ce.delete(t)),Qe.delete(t)}}const Cs=[[re.Enter,"entry"],[re.Exit,"exit"],[re.Any,"cover"],[re.All,"contain"]],tt={start:0,end:1};function _s(e){const t=e.trim().split(/\s+/);if(t.length!==2)return;const n=tt[t[0]],r=tt[t[1]];if(!(n===void 0||r===void 0))return[n,r]}function As(e){if(e.length!==2)return;const t=[];for(const n of e)if(Array.isArray(n))t.push(n);else if(typeof n=="string"){const r=_s(n);if(!r)return;t.push(r)}else return;return t}function Ts(e,t){const n=As(e);if(!n)return!1;for(let r=0;r<2;r++){const s=n[r],i=t[r];if(s[0]!==i[0]||s[1]!==i[1])return!1}return!0}function Re(e){if(!e)return{rangeStart:"contain 0%",rangeEnd:"contain 100%"};for(const[t,n]of Cs)if(Ts(e,t))return{rangeStart:`${n} 0%`,rangeEnd:`${n} 100%`}}const nt=new Map;function rt(e){const t={value:0},n=Ln(r=>{t.value=r[e.axis].progress*100},e);return{currentTime:t,cancel:n}}function $n({source:e,container:t,...n}){const{axis:r}=n;e&&(t=e);let s=nt.get(t);s||(s=new Map,nt.set(t,s));const i=n.target??"self";let c=s.get(i);c||(c={},s.set(i,c));const d=r+(n.offset??[]).join(",");return c[d]||(n.target&&pe(n.target)?Re(n.offset)?c[d]=new ViewTimeline({subject:n.target,axis:r}):c[d]=rt({container:t,...n}):pe()?c[d]=new ScrollTimeline({source:t,axis:r}):c[d]=rt({container:t,...n})),c[d]}function Es(e,t){const n=$n(t),r=t.target?Re(t.offset):void 0,s=t.target?pe(t.target)&&!!r:pe();return e.attachTimeline({timeline:s?n:void 0,...r&&s&&{rangeStart:r.rangeStart,rangeEnd:r.rangeEnd},observe:i=>(i.pause(),Pn(c=>{i.time=i.iterationDuration*c},n))})}function Ss(e){return e&&(e.target||e.offset)}function Ds(e){return e.length===2}function Ps(e,t){return Ds(e)||Ss(t)?Ln(n=>{e(n[t.axis].progress,n)},t):Pn(e,$n(t))}function Fn(e,{axis:t="y",container:n=document.scrollingElement,...r}={}){if(!n)return ye;const s={axis:t,container:n,...r};return typeof e=="function"?Ps(e,s):Es(e,s)}const Ls=()=>({scrollX:ie(0),scrollY:ie(0),scrollXProgress:ie(0),scrollYProgress:ie(0)}),J=e=>e?!e.current:!1;function st(e,t,n,r){return{factory:s=>{let i;const c=()=>{if(J(n)||J(r)){Se.read(c);return}i=Fn(s,{...t,axis:e,container:(n==null?void 0:n.current)||void 0,target:(r==null?void 0:r.current)||void 0})};return Se.read(c),()=>{Sn(c),i==null||i()}},times:[0,1],keyframes:[0,1],ease:s=>s,duration:1}}function $s(e,t){return typeof window>"u"?!1:e?En()&&!!Re(t):Tn()}function Ua({container:e,target:t,...n}={}){const r=cr(Ls);$s(t,n.offset)&&(r.scrollXProgress.accelerate=st("x",n,e,t),r.scrollYProgress.accelerate=st("y",n,e,t));const s=F.useRef(null),i=F.useRef(!1),c=F.useCallback(()=>(s.current=Fn((d,{x:u,y:f})=>{r.scrollX.set(u.current),r.scrollXProgress.set(u.progress),r.scrollY.set(f.current),r.scrollYProgress.set(f.progress)},{...n,container:(e==null?void 0:e.current)||void 0,target:(t==null?void 0:t.current)||void 0}),()=>{var d;(d=s.current)==null||d.call(s)}),[e,t,JSON.stringify(n.offset)]);return dr(()=>{if(i.current=!1,J(e)||J(t)){i.current=!0;return}else return c()},[c]),F.useEffect(()=>{if(!i.current)return;let d;const u=()=>{const f=J(e),v=J(t);!f&&!v&&(d=c())};return Se.read(u),()=>{Sn(u),d==null||d()}},[c]),r}var Ie={};(function e(t,n,r,s){var i=!!(t.Worker&&t.Blob&&t.Promise&&t.OffscreenCanvas&&t.OffscreenCanvasRenderingContext2D&&t.HTMLCanvasElement&&t.HTMLCanvasElement.prototype.transferControlToOffscreen&&t.URL&&t.URL.createObjectURL),c=typeof Path2D=="function"&&typeof DOMMatrix=="function",d=(function(){if(!t.OffscreenCanvas)return!1;try{var o=new OffscreenCanvas(1,1),a=o.getContext("2d");a.fillRect(0,0,1,1);var h=o.transferToImageBitmap();a.createPattern(h,"no-repeat")}catch{return!1}return!0})();function u(){}function f(o){var a=n.exports.Promise,h=a!==void 0?a:t.Promise;return typeof h=="function"?new h(o):(o(u,u),null)}var v=(function(o,a){return{transform:function(h){if(o)return h;if(a.has(h))return a.get(h);var m=new OffscreenCanvas(h.width,h.height),y=m.getContext("2d");return y.drawImage(h,0,0),a.set(h,m),m},clear:function(){a.clear()}}})(d,new Map),x=(function(){var o=Math.floor(16.666666666666668),a,h,m={},y=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(a=function(g){var k=Math.random();return m[k]=requestAnimationFrame(function p(M){y===M||y+o-1<M?(y=M,delete m[k],g()):m[k]=requestAnimationFrame(p)}),k},h=function(g){m[g]&&cancelAnimationFrame(m[g])}):(a=function(g){return setTimeout(g,o)},h=function(g){return clearTimeout(g)}),{frame:a,cancel:h}})(),_=(function(){var o,a,h={};function m(y){function g(k,p){y.postMessage({options:k||{},callback:p})}y.init=function(p){var M=p.transferControlToOffscreen();y.postMessage({canvas:M},[M])},y.fire=function(p,M,z){if(a)return g(p,null),a;var A=Math.random().toString(36).slice(2);return a=f(function(C){function T(D){D.data.callback===A&&(delete h[A],y.removeEventListener("message",T),a=null,v.clear(),z(),C())}y.addEventListener("message",T),g(p,A),h[A]=T.bind(null,{data:{callback:A}})}),a},y.reset=function(){y.postMessage({reset:!0});for(var p in h)h[p](),delete h[p]}}return function(){if(o)return o;if(!r&&i){var y=["var CONFETTI, SIZE = {}, module = {};","("+e.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{o=new Worker(URL.createObjectURL(new Blob([y])))}catch(g){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",g),null}m(o)}return o}})(),S={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function E(o,a){return a?a(o):o}function R(o){return o!=null}function b(o,a,h){return E(o&&R(o[a])?o[a]:S[a],h)}function B(o){return o<0?0:Math.floor(o)}function H(o,a){return Math.floor(Math.random()*(a-o))+o}function P(o){return parseInt(o,16)}function L(o){return o.map(Q)}function Q(o){var a=String(o).replace(/[^0-9a-f]/gi,"");return a.length<6&&(a=a[0]+a[0]+a[1]+a[1]+a[2]+a[2]),{r:P(a.substring(0,2)),g:P(a.substring(2,4)),b:P(a.substring(4,6))}}function ee(o){var a=b(o,"origin",Object);return a.x=b(a,"x",Number),a.y=b(a,"y",Number),a}function te(o){o.width=document.documentElement.clientWidth,o.height=document.documentElement.clientHeight}function ne(o){var a=o.getBoundingClientRect();o.width=a.width,o.height=a.height}function Rn(o){var a=document.createElement("canvas");return a.style.position="fixed",a.style.top="0px",a.style.left="0px",a.style.pointerEvents="none",a.style.zIndex=o,a}function In(o,a,h,m,y,g,k,p,M){o.save(),o.translate(a,h),o.rotate(g),o.scale(m,y),o.arc(0,0,1,k,p,M),o.restore()}function On(o){var a=o.angle*(Math.PI/180),h=o.spread*(Math.PI/180);return{x:o.x,y:o.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:o.startVelocity*.5+Math.random()*o.startVelocity,angle2D:-a+(.5*h-Math.random()*h),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:o.color,shape:o.shape,tick:0,totalTicks:o.ticks,decay:o.decay,drift:o.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:o.gravity*3,ovalScalar:.6,scalar:o.scalar,flat:o.flat}}function Nn(o,a){a.x+=Math.cos(a.angle2D)*a.velocity+a.drift,a.y+=Math.sin(a.angle2D)*a.velocity+a.gravity,a.velocity*=a.decay,a.flat?(a.wobble=0,a.wobbleX=a.x+10*a.scalar,a.wobbleY=a.y+10*a.scalar,a.tiltSin=0,a.tiltCos=0,a.random=1):(a.wobble+=a.wobbleSpeed,a.wobbleX=a.x+10*a.scalar*Math.cos(a.wobble),a.wobbleY=a.y+10*a.scalar*Math.sin(a.wobble),a.tiltAngle+=.1,a.tiltSin=Math.sin(a.tiltAngle),a.tiltCos=Math.cos(a.tiltAngle),a.random=Math.random()+2);var h=a.tick++/a.totalTicks,m=a.x+a.random*a.tiltCos,y=a.y+a.random*a.tiltSin,g=a.wobbleX+a.random*a.tiltCos,k=a.wobbleY+a.random*a.tiltSin;if(o.fillStyle="rgba("+a.color.r+", "+a.color.g+", "+a.color.b+", "+(1-h)+")",o.beginPath(),c&&a.shape.type==="path"&&typeof a.shape.path=="string"&&Array.isArray(a.shape.matrix))o.fill(Vn(a.shape.path,a.shape.matrix,a.x,a.y,Math.abs(g-m)*.1,Math.abs(k-y)*.1,Math.PI/10*a.wobble));else if(a.shape.type==="bitmap"){var p=Math.PI/10*a.wobble,M=Math.abs(g-m)*.1,z=Math.abs(k-y)*.1,A=a.shape.bitmap.width*a.scalar,C=a.shape.bitmap.height*a.scalar,T=new DOMMatrix([Math.cos(p)*M,Math.sin(p)*M,-Math.sin(p)*z,Math.cos(p)*z,a.x,a.y]);T.multiplySelf(new DOMMatrix(a.shape.matrix));var D=o.createPattern(v.transform(a.shape.bitmap),"no-repeat");D.setTransform(T),o.globalAlpha=1-h,o.fillStyle=D,o.fillRect(a.x-A/2,a.y-C/2,A,C),o.globalAlpha=1}else if(a.shape==="circle")o.ellipse?o.ellipse(a.x,a.y,Math.abs(g-m)*a.ovalScalar,Math.abs(k-y)*a.ovalScalar,Math.PI/10*a.wobble,0,2*Math.PI):In(o,a.x,a.y,Math.abs(g-m)*a.ovalScalar,Math.abs(k-y)*a.ovalScalar,Math.PI/10*a.wobble,0,2*Math.PI);else if(a.shape==="star")for(var w=Math.PI/2*3,$=4*a.scalar,I=8*a.scalar,O=a.x,W=a.y,q=5,N=Math.PI/q;q--;)O=a.x+Math.cos(w)*I,W=a.y+Math.sin(w)*I,o.lineTo(O,W),w+=N,O=a.x+Math.cos(w)*$,W=a.y+Math.sin(w)*$,o.lineTo(O,W),w+=N;else o.moveTo(Math.floor(a.x),Math.floor(a.y)),o.lineTo(Math.floor(a.wobbleX),Math.floor(y)),o.lineTo(Math.floor(g),Math.floor(k)),o.lineTo(Math.floor(m),Math.floor(a.wobbleY));return o.closePath(),o.fill(),a.tick<a.totalTicks}function Wn(o,a,h,m,y){var g=a.slice(),k=o.getContext("2d"),p,M,z=f(function(A){function C(){p=M=null,k.clearRect(0,0,m.width,m.height),v.clear(),y(),A()}function T(){r&&!(m.width===s.width&&m.height===s.height)&&(m.width=o.width=s.width,m.height=o.height=s.height),!m.width&&!m.height&&(h(o),m.width=o.width,m.height=o.height),k.clearRect(0,0,m.width,m.height),g=g.filter(function(D){return Nn(k,D)}),g.length?p=x.frame(T):C()}p=x.frame(T),M=C});return{addFettis:function(A){return g=g.concat(A),z},canvas:o,promise:z,reset:function(){p&&x.cancel(p),M&&M()}}}function Oe(o,a){var h=!o,m=!!b(a||{},"resize"),y=!1,g=b(a,"disableForReducedMotion",Boolean),k=i&&!!b(a||{},"useWorker"),p=k?_():null,M=h?te:ne,z=o&&p?!!o.__confetti_initialized:!1,A=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,C;function T(w,$,I){for(var O=b(w,"particleCount",B),W=b(w,"angle",Number),q=b(w,"spread",Number),N=b(w,"startVelocity",Number),Hn=b(w,"decay",Number),qn=b(w,"gravity",Number),Un=b(w,"drift",Number),We=b(w,"colors",L),Kn=b(w,"ticks",Number),Ve=b(w,"shapes"),Zn=b(w,"scalar"),Gn=!!b(w,"flat"),je=ee(w),Be=O,ke=[],Xn=o.width*je.x,Yn=o.height*je.y;Be--;)ke.push(On({x:Xn,y:Yn,angle:W,spread:q,startVelocity:N,color:We[Be%We.length],shape:Ve[H(0,Ve.length)],ticks:Kn,decay:Hn,gravity:qn,drift:Un,scalar:Zn,flat:Gn}));return C?C.addFettis(ke):(C=Wn(o,ke,M,$,I),C.promise)}function D(w){var $=g||b(w,"disableForReducedMotion",Boolean),I=b(w,"zIndex",Number);if($&&A)return f(function(N){N()});h&&C?o=C.canvas:h&&!o&&(o=Rn(I),document.body.appendChild(o)),m&&!z&&M(o);var O={width:o.width,height:o.height};p&&!z&&p.init(o),z=!0,p&&(o.__confetti_initialized=!0);function W(){if(p){var N={getBoundingClientRect:function(){if(!h)return o.getBoundingClientRect()}};M(N),p.postMessage({resize:{width:N.width,height:N.height}});return}O.width=O.height=null}function q(){C=null,m&&(y=!1,t.removeEventListener("resize",W)),h&&o&&(document.body.contains(o)&&document.body.removeChild(o),o=null,z=!1)}return m&&!y&&(y=!0,t.addEventListener("resize",W,!1)),p?p.fire(w,O,q):T(w,O,q)}return D.reset=function(){p&&p.reset(),C&&C.reset()},D}var ve;function Ne(){return ve||(ve=Oe(null,{useWorker:!0,resize:!0})),ve}function Vn(o,a,h,m,y,g,k){var p=new Path2D(o),M=new Path2D;M.addPath(p,new DOMMatrix(a));var z=new Path2D;return z.addPath(M,new DOMMatrix([Math.cos(k)*y,Math.sin(k)*y,-Math.sin(k)*g,Math.cos(k)*g,h,m])),z}function jn(o){if(!c)throw new Error("path confetti are not supported in this browser");var a,h;typeof o=="string"?a=o:(a=o.path,h=o.matrix);var m=new Path2D(a),y=document.createElement("canvas"),g=y.getContext("2d");if(!h){for(var k=1e3,p=k,M=k,z=0,A=0,C,T,D=0;D<k;D+=2)for(var w=0;w<k;w+=2)g.isPointInPath(m,D,w,"nonzero")&&(p=Math.min(p,D),M=Math.min(M,w),z=Math.max(z,D),A=Math.max(A,w));C=z-p,T=A-M;var $=10,I=Math.min($/C,$/T);h=[I,0,0,I,-Math.round(C/2+p)*I,-Math.round(T/2+M)*I]}return{type:"path",path:a,matrix:h}}function Bn(o){var a,h=1,m="#000000",y='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof o=="string"?a=o:(a=o.text,h="scalar"in o?o.scalar:h,y="fontFamily"in o?o.fontFamily:y,m="color"in o?o.color:m);var g=10*h,k=""+g+"px "+y,p=new OffscreenCanvas(g,g),M=p.getContext("2d");M.font=k;var z=M.measureText(a),A=Math.ceil(z.actualBoundingBoxRight+z.actualBoundingBoxLeft),C=Math.ceil(z.actualBoundingBoxAscent+z.actualBoundingBoxDescent),T=2,D=z.actualBoundingBoxLeft+T,w=z.actualBoundingBoxAscent+T;A+=T+T,C+=T+T,p=new OffscreenCanvas(A,C),M=p.getContext("2d"),M.font=k,M.fillStyle=m,M.fillText(a,D,w);var $=1/h;return{type:"bitmap",bitmap:p.transferToImageBitmap(),matrix:[$,0,0,$,-A*$/2,-C*$/2]}}n.exports=function(){return Ne().apply(this,arguments)},n.exports.reset=function(){Ne().reset()},n.exports.create=Oe,n.exports.shapeFromPath=jn,n.exports.shapeFromText=Bn})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),Ie,!1);const Ka=Ie.exports;Ie.exports.create;export{wa as $,Ns as A,Ws as B,Gs as C,ya as D,Js as E,ea as F,ta as G,na as H,Ia as I,va as J,da as K,oa as L,ua as M,ha as N,fa as O,ma as P,ja as Q,ba as R,Pa as S,Ra as T,Oa as U,Ba as V,xa as W,Ha as X,Ma as Y,qa as Z,aa as _,la as a,_a as a0,qs as a1,js as a2,Sa as a3,La as a4,$a as a5,Fa as a6,za as a7,pa as a8,ra as a9,Xs as aa,Os as b,Is as c,Da as d,ga as e,Ta as f,ka as g,Hs as h,Na as i,Ys as j,Ea as k,Zs as l,ca as m,Qs as n,Wa as o,Us as p,Ka as q,sa as r,Va as s,Aa as t,Ua as u,ia as v,Ca as w,Vs as x,Bs as y,Ks as z};
