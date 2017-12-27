(function (window, undefined) {

    function MainScreen() {
        this.initialize();
    }

    MainScreen.prototype = new HScreen();
    MainScreen.prototype.screen_initialize = MainScreen.prototype.initialize;


    MainScreen.prototype.initialize = function () {

        this.screen_initialize();

        this.mouseDownPosition = new V();
        this.screenMouseOffset = new V();

        this.content = new Sprite();
        this.addChild(this.content);

        var texture = PIXI.Sprite.prototype.findTexture('repeatable_chess_pattern');
        this.repatable = new PIXI.extras.TilingSprite(texture, app.width, app.height);
        this.repatable.zIndex = -1;
        this.addChild(this.repatable);

        this.graphics = new PIXI.Graphics();
        this.graphics.zIndex = 10;
        this.addChild(this.graphics);

        ////////
        // Ctrl + Z
        this.commands = new Commands();

        /////////

      
        this.selectedObjects = []; //
        this.isSelectionStarted = false;
        this.isHandleTouched = false;
        this.isClickedInsideObject = false;
        this.didDrag = false;
        this.dragPosition = new V();
        this.clickedObject = null;
        this.selectionRectangle = null;
        this.initialSize = null;
        this.initialRotation = 0;
        this.lastCickTime = 0;
        this.handleTouchedType = '';
        this._zoom = 1;
        this._screenPosition = new V();

        this.activeLayer = null;

        ////////////////////

        this.importer = new Importer(this);

        ////////////////////
        this.htmlInterface = new HtmlInterface(this);
        this.shortcuts = new Shortcuts(this);
        this.propertiesBinder = new PropertiesBinder(this);
        this.localReader = new LocalFileReader(this);


        this.infoLabel = new Label();
        this.infoLabel.txt = 'Info';
        this.infoLabel.position.set(10, app.height - 40);
        this.addChild(this.infoLabel);

        this.addTouchable(this); // let the screen be a touchable



        // IMPORTING STUFF
        this.htmlInterface.htmlLibrary.addFiles(app.libraryImages);
        this.htmlInterface.activateTab('imageLibrary');
        this.importSavedData();
        this.setDefaultLayer();

    };

    MainScreen.prototype.onTextColorChange = function (colorHex) {
        this.clickedObject.label.style.fill = colorHex;
    };

    MainScreen.prototype.onTextAlignChange = function (e) {
        this.clickedObject.label.style.align = this.htmlInterface.textAlign.value;
        this.clickedObject.updateSize();
        this.clickedObject.updateFrame();
    };

    MainScreen.prototype.onFontSizeWheel = function (e) {
        var fontSize = (this.htmlInterface.textFontSize.value + '').replace('px', '');
        fontSize = Math.round(fontSize);
        if (e.wheelDelta > 0) {
            fontSize += 1;
        } else {
            fontSize -= 1;
        }

        fontSize = (fontSize < 10) ? 10 : fontSize;
        fontSize = (fontSize > 600) ? 600 : fontSize;

        this.clickedObject.label.style.fontSize = fontSize + 'px';
        this.clickedObject.updateSize();
        this.clickedObject.updateFrame();

        this.htmlInterface.textFontSize.value = fontSize;
    };

    MainScreen.prototype.onFontSizeKey = function (e) {

        var fontSize = (this.htmlInterface.textFontSize.value + '').replace('px', '');
        fontSize = Math.round(fontSize);
        fontSize = (fontSize < 10) ? 10 : fontSize;
        fontSize = (fontSize > 600) ? 600 : fontSize;

        this.clickedObject.label.style.fontSize = fontSize + 'px';
        this.clickedObject.updateSize();
        this.clickedObject.updateFrame();
    };

    MainScreen.prototype.onTextareaKey = function (e) {

        this.clickedObject.label.txt = this.htmlInterface.textUpdateArea.value;
        this.clickedObject.updateSize();
        this.clickedObject.updateFrame();

    };

    MainScreen.prototype.onLibraryImageDropped = function (id) {

        var object = new ImageObject(id);
        object.build();
        this.placeObjectOnScreen(object);

    };

    MainScreen.prototype.onLabelDropped = function () {

        var object = new LabelObject('Text');
        object.build();
        this.placeObjectOnScreen(object);

    };

    MainScreen.prototype.placeObjectOnScreen = function (object, p) {

        if (p) {

        } else {
            var cp = new V().copy(this.activeLayer.getGlobalPosition());
//            var x = this.activeLayer.position.x - this.content.position.x;
//            var y = this.activeLayer.position.y - this.content.position.y;
            p = V.substruction(app.input.point, cp);
//            p.x += x;
//            p.y += y;
            p.scale(1 / this._zoom);
        }

        object.position.set(p.x, p.y);

        var command = new CommandAdd(object, this.activeLayer, this);
        this.commands.add(command);

        this.deselectAllObjects();
        this.addObjectToSelection(object);

        object.updateSensor();
        object.updateFrame();


    };

    MainScreen.prototype.onFilesReaded = function (files, reader) {

        this.htmlInterface.htmlLibrary.addFiles(files);

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            ContentManager.addImage(file.name, file.data, true);
        }

        ContentManager.downloadResources(function () {

            this.htmlInterface.htmlLibrary.show();

        }, this);
    };

    MainScreen.prototype.addObjectToSelection = function (object) {
        this.selectedObjects.push(object); //TODO check in case it is already there
        object.select();
    };

    MainScreen.prototype.deselectObject = function (object) {
        this.selectedObjects.removeElement(object);
        object.deselect();
    };

    MainScreen.prototype.deselectAllObjects = function () {

        for (var i = 0; i < this.selectedObjects.length; i++) {
            var object = this.selectedObjects[i];
            object.deselect();
        }

        this.selectedObjects = [];

    };

    MainScreen.prototype.checkSelection = function (x, y, width, height,children) {
        
        children = children ? children : this.activeLayer.children;

        

         for (var i = children.length - 1; i >= 0; i--) {
            var object = children[i];

            if (this.checkSelection(x, y, width, height,object.children)) {
                return true;
            }

            var rectangle = object.getSensor();
            if (SAT.testPolygonPolygon(this.selectionRectangle, rectangle)) {
                if (!object.isSelected) {
                    this.addObjectToSelection(object);
                }
            } else {
                this.deselectObject(object);
            }
            return true;
        }
        
        return false;

    };

    MainScreen.prototype.renderPolygon = function (polygon) {

        var points = polygon.points;
        var p = polygon.pos;

        this.graphics.moveTo(p.x + points[0].x, p.y + points[0].y);

        for (var i = points.length - 1; i >= 0; i--) {
            this.graphics.lineTo(p.x + points[i].x, p.y + points[i].y);
        }

    };

    MainScreen.prototype.onMouseDown = function (event, sender) {

        if (this.shortcuts.isSpacePressed) {
            this.screenMouseOffset = V.substruction(this.content.position, event.point);

            return;
        }

        // first reset the values
        this.didDrag = false;
        this.isClickedInsideObject = false;
        this.isSelectionStarted = false;
        this.isHandleTouched = false;
        this.handleTouchedType = '';
        this.mouseDownPosition.copy(event.point);

        this.htmlInterface.contextMenu.close();

        if (this.checkSelectedObjects(this.activeLayer.children, event)) {
            return;
        }

        this.checkForSelection(this.activeLayer.children,event);

    };

    // check already selected objects for drag / resize / rotate ...
    MainScreen.prototype.checkSelectedObjects = function (children, event) {

        for (var i = children.length - 1; i >= 0; i--) {
            var object = children[i];

            if (this.checkSelectedObjects(object.children, event)) {
                return true;
            }

            if (object.isSelected) {
                // check handles only for selected items
                this.handleTouchedType = object.checkHandles(event.point);

                if (this.handleTouchedType) {

                    this.isHandleTouched = true;
                    this.clickedObject = object;
                    object.save();

                    if (this.handleTouchedType === 'rotate') {
                        this.initialRotation = object.rotation;
                    } else if (this.handleTouchedType === 'resize') {
                        var w = object._width / 2;
                        var h = object._height / 2;
                        this.initialSize = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));

                    }

                    return true;
                }
            }

        }

        return false;
    };
    
    MainScreen.prototype.checkForSelection = function (children, event) {
        for (var i = children.length - 1; i >= 0; i--) {
            var object = children[i];

            if (this.checkForSelection(object.children, event)) {
                return true;
            }

            // check if the object is clicked

            var sensor = object.getSensor();
            if (SAT.pointInPolygon(event.point, sensor)) {

                this.isClickedInsideObject = true;
                this.clickedObject = object;

                if (object.isSelected) {
                    // we gonna drag
                    for (var j = 0; j < this.selectedObjects.length; j++) {
                        this.selectedObjects[j].save();
                    }
                } else {
                    // select it right away
                    this.deselectAllObjects();
                    this.addObjectToSelection(object);
                    object.save();
                }

                return true;
            }
        }
        
        return false;
    };

    MainScreen.prototype.onMouseMove = function (event, sender) {

        if (this.shortcuts.isSpacePressed && !this.selectionRectangle) {
            var p = V.addition(this.screenMouseOffset, event.point);
            this.moveScreenTo(p);
            return;
        }

        if (this.handleTouchedType === 'rotate') {

            var gp = this.clickedObject.getGlobalPosition();

            var r = Math.getAngle(event.point, gp) + Math.degreesToRadians(90);

            var values = [Math.degreesToRadians(0), Math.degreesToRadians(90), Math.degreesToRadians(180), Math.degreesToRadians(270)];

            r = this.snapTo(r, values, Math.degreesToRadians(5));

            this.clickedObject.rotation = r;
            this.clickedObject.updateSensor();
            this.clickedObject.updateFrame();

        } else if (this.handleTouchedType === 'resize') {

            // 20 is the padding
            var gp = this.clickedObject.getGlobalPosition();

            // find the center
            var o = this.clickedObject;
            gp.x += -o.anchor.x * o._width * o.scale.x + o._width / 2 * o.scale.x;
            gp.y += -o.anchor.y * o._height * o.scale.y + o._height / 2 * o.scale.y;

            var distance = Math.getDistance(event.point, gp) - 20;
            // log(distance)

            var scale = distance / this.initialSize;

            this.clickedObject.scale.set(scale, scale);
            this.clickedObject.updateSensor();
            this.clickedObject.updateFrame();

        } else if (!this.isClickedInsideObject) {

            this.isSelectionStarted = true;

            var width = event.point.x - this.mouseDownPosition.x;
            var height = event.point.y - this.mouseDownPosition.y;
          
            // quick! , start dragging this object
            this.selectionRectangle = new SAT.Box(new V(this.mouseDownPosition.x, this.mouseDownPosition.y), width, height).toPolygon();
           // log(this.selectionRectangle.pos)
            this.checkSelection(this.mouseDownPosition.x, this.mouseDownPosition.y, width, height);

        } else {

            this.didDrag = true;

            var dragBy = V.substruction(event.point, this.mouseDownPosition);
            dragBy.scale(1 / this._zoom);

            for (var i = 0; i < this.selectedObjects.length; i++) {
                var object = this.selectedObjects[i];
                object.dragBy(dragBy);
            }

        }

        this.propertiesBinder.bindSelected();

    };

    MainScreen.prototype.onMouseUp = function (event, sender) {

        // app.input.restoreCursor();

        if (this.shortcuts.isSpacePressed && !this.selectionRectangle) {
            return;
        }

        var dt = app.pixi.ticker.lastTime - this.lastCickTime;

        if (dt < 300 && this.isClickedInsideObject) {
            if (this.clickedObject instanceof LabelObject) {
                this.htmlInterface.showTextEdit(this.clickedObject);
            } else if (this.clickedObject instanceof ImageObject) {
                this.htmlInterface.activateTab('properties');
            }
        } else {
            this.htmlInterface.hideTextEdit();
        }

        if (this.isClickedInsideObject) {
            // it can be selection if dragging did not take place
            if (!this.didDrag) {
                this.deselectAllObjects();
                this.addObjectToSelection(this.clickedObject);
            } else {

                var batch = new CommandBatch();
                for (var i = 0; i < this.selectedObjects.length; i++) {
                    var so = this.selectedObjects[i];
                    var x = so.position.x;
                    var y = so.position.y;
                    so.position = so.originalPosition;

                    var mc = new CommandMove(so, x, y);
                    batch.add(mc);
                }
                this.commands.add(batch);
            }
        } else {

            if (this.handleTouchedType === 'resize') {

                this.initialSize = null;

                var x = this.clickedObject.scale.x;
                var y = this.clickedObject.scale.y;

                this.clickedObject.scale.set(this.clickedObject.originalScale.x, this.clickedObject.originalScale.y);

                var command = new CommandScale(this.clickedObject, x, y);
                this.commands.add(command);

            } else if (this.handleTouchedType === 'rotate') {

            } else if (!this.isSelectionStarted) {
                this.deselectAllObjects();
            }

        }

        this.selectionRectangle = null;

        this.propertiesBinder.bindSelected();

        this.lastCickTime = app.pixi.ticker.lastTime;



    };

    MainScreen.prototype.onRightMouseUp = function (event, sender) {

        this.htmlInterface.contextMenu.close();

        // first select the object
        var hasHit = false;
        for (var i = 0; i < this.objects.length; i++) {
            var object = this.objects[i];
            var sensor = object.getSensor();
            if (SAT.pointInPolygon(event.point, sensor)) {
                hasHit = true;
                if (object.isSelected) {
                    break;
                } else {
                    this.deselectAllObjects();
                    this.addObjectToSelection(object);
                    break;
                }
            }
        }

        if (hasHit) {
            this.htmlInterface.contextMenu.open(event.point);
        } else {
            this.deselectAllObjects();
        }




    };

    MainScreen.prototype.onWheel = function (event, sender) {
        var s = 0.05;
        var scale = 1;
        if (event.point.y > 0) {
            scale += s;
        } else {
            scale -= s;
        }
        var p = new V(app.input.point.x, app.input.point.y);

        var toScale = this._zoom * scale;
        this.htmlInterface.zoomSlider.setValue(toScale - 1);
//        //  log(this._zoom)
//        //  log(toScale);
        this.zoomInAt(toScale, p, 200);
    };

    MainScreen.prototype.onMouseCancel = function (event, sender) {
        this.selectionRectangle = null;
    };

    MainScreen.prototype.onShow = function () {

    };

    MainScreen.prototype.onHide = function () {

    };

    MainScreen.prototype.onAfterHide = function () {

    };

    MainScreen.prototype.onBeforeShow = function () {

    };

    MainScreen.prototype.onNote = function (eventName, data, sender) {

    };

    MainScreen.prototype.update = function (dt) {
        this.infoLabel.txt = 'x: ' + Math.round(app.input.point.x) + ' y: ' + Math.round(app.input.point.y);

        this.graphics.clear();

        // draw coordinate System

        var p = this.content.position;
        //var p = new V();

        this.graphics.lineStyle(1, 0x0000FF, 1);
        this.graphics.beginFill(0xFF700B, 1);
        this.graphics.moveTo(-2000 + p.x, p.y);
        this.graphics.lineTo(2000 + p.x, p.y);
        this.graphics.moveTo(p.x, p.y - 2000);
        this.graphics.lineTo(p.x, p.y + 2000);

        this.graphics.endFill();

        if (this.selectionRectangle) {
            // render the selection
            this.graphics.lineStyle(2, 0x0000FF, 1);
            this.graphics.beginFill(0xFF700B, 0.1);
            this.renderPolygon(this.selectionRectangle);
            this.graphics.endFill();

        }

        for (var i = 0; i < this.selectedObjects.length; i++) {
            var object = this.selectedObjects[i];
            object.drawFrame(this.graphics);
        }

        if (this.shortcuts.isSpacePressed) {
            app.input.setCursor('pointer');
        } else {
            app.input.restoreCursor();
        }

    };

    MainScreen.prototype.onResize = function (width, height) {

        this.repatable.width = width;
        this.repatable.height = height;

    };

    MainScreen.prototype.snapTo = function (value, values, tolerance) {

        for (var i = 0; i < values.length; i++) {
            var v = values[i];
            if (value < (v + tolerance) && value > (v - tolerance)) {
                return v;
            }
        }

        return value;
    };

    MainScreen.prototype.importSavedData = function () {
        var jsonData = store.get('editor-saved-content');
        var data = JSON.parse(jsonData);

        if (data && data.objects && data.objects.length) {

            this.importer.import(data.objects);

//            var batch = new CommandBatch();
//
//            for (var i = 0; i < objectsToImport.length; i++) {
//                var object = objectsToImport[i];
//                var command = new CommandAdd(object, this.content, this);
//                batch.add(command);
//            }
//
//            batch.execute();
        }

        this.moveScreenTo(data.screenPosition);

    };

    MainScreen.prototype.moveScreenTo = function (p) {
        this._screenPosition = p;
        this.content.position.set(p.x, p.y);
        this.repatable.tilePosition.set(p.x, p.y);

        // adjust the layers acording to their factor

        for (var i = 0; i < this.content.children.length; i++) {
            var layer = this.content.children[i];
            var x = -p.x + p.x * layer.factor;
            var y = -p.y + p.y * layer.factor;


            layer.position.set(x, y);
        }


    };

    MainScreen.prototype.zoomInAt = function (scale, zoomPoint, duration) {
        Actions.stopByTag('zoom');
        var zoom = this._zoom;
        scale = scale - zoom;
        new Stepper(function (step) {
            this.setZoom(zoom + scale * step, zoomPoint);
        }, duration, null, new Bezier(.46, .79, .79, .99), null, this).run('zoom');
    };

    MainScreen.prototype.setZoom = function (scale, point) {


        var cp = this.content.getGlobalPosition();

        var aw = point.x - cp.x;
        var ah = point.y - cp.y;

        var nw = aw / this._zoom * scale;
        var nh = ah / this._zoom * scale;

        var dx = nw - aw;
        var dy = nh - ah;

        var np = new V(cp.x - dx, cp.y - dy);


        this._zoom = scale;
        this.content.scale.set(this._zoom);
        this.repatable.tileScale.set(this._zoom);

        this.moveScreenTo(np);

        this.updateAllSensors(this.content.children);

    };
    
    MainScreen.prototype.updateAllSensors = function (children) {
        
         for (var i = children.length - 1; i >= 0; i--) {
            var object = children[i];
            object.updateSensor();
            object.updateFrame();
            this.updateAllSensors(object.children);
        }
        
    };

    MainScreen.prototype.addLayer = function (name, factor, index) {

        var layer = new Layer();
        layer.name = name;
        layer.factor = factor;
        layer.build();
        //  this.layers.push(layer);
        //this.placeObjectOnScreen(layer,new V());
        var command = new CommandAdd(layer, this.content, this);
        this.commands.add(command);

        this.htmlInterface.tree.build();

        //TODO onLayerAdded
        //TODO use other method , do not use placeObjectOnScreen\
        // a new command will be needed , command add layer

    };

    MainScreen.prototype.setDefaultLayer = function () {
        // if there are no layers , then we are going to create one

        if (!this.content.children.length) {
            this.addLayer('Default Layer', 1);
            this.content.children[0].isActive = true;
        }

        for (var i = 0; i < this.content.children.length; i++) {
            var layer = this.content.children[i];
            if (layer.isActive) {
                this.activeLayer = layer;
            }
        }

        if (!this.activeLayer) {
            this.activeLayer = this.content.children[0];
            ;
            this.activeLayer.isActive = true;
        }

    };

    MainScreen.prototype.activateLayer = function (id) {

        if (this.activeLayer) {
            this.activeLayer.isActive = false;
        }

        for (var i = 0; i < this.content.children.length; i++) {
            var layer = this.content.children[i];

            if (layer.id === id) {
                this.activeLayer = layer;
                this.activeLayer.isActive = true;
            }
        }
    };

    MainScreen.prototype.findById = function (id) {
        for (var i = 0; i < this.content.children.length; i++) {
            var c = this.content.children[i];
            if (c.id === id) {
                return c;
            }
            var b = this._findById(id, c.children);
            if (b) {
                return b;
            }
        }

        return null;
    };

    MainScreen.prototype._findById = function (id, children) {
        for (var i = 0; i < children.length; i++) {
            var c = children[i];
            if (c.id === id) {
                return c;
            }
            var b = this._findById(id, c.children);
            if (b) {
                return b;
            }
        }
        return null;
    };

    MainScreen.prototype.blank = function () {
        // used to call it , and do nothing
    };



    window.MainScreen = MainScreen; // make it available in the main scope

}(window));