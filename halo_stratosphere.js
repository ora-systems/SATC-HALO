
var graph;
var font;
var soundReady = false;
var soundID;

var simData = [];

var mode = 0;

var initial = true;
var time = 0.0, dur = 0.0;
var pTimeStamp = 0.0, timeStamp = 0.0, clock = 0.0, span = 0.0;
var SPEED = 1.0;


const ALTITUDE_MIN = 0.0, ALTITUDE_MAX = 30000.0;
const BPM_MIN = 30.0, BPM_MAX = 170.0;
const O2SAT_MIN = 0.50, O2SAT_MAX = 1.0;
const RESP_RATE_MIN = 1.0, RESP_RATE_MAX = 50.0;


var altitudeHistoric = [];
var bpmHistoric = [];
var o2SatHistoric = [];
var respRateHistoric = [];
var dataPoints = 0;

var altitude = 5000.0;
var bpm = 129.0;
var o2Sat = 0.8;
var respRate = 20.0;

var altitudeNew = 3000.0;
var bpmNew = 60.0;
var o2SatNew = 0.94;
var respRateNew = 20.0;

var altitudeDelta = 0.0;
var bpmDelta = 0.0;
var o2SatDelta = 0.0;
var respRateDelta = 0.0;

var lastStress = 0.0, stressDelta = 0.0, stressMid = 0.0, stressSensitivity = 2.0;
var lastRespStress = 0.0, respStressDelta = 0.0, respStressMid = 0.0, respStressSensitivity = 5.0;


//Visual Data
var atomCenter = [];
var centerColor = [], mainColor = [], waveColor = [], circleColor = [];
var pulses = [];
var particles = [];

var rotation = 0.0, complexity = 0.0;

var waveOffset = 0.0;
var ringCount = 0


var expansion = 0.0, de = 0.0;
var breathExpansion = 0.0;
var respRotation = 0.0;

var expansionTotal = 0.0;

var bpmStasis = 0;
var o2SatStasis = 0;
var respRateStasis = 0;

var bpmStasisNorm = 0;
var o2SatStasisNorm = 0;
var respRateStasisNorm = 0;


var heartClock = 0.0;

function preload() {
    font = loadFont('resources/BebasNeue-Regular.ttf');

}

function updateData() {
    console.log("DATA ");
    const control = document.getElementById("data_control");
    mode = control.value;

    if (mode == 0) {
        fetch("resources/PassiveRecovery2.csv")
        .then((res) => res.text())
        .then((text) => {
            simData = CSVToArray(text);
            simData.shift();
    
            console.log(simData)
            initial = true;
        
            stressSensitivity = 4.0;
    
        altitude = simData[0][1];
        bpm = simData[0][3];
        o2Sat = simData[0][2]/100.0;
        respRate = simData[0][4];

        bpmStasis = 80;
        o2SatStasis = 0.94;
        respRateStasis = 14.0;
        setStasisNorms();

         })
        .catch((e) => console.error(e));
    } else if (mode == 1) {
        fetch("resources/GenPop.csv")
        .then((res) => res.text())
        .then((text) => {
            simData = CSVToArray(text);
            simData.shift();
    
            console.log(simData)
            initial = true;

            stressSensitivity = 4.0;
    
        altitude = simData[0][1];
        bpm = simData[0][3];
        o2Sat = simData[0][2]/100.0;
        respRate = simData[0][4];

        bpmStasis = 60;
        o2SatStasis = 1.0;
        respRateStasis = 8.0;
        setStasisNorms();

         })
        .catch((e) => console.error(e));
    } else if (mode == 2) {
        fetch("resources/AmAthlete.csv")
        .then((res) => res.text())
        .then((text) => {
            simData = CSVToArray(text);
            simData.shift();
    
            console.log(simData)
            initial = true;

            stressSensitivity = 2.0;
    
        altitude = simData[0][1];
        bpm = simData[0][3];
        o2Sat = simData[0][2]/100.0;
        respRate = simData[0][4];

        bpmStasis = 60;
        o2SatStasis = 1.0;
        respRateStasis = 8.0;
        setStasisNorms();

         })
        .catch((e) => console.error(e));
    } else if (mode == 3) {
        fetch("resources/data.csv")
        .then((res) => res.text())
        .then((text) => {
            simData = CSVToArray(text);
            simData.shift();
    
            console.log(simData)
            initial = true;

            stressSensitivity = 2.0;
    
        altitude = simData[0][1];
        bpm = simData[0][3];
        o2Sat = simData[0][2]/100.0;
        respRate = simData[0][4];

        bpmStasis = 60;
        o2SatStasis = 1.0;
        respRateStasis = 8.0;
        setStasisNorms();

         })
        .catch((e) => console.error(e));
    }

    time = 0.0;
    clock = 0.0;
    initial = true;
    dataPoints = 0;
    bpmHistoric = [];

    console.log("STASIS " + o2SatStasisNorm)
}

