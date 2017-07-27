// MARK: - Constants

// True during testing
var DEBUG = false;

// Class name for test images
var TEST_IMAGE_CLASS_NAME = "testImage";

// Class names for various page contexts
var IMAGE_VIEW_CLASS_NAME = "imageElements";
var MAP_VIEW_CLASS_NAME = "mapElements";
var INFO_VIEW_CLASS_NAME = "infoElements";
var MAP_INSTRUCTION_CLASS_NAME = "mapInstruction";

var MAP_CONTAINER_DIV_ID = "mapContentView";
var MAP_DIV_ID = "map";
var MAP_BUTTON_ID = "mapBackButton";

var SITE_DESCRIPTION_ID = "siteDetailDescription";
var SITE_LIST_ID = "siteInfoListItemFrame";

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

// Google geocoder object
var mapGeocoder;

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
    mapInfoViewUnload();

    var siteListFrame = document.getElementById(SITE_LIST_ID);
    while (siteListFrame.childElementCount !== 0) {
        siteListFrame.removeChild(siteListFrame.lastChild);
    }
    mapViewLoad();
}

// ----------------------------------------------------------------
// mapGetClosestTown - uses Google Maps Javascript API's reverse
//                     geolocation service to determine the name
//                     of the county in which the photos were taken
// @param location - {lat, lng} dictionary containing location
//                   to geolocate
// @return - string name of county
// ----------------------------------------------------------------

function mapGetClosestTown(location) {
    mapGeocoder.geocode({'location': location}, function(results, status) {
        if (status === 'OK') {
            for (var resultIndex = 0; resultIndex < results.length; resultIndex++) {
                var result = results[resultIndex];
                for (var addressComponentIndex = 0; addressComponentIndex < result.address_components.length; addressComponentIndex++) {
                    var addressComponent = result.address_components[addressComponentIndex];
                    if (addressComponent.types.includes("locality")) {
                        var siteDescriptionElement = document.getElementById(SITE_DESCRIPTION_ID);
                        siteDescriptionElement.innerHTML = "<strong>Location:</strong> " + addressComponent.long_name;
                        return;
                    }
                } 
            }
        }
        var siteDescriptionElement = document.getElementById(SITE_DESCRIPTION_ID);
        siteDescriptionElement.innerHTML = "<strong>Location Unknown</strong>";
    });
}

// ----------------------------------------------------------------
// mapInfoViewLoad - reveals map info div (without adding any 
//                   elements to div)
// ----------------------------------------------------------------

function mapInfoViewLoad() {
    var infoViewElements = document.getElementsByClassName(INFO_VIEW_CLASS_NAME);
    for (var infoViewIndex = 0; infoViewIndex < infoViewElements.length; infoViewIndex++) {
       infoViewElements[infoViewIndex].style.display = "block";
    }
}   

// ----------------------------------------------------------------
// mapInfoViewUnload - hides map info div (without removing any 
//                     elements from div)
// ----------------------------------------------------------------

function mapInfoViewUnload() {
    var infoViewElements = document.getElementsByClassName(INFO_VIEW_CLASS_NAME);
    for (var infoViewIndex = 0; infoViewIndex < infoViewElements.length; infoViewIndex++) {
       infoViewElements[infoViewIndex].style.display = "none";
    }
}

// ----------------------------------------------------------------
// mapCreateInfoPage - Creates a new page using information from
//                     the passed in ClusterObjIndex 
// @param clustObjInd - var to grab correct cluster object
// ----------------------------------------------------------------

function mapCreateInfoPage(clustObjInd) {
    mapViewUnload();
    mapInfoViewLoad();

    var tempClustObj = clustObjArray[clustObjInd];
    var closestTown = mapGetClosestTown({lat: tempClustObj.avgLat, lng: tempClustObj.avgLng});

    for(var j = 0; j < tempClustObj.arr.length; j++) {
        var tempSiteObj = tempClustObj.arr[j];
        var tempImg = tempSiteObj.img;

        var siteListItem = document.createElement("div");
        siteListItem.className = "siteInfoListItem";

        var siteListImg = document.createElement("img");
        siteListImg.src = tempImg.src;
        siteListImg.className = "siteInfoListImage";
        var siteListImgClicker = function(img) {mapInfoViewUnload(); detailViewLoad(img);};
        siteListImg.onclick = siteListImgClicker(tempImg);
        siteListItem.appendChild(siteListImg);

        var siteListDescription = document.createElement("div");
        siteListDescription.className = "siteInfoListDescription";
        var descTxt = "<strong>Latitude:</strong> " + tempSiteObj.lat + 
            "<br><strong>Longitude:</strong> " + tempSiteObj.lng;
        siteListDescription.innerHTML = descTxt;
        siteListItem.appendChild(siteListDescription);

        document.getElementById(SITE_LIST_ID).appendChild(siteListItem);
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
    mapInstructionLoad();
    mapResizeDiv();
    window.onresize = mapResizeDiv;
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
// mapInit - initializes geocoder and triggers image metadata 
//           loads, which then call map load function
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
    mapGeocoder = new google.maps.Geocoder;
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
        if (lat != null && lng != null && (lat.constructor === Array && lat.length == 3) && typeof latRef === "string" &&
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
                clustObjArray.push(newclustObj);
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
                    clustObjArray.push(newclustObj);
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
    map = new google.maps.Map(document.getElementById(MAP_DIV_ID), {zoom: 8, center: mapCenter});
	for (var i = 0; i < clustObjArray.length; i++) {
        img = clustObjArray[i].arr[0].img;
        contentString = "<img class='mapDetailViewImage' width='80' src =" + img.src + "><br>"; // NEW      
        if (clustObjArray[i].arr.length > 1) {
            contentString += "<p class='mapDetailViewDescription'>and " + (clustObjArray[i].arr.length - 1) + " more.</p><br>";
        }
        contentString += "<button class='mapDetailViewButton' type='button' onclick='mapCreateInfoPage(" + i +  ")'>View in Detail</button>"; 

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
    var mapContainerDiv = document.getElementById(MAP_CONTAINER_DIV_ID);
    var mapDiv = document.getElementById(MAP_DIV_ID);
    var mapBackButton = document.getElementById(MAP_BUTTON_ID);
    var mapInstructionDiv = document.getElementsByClassName(MAP_INSTRUCTION_CLASS_NAME)[0];
    mapContainerDiv.style.height = (window.innerHeight - mapInstructionDiv.clientHeight - 42) + "px";
    mapDiv.style.height = (window.innerHeight - mapInstructionDiv.clientHeight - mapBackButton.offsetHeight - 66) + "px";
    if (map != null) {
        google.maps.event.trigger(map, "resize");
    }
}

// MARK: - Script
if (DEBUG) {
    mapLoadTestImages();
}
