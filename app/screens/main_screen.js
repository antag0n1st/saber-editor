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
        this.isClickedInsideObject = false;
        this.isClickedInsideSameObject = false;
        this.didDrag = false;
        this.dragPosition = new V();
        this.handlesClickedObject = null;
        this.clickedObject = null;
        this.selectionRectangle = null;
        this.initialSize = null;
        this.initialRotation = 0;
        this.lastCickTime = 0;
        this._zoom = 0;
        this._zoomPoint = null;
        this._screenPosition = new V();
        this.targetDropObject = null; // the object in which we are going to drop the children.
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

    MainScreen.prototype.onGalleryObjectDropped = function (id) {

        if (id === "GenericObject") {
            var object = new GenericObject();
            object.build();
        } else if (id === "LabelObject") {
            var object = new LabelObject('Text');
            object.build();
        } else if (id === "ContainerObject") {
            var object = new ContainerObject();
            object.build();
        }


        if (object) {
            this.placeObjectOnScreen(object);
        } else {
            console.warn("You need to define an object before droping it to the screen!");
        }

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
            this.selectedObjects.push(object);
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

            if (this.targetDropObject) {
                this.targetDropObject = null;
            }

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
        
        if(this.activeLayer.visible){
            children = children ? children : this.activeLayer.children;
        } else {
            children = children ? children : [];
        }
        

        for (var i = children.length - 1; i >= 0; i--) {
            var object = children[i];

            if (!object.export || !object.visible) {
                continue;
            }



            if (this.checkSelection(x, y, width, height, object.children)) {
                // return true;
            }

            var rectangle = object.getSensor();
            if (SAT.testPolygonPolygon(this.selectionRectangle, rectangle)) {

                if (this.selectedObjects.length && this.selectedObjects[0].parent.id !== object.parent.id) {
                    continue;
                }

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
    MainScreen.prototype.checkPointInChildren = function (children, event) {

        for (var i = children.length - 1; i >= 0; i--) {

            var object = children[i];

            if (!object.export || !object.visible) {

                continue;
            }

            var obj = this.checkPointInChildren(object.children, event);
            if (obj) {
                return obj;
            }

            // check if the object is clicked

            var sensor = object.getSensor();
            if (SAT.pointInPolygon(event.point, sensor)) {

                return object;
            }
        }

        return false;
    };

    // check already selected objects for drag / resize / rotate ...
    MainScreen.prototype.checkSelectedObjects = function (children, event) {

        for (var i = children.length - 1; i >= 0; i--) {
            var object = children[i];

            if (!object.export || !object.visible) {
                continue;
            }


            if (object.checkHandles(event.point)) {

                this.handlesClickedObject = object;
                object.save();

                this.handlesClickedObject.onHandleDown(event, this);

                return true;
            }

        }

        return false;
    };



    MainScreen.prototype.onMouseDown = function (event, sender) {

        if (this.shortcuts.isSpacePressed) {
            var pp = event.point.clone();
            pp.scale(1 / this.activeLayer.factor);
            this.screenMouseOffset = V.substruction(this._screenPosition, pp);
            return;
        }

        // first reset the values
        this.didDrag = false;
        this.isClickedInsideObject = false;
        this.isClickedInsideSameObject = false;
        this.isSelectionStarted = false;
        this.mouseDownPosition.copy(event.point);
        this.handlesClickedObject = null;
        this.clickedObject = null;

        this.htmlInterface.contextMenu.close();

        // check if we are touching a handle of the selected objects
        if (this.checkSelectedObjects(this.selectedObjects, event)) {
            return;
        }

        var object = null;
        // recursivly check if an object was clicked down
        if (this.activeLayer.visible) {
            object = this.checkPointInChildren(this.activeLayer.children, event);
        }

        if (object) {

            if (this.shortcuts.isCtrlPressed) {

                if (object.isSelected) {
                    this.deselectObject(object);
                } else {
                    if (this.selectedObjects.length && this.selectedObjects[0].parent.id !== object.parent.id) {

                    } else {
                        this.addObjectToSelection(object);
                    }
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
            // for ctrl select more object this will need to change
            this.deselectAllObjects();
        }


    };

    MainScreen.prototype.onMouseMove = function (event, sender) {

        if (this.shortcuts.isSpacePressed && !this.selectionRectangle) {
            var offset = new V().copy(this.screenMouseOffset);
            var pp = event.point.clone();
            pp.scale(1 / this.activeLayer.factor);
            var p = V.addition(offset, pp);
            this.moveScreenTo(p);
            return;
        } else if (this.shortcuts.isCtrlPressed) {
            var object = null;
            if(this.activeLayer.visible){
                object = this.checkPointInChildren(this.activeLayer.children, event);
            }
            
            if (object) {

                var isSelected = false;
                for (var i = 0; i < this.selectedObjects.length; i++) {
                    if (object.id === this.selectedObjects[i].id) {
                        isSelected = true;
                    }
                }

                if (!isSelected) {
                    this.targetDropObject = object;
                    app.input.setCursor('cell');
                } else if (this.targetDropObject) {
                    this.targetDropObject = null;
                }


            } else {
                if (this.targetDropObject) {
                    this.targetDropObject = null;
                }
                app.input.restoreCursor();
            }
            return;
        } else if (this.handlesClickedObject) {
            this.handlesClickedObject.onHandleMove(event, this);
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


        app.input.restoreCursor();

        if (this.shortcuts.isCtrlPressed) {
            if (this.targetDropObject) {

                var targetAP = this.targetDropObject.getGlobalPosition();

                for (var i = 0; i < this.selectedObjects.length; i++) {
                    var object = this.selectedObjects[i];

                    var objectAP = object.getGlobalPosition();

                    object.removeFromParent();
                    this.targetDropObject.addChild(object);

                    var p = V.substruction(objectAP, targetAP);
                    object.position.set(p.x, p.y);
                }

                this.deselectAllObjects();

            }


            this.targetDropObject = null;
        }


        if (this.shortcuts.isSpacePressed && !this.selectionRectangle) {
            return;
        }

        var dt = app.pixi.ticker.lastTime - this.lastCickTime;

        if (dt < 300 && this.isClickedInsideObject) {

            // double click

            var object = this.selectedObjects[0];
            if (object.properties) {
                this.htmlInterface.activateTab('properties');
            } else {
                this.htmlInterface.activateTab('commonProperties');
            }

        } else {
            this.htmlInterface.htmlTopTools.hideTextEdit();
        }

        if (this.handlesClickedObject) {
            this.handlesClickedObject.onHandleUp(event, this);
        } else if (this.isClickedInsideObject) {


            // it can be selection if dragging did not take place
            if (!this.didDrag) {

                if (this.shortcuts.isCtrlPressed) {

                } else if (!this.selectionRectangle) {
                    this.deselectAllObjects();
                    //lets add the object to the selection
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

            if (!this.isSelectionStarted) {

                //this.checkPointInChildren(this.activeLayer.children, event);

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

    MainScreen.prototype.onRightMouseDown = function (event, sender) {

        this.htmlInterface.contextMenu.close();

        if (this.shortcuts.isSpacePressed) {
            var pp = event.point.clone();
            pp.scale(1 / this.activeLayer.factor * 5);
            this.screenMouseOffset = V.substruction(this._screenPosition, pp);

            return;
        }

    };


    MainScreen.prototype.onRightMouseMove = function (event, sender) {
        if (this.shortcuts.isSpacePressed && !this.selectionRectangle) {
            var offset = new V().copy(this.screenMouseOffset);
            var pp = event.point.clone();
            pp.scale(1 / this.activeLayer.factor * 5);
            var p = V.addition(offset, pp);
            this.moveScreenTo(p);
            return;
        }
    };

    MainScreen.prototype.onRightMouseUp = function (event, sender) {

        if (this.shortcuts.isSpacePressed && !this.selectionRectangle) {
            return;
        }

        if (this.selectedObjects.length) {
            this.htmlInterface.contextMenu.open(event.point);
        } else {

        }

    };

    MainScreen.prototype.onWheel = function (event, sender) {

        var scale = 0.1;
        if (event.point.y < 0) {
            scale = -0.1;
        }
        var p = new V(app.input.point.x, app.input.point.y);

        var toScale = this._zoom + scale;

        this.htmlInterface.htmlTopTools.zoomSlider.setValue(toScale);

        this.htmlInterface.htmlTopTools.zoomInAt(toScale, p, 200);
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

        if (this.targetDropObject) {
            this.targetDropObject.drawFrame(this.graphics);
        }


    };

    MainScreen.prototype.onResize = function (width, height) {

        this.repatable.width = width;
        this.repatable.height = height;

    };

    MainScreen.prototype.importSavedData = function () {
        var jsonData = store.get(ContentManager.baseURL + 'editor-saved-content');
        if (jsonData) {
            var data = JSON.parse(jsonData);
            this.importer.import(data);
        }

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

    MainScreen.prototype.updateAllSensors = function (children) {

        for (var i = children.length - 1; i >= 0; i--) {
            var object = children[i];
            if (object.export) {
                object.updateSensor();
                object.updateFrame();
                this.updateAllSensors(object.children);
            }
        }

    };

    MainScreen.prototype.addLayer = function (name, factor, id, isInputContent) {

        var oldP = new V().copy(this._screenPosition);

        this.moveScreenTo(new V());
        var layer = null;

        if (id) {
            for (var i = 0; i < this.content.children.length; i++) {
                var l = this.content.children[i];
                if (l.id === id) {
                    layer = l;
                    break;
                }
            }


        } else {
            layer = new Layer();

        }

        layer.name = name;
        layer.factor = factor;
        layer.isInputContent = isInputContent;
        layer.build();

        if (!id) {
            var command = new CommandAdd(layer, this.content, this);
            this.commands.add(command);
            this.htmlInterface.tree.build();
        }

        this.moveScreenTo(oldP);


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
            this.activeLayer = this.content.children[this.content.children.length - 1];
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

    MainScreen.prototype.findById = function (id, parent) {
        parent = parent || this.content;
        for (var i = 0; i < parent.children.length; i++) {
            var c = parent.children[i];
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

        if (this.selectedObjects.length > 1) {
            this.htmlInterface.htmlTopTools.showAlignButtons(this.selectedObjects);
        } else {
            this.htmlInterface.htmlTopTools.hideAlignButtons();
        }

        if (this.selectedObjects.length > 0) {
            this.htmlInterface.htmlTopTools.showZIndexButtons();
        } else {
            this.htmlInterface.htmlTopTools.hideZIndexButtons();
        }

        if (this.selectedObjects.length === 0) {
            // empty , unbind all

            if (this.htmlInterface.propertiesPanel.style.display === "block") {
                this.htmlInterface['propertiesContent'].innerHTML = '';
            } else if (this.htmlInterface.commonPropertiesPanel.style.display === "block") {
                this.htmlInterface['commonPropertiesContent'].innerHTML = '';
            }

        } else {
            if (this.htmlInterface.propertiesPanel.style.display === "block") {
                this.htmlInterface.onProperties();
            } else if (this.htmlInterface.commonPropertiesPanel.style.display === "block") {
                this.htmlInterface.onCommonProperties();
            }
        }

    };

    MainScreen.prototype.isInputActive = function () {
        var obj = document.activeElement;
        var isInputFocused = (obj instanceof HTMLInputElement) && obj.type == 'text';
        var isAreaFocused = (obj instanceof HTMLTextAreaElement);

        return isInputFocused || isAreaFocused;
    };

    MainScreen.prototype.isIdUnique = function (id, children, count) {

        children = children || this.content.children;
        count = count || 0;

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.id === id) {
                count++;

                if (count > 1) {
                    return count;
                }
            }

            var c = this.isIdUnique(id, child.children, count);

            if (c > 1) {
                return false;
            }
        }


        return true;

    };

    MainScreen.prototype.onSelectedObjectPropertyChange = function (property, value, element, inputType, feedbackID) {
        for (var i = 0; i < this.selectedObjects.length; i++) {
            var object = this.selectedObjects[i];
            object._onPropertyChange(this, property, value, element, inputType, feedbackID);
        }
    };



    MainScreen.prototype.blank = function () {
        // used to call it , and do nothing
    };

    window.MainScreen = MainScreen; // make it available in the main scope

}(window));