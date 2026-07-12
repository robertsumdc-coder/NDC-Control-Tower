function updateClock(){

const now = new Date();

const clock = document.getElementById("clock");

if (!clock) return;

clock.innerHTML = now.toLocaleString("id-ID");

}

setInterval(updateClock,1000);

updateClock();
window.addEventListener("load", () => {

    const loading = document.getElementById("loadingScreen");

    if (loading) {

        setTimeout(() => {

            loading.style.display = "none";

        }, 800);

    }

});