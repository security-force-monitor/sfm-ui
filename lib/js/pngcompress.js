// 8< ---[pngcompress.js]---
// START:VANILLA_PREAMBLE
var pngcompress=typeof(extend)!='undefined' ? extend.module('pngcompress') : (typeof(pngcompress)!='undefined' ? pngcompress : {});
(function(pngcompress){
var __module__=pngcompress;
// END:VANILLA_PREAMBLE

pngcompress.__VERSION__='0.0.1';
pngcompress.RGB = 3;
pngcompress.RGBA = 4;
pngcompress.DEFAULT_FORMAT = 3;
/**
  * Returns the bitmap data from the given image as an array or RGBA data
  * 
*/
pngcompress.getBitmapData = function(image){
	var self = pngcompress;
	if (image.jquery) {
		image = image[0];
	}
	var w = image.naturalWidth;
	var h = image.naturalHeight;
	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", w);
	canvas.setAttribute("height", h);
	var c = canvas.getContext("2d");
	c.drawImage(image, 0, 0);
	var image_data = c.getImageData(0, 0, w, h);
	var data = image_data.data;
	return data;
}
/**
  * Decodes the given data and returns the raw package data
  * 
*/
pngcompress.decode = function(data, format){
	var self = pngcompress;
	if (format === undefined) {format=__module__.DEFAULT_FORMAT}
	if (data.nodeName || data.jquery) {
		data = __module__.getBitmapData(data);
	}
	if (format == __module__.RGB) {
		var length = data.length;
		var result = [];
		var offset = 0;
		while ((offset < data.length)) {
			if (((offset + 1) % 4) != 0) {
				result.push(String.fromCharCode(data[offset]));
			}
			offset = (offset + 1);
		}
		return result.join("");
	} else {
		return null;
	}
}
/**
  * Decodes the given data and returns the package as a JSON object
  * 
*/
pngcompress.uncompress = function(data, format){
	var self = pngcompress;
	if (format === undefined) {format=__module__.DEFAULT_FORMAT}
	if (typeof(data) != "string") {
		data = __module__.decode(data);
	}
	var preamble_length = "";
	var offset = 0;
	while (((data[offset] != ":") && (offset < data.length))) {
		preamble_length = (preamble_length + data[offset]);
		offset = (offset + 1);
	}
	offset = (offset + 1);
	preamble_length = parseInt(preamble_length);
	var preamble = extend.slice(data,offset,(offset + preamble_length));
	preamble = JSON.parse(preamble);
	offset = (offset + preamble_length);
	result = {};
	// Iterates over `preamble`. This works on array,objects and null/undefined
	var __j=preamble;
	var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
	var __m=__k.length;
	for (var __l=0;__l<__m;__l++){
		var __i=(__k===__j)?__l:__k[__l];
		var key_length=__j[__i];
		// This is the body of the iteration with (value=key_length, key/index=__i) in __j
		var length = key_length;;
		var key = length[0];;
		length = length[1];
		result[key] = extend.slice(data,offset,(offset + length));
		offset = (offset + length);
	}
	return result;
}
pngcompress.init = function(){
	var self = pngcompress;
}
if (typeof(pngcompress.init)!="undefined") {pngcompress.init();}

// START:VANILLA_POSTAMBLE
return pngcompress;})(pngcompress);
// END:VANILLA_POSTAMBLE