function setStasisNorms() {
    bpmStasisNorm = (bpmStasis-BPM_MIN)/(BPM_MAX-BPM_MIN);
    o2SatStasisNorm = (o2SatStasis-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
    respRateStasisNorm = (respRateStasis-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
}


function setup() {

    noiseSeed(0);
    textAlign(CENTER)


     if (!createjs.Sound.initializeDefaultPlugins()) {
        console.log("soundjs error")
    }

    var soundSrc = "./resources/thump.wav"
    createjs.Sound.alternateExtensions = ["wav"];
    createjs.Sound.addEventListener("fileload", soundLoaded);
    createjs.Sound.registerSound(soundSrc);




    /*P5 JS canvas for PIL + HALO render*/
    
    var width = 1720/1.5;//3440;//document.getElementById("canvasSection").offsetWidth;
    var height = 720/1.5;//1440;//document.getElementById("canvasSection").offsetHeight;
    width = window.innerWidth;
    height = width*0.4186;

    console.log(window.clientWidth);
    var p5Canvas = createCanvas(width, height);
    p5Canvas.parent('canvasSection');
    //center.x = 0;
    //center.y = 0;


    //Set duration
    pTimeStamp = Date.now();
    dur = 60*22*1000;

    //Set Stasis Values
    if (mode == 0) {
        bpmStasisNorm = (60-BPM_MIN)/(BPM_MAX-BPM_MIN);
        o2SatStasisNorm = (1.0-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
        respRateStasisNorm = (8.0-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
    } else if (mode == 1) {
        bpmStasisNorm = (80-BPM_MIN)/(BPM_MAX-BPM_MIN);
        o2SatStasisNorm = (0.94-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
        respRateStasisNorm = (14.0-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
    } else if (mode == 2) {
        bpmStasisNorm = (60-BPM_MIN)/(BPM_MAX-BPM_MIN);
        o2SatStasisNorm = (1.0-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
        respRateStasisNorm = (8.0-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
    } else if (mode == 3) {
        bpmStasisNorm = (60-BPM_MIN)/(BPM_MAX-BPM_MIN);
        o2SatStasisNorm = (1.0-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
        respRateStasisNorm = (8.0-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
    }

    atomCenter.x = width*4.0/5.0;
    atomCenter.y = height*2.0/6.0;


    graph = loadImage("resources/satc_Logo.jpg");
    

    textFont(font);
    
 
    updateData();
}







function interpolateData(data, t, n) {
    if (t < 0) t = 0;
    if (data) {
    if (t > data.length-1) t = data.length-1;
    var p = t-floor(t);
    var i = floor(t);
    var pointA = 0; 
    if (data[i] && data[i][n]) {

    pointA = (data[i+1]) ?
     data[i][n] + (data[i+1][n] - data[i][n])*p :
     data[i][n];
    }
    return pointA;
    }
    return 0;
}


function draw() {


    if (clock/15000.0 > simData.length-1 || clock > dur) { 
        //Reset
        clock = 0.0;
        initial = true;
        stressDelta = 0;
        dataPoints = 0;
    }




    /* DATA */
    if (simData[1]) {
        altitude = interpolateData(simData, clock/15000.0, 1);
        o2Sat = interpolateData(simData, clock/15000.0, 2)/100.0;
        bpm = interpolateData(simData, clock/15000.0, 3);
        respRate = interpolateData(simData, clock/15000.0, 4);
    }

    //Normalized 
    var altitudeNorm = (altitude-ALTITUDE_MIN)/(ALTITUDE_MAX-ALTITUDE_MIN)
    var bpmNorm = (bpm-BPM_MIN)/(BPM_MAX-BPM_MIN)
    var o2SatNorm = (o2Sat-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN)
    var respRateNorm = (respRate-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN)

    var period = 60.0/bpm*1000.0; //time between heart beats in milliseconds
    var breathPeriod = 60.0/respRate*1000.0; //time between breaths in milliseconds




    /* CLOCK */
    timeStamp = Date.now();
    var delta = timeStamp - pTimeStamp;
    pTimeStamp = timeStamp;


    clock += delta*SPEED;
    span += delta;

    
    time = clock/20.0;


    //Parameters
    if (span > period) {
        de = 0.75;
        span = 0.0;

        pulses.push(0);

        for (var i = 0; i < 100; i++) {
            particles.push([0, random(1)*PI*2, 0.5 + 2.0*pow(random(1), 0.5 + 3.0*(1.0-bpmNorm)), (random(2)-1)*0.0]);
        }

        if (soundID && document.getElementById("sound").checked) 
        createjs.Sound.play(soundID.src);
    }


    //heart rate radial expansion
    if (expansion < 1.0) expansion += de;
    if (expansion > 1.0) expansion = 1.0;

    expansionTotal += de;
    breathExpansion += delta/breathPeriod;



    //Stress rotational momentum
    var stress = ((bpmNorm - bpmStasisNorm) + (o2SatStasisNorm - o2SatNorm))*stressSensitivity;
    var respStress = (respRateNorm - respRateStasisNorm)*respStressSensitivity;
 

    if (initial) {
        lastStress = stress;
        stressMid = 0.0;
        lastRespStress = respStress;
        respStressMid = 0.0;
        initial = false;
        console.log("INITIAL VALUE ")
    }


    stressMid += ((stress-lastStress) - stressMid)*delta*0.0005;
    respStressMid += ((respStress-lastRespStress) - respStressMid)*delta*0.0005;

    rotation -= delta*stressMid;
    respRotation -= delta*respStressMid;

    lastStress = stress;
    lastRespStress = respStress;
    

    //other sources (data, random)

    size = 0.75;                
    complexity = 0.75;      
    colorRatio = 0.5;       
    ringCount = 100;        
    waveCount = 0.0;
    waveSpeed = 0.0;
    speed = 0.05; 



    o2SatHistoric[dataPoints] = o2Sat;
    dataPoints++;
    var historicDelta = (dataPoints >= 155) ? dataPoints-155 : 0;
    historico2satNorm = (o2SatHistoric[historicDelta] - O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
    
    //green(StasisNorm) to cyan to blue to purple
    var c = o2SatColor(o2SatNorm);
    centerColor.red = c.red*255;
    centerColor.green = c.green*255;
    centerColor.blue = c.blue*255;
    c = o2SatColor(historico2satNorm);
    mainColor.red = c.red*255;
    mainColor.green = c.green*255;
    mainColor.blue = c.blue*255;


   var color = bpmColor(bpmNorm);
   circleColor.red = color.red;
   circleColor.green = color.green;
   circleColor.blue = color.blue;

   
   color = respRateColor(respRateNorm);
   waveColor.red = color.red*255;
   waveColor.green = color.green*255;
   waveColor.blue = color.blue*255;



   /* VISUALS */

   background(0);
   stroke(255)

   rect(0, 0, width, height);

    
   //SPECTRUMS


var spectrumY = height/20*17, s1x = width/10*7, s2x = width/10*8, s3x = width/10*9, sw = width/20;

//Meter
noFill();
stroke(255);
var meter = s1x + sw*(bpmNorm - 0.5);
line(meter, spectrumY - 5, meter, spectrumY + 15)
//line(graphWidth, graphB + graphHeightB*(1-bpmNorm), graphWidth + 25, graphB + graphHeightB*(1-bpmNorm));
meter = s2x + sw*(o2SatNorm - 0.5);
line(meter, spectrumY - 5, meter, spectrumY + 15)
//line(graphWidth, graphC + graphHeightB*(1-o2SatNorm), graphWidth + 25, graphC + graphHeightB*(1-o2SatNorm));
meter = s3x + sw*(respRateNorm - 0.5);
line(meter, spectrumY - 5, meter, spectrumY + 15)
//line(graphWidth, graphD + graphHeightB*(1-respRateNorm), graphWidth + 25, graphD + graphHeightB*(1-respRateNorm));

stroke(0, 255, 0, 64);
//rect(s1x - 20, spectrumY + width*0.0275, s3x-s1x + 40, width*0.015);

noStroke(); // Color bar
for (var i = 0; i < 1.05; i += 0.05) {
    var c = bpmColor(i);
    fill(c.red, c.green, c.blue);
    rect(s1x - sw/2 + i*sw, spectrumY, 5, 10);
    //rect(graphWidth + 10, graphB + (graphHeightB-5)*(1.0-i), 5, 5);

    c = o2SatColor(i);
    fill(c.red*255, c.green*255, c.blue*255);
    rect(s2x - sw/2 + i*sw, spectrumY, 5, 10);
    //rect(graphWidth + 10, graphC + (graphHeightB-5)*(1.0-i), 5, 5);

    c = respRateColor(i);
    fill(c.red*255, c.green*255, c.blue*255);
    rect(s3x - sw/2 + i*sw, spectrumY, 5, 10);
    //rect(graphWidth + 10, graphD + (graphHeightB-5)*(1.0-i), 5, 5);
}


//Labels
textSize(24*(width/1700));
fill(0, 255, 0, 127);
//text("Stasis", s2x, spectrumY + width*0.06);
text("[" + round(bpmStasis) + "]", s1x, spectrumY + width*0.04);
text("[" + round(o2SatStasis*100.0) + "%]", s2x, spectrumY + width*0.04);
text("[" + round(respRateStasis) + "]", s3x, spectrumY + width*0.04);


fill(255);
text("BPM", s1x, spectrumY - width*0.01);
text(round(bpm), s1x, spectrumY + width*0.025);
//text("BPM " + round(bpm), graphWidth + 30, graphB + graphHeightB/2.0);
text("SpO2", s2x, spectrumY - width*0.01);
text(round(o2Sat*100.0) + "%", s2x, spectrumY + width*0.025);
//text("SpO2 " + round(o2Sat*100.0) + "%", graphWidth + 30, graphC + graphHeightB/2.0);
text("RR", s3x, spectrumY - width*0.01);
text(round(respRate), s3x, spectrumY + width*0.025);
//text("RR " + round(respRate), graphWidth + 30, graphD + graphHeightB/2.0);

textSize(32*(width/1700))
fill(255)
if (mode == 0) {
    text("Passive Recovery", atomCenter.x, height - height/4)
} else if (mode == 1) {
    text("General Population", atomCenter.x, height - height/4)
} else if (mode == 2) {
    text("Amateur Athlete", atomCenter.x, height - height/4)
} else if (mode == 3) {
    text("Bobby Williams", atomCenter.x, height - height/4)
}


       //GRAPHS

       var graphWidth = width-height;
       var graphHeight = height/4;
       var graphHeightB = height/8;
       var graphA = height/10;
       var graphB = height/7*4;
       var graphC = height/7*5;
       var graphD = height/7*6;

       noFill();
       stroke(255,255,255,64); //Graph rectangles
       rect(100, graphA, graphWidth-100, graphHeight);
       line(50, graphA + graphHeight*1.5, graphWidth + 50, graphA + graphHeight*1.5);
       rect(100, graphB, graphWidth-100, graphHeightB);
       rect(100, graphC, graphWidth-100, graphHeightB);
       rect(100, graphD, graphWidth-100, graphHeightB);

       stroke(0, 255, 0, 125); //Stasis lines
       line(100, graphB + graphHeightB*(1-bpmStasisNorm), graphWidth, graphB + graphHeightB*(1-bpmStasisNorm));
       line(100, graphC + graphHeightB*(1-o2SatStasisNorm), graphWidth, graphC + graphHeightB*(1-o2SatStasisNorm));
       line(100, graphD + graphHeightB*(1-respRateStasisNorm), graphWidth, graphD + graphHeightB*(1-respRateStasisNorm));



       //Graph labels
       noStroke();
       fill(255);


       textSize(24*(width/1700));

       var seconds = clock/1000.0;
       text("t = " + round(seconds), width-50, 50);

       text("Session Elevation", 100 + (graphWidth-100)/2.0, graphA - width*0.01);
       text("Performance", 100 + (graphWidth-100)/2.0, graphB - width*0.01);

       textSize(16*(width/1700));
       text("Time (mm:ss)", 100 + (graphWidth-100)/2.0, graphA + graphHeight + width*0.03)
       translate(50, graphA + graphHeight/2)
       rotate(-PI/2)
       text ("Altitude (ft)", 0, 0);
       rotate(PI/2)
       translate(-50, -graphA - graphHeight/2)


       text("BPM", 75, graphB + graphHeightB/2)
       text("O2", 75, graphC + graphHeightB/2)
       text("RR", 75, graphD + graphHeightB/2)

       //Axis numbers
       for (var i = 0; i <= 1.0; i += 1.0/4.0) {
        noStroke();
        text((1-i)*30 + "'", 80, graphA + graphHeight*i)
        stroke(255);
        line(95, graphA + graphHeight*i, 105, graphA + graphHeight*i)
       }

       for (var i = 0; i <= 1.0; i += 1.0/(dur/1000/60)/4.0) {
        var min = floor(i*dur/1000/60);
        var sec = round(i*dur/1000 - min*60);
        if (sec > 59) {
            sec = 0;
            min += 1;
        }
        var zero = (sec < 10) ? "0" : "";
        noStroke();
        if (sec < 10) {
            text(min + ":" + sec + zero, 100 + (graphWidth-100)*i, graphA + graphHeight + 25);
            stroke(255)
        } else {
            stroke(255,255,255,127)
        }
        line(100 + (graphWidth-100)*i, graphA + graphHeight + 5, 100 + (graphWidth-100)*i, graphA + graphHeight - 5);
       }



       //CURVES
       for (var i = 0; i < 1.0; i += 1.0/graphWidth) {
        var p = clock/(dur);
        var offset = 0.0;
        if (p > 1.0) { //if clock exceeds duration, add offset to clock so that most recent data is shown
            p = 1.0;
            offset = (clock - dur)/15000.0;
        }
            noStroke();

            fill(255);
           var norm = (interpolateData(simData, offset + i*clock/15000.0, 1)-ALTITUDE_MIN)/(ALTITUDE_MAX-ALTITUDE_MIN);
           square(100 + p*i*(graphWidth-100), graphA + (1-norm)*graphHeight, 2);

           var norm = (interpolateData(simData, offset + i*clock/15000.0, 3)-BPM_MIN)/(BPM_MAX-BPM_MIN);
           var c = bpmColor(norm);
           fill(c.red, c.green, c.blue);
           //square(100 + p*(i)*(graphWidth-100), graphB + graphHeightB/2 + (bpmStasisNorm-norm)*graphHeightB/2, 2); //centered stasis
           square(100 + p*(i)*(graphWidth-100), graphB + (1-norm)*graphHeightB, 2); //relative stasis

           var norm = (interpolateData(simData, offset + i*clock/15000.0, 2)/100.0-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
           var c = o2SatColor(norm);
           fill(c.red*255, c.green*255, c.blue*255);
           //square(100 + p*(i)*(graphWidth-100), graphC + graphHeightB/2 + (o2SatStasisNorm-norm)*graphHeightB/2, 2); //centered stasis
           square(100 + p*(i)*(graphWidth-100), graphC + (1-norm)*graphHeightB, 2); //relative stasis

           var norm = (interpolateData(simData, offset + i*clock/15000.0, 4)-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
           var c = respRateColor(norm);
           fill(c.red*255, c.green*255, c.blue*255);
           //square(100 + p*(i)*(graphWidth-100), graphD + graphHeightB/2 + (respRateStasisNorm-norm)*graphHeightB/2, 2); //centered stasis
           square(100 + p*(i)*(graphWidth-100), graphD + (1-norm)*graphHeightB, 2); //relative stasis
       }
   
   
    
    
       /* ATOM */

    


    var w2 = height*0.5*0.125;

    stroke(circleColor.red, circleColor.green, circleColor.blue, 255);
    fill(circleColor.red, circleColor.green, circleColor.blue, 64*expansion);

    //BPM

        strokeWeight(2);
        circle(atomCenter.x, atomCenter.y, w2*2);
        noFill();
        for (var i = 0; i < pulses.length; i++) {
            var p = i/pulses.length;
            pulses[i] += 0.0007*delta;
            if (pulses[i] > 1.0) pulses.shift();
            for (var j = 0; j < 1.0; j += 0.1) {
                stroke(circleColor.red, circleColor.green, circleColor.blue,(1-j)*125*(1-pulses[i]))
                circle(atomCenter.x, atomCenter.y, w2*2 + w2*3*pulses[i] + j*40);
            }
        }

        noFill();
        stroke(circleColor.red, circleColor.green, circleColor.blue, 255);
        beginShape();
        for (var i = 0; i < 1.0; i += 0.01) {
            vertex(atomCenter.x - w2 + w2*2*i, atomCenter.y + expansion*pow(sin(i*PI), 1)*w2*2*(0.25*cos(i*PI*3) + 0.5*(noise(i*3.0, clock/500.0)-0.5)))
        }
        endShape();

        /* PARTICLES

            noStroke();
        for (var i = 0; i < particles.length; i++) {
            particles[i][0] += (0.01 + 0.05*particles[i][2])*0.05*delta;
            particles[i][2] *= 0.95;
            particles[i][1] += 0.1*particles[i][3];
            particles[i][3] += (random(2)-1)*0.05;
            
                fill(circleColor.red, circleColor.green, circleColor.blue,127*(1-particles[i][0])*expansion)
                //square(atomCenter.x + (w2 + w2*particles[i][0])*cos(particles[i][1]), atomCenter.y + (w2 + w2*particles[i][0])*sin(particles[i][1]), 2);
                fill(255, 255, 255, 255*(1-particles[i][0])*expansion);
                //fill(255);
                //square(atomCenter.x + (w2 + w2*particles[i][0])*cos(particles[i][1]), atomCenter.y + (w2 + w2*particles[i][0])*sin(particles[i][1]), 1);
            
                if (particles[i][0] > 1.0) particles.shift();
        }
*/

    




    //Respiratory Rate

    strokeWeight(4 + 0*(1-respRateNorm));
    stroke(waveColor.red, waveColor.green, waveColor.blue);
    
    var rad = w2*2.25 + w2*1.5*(1+sin(breathExpansion*PI*2))/2;
    //circle(0, 0, rad);
        beginShape();
        for (var i = 0; i < 1.0; i += 0.001) {
            var a = 6, b = 4;
            var r = rad/2 + w2/2*(1+sin(i*PI*a))/2;
            vertex(atomCenter.x + r*cos(i*PI*b + respRotation), atomCenter.y + r*sin(i*PI*b + respRotation));
        }
        endShape(CLOSE);
        strokeWeight(1);
        stroke(255);
        beginShape();
        for (var i = 0; i < 1.0; i += 0.001) {
            var a = 6, b = 4;
            var r = rad/2 + w2/2*(1+sin(i*PI*a))/2;
            vertex(atomCenter.x + r*cos(i*PI*b + respRotation), atomCenter.y + r*sin(i*PI*b + respRotation));
        }
        endShape(CLOSE);




    
    //image(logoTexture, -w/2, -w/2, w, w);

    //rotateY(yAngle);
    //rotateX(xAngle);


    //blendMode(BURN);
      radius = w2*5/height;

    colorMode(RGB);
    noFill();
    strokeWeight(2);


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
          var rNoise = (complexity+expansion*0.0)*(noise(5 + 5*cos(t*PI*2), 5 + clock/60*speed + 5*sin(t*PI*2), i*5*complexity - time/2*speed)-0.5);


          var x = (radius*height*0.5 + i*size*height*(1-radius)*0.5*(0.5+rNoise))*cos(t*PI*2 + rotation);
          var y = (radius*height*0.5 + i*size*height*(1-radius)*0.5*(0.5+rNoise))*sin(t*PI*2 + rotation);

          var z = 0.0;
          vertex(atomCenter.x + x, atomCenter.y + y, z);
      }
      endShape(CLOSE);
      strokeWeight(2);
  }

  


    //Dampen momentum variables
  
      expansion *= pow(0.2, delta/50.0);
      de *= pow(0.8, delta/50.0);


      stressDelta *= 0.995;
      respStressDelta *= 0.905;
    


    
    
}

// ref: http://stackoverflow.com/a/1293163/2343
        // This will parse a delimited string into an array of
        // arrays. The default delimiter is the comma, but this
        // can be overriden in the second argument.
        function CSVToArray( strData, strDelimiter ){
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");
     
            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
     
                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
     
                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
                );
     
     
            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];
     
            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;
     
     
            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec( strData )){
     
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];
     
                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                    strMatchedDelimiter.length &&
                    strMatchedDelimiter !== strDelimiter
                    ){
     
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push( [] );
     
                }
     
                var strMatchedValue;
     
                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){
     
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[ 2 ].replace(
                        new RegExp( "\"\"", "g" ),
                        "\""
                        );
     
                } else {
     
                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[ 3 ];
     
                }
     
     
                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( parseFloat(strMatchedValue) );
            }
     
            // Return the parsed data.
            return( arrData );
        }


function soundLoaded(event) {
    soundReady = true;
    soundID = event;
    console.log("sound loaded")
}

function isoLine(s, o, pos1, pos2) {
    var a = projectIso(s, pos1);
    var b = projectIso(s, pos2);
    line(o[0] + a[0], o[1] + a[1], o[0] + b[0], o[1] + b[1]);
}

function projectIso(s, isopos) {
    var projpos = [s*(isopos[0]*cos(0)*8.0 + isopos[1]*cos(2*PI/3) + isopos[2]*cos(4*PI/3)), 
    s*(isopos[0]*sin(0)*8.0 + isopos[1]*sin(2*PI/3) + isopos[2]*sin(4*PI/3))];

       return projpos;
}

//dark green (below StasisNorm) green (StasisNorm)
function bpmColor(x) {
    var color = [];
    if (x < 1.0/3.0) {
        var sub = x*3.0;
        color.red = 255*sub;
        color.green = 255;
        color.blue = 0.0;
    } else if (x < 6.0/7.0) {
        var sub = (x-1.0/3.0)/(6.0/7.0-1.0/3.0);
        color.red = 255;
        color.green = 255 - 125*sub;
        color.blue = 0.0;
    } else {
        sub = (x-6.0/7.0)/(1.0-6.0/7.0);
        color.red = 255;
        color.green = 125 - 125*sub;
        color.blue = 0.0;
    }

    var mid1 = bpmStasisNorm + (1.0-bpmStasisNorm)*0.5;

    if (x < bpmStasisNorm) {
        var sub = x/bpmStasisNorm;
        color.red = 0.0;
        color.green = 125 + 125*sub;
        color.blue = 0.0;
    } else if (x < mid1) {
        var sub = (x-bpmStasisNorm)/(mid1-bpmStasisNorm);
        color.red = 255*sub;
        color.green = 255;
        color.blue = 0.0;
    } else {
        var sub = (x-mid1)/(1.0-mid1);
        color.red = 255;
        color.green = 255 - 255*sub;
        color.blue = 0.0;
    }

    return color;
}

//outputs RGB values based on a normalized o2 sat value
function o2SatColor(x) {
    var color = [];
    //x = 1-x;
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

    var mid1 = o2SatStasisNorm*0.333;
    var mid2 = o2SatStasisNorm*0.666;

    if (x < mid1) { //purple to blue
        var sub = x/mid1;
        color.red = 0.5*(1.0-sub);
        color.green = 0.0;
        color.blue = 0.8;
    } else if (x < mid2) { //blue to cyan
        var sub = (x-mid1)/(mid2-mid1);
        color.red = 0.0;
        color.green = sub;
        color.blue = 0.8 + 0.2*sub;
    } else if (x < o2SatStasisNorm) { //cyan to green
        var sub = (x-mid2)/(o2SatStasisNorm-mid2);
        color.red = 0.0;
        color.green = 1.0;
        color.blue = 1.0-sub;
    } else { //green to dark green
        var sub = (x-o2SatStasisNorm)/(1.0-o2SatStasisNorm);
        color.red = 0.0;
        color.green = 1.0-0.5*sub;
        color.blue = 0.0;
    }

    return color;
}

function respRateColor(x) {
    var color = [];

    var mid1 = respRateStasisNorm + (1.0-respRateStasisNorm)*0.5;

    if (x < respRateStasisNorm) { //blue to green
        var sub = x/respRateStasisNorm;
        color.red = 0.0;
        color.green = sub;
        color.blue = 1.0-sub;
    } else if (x < mid1) { //green to yellow
        var sub = (x-respRateStasisNorm)/(mid1-respRateStasisNorm);
        color.red = sub;
        color.green = 1.0;
        color.blue = 0.0;
    } else { //yellow to red
        var sub = (x-mid1)/(1.0-mid1);
        color.red = 1.0;
        color.green = 1.0-sub;
        color.blue = 0.0;
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




/*Old color function

    stroke(colorA.x*i*colorRatio*2 + colorB.x*(1.0-i)*(1.0-colorRatio)*2, colorA.y*i*colorRatio*2 + colorB.y*(1.0-i)*(1.0-colorRatio)*2, colorA.z*i*colorRatio*2 + colorB.z*(1.0-i)*(1.0-colorRatio)*2);*/






    /* SPACE PRISM
       
       //circle(100 + isopos.x*(graphWidth-100) + isopos.z*sqrt(1.0/2.0)*graphHeightB, graphB + graphHeightB - isopos.y*graphHeightB - isopos.z*sqrt(1.0/2.0)*graphHeightB, 3);
       var projpos = projectIso(graphHeight/2, [bpmNorm, 1.0-respRateNorm, o2SatNorm]);
       circle(200 + projpos[0], graphB + graphHeightB/2 + projpos[1], 3)

       if (dataPoints <= 0 || dist(projpos[0], projpos[1], bpmHistoric[dataPoints-1][0], bpmHistoric[dataPoints-1][1]) > 5.0) {
        bpmHistoric[dataPoints] = projpos;
        dataPoints++;
       }

       stroke(255,255,255,64);
       noFill();
       beginShape();
        for (var i = 1; i < dataPoints; i++) {
            vertex(200 + bpmHistoric[i][0], graphB + graphHeightB/2 + bpmHistoric[i][1]);
        }
        endShape();

        noStroke();

       fill(0, 255, 0);
       var projpos2 = projectIso(graphHeight/2, [bpmStasisNorm, 1.0-respRateStasisNorm, o2SatStasisNorm]);
       circle(200 + projpos2[0], graphB + graphHeightB/2 + projpos2[1], 5)

       stroke(255,255,255,64);

       line(200 + projpos[0], graphB + graphHeightB/2 + projpos[1], 200 + projpos2[0], graphB + graphHeightB/2 + projpos2[1])


       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [0,1,0], [1,1,0]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [0,0,1], [1,0,1]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [0,1,1], [1,1,1]);

       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [1,0,0], [1,1,0]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [1,1,0], [1,1,1]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [1,1,1], [1,0,1]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [1,0,1], [1,0,0]);

       //isoLine(graphHeight/2, [100, graphB + graphHeightB/2], [0,0,0], [0,1,0]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [0,1,0], [0,1,1]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [0,1,1], [0,0,1]);
       //isoLine(graphHeight/2, [100, graphB + graphHeightB/2], [0,0,1], [0,0,0]);

       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [bpmNorm,0,0], [bpmNorm,1,0]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [bpmNorm,1,0], [bpmNorm,1,1]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [bpmNorm,1,1], [bpmNorm,0,1]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [bpmNorm,0,1], [bpmNorm,0,0]);

       stroke(0,255,0,64);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [bpmStasisNorm,0,0], [bpmStasisNorm,1,0]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [bpmStasisNorm,1,0], [bpmStasisNorm,1,1]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [bpmStasisNorm,1,1], [bpmStasisNorm,0,1]);
       isoLine(graphHeight/2, [200, graphB + graphHeightB/2], [bpmStasisNorm,0,1], [bpmStasisNorm,0,0]);


       */
       /*
       heartClock += delta/breathPeriod;
       line(width/3*2-25, height/7*6 - 50*1.25, width/3*2 + 25, height/7*6 - 50*1.25);
       beginShape();
        for (var i = 0; i < 1.0; i += 0.001) {
            //vertex(graphWidth + 50*cos(i*PI*2*(bpmNorm/bpmStasisNorm)), graphB + graphHeight/2 + 50*sin(i*PI*2*(respRateNorm/respRateStasisNorm)));

            var rotations = 1, oscilations = bpm/respRate;
            vertex(width/3*2 + 50*(1+sin(-PI/2 + i*PI*2*oscilations - 0*heartClock*PI*2))/2*cos(i*PI*2*rotations + PI/2 + heartClock*PI*2), height/7*6 + 50*(1+sin(-PI/2 + i*PI*2*oscilations - 0*heartClock*PI*2))/2*sin(i*PI*2*rotations + PI/2 + heartClock*PI*2));

            var rotations = 1, oscilations = bpm/respRate;
            //vertex(graphWidth + 50*(1+sin(i*PI*2*oscilations)*0.25)*cos(i*PI*2*rotations), graphB + graphHeight/2 + 50*(1+sin(i*PI*2*oscilations)*0.25)*sin(i*PI*2*rotations));
        }
       endShape(CLOSE);
       */