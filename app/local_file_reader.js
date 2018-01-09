(function (window, undefined) {


    function LocalFileReader(delegate) {
        this.initialize(delegate);
    }

    // DELEGATE
    // - onFilesReaded(files,reader)
    LocalFileReader.prototype.initialize = function (delegate) {

        this.delegate = delegate;

        this.filesToRead = 0;
        this.filesReaded = 0;

        this.filesReadingFailed = false;

        this.allFiles = [];


    };

    LocalFileReader.prototype.checkIfFilesAreLoaded = function () {

        if (this.filesReadingFailed) {
            return;
        }

        if (this.filesToRead !== 0 && this.filesToRead === this.filesReaded) {

            if (this.delegate && this.delegate.onFilesReaded) {

                this.filesToRead = 0;
                this.filesReaded = 0;

                var files = this.allFiles;
                this.allFiles = [];
                
                this.delegate.onFilesReaded(files, this);
            }

        } else if (this.filesReaded === 0 && this.filesToRead === 0) {
            
            if (this.delegate && this.delegate.onFilesReaded) {
                this.delegate.onFilesReaded(this.allFiles, this);
            }

        } else {

            timeout(function () {

                this.checkIfFilesAreLoaded();

            }, 200, this);

        }

    };


    LocalFileReader.prototype.selectFolder = function (e) {

        var that = this;

        for (var i = 0; i < e.target.files.length; i++) {

            var f = e.target.files[i];

            if (!f.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            this.filesToRead++;

            reader.onload = (function (theFile) {

                var fileName = theFile.name;
                var parts = fileName.split(".");
                fileName = parts[0];

                return function (e) {
                    var fileData = {
                        name: fileName,
                        data: e.target.result
                    };
                    that.allFiles.push(fileData);
                    that.filesReaded++;
                };
            })(f);
            
           

            reader.readAsDataURL(f);


        }
       

        this.checkIfFilesAreLoaded();

    };

    window.LocalFileReader = LocalFileReader;

}(window));