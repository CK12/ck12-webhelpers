var isIE11 = !!(navigator.userAgent.match(/Trident/) && navigator.userAgent.match(/rv[ :]11/)),
    isEdge = /Edge\/\d+./i.test(navigator.userAgent),
    isMicrosoftBrowser = (isIE11 || isEdge),
    isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS'),
    isTouchDevice = 'ontouchstart' in window;

const browser = {
    isIE11,
    isEdge,
    isMicrosoftBrowser,
    isSafari,
    isTouchDevice
};

export default browser;