// MARK: - Constants

// True during testing
var DEBUG = true;

// Class name for test images
var TEST_IMAGE_CLASS_NAME = "testImage";

var MAP_DIV_ID = "map";

// Google API keys (actually, probably not needed)
var GOOGLE_MAPS_EMBED_API_KEY = "AIzaSyCkqZcICe7cCgvAI7bO7pFzNBOvBsvL1hU";
var GOOGLE_MAPS_JAVASCRIPT_API_KEY = "AIzaSyC0twG_7pvxb2WQKywvPnDGhCbZCbAUOmU";

// MARK: - Global Variables

// Placeholder array for test metadata images
var mapImgElements;

// Counter for number of images examined
// once it equals the size of the img array, execution continues
// May not equal size of mapMarkerLocations, if some images
// don't have location metadata
var mapImageProcessCounter;

// Google map object
var map;

// Center {lat, lng} object
var mapCenter;

// Google marker array
var mapMarkers;

// {lat, lng} marker location object array
var mapMarkerLocations

// MARK: - Functions
// Functions all prefixed with "map" to avoid namespace collisions

// ----------------------------------------------------------------
// mapLoadTestImages - only invoked when debugging, populates
//      		       image array with test images
// ----------------------------------------------------------------

function mapLoadTestImages() {
    mapImgElements = document.getElementsByClassName(TEST_IMAGE_CLASS_NAME);
}

// ----------------------------------------------------------------
// initMap - Google Maps Javascript API callback function,
//                 triggers image metadata loads, which then call
//                 map load function
// ----------------------------------------------------------------

function initMap() {
    // Register individual image onload functions
    // or execute them if the images are already there
    // I'm pretty sure this safeguard isn't necessary once I'm pulling the images from the user,
    // but it doesn't hurt to make sure
    map = null;
    mapCenter = {lat: 0.0, lng: 0.0};
    mapMarkers = [];
    mapMarkerLocations = [];
    mapImageProcessCounter = 0;
    for (var imageIndex = 0; imageIndex < mapImgElements.length; imageIndex++) {
        if (mapImgElements[imageIndex].complete) {
            mapReadImageMetadata(mapImgElements[imageIndex]);
        } else {
            mapImgElements[imageIndex].onload = function () {
                mapReadImageMetadata(this);
            }
        }
    }
}


// ----------------------------------------------------------------
// mapReadImageMetadata - img onload callback, populates location
//                        array with image metadata and updates
//                        average
// @param imageElement - img HTML element to read metadata from
// ----------------------------------------------------------------

function mapReadImageMetadata(image) {
    if (!EXIF.getData(image, function () {
        var lat = EXIF.getTag(this, "GPSLatitude");
        var latRef = EXIF.getTag(this, "GPSLatitudeRef");
        var lng = EXIF.getTag(this, "GPSLongitude");
        var lngRef = EXIF.getTag(this, "GPSLongitudeRef");
        // Image metadata has all requested tags in expected format
        if ((lat.constructor === Array && lat.length == 3) && typeof latRef === "string" &&
            (lng.constructor === Array && lng.length == 3) && typeof lngRef === "string") {
            var photoLocation = {lat: mapConvertDMS(lat, latRef), lng: mapConvertDMS(lng, lngRef)};
            var n = mapMarkers.length;
            mapCenter.lat = (mapCenter.lat * n + photoLocation.lat) / (n + 1.0);
            mapCenter.lng = (mapCenter.lng * n + photoLocation.lng) / (n + 1.0);
            mapMarkerLocations.push(photoLocation);
        }
        mapImageProcessCounter++;
        if (mapImageProcessCounter == mapImgElements.length) {
            mapPopulate();
        }
    })) {
        mapImageProcessCounter++;
        // All images have been processed
        if (mapImageProcessCounter == mapImgElements.length) {
            mapPopulate();
        }
    }
}

// ----------------------------------------------------------------
// mapPopulate - called once all metadata has been parsed, creates
//               map instance and all markerss
// ----------------------------------------------------------------

function mapPopulate() {
    mapResizeDiv();
    map = new google.maps.Map(document.getElementById(MAP_DIV_ID), {zoom: 8, center: mapCenter});
    window.onresize = mapResizeDiv;
    for (var markerIndex = 0; markerIndex < mapMarkerLocations.length; markerIndex++) {
//  var tempImage = mapMarkerLocations[markerIndex].img; 
//  '<img src = ' + tempImage.src + '>' + '</img>'
        var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
            '<div id="bodyContent">'+
            '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
            'sandstone rock formation in the southern part of the '+
            'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
            'south west of the nearest large town, Alice Springs; 450&#160;km '+
            '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
            'features of the Uluru - Kata Tjuta National Park. Uluru is '+
            'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
            'Aboriginal people of the area. It has many springs, waterholes, '+
            'rock caves and ancient paintings. Uluru is listed as a World '+
            'Heritage Site.</p>'+
            '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
            'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
            '(last visited June 22, 2009).</p>'+
            '</div>'+
            '</div>';
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        var markerObject = new google.maps.Marker({
            position: mapMarkerLocations[markerIndex], 
            map: map
        });
//        mapMarkers.push(markerObject);
        markerObject.addListener('click', function() {
            infowindow.open(map, marker);
        });
    }
}

// ----------------------------------------------------------------
// mapConvertDMS - converts degree-minute-second GPS coordinates
//                 to decimal format
// @param dms - [degrees, minutes, seconds] Number array
// @param ref - bearing: "N", "S", "E", or "W"
// ----------------------------------------------------------------

function mapConvertDMS(dms, ref) {
    var decGPS = dms[0].valueOf() + dms[1].valueOf() / 60 + dms[2].valueOf() / 3600;
    if (ref == "S" || ref == "W") {
        decGPS *= -1;
    }
    return decGPS;
}

// ----------------------------------------------------------------
// mapResizeDiv - resizes map div to fit full screen (minus 8px
//                margins), triggered whenever browser window is
//                resized
// ----------------------------------------------------------------

function mapResizeDiv() {
    var mapDiv = document.getElementById(MAP_DIV_ID);
    mapDiv.style.height = (window.innerHeight - 16) + "px";
    if (map != null) {
        google.maps.event.trigger(map, "resize");
    }
}

// MARK: - Script
if (DEBUG) {
    mapLoadTestImages();
}
