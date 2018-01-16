(function (window, undefined) {

    function GenericObject() {
        this.initialize();
    }

    GenericObject.prototype = new Entity();
    GenericObject.prototype.entityInitialize = GenericObject.prototype.initialize;
    GenericObject.prototype.initialize = function () {

        this.entityInitialize('_cube');
        this.type = 'GenericObject';
        this.centered();
        
        this.imageName = ''; // in order to prevent showing into the layer tree view

    };

    GenericObject.prototype.build = function (data) {
        
        if (data) {
            this.setBasicData(data);
            //this.setTexture(data.imageName);
        }
        
        this.enableSensor();
        this.createFrame(20, 16);
        this.updateSensor();
        this.updateFrame();

        this.deselect();

    };


    GenericObject.prototype.update = function (dt) {


    };

    GenericObject.prototype.export = function () {

        var o = this.basicExport();

        return o;

    };

    window.GenericObject = GenericObject;

}(window));