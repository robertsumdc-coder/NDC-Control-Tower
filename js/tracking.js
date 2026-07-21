// ======================================================
// NDC CONTROL TOWER ENTERPRISE
// TRACKING MODULE V2
// PART 1
// ======================================================

document.addEventListener("DOMContentLoaded", initTracking);

function initTracking() {

    const btn = document.getElementById("btnTracking");
    const txt = document.getElementById("txtTracking");

    if (!btn || !txt) {
        console.warn("Tracking Component tidak ditemukan.");
        return;
    }

    btn.addEventListener("click", searchShipment);

    txt.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            searchShipment();

        }

    });

}

// ======================================================
// SEARCH SHIPMENT
// ======================================================

async function searchShipment() {

    const keyword = document
        .getElementById("txtTracking")
        .value
        .trim();

    if (!keyword) {

        alert("Masukkan Nomor RT / Order / LC / SI / Container");

        return;

    }

    try {

        document.body.style.cursor = "wait";

        const result = await API.tracking(keyword);

        console.log("Tracking Result", result);
    if (!result.success) {

    showNotFound();

    return;

}
        // Simpan response API
window.currentTracking = result.data || {};
window.currentTrackingItems = result.items || [];
window.currentJourney = result.journey || {};
window.currentSummary = result.summary || {};
window.currentLeadtime = result.leadtime || {};
window.currentHealth = result.health || {};

console.log("=== TRACKING RESULT ===");
console.log(result);

console.log("=== JOURNEY ===");
console.log(window.currentJourney);

// Render
renderShipment(result.data);

    }

    catch (err) {

        console.error(err);

        alert("Gagal menghubungi server.");

    }

    finally {

        document.body.style.cursor = "default";

    }

}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(value) {

    if (!value) return "-";

    const d = new Date(value);

    if (isNaN(d)) return "-";

    return d.toLocaleString("id-ID", {

        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"

    });

}

// ======================================================
// RENDER SHIPMENT
// ======================================================

function renderShipment(s) {

    if (!s) return;

    const notFound = document.getElementById("notFoundPanel");

if(notFound){

    notFound.style.display = "none";

}

    console.clear();

    console.log("Shipment");

    console.table(s);

    // ------------------------
    // Summary Lama
    // ------------------------

    setText("shipVendor", s.carrierid);

    setText("shipContainer", s.container);

    setText("shipSeal", s.seal);

    setText("shipVehicle", s.vehicle);

    setText("shipDriver", s.driver);

    setText("shipPhone", s.phone);

    setText("shipType", s.type);

    setText("shipTo", s.shipTo || s.shipto);

    setText("shipLine", s.shippingline);

    setText("checkoutTime", formatDate(s.checkOut));

    setText("etdTime", formatDate(s.etd));

    setText("atdTime", formatDate(s.atd));

    setText("etaTime", formatDate(s.eta));

    setText("ataTime", formatDate(s.ata));

    setText("dooringTime", formatDate(s.dooring));

    setText("currentPosition", s.shipTo || s.shipto);

    // ------------------------
    // Enterprise Panel
    // ------------------------

    renderShipmentInfo(s);

    renderOperationalAlert(s);

    renderJourney(s);

    renderShipmentProgress(s);

    renderVessel(s);

    renderShipmentMap();

    renderItems(window.currentTrackingItems);

    updateShipmentStatus(s);

}

// ======================================================
// HELPER
// ======================================================

function setText(id, value) {

    const el = document.getElementById(id);

    if (!el) return;

    el.textContent = value || "-";

}

// ======================================================
// SHIPMENT INFORMATION
// ======================================================

