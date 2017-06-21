// MARK: - Constants

// Image view element class name
var IMAGE_VIEW_CLASS_NAME = "imageElements";

var IMAGE_LIST_ID = "imageInfoListView";
var IMAGE_CONTENT_ID = "imageContentView";

// MARK: - Global Variables
// variables prefixed with "image" to avoid namespace collisions

// Image upload completion flag
var imageUploadCompleteFlag = false;

// Array to hold Javascript image objects
var imageArray = [];

// Array of filenames, to prevent duplicate importation
var imageFilenameArray = [];

// MARK: - Functions
// Functions prefixed with "image" to avoid namespace collisions

// ----------------------------------------------------------------
// imageUploadComplete - button trigger function, signals user
//                       has finished uploading photos; if at least
//                       one photo has been uploaded and map has
//                       loaded, calls imageViewUnload, mapViewLoad
//                       and mapInit
// ----------------------------------------------------------------

function imageUploadComplete() {
    if (!imageUploadCompleteFlag && imageArray.length > 0) {
        imageUploadCompleteFlag = true;
    }
    if (imageUploadCompleteFlag && mapLoadCompleteFlag) {
        imageViewUnload();
        mapViewLoad();
        mapInit();
    }
}

// ----------------------------------------------------------------
// imageViewLoad - reveals elements for image upload and resets 
//                 image upload status
// ----------------------------------------------------------------

function imageViewLoad() {
    var imageViewElements = document.getElementsByClassName(IMAGE_VIEW_CLASS_NAME);
    for (var imageViewIndex = 0; imageViewIndex < imageViewElements.length; imageViewIndex++) {
       imageViewElements[imageViewIndex].style.display = "block";
    }
    imageUploadCompleteFlag = false;
    imageResizeDiv();
    window.onresize = imageResizeDiv;
}

// ----------------------------------------------------------------
// imageViewUnload - hides elements for image upload
// ----------------------------------------------------------------

function imageViewUnload() {
   var imageViewElements = document.getElementsByClassName(IMAGE_VIEW_CLASS_NAME);
   for (var imageViewIndex = 0; imageViewIndex < imageViewElements.length; imageViewIndex++) {
       imageViewElements[imageViewIndex].style.display = "none";
   }
}

// ----------------------------------------------------------------
// imageCreateListItem - returns file load callback function that
//                       creates list entry including both photo
//                       and file info
// @param file - the file associated with this list entry
// @return - a function to assign to the FileReader's onload
// ----------------------------------------------------------------

function imageCreateListItem(file) {
    return function(fileLoadedEvent) {
        if (!('name' in file) || !imageFilenameArray.includes(file.name)) {
            var imageLoadedObject = new Image();
            imageLoadedObject.src = fileLoadedEvent.target.result;
            imageArray.push(imageLoadedObject);

            var imageListItem = document.createElement("div");
            imageListItem.className = "imageInfoListItem";
            
            var imageListImg = document.createElement("img");
            imageListImg.src = fileLoadedEvent.target.result;
            imageListImg.className = "imageInfoListImage";
            imageListItem.appendChild(imageListImg);

            var imageListDescription = document.createElement("div");
            imageListDescription.className = "imageInfoListDescription";
            var descTxt = "<strong>Image</strong><br>";
            if ('name' in file) {
                descTxt = "<strong>" + file.name + "</strong><br>";
                imageFilenameArray.push(file.name);
            }
            if ('size' in file) {
                descTxt += "size: " + file.size + " bytes";
            }
            imageListDescription.innerHTML = descTxt;
            imageListItem.appendChild(imageListDescription);

            var imageListDelete = document.createElement("img");
            imageListDelete.src = "img/ImageDeleteIcon.png";
            imageListDelete.onclick = imageDeleteListItem(imageListItem, imageLoadedObject, file);
            imageListDelete.className = "imageInfoListDeleteButton";
            imageListItem.appendChild(imageListDelete);

            document.getElementById(IMAGE_LIST_ID).appendChild(imageListItem);
        }
    };
}

// ----------------------------------------------------------------
// imageDeleteListItem - delete icon onclick function generator
// @param imageItem - HTML DOM image list item to delete when
//                    button is pressed
// @param imageObject - Javascript image object to delete from
//                      array (again, when the button is pressed)
// @param imageFile - File object containing image filename
//                    to delete from other array
// @return - function to assign to delete icon's onclick
// ----------------------------------------------------------------

function imageDeleteListItem(imageItem, imageObject, imageFile) {
    return function() {
        imageItem.parentNode.removeChild(imageItem);
        var imageObjectIndex = imageArray.findIndex(function(otherObject) { return imageObject == otherObject; });
        imageArray.splice(imageObjectIndex, 1);
        if ('name' in imageFile) {
            var imageFilenameIndex = imageFilenameArray.findIndex(function(otherFilename) { return imageFile.name == otherFilename; });
            imageFilenameArray.splice(imageFilenameIndex, 1);
        }
    }
}

// ----------------------------------------------------------------
// imageUpload - called on document load (I think?), handles user-
//               supplied photos (does not transfer them back to
//               server - that doesn't happen)
// ----------------------------------------------------------------

function imageUpload() {
    console.log("imageUpload input state changed.");
    var x = document.getElementById("fileUpload");
    var txt = "";
    var longDecimal = 0;
    var latDecimal = 0;
    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select one or more files.";
        } else {
            for (var i = 0; i < x.files.length; i++) {
                var file = x.files[i];
                if (file.type.match("image.*")) {
                    var fileReader = new FileReader();
                    fileReader.onload = imageCreateListItem(file);
                    fileReader.readAsDataURL(file);
                }
                
            }
        }
    } else {
        if (x.value == "") {
            txt += "Select one or more files.";
        } else {
            txt += "The files property is not supported by your browser!";
            txt  += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
        }
    }
    if (txt != "") {
        var responseElement = document.getElementById("imageUploadInfo");
        responseElement.display = "block";
        responseElement.innerHTML = txt;
    }
}

// ----------------------------------------------------------------
// imageResizeDiv - resizes grey enclosing div for image list to
//                  size of screen (this is necessary so the inner
//                  div can scroll
// ----------------------------------------------------------------

function imageResizeDiv() {
    var imageDiv = document.getElementById(IMAGE_CONTENT_VIEW_ID);
    mapDiv.style.height = (window.innerHeight - 16) + "px";
}
