// ==========================================
// NDC CONTROL TOWER
// API SERVICE
// ==========================================

const WEBAPP =
"https://script.google.com/macros/s/AKfycbx53Ec75YAAl3sScKE97CpmC80Fg3_C3zgUakTBZcdpv0dPY4y6ziSbyJdo6ZZwQt3sdQ/exec";

const API = {

    async dashboard() {

        const response = await fetch(
            WEBAPP + "?action=dashboard"
        );

        return await response.json();

    },

    async summary(){

    const response = await fetch(

        WEBAPP + "?action=summary"

    );

    return await response.json();

    },

    async master(){

    const response = await fetch(

        WEBAPP + "?action=master"

    );

    return await response.json();

    },

    async table(filter = {}){

    let url = WEBAPP + "?action=table";

    Object.keys(filter).forEach(function(key){

        if(filter[key]){

            url += "&" + key + "=" +

                encodeURIComponent(filter[key]);

        }

    });

    const response = await fetch(url);

    return await response.json();

    },

    async tracking(order) {

        const response = await fetch(

            WEBAPP +
            "?action=tracking&order=" +
            encodeURIComponent(order)

        );

        return await response.json();

    },

    async test() {

        const response = await fetch(
            WEBAPP + "?action=test"
        );

        return await response.json();

    }

};