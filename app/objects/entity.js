(function (window, undefined) {

    function Entity(name) {
        this.initialize(name);
    }

    Entity.prototype = new Sprite();
    Entity.prototype.spriteInitialize = Entity.prototype.initialize;
    Entity.prototype.initialize = function (name) {

        this.spriteInitialize(name);

        this.id = '_change_it_before_use-' + PIXI.utils.uid();

        this.isSelected = false;
        this.frameSensors = [];

        this.rotationHandle = null;
        this.rotationHandleDistance = 40;

        this.padding = 0;

        this.originalPosition = new V();
        this.originalScale = new V();
        this.originalRotation = 0;

        this.initialSize = 0;

        this.canResize = true;
        this.hasFrame = true;

        this.type = 'Entity';

        this.handleTypeTouched = '';

        this.constraintX = null;
        this.constraintY = null;
        
        this.className = '';


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

        if (!this.hasFrame) {
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

    Entity.prototype.updateFrame = function () {

        if (!this.hasFrame) {
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

        var rh = new V();
        var d = Math.getDistance(this.frameSensors[0].pos, this.frameSensors[3].pos) - this.scale.y * this._height * this.anchor.y;

        rh.setLength(d + this.rotationHandleDistance);
        rh.setAngle(this.rotation + Math.degreesToRadians(90));

        this.rotationHandle.pos.set(rh.x, rh.y);

    };

    Entity.prototype.checkHandles = function (point) {

        if (!this.hasFrame) {
            return false;
        }

        var globalP = this.getGlobalPosition();
        var p = V.substruction(point, globalP);

        if (this.canResize) {
            // check resize handles
            for (var i = 0; i < this.frameSensors.length; i++) {
                var handle = this.frameSensors[i];
                if (SAT.pointInCircle(p, handle)) {
                    this.handleTypeTouched = 'resize';
                    return true;
                }
            }
        }

        if (SAT.pointInCircle(p, this.rotationHandle)) {
            this.handleTypeTouched = 'rotate';
            return true;
        }

        return false;

    };

    Entity.prototype.onHandleDown = function (event, editor) {

        if (this.handleTypeTouched === 'resize') {
            this._downResize(event, editor);
        }

    };

    Entity.prototype._downResize = function (event, editor) {
        var w = this._width / 2;
        var h = this._height / 2;
        this.initialSize = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
    };

    Entity.prototype.onHandleMove = function (event, editor) {

        if (this.handleTypeTouched === 'rotate') {
            this._moveRotate(event, editor);
        } else if (this.handleTypeTouched === 'resize') {
            this._moveResize(event, editor);
        }

    };

    Entity.prototype._moveResize = function (event, editor) {
        var gp = this.getGlobalPosition();

        // find the center
        var o = this;
        gp.x += -o.anchor.x * o._width * o.scale.x + o._width / 2 * o.scale.x;
        gp.y += -o.anchor.y * o._height * o.scale.y + o._height / 2 * o.scale.y;

        // 20 is the padding
        var distance = Math.getDistance(event.point, gp) - 20;

        var scale = distance / this.initialSize;

        this.scale.set(scale, scale);
        this.updateSensor();
        this.updateFrame();
    };

    Entity.prototype._moveRotate = function (event, editor) {
        var gp = this.getGlobalPosition();

        var r = Math.getAngle(event.point, gp) + Math.degreesToRadians(90);

        var values = [Math.degreesToRadians(0), Math.degreesToRadians(90), Math.degreesToRadians(180), Math.degreesToRadians(270)];

        r = this.snapTo(r, values, Math.degreesToRadians(5));

        this.rotation = r;
        this.updateSensor();
        this.updateFrame();
    };

    Entity.prototype.onHandleUp = function (event, editor) {

        if (this.handleTypeTouched === 'resize') {
            this._upResize(event, editor);
        } else if (this.handleTypeTouched === 'rotate') {
            this._upRotate(event, editor);
        }

    };

    Entity.prototype._upRotate = function (event, editor) {

        var nR = this.rotation;
        this.rotation = this.originalRotation;
        var command = new CommandProperty(this, 'rotation', nR, function () {
            this.updateSensor();
            this.updateFrame();
        }, this);
        editor.commands.add(command);
    };

    Entity.prototype._upResize = function (event, editor) {
        this.initialSize = null;

        var x = this.scale.x;
        var y = this.scale.y;

        this.scale.set(this.originalScale.x, this.originalScale.y);

        var command = new CommandScale(this, x, y);
        editor.commands.add(command);
    };

    Entity.prototype.snapTo = function (value, values, tolerance) {

        for (var i = 0; i < values.length; i++) {
            var v = values[i];
            if (value < (v + tolerance) && value > (v - tolerance)) {
                return v;
            }
        }

        return value;
    };

    Entity.prototype.basicExport = function (o) {

        o = o || {};

        o.position = {
            x: Math.roundDecimal(this.position.x, 2),
            y: Math.roundDecimal(this.position.y, 2)
        };

        o.anchor = {
            x: Math.roundDecimal(this.anchor.x, 2),
            y: Math.roundDecimal(this.anchor.y, 2)
        };

        o.scale = {
            x: Math.roundDecimal(this.scale.x, 2),
            y: Math.roundDecimal(this.scale.y, 2)
        };

        o.rotation = Math.roundDecimal(this.rotation, 2);
        o.alpha = Math.roundDecimal(this.alpha, 2);
        o.tag = this.tag;
        o.zIndex = this.zIndex;
        o.children = [];
        o.type = this.type;
        o.id = this.id;
        o.className = this.className;
        o.visible = this.visible;

        if (this.properties) {
            o.properties = this.properties;
        }

        if (this.constraintX) {
            o.constraintX = this.constraintX.value;
        }

        if (this.constraintY) {
            o.constraintY = this.constraintY.value;
        }

        for (var i = 0; i < this.children.length; i++) {
            var c = this.children[i];
            if (c.export) {
                o.children.push(c.export());
            }
        }

        return o;

    };

    Entity.prototype.setBasicData = function (data) {

        this.position.set(data.position.x, data.position.y);
        this.anchor.set(data.anchor.x, data.anchor.y);
        this.scale.set(data.scale.x, data.scale.y);
        this.tag = data.tag;
        this.zIndex = data.zIndex;
        this.rotation = data.rotation;
        this.alpha = data.alpha;
        this.type = data.type;
        this.className = data.className || '';
        this.visible = (data.visible === undefined) ? true : data.visible;

        if (data.properties) {

            for (var key in data.properties) {
                if (data.properties.hasOwnProperty(key)) {
                    this.properties[key] = data.properties[key];
                }
            }

        }

        if (data.constraintX) {
            this.constraintX = new Constraint(this, 'x', data.constraintX);
        }

        if (data.constraintY) {
            this.constraintY = new Constraint(this, 'y', data.constraintY);
        }

        if (!data.id.startsWith('_change_it_before_use-')) {
            this.id = data.id;
        }

    };

    Entity.prototype.bindProperties = function (editor) {
        // it will be overwritten
    };

    Entity.prototype._onPropertyChange = function (editor, property, value, element, inputType, feedbackID) {
        // it will be overwritten
        if(this.onPropertyChange){
            this.onPropertyChange(editor, property, value, element, inputType, feedbackID);
        }
        
        if(this.constraintX || this.constraintY){
            editor.constraints.applyValues();
        }
        
    };

    Entity.prototype.export = function () {
        throw "This object needs to write an Export method";
    };

    Entity.prototype.build = function () {
        throw "This object needs to write a build method";
    };

    window.Entity = Entity;

}(window));