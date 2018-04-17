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
					return;
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
						var red = pixels.data[startIndex];
						var green = pixels.data[startIndex + 1];
						var blue = pixels.data[startIndex + 2];
						var merges = 0;
						
						for (var pixRow = Math.floor(charRow * heightMult); pixRow < ((charRow + 1) * heightMult) - 1; pixRow++) {
							for (var pixel = Math.floor(char * widthMult) + 1; pixel < ((char + 1) * widthMult) - 1; pixel++) {
								merges++;
								
								var index = ((pixRow * pixels.shape[0]) + pixel) * pixels.shape[2];
								red = Math.floor(((red * merges) + pixels.data[index]) / (merges + 1));
								green = Math.floor(((green * merges) + pixels.data[index + 1]) / (merges + 1));
								blue = Math.floor(((blue * merges) + pixels.data[index + 2]) / (merges + 1));
							}
						}

						red = Math.floor(red);
						green = Math.floor(green);
						blue = Math.floor(blue);
						var redId = Math.floor(red * 16 / 255) * 255 / 16;
						var greenId = Math.floor(green * 16 / 255) * 255 / 16;
						var blueId = Math.floor(blue * 16 / 255) * 255 / 16;

						var colorId = redId + "," + greenId + "," + blueId;		
						if (!colors[colorId]) {
							colors[colorId] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
						}

						var color = chalk.rgb(red, green, blue).bgRgb(red, green, blue);
						if (!program.usergb) {
							if (redId == greenId && greenId == blueId) {
								if (red > 190) {
									color = chalk.gray.bgWhite;
								} else if (red > 125) {
									color = chalk.black.bgWhite;
								} else if (red > 64) {
									color = chalk.white.bgBlack;
								} else {
									color = chalk.gray.bgBlack;
								}
							} else if (redId > greenId && redId > blueId) {
								if (red > 200) {
									color = chalk.red.bgWhite;
								} else if (red < 50) {
									color = chalk.red.bgBlack;
								} else if (red > 170) {
									color = chalk.white.bgRed;
								} else if (red < 80) {
									color = chalk.black.bgRed;
								} else if (greenId > blueId) {
									color = chalk.green.bgRed;
								} else if (blueId > greenId) {
									color = chalk.blue.bgRed;
								} else {
									color = chalk.cyan.bgRed;
								}
							} else if (greenId > redId && greenId > blueId) {
								if (green > 200) {
									color = chalk.green.bgWhite;		
								} else if (green < 50) {
									color = chalk.green.bgBlack;
								} else if (green > 170) {
									color = chalk.white.bgGreen;
								} else if (green < 80) {
									color = chalk.black.bgGreen;
								} else if (redId > blueId) {
									color = chalk.red.bgGreen;
								} else if (blueId > redId) {
									color = chalk.blue.bgGreen;
								} else {
									color = chalk.magenta.bgGreen;
								}
							} else if (blueId > redId && blueId > greenId) {
								if (blue > 200) {
									color = chalk.blue.bgWhite;
								} else if (blue < 50) {
									color = chalk.blue.bgBlack;
								} else if (blue > 170) {
									color = chalk.white.bgBlue;
								} else if (blue < 80) {
									color = chalk.black.bgBlue;
								} else if (redId > greenId) {
									color = chalk.red.bgBlue;
								} else if (greenId > redId) {
									color = chalk.green.bgBlue;
								} else {
									color = chalk.yellow.bgBlue;
								}
							} else if (redId == greenId) {
								if (red > 200) {
									color = chalk.yellow.bgWhite;
								} else if (red < 50) {
									color = chalk.yellow.bgBlack;
								} else if (red > 170) {
									color = chalk.white.bgYellow;
								} else if (red < 80) {
									color = chalk.black.bgYellow;
								} else if (blueId > greenId) {
									color = chalk.yellow.bgBlue;
								} else {
									color = chalk.yellow.bgYellow;
								}
							} else if (greenId == blueId) {
								if (green > 200) {
									color = chalk.cyan.bgWhite;
								} else if (green < 50) {
									color = chalk.cyan.bgBlack;
								} else if (green > 170) {
									color = chalk.white.bgCyan;
								} else if (green < 80) {
									color = chalk.black.bgCyan;
								} else if (redId > greenId) {
									color = chalk.cyan.bgRed;
								} else {
									color = chalk.cyan.bgCyan;
								}
							} else if (redId == blueId) {
								if (blue > 200) {
									color = chalk.magenta.bgWhite;
								} else if (blue < 50) {
									color = chalk.magenta.bgBlack;
								} else if (blue > 170) {
									color = chalk.white.bgMagenta;
								} else if (blue < 80) {
									color = chalk.black.bgMagenta;
								} else if (greenId > redId) {
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

program.parse(process.argv);
