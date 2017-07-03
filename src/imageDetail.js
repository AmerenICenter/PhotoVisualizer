// MARK: - Constants
var DETAIL_VIEW_CLASS_NAME = "detailElements";
var DETAIL_VIEW_ID = "detailContentView";
var DETAIL_VIEW_IMAGE_ID = "detailViewImage";
var DETAIL_BUTTON_ID = "detailExitButton";

var detailAspectRatio;

// MARK: - Functions
// All functions prefixed with "detail" to prevent namespace collisions

// ----------------------------------------------------------------
// detailViewLoad - reveals image detail view div and adds
//                  requested image
// @param image - the image to display
// ----------------------------------------------------------------

function detailViewLoad(image) {
    var detailViewElements = document.getElementsByClassName(DETAIL_VIEW_CLASS_NAME);
    for (var detailViewIndex = 0; detailViewIndex < detailViewElements.length; detailViewIndex++) {
       detailViewElements[detailViewIndex].style.display = "block";
    }

    var detailViewImage = document.createElement("img");
    detailViewImage.src = image.src;
    detailViewImage.id = DETAIL_VIEW_IMAGE_ID;
    document.getElementById(DETAIL_VIEW_ID).appendChild(detailViewImage);
    detailAspectRatio = detailViewImage.style.width / detailViewImage.style.height;

    detailResizeDiv();
    window.onresize = detailResizeDiv;
}

// ----------------------------------------------------------------
// detailViewUnload - removes image and hides image detail view div
// ----------------------------------------------------------------

function detailViewUnload() {
    var detailViewImage = document.getElementById(DETAIL_VIEW_IMAGE_ID);
    detailViewImage.parentNode.removeChild(detailViewImage);
    
    var detailViewElements = document.getElementsByClassName(DETAIL_VIEW_CLASS_NAME);
    for (var detailViewIndex = 0; detailViewIndex < detailViewElements.length; detailViewIndex++) {
        detailViewElements[detailViewIndex].style.display = "none";
    }
}

// ----------------------------------------------------------------
// detailResizeDiv - resizes image frame on window resize
// ----------------------------------------------------------------

function detailResizeDiv() {
    var detailViewDiv = document.getElementById(DETAIL_VIEW_ID);
    var detailViewImage = document.getElementById(DETAIL_VIEW_IMAGE_ID);
    var detailExitButton = document.getElementById(DETAIL_BUTTON_ID)
    var imageWidth = (window.innerWidth * 0.9 - 34);
    detailViewImage.style.width = imageWidth + "px";
    detailViewImage.style.height = (imageWidth / detailAspectRatio) + "px";
}
