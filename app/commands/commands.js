(function (window, undefined) {


    function Commands() {
        this.initialize();
    }

    Commands.prototype.initialize = function () {

        this.commands = [];
        this.index = 0;

        this.limit = 1000;

    };

    Commands.prototype.add = function (command) {
        command.execute();
        
         if(this.index !== this.commands.length){
             this.commands.splice(this.index,this.limit);
         }
        
        this.commands.push(command);

        if (this.commands.length >= this.limit) {
            this.commands.shift();
        }
        
       

        this.index = this.commands.length;

    };
    
    Commands.prototype.lastCommand = function () {
        if(this.commands.length){
            return this.commands[this.commands.length-1];
        }
    };


    Commands.prototype.undo = function () {
        if (this.index > 0) {
            var command = this.commands[--this.index];
            command.undo();
        }
    };

    Commands.prototype.redo = function () {
        if (this.index <= this.commands.length - 1) {
            var command = this.commands[this.index++];
            if(command){
                command.execute();
            }
            
        }
    };

    window.Commands = Commands;

}(window));