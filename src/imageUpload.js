// Image upload completion flag
var imageUploadCompleteFlag = false;

var imgArray = new Array();

// ----------------------------------------------------------------
// imageUploadComplete - button trigger function, signals user
//                       has finished uploading photos; if at least
//                       one photo has been uploaded and map has
//                       loaded, calls mapInit
// ----------------------------------------------------------------

function imageUploadComplete() {
    if (!imageUploadCompleteFlag && imgArray.length > 0) {
        imageUploadCompleteFlag = true;
    }
    if (imageUploadCompleteFlag && mapLoadCompleteFlag) {

        mapInit();
    }
}

function imageUpload(){
    var x = document.getElementById("myFile");
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
                    fileReader.onload = function(fileLoadedEvent) {
                        var imageLoaded = document.createElement("img");
                        imageLoaded.src = fileLoadedEvent.target.result;
                        imageLoaded.className = "uploadedImage";
                        var imageLoadedObject = new Image();
                        imageLoadedObject.src = fileLoadedEvent.target.result;
                        imgArray.push(imageLoadedObject);
                        document.body.appendChild(imageLoaded);
                    };
                    fileReader.readAsDataURL(file);
                }
                
                txt += "<br><strong>" + (i+1) + ". file</strong><br>";
                if ('name' in file) {
                    txt += "name: " + file.name + "<br>";
                }
                if ('size' in file) {
                    txt += "size: " + file.size + " bytes <br>";
                }
            }
            for (var i = 0; i < x.files.length; i++) {
                fileReader.readAsDataURL(imgArray[i]);
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
    document.getElementById("uploadedImageInfo").innerHTML = txt;
}
