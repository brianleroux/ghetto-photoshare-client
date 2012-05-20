;(function () {
    if (!window.Cordova) {
        // fake deviceready event, ht @alunny
        function deviceready() {
            var e = document.createEvent('Events')
            e.initEvent('deviceready', true, true)
            document.dispatchEvent(e)
        }

        // shim in the phonegap stuff we wanna fake in the browser
        // ripple can do this for you too eh
        navigator.camera = {
            getPicture: function(win, fail, opts) {
                console.log('called getPicture with the following options', opts)
                win('fake file uri')
            }
        }

        // gross.
        window.Camera = {DestinationType:{FILE_URI:0}}
        window.FileUploadOptions = function(){}        
        window.FileTransfer = function(){ this.upload = function(){ console.log('FileTransfer upload called') }}

        // poor mans ready event
        document.addEventListener('DOMContentLoaded', deviceready, false)
    }    
})()
