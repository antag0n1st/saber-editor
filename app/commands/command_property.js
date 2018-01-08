(function (window, undefined) {


    function CommandProperty(object, key, value, callback, context) {
        this.initialize(object, key, value, callback, context);
    }

    CommandProperty.prototype.initialize = function (object, key, value, callback, context) {

        this.object = object;
        this.key = key;
        this.value = value;

        this.callback = callback;
        this.context = context || this;

        this.isExecuted = false;

        this.previousValue = this.readValue();

    };

    CommandProperty.prototype.execute = function () {
        if (!this.isExecuted) {
            this.applayValue(this.value);
            this.isExecuted = true;
            if (this.callback) {
                this.callback.call(this.context);
            }
        }

    };

    CommandProperty.prototype.applayValue = function (value) {
        var keys = this.key.split('.');
        var object = this.object;
        for (var i = 0; i < keys.length - 1; i++) {
            object = object[keys[i]];
        }
        object[keys.pop()] = value;
    };

    CommandProperty.prototype.readValue = function () {
        var keys = this.key.split('.');
        var object = this.object;
        for (var i = 0; i < keys.length - 1; i++) {
            object = object[keys[i]];
        }
        return object[keys.pop()];
    };

    CommandProperty.prototype.undo = function () {
        if (this.isExecuted) {
            this.applayValue(this.previousValue);
            this.isExecuted = false;
            if (this.callback) {
                this.callback.call(this.context);
            }
        }
    };

    window.CommandProperty = CommandProperty;

}(window));