function renderShipmentInfo(s){

    const panel = document.getElementById("shipmentPanel");

    if(panel){

        panel.style.display = "block";

    }

    // ===========================
    // Shipment Information
    // ===========================

    setText("infoReceive", s.noReceive);
    setText("infoLC", s.lc);
    setText("infoStatus", s.status);
    setText("infoContainer", s.container);

    setText("infoStore", s.shipTo || s.shipto);
    setText("infoCity", s.city);
    setText("infoVessel", s.vessel);
    setText("infoShippingLine", s.shippingline);

    // ===========================
    // Command Center
    // ===========================

    const summary = window.currentSummary || {};

const lt = Number(s.lt || 0);

// ======================================
// ACTUAL LEAD TIME
// ======================================

let elapsed = 0;

if (s.checkOut) {

    const start = new Date(s.checkOut);

    let finish = new Date();

    // Shipment sudah ATA
    if (s.ata) {

        finish = new Date(s.ata);

    }

    // Shipment sudah Dooring
    if (s.dooring) {

        finish = new Date(s.dooring);

    }

    elapsed = Math.ceil(

        (finish - start) / 86400000

    );

    if (elapsed < 0) elapsed = 0;

}
let progress = 0;

if (lt > 0) {

    progress = Math.round(

        (elapsed / lt) * 100

    );

}

// Maksimum 100%

progress = Math.min(progress,100);

// Tampilkan Health

setText(
    "summaryHealth",
    progress + "%"
);

// Lead Time

setText(
    "summaryLeadtime",
    elapsed +
    " / " +
    lt +
    " Hari"
);

    setText(
        "summarySKU",
        summary.totalSKU ?? 0
    );

    setText(
        "summaryQty",
        Number(summary.totalQty ?? 0)
            .toLocaleString("id-ID")
    );

}

// ======================================================
// JOURNEY TIMELINE
// ======================================================

function renderJourney(s){

    function journeyStep(boxId,dateId,value){

    const box=document.getElementById(boxId);
    const date=document.getElementById(dateId);

    if(date){

        date.innerText=value ? formatDate(value) : "-";

    }

    if(box){

        if(value){

            box.classList.add("text-success");

        }else{

            box.classList.remove("text-success");

        }

    }

}

function updateJourney(data){

    const steps = [

        { id:"Checkin",  value:data.checkIn },
        { id:"Open",     value:data.open },
        { id:"Close",    value:data.close },
        { id:"Checkout", value:data.checkOut },
        { id:"ETD",      value:data.etd },
        { id:"ATD",      value:data.atd },
        { id:"ETA",      value:data.eta },
        { id:"ATA",      value:data.ata },
        { id:"Door",     value:data.dooring }

    ];

    document
        .querySelectorAll(".journey-step")
        .forEach(e=>{
            e.classList.remove("active","pending");
        });

    document
        .querySelectorAll(".journey-line")
        .forEach(e=>{
            e.classList.remove("active");
        });

    steps.forEach((step,index)=>{

        const item=document.getElementById("j"+step.id);

        if(!item) return;

        if(step.value){

            item.classList.add("active");

            if(index>0){

                document
                    .querySelectorAll(".journey-line")[index-1]
                    ?.classList.add("active");

            }

        }else{

            item.classList.add("pending");

        }

    });

}
    const panel=document.getElementById("journeyPanel");

    if(panel){

        panel.style.display="block";

    }

    const steps=[

        {box:"jCheckin",date:"dCheckin",value:s.checkIn},
        {box:"jOpen",date:"dOpen",value:s.open},
        {box:"jClose",date:"dClose",value:s.close},
        {box:"jCheckout",date:"dCheckout",value:s.checkOut},
        {box:"jETD",date:"dETD",value:s.etd},
        {box:"jATD",date:"dATD",value:s.atd},
        {box:"jETA",date:"dETA",value:s.eta},
        {box:"jATA",date:"dATA",value:s.ata},
        {box:"jDoor",date:"dDoor",value:s.dooring}

    ];

    steps.forEach(step=>{

        journeyStep(step.box,step.date,step.value);

    });

    updateJourney(s);

}

// ======================================================
// SHIPMENT PROGRESS
// ======================================================

function renderShipmentProgress(s){

    const panel = document.getElementById("progressPanel");

    if(panel){

        panel.style.display = "block";

    }

    const journey = window.currentJourney || {};

const progress = Number(journey.progress || 0);

const label = journey.status || "Waiting";

let color = "bg-secondary";

switch(label){

    case "Delivered":
    case "Arrived":
        color = "bg-success";
        break;

    case "On Sailing":
        color = "bg-warning";
        break;

    case "Waiting Vessel":
        color = "bg-info";
        break;

    case "NDC to Port":
        color = "bg-primary";
        break;

    default:
        color = "bg-secondary";
}

    document.getElementById("progressLabel").innerText = label;

    document.getElementById("progressPercent").innerText = progress + "%";

    const bar = document.getElementById("progressBar");

    bar.style.width = progress + "%";

    bar.className =
        "progress-bar progress-bar-striped progress-bar-animated " + color;

}

