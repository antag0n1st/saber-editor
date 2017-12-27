// perform initial checks here

window.addEventListener("load", function () {

    Config.lang = 'en';

    PIXI.utils.skipHello();

    app = new App();
    
    app.adjustToolbars();
        

}, false);
