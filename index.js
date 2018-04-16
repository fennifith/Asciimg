#!/usr/bin/env node
'use strict';

const getPixels = require("get-pixels"),
	program = require('commander'),
	chalk = require('chalk'),
	exec = require('child_process').exec;

program.version('1.0.0')
	.arguments('<image>', 'path of the image to convert')
	.option('-w --width [chars]', 'width of the ascii output (in chars)')
	.option('-h --height [chars]', 'height of the ascii output (in chars)')
	.option('--usergb', 'whether to spit out rgb spaghetti (in terminals that support it)')
	.action(function(image) {
		if (image) {
			getPixels(image, function(err, pixels) {
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
		
				var width = Math.min(process.stdout.columns, pixels.shape[0] * (process.stdout.rows / (pixels.shape[1] / 2)));
				var height = Math.min(process.stdout.rows, (pixels.shape[1] / 2) * (process.stdout.columns / pixels.shape[0]));
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

				var widthMult = pixels.shape[0] / width;
				var heightMult = pixels.shape[1] / height;
		
				for (var charRow = 0; charRow < height; charRow++) {				
					var string = "";
					for (var char = 0; char < width; char++) {
						var startIndex = Math.floor((charRow * heightMult * pixels.shape[0]) + (char * widthMult)) * pixels.shape[2];
						var red = Math.floor(pixels.data[startIndex] * (16/255)) * (255/16);
						var green = Math.floor(pixels.data[startIndex + 1] * (16/255)) * (255/16);
						var blue = Math.floor(pixels.data[startIndex + 2] * (16/255)) * (255/16);
						var merges = 0;
						
						for (var pixRow = Math.floor(charRow * heightMult); pixRow < ((charRow + 1) * heightMult) - 1; pixRow++) {
							for (var pixel = Math.floor(char * widthMult) + 1; pixel < ((char + 1) * widthMult) - 1; pixel++) {
								merges++;
								
								var index = ((pixRow * pixels.shape[0]) + pixel) * pixels.shape[2];
								red = Math.floor(((red * merges) + (Math.floor(pixels.data[index] * (16/255)) * (255/16))) / (merges + 1));
								green = Math.floor(((green * merges) + (Math.floor(pixels.data[index + 1] * (16/255)) * (255 / 16))) / (merges + 1));
								blue = Math.floor(((blue * merges) + (Math.floor(pixels.data[index + 2] * (16/255)) * (255 / 16))) / (merges + 1));
							}
						}

						var colorId = red + "," + green + "," + blue;		
						if (!colors[colorId]) {
							colors[colorId] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
						}

						var color = chalk.rgb(red, green, blue);
						if (!program.usergb) {
							if (red == green && green == blue) {
								if (red > 125) {
									color = chalk.white;
								} else {
									color = chalk.gray;
								}
							} else if (red > green && red > blue) {
								color = chalk.red;
							} else if (green > red && green > blue) {
								color = chalk.green;
							} else if (blue > red && blue > green) {
								color = chalk.blue;
							} else if (red == green) {
								color = chalk.yellow;
							} else if (green == blue) {
								color = chalk.cyan;
							} else if (red == blue) {
								color = chalk.magenta;
							}
						}
																	
						string += color(colors[colorId]);
					}

					console.log(string);
				}
			});
		} else console.log("You must pass the path of an image to convert!");
	});

program.parse(process.argv)
