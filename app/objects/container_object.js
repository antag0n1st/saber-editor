(function (window, undefined) {

    function ContainerObject() {
        this.initialize();
    }

    ContainerObject.prototype = new Entity();
    ContainerObject.prototype.entityInitialize = ContainerObject.prototype.initialize;
    ContainerObject.prototype.initialize = function () {

        this.entityInitialize('_container');
        this.type = 'ContainerObject';
        this.centered();
        
        this.imageName = '';

    };

    ContainerObject.prototype.build = function (data) {
        
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


    ContainerObject.prototype.update = function (dt) {


    };

    ContainerObject.prototype.export = function () {

        var o = this.basicExport();
        return o;

    };

    window.ContainerObject = ContainerObject;

}(window));