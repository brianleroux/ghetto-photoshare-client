;(function(){

    // so it begins
    var App = {

        // some helper methods
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
        // ya, kinda gross. but I need this so the App can decide which strategy to impl: desktop, mobile safari, or cordova
        //
        // desktop ... can do a file upload.
        // ios ....... can do fuck all. hide the button!
        // cordova ... can use the camera api.
        //
        context: function() {
            if (window.Cordova) return 'cordova'
            if (navigator.userAgent.toLowerCase().search(/iphone|ipod|ipad/) > 0) return 'ios'
            return 'desktop'
        }
        ,
        // let them come
        init: function() {
            
            $('#refresh').click(App.index)
            $('button.close').click(function(e) {
                e.target.parentNode.style.display = 'none'
            })
            // pick our app strategy
            if (App.context() === 'cordova') {
                // bind to camera api call
                $('#snap').tap(App.snap)
            } else if (App.context() === 'ios') {
                // can do fuck all
                $('#snap').remove()
                $('#snap-divider').hide()
            }
            else {
                // we are on the desktop; do an ajaxy file upload
                $('#snap').remove()
                $('#tools').append('<li><a id=snap><input id=fileselect type=file accept=image/*;capture=camera></a></li>')
                $('#fileselect').on('change', App.formPost)
                /* also add tap event to desktop
                $(document).delegate('body', 'click', function(e) {
                    $(e.target).trigger('tap')
                })*/
            }

            // load the home screen mosaic
            App.index()
        }
        ,
        // draw index
        index: function(e) {
            try {
                e.preventDefault()
            } catch(e) {}
            // load local or remote
            var url = App.baseurl() + '/api/v1/img/'
            // made the refresh button rotate
            $('#refresh').addClass('loading')
            $.getJSON(url, function(thumbs){
                $('#pics').html('')
                thumbs.forEach(function(thumb){
                    var src = 'http://proxy.boxresizer.com/convert?resize=90x90&shape=pad&source=' + thumb
                    $('#pics').append('<a href=' + thumb + '><img class=pic src=' + src + '></a>')
                })
                $('#refresh').removeClass('loading')
            })
            return false
        }
        ,
        formPost: function(e) {
            var fd = new FormData()
            ,   xhr = new XMLHttpRequest()
            // grab the file
            fd.append('image', e.target.files[0])
            $('#refresh').addClass('loading')
            // log out the progress for now
            xhr.upload.addEventListener('progress', function(e) {
                var percent = ~~(e.loaded * 100 / e.total)
                console.log(percent)
            }, false)
            // called when upload complete
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
        
        // really, this could be the case always
        window.App = App

        // instrument the App with some logging
        Object.keys(App).forEach(function(key) {
            var duck = App[key]
            //  punch
            App[key] = function() {
                var args = [].slice.call(arguments)
                console.log('enter App.' + key + ' with args:', args)
                var result = duck.apply(App, args)
                if (typeof result != 'undefined') {
                    console.log('result App.' + key)
                    console.dir(result)
                    return result
                }
            }    
        })
    }

    // lets go!
    $(document).on('deviceready', App.init)

})();
