
importScripts('http://cdnjs.cloudflare.com/ajax/libs/mathjs/3.16.3/math.min.js');

// Julia set functions
function inJSet(z, c, n) {
    for (var i = 0; i < n; i++) {
        z = math.multiply(z, z);
        z = math.add(z, c);
        if (math.abs(z) > 2) {
            return i;
        }
    }
    return 0;
}


function scale(pix, pixNum, floatMin, floatMax) {
    var pixLocation = pix / pixNum;
    var floatMag = math.abs(floatMin) + math.abs(floatMax);
    return (pixLocation * floatMag) + floatMin;
}


self.onmessage = function(e) {

    // Setting variables from passed data
    var width = e.data[0];
    var height = e.data[1];
    var cReal = e.data[2];
    var cImag = e.data[3];
    var c = math.complex(cReal, cImag);
    var n = e.data[4];
    var totalWidth = e.data[5];
    var totalHeight = e.data[6];
    var zoom = e.data[7];
    var ctx = e.data[8];
    var colors = e.data[9];

    // Calculate bounds for calculation
    var negWidth = -(totalWidth / 2) * zoom;
    var posWidth = (totalWidth / 2) * zoom;
    var negHeight = -(totalHeight / 2) * zoom;
    var posHeight = (totalHeight / 2) * zoom;


    // Create output array
    var output = new Array();
    for (var i = 0; i < height; i++) {
        output[i] = new Array();
        for (var j = 0; j < width; j++) {
            output[i][j] = 0;
        }
    }

    // Create x and y values
    var xVals = [];
    var yVals = [];
    for (var i = 0; i < height; i++) {
        xVals.push(scale(i, height, negHeight, posHeight));
    }
    for (var i = 0; i < width; i++) {
        yVals.push(scale(i, width, negWidth, posWidth));
    }

    // Begin event loop
    var done = 0;
    for (var col = 0; col < height; col++) {
        var x  = xVals[col];
        if (col % parseInt(height / 100) == 0) {
            done += 1;
            postMessage([done])
        }
        for (var row = 0; row < width; row++) {
            var y = yVals[row];
            var z = math.complex(x, y)
            var check = inJSet(z, c, n);
            output[col][row] = check;
        }
    }
    postMessage([output])
    self.close();
}