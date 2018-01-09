(function (window, undefined) {

    function ImageObject(name) {
        this.initialize(name);
    }

    ImageObject.prototype = new Entity();
    ImageObject.prototype.entityInitialize = ImageObject.prototype.initialize;
    ImageObject.prototype.initialize = function (name) {

        this.entityInitialize(name);
        this.type = 'ImageObject';
        this.centered();



    };

    ImageObject.prototype.build = function (data) {
        
        if (data) {
            this.setBasicData(data);
            this.setTexture(data.imageName);
        }
        
        this.enableSensor();
        this.createFrame(20, 16);
        this.updateSensor();
        this.updateFrame();

        this.deselect();

    };


    ImageObject.prototype.update = function (dt) {


    };

    ImageObject.prototype.export = function () {

        var o = this.basicExport();
        o.imageName = this.imageName;

        return o;

    };

    window.ImageObject = ImageObject;

}(window));