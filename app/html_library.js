(function (window, undefined) {


    function HtmlLibrary(htmlInterface, editor) {
        this.initialize(htmlInterface, editor);
    }

    HtmlLibrary.prototype.initialize = function (htmlInterface, editor) {

        this.htmlInterface = htmlInterface;
        this.editor = editor;

        this.files = [];

      

    };

    HtmlLibrary.prototype.setFiles = function (files) {
        this.files = files;
    };

    HtmlLibrary.prototype.addFiles = function (files) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            this.files.push(file);
        }
    };

    HtmlLibrary.prototype.show = function () {
        this.build();
    };

    HtmlLibrary.prototype.build = function () {

        var html = '';


        for (var i = 0; i < this.files.length; i++) {
            html += this.createImage(this.files[i]);
        }


        this.htmlInterface.imageLibraryContent.innerHTML = html;

        for (var i = 0; i < this.files.length; i++) {
            var file = this.files[i];
            var img = document.getElementById('_i_m_a_g_e_' + file.name);
            img.ondragstart = this.dragStart.bind(this);
        }
        
        
        this.htmlInterface.imageLibraryContent.style.height = (app.device.windowSize().height - 120) + 'px';
      

    };

    HtmlLibrary.prototype.dragStart = function (ev) {
        ev.dataTransfer.setData("imageID", ev.target.id);
        ev.dataTransfer.setData("action", 'dropImage');
    };

   

    HtmlLibrary.prototype.createImage = function (file) {

        var div = document.createElement("div");

        var img = document.createElement("img");
        img.id = '_i_m_a_g_e_' + file.name;
        img.src = file.data;
        img.className = "libraryItem";
        img.draggable = true;

        div.appendChild(img);
        return div.innerHTML;

    };

    window.HtmlLibrary = HtmlLibrary;

}(window));