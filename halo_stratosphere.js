var width = 1400, height = 800;
var colorWheelRadius = 92.5;
var center = [];
var mx, my, mouseDownOnColor = false;

var mouseDownOnCanvas = false;
var logoTexture, logoGraphic;

var controls;
var sizeSlider;
var colorSlider;
var rotationSlider;
var wobbleSlider;
var complexitySlider;
var colorRatioSlider;
var ringsSlider;
var wavesSlider;
var waveSpeedSlider;
var speedSlider;
var bpmSlider;
var pilRotationSlider;
var colorSegments;
var logoToggle;


var bpmSlider;
var altitudeSlider;
var o2satSlider;
var respRateSlider;
var biocontrols = true;

var centerColor = [], mainColor = [], waveColor = [], circleColor = [];
var font;

var graph;
var graphdraw;

let vertSrc = `
     precision highp float;
     uniform mat4 uModelViewMatrix;
     uniform mat4 uProjectionMatrix;
     
     attribute vec3 aPosition;
     attribute vec2 aTexCoord;
     varying vec2 vTexCoord;

     varying vec4 vPos;

     
     void main() {
       vTexCoord = aTexCoord;
       vec4 positionVec4 = vec4(aPosition, 1.0);
       vPos = uProjectionMatrix * uModelViewMatrix * positionVec4;
       gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
     }
     `;
     
     // Create a string with the fragment shader program.
     // The fragment shader is called for each pixel.
     let fragSrc = `
     precision highp float;

     varying vec4 vPos;
     
     void main() {
       // Set each pixel's RGBA value to yellow.
       gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
     }
     `;


function preload() {
    font = loadFont('resources/Moderniz.otf');

}


var pTimeStamp = 0.0, timeStamp = 0.0, clock = 0.0, span = 0.0;

var atomCenter = [];
var atomSize;
var altGraphCorners = [];

var soundReady = false;
var soundID;
function soundLoaded(event) {
    soundReady = true;
    soundID = event;
    console.log("sound loaded")
}

function setup() {

     controls = false;

     pTimeStamp = Date.now();

     if (!createjs.Sound.initializeDefaultPlugins()) {
        console.log("soundjs error")
    }

    var soundSrc = "./resources/thump.wav"
    createjs.Sound.alternateExtensions = ["wav"];
    createjs.Sound.addEventListener("fileload", soundLoaded);
    createjs.Sound.registerSound(soundSrc);



    /*P5 JS canvas for PIL + HALO render*/
    
    var width = 1720;//3440;//document.getElementById("canvasSection").offsetWidth;
    var height = 720;//1440;//document.getElementById("canvasSection").offsetHeight;
    var p5Canvas = createCanvas(width, height);
    p5Canvas.parent('canvasSection');
    //center.x = 0;
    //center.y = 0;


    atomSize = height*0.5;

    atomCenter.x = width*4.0/5.0;
    atomCenter.y = height*2.0/6.0;


    graph = createGraphics(height, height);
    graph.noFill();
    //graph.background(0);
    graph.strokeWeight(1);
    graph.stroke(255,255,255,200);
    for (var i = 0; i <= 1.0; i += 0.0625) {
        graph.line(graph.width/2, graph.width/2, graph.width/2 + graph.width/2*cos(i*PI*2), graph.width/2 + graph.width/2*sin(i*PI*2))
        var r = graph.width*i/2.0;
        graph.beginShape();
        for (var j = 0; j < 1.0; j += 0.01) {
            graph.vertex(graph.width/2 + r*cos(j*PI*2), graph.width/2 + r*sin(j*PI*2));
        }
        graph.endShape(CLOSE);
    }
    graphdraw = createGraphics(height, height);
    graphdraw.background(0);
    graphdraw.image(graph, 0, 0);

    graph.strokeWeight(4);
    graph.stroke(125, 200, 255);
    for (var i = 0; i <= 1.0; i += 0.0625) {
        graph.line(graph.width/2, graph.width/2, graph.width/2 + graph.width/2*cos(i*PI*2), graph.width/2 + graph.width/2*sin(i*PI*2))
        var r = graph.width*i/2.0;
        graph.beginShape();
        for (var j = 0; j < 1.0; j += 0.01) {
            graph.vertex(graph.width/2 + r*cos(j*PI*2), graph.width/2 + r*sin(j*PI*2));
        }
        graph.endShape(CLOSE);
    }

    graph.filter(BLUR, 10);
    graphdraw.image(graph, 0, 0);
    
    centerColor.hue = 0;
    mainColor.hue = 255;
    waveColor.hue = 55;
    circleColor.hue = 55;
    
    centerColor.saturation = 55;
    mainColor.saturation = 255;
    waveColor.saturation = 0;
    circleColor.saturation = 255;

    //logoTexture = loadImage("./resources/ORABlack.jpeg");
    //logoGraphic = createGraphics(width, height, WEBGL);

    textFont(font);

    
    
   
    /*Controls from HTML document*/
    
    if (!controls) {
        document.getElementById("controls").setAttribute("style", "display:none");

        if (biocontrols) {
            bpmSlider = document.getElementById("bpm");
            altitudeSlider = document.getElementById("altitude")
            o2satSlider = document.getElementById("o2sat");
            respRateSlider = document.getElementById("resprate");
        } else {
            document.getElementById("controls2").setAttribute("style", "display:none");
        }

    } else {
    //Range sliders
    sizeSlider = document.getElementById("size");
    logoToggle = document.getElementById("logoSwitch")
    radiusSlider = document.getElementById("radius");
    rotationSlider = document.getElementById("rotation");
    wobbleSlider = document.getElementById("wobble");
    complexitySlider = document.getElementById("complexity");
    colorRatioSlider = document.getElementById("colorRatio");
    ringsSlider = document.getElementById("rings");
    wavesSlider = document.getElementById("waves");
    waveSpeedSlider = document.getElementById("waveSpeed");
    speedSlider = document.getElementById("speed");
    bpmSlider = document.getElementById("bpm");
    colorSegments = document.getElementById("colorSeg");

    console.log("Size " + sizeSlider.value + "%")
    console.log("Radius " + radiusSlider.value + "%")
    console.log("Rotation " + rotationSlider.value + "%")
    console.log("Wobble " + wobbleSlider.value + "%")
    console.log("Complexity " + complexitySlider.value + "%")
    console.log("Color Ratio " + colorRatioSlider.value + "%")
    console.log("Rings " + ringsSlider.value)
    console.log("Waves " + wavesSlider.value + "%")
    console.log("Wave Speed " + waveSpeedSlider.value + "%")
    console.log("Overall Speed " + speedSlider.value + "%")
    console.log("Heart rate " + bpmSlider.value + "%")

    }
    //DATA : role
    //Set default colors 
    centerColor.red = 255;
    centerColor.green = 255;
    centerColor.blue = 255;

    mainColor.red = 255;
    mainColor.green = 25;
    mainColor.blue = 0;

    waveColor.red = 255;
    waveColor.green = 0;
    waveColor.blue = 0;

    circleColor.red = 255;
    circleColor.green = 255;
    circleColor.blue = 255;
    
    //Canvas color block
    colorCanvas = document.getElementById("colorCanvas");
    colorCanvas.width = colorWheelRadius*2;
    colorCanvas.height = colorWheelRadius*2;
	context = colorCanvas.getContext("2d");
    
    //Mouse coords on color block
    colorCanvas.addEventListener('mousedown', e => {
        mx = e.offsetX - colorWheelRadius;
        my = colorWheelRadius - e.offsetY;
        mouseDownOnColor = true;
    });

    biometricCanvas = document.getElementById("biometricView");
    biometricCanvas.width = colorWheelRadius*2.0;
    biometricCanvas.height = colorWheelRadius*2.0;
    context = biometricCanvas.getContext("2d");

    context.rect(0, 0, 100, 100);
    context.stroke();
}

