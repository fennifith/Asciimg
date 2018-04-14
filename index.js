#!/user/bin/env node
'use strict';

const getPixels = require("get-pixels"),
	program = require('commander'),
	chalk = require('chalk'),
	exec = require('child_process').exec;

program.version('1.0.0')
	.option('-i --image [path]', 'path of the image to convert')
	.option('-w --width [chars]', 'width of the ascii output (in chars)')
	.option('-h --height [chars]', 'height of the ascii output (in chars)')
	.option('--usergb', 'whether to spit out rgb spaghetti (in terminals that support it)')
	.parse(process.argv);

if (program.image) {
	getPixels(program.image, function(err, pixels) {
		if(err) {
			console.log("Bad image path.");
			return
		}

		if (pixels.shape.length != 3 || !(pixels.shape[2] == 3 || pixels.shape[2] == 4)) {
			console.log("Unsupported image type.");
			return;
		}

		var colors = {};
		var chars = [];

		var width = pixels.shape[0];
		var height = pixels.shape[1];
		if (program.width && program.height) {
			width = program.width;
			height = program.height;
		} else if (program.width) {
			height *= program.width / width;
			width = program.width;
		} else if (program.height) {
			width *= program.height / height;
			height = program.height;
		}

		for (var row = 0; row < pixels.shape[1]; row++) {
			var charRow = Math.floor(row * (height / pixels.shape[1]));
			if (!chars[charRow])
				chars[charRow] = [];
		
			var string = "";
			for (var pixel = 0; pixel < pixels.shape[0]; pixel++) {
				var charPixel = Math.floor(pixel * (width / pixels.shape[0]));
			
				var index = ((row * pixels.shape[0]) + pixel) * pixels.shape[2];
				var red = Math.floor(pixels.data[index] * (16/255)) * (255/16);
				var green = Math.floor(pixels.data[index + 1] * (16/255)) * (255/16);
				var blue = Math.floor(pixels.data[index + 2] * (16/255)) * (255/16);
				var color = red + "," + green + "," + blue;

				if (!colors[color]) {
					colors[color] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
				}

			    if (chars[charRow][charPixel]) {
			    	chars[charRow][charPixel].merges += 1;
			    	
			    	var curColorArr = chars[charRow][charPixel].color.split(",");
			    	red = Math.floor(((curColorArr[0] * chars[charRow][charPixel].merges) + red)
			    			/ (chars[charRow][charPixel].merges + 1));
			    	green = Math.floor(((curColorArr[1] * chars[charRow][charPixel].merges) + green)
			    			/ (chars[charRow][charPixel].merges + 1));
			    	blue = Math.floor(((curColorArr[2] * chars[charRow][charPixel].merges) + blue)
			    			/ (chars[charRow][charPixel].merges + 1));
					color = red + "," + green + "," + blue;

					if (!colors[color]) {
						colors[color] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
					}

			    	chars[charRow][charPixel].color = color;
			    	chars[charRow][charPixel].char = colors[color];
			    } else {
			    	chars[charRow][charPixel] = {
			    		color: color,
			    		char: colors[color],
   				    	merges: 0
   				    };
			    }
			}
		}

		for (var row = 0; row < chars.length; row++) {
			var string = "";
			for (var char = 0; char < chars[row].length; char++) {
				var colorArr = chars[row][char].color.split(",");
				var color = chalk.rgb(colorArr[0], colorArr[1], colorArr[2]);
				if (!program.usergb) {
					if (colorArr[0] == colorArr[1] && colorArr[1] == colorArr[2]) {
						if (colorArr[0] > 125) {
							color = chalk.white;
						} else {
							color = chalk.gray;
						}
					} else if (colorArr[0] > colorArr[1] && colorArr[0] > colorArr[2]) {
						color = chalk.red;
					} else if (colorArr[1] > colorArr[0] && colorArr[1] > colorArr[2]) {
						color = chalk.green;
					} else if (colorArr[2] > colorArr[0] && colorArr[2] > colorArr[1]) {
						color = chalk.blue;
					} else if (colorArr[0] == colorArr[1]) {
						color = chalk.yellow;
					} else if (colorArr[1] == colorArr[2]) {
						color = chalk.cyan;
					} else if (colorArr[0] == colorArr[2]) {
						color = chalk.magenta;
					}
				}
				
				string += color(chars[row][char].char);
			}
			console.log(string);
		}
	});
} else console.log("'--image' is a required argument.");
