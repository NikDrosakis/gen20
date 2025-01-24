if(G.mode=="" || G.mode=="writer"|| G.mode=="editor") {
    if(!coo('boxstyle')){coo('boxstyle','archieve');}
booklist();
}


function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}