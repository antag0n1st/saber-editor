(function (window, undefined) {


    function LayersTree(editor, htmlInterface) {
        this.initialize(editor, htmlInterface);
    }
    //LayersTree.prototype = new ParentClassName();
    //LayersTree.prototype.parentInitialize = LayersTree.prototype.initialize;
    LayersTree.prototype.initialize = function (editor, htmlInterface) {

        this.editor = editor;
        this.htmlInterface = htmlInterface;

        this.tree = null;
        this.data = null;

        var html = '<div class="big" style="margin-bottom:10px;">';
        html += '<div  data-toggle="modal" data-target="#addLayerModal" class="btn btn-info" style="width:50px; margin-right:10px;line-height:default;">';
        html += '<i class="fa fa-plus"></i></div>';
        html += '</div>';
        html += '<input class="form-control" placeholder="Search Objects" style="width: 200px" />';
        html += '<div class="btn btn-success" style="width:50px; margin-left:10px;line-height:default;">';
        html += '<i class="fa fa-search"></i> </div>';
        html += '</div>';
        html += '<div id="layersTree" style="text-align:left;"></div>';


        this.htmlInterface.layersContent.innerHTML = html;

    };

    LayersTree.prototype.build = function () {

        this.data = this.getStructure();
        var contextmenu = this.createContexMenu();

        if (this.tree) {
            var tree = $.jstree.reference(this.tree);
            tree.destroy();
        }

        var editor = this.editor;

        this.tree = $('#layersTree').jstree({
            plugins: ["dnd", "contextmenu", 'search', 'changed', 'types'],
            core: {
                data: this.data,
                check_callback: function (operation, node, parent, pos, more) {
                    if (node.type === "Layer" && parent.type !== "#") {
                        return false;
                    }

                    if (node.type !== "Layer" && parent.type === "#") {
                        return false;
                    }
                }
            },
            contextmenu: contextmenu,
            types: {
                Layer: {},
                ImageObject: {
                    icon: 'fa fa-picture-o'
                },
                LabelObject: {
                    icon: 'fa fa-font'
                },
                InputObject: {
                    icon: 'fa fa-keyboard-o'
                },
                ButtonObject: {
                    icon: 'fa fa-square-o'
                },
                ContainerObject: {
                    icon: 'fa fa-th-large'
                },
                GenericObject: {
                    icon: 'fa fa-cube'
                }
            }

        }).bind("move_node.jstree", function (e, data) {

            var inst = data.new_instance;

            if (data.node.type === "Layer") {

                var layer = editor.findById(data.node.data.id);

                var newIndex = layer.parent.children.length - data.position - 1;
                layer.parent.setChildIndex(layer, newIndex);

            } else {

                // move objects inside of them
                var node = data.node;
                var parentNode = inst.get_node(data.parent);

                var object = editor.findById(node.data.id);
                var target = editor.findById(parentNode.data.id);

                if (parentNode.data.id === object.parent.id) {
                    var newIndex = object.parent.children.length - data.position - 1;
                    object.parent.setChildIndex(object, newIndex);
                } else {
                    // add it to a new parent
                    var objectAP = object.getGlobalPosition();
                    var targetAP = target.getGlobalPosition();
                    object.removeFromParent();
                    target.addChild(object);

                    var p = V.substruction(objectAP, targetAP);
                    object.position.set(p.x, p.y);

                }


            }

        }).bind("select_node.jstree", function (evt, data) {

            var selectedNodes = [];

            for (var i = 0; i < data.selected.length; i++) {
                var sid = data.selected[i];
                var node = data.instance.get_node(sid);
                if (node.type === "Layer") {
                    continue;
                }
                selectedNodes.push(node);
            }


            editor.deselectAllObjects();

            for (var i = 0; i < selectedNodes.length; i++) {
                var sn = selectedNodes[i];
                var object = editor.findById(sn.data.id);
                if (!object || !object.visible) {
                    return;
                    //
                }
                editor.addObjectToSelection(object);
            }

            if (selectedNodes.length === 1) {
                var sn = selectedNodes[0];
                var object = editor.findById(sn.data.id);

                if (object.type !== "Layer") {
                    var p = object.getGlobalPosition();
                    if (!SAT.pointInPolygon(p, editor.getSensor())) {

                        var z = (1 - editor._zoom);

                        var dp = V.substruction(editor._screenPosition, p);
                        dp.x += app.width / 2;
                        dp.y += app.height / 2;

                        // dp.scale((1 - editor._zoom));

                        var sp = new V().copy(editor._screenPosition); //.scale(1/(1 - editor._zoom));

                        var distanceX = dp.x - sp.x;
                        var distanceY = dp.y - sp.y;

                        distanceX *= z;
                        distanceY *= z;

                        if (!Actions.isRunning('_screen_move')) {
                            new Stepper(function (step) {

                                var np = new V().copy(sp);
                                np.x += distanceX * step;
                                np.y += distanceY * step;

                                editor.moveScreenTo(np);

                            }, 800, null, new Bezier(.49, 0, .52, 1)).run('_screen_move');
                        }

                    }
                }

            }

        });

        var size = app.device.windowSize();

        var lt = document.getElementById('layersTree');
        lt.style.height = (size.height - 130) + 'px';
        lt.style.overflowY = 'auto';

        // this.htmlInterface.layersContent.style.height = "500px";

    };

    LayersTree.prototype.createContexMenu = function () {

        var editor = this.editor;

        return {
            items: function (node) {

                var menu = {

                };

                var item = editor.findById(node.data.id);

                if (node.type === 'Layer') {

                    menu.edit = {
                        label: "Edit",
                        action: function (data) {
                            //TODO
                            // edit the layer


                            $("#addLayerModal").modal('show');

                            document.getElementById('layerName').value = item.name;
                            document.getElementById('layerFactor').value = item.factor;
                            document.getElementById('layerID').value = item.id;
                            document.getElementById('layerInputContent').checked = item.isInputContent;



                        }.bind(this),
                        icon: 'fa fa-pencil'
                    };

                    menu.activate = {
                        label: "Activate",
                        action: function (data) {
                            var inst = $.jstree.reference(data.reference);
                            var node = inst.get_node(data.reference);
                            var parent = inst.get_node('#');

                            editor.activateLayer(node.data.id);

                            for (var i = 0; i < parent.children.length; i++) {
                                var cid = parent.children[i];
                                var layer = inst.get_node(cid);
                                layer.icon = 'fa fa-folder-o';
                                layer.state.opened = false;
                            }

                            node.icon = 'fa fa-check';
                            node.state.opened = true;

                            inst.redraw(true);

                        },
                        icon: 'fa fa-arrow-left',
                        _disabled: item.isActive
                    };
                }

                menu.delete = {
                    label: "Delete",
                    action: function (data) {
                        var ref = $.jstree.reference(data.reference),
                                sel = ref.get_selected();
                        if (!sel.length) {
                            return false;
                        }
                        ref.delete_node(sel);

                        var object = editor.findById(data.item.data.id);
                        var command = new CommandDelete(object, editor);
                        editor.commands.add(command);

                    },
                    icon: 'fa fa-trash',
                    data: {id: item.id}
                };

                return menu;

            }
        };
    };

    LayersTree.prototype.clickOnEye = function (e, element) {
        e.stopPropagation();

        var object = this.editor.findById(element.dataset.id);

        object.visible = !object.visible;

        element.className = element.className.replace('fa fa-eye', '');
        element.className = element.className.replace('fa fa-low-vision', '');

        element.className += object.visible ? "fa fa-eye" : "fa fa-low-vision";
        
        this.editor.deselectAllObjects();

        return false;
    };

    LayersTree.prototype.parseChildren = function (object) {

        var name = object.name || object.imageName || object.type;
        
        if(!object.id.startsWith('_change_it_before_use')){
           name = object.id; 
        }

        var visibility = '';
        visibility += '<i class="fa ' + (object.visible ? 'fa-eye' : 'fa-low-vision') + '" ';
        visibility += ' onclick="return app.navigator.currentScreen.htmlInterface.tree.clickOnEye(event,this)"  ';
        visibility += ' data-visible="' + object.visible + '" ';
        visibility += ' data-id="' + object.id + '" ';
        visibility += ' ></i> ';

        var data = {
            text: visibility + name,
            children: [],
            type: object.type,
            data: {
                id: object.id
            }
        };

        if (object.type === "Layer") {
            if (object.isActive) {
                data.state = {
                    opened: true
                };
                data.icon = 'fa fa-check';
            } else {
                data.icon = 'fa fa-folder-o';
            }
        }

        if (object.children.length) {
            for (var i = object.children.length - 1; i >= 0; i--) {
                var child = object.children[i];
                if (child.export) {
                    var cData = this.parseChildren(child);
                    data.children.push(cData);
                }

            }

        }

        return data;
    };

    LayersTree.prototype.getStructure = function () {

        var layers = this.editor.content.children;
        var treeData = [];
        for (var i = layers.length - 1; i >= 0; i--) {
            var layer = layers[i];
            var data = this.parseChildren(layer);
            data.text += ' - ' + layer.factor;
            treeData.push(data);
        }

        return treeData;

    };

    window.LayersTree = LayersTree;

}(window));