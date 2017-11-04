<localhost>/media/common/themes/uikit/readme.txt

-----------------
How to use UI Kit
-----------------

* Replicate parent folder <uikit> to create a new skin
* Make sure it stays within themes folder
* Change the call to the css file in master.html

------------------
To Do's
------------------

* Replace current tangerine-ui.css + main.css in the /common/css/
* master.html should directly call the appropriate /themes/<theme_name>/css/ui-kit.css
* css file naming convention should NOT include theme names

* css style names should NOT include colors of the particular selector.

------------------
Change Log
------------------

06.13.13
--------
* Initial check-in to incorporate the UI KIT file set into code base.
* Ability to support multiple themes.
* Independent preview HTML file for each theme.
* Access default theme file by 
  
  http://<localhost>/theme
  http://gamma.ck12.org/theme
  
* Access other themes in system by

  http://<localhost>/theme/?theme=<theme_name>
  http://gamma.ck12.org/theme/?theme=bloo
  
