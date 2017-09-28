
// Change size of canvas on window resize
window.onload = window.onresize = function() {
    var canvas = document.getElementById('juliaCanvas');
    var canvDiv = document.getElementById('canvasOuter');
    canvDiv.style.width = window.innerWidth * 0.8 + 'px';
    canvDiv.style.height = window.innerHeight * 0.8 + 'px';
    canvas.width = canvDiv.offsetWidth * 0.95;
    canvas.height = canvDiv.offsetHeight * 0.95;
}


// Zoom slider control
var sliderZoom = document.getElementById('zoomValue');
var zoomText = document.getElementById('zoomValueText');
zoomText.innerHTML = 1;
sliderZoom.oninput = function() { zoomText.innerHTML = this.value; }



/**
 * This is the function that will take care of image extracting and
 * setting proper filename for the download.
 * IMPORTANT: Call it from within a onclick event.
*/
function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}

/** 
 * The event handler for the link's onclick event. We give THIS as a
 * parameter (=the link element), ID of the canvas and a filename.
*/
document.getElementById('downloadCanvas').addEventListener('click', function() {
    downloadCanvas(this, 'juliaCanvas', 'julia.png');
}, false);


function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function RGBToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function hexToRGB(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

// generate a color gradient from two colors
function generateColor(start, end, colorCount){

    // The number of colors to compute
    var len = colorCount;

    //Alpha blending amount
    var alpha = 0.0;

    // color storage warehouse
    var gradient = [];
    
    for (i = 0; i < len; i++) {
        var c = [];
        alpha += (1.0/len);
        c[0] = parseInt(start[0] * (1 - alpha) + alpha * end[0]);
        c[1] = parseInt(start[1] * (1 - alpha) + alpha * end[1]);
        c[2] = parseInt(start[2] * (1 - alpha) + alpha * end[2]);
        gradient.push(RGBToHex(c[0], c[1], c[2]));
    }
    return gradient;
}

// Create a color gradient from color sets
function createColorGradient(baseColors, n) {
    var finishedColorGrad = [];
    var nSplit = parseInt((n / baseColors.length) + (n % baseColors.length));

    for (var i = 0; i < baseColors.length - 1; i++) {
        var red = baseColors[i][0];
        var green = baseColors[i][1];
        var blue = baseColors[i][2];
        var startColor = [red, green, blue];

        var nextRed = baseColors[i + 1][0];
        var nextGreen = baseColors[i + 1][1];
        var nextBlue = baseColors[i + 1][2];
        var endColor = [nextRed, nextGreen, nextBlue];

        // Get gradient colors and add them to final gradient
        var gradient = generateColor(startColor, endColor, nSplit);
        for (color in gradient) { finishedColorGrad.push(gradient[color]); }
    }
    return finishedColorGrad;
}


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

function juliaStart() {
    var canvas = document.getElementById('juliaCanvas');
    var ctx = canvas.getContext("2d");

    // XY plane dimmensions starting
    var totalWidth = 4;
    var totalHeight = 4;

    // canvas dimmensions
    var width = canvas.width;
    var height = canvas.height;
    var aspect = width / height;

    // Set aspect ratio
    totalWidth *= aspect;

    // Zoom value
    var zoom = 1 / (sliderZoom.value / 10);

    // chnage XY plane dimmensions to fit canvas aspect ratio
    // if (aspect > 1) {totalWidth *= aspect;}
    // else if (aspect < 1) {totalWidth *= aspect;}
    
    
    // Get new XY plane dimmensions
    var negWidth = -(totalWidth / 2) * zoom;
    var posWidth = (totalWidth / 2) * zoom;
    var negHeight = -(totalHeight / 2) * zoom;
    var posHeight = (totalHeight / 2) * zoom;

    // Create the C value for the equation
    var cReal = document.getElementById('CReal');
    var cImag = document.getElementById('CImag');
    var c = math.complex(parseFloat(cReal.value), parseFloat(cImag.value));

    var xVals = [];
    var yVals = [];
    for (var i = 0; i < height; i++) {
        xVals.push(scale(i, height, negHeight, posHeight));
    }
    for (var i = 0; i < width; i++) {
        yVals.push(scale(i, width, negWidth, posWidth));
    }
    
    // Get n value
    var n = document.getElementById('nVal');

    // Get colors and create a color gradient
    var black1 = hexToRGB("000000")
    var color1 = hexToRGB(document.getElementById('color1').value);
    var color2 = hexToRGB(document.getElementById('color2').value);
    var color3 = hexToRGB(document.getElementById('color3').value);
    var color4 = hexToRGB(document.getElementById('color4').value);
    var color5 = hexToRGB(document.getElementById('color5').value);
    var baseColors = [black1, color1, color2, color3, color4, color5];
    const colors = createColorGradient(baseColors, n.value);

    // Begin event loop
    for (var col = 0; col < height; col++) {
        // var x = scale(col, height, negHeight, posHeight)
        var x  = xVals[col];
        for (var row = 0; row < width; row++) {
            // var y = scale(row, width, negWidth, posWidth);
            var y = yVals[row];
            var z = math.complex(x, y)
            var check = inJSet(z, c, n.value);
            if (check != 0) {
                ctx.fillStyle = colors[check];
                ctx.fillRect(row, col, 1, 1);
            } else {
                ctx.fillStyle = "#000000";
                ctx.fillRect(row, col, 1, 1);
            }
        }
    }
}
