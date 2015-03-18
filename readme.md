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
var url = "https://facebook.com/auth?redirect_uri=" + location.href;
var popup = popupOauth(url, {
        features: {
            width: "300",
            height: "300",
            left: "100",
            top: "100"
        }
    });
button.onclick = function (event) {
    event.preventDefault();

    if (popup.isPopped()) {
        popup.focus();
        return;
    }

    popup.on("error", function (error) {
        appendMessage("error - " + error);
    })
    .on("close", function (closedByPopup) {
        if (!closedByPopup) {
            appendMessage("user closed window");
        }
    })
    .on("location", function (loc) {
        this.close();
    })
    .pop()
};
</script>
```
## API

## `popupOauth(url, options)` -> Popup
creates a popup that will pop a window at `url`
`options.features` - popup window features as an object)
`pollWindowInterval` - an interval in ms that the window is polled for accessibility and to emit events

## `popupOauth.getByUrl(url)` -> Array<Popup>
gets the popups by the url that they should have opened initially

## `.on(eventName, listener)` -> this
adds an event listener to the event name

# events
All events are called in the context of the current Popup.
`location (popupWindowLocation)` -> when the location of the popup window is accessible, and when it changes
`close (closedByPopup)` -> when the popup window closes
`error (error)` -> When something goes wrong. There's not any time when this fires at the moment

## `.pop()` -> this
Actually creates the popup window

## `.close()` -> this
Closes the popup window

## `.isPopped()` -> Boolean
Whether or not the popup is currently open

## `.focus()` -> undefined
Focuses the popup window
