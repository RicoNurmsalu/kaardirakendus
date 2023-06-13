// import axios from 'axios';
// console.log(axios.isCancel('something'));

//https://leaflet-extras.github.io/leaflet-providers/preview/

const osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
const cartoDB = '<a href="http://cartodb.com/attributions">CartoDB</a>';
// const stamenToner = <a href="http://maps.stamen.com">StamenToner</a>

const osmUrl = "http://tile.openstreetmap.org/{z}/{x}/{y}.png";
const osmAttrib = `&copy; ${osmLink} Contributors`;

const landUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png";
const cartoAttrib = `&copy; ${osmLink} Contributors & ${cartoDB}`;

const stamenUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}';
const stamenAttrib = 'Map data &copy; <a href="https://stamen.com">Stamen</a> contributors';

const osmMap = L.tileLayer(osmUrl, { attribution: osmAttrib });
const landMap = L.tileLayer(landUrl, { attribution: cartoAttrib });

const stamenMap = L.tileLayer(stamenUrl, {
  attribution: stamenAttrib,
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png',
});

// config map
let config = {
  // See siin määrab ära default mapi
  layers: [osmMap],
  minZoom: 5,
  maxZoom: 18,
};



// magnification with which the map will start
const zoom = 8;
// coordinates
const lat = 58.636856;
const lng = 25.334473;

// coordinate array with popup text
let points = [
  [59.091382, 25.817871, "point 1"],
  [59.068802, 25.169678, "point 2"],
  [58.551061, 24.290771, "point 3"],
  [58.81943, 23.928223, "point 4"],
  [58.499435, 24.433594, "point 5"],
  [58.338334, 25.070801, "point 6"],
  [58.585436, 23.291016, "point 7"],
  [57.815504, 27.279053, "point 8"],
  [57.838903, 26.531982, "point 9"],
  [58.378679, 26.993408, "point 10"],
  [59.226556, 26.740723, "point 11"],
  [59.417138, 26.542969, "point 12"],
  [58.345542, 24.183655, "point 13"],
  [58.331125, 24.818115, "point 14"],
  [58.377238, 24.614868, "point 15"],
  [58.450607, 24.587402, "point 16"],
  [58.284952, 24.194641, "point 17"],
  [58.352748, 24.796143, "point 18"],
  [58.297944, 24.623108, "point 19"],
  [58.256063, 24.568176, "point 20"],
  [58.543895, 24.499512, "point 21"],
  [58.454918, 24.716492, "point 22"],
  [58.452044, 24.988403, "point 23"],
  [58.2882, 24.614182, "point 24"],
  [58.2882, 24.575043, "point 25"],
  [58.290005, 24.622421, "Eesnimi: Anton" + '<br>' +
  "\nPerekonnanimi: Hansen"+ '<br>' +
  "Varjunimi: Tammsaare"+ '<br>' +
  "Sünniaeg: 30.01.1878"+ '<br>' +
  "Kasvukoht: Albu vald Järvamaa"+ '<br>' +
  "Valdkond: Kirjandus"+ '<br>' +
  "Tunnus: Kirjanik"]
];

// calling map
const map = L.map("map", config).setView([lat, lng], zoom);

// osm layer
osmMap.addTo(map);

// L.MarkerClusterGroup extends L.FeatureGroup
// by clustering the markers contained within
let markers = L.markerClusterGroup({
  spiderfyOnMaxZoom: false, // Disable spiderfying behavior
  showCoverageOnHover: false, // Disable cluster spiderfier polygon
});

// Create a custom divIcon with a small circle
function createCustomDivIcon() {
  return L.divIcon({
    className: 'custom-div-icon',
    html: '<div class="circle-icon"></div>',
    iconSize: [12, 12],
  });
}


