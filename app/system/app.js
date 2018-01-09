(function (window) {
    //main class
    function App() {
        this.initialize();
    }

    App.prototype.initialize = function () {

        this.width = 0; // it will have the interval width of the application screen
        this.height = 0; //it will have the interval height of the application screen

        this.canvasWidth = 0;
        this.canvasHeight = 0;

        this.windowWidth = 0;
        this.windowHeight = 0;

        this.device = new Device(this);

        var settings = {
            clearBeforeRender: Config.should_clear_stage,
            preserveDrawingBuffer: true,
            resolution: 1,
            width: this.width,
            height: this.height,
            backgroundColor: Config.background_color
        };

        this.pixi = new PIXI.Application(settings);

        this.layoutCanvas();

        this.pixi.ticker.add(this.tick, this);

        this.stage = this.pixi.stage;
        this.screen = this.pixi.screen; // width and height
        this.loader = this.pixi.loader;

        this.input = new Input(this, this.pixi.renderer.view);

        this.navigator = new HNavigator(this);
        
        this.libraryImages = [];

        this.initialLoad(function () {

            this.loadAssets();
            
            ajaxGet('app/php/library.php', function (resources) {
                
                app.libraryImages = resources;
                
                app.addToLoader(resources);
                                
                ContentManager.downloadResources(function () {
                    
                    app.navigator.currentScreen.loadingBar.setPercent(1, false);
                    
                    var screen = applyToConstructor(window[Config.initialScreen], Config.initialScreenArgs);
                    
                    timeout(function(){
                        app.navigator.add(screen);
                    },200);                    

                }, this);

            });


        });



    };
    
    App.prototype.addToLoader = function (resources) {
        
        for (var i = 0; i < resources.length; i++) {
            var resource = resources[i];
            
            if(resource.children){
                this.addToLoader(resource.children);
            } else if(resource.url) {
                ContentManager.addImage(resource.name, ContentManager.baseURL+resource.url);
            }
            
        }
        
    };

    App.prototype.initialLoad = function (callback) {

        ContentManager.addImage('_loading_bar_bg', 'initial/_loading_bar_bg.png');
        ContentManager.addImage('_loading_bar_fg', 'initial/_loading_bar_fg.png');
        ContentManager.addImage('white', 'initial/white.png');
        ContentManager.addImage('black', 'initial/black.png');
        ContentManager.addImage('rotate_device_to_landscape', 'initial/rotate_device_to_landscape.png');
        ContentManager.addImage('rotate_device_to_portrait', 'initial/rotate_device_to_portrait.png');

        ContentManager.downloadResources(function () {
            var screen = new LoadingScreen();
            app.navigator.add(screen);

            if (callback) {
                callback.call(this);
            }
            callback = null;

        }, this);

    };

    App.prototype.layoutCanvas = function () {
        document.body.appendChild(this.pixi.view);

        if (Config.window_mode !== Config.MODE_NONE) {
            this.pixi.view.style.width = this.canvasWidth + "px";
            this.pixi.view.style.height = this.canvasHeight + "px";
        }

        if (Config.window_mode === Config.MODE_CENTERED) {
            this.adjustCanvasPositionCentered(this.pixi.view);
        } else if (Config.window_mode === Config.MODE_PADDING) {
            this.adjustCanvasPositionPadding(this.pixi.view);
        }
    };

    App.prototype.tick = function (deltaTime) {

        // elapsedMS
        // deltaTime
        // FPS
        // lastTime

        var step = this.pixi.ticker.elapsedMS;
        step = step > 50 ? 50 : step;

        Actions.update(step); // update tweens

        this.navigator.update(step); // update the sceen and its objects

    };

    App.prototype.adjustCanvasPositionCentered = function (canvas) {

        var x = this.windowWidth - this.canvasWidth;
        var y = this.windowHeight - this.canvasHeight;

        canvas.style.marginLeft = Math.ceil(x / 2) + "px";
        canvas.style.marginTop = Math.ceil(y / 2) + "px";

    };

    App.prototype.adjustCanvasPositionPadding = function (canvas) {

        var canvasPadding = Config.canvas_padding.split(' ');

        canvas.style.marginLeft = Math.ceil(canvasPadding[3]) + "px";
        canvas.style.marginTop = Math.ceil(canvasPadding[0]) + "px";

    };


    App.prototype.handleVisibility = function () {

    };

    App.prototype.resize = function () {

        this.device.calculateSizes();

        this.pixi.view.style.width = Math.ceil(this.canvasWidth) + "px";
        this.pixi.view.style.height = Math.ceil(this.canvasHeight) + "px";
        this.pixi.renderer.resize(this.width, this.height);

        if (Config.window_mode === Config.MODE_CENTERED) {
            this.adjustCanvasPositionCentered(this.pixi.view);
        } else if (Config.window_mode === Config.MODE_PADDING) {
            this.adjustCanvasPositionPadding(this.pixi.view);
        }

        for (var i = 0; i < this.navigator.screens.length; i++) {
            var screen = this.navigator.screens[i];
            // screen.set_size(this.width, this.height);
            screen._onResize(this.width, this.height);
        }

        this.adjustToolbars();

    };

    App.prototype.adjustToolbars = function () {
        var topToolbar = document.getElementById('topToolbar');
        var sideToolbar = document.getElementById('sideToolbar');

        var canvasPadding = Config.canvas_padding.split(' ');

        topToolbar.style.width = (app.device.windowSize().width - canvasPadding[1]) + 'px';
        topToolbar.style.height = canvasPadding[0] + 'px';

        sideToolbar.style.width = canvasPadding[1] + 'px';
        sideToolbar.style.height = (app.device.windowSize().height) + 'px';
    };

    App.prototype.checkRotation = function () {

    };

    App.prototype.showRotateDevice = function () {

    };

    App.prototype.hideRotateDevice = function () {

    };

    window.App = App;

}(window));
