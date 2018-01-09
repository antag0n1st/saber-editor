(function (window, undefined) {


    function HtmlLibrary(htmlInterface, editor) {
        this.initialize(htmlInterface, editor);
    }

    HtmlLibrary.prototype.initialize = function (htmlInterface, editor) {

        this.htmlInterface = htmlInterface;
        this.editor = editor;

        this.files = [];

        this.path = [];


    };

    HtmlLibrary.prototype.setFiles = function (files) {
        this.files = files;
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

        var html = '';
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

        this.htmlInterface.imageLibraryContent.innerHTML = '';
        for (var i = 0; i < children.length; i++) {
            var child = children[i];

            this.htmlInterface.imageLibraryContent.appendChild(child);
        }


        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.children) {

            } else {
                var img = document.getElementById('_i_m_a_g_e_' + file.name);
                img.ondragstart = this.dragStart.bind(this);
            }

        }


        this.htmlInterface.imageLibraryContent.style.height = (app.device.windowSize().height - 120) + 'px';


    };

    HtmlLibrary.prototype.dragStart = function (ev) {
        ev.dataTransfer.setData("imageID", ev.target.id);
        ev.dataTransfer.setData("action", 'dropImage');
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