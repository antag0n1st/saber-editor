(function (window, undefined) {


    function HtmlInterface(editor) {
        this.initialize(editor);
    }

    HtmlInterface.prototype.initialize = function (editor) {
        this.editor = editor;

        this.htmlTopTools = new HtmlTopTools(this.editor);


        this.contextMenu = new HtmlContextMenu(this, this.editor);

        app.pixi.renderer.view.ondrop = this.canvasDrop.bind(this);
        app.pixi.renderer.view.ondragover = this.canvasAllowDrop.bind(this);

        this.tabs = ['imageLibrary', 'commonProperties', 'settings', 'layers', 'properties', 'objectsGalery'];

        this.createTabs();
        this.bindHTML();

        this.htmlLibrary = new HtmlLibrary(this.imageLibraryContent, this.editor, 'dropImage');
        this.objectsGalery = new HtmlLibrary(this.objectsGaleryContent, this.editor, 'dropObject');
        this.objectsGalery.addFiles([
            {name: "LabelObject", url: 'assets/images/_text_icon.png'},
            {name: "ContainerObject", url: 'assets/images/_container.png'},
            {name: "GenericObject", url: 'assets/images/_cube.png'}
        ]);
        //TODO set data to objects galery
        this.tree = new LayersTree(this.editor, this);

    };

    HtmlInterface.prototype.createTabs = function () {
        for (var i = 0; i < this.tabs.length; i++) {

            var name = this.tabs[i];
            this[name + 'Tab'] = document.getElementById(name + 'Tab');
            this[name + 'Panel'] = document.getElementById(name + 'Panel');
            this[name + 'Content'] = document.getElementById(name + 'Content');
            var eventName = 'on' + name.capitalize();

            if (!this[eventName]) {
                // create a default event 
                this[eventName] = function () {};
            }

            (function (name, that) {
                this[name + 'Tab'].onclick = (function () {
                    this.activateTab(name);
                }).bind(that);
            })(name, this);

        }
    };

    HtmlInterface.prototype.bindHTML = function () {

        this.htmlTopTools.bindHTML();

        // GLOBAL

        this.contextMenuHtml = document.getElementById('contextMenu');
        this.sideToolbarPanel = document.getElementById('sideToolbarPanel');

        this.localFileLoaderBtn = document.getElementById('localFileLoaderBtn');
        this.localFileLoaderBtn.onchange = this.onLocalFileLoaderBtn.bind(this);

        this.importJSONBtn = document.getElementById('importJSONBtn');
        this.importJSONBtn.onchange = this.onImportJSONBtn.bind(this);


        // SETTINGS PANEL

        this.saveContent = document.getElementById('saveContent');
        this.saveContent.onclick = this.onSaveContent.bind(this);

        this.clearAll = document.getElementById('clearAll');
        this.clearAll.onclick = this.onClearAll.bind(this);

        this.exportBtn = document.getElementById('exportBtn');
        this.exportBtn.onclick = this.onExportBtn.bind(this);

        // LAYERS

        this.addLayerBtn = document.getElementById('addLayerBtn');
        this.addLayerBtn.onclick = this.onAddLayerBtn.bind(this);

    };

    ////////////////////////////////// DRAG & DROP /////////////////////////////

    HtmlInterface.prototype.canvasAllowDrop = function (ev) {
        ev.preventDefault();
    };

    HtmlInterface.prototype.canvasDrop = function (ev) {

        ev.preventDefault();

        var p = app.input.getMousePoint(ev);
        app.input.mapPointLocation(p.x, p.y);

        var data = ev.dataTransfer;
        var action = data.getData('action');

        if (action === 'dropImage') {
            var id = data.getData('id').replace('_i_m_a_g_e_', '');
            this.editor.onLibraryImageDropped(id);
        } else if (action === 'dropLabel') {
            this.editor.onLabelDropped();
        } else if (action === 'dropObject') {
            var id = data.getData('id').replace('_i_m_a_g_e_', '');
            this.editor.onGalleryObjectDropped(id);
        }

    };

    ////////////// TAB METHODS

    HtmlInterface.prototype.hideAllPanels = function () {
        for (var i = 0; i < this.tabs.length; i++) {
            var name = this.tabs[i];
            this[name + 'Panel'].style.display = 'none';
        }
    };

    HtmlInterface.prototype.deactiveAllTabs = function () {
        for (var i = 0; i < this.tabs.length; i++) {
            var name = this.tabs[i];
            this[name + 'Tab'].className = this[name + 'Tab'].className.replace(/\bactive\b/g, "");
        }
    };

    HtmlInterface.prototype.activateTab = function (name) {
        this.deactiveAllTabs();
        this.hideAllPanels();
        this[name + 'Tab'].className += ' active';
        this[name + 'Panel'].style.display = 'block';
        this['on' + name.capitalize()]();
    };

    HtmlInterface.prototype.onImageLibrary = function () {
        this.htmlLibrary.show();
    };

    HtmlInterface.prototype.onCommonProperties = function () {
        this.editor.propertiesBinder.bindSelected();

    };

    HtmlInterface.prototype.onProperties = function () {

        if (this.editor.selectedObjects.length) {

            if (this.editor.selectedObjects.length === 1) {
                this.editor.selectedObjects[0].bindProperties(this.editor);
            }

        }

    };

    HtmlInterface.prototype.onLayers = function () {
        // create layers tree
        this.tree.build();
    };

    HtmlInterface.prototype.onObjectsGalery = function () {
        this.objectsGalery.show();
    };

    ////////////////////////////////// BIND METHODS

    // called when the clear button in the settings panel is clicked
    HtmlInterface.prototype.onClearAll = function () {
        var r = confirm("Are you sure ?");
        if (r === true) {
            this.editor.importer.clearStage();
            this.editor.setDefaultLayer();
        }
    };

    // called when the save button is clicked
    HtmlInterface.prototype.onSaveContent = function () {

        var data = this.editor.importer.export();

        var jsonString = JSON.stringify(data);
        
        store.set(ContentManager.baseURL + 'editor-saved-content', jsonString);

        toastr.success('The content was saved into browsers memory', "Local Save!");

    };

    HtmlInterface.prototype.onExportBtn = function () {
        var data = this.editor.importer.export();

        var fileName = document.getElementById('exportFileName').value;

        if (!fileName) {
            toastr.error("Please specify a file name");
            return;
        }

        if (!fileName.endsWith('.json')) {
            fileName += '.json';
            document.getElementById('exportFileName').value = fileName;
        }

        var sendData = {
            file_name: fileName,
            data: JSON.stringify(data)

        };

        ajaxPost('app/php/export.php', sendData, function (response) {
            toastr.success(response.message);
        });

    };

    HtmlInterface.prototype.onLocalFileLoaderBtn = function (e) {
        this.editor.localReader.selectFolder(e);
    };

    HtmlInterface.prototype.onImportJSONBtn = function (evt) {

        var files = evt.target.files; // FileList object        

        var importer = this.editor.importer;
        importer.clearStage();

        for (var i = 0, f; f = files[i]; i++) {

            // Only process image files.
            if (!f.name.endsWith('.json')) {
                toastr.error('Please select a JSON file!');
                break;
            }

            var reader = new FileReader();
            document.getElementById('exportFileName').value = f.name;

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    var data = JSON.parse(e.target.result);
                    importer.import(data);
                    toastr.success('File Imported with success.');
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsText(f);
        }
    };

    HtmlInterface.prototype.onAddLayerBtn = function () {
        var name = document.getElementById('layerName').value;
        var factor = document.getElementById('layerFactor').value;
        var id = document.getElementById('layerID').value;
        var isLayerInputContent = document.getElementById('layerInputContent').checked;

        if (name && factor) {

            this.editor.addLayer(name, factor, id, isLayerInputContent);

            $("#addLayerModal").modal('hide');

            document.getElementById('layerName').value = '';
            document.getElementById('layerFactor').value = '';
            document.getElementById('layerID').value = '';
            document.getElementById('layerInputContent').checked = false;
        }

    };

    /// align elements

    window.HtmlInterface = HtmlInterface;

}(window));