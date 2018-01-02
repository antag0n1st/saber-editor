(function (window, undefined) {


    function HtmlElements() {
        throw "Can't initialize html elements";
    }

    HtmlElements.INPUT_TYPE_ALL = 0;
    HtmlElements.INPUT_TYPE_NUMBER = 1;
    HtmlElements.INPUT_TYPE_BOOLEAN = 2;

    // name,displayName , value, class, event, isDisabled, tooltip, method, inputType
    var sample = {
        name: '',
        displayName: '',
        value: '',
        class: '',
        event: '',
        isDisabled: false,
        tooltip: '',
        method: '',
        inputType: HtmlElements.INPUT_TYPE_ALL
    };
    HtmlElements.createInput = function (options) {

        var value = (typeof options.value === "undefined") ? '' : options.value;

        if (typeof value === "string") {
            value = value.replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
                    .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
                    .replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
        }

        var className = options.class || 'big';
        var method = options.method || "propertiesBinder.onPropertyChange";
        var tooltip = options.tooltip || "";
        var inputType = options.inputType || HtmlElements.INPUT_TYPE_ALL;
        var name = options.name || '';
        var displayName = options.displayName || name;
        if (displayName === name) {
            displayName = displayName.replace('_', ' ').capitalize();
        }
        var event_string = options.event ? options.event.name + '="' + options.event.callback + '"' : "";

        var id = "htmlElementId-" + PIXI.utils.uid();

        var html = '<div class="' + className + '">';
        html += '<label ';
        html += tooltip ? 'title="' + tooltip + '"' : '';
        html += '>';
        html += displayName + ': </label>';
        html += ' <input ' + (options.isDisabled ? "disabled" : "");
        html += ' class="form-control" ';
        html += ' id="' + id + '" ';
        html += ' type="text" value="' + value + '" ' + event_string;
        html += ' onkeyup="app.navigator.currentScreen.' + method + '(\'' + name + '\',this.value,this,' + inputType + ');" ';
        html += ' />';

        html += '</div>';

        return {html: html, id: id};

    };

    HtmlElements.createImageButton = function (imageName, method, argsString, className, tooltip) {

        var id = "htmlElementId-" + PIXI.utils.uid();

        var html = '';
        html += '<img class="' + className + '" ';
        html += ' id="' + id + '" ';
        html += ' title="' + tooltip + '" ';
        html += ' src="assets/images/icons/' + imageName + '.png" ';
        html += ' onclick="app.navigator.currentScreen.' + method + '(' + argsString + ')" ';
        html += '/>';

        return {html: html, id: id};

    };

    var buttonOpt = {
        name: '',
        displayName: '',
        class: '',
        icon: '',
        tooltip: '',
        method: '',
        style: ''
    };

    HtmlElements.createButton = function (options) {

        var id = "htmlElementId-" + PIXI.utils.uid();
        var className = options.class || 'btn-info';
        var style = options.style || "margin-left:5px;";
        var method = options.method || "blank";
        var tooltip = options.tooltip || "";
        var icon = options.icon || "";
        var name = options.name || '';
        var displayName = options.displayName || name;
        if (displayName === name) {
            displayName = displayName.replace('_', ' ').capitalize();
        }

        var html = '<div class="btn ' + className + '"';
        html += tooltip ? ' title="' + tooltip + '"' : '';
        html += ' id="' + id + '" ';
        html += ' style="' + style + '" ';
        html += ' onclick="app.navigator.currentScreen.' + method + '(\'' + name + '\',this);" ';
        html += '>';

        html += '<i class="' + icon + '"></i> ';
        html += displayName;
        html += '</div>';

        return {html: html, id: id};

    };

    window.HtmlElements = HtmlElements;

}(window));