// Add markers to the layer
for (let i = 0; i < points.length; i++) {
  const [lat, lng, title] = points[i];

  // Create a marker with the custom divIcon
  const marker = L.marker(new L.LatLng(lat, lng), {
    icon: createCustomDivIcon(i + 1), // Use the number (i + 1) as the content for the bubble
  }).bindPopup(title).on("click", clickZoom); //Centers the map when popup is clicked

  // Add the marker to the marker cluster group
  markers.addLayer(marker);
}


// Add all markers to map
map.addLayer(markers);

let baseLayers = {
  "Klassika": osmMap,
  "Dark mode": landMap,
  "Stamen Toner": stamenMap,
};

L.control.layers(baseLayers).addTo(map);

// Scale: imperial (miles) is set to false, only the metric scale is implemented
L.control.scale({imperial: false, maxWidth: 100}).addTo(map);


// Searchbox
let searchbox = L.control.searchbox({
    position: 'topright',
    expand: 'left'
}).addTo(map);

// Close and clear searchbox 600ms after pressing ENTER in the search box
searchbox.onInput("keyup", function (e) {
  if (e.keyCode === 13) {
    setTimeout(function () {
      searchbox.hide();
      searchbox.clear();
    }, 600);
  }
});

// Close and clear searchbox 600ms after clicking the search button
searchbox.onButton("click", function () {
  setTimeout(function () {
    searchbox.hide();
    searchbox.clear();
  }, 600);
});

searchbox.onInput("keyup", function (e) {
  let value = searchbox.getValue();
  if (value !== "") {
    const searchUrl = `http://localhost:8080/api/v1/searchByName?name=${value}`;

    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
          const persons = data;

          // Clear the existing dropdown options
          searchbox.clearItems();

          // Add the persons as dropdown options
          persons.forEach(person => {
            if (person.varjunimi == null){
              searchbox.addItem(person.eesnimi + " " + person.perekonnanimi);
              // searchbox.addItem(person.perekonnanimi + " " + person.eesnimi);
            } else {
              searchbox.addItem(person.eesnimi + " " + person.perekonnanimi + " " + person.varjunimi);
            }

          });
        })
        .catch(error => {
          console.error(error);
        });
  } else {
    searchbox.clearItems();
  }
});


// center the map when popup is clicked
function clickZoom(e) {
  map.setView(e.target.getLatLng(), 15); //see siin os veits sus, vahest zoomib liiga sisse
  // pantTo version
  // map.panTo(e.target.getLatLng());
}

// back to home button

const htmlTemplate = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z" /></svg>';
// const htmlTemplate = 'img/search_icon.png'

// create custom button
const customControl = L.Control.extend({
  // button position
  options: {
    position: "topleft",
  },

  // method
  onAdd: function (map) {
    console.log(map.getCenter());
    // create button
    const btn = L.DomUtil.create("button");
    btn.title = "tagasi algusesse";
    btn.innerHTML = htmlTemplate;
    btn.className += "leaflet-bar back-to-home hidden";

    return btn;
  },
});

// adding new button to map controll
map.addControl(new customControl());

// on drag end
map.on("moveend", getCenterOfMap);

const buttonBackToHome = document.querySelector(".back-to-home");

function getCenterOfMap() {
  buttonBackToHome.classList.remove("hidden");

  buttonBackToHome.addEventListener("click", () => {
    map.flyTo([lat, lng], zoom);
  });

  map.on("moveend", () => {
    const { lat: latCenter, lng: lngCenter } = map.getCenter();

    const latC = latCenter.toFixed(3) * 1;
    const lngC = lngCenter.toFixed(3) * 1;

    const defaultCoordinate = [+lat.toFixed(3), +lng.toFixed(3)];

    const centerCoordinate = [latC, lngC];

    if (compareToArrays(centerCoordinate, defaultCoordinate)) {
      buttonBackToHome.classList.add("hidden");
    }
  });
}

const compareToArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);



// MiniMap
const osm2 = new L.TileLayer(osmUrl, { minZoom: 0, maxZoom: 13});
const miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);
