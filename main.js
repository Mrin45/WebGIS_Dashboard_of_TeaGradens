//global map instantiation
var map = L.map('base').setView([26.244156, 92.537842], 7);
var distOverlayurl, villOverlayurl, distOverlaydata, villOverlaydata;


//loading dist overlay file 
var loader_js = $.ajax({
	url: "getOverlay.js",
	dataType: "script",
	success: console.log("district overlay filter module loaded"),
	error: function (xhr) {
		alert(xhr.statusText)
	}
})

//loading vill overlay file 
var loaderV_js = $.ajax({
	url: "getVillOverlay.js",
	dataType: "script",
	success: console.log("vill overlay filter module loaded"),
	error: function (xhr) {
		alert(xhr.statusText)
	}
})


$.when(loader_js, loaderV_js).done(function () {

	var createMap = function () {

		$('.preloader').fadeOut('slow');

		//marker instance
		var marker3;
		//marker group
		var myMarkerGroup = L.layerGroup().addTo(map);


		// For a list of basemaps see http://leaflet-extras.github.io/leaflet-providers/preview/
		googleTerrain = L.tileLayer('http://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}', {
			maxZoom: 20,
			subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
		});
		googleTerrain.addTo(map);

		var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
		});
		Esri_WorldImagery.addTo(map);

		//WMS request
		//Assam District boundary
		var wmsLayer = L.Geoserver.wms("http://localhost:8085/geoserver/wms", {
			layers: "TeaGarden:assam_boundary",
		});

		//udalguri Roads
		var wmsLayerRoad = L.Geoserver.wms("http://localhost:8085/geoserver/wms", {
			layers: "TeaGarden:Road",
		});

		d3.csv("data/teagar.csv").then(function (data) {


			//call function on map instance load and function call
			function mapLoadnReset() {

				//update total data count
				$("#dataCount").html(data.length)
				if (distOverlaydata != undefined) { map.removeLayer(distOverlaydata); }

			}

			//call function,load the map
			mapLoadnReset();

			//list of an id, mapped and extracted unique keys based on identifier
			var allGroup = d3.map(data, function (d) { return (d.District) }).keys();
			var allTypes = d3.map(data, function (d) { return (d.Village) }).keys();
			var allGrad = d3.map(data, function (d) { return (d.Garden_Nam) }).keys();
			var allFact = d3.map(data, function (d) { return (d.name) }).keys();
			//console.log(allGroup);

			//visualization update of markers on the basis of id selected
			function updateViz(selectedDistrict) {

				//filter function to select rows from original dataset on the basis of dropdown identifier selection
				myFilteredData = data.filter(function (d) { return d.District == selectedDistrict })

				//update total data count in the selected district
				$("#dataCount").html(myFilteredData.length)

				//clear markers within previous marker group
				myMarkerGroup.clearLayers()

				//overlay the dist layer
				//Add requested external GeoJSON to map
				distOverlayurl = getOverlay(selectedDistrict)

				if (distOverlaydata != undefined) { map.removeLayer(distOverlaydata); }

				$.getJSON(distOverlayurl, function (data) {

					distOverlaydata = L.geoJSON(data).addTo(map);
					//console.log(data)

				});

				//get coordinates for selectedDistrict
				coord = getCoord(selectedDistrict)

				//fly to region of interest
				map.flyTo([coord[0], coord[1]], 10, {
					animate: true,
					duration: 2 // in seconds
				});

				//plot new data derived from filter function
				myFilteredData.forEach(function (d) {
					marker3 = L.marker([d.Latitude, d.Longitude], { icon: getIcon(d.Village) }).bindTooltip(d.Garden_Nam).bindPopup(
						'<div style="font-size: 13px;">' +
						'<strong>Garden Name:</strong> ' + d.Garden_Nam +
						'<br/><strong>Grower Name:</strong> ' + d.Grower_Nam +
						'<br/><strong>District:</strong> ' + d.District +
						'<br/><strong>Subdivision:</strong> ' + d.Subdivision +
						'<br/><strong>ID No.:</strong> ' + d.Identification +
						'<br/><strong>Total Tea Garden Area (in bigha):</strong> ' + d.Total_Tea +
						'<br/><strong>Village:</strong> ' + d.Village +
						'<br/><strong>Community:</strong> ' + d.Community +
						'<br/><strong>Land Category:</strong> ' + d.Land_Categ +
						'<br/><strong>Nearby Factory:</strong> ' + d.Nearby_fac +
						'<br/><strong>Total Production of Tea Leaf / Year (in kg):</strong> ' + d.Total_prod +
						'<br/><strong>No. of Registered Plots:</strong> ' + d.Number_of +
						'</div>'
					).addTo(myMarkerGroup);

					marker3.openTooltip();
					marker3.closeTooltip();
				});

				myFilteredData.forEach(function (d) {
					marker3 = L.marker([d.latitude_y, d.longitude_x], {
						icon: L.icon({
							iconUrl: "assets/factTEA1.png",
							iconSize: [32, 32], // Adjust the size as per your requirement
							iconAnchor: [16, 32], // Adjust the anchor point if needed
						}),
					}).bindTooltip(d.name).bindPopup(
						'<div style="font-size: 13px;">' +
						'<strong>Factory Name:</strong> ' + d.name +
						'</div>'
					).addTo(myMarkerGroup);

					marker3.openTooltip();
					marker3.closeTooltip();
				});

			}



			/*dropdown menu for district filter*/
			//adding options to the button
			d3.select("#selectButton")
				.selectAll('myOptions')
				.data(allGroup)
				.enter()
				.append('option')
				.text(function (d) { return d; }) // text showed in the menu
				.attr("value", function (d) { return d; }) // corresponding value returned by the button


			//update on dropdown select event
			d3.select("#selectButton").on("change", function (d) {
				selectedDistrict = this.value
				//console.log(selectedDistrict)
				updateViz(selectedDistrict)
			})


			//visualization update of markers on the basis of id selected for village layer
			function updateVizz(selectedVillage) {

				//filter function to select rows from original dataset on the basis of dropdown identifier selection
				myFilteredData = data.filter(function (d) { return d.Village == selectedVillage })

				//update total data count in the selected village
				$("#dataCount").html(myFilteredData.length)

				//clear markers within previous marker group
				myMarkerGroup.clearLayers()

				//overlay the vill layer
				//Add requested external GeoJSON to map
				villOverlayurl = getVillOverlay(selectedVillage)

				if (villOverlaydata != undefined) { map.removeLayer(villOverlaydata); }

				$.getJSON(villOverlayurl, function (data) {

					villOverlaydata = L.geoJSON(data).addTo(map);
					//console.log(data)

				});

				//get coordinates for selectedVillage
				coords = getVillCoord(selectedVillage)

				//fly to region of interest
				map.flyTo([coords[0], coords[1]], 14, {
					animate: true,
					duration: 3 // in seconds
				});

				//plot new data derived from filter function
				myFilteredData.forEach(function (d) {
					marker3 = L.marker([d.Latitude, d.Longitude], { icon: getIcon(d.Village) }).bindTooltip(d.Garden_Nam).bindPopup(
						'<div style="font-size: 13px;">' +
						'<strong>Garden Name:</strong> ' + d.Garden_Nam +
						'<br/><strong>Grower Name:</strong> ' + d.Grower_Nam +
						'<br/><strong>District:</strong> ' + d.District +
						'<br/><strong>Subdivision:</strong> ' + d.Subdivision +
						'<br/><strong>ID No.:</strong> ' + d.Identification +
						'<br/><strong>Total Tea Garden Area (in bigha):</strong> ' + d.Total_Tea +
						'<br/><strong>Village:</strong> ' + d.Village +
						'<br/><strong>Community:</strong> ' + d.Community +
						'<br/><strong>Land Category:</strong> ' + d.Land_Categ +
						'<br/><strong>Nearby Factory:</strong> ' + d.Nearby_fac +
						'<br/><strong>Total Production of Tea Leaf / Year (in kg):</strong> ' + d.Total_prod +
						'<br/><strong>No. of Registered Plots:</strong> ' + d.Number_of +
						'</div>'
					).addTo(myMarkerGroup);

					marker3.openTooltip();
					marker3.closeTooltip();
				});
			}

			/*dropdown for village type filter */
			//adding options to selectButton1
			d3.select("#selectButton1")
				.selectAll('myOptions')
				.data(allTypes)
				.enter()
				.append('option')
				.text(function (d) { return d; }) //text under dropdown
				.attr("value", function (d) { return d; })

			//update on dropdown select event
			d3.select("#selectButton1").on("change", function (d) {
				selectedVillage = this.value
				//console.log(selectedVillage)
				updateVizz(selectedVillage)
			})

			/*dropdown for tea garden filter */
			//adding options to selectButton2
			d3.select("#selectButton2")
				.selectAll('myOptions')
				.data(allGrad)
				.enter()
				.append('option')
				.text(function (d) { return d; }) // text showed in the menu
				.attr("value", function (d) { return d; }) // corresponding value returned by the button

			//update on dropdown select event
			d3.select("#selectButton2").on("change", function (d) {
				selectedType = this.value
				//console.log(selectedType)
				myFilteredData = data.filter(function (d) { return d.Garden_Nam == selectedType })
				$("#dataCount").html(myFilteredData.length)
				//fly to region of interest
				map.flyTo([myFilteredData[0].Latitude, myFilteredData[0].Longitude], 18, {
					animate: true,
					duration: 2 // in seconds
				});
				myFilteredData.forEach(function (d) {
					marker3 = L.marker([d.Latitude, d.Longitude], { icon: getIcon(d.Village) }).bindTooltip(d.Garden_Nam).bindPopup(
						'<div style="font-size: 13px;">' +
						'<strong>Garden Name:</strong> ' + d.Garden_Nam +
						'<br/><strong>Grower Name:</strong> ' + d.Grower_Nam +
						'<br/><strong>District:</strong> ' + d.District +
						'<br/><strong>Subdivision:</strong> ' + d.Subdivision +
						'<br/><strong>ID No.:</strong> ' + d.Identification +
						'<br/><strong>Total Tea Garden Area (in bigha):</strong> ' + d.Total_Tea +
						'<br/><strong>Village:</strong> ' + d.Village +
						'<br/><strong>Community:</strong> ' + d.Community +
						'<br/><strong>Land Category:</strong> ' + d.Land_Categ +
						'<br/><strong>Nearby Factory:</strong> ' + d.Nearby_fac +
						'<br/><strong>Total Production of Tea Leaf / Year (in kg):</strong> ' + d.Total_prod +
						'<br/><strong>No. of Registered Plots:</strong> ' + d.Number_of +
						'</div>'
					).addTo(myMarkerGroup);

					marker3.openTooltip();
					marker3.closeTooltip();
				});

			});

			/*dropdown for tea factory filter */
			//adding options to selectButton3
			d3.select("#selectButton3")
				.selectAll('myOptions')
				.data(allFact)
				.enter()
				.append('option')
				.text(function (d) { return d; }) // text showed in the menu
				.attr("value", function (d) { return d; }) // corresponding value returned by the button
			//update on dropdown select event
			d3.select("#selectButton3").on("change", function (d) {
				selectedType = this.value
				//console.log(selectedType)
				myFilteredData = data.filter(function (d) { return d.name == selectedType })
				$("#dataCount").html(myFilteredData.length)
				//fly to region of interest
				map.flyTo([myFilteredData[0].latitude_y, myFilteredData[0].longitude_x], 18, {
					animate: true,
					duration: 2 // in seconds
				});

				myFilteredData.forEach(function (d) {
					marker3 = L.marker([d.latitude_y, d.longitude_x], {
						icon: L.icon({
							iconUrl: "assets/factTEA1.png",
							iconSize: [32, 32], // Adjust the size as per your requirement
							iconAnchor: [16, 32], // Adjust the anchor point if needed
						}),
					}).bindTooltip(d.name).bindPopup(
						'<div style="font-size: 13px;">' +
						'<strong>Factory Name:</strong> ' + d.name +
						'</div>'
					).addTo(myMarkerGroup);

					marker3.openTooltip();
					marker3.closeTooltip();
				});

			});

			//map data reset
			$("#resetMap").on("click", function (d) {
				//clear markers within previous marker group
				myMarkerGroup.clearLayers();
				//reset dropdown menu to first item on list
				$("#selectButton")[0].selectedIndex = 0;
				//fly to region of interest
				map.flyTo([26.244156, 92.537842], 7, {
					animate: true,
					duration: 2 // in seconds
				});
				//f^n call
				mapLoadnReset();
			})

		});

		//ESRI Leaflet integration (allows for use of ESRI WMS layers according to TOS)
		// var esriImagery = L.esri.basemapLayer('Imagery').addTo(map),
		var esriLabels = L.esri.basemapLayer('ImageryLabels').addTo(map);

		var basemaps = {
			'Terrain': googleTerrain,
			'Satellite': Esri_WorldImagery
		};

		var overlays = {
			'Labels': esriLabels,
			'Road': wmsLayerRoad,
			'Assam District Boundary': wmsLayer

		};


		// // Instantiate sidebar, open when Disclaimer modal is closed
		// var sidebar = L.control.sidebar('sidebar', {
		// 	position: 'left'
		// }).addTo(map);

		// $('#disclaimer-modal').on('hidden.bs.modal', function () {
		// 	sidebar.show();
		// });

		// Add native looking Leaflet buttons with Font Awesome icons
		// L.easyButton(
		// 	'fa-question-circle',
		// 	function () {
		// 		$('#disclaimer-modal').modal();
		// 		sidebar.hide();
		// 	},
		// 	'Help!',
		// 	map
		// );

		// L.easyButton(
		// 	'fa-list',
		// 	function () { sidebar.toggle(); },
		// 	'Legend Information',
		// 	map
		// );

		L.control.scale().addTo(map);
		L.control.layers(basemaps, overlays).addTo(map);
		// // Measure control
		// var measure = L.control.measure({
		// 	primaryLengthUnit: 'feet',
		// 	secondaryLengthUnit: 'miles',
		// 	primaryAreaUnit: 'acres',
		// 	secondaryAreaUnit: 'square miles'
		// });

		// // Add the modified measurement control to the map
		// measure.addTo(map);

	};


	var calculateLayout = function (e) {
		var map = $('#map'),
			sidebar = $('#sidebar'),
			sideTitle = $('.sidebar-title'),
			sideContent = $('.sidebar-content'),
			win = $(window),
			header = $('header'),
			footer = $('footer');

		map.height(win.height() - header.height() - footer.height());
		sidebar.height(win.height() - header.height() - footer.height() - 50);
		//sideContent.height( win.height() - sideContent.offset().top - 100 );
	};

	var resetLayout = _.debounce(calculateLayout, 250); // Maximum run of once per 1/4 second for performance

	$(document).ready(function () {
		resetLayout();
		createMap();

		//$('#disclaimer-modal').modal(); // open modal on page load

	});

	// Resize the map based on window and sidebar size
	$(window).resize(resetLayout);

});


// Create a new map with a fullscreen button:
// or, add to an existing map:

map.isFullscreen() // Is the map fullscreen?
map.toggleFullscreen() // Either go fullscreen, or cancel the existing fullscreen.

map.addControl(new L.Control.Fullscreen());