// ======================================================
// VESSEL MONITORING
// ======================================================

function renderVessel(s){

    const panel=document.getElementById("vesselPanel");

    if(panel){

        panel.style.display="block";

    }

    setText("vesselName",s.vessel);

    setText("vesselContainer",s.container);

    setText("shippingLine",s.shippingline);

    setText("carrier",s.carrierid);

    setText("moda",s.moda);

    setText("ritase",s.ritase);

    setText("loadingId",s.loadid);

    if(s.lt){

        const lt = Math.round(Number(s.lt));

        setText("leadTime", lt + " Hari");

    }else{

        setText("leadTime","-");

    }

}

// ======================================================
// OPERATIONAL ALERT
// ======================================================

function renderOperationalAlert(s){

    const panel = document.getElementById("alertPanel");
    const content = document.getElementById("alertContent");

    if(!panel || !content) return;

    panel.style.display = "block";

    const today = new Date();

    const targetLT = Number(s.lt || 0);

    let actualLT = null;

    if(s.checkOut && s.dooring){

        actualLT = Math.ceil(
            (new Date(s.dooring) - new Date(s.checkOut))
            / (1000 * 60 * 60 * 24)
        );

    }

    // ==========================
    // ATA > 2 hari belum Dooring
    // ==========================

    if(s.ata && !s.dooring){

        const days = Math.floor(
            (today - new Date(s.ata))
            / (1000*60*60*24)
        );

        if(days > 2){

            content.className="alert alert-warning mb-0";

            content.innerHTML=
            `⚠ <b>WARNING</b><br>
            Container sudah ATA selama <b>${days} hari</b> tetapi belum dilakukan <b>Dooring</b>.<br>
            Segera follow up Expediter.`;

            return;

        }

    }

    // ==========================
    // LEAD TIME DELAY
    // ==========================

    if(actualLT !== null){

        if(actualLT > targetLT){

            content.className="alert alert-danger mb-0";

            content.innerHTML=
            `🚨 <b>DELAY</b><br>
            Target LT : <b>${targetLT} Hari</b><br>
            Actual LT : <b>${actualLT} Hari</b><br>
            Terlambat <b>${actualLT-targetLT} Hari</b>.`;

            return;

        }

        if(actualLT < targetLT){

            content.className="alert alert-primary mb-0";

            content.innerHTML=
            `🚀 <b>FASTER</b><br>
            Target LT : <b>${targetLT} Hari</b><br>
            Actual LT : <b>${actualLT} Hari</b><br>
            Lebih cepat <b>${targetLT-actualLT} Hari</b>.`;

            return;

        }

        content.className="alert alert-success mb-0";

        content.innerHTML=
        `✅ <b>ON TIME</b><br>
        Target LT : <b>${targetLT} Hari</b><br>
        Actual LT : <b>${actualLT} Hari</b>.`;

        return;

    }

    // ==========================
    // NORMAL
    // ==========================

    content.className="alert alert-success mb-0";

    content.innerHTML=
        `✅ Shipment berjalan normal.`;

}

// ======================================================
// SHIPMENT STATUS
// ======================================================

function updateShipmentStatus(s){

    const badge=document.getElementById("currentStatus");

    const desc=document.getElementById("statusDescription");

    const infoStatus = document.getElementById("infoStatus");

    let status="Waiting";

    let color="bg-secondary";

    let info="Shipment belum diproses.";

    if(s.dooring){

        status="Delivered";

        color="bg-success";

        info="Shipment telah diterima Store.";

    }

    else if(s.ata){

        status="Arrived";

        color="bg-primary";

        info="Container sudah tiba di pelabuhan.";

    }

    else if(s.atd){

        status="On Sailing";

        color="bg-info";

        info="Container sedang dalam perjalanan.";

    }

    else if(s.etd){

        status="Waiting Vessel";

        color="bg-warning";

        info="Menunggu keberangkatan kapal.";

    }

    else if(s.checkOut){

        status="NDC to Port";

        color="bg-dark";

        info="Container keluar dari NDC.";

    }

    if(badge){

    badge.className = "badge " + color;
    badge.innerText = status;

}

if(infoStatus){

    infoStatus.innerHTML =
        '<span class="badge ' + color + ' fs-6 px-3 py-2">' +
        status +
        '</span>';

}

if(desc){

    desc.innerHTML = info;

}

}