function windowResized () {


    var width = 1000;//document.getElementById("canvasSection").offsetWidth;
    var height = 800;//document.getElementById("canvasSection").offsetHeight;
    resizeCanvas(width, height, WEBGL, document.getElementById("haloCanvas"));
}

var time = 0.0, radius = 125.0;
var time2 = 0.0;

var state = 0.0;

var mousePressLoc = [];
var lastYAngle = 0.0, lastXAngle = 0.0, yAngle = 0.0, xAngle = 0.0;

var size = 0.85, rotation = 0.0, rotationSpeed = 0.01, wobble = 0.25, complexity = 0.5, colorRatio = 0.5, waveSpeed = 0.5, speed = 0.5;

const ALTITUDE_MIN = 0.0, ALTITUDE_MAX = 30000.0;
const BPM_MIN = 55.0, BPM_MAX = 200.0;
const O2SAT_MIN = 0.55, O2SAT_MAX = 1.0;
const RESP_RATE_MIN = 2.0, RESP_RATE_MAX = 60.0;

var altitude = 3000.0;
var bpm = 60.0;
var o2Sat = 0.94;
var respRate = 20.0;
var altitudeNew = 3000.0;
var altitudeDelta = 0.0;
var bpmNew = 60.0;
var bpmDelta = 0.0;
var o2SatNew = 0.94;
var o2SatDelta = 0.0;
var respRateNew = 20.0;
var respRateDelta = 0.0;

var altitudeHistoric = [];
var bpmHistoric = [];
var o2SatHistoric = [];
var respRateHistoric = [];

var logo = false;

var waveOffset = 0.0;
var ringCount = 55, waveCount = 3;
var colorToggle = -1;


var expansion = 0.0, de = 0.0;

var pulseRadius = 0.0, pulseBrightness = 0.0

var expansion2 = 0.0;

var bpmStasis = BPM_MIN;
var o2SatStasis = O2SAT_MAX;
var respRateStasis = RESP_RATE_MIN;

var dataPoints = 0;

