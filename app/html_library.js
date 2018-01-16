(function (window, undefined) {


    function HtmlLibrary(displayContainer, editor, actionName) {
        this.initialize(displayContainer, editor, actionName);
    }

    HtmlLibrary.prototype.initialize = function (displayContainer, editor, actionName) {

        this.editor = editor;

        this.files = [];

        this.path = [];

        this.displayContainer = displayContainer;

        this.actionName = actionName;

    };

    HtmlLibrary.prototype.setAction = function (actionName) {
        this.actionName = actionName;
    };

    HtmlLibrary.prototype.addFiles = function (files) {
        this.files = files;
    };

    HtmlLibrary.prototype.getImagesAtPath = function () {

    };

    HtmlLibrary.prototype.show = function () {
        this.build();
    };

    HtmlLibrary.prototype.build = function () {

        var children = [];

        var files = this.files;
        for (var i = 0; i < this.path.length; i++) {
            var path = this.path[i];
            for (var j = 0; j < files.length; j++) {
                var ff = files[j];
                if (ff.children && ff.name === path) {
                    files = ff.children;
                }
            }
        }

        if (this.path.length) {

            children.push(this.createUp());
        }

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.children) {
                children.push(this.createFolder(file));
                //html += this.createFolder(file);
            } else {
                children.push(this.createImage(file));
                // html += this.createImage(file);
            }

        }

        // this.htmlInterface.imageLibraryContent.innerHTML = '';
        this.displayContainer.innerHTML = '';
        for (var i = 0; i < children.length; i++) {
            var child = children[i];

            this.displayContainer.appendChild(child);
        }


        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.children) {

            } else {
                var img = document.getElementById('_i_m_a_g_e_' + file.name);
                img.ondragstart = this.dragStart.bind(this);
            }

        }


        this.displayContainer.style.height = (app.device.windowSize().height - 120) + 'px';


    };

    HtmlLibrary.prototype.dragStart = function (ev) {
        ev.dataTransfer.setData("id", ev.target.id);
        ev.dataTransfer.setData("action", this.actionName);
    };



    HtmlLibrary.prototype.createImage = function (file) {

        var container = document.createElement("div");

        var div = document.createElement("div");
        div.className = "libraryItem";

        var img = document.createElement("img");
        img.id = '_i_m_a_g_e_' + file.name;
        img.src = file.url;
        //  img.className = "libraryItem";
        img.draggable = true;

        div.appendChild(img);

        return div;

        container.appendChild(div);
        return container.innerHTML;

    };

    HtmlLibrary.prototype.createFolder = function (file) {

        var container = document.createElement("div");

        var div = document.createElement("div");
        div.className = "libraryItem";



        var icon = document.createElement("img");
        icon.id = '_folder_' + file.name;
        icon.onclick = this.folderClick.bind(this);
        icon.src = ContentManager.baseURL + 'assets/images/folder_icon.png';
        icon['data-path'] = file.name;

        div.appendChild(icon);

        var label = document.createElement("div");
        label.innerHTML = '<label style="margin:auto;" >' + file.name + '</label>';
        div.appendChild(label);

        return div;

        container.appendChild(div);
        return container.innerHTML;

    };

    HtmlLibrary.prototype.createUp = function () {

        var container = document.createElement("div");

        var div = document.createElement("div");
        div.className = "libraryItem";

        var icon = document.createElement("img");
        icon.src = ContentManager.baseURL + 'assets/images/folder_up.png';
        icon.onclick = this.backClick.bind(this);
        div.appendChild(icon);

        return div;

        container.appendChild(div);
        return container.innerHTML;

    };

    HtmlLibrary.prototype.folderClick = function (event) {
        this.path.push(event.target['data-path']);
        this.build();
    };

    HtmlLibrary.prototype.backClick = function (event) {
        this.path.pop();
        this.build();
    };

    window.HtmlLibrary = HtmlLibrary;

}(window));