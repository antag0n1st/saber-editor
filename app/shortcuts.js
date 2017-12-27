(function (window, undefined) {


    function Shortcuts(editor) {
        this.initialize(editor);
    }


    Shortcuts.prototype.initialize = function (editor) {

        this.editor = editor;

        this.kibo = new Kibo();

        this.isSpacePressed = false;

        var that = this;
        this.kibo.up('ctrl z', function () {
            that.editor.commands.undo();
            that.editor.deselectAllObjects();
        });

        this.kibo.up('ctrl y', function () {
            that.editor.commands.redo();
            that.editor.deselectAllObjects();
        });

        this.kibo.up('delete', function () {
            that.onDelete();
        });

        this.kibo.down('space', function () {
            that.isSpacePressed = true;
        });

        this.kibo.up('space', function () {
            that.isSpacePressed = false;
        });
    };

    Shortcuts.prototype.onDelete = function () {

        var batch = new CommandBatch();
        for (var i = 0; i < this.editor.selectedObjects.length; i++) {
            var so = this.editor.selectedObjects[i];
            var command = new CommandDelete(so, this.editor);
            batch.add(command);
        }

        this.editor.commands.add(batch);
        this.editor.deselectAllObjects();

    };

    window.Shortcuts = Shortcuts;

}(window));