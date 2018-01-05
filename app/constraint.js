(function (window, undefined) {


    function Constraint(object, property, value) {
        this.initialize(object, property, value);
    }

    Constraint.prototype.initialize = function (object, property, value) {

        this.value = value || '';
        this.isValid = false;
        this.parent = null;
        this.parentID = null;
        this.propertyName = property;
        this._originalParentID = null;
        this.children = [];
        this.evaluatedValue = null;
        this.object = object;
        this._isRoot = true;

        this.parse(this.value);

    };

    Constraint.prototype.parse = function (value) {

        this.value = value;

        if (this.value) {

            var isID = false;
            var parentID = '';
            this.isValid = true;

            for (var i = 0; i < this.value.length; i++) {
                var c = this.value[i];

                if (c === '[') {
                    isID = true;
                    parentID = '';
                } else if (c === ']') {
                    isID = false;
                    this.parentID = parentID;
                    this._originalParentID = this.parentID.replace(/\s\s+/g, '');
                } else if (isID) {
                    parentID += c;
                }

            }

            // this.isValid = this.resolve();

        } else {
            this.isValid = false;
        }

    };

    Constraint.prototype.resolve = function () {

        var evalString = this.value || '';

        if (this.parent) {
            var rx = new RegExp('\\[' + this._originalParentID + '\\]', 'g');
            evalString = evalString.replace(rx, 'this.parent');
        }

        evalString = evalString.replace(/\.width/g, '.w_idth');
        evalString = evalString.replace(/\.height/g, '.h_eight');

        evalString = evalString.replace(/width/g, 'this.object.width');
        evalString = evalString.replace(/height/g, 'this.object.height');

        evalString = evalString.replace(/\.w_idth/g, '.width');
        evalString = evalString.replace(/\.h_eight/g, '.height');

        try {

            var x = eval("'use strict'; " + evalString);

            if (typeof x === 'number') {
                if (isNaN(x)) {
                    return false;
                }
                this.evaluatedValue = x;

                return true;
            }

            return false;

        } catch (e) {

            return false;
        }

    };

    window.Constraint = Constraint;

}(window));