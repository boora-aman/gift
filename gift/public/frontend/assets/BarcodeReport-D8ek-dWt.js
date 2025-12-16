var C=Object.defineProperty,D=Object.defineProperties;var T=Object.getOwnPropertyDescriptors;var f=Object.getOwnPropertySymbols;var A=Object.prototype.hasOwnProperty,B=Object.prototype.propertyIsEnumerable;var w=(r,t,i)=>t in r?C(r,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):r[t]=i,_=(r,t)=>{for(var i in t||(t={}))A.call(t,i)&&w(r,i,t[i]);if(f)for(var i of f(t))B.call(t,i)&&w(r,i,t[i]);return r},v=(r,t)=>D(r,T(t));var u=(r,t,i)=>new Promise((p,s)=>{var a=g=>{try{h(i.next(g))}catch(o){s(o)}},l=g=>{try{h(i.throw(g))}catch(o){s(o)}},h=g=>g.done?p(g.value):Promise.resolve(g.value).then(a,l);h((i=i.apply(r,t)).next())});import{_ as E,r as F,b as I,d as V,e as b,c as d,o as n,a as e,w as m,v as k,f as z,t as c,g as O,h as j,i as G,j as P,F as R,k as N,l as M,n as U,R as S}from"./index-CKG_yBRf.js";import{u as L}from"./useToast-Cin3WjbI.js";import{e as W}from"./exportUtils-rTjg8JsQ.js";import{r as Y}from"./PrinterIcon-jWEUgNww.js";const q={name:"BarcodeReport",components:{PrinterIcon:Y,ArrowDownTrayIcon:V,ArrowUpIcon:I,ArrowDownIcon:F},setup(){const{showToast:r}=L();return{showToast:r}},data(){return{loading:!1,isExporting:!1,reportData:[],selectedRecords:[],totalRecords:0,currentPage:1,totalPages:1,pageSize:20,sortBy:"creation",sortOrder:"desc",filters:{giftNo:"",ringNumber:""}}},computed:{visiblePages(){const r=[];let i=Math.max(1,this.currentPage-Math.floor(2.5)),p=Math.min(this.totalPages,i+5-1);p-i+1<5&&(i=Math.max(1,p-5+1));for(let s=i;s<=p;s++)r.push(s);return r},allSelected(){return this.reportData.length>0&&this.selectedRecords.length===this.reportData.length}},mounted(){this.loadReport()},methods:{loadReport(){return u(this,null,function*(){this.loading=!0;try{const r={page:this.currentPage,limit:this.pageSize,order_by:this.sortBy,sort_order:this.sortOrder,gift_no:this.filters.giftNo,ring_number:this.filters.ringNumber};Object.keys(r).forEach(i=>{r[i]||delete r[i]});const t=yield S.getBarcodeReportData(r);if(t.success)this.reportData=t.data,this.totalRecords=t.total,this.totalPages=t.totalPages;else throw new Error(t.error)}catch(r){console.error("Error loading report:",r),this.showToast("Failed to load report: "+r.message,"error")}finally{this.loading=!1}})},exportReport(){return u(this,null,function*(){this.isExporting=!0;try{const r={limit:1e4,order_by:this.sortBy,sort_order:this.sortOrder,gift_no:this.filters.giftNo,ring_number:this.filters.ringNumber};Object.keys(r).forEach(s=>{r[s]||delete r[s]});const t=yield S.getBarcodeReportData(r);if(!t.success)throw new Error(t.error);const i=[{key:"serial_no",title:"Sr. No"},{key:"gift_id",title:"Gift No"},{key:"barcode_value",title:"Ring Number"},{key:"status",title:"Status"},{key:"owner_full_name",title:"Issued To"},{key:"gift_name",title:"Gift Name"},{key:"category",title:"Category"},{key:"created_date",title:"Created Date"}],p=t.data.map((s,a)=>v(_({},s),{serial_no:a+1}));W(p,i,"Barcode_Print_Report"),this.showToast("Report exported successfully","success")}catch(r){console.error("Export error:",r),this.showToast("Failed to export report: "+r.message,"error")}finally{this.isExporting=!1}})},printSelectedRecords(){const r=this.selectedRecords.length>0?this.reportData.filter(t=>this.selectedRecords.includes(t.gift_id)):this.reportData;if(r.length===0){this.showToast("No records to print","error");return}this.openPrintWindow(r)},printSingleRecord(r){this.openPrintWindow([r])},openPrintWindow(r){try{const t=window.open("","_blank");if(!t){this.showToast("Please allow pop-ups to print the report","error");return}const i=this.generatePrintContent(r);t.document.write(i),t.document.close(),t.addEventListener("load",()=>{setTimeout(()=>{t.print()},1e3)})}catch(t){console.error("Print error:",t),this.showToast("Failed to open print window","error")}},generatePrintContent(r){const i=[];for(let s=0;s<r.length;s+=6)i.push(r.slice(s,s+6));return`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Barcode Print Report</title>
            <meta charset="utf-8">
            <style>
              @page {
                size: A4;
                margin: 15mm;
              }
              
              body {
                font-family: Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.2;
                margin: 0;
                padding: 0;
              }
              
              .print-page {
                page-break-after: always;
                page-break-inside: avoid;
                width: 100%;
                display: block;
                padding: 10mm 0;
                min-height: calc(100vh - 20mm);
              }
              
              .print-page:last-child {
                page-break-after: auto;
              }
              
              .page-header {
                text-align: center;
                margin-bottom: 15px;
                border-bottom: 2px solid #333;
                padding-bottom: 8px;
              }
              
              .page-header h2 {
                margin: 0 0 3px 0;
                font-size: 14pt;
                font-weight: bold;
              }
              
              .page-header p {
                margin: 0;
                font-size: 9pt;
                color: #666;
              }
              
              .page-spacer {
                height: 15px;
              }
              
              .print-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 5px;
              }
              
              .print-table th,
              .print-table td {
                border: 1px solid #333;
                padding: 6px 3px;
                text-align: left;
                vertical-align: middle;
                page-break-inside: avoid;
              }
              
              .print-table th {
                background-color: #f0f0f0;
                font-weight: bold;
                font-size: 8pt;
                text-align: center;
                height: 18px;
              }
              
              .print-table td {
                font-size: 9pt;
                height: 3.2cm;
                max-height: 3.2cm;
                min-height: 3.2cm;
                vertical-align: middle;
              }
              
              .barcode-cell {
                text-align: center;
                width: 120px;
                padding: 5px;
              }
              
              .barcode-image {
                width: 6cm;
                height: 2.8cm;
                object-fit: contain;
                border: 1px solid #ddd;
                background: white;
              }
              
              /* Column widths */
              .print-table th:nth-child(1),
              .print-table td:nth-child(1) { width: 60px; }
              .print-table th:nth-child(2),
              .print-table td:nth-child(2) { width: 90px; }
              .print-table th:nth-child(3),
              .print-table td:nth-child(3) { width: 90px; }
              .print-table th:nth-child(4),
              .print-table td:nth-child(4) { width: 80px; }
              .print-table th:nth-child(5),
              .print-table td:nth-child(5) { width: 140px; }
              .print-table th:nth-child(6),
              .print-table td:nth-child(6) { width: 120px; }
            </style>
          </head>
          <body>
            ${i.map((s,a)=>`
        <div class="print-page">
          <div class="page-header">
            <h2>Barcode Print Report - Page ${a+1}</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table class="print-table">
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Gift No</th>
                <th>Ring Number</th>
                <th>Status</th>
                <th>Issued To</th>
                <th>Barcode</th>
              </tr>
            </thead>
            <tbody>
              ${s.map((l,h)=>`
                <tr>
                  <td>${a*6+h+1}</td>
                  <td>${l.gift_id||"N/A"}</td>
                  <td>${l.barcode_value||"N/A"}</td>
                  <td>${l.status}</td>
                  <td>${l.owner_full_name||"Not Assigned"}</td>
                  <td class="barcode-cell">
                    ${l.barcode_image?`<img src="${l.barcode_image}" alt="${l.barcode_value}" class="barcode-image" />`:"No barcode"}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `).join("")}
          </body>
        </html>
      `},applyFilters(){this.currentPage=1,this.selectedRecords=[],this.loadReport()},clearFilters(){this.filters={giftNo:"",ringNumber:""},this.selectedRecords=[],this.applyFilters()},toggleSortOrder(){this.sortOrder=this.sortOrder==="asc"?"desc":"asc",this.applyFilters()},toggleSelectAll(){this.allSelected?this.selectedRecords=[]:this.selectedRecords=this.reportData.map(r=>r.gift_id)},goToPage(r){r>=1&&r<=this.totalPages&&(this.currentPage=r,this.selectedRecords=[],this.loadReport())}}},H={class:"min-h-screen bg-gray-50"},J={class:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"},K={class:"bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"},Q={class:"grid grid-cols-1 md:grid-cols-2 gap-4"},X={class:"mt-4 flex justify-between items-center"},Z=["disabled"],$={class:"bg-white rounded-lg shadow-sm border border-gray-200"},tt={class:"px-6 py-4 border-b border-gray-200"},et={class:"flex justify-between items-center"},rt={class:"text-lg font-medium text-gray-900"},st={class:"flex items-center space-x-4"},ot=["disabled"],it={class:"overflow-x-auto"},at={class:"min-w-full divide-y divide-gray-200"},nt={class:"bg-gray-50"},lt={class:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},dt=["checked"],ct={class:"bg-white divide-y divide-gray-200"},pt={key:0},gt={key:1},ht={class:"px-6 py-4 whitespace-nowrap"},mt=["value"],ut={class:"px-6 py-4 whitespace-nowrap"},bt={class:"text-sm font-medium text-gray-900"},xt={class:"px-6 py-4 whitespace-nowrap"},yt={class:"text-sm font-medium text-gray-900"},ft={class:"px-6 py-4 whitespace-nowrap"},wt={class:"text-sm text-gray-900"},_t={class:"px-6 py-4 whitespace-nowrap"},vt={class:"inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"},kt={class:"px-6 py-4 whitespace-nowrap"},Pt={class:"text-sm text-gray-900"},Rt={class:"px-6 py-4 whitespace-nowrap"},Nt={key:0,class:"flex items-center"},St=["src","alt"],Ct={key:1,class:"text-sm text-gray-400"},Dt={class:"px-6 py-4 whitespace-nowrap text-sm font-medium"},Tt=["onClick","disabled"],At={key:0,class:"px-6 py-4 border-t border-gray-200"},Bt={class:"flex items-center justify-between"},Et={class:"text-sm text-gray-700"},Ft={class:"flex space-x-2"},It=["disabled"],Vt=["onClick"],zt=["disabled"];function Ot(r,t,i,p,s,a){const l=b("PrinterIcon"),h=b("ArrowUpIcon"),g=b("ArrowDownIcon");return n(),d("div",H,[e("div",J,[e("div",K,[t[14]||(t[14]=e("h3",{class:"text-lg font-medium text-gray-900 mb-4"},"Search Barcode Print Report",-1)),e("div",Q,[e("div",null,[t[12]||(t[12]=e("label",{class:"block text-sm font-medium text-gray-700 mb-2"},"Gift No",-1)),m(e("input",{"onUpdate:modelValue":t[0]||(t[0]=o=>s.filters.giftNo=o),type:"text",placeholder:"Enter Gift No...",class:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"},null,512),[[k,s.filters.giftNo]])]),e("div",null,[t[13]||(t[13]=e("label",{class:"block text-sm font-medium text-gray-700 mb-2"},"Ring Number",-1)),m(e("input",{"onUpdate:modelValue":t[1]||(t[1]=o=>s.filters.ringNumber=o),type:"text",placeholder:"Enter Ring Number...",class:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"},null,512),[[k,s.filters.ringNumber]])])]),e("div",X,[e("button",{onClick:t[2]||(t[2]=(...o)=>a.applyFilters&&a.applyFilters(...o)),disabled:s.loading,class:"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-black disabled:opacity-50"}," Search ",8,Z),e("button",{onClick:t[3]||(t[3]=(...o)=>a.clearFilters&&a.clearFilters(...o)),class:"text-sm text-gray-500 hover:text-gray-700"}," Clear Search ")])]),e("div",$,[e("div",tt,[e("div",et,[e("h3",rt," Barcode Print Report ("+c(s.totalRecords)+" total) ",1),e("div",st,[e("button",{onClick:t[4]||(t[4]=(...o)=>a.printSelectedRecords&&a.printSelectedRecords(...o)),disabled:s.reportData.length===0,class:"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50"},[O(l,{class:"h-4 w-4 mr-2"}),t[15]||(t[15]=j(" Print All ",-1))],8,ot),m(e("select",{"onUpdate:modelValue":t[5]||(t[5]=o=>s.sortBy=o),onChange:t[6]||(t[6]=(...o)=>a.applyFilters&&a.applyFilters(...o)),class:"px-3 py-1 border border-gray-300 rounded-md text-sm"},[...t[16]||(t[16]=[e("option",{value:"creation"},"Sort by Created Date",-1),e("option",{value:"gift_name"},"Sort by Gift Name",-1),e("option",{value:"barcode_value"},"Sort by Ring Number",-1),e("option",{value:"status"},"Sort by Status",-1)])],544),[[G,s.sortBy]]),e("button",{onClick:t[7]||(t[7]=(...o)=>a.toggleSortOrder&&a.toggleSortOrder(...o)),class:"p-1 rounded text-gray-400 hover:text-gray-600"},[s.sortOrder==="asc"?(n(),P(h,{key:0,class:"h-4 w-4"})):(n(),P(g,{key:1,class:"h-4 w-4"}))])])])]),e("div",it,[e("table",at,[e("thead",nt,[e("tr",null,[e("th",lt,[e("input",{type:"checkbox",onChange:t[8]||(t[8]=(...o)=>a.toggleSelectAll&&a.toggleSelectAll(...o)),checked:a.allSelected,class:"rounded border-gray-300 text-gray-600 focus:ring-gray-500"},null,40,dt)]),t[17]||(t[17]=e("th",{class:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"}," Sr. No",-1)),t[18]||(t[18]=e("th",{class:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"}," Gift No",-1)),t[19]||(t[19]=e("th",{class:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"}," Ring Number",-1)),t[20]||(t[20]=e("th",{class:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"}," Status",-1)),t[21]||(t[21]=e("th",{class:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"}," Issued To",-1)),t[22]||(t[22]=e("th",{class:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"}," Barcode",-1)),t[23]||(t[23]=e("th",{class:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"}," Actions",-1))])]),e("tbody",ct,[s.loading?(n(),d("tr",pt,[...t[24]||(t[24]=[e("td",{colspan:"8",class:"px-6 py-12 text-center text-gray-500"},[e("div",{class:"flex justify-center"},[e("div",{class:"animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"})]),e("div",{class:"mt-2"},"Loading...")],-1)])])):s.reportData.length===0?(n(),d("tr",gt,[...t[25]||(t[25]=[e("td",{colspan:"8",class:"px-6 py-12 text-center text-gray-500"}," No records found ",-1)])])):(n(!0),d(R,{key:2},N(s.reportData,(o,x)=>(n(),d("tr",{key:o.gift_id,class:"hover:bg-gray-50"},[e("td",ht,[m(e("input",{type:"checkbox","onUpdate:modelValue":t[9]||(t[9]=y=>s.selectedRecords=y),value:o.gift_id,class:"rounded border-gray-300 text-gray-600 focus:ring-gray-500"},null,8,mt),[[M,s.selectedRecords]])]),e("td",ut,[e("div",bt,c((s.currentPage-1)*s.pageSize+x+1),1)]),e("td",xt,[e("div",yt,c(o.gift_id||"N/A"),1)]),e("td",ft,[e("div",wt,c(o.barcode_value||"N/A"),1)]),e("td",_t,[e("span",vt,c(o.status),1)]),e("td",kt,[e("div",Pt,c(o.owner_full_name||"Not Assigned"),1)]),e("td",Rt,[o.barcode_image?(n(),d("div",Nt,[e("img",{src:o.barcode_image,alt:o.barcode_value,class:"h-8 w-auto border border-gray-200 rounded"},null,8,St)])):(n(),d("div",Ct,"No barcode"))]),e("td",Dt,[e("button",{onClick:y=>a.printSingleRecord(o),disabled:!o.barcode_image,class:"text-gray-700 hover:text-gray-900 disabled:text-gray-400"}," Print ",8,Tt)])]))),128))])])]),s.totalPages>1?(n(),d("div",At,[e("div",Bt,[e("div",Et," Showing "+c((s.currentPage-1)*s.pageSize+1)+" to "+c(Math.min(s.currentPage*s.pageSize,s.totalRecords))+" of "+c(s.totalRecords)+" entries ",1),e("div",Ft,[e("button",{onClick:t[10]||(t[10]=o=>a.goToPage(s.currentPage-1)),disabled:s.currentPage===1,class:"px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"}," Previous ",8,It),(n(!0),d(R,null,N(a.visiblePages,o=>(n(),d("button",{key:o,onClick:x=>a.goToPage(o),class:U(["px-3 py-2 border border-gray-300 rounded-md text-sm font-medium",o===s.currentPage?"bg-gray-900 text-white border-gray-900":"text-gray-700 bg-white hover:bg-gray-50"])},c(o),11,Vt))),128)),e("button",{onClick:t[11]||(t[11]=o=>a.goToPage(s.currentPage+1)),disabled:s.currentPage===s.totalPages,class:"px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"}," Next ",8,zt)])])])):z("",!0)])])])}const Wt=E(q,[["render",Ot]]);export{Wt as default};
//# sourceMappingURL=BarcodeReport-D8ek-dWt.js.map
