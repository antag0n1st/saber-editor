(function (window, undefined) {

    // http://pixijs.io/pixi-text-style

//    align: 'left',
//    breakWords: false,
//    dropShadow: false,
//    dropShadowAlpha: 1,
//    dropShadowAngle: Math.PI / 6,
//    dropShadowBlur: 0,
//    dropShadowColor: 'black',
//    dropShadowDistance: 5,
//    fill: 'black',
//    fillGradientType: _const.TEXT_GRADIENT.LINEAR_VERTICAL,
//    fillGradientStops: [],
//    fontFamily: 'Arial',
//    fontSize: 26,
//    fontStyle: 'normal',
//    fontVariant: 'normal',
//    fontWeight: 'normal',
//    letterSpacing: 0,
//    lineHeight: 0,
//    lineJoin: 'miter',
//    miterLimit: 10,
//    padding: 0,
//    stroke: 'black',
//    strokeThickness: 0,
//    textBaseline: 'alphabetic',
//    trim: false,
//    wordWrap: false,
//    wordWrapWidth: 100,
//    leading: 0

    var Style = Style || function () {
        throw "can't initialize this class";
    };
    
    Style.DEFAULT_INPUT = {
        fill: "#555555",
        fontFamily: "Arial Black",
        fontSize: 50,
        background: "rounded",
        padding: 4
    };
    
    Style.MULTY_LINE_LABEL = {
        breakWords: true,
        wordWrap: true,
        wordWrapWidth: 800,
        fill: "#999999",
        fontFamily: "Arial Black",
        fontSize: 30,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowDistance: 1,
    };

    Style.DEFAULT_LABEL = {
        fill: "#999999",
        fontFamily: "Arial Black",
        fontSize: 30
    };

    Style.DEFAULT_BUTTON = {
        fill: "#cccccc",
        imageNormal: "button",
        imageSelected: "button",
        fontFamily: "Arial Black",
        fontSize: 30
    };

    Style.ROUNDED_BUTTON = {
        fill: "#cccccc",
        imageNormal: "button",
        imageSelected: "button",
        fontFamily: "Arial Black",
        fontSize: 30
    };

    window.Style = Style;

}(window));