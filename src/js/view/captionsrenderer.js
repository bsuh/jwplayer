import Events from 'utils/backbone.events';
import { STATE_COMPLETE, STATE_ERROR, STATE_IDLE, STATE_PAUSED } from 'events/events';
import { style } from 'utils/css';
import { addClass, removeClass } from 'utils/dom';
import { MEDIA_SEEK, MEDIA_TIME } from 'events/events';
import libjass from 'libjass';

/**
 * Component that renders the actual captions on screen.
 * param {ViewModel} viewModel - The player's ViewModel instance.
 */

const CaptionsRenderer = function (viewModel) {

    const _model = viewModel.player;

    let _captionsTrack;
    let _display;
    let _jassRenderer;
    let _jassClock;

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

    // Assign list of captions to the renderer
    this.populate = function (captions) {
        _captionsTrack = captions;
    };

    this.renderCues = function () {};

    this.resize = function () {
        if (!_jassRenderer) {
            return;
        }

        const videoWidth = _model.getVideo().video.videoWidth;
        const videoHeight = _model.getVideo().video.videoHeight;
        const videoOffsetWidth = _model.get('containerWidth');
        const videoOffsetHeight = _model.get('containerHeight');

        const ratio = Math.min(videoOffsetWidth / videoWidth, videoOffsetHeight / videoHeight);
        const subsWrapperWidth = videoWidth * ratio;
        const subsWrapperHeight = videoHeight * ratio;
        const subsWrapperLeft = (videoOffsetWidth - subsWrapperWidth) / 2;
        const subsWrapperTop = (videoOffsetHeight - subsWrapperHeight) / 2;

        _jassRenderer.resize(subsWrapperWidth, subsWrapperHeight, subsWrapperLeft, subsWrapperTop);
    };

    /**
     * Initialize the captions renderer
     * @param {string} playerElementId - The player container's DOM id
     * @param {object} options - The captions styling configuration
     * @returns {void}
     */
    this.setup = function () {
        style(_display, {
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

        _model.change('captionsTrack', function (model, captionsTrack) {
            this.populate(captionsTrack);
        }, this);
    };

    this.element = function () {
        return _display;
    };

    this.destroy = function() {
        _model.off(null, null, this);
        this.off();
    };

    const _timeChange = (e) => {
        this.update(e.position);
    };

    this.update = function (position) {
        if (_captionsTrack && _captionsTrack.data) {
            if (!_jassRenderer) {
                _jassRenderer = new libjass.renderers.WebRenderer(
                    _captionsTrack.data, _jassClock, _display);
                this.resize();
            } else {
                _jassRenderer._ass = _captionsTrack.data;
            }
        }

        _jassClock.tick(position);
    };

    //_model.on('change:playlistItem', function () {
    //    _timeEvent = null;
    //    _currentCues = [];
    //}, this);

    _model.on(MEDIA_SEEK, _timeChange, this);

    _model.on(MEDIA_TIME, _timeChange, this);

    _model.on('change:state', function(model, state) {
        switch (state) {
            case STATE_IDLE:
            case STATE_ERROR:
            case STATE_COMPLETE:
                this.hide();
                break;
            case STATE_PAUSED:
                _jassClock.pause();
                break;
            default:
                this.show();
                break;
        }
    }, this);

    _model.on('change:fullscreen', function(model, bool) {
        if (bool) {
            addClass(_display, 'libjass-full-screen');
        } else {
            removeClass(_display, 'libjass-full-screen');
        }
    });

    //_model.on('change:captionsList', _captionsListHandler, this);
};

Object.assign(CaptionsRenderer.prototype, Events);

export default CaptionsRenderer;
