(function (window, undefined) {


    function CommandScale(object, x, y) {
        this.initialize(object, x, y);
    }

    CommandScale.prototype.initialize = function (object, x, y) {

        this.object = object;
        this.scaleX = x;
        this.scaleY = y;

        this.isExecuted = false;

        this.oldScaleX = this.object.scale.x;
        this.oldScaleY = this.object.scale.y;

    };

    CommandScale.prototype.execute = function () {
        if (!this.isExecuted) {
            this.object.scale.set(this.scaleX, this.scaleY);
            this.object.updateSensor();
            this.object.updateFrame();
            this.isExecuted = true;
        }
    };

    CommandScale.prototype.undo = function () {
        if (this.isExecuted) {
            this.object.scale.set(this.oldScaleX, this.oldScaleY);
            this.object.updateSensor();
            this.object.updateFrame();
            this.isExecuted = false;
        }
    };

    window.CommandScale = CommandScale;

}(window));