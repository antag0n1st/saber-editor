<?php

$main_dir = getcwd() . DS . '..' . DS . 'assets' . DS . 'styles';

$content = [];
$content_key = "";


function create_style_url($dir) {
    global $main_dir;
    $url = str_replace($main_dir, '', $dir);
    $url = str_replace(DS, "/", $url);
    return '../client/assets/styles' . $url . '/';
}

function listStyleFolderFiles($dir) {
    $ffs = scandir($dir);
    global $main_dir, $content, $content_key;

    // test for root dir name

    $parts = explode(DS, $dir);
    $c = count($parts);

    if ($parts[$c - 2] == "styles" and $parts[$c - 3] == "assets") {
        $content_key = $parts[$c - 1];
    }

    if ($content_key and ! isset($content[$content_key])) {
        $content[$content_key] = "";
    }

    // start looping the directories

    foreach ($ffs as $ff) {
        if ($ff != '.' && $ff != '..') {

            /////////////////////////
            // files to skip


            if (endsWith($ff, '.png')) {
                $basic = beforeComma($ff);
                $url = create_style_url($dir);
                //  $url = str_replace('assets/images', '', $url);
                $url = ltrim($url, '/');

                $content[$content_key] .= "ContentManager.add_image('" . $basic . "','" . $url . $ff . "');\n";
            }

            ///////////////////////////////


            if (is_dir($dir . DS . $ff)) {
                // $content .= "\n";
                listStyleFolderFiles($dir . DS . $ff);
            }
        }
    }
}

listStyleFolderFiles($main_dir);

foreach ($content as $key => $data) {

    if ($data) {
        $data = "Game.prototype.load_style_assets = function () {\n\n" . $data . " \n};";
        file_put_contents('..' . DS . 'assets' . DS . 'assets_'.$key.'.js', $data);
        echo '..' . DS . 'assets' . DS . 'assets_'.$key.'.js' . " GENEREATED";
        echo "\n";
    }
}

//
//
//
//
//
