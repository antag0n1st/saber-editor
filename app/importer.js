(function (window, undefined) {


    function Importer(editor) {
        this.initialize(editor);
    }
    //Importer.prototype = new ParentClassName();
    //Importer.prototype.parentInitialize = Importer.prototype.initialize;
    Importer.prototype.initialize = function (editor) {
        // this.parentInitialize();
        
        this.editor = editor;
    };
    
    Importer.prototype.clearStage = function(){
       
        for (var i = 0; i < this.editor.children.length; i++) {
            var o = this.editor.children[i];
            o.removeFromParent();
        }
        
        this.editor.deselectAllObjects();        
        this.editor.selectedObjects = [];
        
    };
    
    Importer.prototype.import = function(objects){
        
        var batch = new CommandBatch();
        
        for (var i = 0; i < objects.length; i++) {
            var o = objects[i];
            var object = new window[o.type]();
            object.build(o);
            
            var command = new CommandAdd(object, this.editor.content, this.editor);
            batch.add(command);
           
            if(o.children.length){
                this.importChildren(object,o.children,batch)
            }
           
        }
        
        batch.execute();
        
       //this.editor.commands.add(batch);
        
    };
    
    Importer.prototype.importChildren = function(parent,children,batch){
        var unwrappedObjects = [];
        for (var i = 0; i < children.length; i++) {
            var o = children[i];
            
            var object = new window[o.type]();
            object.build(o);
            
            var command = new CommandAdd(object, parent, this.editor);
            batch.add(command);
           
            if(o.children.length){
                this.importChildren(object,o.children,batch);
            }
            
            unwrappedObjects.push(object);
            
        }
        return unwrappedObjects;
    };
    
    Importer.prototype.export = function(){
        
        var exportedObjects = [];
        
        for (var i = 0; i < this.editor.content.children.length; i++) {
            var layer =this.editor.content.children[i];
            exportedObjects.push(layer.export());
        }
        
        return exportedObjects;
        
    };

    window.Importer = Importer;

}(window));