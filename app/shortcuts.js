(function (window, undefined) {


    function Shortcuts(editor) {
        this.initialize(editor);
    }


    Shortcuts.prototype.initialize = function (editor) {

        this.editor = editor;

        this.kibo = new Kibo();

        this.isSpacePressed = false;
        this.isCtrlPressed = false;

        var that = this;
        this.kibo.up('ctrl z', function () {

            if (editor.isInputActive()) {
                return false;
            }

            editor.commands.undo();
            editor.deselectAllObjects();
        });

        this.kibo.up('ctrl y', function () {

            if (editor.isInputActive()) {
                return false;
            }

            editor.commands.redo();
            editor.deselectAllObjects();
        });

        this.kibo.up('delete', function () {

            if (editor.isInputActive()) {
                return false;
            }

            that.onDelete();
        });

        this.kibo.down('space', function () {
            that.isSpacePressed = true;
            app.input.setCursor('pointer');
        });

        this.kibo.up('space', function () {
            that.isSpacePressed = false;
            app.input.restoreCursor();
        });

        this.kibo.down('ctrl', function () {
            that.isCtrlPressed = true;
        });

        this.kibo.up('ctrl', function () {
            that.isCtrlPressed = false;
        });

        this.kibo.down('left', function () {
            if (!editor.isInputActive()) {
                that.moveSelectionBy(new V(-1, 0));
            }

        });

        this.kibo.down('right', function () {
            if (!editor.isInputActive()) {
                that.moveSelectionBy(new V(1, 0));
            }

        });

        this.kibo.down('up', function () {
            if (!editor.isInputActive()) {
                that.moveSelectionBy(new V(0, -1));
            }
            
        });

        this.kibo.down('down', function () {
            if (!editor.isInputActive()) {
                that.moveSelectionBy(new V(0, 1));
            }
            
        });

        this.kibo.down('ctrl c', function () {
            if (!editor.isInputActive()) {
                editor.copySelection();
            }

        });

        this.kibo.down('ctrl v', function () {
            if (!editor.isInputActive()) {
                editor.paste();
            }
        });

        this.kibo.down('ctrl up', function () {
            editor.htmlInterface.htmlTopTools.moveItemsUp();
        });

        this.kibo.down('ctrl down', function () {
            editor.htmlInterface.htmlTopTools.moveItemsDown();
        });
        
        this.kibo.down('esc', function () {
            that.onEsc();
        });

    };

    Shortcuts.prototype.moveSelectionBy = function (dragBy) {

        if (this.editor.selectedObjects.length) {
            var batch = new CommandBatch();

            for (var i = 0; i < this.editor.selectedObjects.length; i++) {
                var object = this.editor.selectedObjects[i];

                var x = object.position.x + dragBy.x;
                var y = object.position.y + dragBy.y;

                var mc = new CommandMove(object, x, y);
                batch.add(mc);

            }

            this.editor.commands.add(batch);
        }



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

        this.editor.htmlInterface.tree.build();

    };
    
    Shortcuts.prototype.onEsc = function () {
        this.editor.deselectAllObjects();
    };

    window.Shortcuts = Shortcuts;

}(window));