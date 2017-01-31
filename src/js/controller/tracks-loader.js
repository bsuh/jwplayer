define([
    'utils/underscore',
    'utils/helpers',
    'parsers/parsers',
    'parsers/captions/srt',
    'parsers/captions/dfxp',
    'parsers/captions/vttcue',
    'libjass'
], function(_, utils, parsers, srt, dfxp, VTTCue, libjass) {
    var tracksLoader = {};

    tracksLoader.loadFile = function(track, successHandler, errorHandler) {
        var xhr = track.xhr = new XMLHttpRequest();
        var streamParser = new libjass.parser.StreamParser(
            new libjass.parser.XhrStream(xhr));

        streamParser.minimalASS.then(function (ass) {
            delete track.xhr;
            successHandler(ass);
        });

        streamParser.ass.then(function (ass) {
            delete track.xhr;
            successHandler(ass);
        }, function (reason) {
            delete track.xhr;
            errorHandler(reason);
        });

        xhr.open('GET', track.file, true);
        xhr.send();
    };

    tracksLoader.cancelXhr = function(tracks) {
        _.each(tracks, function(track) {
            var xhr = track.xhr;
            if (xhr) {
                xhr.onload = null;
                xhr.onreadystatechange = null;
                xhr.onerror = null;
                if ('abort' in xhr) {
                    xhr.abort();
                }
            }
            delete track.xhr;
        });
    };

    tracksLoader.convertToVTTCues = function(cues) {
        // VTTCue is available natively or polyfilled where necessary
        // TODO: if there's no window object, polyfill this
        var vttCues = _.map(cues, function (cue) {
            return new VTTCue(cue.begin, cue.end, cue.text);
        });
        return vttCues;
    };

    return tracksLoader;
});
