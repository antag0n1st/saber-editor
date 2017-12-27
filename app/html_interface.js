(function (window, undefined) {


    function HtmlInterface(editor) {
        this.initialize(editor);
    }

    HtmlInterface.prototype.initialize = function (editor) {
        this.editor = editor;

        this.htmlLibrary = new HtmlLibrary(this, this.editor);
        this.contextMenu = new HtmlContextMenu(this, this.editor);

        app.pixi.renderer.view.ondrop = this.canvasDrop.bind(this);
        app.pixi.renderer.view.ondragover = this.canvasAllowDrop.bind(this);

        this.tabs = ['imageLibrary', 'properties', 'settings', 'layers'];

        this.createTabs();
        this.bindHTML();
        
        this.tree = new LayersTree(this.editor,this);

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

        var that = this;

        // WORKING WITH LABEL

        this.labelBtn = document.getElementById('labelBtn');
        this.labelBtn.draggable = true;
        this.labelBtn.ondragstart = this.onLabelDragStart.bind(this);

        this.textUpdatePanel = document.getElementById('textUpdatePanel');
        this.textUpdateArea = document.getElementById('textUpdateArea');
        this.textUpdateArea.onkeyup = this.editor.onTextareaKey.bind(this.editor);

        this.textFontSize = document.getElementById('textFontSize');
        this.textFontFamily = document.getElementById('textFontFamily');
        this.textAlign = document.getElementById('textAlign');

        this.textFontSize.onkeyup = this.editor.onFontSizeKey.bind(this.editor);
        this.textFontSize.onwheel = this.editor.onFontSizeWheel.bind(this.editor);
        this.textAlign.onchange = this.editor.onTextAlignChange.bind(this.editor);

        this.textColorPicker = $('#colorPicker').colorpicker({
            useAlpha: false,
            customClass: 'colorpicker-2x',
            sliders: {
                saturation: {
                    maxLeft: 200,
                    maxTop: 200
                },
                hue: {
                    maxTop: 200
                },
                alpha: {
                    maxLeft: 0,
                    maxTop: 100,
                    callLeft: false,
                    callTop: false
                }}
        });

        this.textColorPicker.on('changeColor', function (e) {

            that.editor.onTextColorChange(e.color.toHex());

        });

        // ZOOM

        this.zoomSlider = new Slider('#zoomSlider', {
            ticks: [-0.8, 0, 3],
            ticks_positions: [0, 50, 100],
            value: 0,
            step: 0.1,
            tooltip_position: 'bottom',
            formatter: function (value) {
                return 'Zoom: ' + value;
            }
        });
        this.zoomSlider.on('change', this.onZoomSlider, this);

        // GLOBAL

        this.contextMenuHtml = document.getElementById('contextMenu');
        this.sideToolbarPanel = document.getElementById('sideToolbarPanel');

        this.localFileLoaderBtn = document.getElementById('localFileLoaderBtn');
        this.localFileLoaderBtn.onchange = this.onLocalFileLoaderBtn.bind(this);

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

    ///////////////////////// LABEL EDIT PANEL /////////////////////////////////

    HtmlInterface.prototype.showTextEdit = function (object) {
        var size = app.device.windowSize();

        var width = 300;
        var height = 300;
        var x = (size.width - 360) / 2 - width / 2;
        var y = size.height / 2 - height / 2;
        this.textUpdatePanel.style.left = x + 'px';
        this.textUpdatePanel.style.top = y + 'px';
        this.textUpdatePanel.style.display = 'block';

        this.textUpdateArea.value = object.label.txt;
        this.textFontSize.value = (object.label.style.fontSize + '').replace('px', '');
        this.textAlign.value = object.label.style.align;
        this.textColorPicker.colorpicker('setValue', object.label.style.fill);

        this.textUpdateArea.focus();
    };

    HtmlInterface.prototype.hideTextEdit = function () {
        this.textUpdatePanel.style.display = 'none';
    };

    ////////////////////////////////// DRAG & DROP /////////////////////////////

    HtmlInterface.prototype.onLabelDragStart = function (ev) {
        ev.dataTransfer.setData("action", 'dropLabel');
    };

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
            var imageID = data.getData('imageID');
            var id = imageID.replace('_i_m_a_g_e_', '');
            this.editor.onLibraryImageDropped(id);
        } else if (action === 'dropLabel') {
            this.editor.onLabelDropped();
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

    HtmlInterface.prototype.onProperties = function () {
        this.editor.propertiesBinder.bindSelected();
    };

    HtmlInterface.prototype.onLayers = function () {

       // create layers tree
    
     
       this.tree.build();


    };


    ////////////////////////////////////////////////////////////////////////////



    ////////////////////////////////// BIND METHODS

    // called when the clear button in the settings panel is clicked
    HtmlInterface.prototype.onClearAll = function () {
        var r = confirm("Are you sure ?");
        if (r === true) {
            this.editor.importer.clearStage();
        }
    };

    // This method is inivoked when the zoom slider is moved
    HtmlInterface.prototype.onZoomSlider = function (data) {
        this.editor.zoomInAt(1 + data.newValue, new V(app.width / 2, app.height / 2), 300);
    };

    // called when the save button is clicked
    HtmlInterface.prototype.onSaveContent = function () {

        var data = {};

        data.objects = this.editor.importer.export();
        data.screenPosition = {
            x: this.editor.content.position.x,
            y: this.editor.content.position.y
        };

        var jsonString = JSON.stringify(data);

        store.set('editor-saved-content', jsonString);

        toastr.success('The content was saved into browsers memory', "Local Save!");

    };

    HtmlInterface.prototype.onExportBtn = function () {
        var objects = this.editor.importer.export();
        log(objects);
    };

    HtmlInterface.prototype.onLocalFileLoaderBtn = function (e) {
        this.editor.localReader.selectFolder(e);
    };

    HtmlInterface.prototype.onAddLayerBtn = function () {
        var name = document.getElementById('layerName').value;
        var factor = document.getElementById('layerFactor').value;

        if (name && factor) {

            this.editor.addLayer(name, factor, 0);

            $("#addLayerModal").modal('hide');
        }



    };

    window.HtmlInterface = HtmlInterface;

}(window));