;(function(){

    // so it begins
    var App = {

        // some helper vars
        baseurl: function() { 
            var url = App.mode() === 'dev' ? 'http://localhost:3000' : 'http://incog.io'
            return url
        }
        ,
        mode: function() { 
            var mode = window.location.protocol === 'file:' ? 'dev' : 'prod'
            return mode
        }
        ,
        context: function() {
            // desktop, ios web, android web, cordova
            return ctx
        }
        ,
        // let them come
        init: function() {
            
            // listen for click events on the button
            $('#refresh').tap(App.index)
            $('#snap').tap(App.snap)

            if (navigator.userAgent.toLowerCase().search(/iphone|ipod|ipad/)) {
                 $('#fileselect').hide()   
            } 
            else {
                $('#fileselect').on('change', App.formPost)
            }

            // load the home screen mosaic
            App.index()
        }
        ,
        // draw index
        index: function() {
            // load local or remote
            var url = App.baseurl() + '/api/v1/img/'
            // made the refresh button rotate
            $('#refresh').addClass('loading')
            $.getJSON(url, function(thumbs){
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
            var fd = new FormData()
            ,   xhr = new XMLHttpRequest()
            
            fd.append('image', e.target.files[0])
            
            xhr.upload.addEventListener('progress', function(e) {
            
            }, false)

            xhr.addEventListener('load', App.index, false)

            // xhr.addEventListener(“error”, uploadFailed, false);
            // xhr.addEventListener(“abort”, uploadCanceled, false);

            xhr.open('POST', App.baseurl(), true)
            xhr.send(fd)

        }
        ,
        // upload to the service
        upload: function(imageURI) {
            var win  = function(r) { alert('Image uploaded successfully!') }
            ,   fail = function(err) { alert("Ruh roh. Image failed to upload! Errorcode: " + err.code) }
            ,   opts = new FileUploadOptions()
            ,   ft   = new FileTransfer()
            
            opts.fileKey  = 'file'
            opts.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1)
            opts.mimeType = 'image/jpeg'
            opts.params   = {}

            ft.upload(imageURI, App.baseurl(), win, fail, opts);
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
    
    // add logging if in dev mode
    if (App.mode() === 'dev') {   
        Object.keys(App).forEach(function(key) {
            var duck = App[key]
            //  punch
            App[key] = function() {
                var args = [].slice.call(arguments)
                console.log('enter App.' + key + ' with args:', args)
                var result = duck.apply(App, args)
                console.log('result App.' + key)
                console.dir(result)
                return result
            }    
        })
    }

    // lets go!
    $(document).on('deviceready', App.init)

})();
