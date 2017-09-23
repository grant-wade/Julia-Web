
// Change size of canvas on window resize
window.onload = window.onresize = function() {
    var canvas = document.getElementById('juliaCanvas');
    var canvDiv = document.getElementById('canvasOuter');
    canvDiv.style.width = window.innerWidth * 0.8 + 'px';
    canvDiv.style.height = window.innerHeight * 0.8 + 'px';
    canvas.width = canvDiv.offsetWidth * 0.95;
    canvas.height = canvDiv.offsetHeight * 0.95;
}

// Get all slider elements
var sliderRed = document.getElementById('redVal');
var sliderGreen = document.getElementById('greenVal');
var sliderBlue = document.getElementById('blueVal');
var sliderZoom = document.getElementById('zoomValue');

// Get all slider text fields
var outputRed = document.getElementById('redValText');
var outputGreen = document.getElementById('greenValText');
var outputBlue = document.getElementById('blueValText');
var zoomText = document.getElementById('zoomValueText');

// Put the start value in the text field
outputRed.innerHTML = 2;
outputGreen.innerHTML = 4;
outputBlue.innerHTML = 6;
zoomText.innerHTML = 1;

// Change slider text value when slider moves
sliderRed.oninput = function() { outputRed.innerHTML = this.value; }
sliderGreen.oninput = function() { outputGreen.innerHTML = this.value; }
sliderBlue.oninput = function() { outputBlue.innerHTML = this.value; }
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


// Credit to github user lrvick
RGBToHex = function(r,g,b){
    var bin = r << 16 | g << 8 | b;
    return (function(h){
        return new Array(7-h.length).join("0")+h
    })(bin.toString(16).toUpperCase())
}

// Create color range for escape values
function createColorRange(r, g, b, n) {
    var colorRange = [];
    var scale = 1;
    if (r * n > 255 && r > g && r > b) {
        scale = (r * n) / 255;
    } else if (g * n > 255 && g > r && g > b) {
        scale = (g * n) / 255;
    } else if (b * n > 255 && b > r && b > g) {
        scale = (b * n) / 255;
    }
    r = r / scale;
    g = g / scale;
    b = b / scale;
    for (var i = 0; i < n; i++) {
        colorRange[i] = RGBToHex(r * i, g * i, b * i);
    }
    return colorRange;
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
    var pixLocation = pix / pixNum
    var floatMag = math.abs(floatMin) + math.abs(floatMax)
    return (pixLocation * floatMag) + floatMin
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

    // Zoom value
    var zoom = 1 / sliderZoom.value;

    // chnage XY plane dimmensions to fit canvas aspect ratio
    if (aspect > 1) {totalWidth *= aspect;}
    else if (aspect < 1) {totalHeight *= aspect;}
    
    // Get new XY plane dimmensions
    var negWidth = -(totalWidth / 2) * zoom;
    var posWidth = (totalWidth / 2) * zoom;
    var negHeight = -(totalHeight / 2) * zoom;
    var posHeight = (totalHeight / 2) * zoom;

    // Create the C value for the equation
    var cReal = document.getElementById('CReal');
    var cImag = document.getElementById('CImag');
    var c = math.complex(parseFloat(cReal.value), parseFloat(cImag.value));

    // Get n value
    var n = document.getElementById('nVal');

    // Create all colors possible in the range
    var colors = createColorRange(sliderRed.value, sliderGreen.value, sliderBlue.value, n.value);

    // Begin event loop
    for (var col = 0; col < height; col++) {
        var x = scale(col, height, negHeight, posHeight)
        for (var row = 0; row < width; row++) {
            var y = scale(row, width, negWidth, posWidth);
            var z = math.complex(x, y)
            var check = inJSet(z, c, n.value);
            if (check != 0) {
                ctx.fillStyle = "#" + colors[check];
                ctx.fillRect(row, col, 1, 1);
            } else {
                ctx.fillStyle = "#000000";
                ctx.fillRect(row, col, 1, 1);
            }
        }
    }
    console.log("Finished");
}
