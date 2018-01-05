(function (window, undefined) {

    function Entity(name) {
        this.initialize(name);
    }

    Entity.prototype = new Sprite();
    Entity.prototype.spriteInitialize = Entity.prototype.initialize;
    Entity.prototype.initialize = function (name) {

        this.spriteInitialize(name);
        
        this.id = '_change_it_before_use-'+PIXI.utils.uid();

        this.isSelected = false;
        this.frameSensors = [];

        this.rotationHandle = null;
        this.rotationHandleDistance = 40;

        this.padding = 0;

        this.originalPosition = new V();
        this.originalScale = new V();
        this.originalRotation = 0;

        this.canResize = true;
        this.hasFrame = true;
        
        this.type = 'Entity';
        
        this.constraintX = null;
        this.constraintY = null;
        

    };

    Entity.prototype.createFrame = function (padding, handleSize) {

        this.padding = padding;

        var circle1 = new SAT.Circle(new V(), handleSize);
        this.frameSensors.push(circle1);

        var circle2 = new SAT.Circle(new V(), handleSize);
        this.frameSensors.push(circle2);

        var circle3 = new SAT.Circle(new V(), handleSize);
        this.frameSensors.push(circle3);

        var circle4 = new SAT.Circle(new V(), handleSize);
        this.frameSensors.push(circle4);

        this.rotationHandle = new SAT.Circle(new V(), handleSize);

    };

    Entity.prototype.save = function () {
        this.originalPosition.copy(this.position);
        this.originalScale.copy(this.scale);
        this.originalRotation = this.rotation;
    };

    Entity.prototype.dragBy = function (position) {

        this.position.set(this.originalPosition.x + position.x, this.originalPosition.y + position.y);

    };

    Entity.prototype.select = function () {

        this.isSelected = true;

    };

    Entity.prototype.deselect = function () {

        this.isSelected = false;

    };

    Entity.prototype.drawFrame = function (graphics) {
        
        if(!this.hasFrame){
            return;
        }

        var p = this.getGlobalPosition();

        // DRAW FRAME
        graphics.lineStyle(2, 000000, 1);
        graphics.beginFill(0xFF700B, 0);
        graphics.moveTo(p.x + this.frameSensors[0].pos.x, p.y + this.frameSensors[0].pos.y);
        for (var i = this.frameSensors.length - 1; i >= 0; i--) {
            var s = this.frameSensors[i];
            graphics.lineTo(p.x + s.pos.x, p.y + s.pos.y);
        }
        graphics.endFill();

        // DRAW RESIZE HANDLES
        if (this.canResize) {
            graphics.beginFill(0xFFFF0B, 1);
            for (var i = 0; i < this.frameSensors.length; i++) {

                var s = this.frameSensors[i];
                graphics.drawCircle(p.x + s.pos.x, p.y + s.pos.y, s.r);

            }
            graphics.drawCircle(p.x, p.y, 6);
            graphics.endFill();
        }

        // DRAW ROTATE HANDLE
        var rh = this.rotationHandle.pos;
        graphics.beginFill(0xFFFF0B, 1);

        var rhp = new V(p.x + rh.x, p.y + rh.y);

        var d = Math.getDistance(p, rhp) - this.rotationHandleDistance;

        var st = new V();
        st.setLength(d);
        st.setAngle(this.rotation + Math.degreesToRadians(90));

        graphics.moveTo(p.x + st.x, p.y + st.y);
        graphics.lineTo(rhp.x, rhp.y);

        graphics.drawCircle(p.x + rh.x, p.y + rh.y, this.rotationHandle.r);
        graphics.endFill();

    };

    Entity.prototype.renderPolygon = function (polygon, graphics) {

        var points = polygon.points;
        var p = polygon.pos;

        graphics.moveTo(p.x + points[0].x, p.y + points[0].y);

        for (var i = points.length - 1; i >= 0; i--) {
            graphics.lineTo(p.x + points[i].x, p.y + points[i].y);
        }

    };

    Entity.prototype.checkHandles = function (point) {
        
        if(!this.hasFrame){
            return false;
        }

        var globalP = this.getGlobalPosition();
        var p = V.substruction(point, globalP);

        if (this.canResize) {
            // check resize handles
            for (var i = 0; i < this.frameSensors.length; i++) {
                var handle = this.frameSensors[i];
                if (SAT.pointInCircle(p, handle)) {
                    return 'resize';
                }
            }
        }

        if (SAT.pointInCircle(p, this.rotationHandle)) {
            return 'rotate';
        }

        return false;

    };

    Entity.prototype.updateFrame = function () {
        
        if(!this.hasFrame){
            return false;
        }

        var sensor = this.getSensor();

        var pp = new V(); // padding point
        pp.setLength(this.padding);

        for (var i = 0; i < this.frameSensors.length; i++) {

            if (i === 0) {
                pp.setAngle(this.rotation + Math.degreesToRadians(225));
            } else if (i === 1) {
                pp.setAngle(this.rotation + Math.degreesToRadians(315));
            } else if (i === 2) {
                pp.setAngle(this.rotation + Math.degreesToRadians(45));
            } else if (i === 3) {
                pp.setAngle(this.rotation + Math.degreesToRadians(135));
            }

            var cp = sensor.points[i]; // the points of the rectangle
            var s = this.frameSensors[i];
            s.pos.set(cp.x + pp.x, cp.y + pp.y);

        }

        // update rotation handle
        //  var dy =  this.height*this.scale.y;
        var rh = new V();
        var d = Math.getDistance(this.frameSensors[0].pos, this.frameSensors[3].pos) - this.scale.y * this._height * this.anchor.y;

        rh.setLength(d + this.rotationHandleDistance);
        rh.setAngle(this.rotation + Math.degreesToRadians(90));

        this.rotationHandle.pos.set(rh.x, rh.y);

    };

    Entity.prototype.basicExport = function (o) {

        o = o || {};

        o.position = {
            x: Math.roundDecimal(this.position.x, 2),
            y:  Math.roundDecimal(this.position.y, 2)
        };

        o.anchor = {
            x:  Math.roundDecimal(this.anchor.x, 2),
            y:  Math.roundDecimal(this.anchor.y, 2)
        };

        o.scale = {
            x:  Math.roundDecimal(this.scale.x, 2),
            y:  Math.roundDecimal(this.scale.y, 2)
        };

        o.rotation = Math.roundDecimal(this.rotation, 2);
        o.alpha = Math.roundDecimal(this.alpha, 2);
        o.tag = this.tag;
        o.zIndex = this.zIndex;
        o.children = [];
        o.type = this.type;
        o.id = this.id;
        
        if(this.constraintX){
            o.constraintX = this.constraintX.value;
        }
        
        if(this.constraintY){
            o.constraintY = this.constraintY.value;
        }
        
        for (var i = 0; i < this.children.length; i++) {
            var c = this.children[i];
            if(c.export){
                o.children.push(c.export());
            }
        }

        return o;

    };
    
    Entity.prototype.setBasicData = function (data) {
        this.position.set(data.position.x,data.position.y);
        this.anchor.set(data.anchor.x,data.anchor.y);
        this.scale.set(data.scale.x,data.scale.y);
        this.tag = data.tag;
        this.zIndex = data.zIndex;
        this.rotation = data.rotation;
        this.alpha = data.alpha;
        this.type = data.type;
        
        if(data.constraintX){
            this.constraintX = new Constraint(this,'x',data.constraintX);
        }
        
        if(data.constraintY){
            this.constraintY = new Constraint(this,'y',data.constraintY);
        }
        
        if(!data.id.startsWith('_change_it_before_use-')){
            this.id = data.id;
        }
        
        //TODO maybe dadd children here
    };

    Entity.prototype.export = function () {
        throw "This object needs to write an Export method";
    };
    
    Entity.prototype.build = function () {
        throw "This object needs to write a build method";
    };

    window.Entity = Entity;

}(window));