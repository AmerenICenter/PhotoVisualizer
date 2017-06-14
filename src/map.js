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
    console.log(mapImgElements.length);
}

// ----------------------------------------------------------------
// initMap - Google Maps Javascript API callback function,
//                 triggers image metadata loads, which then call
//                 map load function
// ----------------------------------------------------------------

function initMap() {
    console.log("Map callback invoked.");
    // Register individual image onload functions
    // or execute them if the images are already there
    // I'm pretty sure this safeguard isn't necessary once I'm pulling the images from the user,
    // but it doesn't hurt to make sure
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
    console.log("Image metadata invoked.");
    EXIF.getData(image, function () {
        var lat = EXIF.getTag(this, "GPSLatitude");
        var latRef = EXIF.getTag(this, "GPSLatitudeRef");
        var lng = EXIF.getTag(this, "GPSLongitude");
        var lngRef = EXIF.getTag(this, "GPSLongitudeRef");
        // Image metadata has all requested tags in expected format
        if ((lat.constructor === Array && lat.length == 3) && typeof latRef === "string" &&
            (lng.constructor === Array && lng.length == 3) && typeof lngRef === "string") {
            var photoLocation = {lat: mapConvertDMS(lat, latRef), lng: mapConvertDMS(lng, lngRef)};
            var n = mapMarkers.length;
            mapCenter.lat = (mapCenter.lat * n + photoLocation.lat) / (n + 1);
            mapCenter.lng = (mapCenter.lng * n + photoLocation.lng) / (n + 1);
            mapMarkers.push(photoLocation);
        }
    });
    mapImageProcessCounter++;
    // All images have been processed
    if (mapImageProcessCounter == mapImgElements.length) {
        mapPopulate();
    }
}

// ----------------------------------------------------------------
// mapPopulate - called once all metadata has been parsed, creates
//               map instance and all markers
// ----------------------------------------------------------------

function mapPopulate() {
    map = new google.maps.Map(document.getElementById(MAP_DIV_ID), {zoom: 8, center: mapCenter});
    for (var markerIndex = 0; markerIndex < mapMarkers.length; markerIndex++) {
        mapMarkers.push(new google.maps.Marker({position: mapMarkers[markerIndex], map: map}));
    }
}

// ----------------------------------------------------------------
// mapConvertDMS - converts degree-minute-second GPS coordinates
//                 to decimal format
// @param dms - [degrees, minutes, seconds] Number array
// @param ref - bearing: "N", "S", "E", or "W"
// ----------------------------------------------------------------

function mapConvertDMS(dms, ref) {
    val decGPS = dms[0].valueOf() + dms[1].valueOf() / 60 + dms[2].valueOf() / 3600;
    if (ref == "S" || ref == "W") {
        decGPS *= -1;
    }
    console.log(decGPS);
    return decGPS;
}

// MARK: - Script
if (DEBUG) {
    console.log("yes hello");
    mapLoadTestImages();
}
