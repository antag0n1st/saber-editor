(function (window, undefined) {


    function CommandDelete(object,editor) {
        this.initialize(object,editor);
    }

    CommandDelete.prototype.initialize = function (object,editor) {

        this.object = object;
        this.editor = editor;
        this.parent = object.parent;
        this.isExecuted = false;

    };

    CommandDelete.prototype.execute = function () {

        if (!this.isExecuted) {
            this.object.removeFromParent();
            this.object.isSelected = false;
            this.isExecuted = true;
        }

    };

    CommandDelete.prototype.undo = function () {
        if (this.isExecuted) {
            this.parent.addChild(this.object);
            if(this.object.rebuild){
                this.object.rebuild();
            }
            this.isExecuted = false;
        }

    };

    window.CommandDelete = CommandDelete;

}(window));