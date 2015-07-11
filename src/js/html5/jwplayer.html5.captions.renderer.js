(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils;

    /** Component that renders the actual captions on screen. **/
    html5.captions.renderer = function(_div) {

        /** Current list with captions. **/
        var _captions,
            /** Container of captions window. **/
            _container,
            /** Current video position. **/
            _position,

            _jassRenderer,
            _jassClock;


        /** Hide the rendering component. **/
        this.hide = function() {
            if (_jassRenderer) {
                _jassRenderer.disable();
            }
        };

        /** Assign list of captions to the renderer. **/
        this.populate = function(captions) {
            if (!_jassRenderer) {
                _jassRenderer = new libjass.renderers.WebRenderer(
                    captions, _jassClock, _container
                );
                this.resize();
            }
            _jassRenderer._ass = captions;
            _jassClock.tick(_position);
        };

        /** Store new dimensions. **/
        this.resize = function(width, height) {
            if (!_jassRenderer) {
                return;
            } else if (!width || !height) {
                _jassRenderer.resize(_div.offsetWidth, _div.offsetHeight);
            } else {
                _jassRenderer.resize(width, height);
            }
        };

        /** Constructor for the renderer. **/
        function _setup() {
            _container = document.createElement('div');

            var jwplayerNode = _div;
            while (jwplayerNode.className.split(' ').indexOf('jwplayer') < 0) {
                jwplayerNode = jwplayerNode.parentNode;
            }
            jwplayerNode.parentElement.replaceChild(_container, jwplayerNode);
            _container.appendChild(jwplayerNode);

            _jassClock = new libjass.renderers.ManualClock();
        }

        /** Show the rendering component. **/
        this.show = function() {
            if (_jassRenderer) {
                _jassRenderer.enable();
                _jassClock.pause();
                _jassClock.play();
            }
        };

        /** Update the video position. **/
        this.update = function(position) {
            _position = position;
            _jassClock.tick(position);
        };

        this.pause = function () {
            _jassClock.pause();
        };

        this.play = function () {
            _jassClock.play();
        };

        this.fullscreen = function (isFullscreen) {
            if (isFullscreen) {
                _container.classList.add('libjass-full-screen');
            } else {
                _container.classList.remove('libjass-full-screen');
            }
        };

        _setup();
    };

})(jwplayer);