var initial = false;
function setStasis() {
    bpmStasis = (bpmNew-BPM_MIN)/(BPM_MAX-BPM_MIN);
    o2SatStasis = (o2SatNew-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
    respRateStasis = (respRateNew-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);

    initial = true;
    dataPoints = 0;
}

function draw() {
    randomSeed(0);
    background(0);

    stroke(255);
    //rect(0, 0, width, height);

    image(graphdraw, atomCenter.x - atomSize*0.5, atomCenter.y - atomSize*0.5, atomSize, atomSize);

    /*stroke(100);
    strokeWeight(1);
    for (var i = 0; i < 1.0; i += 0.0625) {
        line(0, 0, width/2*cos(i*PI*2), width/2*sin(i*PI*2))
        var r = width*i*0.5;
        beginShape();
        for (var j = 0; j < 1.0; j += 0.01) {
            vertex(r*cos(j*PI*2), r*sin(j*PI*2));
        }
        endShape(CLOSE);
    }
*/
    

fill(255);
    textSize(36);


    //Generated data points
    if (!biocontrols) {
    altitude = 0 + ALTITUDE_MAX*noise(time/15.0 + 100.0);
    bpm = BPM_MIN + (BPM_MAX-BPM_MIN)*noise(time/5.0 - 100.0);
    o2Sat = O2SAT_MIN + (O2SAT_MAX-O2SAT_MIN)*noise(time/5.0 + 1000.0);
    respRate = RESP_RATE_MIN + (RESP_RATE_MAX-RESP_RATE_MIN)*noise(time/5.0);
    } else {
        altitudeNew = 0 + ALTITUDE_MAX*altitudeSlider.value/10000.0;
        bpmNew = BPM_MIN + (BPM_MAX-BPM_MIN)*bpmSlider.value/100.0;
        o2SatNew = O2SAT_MIN + (O2SAT_MAX-O2SAT_MIN)*o2satSlider.value/100.0;
        respRateNew = RESP_RATE_MIN + (RESP_RATE_MAX-RESP_RATE_MIN)*respRateSlider.value/100.0;

        document.getElementById("bpmlabel").innerHTML = round(bpm)
        document.getElementById("altitudelabel").innerHTML = altitude + "'"
        document.getElementById("o2satlabel").innerHTML = round(o2Sat*100.0) + "%";
        document.getElementById("respratelabel").innerHTML = round(respRate);
    }
    //bpm = .0;

    //drag
    altitudeDelta += (altitudeNew-altitude)*0.0025; //accelerate
    altitudeDelta *= 0.9; //dampen
    altitude += altitudeDelta; //move

    bpmDelta += (bpmNew-bpm)*0.0025; //accelerate
    bpmDelta *= 0.9; //dampen
    bpm += bpmDelta; //move

    o2SatDelta += (o2SatNew-o2Sat)*0.0025; //accelerate
    o2SatDelta *= 0.9; //dampen
    o2Sat += o2SatDelta; //move

    respRateDelta += (respRateNew-respRate)*0.0025; //accelerate
    respRateDelta *= 0.9; //dampen
    respRate += respRateDelta; //move

    //Normalized 
    var altitudeNorm = (altitude-ALTITUDE_MIN)/(ALTITUDE_MAX-ALTITUDE_MIN)
    var bpmNorm = (bpm-BPM_MIN)/(BPM_MAX-BPM_MIN)
    var o2SatNorm = (o2Sat-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN)
    var respRateNorm = (respRate-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN)


    if (!initial) setStasis();


 

    
    textSize(16)

    //SPECTRUMS

    noStroke();
    for (var i = 0; i < 1.0; i += 0.05) {
        var red, green, blue;
        if (i < 1.0/3.0) {
            var sub = i*3.0;
            red = 255*sub;
            green = 255;
            blue = 0.0;
        } else if (i < 2.0/3.0) {
            var sub = (i-1.0/3.0)*3.0;
            red = 255;
            green = 255 - 125*sub;
            blue = 0.0;
        } else {
            sub = (i-2.0/3.0)*3.0;
            red = 255;
            green = 125 - 125*sub;
            blue = 0.0;
        }
        fill(red, green, blue);
        rect(width/10*7 - 50 + i*100, height/5*4, 5, 10);
    }
    var meter = width/10*7 - 50 + bpmNorm*100;
    stroke(255);
    line(meter, height/5*4-5, meter, height/5*4 + 15)
    noStroke();
    fill(255);
    text("HR", width/10*7 - 18, height/5*4 + 35);
    text(round(bpm), width/10*7 - 18, height/5*4 - 10);


    for (var i = 0; i < 1.0; i += 0.05) {
        var c = o2SatColor(0.001+i);
        fill(c.red*255, c.green*255, c.blue*255);
        rect(width/10*8 - 50 + i*100, height/5*4, 5, 10);
    }
    meter = width/10*8 - 50 + o2SatNorm*100;
    stroke(255);
    line(meter, height/5*4-5, meter, height/5*4 + 15)
    noStroke();
    fill(255);
    text("SpO2", width/10*8 - 30, height/5*4 + 35);
    text(round(o2Sat*100.0) + "%", width/10*8 - 20, height/5*4 - 10);


    for (var i = 0; i < 1.0; i += 0.05) {
        var red, green, blue;
    if (i < 0.25) {
        var sub = i/0.25;

        red = 55*(1-sub);
        green = 255*sub;
        blue = 255*(1-sub);
    } else if (i <= 1.0) {
        var sub = (i-0.25)/0.75;

        red = 255*sub;
        green = 255*(1-sub);
        blue = 0;
    }
        fill(red, green, blue);
        rect(width/10*9 - 50 + i*100, height/5*4, 5, 10);
    }
    meter = width/10*9 - 50 + respRateNorm*100;
    stroke(255);
    line(meter, height/5*4-5, meter, height/5*4 + 15)
    noStroke();
    fill(255);
    text("RR", width/10*9 - 18, height/5*4 + 35);
    text(round(respRate), width/10*9 - 15, height/5*4 - 10);




    bpmHistoric[dataPoints] = bpm;
    altitudeHistoric[dataPoints] = altitude;
    o2SatHistoric[dataPoints] = o2Sat;
    respRateHistoric[dataPoints] = respRate;

    dataPoints++;

    
    /*Set Parameters*/
    
    if (controls) {

    size = 0.0 + sizeSlider.value/100.0; 
    radius = radiusSlider.value/100.0;
    logo = (logoToggle.value == 0) ? false : true;
    rotationSpeed = (rotationSlider.value/100.0 - 0.5)*0.05; 
    wobble = wobbleSlider.value/100.0;
    complexity = 0.0 + complexitySlider.value/100.0; 
    colorRatio = (colorRatioSlider.value/50.0)-1; 
    ringCount = floor(ringsSlider.value);
    waveCount = floor(wavesSlider.value/10.0*ringCount/100);
    waveSpeed = waveSpeedSlider.value/100.0;
    speed = speedSlider.value/100.0;
    //bpm = bpmSlider.value/100.0 + 0.05;
    colorToggle = colorSegments.value;


    } else {

    //other sources (data, random)

    size = 0.75;            
    radius = 0.65;           
    logo = true;       
    rotationSpeed = -0.01;   
    wobble = 0.0;           
    complexity = 0.75;      
    colorRatio = 0.1;       
    ringCount = 100;        
    waveCount = 0.0;
    waveSpeed = 0.5;
    speed = 0.06;
    colorToggle = 2;    


    var delta = (dataPoints >= 155) ? dataPoints-155 : 0;
    historico2satNorm = (o2SatHistoric[delta] - O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
    
    //green to dark blue
    centerColor.red = 5 + 125*(1-o2SatNorm);
    centerColor.green = 55 + 150*stairStep(o2SatNorm);
    centerColor.blue = 5 + 255*rlerp(o2SatNorm);

    mainColor.red = 5 + 125*(1-historico2satNorm);
    mainColor.green =  55 + 150*stairStep(historico2satNorm);
    mainColor.blue = 5 + 255*rlerp(historico2satNorm);


    var c = o2SatColor(o2SatNorm);
    centerColor.red = c.red*255;
    centerColor.green = c.green*255;
    centerColor.blue = c.blue*255;
    c = o2SatColor(historico2satNorm);
    mainColor.red = c.red*255;
    mainColor.green = c.green*255;
    mainColor.blue = c.blue*255;

    /*/white to dark blue
    centerColor.red = 255*stairStep(o2SatNorm);
    centerColor.green = 255*stairStep(o2SatNorm);
    centerColor.blue = 255*miniStairStep(o2SatNorm);

    mainColor.red = 255*stairStep(historico2satNorm);
    mainColor.green = 255*stairStep(historico2satNorm);
    mainColor.blue = 255*miniStairStep(historico2satNorm);
        */

    
    waveColor.red = 255;
    waveColor.green = 255;
    waveColor.blue = 255;

    //green yellow orange red
    if (respRateNorm < 0.25) {
        var sub = respRateNorm/0.25;

        waveColor.red = 55*(1-sub);
        waveColor.green = 255*sub;
        waveColor.blue = 255*(1-sub);
    } else if (respRateNorm <= 1.0) {
        var sub = (respRateNorm-0.25)/0.75;

        waveColor.red = 255*sub;
        waveColor.green = 255*(1-sub);
        waveColor.blue = 0;
    }


    //green to orange with blue in mid range
    circleColor.red = 255*(bpmNorm);
    circleColor.green = 100 + 125*(1-bpmNorm);
    circleColor.blue = 0*200*sin(PI*bpmNorm);


    //white to orange
    circleColor.red = 255;
    circleColor.green = 100 + 125*(1-bpmNorm);
    circleColor.blue = 255*(1-bpmNorm);

    //green yellow orange red
    circleColor.hue = 255*(1-bpmNorm);
    circleColor.saturation = 255;
    circleColor.value = 1.0;

    var colorFromHSV = hsv_to_rgb(circleColor.hue, circleColor.saturation, circleColor.value);
    circleColor.red = colorFromHSV.red;
    circleColor.green = colorFromHSV.green;
    circleColor.blue = colorFromHSV.blue;

    if (bpmNorm < 1.0/3.0) {
        var sub = bpmNorm*3.0;
        circleColor.red = 255*sub;
        circleColor.green = 255;
        circleColor.blue = 0.0;
    } else if (bpmNorm < 2.0/3.0) {
        var sub = (bpmNorm-1.0/3.0)*3.0;
        circleColor.red = 255;
        circleColor.green = 255 - 125*sub;
        circleColor.blue = 0.0;
    } else {
        sub = (bpmNorm-2.0/3.0)*3.0;
        circleColor.red = 255;
        circleColor.green = 125 - 125*sub;
        circleColor.blue = 0.0;
    }

    if (document.getElementById("white").checked) {
        centerColor.red = 65;
        centerColor.green = 65;
        centerColor.blue = 65;

        mainColor.red = 65;
        mainColor.green = 65;
        mainColor.blue = 65;

        waveColor.red = 255;
        waveColor.green = 255;
        waveColor.blue = 255;

        circleColor.red = 255;
        circleColor.green = 255;
        circleColor.blue = 255;
    }

        
    }


    //calculate HSV color from mouse coords on color block
    var mag = sqrt(mx*mx+my*my);
    
    if (mouseDownOnColor) {

        //Calculate RGB from HSV

        //Center Color
        var colorFromHSV = [];
    
        if (colorToggle == 0) {
            centerColor.hue = (my < 0) ? (acos(mx/mag))/PI/2*360 : (PI*2 - acos(mx/mag))/PI/2*360;
            centerColor.saturation = min(255, (mag/colorWheelRadius*1.25)*255);
            centerColor.value = 1.0;//(1.0-0.5*mag/(1.0*colorWheelRadius));

            colorFromHSV = hsv_to_rgb(centerColor.hue, centerColor.saturation, centerColor.value);
            centerColor.red = colorFromHSV.red*0.9;
            centerColor.green = colorFromHSV.green*0.75;
            centerColor.blue = colorFromHSV.blue;

        } else if (colorToggle == 1) {
            mainColor.hue = (my < 0) ? (acos(mx/mag))/PI/2*360 : (PI*2 - acos(mx/mag))/PI/2*360;
            mainColor.saturation = min(255, (mag/colorWheelRadius*1.25)*255);
            mainColor.value = 1.0;//(1.0-0.5*mag/(1.0*colorWheelRadius));

            colorFromHSV = hsv_to_rgb(mainColor.hue, mainColor.saturation, mainColor.value);
            mainColor.red = colorFromHSV.red*0.9;
            mainColor.green = colorFromHSV.green*0.75;
            mainColor.blue = colorFromHSV.blue;

        } else if (colorToggle == 2) {
            waveColor.hue = (my < 0) ? (acos(mx/mag))/PI/2*360 : (PI*2 - acos(mx/mag))/PI/2*360;
            waveColor.saturation = min(255, (mag/colorWheelRadius*1.25)*255);
            waveColor.value = 1.0;//(1.0-0.5*mag/colorWheelRadius);
            
            colorFromHSV = hsv_to_rgb(waveColor.hue, waveColor.saturation, waveColor.value);
            waveColor.red = colorFromHSV.red*0.9;
            waveColor.green = colorFromHSV.green*0.75;
            waveColor.blue = colorFromHSV.blue;

        } else if (colorToggle == 3) {
            circleColor.hue = (my < 0) ? (acos(mx/mag))/PI/2*360 : (PI*2 - acos(mx/mag))/PI/2*360;
            circleColor.saturation = min(255, (mag/colorWheelRadius*1.25)*255);
            circleColor.value = 1.0;//(1.0-0.5*mag/colorWheelRadius);
            
            colorFromHSV = hsv_to_rgb(circleColor.hue, circleColor.saturation, circleColor.value);
            circleColor.red = colorFromHSV.red*0.9;
            circleColor.green = colorFromHSV.green*0.75;
            circleColor.blue = colorFromHSV.blue;
        }

    }
    mouseDownOnColor = false;


    var centerColorDot = document.getElementById("centerColorDot");
    var mainColorDot = document.getElementById("mainColorDot");
    var waveColorDot = document.getElementById("waveColorDot");
    var circleColorDot = document.getElementById("circleColorDot");
    centerColorDot.style.fill = 'rgb(' + centerColor.red + ',' + centerColor.green + ',' + centerColor.blue + ')';
    mainColorDot.style.fill = 'rgb(' + mainColor.red + ',' + mainColor.green + ',' + mainColor.blue + ')';
    waveColorDot.style.fill = 'rgb(' + waveColor.red + ',' + waveColor.green + ',' + waveColor.blue + ')';
    circleColorDot.style.fill = 'rgb(' + circleColor.red + ',' + circleColor.green + ',' + circleColor.blue + ')';
    


       //GRAPHS

       textSize(32);

       noFill();
       stroke(255,255,255,64);
       var graphWidth = width-height;
       //rect(-width/2, -height/2, graphWidth, height);
       rect(100, 0, graphWidth-100, height/3);
       rect(100, height/2, graphWidth-100, height/3);
       line(graphWidth-300, height/3, graphWidth-300, 0)
       line(graphWidth-300, height/2 + height/3, graphWidth-300, height/2)
       stroke(0, 255, 0, 255);
       line(100, height/4*3 - 50, graphWidth, height/4*3 - 50);
   
       stroke(255);
   
       beginShape();
       for (var i = 0; i < 50; i++) {
           var p = i/50;
           var norm = (altitudeHistoric[dataPoints-i]-ALTITUDE_MIN)/(ALTITUDE_MAX-ALTITUDE_MIN);
           vertex(graphWidth - (300)*p, height/3 - height/3*norm);
       }
       for (var i = dataPoints-50; i > 0; i--) {
           var p = i/(dataPoints-50);
           var norm = (altitudeHistoric[i]-ALTITUDE_MIN)/(ALTITUDE_MAX-ALTITUDE_MIN);
           vertex(100 + (graphWidth-400)*p, height/3 - height/3*norm);
       }
       endShape();
   
       fill(255);
       text("Altitude", graphWidth/2 - 65, height/3 + 50);
       noFill();
   
   
       fill(255);
       text("Biometrics", graphWidth/2 - 90, height - 50);
       noFill();
   
   
       textSize(16);
   
       drawingContext.setLineDash([2,20])
       stroke(circleColor.red, circleColor.green, circleColor.blue);
       beginShape();
       for (var i = 0; i < 50; i++) {
           var p = i/50;
           var norm = (bpmHistoric[dataPoints-i]-BPM_MIN)/(BPM_MAX-BPM_MIN);
           vertex(graphWidth - (300)*p, height/4*3 + (bpmStasis - norm)*height/6 - 50)
       }
       for (var i = dataPoints-50; i > 0; i--) {
           var p = i/(dataPoints-50);
           var norm = (bpmHistoric[i]-BPM_MIN)/(BPM_MAX-BPM_MIN);
           vertex(100 + (graphWidth-400)*p, height/4*3 + (bpmStasis - norm)*height/6 - 50)
       }
       endShape();
   
       noStroke();
       fill(255);
       var normT = (bpmHistoric[dataPoints-1]-BPM_MIN)/(BPM_MAX-BPM_MIN);
       text("HR", graphWidth + 5, height/4*3 + (bpmStasis - normT)*height/6 - 50)
       noFill();
   
       stroke(centerColor.red, centerColor.green, centerColor.blue);
       drawingContext.setLineDash([5, 5, 5, 30])
       beginShape();
       for (var i = 0; i < 50; i++) {
           var p = i/50;
           var norm = (o2SatHistoric[dataPoints-i]-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
           vertex(graphWidth - (300)*p, height/4*3 + (o2SatStasis - norm)*height/6 - 50)
       }
       for (var i = dataPoints-50; i > 0; i--) {
           var p = i/(dataPoints-50);
           var norm = (o2SatHistoric[i]-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
           vertex(100 + (graphWidth-400)*p, height/4*3 + (o2SatStasis - norm)*height/6 - 50)
       }
       endShape();
   
   
       noStroke();
       fill(255);
       var normT = (o2SatHistoric[dataPoints-1]-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
       text("O2", graphWidth + 45, height/4*3 + (o2SatStasis - normT)*height/6 - 50)
       noFill();
   
   
       stroke(waveColor.red, waveColor.green, waveColor.blue);
       drawingContext.setLineDash([20, 30])
       beginShape();
       for (var i = 0; i < 50; i++) {
           var p = i/50;
           var norm = (respRateHistoric[dataPoints-i]-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
           vertex(graphWidth - (300)*p, height/4*3 + (respRateStasis - norm)*height/6 - 50)
       }
       for (var i = dataPoints-50; i > 0; i--) {
           var p = i/(dataPoints-50);
           var norm = (respRateHistoric[i]-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
           vertex(100 + (graphWidth-400)*p, height/4*3 + (respRateStasis - norm)*height/6 - 50)
       }
       endShape();
       drawingContext.setLineDash([0,0])
   
   
       noStroke();
       fill(255);
       var normT = (respRateHistoric[dataPoints-1]-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
       text("RR", graphWidth + 85, height/4*3 + (respRateStasis - normT)*height/6 - 50)
       noFill();
    
    
    /* sample color
         context.fillStyle = 'hsl(' + mainColor.hue + ', 100%, ' + ((1.0-mainColor.saturation/255)*50+50) + '%)';
        context.beginPath();
         context.rect(colorWheelRadius/2, colorWheelRadius/2, 25, 25);
         context.closePath();
         context.fill();
         
         */
    
    
    /*Clock*/


    timeStamp = Date.now();
    var delta = timeStamp - pTimeStamp;
    pTimeStamp = timeStamp;

    clock += delta;
    span += delta;
    
    time = clock/20.0;

    state += delta/1000.0*speed;

    //rotation += delta/50.0*rotationSpeed;
    
    waveOffset += 0.03*waveSpeed;
    if (waveOffset > 1.0) waveOffset--;
    
    //if (rotation > PI*2) rotation -= PI*2;

    /*if (abs(respRate-newRespRate) > 0.01) {
        newRespRate += (respRate-newRespRate)*0.001;
    }*/

    var period = 60.0/bpm*1000.0; //time between heart beats in milliseconds
    var breathPeriod = 60.0/respRate*1000.0; //time between breaths in milliseconds

    //rotation = -PI*2*altitudeNorm;

    var stress = (bpmNorm - bpmStasis) + (o2SatStasis - o2SatNorm);

    rotation -= delta/2000.0*stress;

    //Logo

    
    /*HALO
        Rings with two scales of perlin noise (wobble and complexity), wave effects, and color gradient
        Parameters :
        RING COUNT
        COLOR GRADIENT (CENTER AND OUTER COLOR)
        COLOR RATIO (balance between colors)
        TILT (axis rotation)
        ROTATION (radial rotation)
        SPEED
        WOBBLE (large scale perlin)
        COMPLEXITY (small scale perlin)
        WAVE COUNT
        WAVE INTENSITY
        WAVE COLOR
    */
    
   
    //texture(logoTexture);
    //Center
    //

    //Circle
    //stroke(255);
    //fill(circleColor.red, circleColor.green, circleColor.blue);
    var w = radius*height*0.25;


    var w2 = height*0.5*0.125;


    if (span > period) {
        de = 0.75;
        span = 0.0;
        pulseRadius = 0.0;
        pulseBrightness = 1.0;

        if (soundID && document.getElementById("o2").checked) 
        createjs.Sound.play(soundID.src);
    }

    pulseRadius += (1.0-pulseRadius)*0.25;
    pulseBrightness *= 0.95;

    //heart rate radial expansion
    if (expansion < 1.0) expansion += de;
    if (expansion > 1.0) expansion = 1.0;
    de *= pow(0.8, delta/50.0);
    

    //Respiratory Rate

    strokeWeight(4 + 0*(1-respRateNorm));
    stroke(waveColor.red, waveColor.green, waveColor.blue);
    fill(waveColor.red*0.1, waveColor.green*0.1, waveColor.blue*0.1);
    noFill();
    var rad = w2*2 + w2*2*(1+sin(clock/breathPeriod*PI*2))/2
    //circle(0, 0, rad);
    if (document.getElementById("rr").checked) {
    beginShape();
    for (var i = 0; i < 1.0; i += 0.001) {
        var a = 6, b = 4;
        var r = rad/2 + w2/2*(1+sin(i*PI*a))/2;
        vertex(atomCenter.x + r*cos(i*PI*b + time/15.0*(respRateNorm + 0.1)), atomCenter.y + r*sin(i*PI*b + time/15.0*(respRateNorm + 0.1)));
    }
    endShape(CLOSE);
}


    stroke(255);
    noStroke();
    stroke(circleColor.red*pulseBrightness, circleColor.green*pulseBrightness, circleColor.blue*pulseBrightness);
    fill(circleColor.red*pulseBrightness*0.5, circleColor.green*pulseBrightness*0.5, circleColor.blue*pulseBrightness*0.5);
    strokeWeight(6);

    //BPM
    if (document.getElementById("o2").checked) {

    
        beginShape();
        for (var i = 0; i < 1.0; i += 0.005) {
            var rad = pulseRadius*w2*1;
            var r = rad + rad/7*(1+sin(i*PI*16))/2;
            
            var r = w2*1/8 + expansion*w2*1/8*3 + (0.+de)*w/25*(sin(i*PI*8 + 0.5*time) + sin(i*PI*10 - 0.5*time));
            var x1 = r*0.25*cos(i*PI*2 - PI/2), y1 = r*0.25*sin(i*PI*2 - PI/2);
            var x2 = (16*pow(sin(i*PI*2), 3))*r*0.11, y2 = -(13*cos(i*PI*2) - 5*cos(2*i*PI*2) - 2*cos(3*i*PI*2) - cos(4*i*PI*2))*r*0.11;
            
            //vertex(100 + x1 + (x2-x1), y1 + (y2-y1));
            vertex(atomCenter.x + x2, atomCenter.y + y2);
            
            //vertex(100 + x1, y1);
        }
        endShape(CLOSE);

}
    //BPM 2
    if (document.getElementById("o2").checked) {
    beginShape();
    for (var i = 0; i < 1.0; i += 0.01) {
        var r = w2*2/8 + expansion*w2*2/8*3 + (0.+de)*w/15*(sin(i*PI*8 + 0.5*time) + sin(i*PI*10 - 0.5*time));
        //vertex(atomCenter.x + r*cos(i*PI*2), r*sin(i*PI*2));
    }
    endShape(CLOSE);
}



    expansion *= pow(0.2, delta/50.0);

    expansion2 += de;

    radius = w2*5/height;

    
    //image(logoTexture, -w/2, -w/2, w, w);

    //rotateY(yAngle);
    //rotateX(xAngle);


    //blendMode(BURN);

    colorMode(RGB);
    noFill();
    strokeWeight(2);

    if (document.getElementById("halo").checked) {

    //Concentric rings
  for (var i = 0; i < 1.0; i += 1.0/ringCount) {
      stroke(
            mainColor.red*(i-colorRatio) + centerColor.red*(1.0-i+colorRatio),
            mainColor.green*(i-colorRatio) + centerColor.green*(1.0-i+colorRatio),
            mainColor.blue*(i-colorRatio) + centerColor.blue*(1.0-i+colorRatio), 255);

            stroke(
                  (mainColor.red*(i-colorRatio) + centerColor.red*(1.0-i+colorRatio))*(1+3*pow(noise(i*255.0, 111), 3)),
                  (mainColor.green*(i-colorRatio) + centerColor.green*(1.0-i+colorRatio))*(1+3*pow(noise(i*255.0, 3), 3)),
                  (mainColor.blue*(i-colorRatio) + centerColor.blue*(1.0-i+colorRatio))*(1+3*pow(noise(i*255.0), 3)), 127);

      
            //Wave ring case
      if (waveCount > 0 && floor((i-waveOffset) * ringCount) % floor(ringCount/waveCount) == 0) {
          strokeWeight(2);
          stroke(
            waveColor.red*(0.7) + mainColor.red*(0.3),
            waveColor.green*(0.7) + mainColor.green*(0.3),
            waveColor.blue*(0.7) + mainColor.blue*(0.3));
            stroke(
              waveColor.red*sqrt(1-i) + mainColor.red*sq(i),
              waveColor.green*sqrt(1-i) + mainColor.green*sq(i),
              waveColor.blue*sqrt(1-i) + mainColor.blue*sq(i));
      }
      
      beginShape();
      for (var t = 0; t < 1.0; t += 0.005) {
          var rNoise = (complexity+expansion*0.0)*(noise(3 + time/3*speed - 3*i + 5*cos(t*PI*2), 3 + time/3*speed - 3*i + 5*sin(t*PI*2), i*5*complexity + expansion2*0.0)-0.5);
          //var rNoise = complexity*i*(noise(3 + state - 1*i + 5*cos(t*PI*2), 3 + state - 1*i + 5*sin(t*PI*2), i*2*complexity));
          //var xNoise = complexity*i*0*(noise(25 + time/5 + 155*cos(t*PI*2), 25 + time/5 + 155*sin(t*PI*2), i*1-time/5)-0.5);
          //var yNoise = complexity*i*0*(noise(15 + time/5 + 155*cos(t*PI*2), 15 + time/5 + 155*sin(t*PI*2), i*1-time/5)-0.5);
          //var zNoise = complexity*pow(i,0.5)*(noise(t*5 + time/50)-0.5);//sin(t*PI*8 + time);//(noise(3 + time/5 + 5*cos(t*PI*2), 3 + time/5 + 5*sin(t*PI*2), i*1-time/5)-0.5);
          //var xWobble = wobble*i*width*3.0/8.0*(noise(3 + time/5 + 0.5*cos(t*PI*2), 3 + time/5 + 0.5*sin(t*PI*2), i*1+time/5)-0.5);
          //var yWobble = wobble*i*width*3.0/8.0*(noise(8 + time/5 + 0.5*cos(t*PI*2), 8 + time/5 + 0.5*sin(t*PI*2), i*1+time/5)-0.5);
          
          //var x = (radius*width*180.0/800.0 + (i)*width*150.0/800.0*size + rNoise + xWobble)*cos(t*PI*2 + rotation) + xNoise;
          //var y = (radius*width*180.0/800.0 + (i)*width*150.0/800.0*size + rNoise + yWobble)*sin(t*PI*2 + rotation) + yNoise;


          //var x = (radius*width*0.25 + i*size*width*0.125*(1+rNoise) + 0*xWobble)*cos(t*PI*2 + rotation) + xNoise;
          //var y = (radius*width*0.25 + i*size*width*0.125*(1+rNoise) + 0*yWobble)*sin(t*PI*2 + rotation) + yNoise;


          var x = (radius*height*0.5 + i*size*height*(1-radius)*0.5*(0.5+rNoise))*cos(t*PI*2 + rotation);
          var y = (radius*height*0.5 + i*size*height*(1-radius)*0.5*(0.5+rNoise))*sin(t*PI*2 + rotation);

          var z = 0.0;
          vertex(atomCenter.x + x, atomCenter.y + y, z);
      }
      endShape(CLOSE);
      strokeWeight(2);
  }
    
}
    //Draw FX
    

    //translate(-center.x, -center.y, 200);

    
    
}

//outputs RGB values based on a normalized o2 sat value
function o2SatColor(x) {
    var color = [];
    x = 1-x;
    if (x < 1.0/3.0) { //green to cyan
        var subx = x*3.0;
        color.red = 0.0;
        color.green = 1.0;
        color.blue = subx;
    } else if (x < 2.0/3.0) { //cyan to blue
        var subx = (x-1.0/3.0)*3.0;
        color.red = 0.0;
        color.green = 1.0-subx;
        color.blue = 1.0;
    } else if (x < 1.0) {
        var subx = (x-2.0/3.0)*3.0;
        color.red = 0.5*subx;
        color.green = 0.0;
        color.blue = 1.0;
    }

    return color;
}

function mask() {
    circle(200, 0, 200);
}

function lerpBump(x) {
    if (x >= 0.0 && x < 0.5) return 0.5 + 0.5*(3*4*x*x - 2*9*x*x*x);
    else if (x <= 1.0) return 1.0-(3*pow(2*x-1, 2) - 2*pow(2*x-1,3));
}

function miniStairStep(x) {
    return stair(x*PI*8) / (PI*16) + 0.5;
}
function stairStep(x) {
    return stair((x*PI*8)) / (8*PI);
}
function stair(x) {
    return x - sin(x);
}

function rlerp(x) {
    return 1 - x*x*x;
}

function hsv_to_hsl(h, s, v) {
    // both hsv and hsl values are in [0, 1]
    var l = (2 - s) * v / 2;

    if (l != 0) {
        if (l == 1) {
            s = 0
        } else if (l < 0.5) {
            s = s * v / (l * 2)
        } else {
            s = s * v / (2 - l * 2)
        }
    }

    return [h, s, l]
}

function hsv_to_rgb(h, s, v) {

    var color = [];

    var c = s/255;
    var x = c*(1-abs((h/60) % 2 - 1));
    var m = 1.0 - c;
    var rgb = [];
    if (h < 60) {
        rgb.r = c;
        rgb.g = x;
        rgb.b = 0;
    } else if (h < 120) {
        rgb.r = x;
        rgb.g = c;
        rgb.b = 0;
    } else if (h < 180) {
        rgb.r = 0;
        rgb.g = c;
        rgb.b = x;
    } else if (h < 240) {
        rgb.r = 0;
        rgb.g = x;
        rgb.b = c;
    } else if (h < 300) {
        rgb.r = x;
        rgb.g = 0;
        rgb.b = c;
    } else if (h < 360) {
        rgb.r = c;
        rgb.g = 0;
        rgb.b = x;
    }

    color.red = (rgb.r+m)*255*v;
    color.green = (rgb.g+m)*255*v;
    color.blue = (rgb.b+m)*255*v;

    return color;
}



function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        mouseDownOnCanvas = true;
        mousePressLoc.x = mouseX;
        mousePressLoc.y = mouseY;
    }
}

function mouseDragged() {
    if (mouseDownOnCanvas) {
        yAngle = lastYAngle + (mouseX - mousePressLoc.x)/255;
        xAngle = lastXAngle - (mouseY - mousePressLoc.y)/255;
    }
    
}

function mouseReleased() {

    if (mouseDownOnCanvas) {
        lastYAngle = yAngle;
        lastXAngle = xAngle;
    }

    mouseDownOnCanvas = false;

    console.log(mainColor)
}


/*Old color function

    stroke(colorA.x*i*colorRatio*2 + colorB.x*(1.0-i)*(1.0-colorRatio)*2, colorA.y*i*colorRatio*2 + colorB.y*(1.0-i)*(1.0-colorRatio)*2, colorA.z*i*colorRatio*2 + colorB.z*(1.0-i)*(1.0-colorRatio)*2);*/