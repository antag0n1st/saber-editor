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

        if (this.editor.htmlInterface.commonPropertiesPanel.style.display === "none") {
            return;
        }

        if (this.editor.selectedObjects.length === 1) {
            this.bindObject(this.editor.selectedObjects[0]);
        } else if (this.editor.selectedObjects.length > 1) {
            // multi object binding , should only be alowed for single type objects
        }

    };

    PropertiesBinder.prototype.bindObject = function (object) {

        //  if (object instanceof ImageObject ) {

        var html = '';

        //var data = HtmlElements.createInput('x');

        var opt0 = {name: 'id', value: object.id, class: 'big', displayName: 'ID', feedback: true};
        var opt1 = {name: 'x', value: Math.roundDecimal(object.position.x, 2), class: 'small'};
        var opt2 = {name: 'y', value: Math.roundDecimal(object.position.y, 2), class: 'small'};
        var opt3 = {name: 'scaleX', value: Math.roundDecimal(object.scale.x, 2), class: 'small', displayName: 'Scale X'};
        var opt4 = {name: 'scaleY', value: Math.roundDecimal(object.scale.y, 2), class: 'small', displayName: 'Scale Y'};
        var opt5 = {name: 'anchorX', value: Math.roundDecimal(object.anchor.x, 2), class: 'small', displayName: 'Anchor X'};
        var opt6 = {name: 'anchorY', value: Math.roundDecimal(object.anchor.y, 2), class: 'small', displayName: 'Anchor Y'};
        var opt7 = {name: 'tag', value: object.tag};
        var opt8 = {name: 'alpha', value: Math.roundDecimal(object.alpha, 2), class: 'small'};
        var opt9 = {name: 'rotation', value: Math.roundDecimal(Math.radiansToDegrees(object.rotation), 2), class: 'small'};
        var opt10 = {name: 'z-index', value: Math.round(object.zIndex), class: 'small', displayName: 'Z-Index'};

        var opt11 = {name: 'constraintX', value: object.constraintX ? object.constraintX.value : '', class: 'big', displayName: 'X', feedback: true};
        var opt12 = {name: 'constraintY', value: object.constraintY ? object.constraintY.value : '', class: 'big', displayName: 'Y', feedback: true};

        var opt13 = {name: 'className', value: object.className, class: 'big', displayName: 'Class'};

        var idControl = HtmlElements.createInput(opt0);

        html += idControl.html;
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
        html += HtmlElements.createInput(opt13).html;
        html += HtmlElements.createSection('Constraints').html;

        var cx = HtmlElements.createInput(opt11);
        var cy = HtmlElements.createInput(opt12);

        html += cx.html;
        html += cy.html;

        this.editor.htmlInterface.commonPropertiesContent.innerHTML = html;

        // validate fields

        if (object.constraintX) {
            HtmlElements.setFeedback(cx.feedbackID, object.constraintX.isValid);
        }

        if (object.constraintY) {
            HtmlElements.setFeedback(cy.feedbackID, object.constraintY.isValid);
        }

        var isValid = this.editor.isIdUnique(object.id);
        if (object.id === '') {
            isValid = false;
        }
        HtmlElements.setFeedback(idControl.feedbackID, isValid);

        //   }


    };

    PropertiesBinder.prototype.onPropertyChange = function (property, value, element, inputType, feedbackID) {


        if (this.editor.selectedObjects.length === 1) {
            this.bindObjectWithProperty(this.editor.selectedObjects[0], property, value, element, inputType, feedbackID)
        } else if (this.editor.selectedObjects.length > 1) {
            // multi object binding , should only be alowed for single type objects
        }

    };

    PropertiesBinder.prototype.bindObjectWithProperty = function (object, property, value, element, inputType, feedbackID) {
        //TODO do it with commands
        if (property === 'id') {
            value = value.trim();
            object.id = value;

            var isValid = this.editor.isIdUnique(value);
            if (object.id === '') {
                isValid = false;
            }
            HtmlElements.setFeedback(feedbackID, isValid);

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
        } else if (property === 'constraintX') {

            var constraint = new Constraint(object, 'x', value);
            HtmlElements.setFeedback(feedbackID, constraint.isValid);
            object.constraintX = constraint;

        } else if (property === 'constraintY') {

            var constraint = new Constraint(object, 'y', value);
            HtmlElements.setFeedback(feedbackID, constraint.isValid);
            object.constraintY = constraint;

        } else if (property === 'className') {
            object.className = value.trim() || '';
        } else if (property === 'constraintY' || property === 'constraintX') {

            if (constraint.isValid) {
                this.editor.constraints.add(constraint);
            } else {
                this.editor.constraints.remove(constraint);
            }

            this.editor.constraints.rebuildDependencyTree();
            this.editor.constraints.applyValues();
        }

        //   clickedObject.updateSize();
        // clickedObject.updateFrame();

        if (object.updateSize) {
            object.updateSize();
        }
        object.updateSensor();
        object.updateFrame();

    };


    window.PropertiesBinder = PropertiesBinder;

}(window));