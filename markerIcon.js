/******************************/
/*****CUSTOM ICONS & LOGO*****/
/****************************/

// init custom icon ref.


simaluguri = L.icon({
    iconUrl: 'assets/teamarker.png',
    iconSize: [36, 36]
});

singribari = L.icon({
    iconUrl: 'assets/teamarker.png',
    iconSize: [36, 36]
});

parbahuHabi = L.icon({
    iconUrl: 'assets/teamarker.png',
    iconSize: [36, 36]
});

sonajuli = L.icon({
    iconUrl: 'assets/teamarker.png',
    iconSize: [36, 36]
});

jabangaPathar = L.icon({
    iconUrl: 'assets/teamarker.png',
    iconSize: [36, 36]
});

dharamjuliJungal = L.icon({
    iconUrl: 'assets/teamarker.png',
    iconSize: [36, 36]
});



//function for icon
function getIcon(dtype) {

    if (dtype == "Dharamjuli Jungal") {

        return dharamjuliJungal;
    }
    else if (dtype == "Jabanga Pathar") {

        return jabangaPathar;
    }
    else if (dtype == "No 1 Sonajuli") {

        return sonajuli;
    }
    else if (dtype == "Parbahu Habi") {

        return parbahuHabi;
    }
    else if (dtype == "No 1 Singribari") {

        return singribari;
    }
    else return simaluguri;

}