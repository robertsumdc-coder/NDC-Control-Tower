const Dashboard = {

    data: [],

    master:{

        owners:[],

        regions:[],

        stores:[],

        shippingLines:[],

        status:[]

        },

        masterLoaded:false,

    api: "https://script.google.com/macros/s/AKfycbxWIAkNDi185Vwc7D6-i1If0emX4SSyfFcWWfmr8k3bEn6u20FYUv-obmBY4z15SkFaHA/exec?action=dashboard",

    async init() {

        console.log("Loading Dashboard...");

        // ==============================
        // Simpan filter yang sedang dipilih
        // ==============================

    const currentFilter = {

    owner: document.getElementById("filterOwner")?.value || "",

    region: document.getElementById("filterRegion")?.value || "",

    store: document.getElementById("filterStore")?.value || "",

    status: document.getElementById("filterStatus")?.value || ""

    };

        let url = this.api;

        const start = document.getElementById("startDate")?.value;
        const end = document.getElementById("endDate")?.value;

        const region =
        document.getElementById("filterRegion")?.value || "";

        const store =
        document.getElementById("filterStore")?.value || "";

        const status =
        document.getElementById("filterStatus")?.value || "";

        const owner =
        document.getElementById("filterOwner")?.value || "";

        if(start){
    url += "&startDate=" + encodeURIComponent(start);
}

if(end){
    url += "&endDate=" + encodeURIComponent(end);
}

if(region){
    url += "&region=" + encodeURIComponent(region);
}

if(store){
    url += "&store=" + encodeURIComponent(store);
}

if(status){
    url += "&status=" + encodeURIComponent(status);
}

if(owner){
    url += "&owner=" + encodeURIComponent(owner);
}

        const res = await fetch(url);
        const json = await res.json();

        this.data = json.data || [];

this.renderSummary(json.summary || {});

// ======================================
// Load master filter hanya sekali
// ======================================

if(!this.masterLoaded){

    this.master.owners = json.owners || [];
    this.master.regions = json.regions || [];
    this.master.stores = json.stores || [];
    this.master.status = json.status || [];

    this.renderOwner(this.master.owners);
    this.renderRegion(this.master.regions);
    this.renderStore(this.master.stores);
    this.renderStatus(this.master.status);

    this.masterLoaded = true;

}

this.renderTable(this.data);

// ==============================
// Kembalikan pilihan filter user
// ==============================

document.getElementById("filterOwner").value =
    currentFilter.owner;

document.getElementById("filterRegion").value =
    currentFilter.region;

document.getElementById("filterStore").value =
    currentFilter.store;

document.getElementById("filterStatus").value =
    currentFilter.status;

    },

    //----------------------------------------------------
    // KPI
    //----------------------------------------------------

    renderSummary(summary) {

        this.setKPI("kpiOrder", summary.totalOrder || 0, "order");
        this.setKPI("kpiShipment", summary.totalShipment || 0, "shipment");
        this.setKPI("kpiPending", summary.toPort || 0, "toPort");
        this.setKPI("kpiSailing", summary.sailing || 0, "sailing");
        this.setKPI("kpiDelivered", summary.delivered || 0, "delivered");
        this.setKPI("kpiWaitingDooring",summary.waitingDooring || 0,"awaitingDooring"
);

    },

    setKPI(id, value, type) {

        const el = document.getElementById(id);

        if (!el) return;

        el.innerText = value;

        el.style.cursor = "pointer";

        el.onclick = () => {

            this.showKPIDetail(type);

        };

    },

    renderRegion(regions){

    const ddl = document.getElementById("filterRegion");

    if(!ddl) return;

    ddl.innerHTML = "";

    ddl.innerHTML += `
        <option value="">Semua Region</option>
    `;

    regions.forEach(r=>{

        ddl.innerHTML += `
            <option value="${r}">
                ${r}
            </option>
        `;

    });

    ddl.onchange = () => {

        this.filterStoreByRegion();

    };

},

renderOwner(owners){

    const ddl =
        document.getElementById("filterOwner");

    if(!ddl) return;

    ddl.innerHTML =
        `<option value="">Semua BU</option>`;

    owners.forEach(function(o){

        ddl.innerHTML += `
            <option value="${o}">
                ${o}
            </option>
        `;

    });

     // Reload Region & Store saat BU berubah
    ddl.onchange = () => {

        Dashboard.init();

     };   

},

renderStatus(status){

    const ddl =
        document.getElementById("filterStatus");

    if(!ddl) return;

    ddl.innerHTML =
        `<option value="">Semua Status</option>`;

    status.forEach(function(s){

        ddl.innerHTML += `
            <option value="${s}">
                ${s}
            </option>
        `;

    });

},

renderStore(stores){

    const ddl = document.getElementById("filterStore");

    if(!ddl) return;

    ddl.innerHTML =
        `<option value="">Semua Store</option>`;

    stores.forEach(function(s){

        ddl.innerHTML += `
            <option value="${s.store}">
                ${s.store}
            </option>
        `;

    });

},

filterStoreByRegion(){

    const region =
        document.getElementById("filterRegion").value;

    if(!region){

        this.renderStore(this.master.stores);

        const status = [...new Set(
    stores.map(s => s.status).filter(Boolean)
)];

this.renderStatus(status);

        return;

    }

    const stores =
        this.master.stores.filter(s=>

            s.region===region

        );

    this.renderStore(stores);

},
    //----------------------------------------------------
    // KPI DETAIL
    //----------------------------------------------------

    showKPIDetail(type) {

        let rows = [];

        switch (type) {

            case "toPort":

                rows = this.data.filter(r =>
                    r.checkOut && !r.atd
                );

                break;

            case "sailing":

                rows = this.data.filter(r =>
                    r.atd && !r.ata
                );

                break;

            case "delivered":

                rows = this.data.filter(r =>
                    r.ata
                );

                break;

            case "awaitingDooring":

                rows = this.data.filter(r =>
                    r.ata && !r.dooring
                );

                break;

            case "shipment":

                rows = this.data;

                break;

            case "order":

                rows = this.data;

                break;

            default:

                rows = this.data;

        }

        //------------------------------------------------
        // UNIQUE LC
        //------------------------------------------------

        const lcMap = {};

        rows.forEach(r => {

            const lc = String(r.lc || "").trim();

            if (!lc) return;

            if (!lcMap[lc]) {

                lcMap[lc] = r;

            }

        });

        rows = Object.values(lcMap);

        this.renderKPIDetail(type, rows);

    },

    renderKPIDetail(type, rows) {

        const title = document.getElementById("kpiModalTitle");
        const tbody = document.getElementById("kpiDetailBody");

        if (!title || !tbody) return;

        title.innerText = `${type.toUpperCase()} (${rows.length})`;

        let html = "";

        rows.forEach(r => {

            html += `
            <tr>

                <td>
                    <a href="#"
                       class="lc-link"
                       data-lc="${r.lc || ""}">
                        ${r.lc || ""}
                    </a>
                </td>

                <td>${r.container || ""}</td>

                <td>${r.vessel || ""}</td>

                <td>${r.region || ""}</td>

                <td>${r.shipTo || ""}</td>

                <td>${r.shipmentStatus || ""}</td>

            </tr>
            `;

        });

        tbody.innerHTML = html;

        //------------------------------------------------
        // CLICK LC
        //------------------------------------------------

        tbody.querySelectorAll(".lc-link").forEach(link => {

            link.addEventListener("click", e => {

                e.preventDefault();

                const lc = e.target.dataset.lc;

                console.log("Tracking LC :", lc);

                // tahap berikutnya:
                // Tracking.search(lc);

            });

        });

        const modal = new bootstrap.Modal(
            document.getElementById("kpiModal")
        );

        modal.show();

    },

    //----------------------------------------------------
    // TABLE
    //----------------------------------------------------

    renderTable(data) {

        const tbody = document.querySelector("#tblOrder tbody");

        if (!tbody) return;

        tbody.innerHTML = "";

        let html = "";

        data.slice(0, 10).forEach((r, i) => {

            html += `
            <tr>

                <td>${i + 1}</td>

                <td>${r.order || ""}</td>

                <td>${r.shipTo || ""}</td>

                <td>${r.owner || ""}</td>

                <td>${r.city || ""}</td>

                <td>${r.description || ""}</td>

                <td>${r.qty || ""}</td>

                <td>${r.cbm || ""}</td>

                <td>${r.statusOD || ""}</td>

                <td>${r.reqShip || ""}</td>

            </tr>
            `;

        });

        tbody.innerHTML = html;

    }

};

document.addEventListener("DOMContentLoaded", () => {

    Dashboard.init();

});

document
    .getElementById("btnSearch")
    ?.addEventListener("click", () => {

        Dashboard.init();

    });