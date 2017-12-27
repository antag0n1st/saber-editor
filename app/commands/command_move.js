(function (window, undefined) {


    function CommandMove(object,x,y) {
        this.initialize(object,x,y);
    }
    
    CommandMove.prototype.initialize = function (object,x,y) {
        
        this.object = object;
        this.x = x;
        this.y = y;
        
        this.isExecuted = false;
        
        this.previous_x = this.object.position.x;
        this.previous_y = this.object.position.y;
       
    };
    
    CommandMove.prototype.execute = function () {
        if(!this.isExecuted){
            this.object.position.set(this.x,this.y);
            this.isExecuted = true;
        }        
    };
    
    CommandMove.prototype.undo = function () {
        if(this.isExecuted){
            this.object.position.set(this.previous_x,this.previous_y);
            this.isExecuted = false;
        }        
    };

    window.CommandMove = CommandMove;

}(window));