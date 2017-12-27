(function (window, undefined) {

    function RotateLayer(name) {
        this.initialize(name);
    }

    RotateLayer.prototype = new Sprite();
    RotateLayer.prototype.spriteInitialize = RotateLayer.prototype.initialize;
  
    RotateLayer.prototype.initialize = function (name) {
        this.spriteInitialize(name); // your image name
    
        this.drawingLayer = new PIXI.Graphics();
        this.addChild(this.drawingLayer);
        
        var imageName = 'rotate_device_to_portrait';
        
        if (Config.rotation_mode === Config.ROTATION_MODE_HORIZONTAL) {
            imageName = 'rotate_device_to_landscape';
        } 

        this.rotate = new Sprite(imageName);//TODO fix this in future
        this.rotate.anchor.set(0.5, 0.5);
        this.addChild(this.rotate);

        this.rotateLabel = new Label();
        this.rotateLabel.anchor.set(0.5, 0.5);
        this.rotateLabel.text_align = Label.TEXT_H_ALIGN_CENTER;
        this.rotateLabel.txt = lang("Please rotate your device");
        this.rotateLabel.font_color = "#ffffff";
        this.rotateLabel.font_size = 40;
        this.addChild(this.rotateLabel);

        this.setPositions();
    };
    
    RotateLayer.prototype.setPositions = function () {
        this.rotate.position.set(app.width / 2, app.height / 2 - 100);
        this.rotateLabel.position.set(app.width / 2, app.height / 2 + 100);
    };

    RotateLayer.prototype.onResize = function () {
        this.setPositions();
    };


    RotateLayer.prototype.update = function (dt) {
        Sprite.prototype.update.call(this, dt);

        this.drawingLayer.clear();
        this.drawingLayer.beginFill(0x000000);
        this.drawingLayer.drawRect(-50, -50, app.width + 100, app.height + 100);

    };

    window.RotateLayer = RotateLayer;

}(window));