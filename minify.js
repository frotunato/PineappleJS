var compressor = require('node-minify');
var jsPath = './client/components/js/';
new compressor.minify({
  type: 'gcc',
  fileIn: [jsPath + 'editor.js', jsPath + 'findAndReplaceDOMText.js'],
  fileOut: 'client/components/js/editor-concat-min-gcc.js',
  callback: function(err, min){
    console.log(err);
    //console.log(min); 
  }
});