(function (window, undefined) {

    function InputObject(imageName) {
        this.initialize(imageName);
    }

    InputObject.prototype = new Entity();
    InputObject.prototype.entityInitialize = InputObject.prototype.initialize;
    InputObject.prototype.initialize = function (imageName) {

        this.entityInitialize(null);

        this._padding = 20;
        this.type = 'InputObject';

        this.background = new NineSlice(imageName, '15');
        this.addChild(this.background);

        this.backgroundName = imageName;

        this.label = new Label(Style.DEFAULT_INPUT);
        this.label.txt = 'Text';
        this.label.style.fill = "#ffffff";
        this.label.style.fontSize = 40;
        this.label.anchor.set(0.5, 0.5);

        this.addChild(this.label);

        this.centered();

        this.originalBtnWidth = 200;
        this.originalBtnHeight = 200;

        // this needs to be exposed

        this.properties = {
            width: 320,
            height: 100,
            padding: '30',
            sensorWidth: 0,
            sensorHeight: 0,
            hasPlaceholder: false,
            hasNext : false,
            placeholderColor: '#555555'
        };

    };

    InputObject.prototype.updateSize = function () {
        this.sensor = null;
        this.setSensorSize(this.properties.width, this.properties.height);
    };

    InputObject.prototype._downResize = function (event, editor) {
        var w = this._width / 2;
        var h = this._height / 2;
        this.initialSize = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
        this.originalBtnWidth = this.properties.width;
        this.originalBtnHeight = this.properties.height;

    };

    InputObject.prototype._moveResize = function (event, editor) {
        var gp = this.getGlobalPosition();

        // find the center
        var o = this;
        gp.x += -o.anchor.x * o._width * o.scale.x + o._width / 2 * o.scale.x;
        gp.y += -o.anchor.y * o._height * o.scale.y + o._height / 2 * o.scale.y;

        // 20 is the padding
        var distance = Math.getDistance(event.point, gp);

        var scale = distance / this.initialSize;

        this.properties.width = this.originalBtnWidth * scale;
        this.properties.height = this.originalBtnHeight * scale;

        this.background.setSize(this.properties.width, this.properties.height);
        // this.scale.set(scale, scale);

        this.updateSize();
        this.updateSensor();
        this.updateFrame();

        this.bindProperties(editor);

    };


    InputObject.prototype.update = function (dt) {


    };

    InputObject.prototype.export = function () {

        var o = this.basicExport();

        o.txt = this.label.txt;
        o.backgroundName = this.backgroundName;

        o.style = {
            fill: this.label.style.fill,
            fontFamily: this.label.style.fontFamily,
            fontSize: this.label.style.fontSize,
            padding: 4,
            align: this.label.style.align
        };

        return o;

    };

    InputObject.prototype.build = function (data) {

        if (data) {
            this.setBasicData(data);
            this.label.txt = data.txt;

            this.backgroundName = data.backgroundName;

            this.background.imageName = data.backgroundName;

            for (var property in data.style) {
                if (data.style.hasOwnProperty(property)) {
                    this.label.style[property] = data.style[property];
                    // do stuff
                }
            }
        }

        this.background.padding = this.properties.padding;
        this.background.setSize(this.properties.width, this.properties.height);

       // this.label.visible = this.properties.hasPlaceholder;
       
       if(this.properties.hasPlaceholder){
           // change the color
       } else {
           
       }

        this.enableSensor();

        this.updateSize();
        this.createFrame(0, 16);
        this.updateFrame();

        this.canResize = true;

        // this.deselect();
    };

    InputObject.prototype.bindProperties = function (editor) {

        var html = '';

        var method = 'onSelectedObjectPropertyChange';
        
      //  log(this.properties)

        var opt0 = {name: 'width', value: Math.round(this.properties.width), class: 'small', method: method};
        var opt1 = {name: 'height', value: Math.round(this.properties.height), class: 'small', method: method};
        var opt2 = {name: 'padding', value: Math.round(this.properties.padding), class: 'big', method: method, feedback: true};
        var opt5 = {name: 'sensorWidth', value: Math.round(this.properties.sensorWidth), class: 'small', displayName: 'width', method: method};
        var opt6 = {name: 'sensorHeight', value: Math.round(this.properties.sensorHeight), class: 'small', displayName: 'height', method: method};

        var opt7 = {name: 'hasPlaceholder', checked: this.properties.hasPlaceholder, method: method, displayName: 'Is Active'};
        var opt8 = {name: 'hasNext', checked: this.properties.hasNext, method: method, displayName: 'Has Next'};
        
        var opt9 = {name: 'placeholderColor', method: method, displayName: 'Color' , value: this.properties.placeholderColor };

        html += HtmlElements.createInput(opt0).html;
        html += HtmlElements.createInput(opt1).html;

        var padding = HtmlElements.createInput(opt2);
        var colorPicker = HtmlElements.createColorPicker(opt9);
        
        html += padding.html;
        html += HtmlElements.createCheckbox(opt8).html;
        html += HtmlElements.createSection('Placeholder').html;
        html += HtmlElements.createCheckbox(opt7).html;
        html += colorPicker.html;
        html += HtmlElements.createSection('Sensor').html;
        html += HtmlElements.createInput(opt5).html;
        html += HtmlElements.createInput(opt6).html;

        editor.htmlInterface.propertiesContent.innerHTML = html;

        // adjust feedback
        HtmlElements.setFeedback(padding.feedbackID, this.isPaddingValid());
        HtmlElements.activateColorPicker(colorPicker);

    };

    InputObject.prototype.onPropertyChange = function (editor, property, value, element, inputType, feedbackID) {
        
       

        if (property === 'padding') {
            HtmlElements.setFeedback(feedbackID, this.isPaddingValid());
        }

        if (property === "hasPlaceholder" || property === "hasNext") {
            value = element.checked;
        }


        var command = new CommandProperty(this, 'properties.' + property, value, function () {

            this.background.padding = this.properties.padding;
            this.background.setSize(this.properties.width, this.properties.height);

            this.updateSize();
            this.updateSensor();
            this.updateFrame();

        }, this);

        editor.commands.add(command);

    };

    InputObject.prototype.isPaddingValid = function () {
        return true;
    };

    window.InputObject = InputObject;

}(window));