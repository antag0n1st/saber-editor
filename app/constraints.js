(function (window, undefined) {


    function Constraints(editor) {
        this.initialize(editor);
    }

    Constraints.prototype.initialize = function (editor) {

        this.editor = editor;
        this.constraints = [];
        
        this._import();
        
        this.rebuildDependencyTree();
        this.applyValues();
        
    };
    
    Constraints.prototype._import = function (children) {
        
        children = children || this.editor.content.children;
        
        for (var i = 0; i < children.length; i++) {
            var c = children[i];
            
            this.add(c.constraintX);
            this.add(c.constraintY);
            
            this._import(c.children);
        }
        
    };

    Constraints.prototype.add = function (constraint) {

        if (constraint) {
            for (var i = 0; i < this.constraints.length; i++) {
                var c = this.constraints[i];
                if (c.object.id === constraint.object.id && c.propertyName === constraint.propertyName) {
                    c.parse(constraint.value);
                    return;
                }
            }

            this.constraints.push(constraint);
        }

    };

    Constraints.prototype.remove = function (constraint) {

        for (var i = this.constraints.length - 1; i >= 0; i--) {
            var c = this.constraints[i];
            if (c.object.id === constraint.object.id && c.propertyName === constraint.propertyName) {
                this.constraints.removeElement(constraint);
            }
        }

    };

    Constraints.prototype.rebuildDependencyTree = function () {

        for (var i = 0; i < this.constraints.length; i++) {
            var c = this.constraints[i];
            c.children = [];
            c.parent = this.editor.findById(c.parentID);
           
        }

        for (var j = 0; j < this.constraints.length - 1; j++) {

            var constraint = this.constraints[j];

            for (var i = j + 1; i < this.constraints.length; i++) {
                var c = this.constraints[i];

                if (constraint.parent && constraint.parent.id === c.object.id && c.propertyName === constraint.propertyName) {
                    c.children.push(constraint);
                    constraint._isRoot = false;
                } else if (c.parent && constraint.object.id === c.parent.id && c.propertyName === constraint.propertyName) {
                    constraint.children.push(c);
                    c._isRoot = false;
                }
            }

        }

    };

    Constraints.prototype.applyValues = function () {

        for (var i = 0; i < this.constraints.length; i++) {
            var c = this.constraints[i];
            if (c._isRoot) {
                // resolve from object , then all children recursivly               
                c.resolve();
                c.object[c.propertyName] = c.evaluatedValue;
                this._applyValues(c.children);
            }
        }

    };

    Constraints.prototype._applyValues = function (children) {
        for (var i = 0; i < children.length; i++) {
            var c = children[i];
            c.resolve(); 
            c.object[c.propertyName] = c.evaluatedValue;
            
            this._applyValues(c.children);
        }

    };

    window.Constraints = Constraints;

}(window));