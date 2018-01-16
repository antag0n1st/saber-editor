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
        feedback: false,
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
        var feedbackID = "feedbackElementId-" + PIXI.utils.uid();

        var html = '<div class="' + className + ' ' + (options.feedback ? 'has-feedback' : '') + '">';
        html += options.feedback ? '<i id="' + feedbackID + '" style="color:orange;" class="fa fa-warning form-control-feedback"></i>' : '';
        html += '<label ';
        html += tooltip ? 'title="' + tooltip + '"' : '';
        html += '>';
        html += displayName + ': </label>';
        html += ' <input ' + (options.isDisabled ? "disabled" : "");
        html += ' class="form-control" ';
        html += ' id="' + id + '" ';
        html += ' type="text" value="' + value + '" ' + event_string;
        html += ' onkeyup="app.navigator.currentScreen.' + method + '(\'' + name + '\',this.value,this,' + inputType + ',\'' + feedbackID + '\');" ';
        html += ' />';

        html += '</div>';

        return {html: html, id: id, feedbackID: feedbackID};

    };

    HtmlElements.setFeedback = function (id, isValid) {

        var feedback = document.getElementById(id);

        feedback.className = feedback.className.replace('fa fa-warning', "");
        feedback.className = feedback.className.replace('fa fa-check', "");

        if (isValid) {
            feedback.className += ' fa fa-check';
            feedback.style.color = 'green';
        } else {
            feedback.className += ' fa fa-warning';
            feedback.style.color = 'orange';
        }

        feedback.className = feedback.className.replace(/  +/g, " ");


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

    HtmlElements.createSection = function (title) {

        var id = "htmlElementId-" + PIXI.utils.uid();

        var html = '';
        html += '<div ';

        html += ' style="border-top:1px solid #aaaaaa;text-align:left; margin-top:5px;" ';
        html += ' id="' + id + '" ';
        html += '>';
        html += '<h3 style="font-size:20px;">';
        html += ' ' + title + ' ';
        html += '</h3>';
        html += '</div>';

        return {html: html, id: id};

    };

    var checkboxOpt = {
        name: '',
        displayName: '',
        class: '',
        method: '',
        checked: false,
        isDisabled: false
    };

    HtmlElements.createCheckbox = function (options) {


        var className = options.class || 'big';
        var method = options.method || "propertiesBinder.onPropertyChange";

        var name = options.name || '';
        var displayName = options.displayName || name;
        if (displayName === name) {
            displayName = displayName.replace('_', ' ').capitalize();
        }

        var checked = options.checked;


        var id = "htmlElementId-" + PIXI.utils.uid();


        var html = '<div class="' + className + ' ' + (options.feedback ? 'has-feedback' : '') + '">';
        html += '<label ';
        html += ' style="cursor:pointer;" ';
        html += 'for="' + id + '"';
        html += '>';
        html += displayName + ': </label>';
        html += ' <input ' + (options.isDisabled ? "disabled" : "");
        html += ' class="" ';
        html += checked ? ' checked="checked" ' : '';
        html += ' style="cursor:pointer;" ';
        html += ' id="' + id + '" ';
        html += ' type="checkbox" ';
        html += ' onchange="app.navigator.currentScreen.' + method + '(\'' + name + '\',this.value,this,\'checkbox\',null);" ';
        html += ' />';

        html += '</div>';

        return {html: html, id: id, feedbackID: null};

    };

    var colorPickerOpt = {
        name: '',
        displayName: '',
        class: '',
        value: ''
    };

    HtmlElements.createColorPicker = function (options) {


        var className = options.class || 'big';
        options.method = options.method || "propertiesBinder.onPropertyChange";

        var name = options.name || '';
        var displayName = options.displayName || name;
        if (displayName === name) {
            displayName = displayName.replace('_', ' ').capitalize();
        }

        var value = options.value || '#DD0F20';

        var style = options.style || ''; // margin-top: 10px; width: 165px;


        var id = "htmlElementId-" + PIXI.utils.uid();


        var html = '<div class="' + className + ' ' + (options.feedback ? 'has-feedback' : '') + '">';
        html += '<label ';
        html += '>';
        html += displayName + ': </label>';

        html += '<div id="' + id + '" class="input-group colorpicker-component" style="margin-left:4px;' + style + '">';
        html += ' <input ';
        html += ' class="form-control" ';
        html += ' type="text" ';
        html += ' value="' + value + '" ';
        html += ' />';
        html += '<span class="input-group-addon"><i></i></span>';
        html += '</div>';


        return {html: html, id: id, feedbackID: null, options: options};

    };

    HtmlElements.activateColorPicker = function (picker) {
        

        var colorPicker = $('#' + picker.id).colorpicker({
            useAlpha: false,
            customClass: 'colorpicker-2x',
            sliders: {
                saturation: {
                    maxLeft: 200,
                    maxTop: 200
                },
                hue: {
                    maxTop: 200
                },
                alpha: {
                    maxLeft: 0,
                    maxTop: 100,
                    callLeft: false,
                    callTop: false
                }}
        });

        colorPicker.on('changeColor', function (e) {
            'use strict';
            
           var value = e.color.toHex()
            
            eval('app.navigator.currentScreen.' + picker.options.method + '(\'' + picker.options.name + '\',value,this,null,null);');
            //  
            // that.onTextColorChange(e.color.toHex());

        });
    };

    window.HtmlElements = HtmlElements;

}(window));