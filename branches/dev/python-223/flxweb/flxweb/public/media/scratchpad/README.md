# SCRATCHPAD (formerly AnnotationTool)

This project defines a drawable area on an HTML5 `canvas` element.

## Dependencies
1. fontck12.css (including font files)
1. webfont.css
1. jquery (tested on 2.1.1)
1. underscorejs (tested on 1.7.0)
1. backbonejs (tested on 1.1.2)
1. spectrum jquery plugin (for color picker - v1.5.1 included in this repo)


## Example Setup
The scratchpad requires one css file and one js file to be loaded, then just instantiate the 
constructor.
  
      <html>
      <head>
        <link rel="stylesheet" href="{webroot_url}/scratchpad/dist/main.css">
      </head>
      <body>
        <div id="target"></div>
        <script src="{webroot_url}/scratchpad/dist/scratchpad.min.js"></script>`
        <script>
          var scratchpad = new Scratchpad({
            target:"#target", // insert the scratchpad in this container
            handleResize: true // when the user rotates or resizes the screen, resize the scratchpad
          });
        </script>
      </body>
      </html>

## Notes
1. The scratchpad should be rendered within a DIV container. The scratchpad will grow to fit the 
   width and height of the div, so it is best to start with an empty div and set its width and 
   height via CSS. Make sure to pass a jquery object or valid DOM query selector string to the `target` 
   property when instantiating the `Scratchpad` object. 
1. The scratchpad currently supports 1 mobile breakpoint and is set at 600px. This breakpoint is defined
   in a file called `small-breakpoint.css`.
1. Currently, the spectrum jquery plugin is appended to the build file. This can be disabled by modifying
   the 'dev' grunt task in `Gruntfile.js`.


## Development 
1. On a nix system, run the `watcher.sh` command while developing so that the project gets automatically
   built per file edit. This requires `inotifywait`.
1. All CSS files should be imported into the `main.css` file so that the minification works.
1. The build process uses requirejs optimizer to organize the files. This project does not depend on the
   requirejs loader on the front end because the define statements are removed. Thus, extra special care is
   needed when creating new modules. Do not return an object without defining it; alternatively, you can 
   put modules that only return something in a `var` directory, and the build process will assign the return 
   statement to a variable name based on the module name.




