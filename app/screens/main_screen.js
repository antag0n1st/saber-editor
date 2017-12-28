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
        this.isClickedInsideSameObject = false;
        this.didDrag = false;
        this.dragPosition = new V();
        this.clickedObject = null;
        this.selectionRectangle = null;
        this.initialSize = null;
        this.initialRotation = 0;
        this.lastCickTime = 0;
        this.handleTouchedType = '';
        this._zoom = 0;
        this._zoomPoint = null;
        this._screenPosition = new V();
        this.clipboard = null;

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
            p = V.substruction(app.input.point, cp);
            p.scale(1 / this.activeLayer.scale.x);
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
        if (this.selectedObjects.indexOf(object) === -1) {
            this.selectedObjects.push(object); //TODO check in case it is already there
            object.select();
            this.onSelectionChange();
        }
    };

    MainScreen.prototype.deselectObject = function (object) {
        if (this.selectedObjects.indexOf(object) !== -1) {
            this.selectedObjects.removeElement(object);
            object.deselect();
            this.onSelectionChange();
        }
    };

    MainScreen.prototype.deselectAllObjects = function () {

        if (this.selectedObjects.length) {

            for (var i = 0; i < this.selectedObjects.length; i++) {
                var object = this.selectedObjects[i];
                object.deselect();
            }

            this.selectedObjects = [];

            this.onSelectionChange();
        }

    };



    MainScreen.prototype.renderPolygon = function (polygon) {

        var points = polygon.points;
        var p = polygon.pos;

        this.graphics.moveTo(p.x + points[0].x, p.y + points[0].y);

        for (var i = points.length - 1; i >= 0; i--) {
            this.graphics.lineTo(p.x + points[i].x, p.y + points[i].y);
        }

    };

    // check agianst the selection rectangle
    MainScreen.prototype.checkSelection = function (x, y, width, height, children) {

        children = children ? children : this.activeLayer.children;

        for (var i = children.length - 1; i >= 0; i--) {
            var object = children[i];

            if (this.checkSelection(x, y, width, height, object.children)) {
                // return true;
            }

            var rectangle = object.getSensor();
            if (SAT.testPolygonPolygon(this.selectionRectangle, rectangle)) {
                if (!object.isSelected) {
                    object.save();
                    this.addObjectToSelection(object);
                }
            } else if (object.isSelected) {
                this.deselectObject(object);
            }
        }

    };

    // check if the point is inside some object
    MainScreen.prototype.checkPointInObject = function (children, event) {

        for (var i = children.length - 1; i >= 0; i--) {

            var object = children[i];

            var obj = this.checkPointInObject(object.children, event);
            if (obj) {
                return obj;
            }

            // check if the object is clicked

            var sensor = object.getSensor();
            if (SAT.pointInPolygon(event.point, sensor)) {

//               // this.isClickedInsideObject = true;
//               // this.clickedObject = object;
//
//                if (object.isSelected) {
//                    // we gonna drag
////                    for (var j = 0; j < this.selectedObjects.length; j++) {
////                        this.selectedObjects[j].save();
////                    }
//                } else {
//                    // select it right away
//                   // this.deselectAllObjects();
//                   // this.addObjectToSelection(object);
//                   // object.save();
//                }

                return object;
            }
        }

        return false;
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



    MainScreen.prototype.onMouseDown = function (event, sender) {

        if (this.shortcuts.isSpacePressed) {
            this.screenMouseOffset = V.substruction(this._screenPosition, event.point);

            return;
        }

        // first reset the values
        this.didDrag = false;
        this.isClickedInsideObject = false;
        this.isClickedInsideSameObject = false;
        this.isSelectionStarted = false;
        this.isHandleTouched = false;
        this.handleTouchedType = '';
        this.mouseDownPosition.copy(event.point);

        this.htmlInterface.contextMenu.close();

        if (this.checkSelectedObjects(this.activeLayer.children, event)) {
            return;
        }

        var object = this.checkPointInObject(this.activeLayer.children, event);

        if (object) {

            if (this.shortcuts.isCtrlPressed) {
                if (object.isSelected) {
                    this.deselectObject(object);
                } else {
                    this.addObjectToSelection(object);
                }
            } else {
                var isOneOfUs = false;

                for (var i = 0; i < this.selectedObjects.length; i++) {
                    var o = this.selectedObjects[i];
                    o.save();
                    if (o.id === object.id) {
                        isOneOfUs = true;
                        this.isClickedInsideObject = true;
                        this.clickedObject = object;
                    }



                }



                if (!isOneOfUs) {

                    this.deselectAllObjects();

                    object.save();
                    if (this.clickedObject && object.id === this.clickedObject.id) {
                        this.isClickedInsideSameObject = true;
                    } else {

                    }
                    this.isClickedInsideObject = true;
                    this.clickedObject = object;
                }
            }

        } else {
            this.clickedObject = null;
            // for ctrl select more object this will need to change
            this.deselectAllObjects();
        }

    };

    MainScreen.prototype.onMouseMove = function (event, sender) {

        if (this.shortcuts.isSpacePressed && !this.selectionRectangle) {
            var p = V.addition(this.screenMouseOffset, event.point);
            this.moveScreenTo(p);
            return;
        }

        if (this.shortcuts.isCtrlPressed) {
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

            var scale = distance / this.initialSize;

            this.clickedObject.scale.set(scale, scale);
            this.clickedObject.updateSensor();
            this.clickedObject.updateFrame();

        } else if (this.selectedObjects.length) {

            if (!this.isSelectionStarted) {

                // dragging

                this.didDrag = true;



                var dragBy = V.substruction(event.point, this.mouseDownPosition);
                dragBy.scale(1 / this.activeLayer.scale.x);

                for (var i = 0; i < this.selectedObjects.length; i++) {
                    var object = this.selectedObjects[i];
                    object.dragBy(dragBy);
                }

            }

        } else {
            this.isSelectionStarted = true;

        }



        if (this.isSelectionStarted) {

            // making a selection

            var width = event.point.x - this.mouseDownPosition.x;
            var height = event.point.y - this.mouseDownPosition.y;

            // quick! , start dragging this object
            this.selectionRectangle = new SAT.Box(new V(this.mouseDownPosition.x, this.mouseDownPosition.y), width, height).toPolygon();
            this.checkSelection(this.mouseDownPosition.x, this.mouseDownPosition.y, width, height);

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

                if (this.shortcuts.isCtrlPressed) {

                } else if(!this.selectionRectangle) {
                    this.deselectAllObjects();
                    this.addObjectToSelection(this.clickedObject);
                }


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

                //this.checkPointInObject(this.activeLayer.children, event);

                // this.deselectAllObjects();
            }

        }

        this.selectionRectangle = null;

        this.propertiesBinder.bindSelected();

        this.lastCickTime = app.pixi.ticker.lastTime;



    };

    MainScreen.prototype.copySelection = function () {

        if (this.selectedObjects.length) {

            this.clipboard = [];

            for (var i = 0; i < this.selectedObjects.length; i++) {
                this.clipboard.push(this.selectedObjects[i]);
            }
        }

    };

    MainScreen.prototype.paste = function () {

        if (this.clipboard && this.clipboard.length) {


            var batch = new CommandBatch();

            var copies = [];

            for (var i = 0; i < this.clipboard.length; i++) {
                var object = this.clipboard[i];
                var jsonObject = object.export();
                jsonObject.position.x += 30;
                jsonObject.position.y += 30;

                var obs = this.importer.importChildren(object.parent, [jsonObject], batch);
                copies.push(obs[0]);
            }


            this.commands.add(batch);

            this.deselectAllObjects();

            for (var i = 0; i < copies.length; i++) {
                var co = copies[i];
                this.addObjectToSelection(co);
                this.copySelection();
            }

        }

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

        var scale = 0.1;
        if (event.point.y < 0) {
            scale = -0.1;
        }
        var p = new V(app.input.point.x, app.input.point.y);

        var toScale = this._zoom + scale;

        this.htmlInterface.zoomSlider.setValue(toScale);

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

        var p = this._screenPosition;
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

        }

        this.moveScreenTo(data.screenPosition);

    };

    MainScreen.prototype.moveScreenTo = function (p) {

        var dp = V.substruction(p, this._screenPosition);
        this._screenPosition = p;
        this.repatable.tilePosition.set(p.x, p.y);

        // adjust the layers acording to their factor

        for (var i = 0; i < this.content.children.length; i++) {
            var layer = this.content.children[i];
            var np = new V().copy(dp).scale(layer.factor * layer.scale.x);
            this.adjustLayerPosition(layer, np);
        }


    };

    MainScreen.prototype.adjustLayerPosition = function (layer, np) {
        layer.position.x += np.x;
        layer.position.y += np.y;
    };

    MainScreen.prototype.zoomInAt = function (scale, zoomPoint, duration) {

        if (!this._zoomPoint) {
            this._zoomPoint = new V().copy(zoomPoint);
        }

        Actions.stopByTag('zoom');
        var zoom = this._zoom;
        scale = scale - zoom;
        new Stepper(function (step) {
            for (var i = 0; i < this.content.children.length; i++) {
                var layer = this.content.children[i];
                this.setZoom(zoom + scale * step, this._zoomPoint, layer);
            }

        }, duration, null, new Bezier(.46, .79, .79, .99), function () {

            if (this._zoom === 0) {
                this._zoomPoint = null;
            }

        }, this).run('zoom');
    };

    MainScreen.prototype.setZoom = function (scale, point, layer) {

        this._zoom = scale; // set global zoom

        var cp = new V().copy(layer.getGlobalPosition());

        var aw = point.x - cp.x;
        var ah = point.y - cp.y;

        // layer scale x
        var oz = layer.scale.x;

        var nz = 1 + (scale * layer.factor);

        var nw = (aw / oz) * nz;
        var nh = (ah / oz) * nz;

        var dx = aw - nw;
        var dy = ah - nh;

        layer.scale.set(nz);

        var np = new V(cp.x + dx, cp.y + dy);
        layer.position.set(np.x, np.y);

        this.updateAllSensors(layer.children);

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

    MainScreen.prototype.onSelectionChange = function () {
       // build the align buttons
       
       
       
       if(this.selectedObjects.length > 1){
         this.htmlInterface.showAlignButtons(this.selectedObjects);   
       } else {
           this.htmlInterface.hideAlignButtons();
       }
       
    };
    

    MainScreen.prototype.blank = function () {
        // used to call it , and do nothing
    };



    window.MainScreen = MainScreen; // make it available in the main scope

}(window));