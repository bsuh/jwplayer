define([
    'api/global-api',
    'utils/helpers',
    '../css/libjass.css'
], function (GlobalApi, utils) {
    /*global __webpack_public_path__:true*/
    __webpack_public_path__ = utils.loadFrom();

    return GlobalApi.selectPlayer;
});
