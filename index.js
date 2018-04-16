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

						var color = chalk.rgb(red, green, blue).bgRgb(Math.max(0, red - 20), Math.max(0, green - 20), Math.max(0, blue - 20));
						if (!program.usergb) {
							if (red == green && green == blue) {
								if (red > 125) {
									color = chalk.gray.bgWhite;
								} else {
									color = chalk.white.bgBlack;
								}
							} else if (red > green && red > blue) {
								if (green > blue) {
									color = chalk.green.bgRed;
								} else if (blue > green) {
									color = chalk.blue.bgRed;
								} else {
									color = chalk.cyan.bgRed;
								}
							} else if (green > red && green > blue) {
								if (red > blue) {
									color = chalk.red.bgGreen;
								} else if (blue > red) {
									color = chalk.blue.bgGreen;
								} else {
									color = chalk.magenta.bgGreen;
								}
							} else if (blue > red && blue > green) {
								if (red > green) {
									color = chalk.red.bgBlue;
								} else if (green > red) {
									color = chalk.green.bgBlue;
								} else {
									color = chalk.yellow.bgBlue;
								}
							} else if (red == green) {
								if (blue > green) {
									color = chalk.yellow.bgBlue;
								} else {
									color = chalk.yellow.bgYellow;
								}
							} else if (green == blue) {
								if (red > green) {
									color = chalk.cyan.bgRed;
								} else {
									color = chalk.cyan.bgCyan;
								}
							} else if (red == blue) {
								if (green > red) {
									color = chalk.magenta.bgGreen;
								} else {
									color = chalk.magenta.bgMagenta;
								}
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
