// MARK: - Constants

// True during testing
var DEBUG = false;

// Class name for test images
var TEST_IMAGE_CLASS_NAME = "testImage";

// Class names for various page contexts
var IMAGE_VIEW_CLASS_NAME = "imageElements";
var MAP_VIEW_CLASS_NAME = "mapElements";

var MAP_DIV_ID = "map";
var MAP_BUTTON_ID = "mapButton";

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
var mapMarkerLocations;

// Google Map load completion flag
var mapLoadCompleteFlag = false;

// array of imgs
var mapMarkImage; // NEW

// Definition of cluster object class
class imageObj {  // NEWER
    constructor(lat, lng, img) {
        this.lat = lat;
        this.lng = lng;
        this.img = img;
    }
}

// Declaration of cluster object array class
class clustObj { // NEWER
    constructor(imgobj) {
        this.arr = [];
        this.arr.push(imgobj);
        this.avgLng = imgobj.lng;
        this.avgLat = imgobj.lat;
        this.sizeElem = 1.0;
    }
    add(imgobj) {
        this.avgLng = (this.avgLng * this.sizeElem) + imgobj.lng;
        this.avgLat = (this.avgLat * this.sizeElem) + imgobj.lat;
        this.sizeElem++;
        this.avgLng = this.avgLng/this.sizeElem;
        this.avgLat = this.avgLat/this.sizeElem;
        this.arr.push(imgobj);
    }
}

// Array of cluserObjs
var clustObjArray; // NEWER

// Flag to add new clusterObj
var clustFlag; // NEWER

// MARK: - Functions
// Functions all prefixed with "map" to avoid namespace collisions

// ----------------------------------------------------------------
// mapReset - redisplays the map and clears the screen
// ----------------------------------------------------------------

function mapReset() {
    var y = document.getElementById('info'); 
    if (y.style.display === 'block') {
        y.style.display = 'none';
    }
    while (y.childElementCount !== 1) {
        y.removeChild(y.lastChild);
    }
    mapViewLoad();
}

// ----------------------------------------------------------------
// mapCreateInfoPage - Creates a new page using information from
//                     the passed in ClusterObjIndex 
// @param clustObjInd - var to grab correct cluster object
// ----------------------------------------------------------------

function mapCreateInfoPage(clustObjInd) {
    mapViewUnload();
    var y = document.getElementById('info');
    y.style.display = 'block';

    for(var j = 0; j < clustObjArray[clustObjInd].arr.length; j++) {
        var tempImg = clustObjArray[clustObjInd].arr[j].img;
        var elem = document.createElement("img");
        elem.src =  tempImg.src;
        document.getElementById("info").appendChild(elem); 
    }
}

// ----------------------------------------------------------------
// mapLoadTestImages - only invoked when debugging, populates
//      		       image array with test images
// ----------------------------------------------------------------

function mapLoadTestImages() {
    mapImgElements = document.getElementsByClassName(TEST_IMAGE_CLASS_NAME);
}

// ----------------------------------------------------------------
// mapLoadComplete - Google Maps Javascript API callback function,
//                   sets mapLoadComplete flag, initializes map if
//                   file upload is also complete
// ----------------------------------------------------------------

function mapLoadComplete() {
    mapLoadCompleteFlag = true;
    if (DEBUG || imageUploadCompleteFlag) {
        imageViewUnload();
        mapViewLoad();
        mapInit();
    }
}

// ----------------------------------------------------------------
// mapViewLoad - reveals map div
// ----------------------------------------------------------------

function mapViewLoad() {
   var mapViewElements = document.getElementsByClassName(MAP_VIEW_CLASS_NAME);
   for (var mapViewIndex = 0; mapViewIndex < mapViewElements.length; mapViewIndex++) {
       mapViewElements[mapViewIndex].style.display = "block";
   }
}

// ----------------------------------------------------------------
// mapViewUnload - hides map div
// ----------------------------------------------------------------
function mapViewUnload() {
   var mapViewElements = document.getElementsByClassName(MAP_VIEW_CLASS_NAME);
   for (var mapViewIndex = 0; mapViewIndex < mapViewElements.length; mapViewIndex++) {
       mapViewElements[mapViewIndex].style.display = "none";
   }
}

// ----------------------------------------------------------------
// mapInit - triggers image metadata loads, which then call
//            map load function
// ----------------------------------------------------------------

function mapInit() {
    // Register individual image onload functions
    // or execute them if the images are already there
    // I'm pretty sure this safeguard isn't necessary once I'm pulling the images from the user,
    // but it doesn't hurt to make sure
    if (!DEBUG) {
        mapImgElements = imageArray;
    }
    map = null;
    mapCenter = {lat: 0.0, lng: 0.0};
    mapMarkers = [];
    mapMarkerLocations = [];
    mapMarkImage = []; // NEW
    clustObjArray = []; // NEWER
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
        clustFlag = false; // NEWER
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
			mapMarkImage.push(this); // NEW
            var newImgObj = new imageObj(photoLocation.lat, photoLocation.lng, this); 
            if (clustObjArray.length === 0) { 
                var newclustObj = new clustObj(newImgObj); 
                clustObjArray.push(newclustObj) 
            }
            else { 
                for(var i = 0; i < clustObjArray.length; i++) { 
                    if ( Math.abs(clustObjArray[i].avgLat - newImgObj.lat) <.1 && Math.abs(clustObjArray[i].avgLng - newImgObj.lng) < .1) { 
                        clustObjArray[i].add(newImgObj); 
                        clustFlag = true; 
                        break;
                    }
                }
                if (!clustFlag) {
                    var newclustObj = new clustObj(newImgObj); 
                    clustObjArray.push(newclustObj) 
                }
            }
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
    var img;
    var marker;
    mapResizeDiv();
    map = new google.maps.Map(document.getElementById(MAP_DIV_ID), {zoom: 8, center: mapCenter});
    window.onresize = mapResizeDiv;
	for (var i = 0; i < clustObjArray.length; i++) {
        var contentString = ""; 
        for(var j = 0; j < clustObjArray[i].arr.length; j++) {
            img = clustObjArray[i].arr[j].img;
            contentString += "<img width='80' src =" + img.src + ">"; // NEW      
        }
        contentString += "<button type='button' onclick='mapCreateInfoPage(" + i +  ")'>Click Me</button>"; 
        console.log("length of cluster" + i);
        console.log(clustObjArray[i].arr.length);

        var avgLocation = {lat: clustObjArray[i].avgLat, lng: clustObjArray[i].avgLng};
        marker = new google.maps.Marker({
            position: avgLocation,
            map: map,
            contentString: contentString}
        );
        var infowindow = new google.maps.InfoWindow({});
        marker.addListener('click', function() {
            infowindow.setContent(this.contentString);
            infowindow.open(map, this);
            map.setCenter(this.getPosition()); 
        });
        mapMarkers.push(marker);      
    }
    console.log("length of clust object array");
    console.log(clustObjArray.length);
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
    var mapBackButton = document.getElementById(MAP_BUTTON_ID);
    mapDiv.style.height = (window.innerHeight - mapBackButton.offsetHeight - 25) + "px";
    if (map != null) {
        google.maps.event.trigger(map, "resize");
    }
}

// MARK: - Script
if (DEBUG) {
    mapLoadTestImages();
}
