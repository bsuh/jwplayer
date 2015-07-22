import VTTCue from 'parsers/captions/vttcue';
import libjass from 'libjass';

export function loadFile(track, successHandler, errorHandler) {
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
}

export function cancelXhr(tracks) {
    if (tracks) {
        tracks.forEach(track => {
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
    }
}

export function convertToVTTCues(cues) {
    // VTTCue is available natively or polyfilled where necessary
    return cues.map(cue => new VTTCue(cue.begin, cue.end, cue.text));
}
