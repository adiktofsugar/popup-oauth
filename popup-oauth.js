(function (factory) {
    if (typeof window.define != "undefined" && define.amd) {
        define([], factory);
    } else {
        window.popupOauth = factory();
    }
}(function () {

    function setDefaults(options, defaults) {
        for (var key in defaults) {
            if (options[key] === undefined) {
                options[key] = defaults[key];
            }
        }
    }

    function logError(message) {
        if (typeof window.console !== "undefined") {
            console.log("[popup-oauth] " + message);
        }
    }

    var popupId = 0;
    function Popup(url, options) {
        if (options === undefined) {
            options = {};
        }
        popupId = popupId + 1;
        var id = 'popup' + popupId;

        var defaultFeatures = {
            height: 300,
            width: 500
        };
        var optionsFeatures = options.features || {};

        var defaults = {
            pollWindowInterval: 100
        };

        setDefaults(options, defaults);
        var self = this;

        var _pollWindowTimeout;
        var _openWindow;
        var _pollWindowShouldEmitClosed;
        var _pollWindowLastLocationEmitted;

        var eventListeners = {};
        var emitEvent = function (eventName) {
            var data = Array.prototype.slice.call(arguments, 1);
            var listeners = eventListeners[eventName] || [];
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                try {
                    listener.apply(self, data);
                } catch (e) {
                    logError(e);
                }
            }
        };
        var listenEvent = function (eventName, listener) {
            if (!eventListeners[eventName]) {
                eventListeners[eventName] = [];
            }
            eventListeners[eventName].push(listener);
        }
        var resetEventListeners = function () {
            eventListeners = {};
        }
        
        var getFeatures = function () {
            var featuresString = "";
            var features = options.features || {};
            for (var key in features) {
                if (features.hasOwnProperty(key)) {
                    var value = features[key];
                    featuresString += key + "=" + value + ',';
                }
            }
            if (featuresString.length > 0) {
                featuresString = featuresString.substring(0, featuresString.length - 1);
            }
            return featuresString;
        };
        
        var pollWindow = function (initialize) {
            if (initialize) {
                _pollWindowShouldEmitClosed = true;
                _pollWindowLastLocationEmitted = undefined;
            }
            if (!_openWindow || _openWindow.closed) {
                if (_pollWindowShouldEmitClosed) {
                    emitEvent("close", false);
                }
                return;
            }
            try {
                var canAccessLocation = _openWindow.location && _openWindow.location.hostname;
            } catch (e) {
                canAccessLocation = false;
            }
            if (canAccessLocation && _pollWindowLastLocationEmitted != _openWindow.location.href) {
                emitEvent("location", _openWindow.location);
                _pollWindowLastLocationEmitted = _openWindow.location.href;
            }
            _pollWindowTimeout = setTimeout(function () {
                pollWindow();
            }, options.pollWindowInterval);
        };
        
        this.isPopped = function () {
            if (_openWindow && !_openWindow.closed) {
                return true;
            }
            return false;
        }

        this.focus = function () {
            if (_openWindow) {
                _openWindow.focus();
            }
        }

        this.pop = function () {
            if (_pollWindowTimeout) {
                clearTimeout(_pollWindowTimeout);
            }
            _openWindow = window.open(url, id, getFeatures());
            pollWindow(true);
            listenEvent("close", function () {
                resetEventListeners();
            });
            return this;
        };
        
        this.on = function (eventName, callback) {
            listenEvent(eventName, callback);
            return this;
        };

        this.close = function () {
            if (_pollWindowTimeout) {
                clearTimeout(_pollWindowTimeout);
            }
            _pollWindowShouldEmitClosed = false;
            _openWindow.close();
            emitEvent("close", true);
            return this;
        };
    }

    var popups = [];
    var popupOauth = function (url, options) {
        var popup = new Popup(url, options);
        popup.on("close", function () {
            var popupIndex;
            for (var i = 0; i < popups.length; i++) {
                if (popups[i] == popup) {
                    popupIndex = i;
                    break;
                }
            }
            popups.splice(popupIndex, 1);
        });
        popups.push(popup);
        return popup;
    };
    popupOauth.getByUrl = function (url) {
        var returnPopups = [];
        for (var i=0; i < popups.length; i++) {
            if (popups[i].url == url) {
                returnPopups.push(popups[i]);
            }
        }
        return returnPopups;
    };

    return popupOauth;
}));
