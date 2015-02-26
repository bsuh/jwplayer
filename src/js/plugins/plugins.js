define([
    'plugins/loader',
    'plugins/model',
    'plugins/plugin',
    'plugins/utils'
], function(PluginLoader, PluginModel, Plugin, pluginUtils) {

    var _plugins = {},
        _pluginLoaders = {};

    var loadPlugins = function(id, config) {
        _pluginLoaders[id] = new PluginLoader(new PluginModel(_plugins), config);
        return _pluginLoaders[id];
    };

    var registerPlugin = function(id, target, arg1, arg2) {
        var pluginId = pluginUtils.getPluginName(id);
        if (!_plugins[pluginId]) {
            _plugins[pluginId] = new Plugin(id);
        }
        _plugins[pluginId].registerPlugin(id, target, arg1, arg2);
    };


    return {
        loadPlugins : loadPlugins,
        registerPlugin : registerPlugin
    };
});