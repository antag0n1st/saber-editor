
var Config = {};

/////////////

Config.game_width = 1920; // set the size of the canvas here 
Config.game_height = 1080;

Config.MODE_FLEXIBLE_WIDTH = 0; // it will scale to the same height and adjust the width acordingly
Config.MODE_FLEXIBLE_HEIGHT = 1; // use the same width , but change the height to flll the screen
Config.MODE_STRETCH = 2; // I dont know why I would use this mode
Config.MODE_CENTERED = 3; // it will preserve the aspect ratio an fit into the screen
Config.MODE_NONE = 4; // do not do anything about it
Config.MODE_PADDING = 5; // it will leave some space on the sides

Config.window_mode = Config.MODE_PADDING; // set the scaling method
Config.window_mode_mobile = null; // if you need special mode for mobile devices

Config.canvas_padding = '50 360 0 0'; // top - right - bottom - left

Config.is_sound_on = true; // switch the sound on/off
Config.debug_info = true;
Config.debug = false;
Config.should_clear_stage = true;
Config.slow_motion_factor = 1;
Config.is_game_paused = false;

Config.master_volume = 0.8;

Config.base_url = '';
Config.lang = 'en';
Config.background_color = 0x333333;

Config.ROTATION_MODE_ALLOW = 0;
Config.ROTATION_MODE_HORIZONTAL = 1;
Config.ROTATION_MODE_VERTICAL = 2;

Config.rotation_mode = Config.ROTATION_MODE_HORIZONTAL;

Config.initialScreen = 'MainScreen'; // name of the screen
Config.initialScreenArgs = []; // list of arguments to pass to the screen
