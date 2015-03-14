popup oauth
===

This exists because i couldn't find one that did this.

What it does
===

Creates a popup to anything. When it can read the location again (aka on the same domain, like after the redirect to callback_url), it can close the window if your defined condition is met. Then you'll have access to whatever the url was at that time.

Example flow
===

You're integrating with facebook (without their SDK). To log a user in, you have to redirect to facebook.com/auth?scope=<my scope>&appid=<myappid> or whatever. The user then potentially logs in, accepts or denies your app, and then facebook redirects to your callback url with the information in the url.

If it's totally server-side, the user must be redirected away, which sucks for just linking facebook to an account, since it feels so heavy. To do it client side, you have to put the redirect dance into a popup then have the popup relay information to you after the oauth dance.

```
// This api is going to change a lot to be easier to use, but it does take care of the polling for you
var popup = popupOauth.createPopup('https://facebook.com/auth?...', {
    features: {
        width: "300",
        height: "300",
        left: "100",
        top: "100"
    },

    // Happenes right before the window is actually closed
    onBeforeCloseWindow: function (openedWindow) {
        var queryString = openedWindow.location.search;
        var queryStringParameters = (function (queryString) {
            // deserialize query string from the key values and whatever
        }(queryString));
        var accessToken = queryStringParameters.access_token;
        if (!accessToken) {
            handleNoAccessToken(queryStringParameters);
        } else {
            handleHasAccessToken(queryStringParameters);
        }
    },

    // condition to close the window
    shouldCloseWindow: function (openedWindowLocation) {
        return openedWindowLocation.hostname == location.hostname;
    });
button.onclick = function (event) {
    event.preventDefault();
    popup.openWindow();
}
```

Future api...
```
var facebookPopup = popupOauth(facebookAuthUri, {
        features: {},
        locationCloseMatcher: function (otherLocation) {
            return otherLocation.hostname == location.hostname;
        }
    });
button.onclick = function (event) {
    event.preventDefault();
    facebookPopup.pop(function (error, data) {
        // error could be if window is closed manually
        // data is the query string and anchor parameters, and includes the original location object
    });
}
```
