// MARK: - Constants

// Image view element class name
var IMAGE_VIEW_CLASS_NAME = "imageElements";
var IMAGE_UPLOAD_INPUT_ID = "imageUploadInput";

var IMAGE_LIST_ID = "imageUploadInfoListItemFrame";
var IMAGE_CONTENT_VIEW_ID = "imageContentView";

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
// imageUploadInstructionLoad - replaces the instructions with 
//                              instructions to upload images
// ----------------------------------------------------------------

function imageUploadInstructionLoad() {
    var mapInstructElements = document.getElementsByClassName("mapInstruction");
    for (var imageViewIndex = 0; imageViewIndex < mapInstructElements.length; imageViewIndex++) {
        mapInstructElements[imageViewIndex].style.display = "none";
    }
    var uploadInstructElements = document.getElementsByClassName("imageUploadInstruction");
    for (var imageViewIndex = 0; imageViewIndex < uploadInstructElements.length; imageViewIndex++) {
      uploadInstructElements[imageViewIndex].style.display = "block";
    }
}

// ----------------------------------------------------------------
// mapInstructionLoad - replaces the instructions with instructions
//                      for the map
// ----------------------------------------------------------------

function mapInstructionLoad() {
    var mapInstructElements = document.getElementsByClassName("mapInstruction");
    for (var imageViewIndex = 0; imageViewIndex < mapInstructElements.length; imageViewIndex++) {
        mapInstructElements[imageViewIndex].style.display = "block";
    }
    var uploadInstructElements = document.getElementsByClassName("imageUploadInstruction");
    for (var imageViewIndex = 0; imageViewIndex < uploadInstructElements.length; imageViewIndex++) {
      uploadInstructElements[imageViewIndex].style.display = "none";
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
    imageUploadInstructionLoad();

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
// @param fileName - the filename associated with this list entry
// @param fileSize - the size of said file
// @return - a function to assign to the FileReader's onload
// ----------------------------------------------------------------

function imageCreateListItem(fileName, fileSize) {
    return function(fileLoadedEvent) {
        if (fileName == null || !imageFilenameArray.indexOf(fileName) > -1) {
            var imageLoadedObject = new Image();
            imageLoadedObject.src = fileLoadedEvent.target.result;
            imageArray.push(imageLoadedObject);

            var imageListItem = document.createElement("div");
            imageListItem.className = "imageUploadInfoListItem";
            
            var imageListImg = document.createElement("img");
            imageListImg.src = fileLoadedEvent.target.result;
            imageListImg.className = "imageUploadInfoListImage";
            imageListItem.appendChild(imageListImg);

            var imageListDescription = document.createElement("div");
            imageListDescription.className = "imageUploadInfoListDescription";
            var descTxt = "<strong>Image</strong><br>";
            if (fileName != null) {
                descTxt = "<strong>" + fileName + "</strong><br>";
                imageFilenameArray.push(fileName);
            } 
            if (fileSize != null) {
                descTxt += "size: " + fileSize + " bytes";
            }
            imageListDescription.innerHTML = descTxt;
            imageListItem.appendChild(imageListDescription);

            var imageListDelete = document.createElement("img");
            imageListDelete.src = "img/ImageDeleteIcon.png";
            imageListDelete.onclick = imageDeleteListItem(imageListItem, imageLoadedObject, fileName);
            imageListDelete.className = "imageUploadInfoListDeleteButton";
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
// @param imageFilename - Filename to delete from other array
// @return - function to assign to delete icon's onclick
// ----------------------------------------------------------------

function imageDeleteListItem(imageItem, imageObject, imageFilename) {
    return function() {
        imageItem.parentNode.removeChild(imageItem);
        var imageObjectIndex = imageArray.findIndex(function(otherObject) { return imageObject == otherObject; });
        imageArray.splice(imageObjectIndex, 1);
        if (imageFilename != null) {
            var imageFilenameIndex = imageFilenameArray.findIndex(function(otherFilename) { return imageFilename == otherFilename; });
            imageFilenameArray.splice(imageFilenameIndex, 1);
        }

        // Creates new file upload input so user can reupload same image set
        var imageUploadElement = document.getElementById(IMAGE_UPLOAD_INPUT_ID);
        imageUploadElement.parentNode.replaceChild(imageUploadElement.cloneNode(), imageUploadElement);
    }
}

// ----------------------------------------------------------------
// imageUpload - called on document load (I think?), handles user-
//               supplied photos (does not transfer them back to
//               server - that doesn't happen)
// ----------------------------------------------------------------

function imageUpload() {
    console.log("imageUpload input state changed.");
    var x = document.getElementById(IMAGE_UPLOAD_INPUT_ID);
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
                    var fileName = null;
                    if ('name' in file) {
                        fileName = file.name;
                    }
                    var fileSize = null;
                    if ('size' in file) {
                        fileSize = file.size;
                    }
                    fileReader.onload = imageCreateListItem(fileName, fileSize);
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

/*
// ----------------------------------------------------------------
// imageResizeDiv - resizes grey enclosing div for image list to
//                  size of screen (this is necessary so the inner
//                  div can scroll
// ----------------------------------------------------------------

function imageResizeDiv() {
    var imageDiv = document.getElementById(IMAGE_CONTENT_VIEW_ID);
    imageDiv.style.maxHeight = (window.innerHeight - 32) + "px";
    console.log(window.innerHeight - 32);
}
*/
