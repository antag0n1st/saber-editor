(function (window, undefined) {


    function CommandAdd(object,parent,editor) {
        this.initialize(object,parent,editor);
    }

    CommandAdd.prototype.initialize = function (object,parent,editor) {

        this.object = object;
        this.editor = editor;
        this.parent = parent;
        this.isExecuted = false;

    };

    CommandAdd.prototype.execute = function () {

        if (!this.isExecuted) {
            this.parent.addChild(this.object);
            this.isExecuted = true;
        }

    };

    CommandAdd.prototype.undo = function () {
        if (this.isExecuted) {
            this.object.removeFromParent();            
            this.object.isSelected = false;
            this.isExecuted = false;
        }

    };

    window.CommandAdd = CommandAdd;

}(window));