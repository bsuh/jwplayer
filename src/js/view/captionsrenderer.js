define([
    'utils/css',
    'events/states',
    'libjass'
], function(cssUtils, states, libjass) {
    /** Component that renders the actual captions on screen. **/
    var CaptionsRenderer = function (_model) {
        var _style = cssUtils.style;


            //array of cues
        var _captionsTrack,

        // display hierarchy
            _display,

            _jassRenderer,
            _jassClock;

        _display = document.createElement('div');

        this.show = function () {
            if (_jassRenderer) {
                _jassRenderer.enable();
                _jassClock.pause();
                _jassClock.play();
            }
        };

        this.hide = function () {
            if (_jassRenderer) {
                _jassRenderer.disable();
            }
        };

        /** Assign list of captions to the renderer. **/
        this.populate = function(captions) {
            _captionsTrack = captions;
        };

        this.resize = function (width, height) {
            if (!_jassRenderer) {
                return;
            } else if (!width || !height) {
                _jassRenderer.resize(_display.parentNode.offsetWidth,
                                     _display.parentNode.offsetHeight);
            } else {
                _jassRenderer.resize(width, height);
            }
        };

        /** Constructor for the renderer. **/
        this.setup = function() {
            _style(_display, {
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                'line-height': 'normal'
            });
            _jassClock = new libjass.renderers.ManualClock();

            this.populate(_model.get('captionsTrack'));
        };

        function _timeChange(e) {
            this.update(e.position);
        }

        /** Update the video position. **/
        this.update = function (position) {
            if (_captionsTrack && _captionsTrack.data) {
                if (!_jassRenderer) {
                    _jassRenderer = new libjass.renderers.WebRenderer(
                        _captionsTrack.data, _jassClock, _display);
                    this.resize();
                } else {
                    _jassRenderer._ass = _captionsTrack.data;
                    this.show();
                }
            } else {
              this.hide();
            }

            _jassClock.tick(position);
        };

        this.element = function() {
            return _display;
        };

        this.renderCues = function () {};

        this.setContainerHeight = function () { this.resize(); };

        _model.on('change:captionsTrack', function(model, captionsTrack) {
            this.populate(captionsTrack);
            // TODO: handle with VTT.js
        }, this);

        _model.mediaController.on('time seek', _timeChange, this);
        _model.on('change:state', function(model, state) {
            switch (state) {
                case states.IDLE:
                case states.ERROR:
                case states.COMPLETE:
                    this.hide();
                    break;
                case states.PAUSED:
                    _jassClock.pause();
                    break;
                default:
                    this.show();
                    break;
            }
        }, this);
        _model.on('change:fullscreen', function(model, bool) {
            if (bool) {
                _display.classList.add('libjass-full-screen');
            } else {
                _display.classList.remove('libjass-full-screen');
            }
        });
    };

    return CaptionsRenderer;
});
