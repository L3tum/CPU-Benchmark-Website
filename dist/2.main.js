(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{10:function(e,n,a){"use strict";a.r(n);var t=a(0),i=a.n(t),r=a(12);const s={AVX2:"//wikipedia.org/wiki/AVX2",TSC:"//wikipedia.org/wiki/Time_Stamp_Counter",TSC_INVARIANT:"//wikipedia.org/wiki/Time_Stamp_Counter",RDTSCP:"//wikipedia.org/wiki/RDTSC",MSR:"//wikipedia.org/wiki/Model-specific_register",PAE:"//wikipedia.org/wiki/Physical_Address_Extension",PSE:"//wikipedia.org/wiki/Page_Size_Extension",MCE:"//wikipedia.org/wiki/Machine-check_exception",APIC:"//wikipedia.org/wiki/Advanced_Programmable_Interrupt_Controller",MTRR:"//wikipedia.org/wiki/Memory_type_range_register",MCA:"//wikipedia.org/wiki/Machine_Check_Architecture",CMOV:"//wikipedia.org/wiki/CMOV",PAT:"//wikipedia.org/wiki/Page_attribute_table",PSE36:"//wikipedia.org/wiki/PSE-36",SSE:"//wikipedia.org/wiki/Streaming_SIMD_Extensions",SSE2:"//wikipedia.org/wiki/SSE2",HTT:"//wikipedia.org/wiki/Hyper-threading",SSE3:"//wikipedia.org/wiki/SSE3",PCLMULQDQ:"//wikipedia.org/wiki/PCLMULQDQ",SSSE3:"//wikipedia.org/wiki/SSSE3",FMA_instruction_set:"//wikipedia.org/wiki/FMA_instruction_set",SSE4_1:"//wikipedia.org/wiki/SSE4#SSE4.1",SSE4_2:"//wikipedia.org/wiki/SSE4#SSE4.2",AES:"//wikipedia.org/wiki/AES_instruction_set",AVX:"//wikipedia.org/wiki/Advanced_Vector_Extensions",F16C:"//wikipedia.org/wiki/F16C",RDRND:"//wikipedia.org/wiki/RDRAND",FSGSBASE:"//wikipedia.org/wiki/FSGSBASE",BMI1:"//wikipedia.org/wiki/Bit_Manipulation_Instruction_Sets",SMEP:"//wikipedia.org/wiki/Supervisor_mode_execution_protection",BMI2:"//wikipedia.org/wiki/BMI2",RDSEED:"//wikipedia.org/wiki/RDSEED",ADX:"//wikipedia.org/wiki/Intel_ADX",SMAP:"//wikipedia.org/wiki/Supervisor_Mode_Access_Prevention",SHA:"//wikipedia.org/wiki/Intel_SHA_extensions",ABM:"//wikipedia.org/wiki/Bit_Manipulation_Instruction_Sets#ABM",SSE4A:"//wikipedia.org/wiki/SSE4#SSE4a",THREEDNOW:"//wikipedia.org/wiki/3DNow",THREEDNOW_PREFETCH:"//wikipedia.org/wiki/3DNow",POPCNT:"//wikipedia.org/wiki/Hamming_weight",MMX:"//wikipedia.org/wiki/MMX_(instruction_set)",FPU:"//wikipedia.org/wiki/Floating-point_unit",VME:"//wikipedia.org/wiki/Virtual_8086_mode#VME"};var o=a(140),c=a.n(o);const l={AuthenticAMD:"#990000",GenuineIntel:"#127CC1"};a.d(n,"renderResults",(function(){return w})),a.d(n,"renderInfo",(function(){return v})),a.d(n,"calculateOverallScore",(function(){return C})),a.d(n,"render",(function(){return S}));let u=new Promise(e=>e()),d=null,p=0;const h='\n<div class="col-12 d-flex justify-content-end"><h5>[save]</h5></div>\n<div class="col-12 d-flex justify-content-between"><h2>[cpu]</h2><h2>[score] Points</h2></div>\n<div class="col-12 col-lg-6" style="margin-top: 50px">\n<h5>Results</h5>\n<table class="table">\n<thead>\n<tr>\n<th>Threads</th>\n<th>Score</th>\n</tr>\n</thead>\n<tbody>\n[results_all]\n</tbody>\n</table>\n<br><br>\n<h5>Results per Category</h5>\n<table class="table">\n<thead>\n<tr data-toggle="collapse" data-target="#category_table" class="clickable">\n<th>Category (Click to expand)</th>\n<th>Score</th>\n</tr>\n</thead>\n<tbody id="category_table" class="collapse">\n[results_categories]\n</tbody>\n</table>\n<br><br>\n<h5>Results Detailed</h5>\n<table class="table">\n<thead>\n<tr data-toggle="collapse" data-target="#detailed_table" class="clickable">\n<th>Benchmark (Click to expand)</th>\n<th>Score</th>\n</tr>\n</thead>\n<tbody id="detailed_table" class="collapse">\n[results_detailed]\n</tbody>\n</table>\n</div>\n<div class="col-12 col-lg-6" style="margin-top: 50px">\n<h5>Comparisons</h5>\n<h6>Total Average</h6>\n<canvas id="score_comparison" width="400" height="100%"></canvas>\n<br><br>\n<div id="sc_average">\n<h6>Single Core Average</h6>\n<canvas id="sc_comparison" width="400" height="100%"></canvas>\n</div>\n<div id="ac_average">\n<h6>All Core Average</h6>\n<canvas id="ac_comparison" width="400" height="100%"></canvas>\n</div>\n</div>\n<div class="col-12 col-lg-6" style="margin-top: 50px">\n<h5>Machine</h5>\n<table class="table">\n<thead>\n<tr>\n<th>Property</th>\n<th>Value</th>\n</tr>\n</thead>\n<tbody>\n[info]\n</tbody>\n</table>\n</div>\n',m="\n<tr>\n    <td>[name]</td>\n    <td>[value]</td>\n</tr>\n",g="\n<tr>\n    <td>[name]</td>\n    <td>[value]</td>\n</tr>\n";function j(){i()("#accordion").html("<h5>Can't find the specified save!</h5>")}function k(e,n,a="Points"){e.sort((function(e,n){return e.value>n.value?-1:n.value>e.value?1:0}));const t=1e4*Math.round(e[e.length-1].value-1e4>0?(e[e.length-1].value-1e4)/1e4:0),i=1e4*Math.round(e[0].value+1e4<1e5?(e[0].value+1e4)/1e4:1e4);new c.a(n,{type:"horizontalBar",data:{labels:e.map(e=>e.name),datasets:[{label:a,data:e.map(e=>e.value),backgroundColor:e.map(e=>e.color),borderWidth:1}]},options:{scales:{xAxes:[{ticks:{beginAtZero:!0,min:t,max:i}}],yAxes:[{stacked:!0}]}}})}function f(e){return new Promise((n,a)=>{fetch(Object(r.e)(`average_${e.MachineInformation.Cpu.Caption.replace("@","at").replace(/ /g,"_").replace(/,/g,"_")}.automated`)).then(a=>{let t=new Promise(e=>e());a.ok&&(t=a.json().then(e=>new Promise(n=>{d=e,n()}))),Promise.all([t,u]).then(()=>{(function(e,n=1e4){return new Promise((a,t)=>{fetch(Object(r.b)()).then(t=>{t.ok?t.json().then(t=>{const i=[],s=[];for(const a of t.Entries)a.Value!==e&&s.push(new Promise(e=>{fetch(Object(r.e)(a.SaveFile)).then(a=>{a.ok||e(),a.json().then(a=>{const t=C(a);t<=p+n&&t>=p-n&&i.push({name:a.MachineInformation.Cpu.Name,value:t,color:l[a.MachineInformation.Vendor]}),e()})})}));Promise.all(s).then(()=>{a(i)})}):a([])})})})(e.MachineInformation.Cpu.Caption).then(e=>{const a=[{name:"You",value:p,color:"#008000"},...e];null!==d&&a.push({name:"Average",value:C(d),color:l[d.MachineInformation.Cpu.Vendor]}),a.length>1&&k(a,document.getElementById("score_comparison")),n()})})})})}function w(e){const n=[],a=[],t=[];return Object.keys(e.Results).forEach((function(i){Array.isArray(e.Results[i])&&e.Results[i].forEach((function(e){if(e.Benchmark.startsWith("Category: all")){let a=g.replace("[value]",e.Points).replace("[name]",`${i} ${parseInt(i),"Threads"}`);n.push(a)}else if(e.Benchmark.startsWith("Category:")){let n=g.replace("[value]",e.Points).replace("[name]",`${e.Benchmark.replace("Category: ","")} @ ${i} ${parseInt(i),"Threads"}`);a.push(n)}else{let n=g.replace("[value]",e.Points).replace("[name]",`${e.Benchmark} @ ${i} ${parseInt(i),"Threads"}`);t.push(n)}}))})),{all:n,categories:a,detailed:t}}function v(e){let n="";n+=m.replace("[name]","Caption").replace("[value]",e.MachineInformation.Cpu.Caption),n+=m.replace("[name]","Vendor").replace("[value]",e.MachineInformation.Cpu.Vendor),n+=m.replace("[name]","Cores").replace("[value]",e.MachineInformation.Cpu.PhysicalCores),n+=m.replace("[name]","Threads").replace("[value]",e.MachineInformation.Cpu.LogicalCores),n+=m.replace("[name]","NUMA").replace("[value]",`${e.MachineInformation.Cpu.Nodes} Node${1===e.MachineInformation.Cpu.Nodes?"":"s"} @ ${e.MachineInformation.Cpu.LogicalCoresPerNode} Threads per Node`),n+=m.replace("[name]","Frequency").replace("[value]",`${(e.MachineInformation.Cpu.MaxClockSpeed/1e3).toFixed(2)} GHz Measured / ${(e.MachineInformation.Cpu.NormalClockSpeed/1e3).toFixed(2)} GHz Reported`),n+=m.replace("[name]","Socket").replace("[value]",e.MachineInformation.Cpu.Socket),n+=m.replace("[name]","BIOS").replace("[value]",`${e.MachineInformation.SmBios.BIOSCodename} ${e.MachineInformation.SmBios.BIOSVersion} by ${e.MachineInformation.SmBios.BIOSVendor}`),n+=m.replace("[name]","Mainboard").replace("[value]",`${e.MachineInformation.SmBios.BoardName} ${e.MachineInformation.SmBios.BoardVersion} by ${e.MachineInformation.SmBios.BoardVendor}`);let a="";e.MachineInformation.Cpu.Cores.forEach((function(e){a+=`#${e.Number.toString().padStart(2,"0")} ${(e.MaxClockSpeed/1e3).toFixed(2)} GHz${(e.Number+1)%3==0?"\n":"\t"}`})),n+=m.replace("[name]","Cores").replace("[value]",`<span style="white-space: pre">${a}</span>`);let t="";e.MachineInformation.Cpu.Caches.forEach((function(e){t+=`${e.Level}\t${e.CapacityHRF}\t${e.Associativity}-way\t${e.TimesPresent}-times\t${e.Type}\n`})),n+=m.replace("[name]","Caches").replace("[value]",`<span style="white-space: pre">${t}</span>`);let i="";return e.MachineInformation.RAMSticks.forEach((function(e,n){i+=`${e.Name?e.Name:n} ${e.CapacityHRF} @ ${e.Speed} Mhz by ${e.Manfucturer}\n`})),n+=m.replace("[name]","RAM").replace("[value]",`<span style="white-space: pre">${i}</span>`),n+=function(e){let n;n+=m.replace("[name]","Feature Flags").replace("[value]",`${e.MachineInformation.Cpu.FeatureFlagsOne},\n        ${e.MachineInformation.Cpu.FeatureFlagsTwo},`),n+=m.replace("[name]","Extended Feature Flags").replace("[value]",`${e.MachineInformation.Cpu.ExtendedFeatureFlagsF7One},\n        ${e.MachineInformation.Cpu.ExtendedFeatureFlagsF7Two},\n        ${e.MachineInformation.Cpu.ExtendedFeatureFlagsF7Three},`),n+=m.replace("[name]","AMD Feature Flags").replace("[value]",`${e.MachineInformation.Cpu.AMDFeatureFlags.ExtendedFeatureFlagsF81One},\n        ${e.MachineInformation.Cpu.AMDFeatureFlags.ExtendedFeatureFlagsF81Two},\n        ${e.MachineInformation.Cpu.AMDFeatureFlags.FeatureFlagsSvm},\n        ${e.MachineInformation.Cpu.AMDFeatureFlags.FeatureFlagsApm},`),n+=m.replace("[name]","Intel Feature Flags").replace("[value]",`${e.MachineInformation.Cpu.IntelFeatureFlags.TPMFeatureFlags},\n        ${e.MachineInformation.Cpu.IntelFeatureFlags.ExtendedFeatureFlagsF81One},\n        ${e.MachineInformation.Cpu.IntelFeatureFlags.ExtendedFeatureFlagsF81Two},\n        ${e.MachineInformation.Cpu.IntelFeatureFlags.FeatureFlagsApm},`);for(let e in s)n=n.replace(new RegExp(`([^a-zA-Z0-9_])${e}(?![a-zA-Z0-9_]+)(,?)`,"g"),`$1<a href="${s[e]}" target="_blank">${e}</a>$2`);return n=n.replace(/,? ?NONE(,?)/g,"$1").replace(/,\W*,/g,",").replace(/,\W*<\/td>/g,""),n}(e),n}function C(e){const n=Object.keys(e.Results);let a=0,t=0;return n.forEach((function(n){if(!Array.isArray(e.Results[n]))return;let i=0,r=0;for(const a in e.Results[n]){const t=e.Results[n][a];if(t.hasOwnProperty("Benchmark")&&t.Benchmark.startsWith("Category: all")){i+=t.Points,r++;break}}a+=i,t+=r})),parseInt((a/t).toFixed(0))}function S(){i()("#sorting").parent().hide(),i()("#sorting").hide(),i()("#prev").parent().hide();const e=window.location.search.replace("?detail=","");u=new Promise((n,a)=>{fetch(Object(r.e)(e)).then(a=>{a.ok&&404!==a.status?a.json().then(a=>{f(a),function(e,n=1e4){new Promise((a,t)=>{u.then(()=>{if(!(1 in e.Results))return document.getElementById("sc_average").classList.add("d-none"),void a();fetch(Object(r.d)()).then(t=>{if(!t.ok)return document.getElementById("sc_average").classList.add("d-none"),void a();t.json().then(t=>{const i=[{name:"You",value:e.Results[1].find(e=>"Category: all"===e.Benchmark).Points,color:l[e.MachineInformation.Cpu.Vendor]}];for(const e of t.Entries){const a=e.Value.split(" === "),t=parseInt(a[1]);p<=t+n&&p>=t-n&&i.push({name:a[0],value:t,color:"grey"})}i.length>1&&k(i,document.getElementById("sc_comparison")),a()})})})})}(a),function(e,n=1e4){new Promise((a,t)=>{u.then(()=>{if(!(e.MachineInformation.Cpu.LogicalCores in e.Results))return document.getElementById("ac_average").classList.add("d-none"),void a();fetch(Object(r.a)(e.MachineInformation.Cpu.LogicalCores)).then(t=>{if(!t.ok)return document.getElementById("ac_average").classList.add("d-none"),void a();t.json().then(t=>{const i=[{name:"You",value:e.Results[e.MachineInformation.Cpu.LogicalCores].find(e=>"Category: all"===e.Benchmark).Points,color:l[e.MachineInformation.Cpu.Vendor]}];for(const e of t.Entries){const a=e.Value.split(" === "),t=parseInt(a[1]);p<=t+n&&p>=t-n&&i.push({name:a[0].trim(),value:t,color:"grey"})}i.length>1&&k(i,document.getElementById("ac_comparison")),a()})})})})}(a);let t=h.replace(/\[save]/g,e).replace(/\[cpu]/g,a.MachineInformation.Cpu.Name);t=t.replace("[info]",v(a));const s=w(a);t=t.replace("[results_all]",s.all.join("")),t=t.replace("[results_categories]",s.categories.join("")),t=t.replace("[results_detailed]",s.detailed.join("")),p=C(a),t=t.replace(/\[score]/g,isNaN(p)?"0".padStart(5,"0"):p.toString().padStart(5,"0")),i()("#accordion").html(t),i()(".navbar").addClass(a.MachineInformation.Cpu.Vendor),n()}):j()}).catch(e=>{console.error(e),j()})})}},12:function(e,n,a){"use strict";a.d(n,"e",(function(){return l})),a.d(n,"c",(function(){return u})),a.d(n,"b",(function(){return d})),a.d(n,"d",(function(){return p})),a.d(n,"a",(function(){return h}));const t="https://raw.githubusercontent.com/",i="L3tum",r="CPU-Benchmark-Database",s="master",o="saves",c="aggregations";function l(e){return`${t}${i}/${r}/${s}/${o}/${e}.json`}function u(e){return`${t}${i}/${r}/${s}/${c}/pagination/${e}.json`}function d(){return`${t}${i}/${r}/${s}/${c}/byCPU/average.json`}function p(){return`${t}${i}/${r}/${s}/${c}/averageByCoreCount/1.json`}function h(e){return`${t}${i}/${r}/${s}/${c}/averageByCoreCount/${e}.json`}},142:function(e,n,a){var t={"./af":13,"./af.js":13,"./ar":14,"./ar-dz":15,"./ar-dz.js":15,"./ar-kw":16,"./ar-kw.js":16,"./ar-ly":17,"./ar-ly.js":17,"./ar-ma":18,"./ar-ma.js":18,"./ar-sa":19,"./ar-sa.js":19,"./ar-tn":20,"./ar-tn.js":20,"./ar.js":14,"./az":21,"./az.js":21,"./be":22,"./be.js":22,"./bg":23,"./bg.js":23,"./bm":24,"./bm.js":24,"./bn":25,"./bn.js":25,"./bo":26,"./bo.js":26,"./br":27,"./br.js":27,"./bs":28,"./bs.js":28,"./ca":29,"./ca.js":29,"./cs":30,"./cs.js":30,"./cv":31,"./cv.js":31,"./cy":32,"./cy.js":32,"./da":33,"./da.js":33,"./de":34,"./de-at":35,"./de-at.js":35,"./de-ch":36,"./de-ch.js":36,"./de.js":34,"./dv":37,"./dv.js":37,"./el":38,"./el.js":38,"./en-SG":39,"./en-SG.js":39,"./en-au":40,"./en-au.js":40,"./en-ca":41,"./en-ca.js":41,"./en-gb":42,"./en-gb.js":42,"./en-ie":43,"./en-ie.js":43,"./en-il":44,"./en-il.js":44,"./en-nz":45,"./en-nz.js":45,"./eo":46,"./eo.js":46,"./es":47,"./es-do":48,"./es-do.js":48,"./es-us":49,"./es-us.js":49,"./es.js":47,"./et":50,"./et.js":50,"./eu":51,"./eu.js":51,"./fa":52,"./fa.js":52,"./fi":53,"./fi.js":53,"./fo":54,"./fo.js":54,"./fr":55,"./fr-ca":56,"./fr-ca.js":56,"./fr-ch":57,"./fr-ch.js":57,"./fr.js":55,"./fy":58,"./fy.js":58,"./ga":59,"./ga.js":59,"./gd":60,"./gd.js":60,"./gl":61,"./gl.js":61,"./gom-latn":62,"./gom-latn.js":62,"./gu":63,"./gu.js":63,"./he":64,"./he.js":64,"./hi":65,"./hi.js":65,"./hr":66,"./hr.js":66,"./hu":67,"./hu.js":67,"./hy-am":68,"./hy-am.js":68,"./id":69,"./id.js":69,"./is":70,"./is.js":70,"./it":71,"./it-ch":72,"./it-ch.js":72,"./it.js":71,"./ja":73,"./ja.js":73,"./jv":74,"./jv.js":74,"./ka":75,"./ka.js":75,"./kk":76,"./kk.js":76,"./km":77,"./km.js":77,"./kn":78,"./kn.js":78,"./ko":79,"./ko.js":79,"./ku":80,"./ku.js":80,"./ky":81,"./ky.js":81,"./lb":82,"./lb.js":82,"./lo":83,"./lo.js":83,"./lt":84,"./lt.js":84,"./lv":85,"./lv.js":85,"./me":86,"./me.js":86,"./mi":87,"./mi.js":87,"./mk":88,"./mk.js":88,"./ml":89,"./ml.js":89,"./mn":90,"./mn.js":90,"./mr":91,"./mr.js":91,"./ms":92,"./ms-my":93,"./ms-my.js":93,"./ms.js":92,"./mt":94,"./mt.js":94,"./my":95,"./my.js":95,"./nb":96,"./nb.js":96,"./ne":97,"./ne.js":97,"./nl":98,"./nl-be":99,"./nl-be.js":99,"./nl.js":98,"./nn":100,"./nn.js":100,"./pa-in":101,"./pa-in.js":101,"./pl":102,"./pl.js":102,"./pt":103,"./pt-br":104,"./pt-br.js":104,"./pt.js":103,"./ro":105,"./ro.js":105,"./ru":106,"./ru.js":106,"./sd":107,"./sd.js":107,"./se":108,"./se.js":108,"./si":109,"./si.js":109,"./sk":110,"./sk.js":110,"./sl":111,"./sl.js":111,"./sq":112,"./sq.js":112,"./sr":113,"./sr-cyrl":114,"./sr-cyrl.js":114,"./sr.js":113,"./ss":115,"./ss.js":115,"./sv":116,"./sv.js":116,"./sw":117,"./sw.js":117,"./ta":118,"./ta.js":118,"./te":119,"./te.js":119,"./tet":120,"./tet.js":120,"./tg":121,"./tg.js":121,"./th":122,"./th.js":122,"./tl-ph":123,"./tl-ph.js":123,"./tlh":124,"./tlh.js":124,"./tr":125,"./tr.js":125,"./tzl":126,"./tzl.js":126,"./tzm":127,"./tzm-latn":128,"./tzm-latn.js":128,"./tzm.js":127,"./ug-cn":129,"./ug-cn.js":129,"./uk":130,"./uk.js":130,"./ur":131,"./ur.js":131,"./uz":132,"./uz-latn":133,"./uz-latn.js":133,"./uz.js":132,"./vi":134,"./vi.js":134,"./x-pseudo":135,"./x-pseudo.js":135,"./yo":136,"./yo.js":136,"./zh-cn":137,"./zh-cn.js":137,"./zh-hk":138,"./zh-hk.js":138,"./zh-tw":139,"./zh-tw.js":139};function i(e){var n=r(e);return a(n)}function r(e){if(!a.o(t,e)){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}return t[e]}i.keys=function(){return Object.keys(t)},i.resolve=r,e.exports=i,i.id=142}}]);