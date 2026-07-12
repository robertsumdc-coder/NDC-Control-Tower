// ==========================================
// NDC CONTROL TOWER
// API SERVICE
// ==========================================

const WEBAPP =
"https://script.google.com/macros/s/AKfycbxWIAkNDi185Vwc7D6-i1If0emX4SSyfFcWWfmr8k3bEn6u20FYUv-obmBY4z15SkFaHA/exec";

const API = {

    async dashboard() {

        const response = await fetch(
            WEBAPP + "?action=dashboard"
        );

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