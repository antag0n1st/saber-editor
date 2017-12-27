(function (window, undefined) {


    function HtmlContextMenu(htmlInterface, editor) {
        this.initialize(htmlInterface, editor);
    }

    HtmlContextMenu.prototype.initialize = function (htmlInterface, editor) {

        this.htmlInterface = htmlInterface;
        this.editor = editor;

    };

    HtmlContextMenu.prototype.open = function (point) {
        
        //TODO do the math to show it properly on the screen
        
        var size = app.device.windowSize();
        
        var w = size.width - 360;
        var h = size.height - 50;
        
        var x = point.x * (w/app.width) + 10;
        var y = point.y * (h/app.height) + 50;
        
        this.htmlInterface.contextMenuHtml.style.display = 'block';
        this.htmlInterface.contextMenuHtml.style.left = x + 'px';
        this.htmlInterface.contextMenuHtml.style.top = y + 'px';
    };

    HtmlContextMenu.prototype.close = function () {
        this.htmlInterface.contextMenuHtml.style.display = 'none';
    };

    window.HtmlContextMenu = HtmlContextMenu;

}(window));