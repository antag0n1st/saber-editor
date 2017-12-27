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
                }
            }

        }).bind("move_node.jstree", function (e, data) {

            var inst = data.new_instance;

            if (data.node.type === "Layer") {

                var parent = inst.get_node('#');

                for (var i = 0; i < parent.children.length; i++) {
                    var cid = parent.children[i];
                    var layerData = inst.get_node(cid);

                    var layer = editor.findById(layerData.data.id);
                    layer.zIndex = parent.children.length - i;
                }
            } else {

                // move objects inside of them
                var node = data.node;
                var parentNode = inst.get_node(data.parent);

                var object = editor.findById(node.data.id);
                var target = editor.findById(parentNode.data.id);

                if (parentNode.data.id === object.parent.id) {
                    // it only needs to reorganize the

                    for (var i = 0; i < parentNode.children.length; i++) {
                        var cid = parentNode.children[i];
                        var layerData = inst.get_node(cid);

                        var object = editor.findById(layerData.data.id);
                        object.zIndex = parentNode.children.length - i;
                    }

                } else {
                    // add it to a new parent
                    var objectAP = object.getGlobalPosition();
                    var targetAP = target.getGlobalPosition();
                    object.removeFromParent();
                    target.addChild(object);

                    var p = V.substruction(objectAP, targetAP);
                    object.position.set(p.x, p.y);

                    //TODO calulate its relative position for the new parent


                    //object.position.set(0,0);

                    //TODO let the node be visible

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
                log(object)
                editor.addObjectToSelection(object);
            }

        });

    };

    LayersTree.prototype.createContexMenu = function () {

        var editor = this.editor;

        return {
            items: function (node) {

                var menu = {

                };

                if (node.type === 'Layer') {

                    var item = editor.findById(node.data.id);

                    menu.edit = {
                        label: "Edit",
                        action: function (data) {

                        },
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

                    },
                    icon: 'fa fa-trash'
                };

                return menu;

            }
        };
    };

    LayersTree.prototype.parseChildren = function (object) {

        var name = object.name || object.imageName || object.type;

        var data = {
            text: name,
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