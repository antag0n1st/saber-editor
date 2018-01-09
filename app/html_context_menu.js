(function (window, undefined) {


    function HtmlContextMenu(htmlInterface, editor) {
        this.initialize(htmlInterface, editor);
    }

    HtmlContextMenu.prototype.initialize = function (htmlInterface, editor) {

        this.htmlInterface = htmlInterface;
        this.editor = editor;

    };

    HtmlContextMenu.prototype.build = function (objects) {



        var html = '';

        html += '<div id="contextMenu" class="dropdown bootstrapMenu">';
        html += '<ul class="dropdown-menu" style="position:static;display:block;font-size:0.9em;">';

        html += '<li role="presentation" data-action="editName" >';
        html += '<a id="contextEdit" href="#" role="menuitem">';
        html += '<i class="fa fa-fw fa-lg fa-pencil"></i> ';
        html += '<span class="actionName">Edit</span>';
        html += '</a>';
        html += '</li>';

        html += '<li role="presentation" data-action="convertToButton" >';
        html += '<a id="contextConvertToButton" href="#" role="menuitem">';
        html += '<i class="fa fa-fw fa-lg fa-exchange"></i> ';
        html += '<span class="actionName">Convert To Btn</span>';
        html += '</a>';
        html += '</li>';
        
        html += '<li role="presentation" data-action="convertToInput" >';
        html += '<a id="contextConvertToInput" href="#" role="menuitem">';
        html += '<i class="fa fa-fw fa-lg fa-exchange"></i> ';
        html += '<span class="actionName">Convert To Input</span>';
        html += '</a>';
        html += '</li>';

        html += '</ul>';
        html += ' </div>';

        var container = document.createElement("div");
        container.innerHTML = html;
        var cm = container.getElementsByTagName('div')[0];
        var oldContextMenu = document.getElementById('contextMenu');
        if (oldContextMenu) {
            document.body.removeChild(oldContextMenu);
        }
        document.body.appendChild(cm);

        // bind events here

        var contextEdit = document.getElementById('contextEdit');
        contextEdit.onclick = this.onContextEditBtn.bind(this);

        var contextConvertToButton = document.getElementById('contextConvertToButton');
        contextConvertToButton.onclick = this.onContextConvertToBtn.bind(this);
        
        var contextConvertToInput = document.getElementById('contextConvertToInput');
        contextConvertToInput.onclick = this.onContextConvertToInput.bind(this);

        this.htmlInterface.contextMenuHtml = document.getElementById('contextMenu');



        //        <li role="presentation" data-action="editDescription" class="disabled">
        //            <a href="#" role="menuitem">
        //                <i class="fa fa-fw fa-lg fa-pencil"></i> 
        //                <span class="actionName">Edit description</span>
        //            </a>
        //        </li>

        //        <li role="presentation" class="noActionsMessage disabled" style="display: none;">
        //            <a href="#" role="menuitem">
        //                <span>No available actions</span>
        //            </a>
        //        </li>

        //        <li class="divider"></li>

        //        <li role="presentation" data-action="setEditable" class="" style="">
        //            <a href="#" role="menuitem">
        //                <i class="fa fa-fw fa-lg fa-unlock"></i> 
        //                <span class="actionName">Set editable</span>
        //            </a>
        //        </li>


        //        <li role="presentation" class="noActionsMessage disabled" style="display: none;">
        //            <a href="#" role="menuitem">
        //                <span>No available actions</span>
        //            </a>
        //        </li>



    };

    HtmlContextMenu.prototype.open = function (point) {

        //TODO do the math to show it properly on the screen

        this.build(this.editor.selectedObjects);

        var size = app.device.windowSize();

        var w = size.width - 360;
        var h = size.height - 50;

        var x = point.x * (w / app.width) + 10;
        var y = point.y * (h / app.height) + 50;

        this.htmlInterface.contextMenuHtml.style.display = 'block';
        this.htmlInterface.contextMenuHtml.style.left = x + 'px';
        this.htmlInterface.contextMenuHtml.style.top = y + 'px';

    };

    HtmlContextMenu.prototype.close = function () {

        if (this.htmlInterface.contextMenuHtml) {
            this.htmlInterface.contextMenuHtml.style.display = 'none';
        }

    };

    HtmlContextMenu.prototype.onContextEditBtn = function () {

        this.close();

        // only if the object is a label

        this.htmlInterface.htmlTopTools.showTextEdit(this.editor.selectedObjects[0]);

    };

    HtmlContextMenu.prototype.onContextConvertToBtn = function () {
        var object = this.editor.selectedObjects[0];
        
        this.editor.deselectAllObjects();

        var imageName = object.imageName;
        var p = new V().copy(object.position);

        var btn = new ButtonObject(imageName);
        btn.position = p;
        
        btn.build();

        var batch = new CommandBatch();

        var deleteCommand = new CommandDelete(object, this.editor);
        var addCommand = new CommandAdd(btn, object.parent, this.editor);
        
        batch.add(addCommand);
        batch.add(deleteCommand);

        this.editor.commands.add(batch);
        
        this.editor.deselectAllObjects();
        this.editor.addObjectToSelection(btn);

        this.close();

    };
    
    HtmlContextMenu.prototype.onContextConvertToInput = function () {
        var object = this.editor.selectedObjects[0];
        
        this.editor.deselectAllObjects();

        var imageName = object.imageName;
        var p = new V().copy(object.position);

        var input = new InputObject(imageName);
        input.position = p;
        
        input.build();

        var batch = new CommandBatch();

        var deleteCommand = new CommandDelete(object, this.editor);
        var addCommand = new CommandAdd(input, object.parent, this.editor);
        
        batch.add(addCommand);
        batch.add(deleteCommand);

        this.editor.commands.add(batch);
        
        this.editor.deselectAllObjects();
        this.editor.addObjectToSelection(input);

        this.close();
    };

    

    window.HtmlContextMenu = HtmlContextMenu;

}(window));