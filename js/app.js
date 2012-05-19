;(function(){
    // so it begins
    var App = {

        // let them come
        init: function() {
            // listen for click events on the button
            $('#refresh').tap(App.index)
            $('#snap').tap(App.snap)
            $('#fileselect').on('change', App.formPost)

            // load the home screen mosaic
            App.index()
        }
        ,
        // draw index
        index: function() {
            $('#refresh').addClass('loading')
            $.getJSON('http://deep-flower-8321.herokuapp.com/api/v1/img/', function(thumbs){
                $('#pics').html('')
                thumbs.forEach(function(thumb){
                    $('#pics').append('<img class=pic src=' + thumb.src + '>')
                })
                $('#refresh').removeClass('loading')
                $('img.pic').tap(function(e) {
                    alert(e.target.src)
                })
            })
        }
        ,
        formPost: function(e) {
            //  display an image
            var reader = new FileReader()
            ,   file = e.target.files[0]
            ,   xhr = new XMLHttpRequest();
            reader.onload = function(e) {

                /* create progress bar
                var o = $id("progress");
                var progress = o.appendChild(document.createElement("p"));
                progress.appendChild(document.createTextNode("upload " + file.name));
                // progress bar
                xhr.upload.addEventListener("progress", function(e) {
                    var pc = parseInt(100 - (e.loaded / e.total * 100));
                    progress.style.backgroundPosition = pc + "% 0";
                }, false);
              */ 
                 // file received/failed
                 xhr.onreadystatechange = function(e) {
                     //if (xhr.readyState == 4) progress.className = (xhr.status == 200 ? "success" : "failure");
                     App.index()
                 }
                 xhr.open('POST', '//incog.io', true)
                 //xhr.setRequestHeader('X_FILENAME', file.name)
                 //xhr.setRequestHeader('Content-Type', file.type)
                console.log(file)
                 xhr.setRequestHeader("Content-Type", "multipart/form-data");
                 xhr.setRequestHeader("X-File-Name", file.name);
                 xhr.setRequestHeader("X-File-Size", file.size);
                 xhr.setRequestHeader("X-File-Type", file.type)
                 xhr.send(file)
            }
            reader.readAsDataURL(file)
        }
        ,
        // upload to the service
        upload: function(imageURI) {
            var win  = function(r) { alert('Image uploaded successfully!') }
            ,   fail = function(err) { alert("Ruh roh. Image failed to upload! Errorcode: " = err.code) }
            ,   opts = new FileUploadOptions()
            ,   ft   = new FileTransfer()
            
            opts.fileKey  = 'file'
            opts.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1)
            opts.mimeType = 'image/jpeg'
            opts.params   = {}

            ft.upload(imageURI, 'http://deep-flower-8321.herokuapp.com', win, fail, opts);
        },

        // launch the camera app
        snap: function() {
            if (!window.Cordova) {
                $('#pics').animate({top:'120px'}, 2, 'ease-out')
            }
            else {
                var fail = function(err) { alert('Uh oh! Failed to snap a pic!') }
                ,   opts = { targetWidth: 300
                           , targetHeight: 300
                           , destinationType: Camera.DestinationType.FILE_URI 
                           }
                navigator.camera.getPicture(App.upload, fail, opts)
            }
        }
    }

    // lets go!
    $(document).on('deviceready', App.init)
})()

