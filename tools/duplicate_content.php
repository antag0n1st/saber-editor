<?php

define('DS', DIRECTORY_SEPARATOR);
$main_dir = getcwd() . DS . '..' . DS . 'assets';

$content = [];
$duplicates = [];

function stringContains($haystack, $needle) {
    return strpos($haystack, $needle) !== false;
}

function startsWith($haystack, $needle) {
    // search backwards starting from haystack length characters from the end
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
}

function endsWith($haystack, $needle) {
    // search forward starting from end minus needle length characters
    return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
}

function beforeComma($string) {

    return substr($string, 0, strrpos($string, '.'));
}

function listFolderFiles($dir) {
    $ffs = scandir($dir);
    global $main_dir, $content , $duplicates;
    foreach ($ffs as $ff) {
        if ($ff != '.' && $ff != '..') {

            /////////////////////////
            // files to skip

            if ((startsWith($ff, 'assets') and endsWith($ff, '.js')) || $ff === "css") { // $ff === "assets.js"
                // do nothing   
            } else {

                    if (endsWith($ff, '.png')) {
                        $basic = beforeComma($ff);
                        if(in_array($basic, $content)){
                            
                            if(!stringContains($dir,"assets\styles")){
                                $duplicates[] = $dir.DS.$ff;
                            }
                            
                        } else {
                            $content[] = $basic;
                        }
                        
                    }
            }

            ///////////////////////////////


            if (is_dir($dir . DS . $ff)) {
                // $content .= "\n";
                listFolderFiles($dir . DS . $ff);
            }
        }
    }
}

listFolderFiles($main_dir);

$main_dir = getcwd() . DS . '..' . DS .'..'.DS. 'content'.DS.'images';
listFolderFiles($main_dir);

echo "<pre>";

echo "Duplicates: \n";
print_r($duplicates);

echo "\nContent: \n";
print_r($content);