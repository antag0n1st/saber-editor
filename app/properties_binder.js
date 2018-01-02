(function (window, undefined) {


    function PropertiesBinder(editor) {
        this.initialize(editor);
    }
    //PropertiesBinder.prototype = new ParentClassName();
    //PropertiesBinder.prototype.parentInitialize = PropertiesBinder.prototype.initialize;
    PropertiesBinder.prototype.initialize = function (editor) {
        // this.parentInitialize();
        this.editor = editor;
    };

    PropertiesBinder.prototype.bindSelected = function () {

        if (this.editor.htmlInterface.propertiesPanel.style.display === "none") {
            return;
        }

        if (this.editor.selectedObjects.length === 1) {
            this.bindObject(this.editor.selectedObjects[0]);
        } else if (this.editor.selectedObjects.length > 1) {
            // multi object binding , should only be alowed for single type objects
        }

    };

    PropertiesBinder.prototype.bindObject = function (object) {

        if (object instanceof ImageObject) {

            var html = '';

            //var data = HtmlElements.createInput('x');

            var opt0 = {name: 'id', value: object.id, class: 'big',displayName: 'ID'};
            var opt1 = {name: 'x', value: Math.roundDecimal(object.position.x, 2), class: 'small'};
            var opt2 = {name: 'y', value: Math.roundDecimal(object.position.y, 2), class: 'small'};
            var opt3 = {name: 'scaleX', value: Math.roundDecimal(object.scale.x, 2), class: 'small' , displayName: 'Scale X'};
            var opt4 = {name: 'scaleY', value: Math.roundDecimal(object.scale.y, 2), class: 'small' , displayName: 'Scale Y'};
            var opt5 = {name: 'anchorX', value: Math.roundDecimal(object.anchor.x, 2), class: 'small' , displayName :'Anchor X'};
            var opt6 = {name: 'anchorY', value: Math.roundDecimal(object.anchor.y, 2), class: 'small', displayName :'Anchor Y'};
            var opt7 = {name: 'tag', value: object.tag};
            var opt8 = {name: 'alpha', value: Math.roundDecimal(object.alpha, 2), class: 'small'};
            var opt9 = {name: 'rotation', value: Math.roundDecimal(Math.radiansToDegrees(object.rotation), 2), class: 'small'};
            var opt10 = {name: 'z-index', value: Math.round(object.zIndex), class: 'small', displayName :'Z-Index'};

            html += HtmlElements.createInput(opt0).html;
            html += HtmlElements.createInput(opt1).html;
            html += HtmlElements.createInput(opt2).html;
            html += HtmlElements.createInput(opt3).html;
            html += HtmlElements.createInput(opt4).html;
            html += HtmlElements.createInput(opt5).html;
            html += HtmlElements.createInput(opt6).html;
            html += HtmlElements.createInput(opt7).html;
            html += HtmlElements.createInput(opt8).html;
            html += HtmlElements.createInput(opt9).html;
            html += HtmlElements.createInput(opt10).html;


            this.editor.htmlInterface.propertiesContent.innerHTML = html;

        }


    };

    PropertiesBinder.prototype.onPropertyChange = function (property, value, element, some) {


        if (this.editor.selectedObjects.length === 1) {
            this.bindObjectWithProperty(this.editor.selectedObjects[0], property, value, element, some)
        } else if (this.editor.selectedObjects.length > 1) {
            // multi object binding , should only be alowed for single type objects
        }

    };

    PropertiesBinder.prototype.bindObjectWithProperty = function (object, property, value, element, some) {
        //TODO do it with commands
        if (property === 'id') {
            object.id = value;
        } else if (property === 'x') {
            object.position.x = Number(value) || 0;
        } else if (property === 'y') {
            object.position.y = Number(value) || 0;
        } else if (property === 'scaleX') {
            object.scale.x = Number(value) || 0;
        } else if (property === 'scaleY') {
            object.scale.y = Number(value) || 0;
        } else if (property === 'tag') {
            object.tag = value;
        } else if (property === 'alpha') {
            object.alpha = Number(value) || 0;
        } else if (property === 'rotation') {
            object.rotation = Math.degreesToRadians(Number(value) || 0);
        } else if (property === 'z-index') {
            object.zIndex = parseInt(value) || 0;
            this.editor.sortObjectsPriority();
        } else if (property === 'anchorX') {
            object.anchor.x = Number(value) || 0;
        } else if (property === 'anchorY') {
            object.anchor.y = Number(value) || 0;
        }

        object.updateSensor();
        object.updateFrame();

    };


    window.PropertiesBinder = PropertiesBinder;

}(window));