const orderCtx = document.getElementById("chartTrend");

if(orderCtx){

new Chart(orderCtx,{

type:"line",

data:{

labels:["Sen","Sel","Rab","Kam","Jum","Sab","Min"],

datasets:[{

label:"Order",

data:[120,150,180,160,220,250,210],

borderWidth:3,

tension:.35

}]

}

});

}


const statusCtx=document.getElementById("chartStatus");

if(statusCtx){

new Chart(statusCtx,{

type:"doughnut",

data:{

labels:["Delivered","On Sailing","Pending"],

datasets:[{

data:[60,25,15]

}]

}

});

}