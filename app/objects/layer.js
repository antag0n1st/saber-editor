(function (window, undefined) {

    function Layer() {
        this.initialize();
    }

    Layer.prototype = new Entity();
    Layer.prototype.entityInitialize = Layer.prototype.initialize;
    Layer.prototype.initialize = function () {

        this.entityInitialize(null);

        this.name = '';
        this.factor = 1;
        this.index = 0;
        this.type = 'Layer';
        this.isActive = false;

        this.canResize = false;
        this.hasFrame = false;
        
    };

    Layer.prototype.build = function (data) {
        
        if (data) {
            this.setBasicData(data);
            
            this.name = data.name;
            this.factor = Number(data.factor);
            this.isActive = data.isActive ? true : false;
            
        }
        this.enableSensor();
        

    };


    Layer.prototype.update = function (dt) {


    };

    Layer.prototype.export = function () {

        var o = this.basicExport();
        o.name = this.name;
        o.factor = this.factor;
        o.isActive = this.isActive;
        
        o.scale.x = 1;
        o.scale.y = 1;
        o.position.x = 0;
        o.position.y = 0;

        return o;

    };

    window.Layer = Layer;

}(window));