// ======================================================
// DETAIL ORDER
// ======================================================

function renderItems(items){

    const panel=document.getElementById("detailOrderPanel");

    if(panel){

        panel.style.display="block";

    }

    const tbody=document.querySelector("#tblTrackingItem tbody");

    if(!tbody) return;

    tbody.innerHTML="";

    if(!items || items.length===0){

        tbody.innerHTML=`
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Tidak ada Detail Order
                </td>
            </tr>
        `;

        return;

    }

    // ===============================
    // GROUP SKU
    // ===============================

    const group={};

    items.forEach(r=>{

        const key=(r.sku||"")+"|"+(r.description||"");

        if(!group[key]){

            group[key]={

                order:r.order,

                sku:r.sku,

                description:r.description,

                qty:0

            };

        }

        group[key].qty+=Number(r.qty||0);

    });

    const rows=Object.values(group);

    rows.sort((a,b)=>{

        return String(a.sku).localeCompare(String(b.sku));

    });

    rows.forEach((r,i)=>{

        tbody.innerHTML+=`

        <tr>

            <td>${i+1}</td>

            <td>${r.order||"-"}</td>

            <td>${r.sku||"-"}</td>

            <td>${r.description||"-"}</td>

            <td class="text-end">

                ${Number(r.qty).toLocaleString("id-ID")}

            </td>

        </tr>

        `;

    });

}

// ======================================================
// AUTO SCROLL
// ======================================================

function scrollTracking(){

    const panel=document.getElementById("shipmentPanel");

    if(panel){

        panel.scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

    }

}

// ======================================================
// RESET PANEL
// ======================================================

function resetTracking(){

    [
        "notFoundPanel",
        "shipmentPanel",
        "journeyPanel",
        "vesselPanel",
        "detailOrderPanel",
        "alertPanel"
    ].forEach(id=>{

        const el = document.getElementById(id);

        if(el){

            el.style.display = "none";

        }

    });

    const alertContent=document.getElementById("alertContent");

    if(alertContent){

        alertContent.innerHTML="-";

        }

}

// ======================================================
// NOT FOUND
// ======================================================

function showNotFound(){

    resetTracking();

    const panel = document.getElementById("notFoundPanel");

    if(panel){

        panel.style.display = "block";

    }

}

// ======================================================
// UPDATE SUMMARY
// ======================================================

function updateTrackingSummary(items){

    if(!items) return;

    const totalSku=items.length;

    const totalQty=items.reduce((a,b)=>{

        return a+Number(b.qty||0);

    },0);

    console.log("Total SKU :",totalSku);

    console.log("Total Qty :",totalQty);

}

// ======================================================
// OVERRIDE RENDER SHIPMENT
// ======================================================

const _renderShipment=renderShipment;

renderShipment=function(data){

    resetTracking();

    _renderShipment(data);

    updateTrackingSummary(window.currentTrackingItems||[]);

    scrollTracking();

}

// ======================================================
// SHIPMENT MAP
// ======================================================

let shipmentMap = null;

let shipmentMarker = null;

const CITY_COORDINATES = {

    "SIDOARJO":[-7.4467,112.7181],

    "PALU":[-0.8917,119.8707],

    "MAKASSAR":[-5.1477,119.4327],

    "KENDARI":[-3.9985,122.5120],

    "KOLAKA":[-4.060276563494305, 121.61106728051391],

    "BAUBAU":[-5.463741932986989, 122.59794689587399],

    "MANADO":[1.4748,124.8421],

    "GORONTALO":[0.5435,123.0568],

    "PAREPARE":[-4.0096,119.6255],

    "PALOPO":[-2.9899637266154504, 120.18700806701358],

    "BITUNG":[1.4451,125.1824],

    "AMBON":[-3.6954,128.1814],

    "TERNATE":[0.7893,127.3842],

    "SORONG":[-0.8762,131.2558],

    "TIMIKA":[-4.5481,136.8874],

    "TOMOHON":[1.315634818840846, 124.83763340746339],

    "JAYAPURA":[-2.5916,140.6690]

};
console.log("TRACKING VERSION 10 JULY");
const warehouseIcon = L.divIcon({

    html:'<i class="bi bi-building-fill text-primary fs-2"></i>',

    className:'',

    iconSize:[32,32]

});

