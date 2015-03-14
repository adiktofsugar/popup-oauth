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

    // TODO: add cleanup of setTimeout and extra instances attached to the same window

    function Popup(url, options) {
        if (options === undefined) {
            options = {};
        }

        var defaultFeatures = {
            height: 300,
            width: 500
        };
        var optionsFeatures = options.features || {};

        var defaults = {
            pollWindowInterval: 100,
            shouldCloseWindow: function (locationOfWindow) {
                return locationOfWindow.hostname == location.hostname;
            }
        };

        setDefaults(options, defaults);
        
        this.url = url;
        this.options = options;
    }
    Popup.prototype = {
        getWindowName: function () {
            return "popup-" + this.url.replace(/[^a-zA-Z0-9]+/g, '_');
        },
        getWindowFeatures: function () {
            var featuresString = "";
            var features = this.options.features || {};
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
        },
        openWindow: function () {
            this._openWindow = window.open(this.url, this.getWindowName(), this.getWindowFeatures());
            this.pollWindow();
        },
        pollWindow: function () {

            try {
                var canAccessLocation = this._openWindow.location && this._openWindow.location.hostname;
            } catch (e) {
                canAccessLocation = undefined;
            }

            if (canAccessLocation && this.shouldCloseWindow(this._openWindow.location)) {
                this.closeWindow();
            } else {
                var self = this;
                setTimeout(function () {
                    self.pollWindow();
                }, this.options.pollWindowInterval);
            }
        },
        closeWindow: function () {
            var fn = this.options.onBeforeCloseWindow;
            if (fn) {
                try {
                    fn(this._openWindow);
                } catch (e) {
                    logError("onBeforeCloseWindow error - " + e);
                }
            }
            this._openWindow.close();
        },
        shouldCloseWindow: function (locationOfWindow) {
            var fn = this.options.shouldCloseWindow;
            var returnValue;
            try {
                returnValue = fn(locationOfWindow);
            } catch (e) {
                logError("shouldCloseWindow function failed - " + e);
            }
            return returnValue;
        }
    };

    return {
        createPopup: function (url, options) {
            return new Popup(url, options);
        }
    };
}));
