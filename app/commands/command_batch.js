(function (window, undefined) {


    function CommandBatch() {
        this.initialize();
    }
    
    CommandBatch.prototype.initialize = function () {
        
        this.commands = [];        
        this.isExecuted = false;
       
    };
    
    CommandBatch.prototype.add = function (command) {
        this.commands.push(command);      
    };
    
    CommandBatch.prototype.execute = function () {
        if(!this.isExecuted){
            for (var i = 0; i < this.commands.length; i++) {
                this.commands[i].execute();
            }
            this.isExecuted = true;
        }
        
    };
    
    CommandBatch.prototype.undo = function () {
        if(this.isExecuted){
            for (var i = 0; i < this.commands.length; i++) {
                this.commands[i].undo();
            }
            this.isExecuted = false;
        }        
    };

    window.CommandBatch = CommandBatch;

}(window));