const storeIcon = L.divIcon({

    html:'<i class="bi bi-shop text-danger fs-2"></i>',

    className:'',

    iconSize:[32,32]

});

function createVesselIcon(status){

    let color="#6c757d";

    switch(status){

        case "Delivered":
            color="#198754";
            break;

        case "On Sailing":
            color="#0d6efd";
            break;

        case "NDC → Port":
            color="#fd7e14";
            break;

        case "Delay":
            color="#dc3545";
            break;

    }

    return L.divIcon({

        className:"",

        iconSize:[54,54],

        iconAnchor:[27,27],

        html:`

            <div
                class="ship-marker"
                style="background:${color}">

                🚢

            </div>

        `

    });

}

function normalizeCity(city){

    city = String(city || "")
        .toUpperCase()
        .trim();

    city = city
        .replace("KOTA ","")
        .replace("KABUPATEN ","")
        .replace("KAB. ","")
        .replace("KAB ","");

    const alias = {

        "MIMIKA":"TIMIKA",
        "UJUNG PANDANG":"MAKASSAR",
        "GORONTALO UTARA":"GORONTALO"

    };

    return alias[city] || city;

}

function renderShipmentMap() {

    const panel = document.getElementById("mapPanel");

    if(panel){
        panel.style.display = "block";
    }

    const s = window.currentTracking;

    if(!s) return;

    const origin = CITY_COORDINATES["SIDOARJO"];

    const destination =
        CITY_COORDINATES[
        normalizeCity(s.city)
        ];

    if(!origin || !destination){

        console.log("Koordinat kota belum tersedia.", s.city);

        return;

    }

    function getShipmentStatus(s){

    if(s.dooring){
        return "Delivered";
    }

    if(s.ata && !s.dooring){
        return "Delay";
    }

    if(s.atd && !s.ata){
        return "On Sailing";
    }

    if(s.checkOut && !s.atd){
        return "NDC → Port";
    }

    return "Waiting";
}

function getShipmentProgress(s){

    if(s.dooring) return 1.0;

    if(s.ata) return 0.90;

    if(s.eta) return 0.75;

    if(s.atd) return 0.55;

    if(s.etd) return 0.35;

    if(s.checkOut) return 0.15;

    return 0.0;

}

    //--------------------------------------------------
    // INIT MAP
    //--------------------------------------------------

    if(!shipmentMap){

    shipmentMap = L.map("shipmentMap");

    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom:20
        }
    ).addTo(shipmentMap);

}


    //--------------------------------------------------
    // Hapus marker lama
    //--------------------------------------------------

    shipmentMap.eachLayer(function(layer){

        if(layer instanceof L.Marker){

            shipmentMap.removeLayer(layer);

        }

        if(layer instanceof L.Polyline){

            shipmentMap.removeLayer(layer);

        }

    });

    //--------------------------------------------------
    // Marker NDC
    //--------------------------------------------------

    L.marker(origin,{
    icon: warehouseIcon
})
    .addTo(shipmentMap)
    .bindPopup(`
        <div style="min-width:180px">
            <h6 class="mb-1">🏭 NDC Sidoarjo</h6>
            <hr class="my-1">
            <small>
                Origin Warehouse
                <br>
                Nasional Distribution Center
            </small>
        </div>
    `);

    //--------------------------------------------------
    // Marker Tujuan
    //--------------------------------------------------

    L.marker(destination,{
    icon: storeIcon
})
    .addTo(shipmentMap)
    .bindPopup(`
        <div style="min-width:220px">

            <h6 class="mb-1">
                📍 ${s.shipTo}
            </h6>

            <hr class="my-1">

            <table class="table table-sm mb-0">

                <tr>
                    <td><b>City</b></td>
                    <td>${s.city}</td>
                </tr>

                <tr>
                    <td><b>Container</b></td>
                    <td>${s.container || "-"}</td>
                </tr>

                <tr>
                    <td><b>Vessel</b></td>
                    <td>${s.vessel || "-"}</td>
                </tr>

                <tr>
                    <td><b>Status</b></td>
                    <td>${getShipmentStatus(s)}</td>
                </tr>

            </table>

        </div>
    `);

    //--------------------------------------------------
    // Route
    //--------------------------------------------------

    //--------------------------------------------------
