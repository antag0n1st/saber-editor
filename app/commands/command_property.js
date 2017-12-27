(function (window, undefined) {


    function CommandProperty(object,key,value) {
        this.initialize(object,key,value);
    }
    
    CommandProperty.prototype.initialize = function (object,key,value) {
        
        this.object = object;
        this.key = key;
        this.value = value;
        
        this.isExecuted = false;
        
        this.previousValue = object[key];
       
    };
    
    CommandProperty.prototype.execute = function () {
        if(!this.isExecuted){
            this.object[this.key] = this.value;
            this.isExecuted = true;
        }
        
    };
    
    CommandProperty.prototype.undo = function () {
        if(this.isExecuted){
            this.object[this.key] = this.previousValue;
            this.isExecuted = false;
        }        
    };

    window.CommandProperty = CommandProperty;

}(window));