// Route Color
//--------------------------------------------------

let routeColor = "#0d6efd";

const status = getShipmentStatus(s);

switch(status){

    case "Delivered":
        routeColor = "#198754";
        break;

    case "On Sailing":
        routeColor = "#0d6efd";
        break;

    case "NDC → Port":
        routeColor = "#fd7e14";
        break;

    case "Delay":
        routeColor = "#dc3545";
        break;

    default:
        routeColor = "#6c757d";

}

let shipColor="#6c757d";

switch(status){

    case "Delivered":

        shipColor="#198754";

        break;

    case "On Sailing":

        shipColor="#0d6efd";

        break;

    case "NDC → Port":

        shipColor="#fd7e14";

        break;

    case "Delay":

        shipColor="#dc3545";

        break;

}

//--------------------------------------------------
// Vessel Position
//--------------------------------------------------

const progress = getShipmentProgress(s);

const actual =
    s.actual ??
    (
        s.checkOut && s.dooring
        ? Math.ceil(
            (new Date(s.dooring) - new Date(s.checkOut))
            / 86400000
        )
        : 0
    );

const lat =
    origin[0] +
    (destination[0]-origin[0]) * progress;

const lng =
    origin[1] +
    (destination[1]-origin[1]) * progress;

//--------------------------------------------------
// CURVE ROUTE
//--------------------------------------------------

const curve = [

    origin,

    [

        (origin[0] + destination[0]) / 2 + 2.5,

        (origin[1] + destination[1]) / 2

    ],

    destination

];

//--------------------------------------------------
// GLOW ROUTE
//--------------------------------------------------

L.polyline(curve, {

    color: routeColor,

    weight: 6,

    opacity: 0.10,

    lineCap: "round"

}).addTo(shipmentMap);


//--------------------------------------------------
// MAIN ROUTE
//--------------------------------------------------

L.polyline(curve, {

    color: routeColor,

    weight: 2.5,

    opacity: 0.95,

    smoothFactor: 3,

    dashArray: "8 8",

    lineCap: "round",

    lineJoin: "round"

}).addTo(shipmentMap);

//--------------------------------------------------
// VEHICLE POSITION
//--------------------------------------------------

L.marker([lat, lng], {

    icon: createVesselIcon(status),

    zIndexOffset:1000

})

.addTo(shipmentMap)
.bindPopup(`

<div class="shipment-popup">

    <div class="popup-header">

        <div>

            🚢 <strong>${s.vessel || "-"}</strong>

        </div>

        <span class="badge bg-primary">

            ${status}

        </span>

    </div>

    <table class="table table-sm table-borderless mb-2">

        <tr>

            <td width="110"><b>LC</b></td>

            <td>${s.lc || "-"}</td>

        </tr>

        <tr>

            <td><b>Container</b></td>

            <td>${s.container || "-"}</td>

        </tr>

        <tr>

            <td><b>Store</b></td>

            <td>${s.shipTo || "-"}</td>

        </tr>

        <tr>

            <td><b>City</b></td>

            <td>${s.city || "-"}</td>

        </tr>

        <tr>

            <td><b>ETD</b></td>

            <td>${formatDate(s.etd)}</td>

        </tr>

        <tr>

            <td><b>ETA</b></td>

            <td>${formatDate(s.eta)}</td>

        </tr>

        <tr>

            <td><b>Lead Time</b></td>

            <td>${s.lt || 0} Hari</td>

        </tr>

        <tr>

            <td><b>Actual</b></td>

            <td>${actual} Hari</td>

        </tr>

    </table>

    <div class="progress" style="height:10px;">

        <div

            class="progress-bar bg-primary"

            style="width:${Math.round(progress*100)}%">

        </div>

    </div>

    <small class="text-muted">

        Progress ${Math.round(progress*100)}%

    </small>

</div>

`)
    //--------------------------------------------------
    // Zoom
    //--------------------------------------------------

    setTimeout(function(){

    shipmentMap.invalidateSize();

},300);


    shipmentMap.fitBounds(

        [

            origin,

            destination

        ],

        {

            padding:[50,50]

        }

    );

}

