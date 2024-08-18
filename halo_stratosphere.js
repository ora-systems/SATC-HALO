
var graph;
var font;
var soundReady = false;
var soundID;

var simData = [];

var initial = true;
var time = 0.0;
var pTimeStamp = 0.0, timeStamp = 0.0, clock = 0.0, span = 0.0;
var SPEED = 1.0;


const ALTITUDE_MIN = 0.0, ALTITUDE_MAX = 30000.0;
const BPM_MIN = 50.0, BPM_MAX = 170.0;
const O2SAT_MIN = 0.59, O2SAT_MAX = 1.0;
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

var lastStress = 0.0, stressDelta = 0.0;


//Visual Data
var atomCenter = [];
var centerColor = [], mainColor = [], waveColor = [], circleColor = [];
var pulses = [];
var particles = [];

var rotation = 0.0, complexity = 0.0;


var waveOffset = 0.0;
var ringCount = 0


var expansion = 0.0, de = 0.0;
var breathExpansion = 0.0, breathExpansionDv = 1;

var pulseRadius = 0.0, pulseBrightness = 0.0

var expansion2 = 0.0;

var bpmStasis = 0;
var o2SatStasis = 0;
var respRateStasis = 0;



function preload() {
    font = loadFont('resources/BebasNeue-Regular.ttf');

}


function setup() {


     pTimeStamp = Date.now();

     if (!createjs.Sound.initializeDefaultPlugins()) {
        console.log("soundjs error")
    }

    var soundSrc = "./resources/thump.wav"
    createjs.Sound.alternateExtensions = ["wav"];
    createjs.Sound.addEventListener("fileload", soundLoaded);
    createjs.Sound.registerSound(soundSrc);



    fetch("resources/data.csv")
    .then((res) => res.text())
    .then((text) => {
        simData = CSVToArray(text);
        simData.shift();

        console.log(simData)

    altitude = simData[0][1];
    bpm = simData[0][3];
    o2Sat = simData[0][2]/100.0;
    respRate = simData[0][4];
     })
    .catch((e) => console.error(e));



    bpmStasis = 55;
    o2SatStasis = 0.99;
    respRateStasis = 10;


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


    atomCenter.x = width*4.0/5.0;
    atomCenter.y = height*2.0/6.0;


    graph = loadImage("resources/satc_Logo.jpg");
    

    textFont(font);
    
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
    
}







function interpolateData(data, t, n) {
    if (t < 0) t = 0;
    if (t > data.length-1) t = data.length-1;
    var p = t-floor(t);
    var i = floor(t);
    var pointA = data[i][n] + (data[i+1][n] - data[i][n])*p;
    return pointA;
}

/*function bezierInterpolateData(data, t, offset) {
    if (t < 0) t = 0;
    if (t > data.length-1) t = data.length-1;
    var p = t-floor(t);
    var pointA = interpolateData(data, t - offset);
    var pointB = interpolateData(data, t + offset);
    return pointA + (pointB - pointA)*0.5;
}*/

function draw() {

    /* CLOCK */
    timeStamp = Date.now();
    var delta = timeStamp - pTimeStamp;
    pTimeStamp = timeStamp;


    if (clock/15000.0 < 30) clock += delta*SPEED;
    span += delta;

    if (clock/15000.0 > 29) {
        clock = 0.0;

        dataPoints = 0;
    }
    
    time = clock/20.0;


    waveOffset += 0.03*waveSpeed;
    if (waveOffset > 1.0) waveOffset--;


    var period = 60.0/bpm*1000.0; //time between heart beats in milliseconds
    var breathPeriod = 60.0/respRate*1000.0; //time between breaths in milliseconds

    
    if (span > period) {
        de = 0.75;
        span = 0.0;
        pulseRadius = 0.0;
        pulseBrightness = 1.0;

        pulses.push(0);

        for (var i = 0; i < 100; i++) {
            particles.push([0, random(1)*PI*2, 0.5 + 2.0*pow(random(1), 0.5 + 3.0*(1.0-bpmNorm)), (random(2)-1)*0.0]);
        }
        console.log(particles);

        if (soundID && document.getElementById("sound").checked) 
        createjs.Sound.play(soundID.src);
    }


    //heart rate radial expansion
    if (expansion < 1.0) expansion += de;
    if (expansion > 1.0) expansion = 1.0;




    background(0);

    stroke(255);


    image(graph, width/4, width/50, width/4, width/4/5)

    bpmStasis = 0.15;
    o2SatStasis = 0.95;
    respRateStasis = 0.1;

    

fill(255);
    textSize(36*(width/1700));


        if (simData[0]) {
        altitudeNew = simData[(int)(clock/15000.0)][1];
        bpmNew = simData[(int)(clock/15000.0)][3];
        o2SatNew = simData[(int)(clock/15000.0)][2]/100.0;
        respRateNew = simData[(int)(clock/15000.0)][4];

        }

    //bpm = .0;

    /*/temporary mechanism for smoothing lines in realtime 
    var tanOffset = 2*atan(abs(altitudeNew-altitude)/1000.0)/PI;
    altitudeDelta += (altitudeNew-altitude)*(0.0015/20.0*SPEED); //accelerate
    altitudeDelta *= 0.8 + 0.19*tanOffset; //dampen
    altitude += altitudeDelta; //move

    bpmDelta += (bpmNew-bpm)*(0.01/20.0*SPEED); //accelerate
    bpmDelta *= 0.9; //dampen
    bpm += bpmDelta; //move

    o2SatDelta += (o2SatNew-o2Sat)*(0.01/20.0*SPEED); //accelerate
    o2SatDelta *= 0.9; //dampen
    o2Sat += o2SatDelta; //move

    respRateDelta += (respRateNew-respRate)*(0.01/20.0*SPEED); //accelerate
    respRateDelta *= 0.9; //dampen
    respRate += respRateDelta; //move


    console.log("OXYGEN " + o2Sat);*/

    /*var current = (int)(clock/15000.0);
    var prev = (int)(clock/15000.0 - 0.01); if (prev < 0) prev = 0;
    var next = (int)(clock/15000.0 + 0.01);
    bpm = (simData.bpm[prev] + simData.bpm[next])/2.0;
    console.log(bpm);*/

    //altitude =  bezierInterpolateData(simData.alt, clock/15000.0, 0.35);
    //bpm =  bezierInterpolateData(simData.bpm, clock/15000.0, 0.35);
    //o2Sat =  bezierInterpolateData(simData.spo2, clock/15000.0, 0.35);
    //respRate =  bezierInterpolateData(simData.rr, clock/15000.0, 0.35);


    //console.log(bpm);

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




    //Calculate stress
    var stress = (bpmNorm - bpmStasis) + (o2SatStasis - o2SatNorm);
 

    if (initial) {
        lastStress = stress;
        initial = false;
    }

    stressDelta += (stress - lastStress);


    lastStress = stress;

    rotation -= delta/200.0*stressDelta;




    
    textSize(32*(width/1700))
    noStroke();
    text("Bobby Williams", width*0.76, height - height/5)

    //SPECTRUMS

    noStroke();
    for (var i = 0; i < 1.0; i += 0.05) {
        var c = bpmColor(i);
        fill(c.red, c.green, c.blue);
        rect(width/10*7 - 50 + i*100, height/10*9, 5, 10);
    }
    var meter = width/10*7 - 50 + bpmNorm*100;
    stroke(255);
    line(meter, height/10*9-5, meter, height/10*9 + 15)
    noStroke();
    fill(255);
    text("HR", width/10*7 - 10, height/10*9 + width*0.03);
    text(round(bpm), width/10*7 - 15, height/10*9 - width*0.01);


    for (var i = 0; i < 1.0; i += 0.05) {
        var c = o2SatColor(0.001+i);
        fill(c.red*255, c.green*255, c.blue*255);
        rect(width/10*8 - 50 + i*100, height/10*9, 5, 10);
    }
    meter = width/10*8 - 50 + o2SatNorm*100;
    stroke(255);
    line(meter, height/10*9-5, meter, height/10*9 + 15)
    noStroke();
    fill(255);
    text("SpO2", width/10*8 - 15, height/10*9 + width*0.03);
    text(round(o2Sat*100.0) + "%", width/10*8 - 10, height/10*9 - width*0.01);


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
        rect(width/10*9 - 50 + i*100, height/10*9, 5, 10);
    }
    meter = width/10*9 - 50 + respRateNorm*100;
    stroke(255);
    line(meter, height/10*9-5, meter, height/10*9 + 15)
    noStroke();
    fill(255);
    text("RR", width/10*9 - 8, height/10*9 + width*0.03);
    text(round(respRate), width/10*9 - 10, height/10*9 - width*0.01);




    bpmHistoric[dataPoints] = bpm;
    altitudeHistoric[dataPoints] = altitude;
    o2SatHistoric[dataPoints] = o2Sat;
    respRateHistoric[dataPoints] = respRate;

    dataPoints++;

    
    /*Set Parameters*/
    

    //other sources (data, random)

    size = 0.75;                
    complexity = 0.75;      
    colorRatio = 0.5;       
    ringCount = 100;        
    waveCount = 0.0;
    waveSpeed = 0.0;
    speed = 0.05; 


    var historicDelta = (dataPoints >= 155) ? dataPoints-155 : 0;
    historico2satNorm = (o2SatHistoric[historicDelta] - O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
    
    //green to dark blue
    var c = o2SatColor(o2SatNorm);
    centerColor.red = c.red*255;
    centerColor.green = c.green*255;
    centerColor.blue = c.blue*255;
    c = o2SatColor(historico2satNorm);
    mainColor.red = c.red*255;
    mainColor.green = c.green*255;
    mainColor.blue = c.blue*255;


    //green yellow orange red
    if (respRateNorm < 0.25) {
        var sub = respRateNorm/0.25;

        waveColor.red = 55*(1-sub);
        waveColor.green = 200*sub;
        waveColor.blue = 255*(1-sub);
    } else if (respRateNorm <= 1.0) {
        var sub = (respRateNorm-0.25)/0.75;

        waveColor.red = 255*sub;
        waveColor.green = 200*(1-sub);
        waveColor.blue = 0;
    }


   var color = bpmColor(bpmNorm);
   circleColor.red = color.red;
   circleColor.green = color.green;
   circleColor.blue = color.blue;


   //White case
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

        


    


       //GRAPHS

       textSize(32*(width/1700));

       noFill();
       stroke(255,255,255,64);
       var graphWidth = width-height;
       var graphHeight = height/4;
       var graphA = height/4;
       var graphB = height/3*2;
       //rect(-width/2, -height/2, graphWidth, height);
       rect(100, graphA, graphWidth-400, graphHeight);
       rect(100, graphB, graphWidth-400, graphHeight);
       rect(graphWidth-200, graphA, 200, graphHeight);
       rect(graphWidth-200, graphB, 200, graphHeight);
       stroke(0, 255, 0, 255);
       //drawingContext.setLineDash([1,10])
       line(100, graphB + graphHeight/2, graphWidth-300, graphB + graphHeight/2);
       //drawingContext.setLineDash([0, 0])
   
       stroke(255);
   
       beginShape();
       for (var i = 0; i < 150; i++) {
           var p = i/150;
           var norm = (altitudeHistoric[dataPoints-i]-ALTITUDE_MIN)/(ALTITUDE_MAX-ALTITUDE_MIN);
           vertex(graphWidth - (200)*p, graphA + (1-norm)*graphHeight);
       }
       endShape();
       beginShape();
       for (var i = dataPoints-150; i > 0; i--) {
           var p = i/(dataPoints-150);
           var norm = (altitudeHistoric[i]-ALTITUDE_MIN)/(ALTITUDE_MAX-ALTITUDE_MIN);
           vertex(100 + (graphWidth-400)*p, graphA + (1-norm)*graphHeight);
       }
       endShape();

   
       noStroke();
       fill(255);
       text("Altitude", width/3, graphA + graphHeight + width*0.03)
       text("Performance", width/3, graphB + graphHeight + width*0.03)


       textSize(20*(width/1700))
       text("Historic", 100 + (graphWidth-400)*0.5, graphA + graphHeight + 30);
       text("Snapshot", 100 + graphWidth - 200, graphA + graphHeight + 30);
   
   
       text("Historic", 100 + (graphWidth-400)*0.5, graphB + graphHeight + 30);
       text("Snapshot", 100 + graphWidth - 200, graphB + graphHeight + 30);


       noFill();
   
   
       fill(255);

       textSize(16*(width/1700))
       for (var i = 0; i <= 1.0; i += 1.0/4.0) {
        noStroke();
        text((1-i)*30, graphWidth + 10, graphA + graphHeight*i)
        stroke(255);
        line(graphWidth + 10, graphA + graphHeight*i, graphWidth, graphA + graphHeight*i)
       }

       noFill();
       textSize(16*(width/1700));
   
       //drawingContext.setLineDash([2,20])
       stroke(circleColor.red, circleColor.green, circleColor.blue);
       stroke(255);
       beginShape();
       for (var i = 0; i < 50; i++) {
           var p = i/50;
           var norm = (bpmHistoric[dataPoints-i]-BPM_MIN)/(BPM_MAX-BPM_MIN);
           vertex(graphWidth - (200)*p, graphB + graphHeight/2 + (bpmStasis - norm)*graphHeight/2)
       }
       endShape();
       beginShape();
       for (var i = dataPoints-50; i > 0; i--) {
           var p = i/(dataPoints-50);
           var norm = (bpmHistoric[i]-BPM_MIN)/(BPM_MAX-BPM_MIN);
           vertex(100 + (graphWidth-400)*p, graphB + graphHeight/2 + (bpmStasis - norm)*graphHeight/2)
       }
       endShape();
   
       noStroke();
       fill(255);
       var normT = (bpmHistoric[dataPoints-1]-BPM_MIN)/(BPM_MAX-BPM_MIN);
       text("HR", graphWidth + 45, graphB + graphHeight/2 + (bpmStasis - normT)*graphHeight/2)
       noFill();
   
       //stroke(centerColor.red, centerColor.green, centerColor.blue);
       stroke(255);
       //drawingContext.setLineDash([5, 5, 5, 30])
       beginShape();
       for (var i = 0; i < 50; i++) {
           var p = i/50;
           var norm = (o2SatHistoric[dataPoints-i]-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
           vertex(graphWidth - (200)*p, graphB + graphHeight/2 + (o2SatStasis - norm)*graphHeight/2)
       }
       endShape();
       beginShape();
       for (var i = dataPoints-50; i > 0; i--) {
           var p = i/(dataPoints-50);
           var norm = (o2SatHistoric[i]-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
           vertex(100 + (graphWidth-400)*p, graphB + graphHeight/2 + (o2SatStasis - norm)*graphHeight/2)
       }
       endShape();
   
   
       noStroke();
       fill(255);
       var normT = (o2SatHistoric[dataPoints-1]-O2SAT_MIN)/(O2SAT_MAX-O2SAT_MIN);
       text("O2", graphWidth + 5, graphB + graphHeight/2 + (o2SatStasis - normT)*graphHeight/2)
       noFill();
   
   
       stroke(waveColor.red, waveColor.green, waveColor.blue);
       stroke(255);
       //drawingContext.setLineDash([20, 30])
       beginShape();
       for (var i = 0; i < 50; i++) {
           var p = i/50;
           var norm = (respRateHistoric[dataPoints-i]-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
           vertex(graphWidth - (200)*p, graphB + graphHeight/2 + (respRateStasis - norm)*graphHeight/2)
       }
       endShape();
       beginShape();
       for (var i = dataPoints-50; i > 0; i--) {
           var p = i/(dataPoints-50);
           var norm = (respRateHistoric[i]-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
           vertex(100 + (graphWidth-400)*p, graphB + graphHeight/2 + (respRateStasis - norm)*graphHeight/2)
       }
       endShape();
       //drawingContext.setLineDash([0,0])
   
   
       noStroke();
       fill(255);
       var normT = (respRateHistoric[dataPoints-1]-RESP_RATE_MIN)/(RESP_RATE_MAX-RESP_RATE_MIN);
       text("RR", graphWidth + 25, graphB + graphHeight/2 + (respRateStasis - normT)*graphHeight/2)
       noFill();
    
    

    


    var w2 = height*0.5*0.125;

    stroke(255);
    noStroke();
    stroke(circleColor.red, circleColor.green, circleColor.blue, 255);
    fill(circleColor.red + 0*pulseBrightness, circleColor.green + 0*pulseBrightness, circleColor.blue + 0*pulseBrightness, 32*pulseBrightness);

    //BPM
    if (document.getElementById("o2").checked || true) {

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


            noStroke();
        for (var i = 0; i < particles.length; i++) {
            particles[i][0] += (0.01 + 0.05*particles[i][2])*0.03*delta;
            particles[i][2] *= 0.9;
            particles[i][1] += 0.2*particles[i][3];
            particles[i][3] += (random(2)-1)*0.05;
            
                fill(circleColor.red, circleColor.green, circleColor.blue,255*(1-particles[i][0]))
                square(atomCenter.x + (w2 + w2*particles[i][0])*cos(particles[i][1]), atomCenter.y + (w2 + w2*particles[i][0])*sin(particles[i][1]), 2);
                fill(255, 255, 255, 255*(1-particles[i][0]));
                square(atomCenter.x + (w2 + w2*particles[i][0])*cos(particles[i][1]), atomCenter.y + (w2 + w2*particles[i][0])*sin(particles[i][1]), 1);
            
                if (particles[i][0] > 1.0) particles.shift();
        }

        noFill();
        stroke(circleColor.red, circleColor.green, circleColor.blue, 255);
        beginShape();
        for (var i = 0; i < 1.0; i += 0.01) {
            vertex(atomCenter.x - w2 + w2*2*i, atomCenter.y + expansion*sin(i*PI)*w2*3*(noise(i*3.0, clock/500.0)-0.5))
        }
        endShape();

    
        beginShape();
        for (var i = 0; i < 1.0; i += 0.005) {
            var rad = pulseRadius*w2*1;
            var r = rad + rad/7*(1+sin(i*PI*16))/2;
            
            var r = w2*1/8 + expansion*w2*1/8*3 + (0.+de)*w2/55*(sin(i*PI*8 + 0.5*time) + sin(i*PI*10 - 0.5*time));
            var x1 = r*0.25*cos(i*PI*2 - PI/2), y1 = r*0.25*sin(i*PI*2 - PI/2);
            var x2 = (16*pow(sin(i*PI*2), 3))*r*0.11, y2 = -(13*cos(i*PI*2) - 5*cos(2*i*PI*2) - 2*cos(3*i*PI*2) - cos(4*i*PI*2))*r*0.11;
            
            //vertex(100 + x1 + (x2-x1), y1 + (y2-y1));
            //vertex(atomCenter.x + x2, atomCenter.y + y2);
            
            //vertex(100 + x1, y1);
        }
        endShape(CLOSE);

}
    //BPM 2
    if (document.getElementById("o2").checked) {
    beginShape();
    for (var i = 0; i < 1.0; i += 0.01) {
        var r = w2*2/8 + expansion*w2*2/8*3 + (0.+de)*w/55*(sin(i*PI*8 + 0.5*time) + sin(i*PI*10 - 0.5*time));
        //vertex(atomCenter.x + r*cos(i*PI*2), atomCenter.y + r*sin(i*PI*2));
    }
    endShape(CLOSE);

    noStroke();
    //beginShape();
    for (var i = 0; i < 1.0; i += 0.1) {
        var r = pulseRadius*w2*12;
        //circle(atomCenter.x, atomCenter.y, i*r*2);
    }
    //endShape(CLOSE);
}


    //Respiratory Rate

    strokeWeight(4 + 0*(1-respRateNorm));
    stroke(waveColor.red, waveColor.green, waveColor.blue);
    fill(waveColor.red*0.1, waveColor.green*0.1, waveColor.blue*0.1);
    noFill();
    var rad = w2*2 + w2*2*(1+sin(clock/breathPeriod*PI*2))/2
    
    breathExpansion += delta/breathPeriod;
    rad = w2*2 + w2*2*(1+sin(breathExpansion*PI*2))/2;
    //circle(0, 0, rad);
    if (document.getElementById("rr").checked || true) {
        beginShape();
        for (var i = 0; i < 1.0; i += 0.001) {
            var a = 6, b = 4;
            var r = rad/2 + w2/2*(1+sin(i*PI*a))/2;
            vertex(atomCenter.x + r*cos(i*PI*b + 3*breathExpansion), atomCenter.y + r*sin(i*PI*b + 3*breathExpansion));
        }
        endShape(CLOSE);
        strokeWeight(1);
        stroke(255);
        beginShape();
        for (var i = 0; i < 1.0; i += 0.001) {
            var a = 6, b = 4;
            var r = rad/2 + w2/2*(1+sin(i*PI*a))/2;
            vertex(atomCenter.x + r*cos(i*PI*b + 3*breathExpansion), atomCenter.y + r*sin(i*PI*b + 3*breathExpansion));
        }
        endShape(CLOSE);
}



    
    //image(logoTexture, -w/2, -w/2, w, w);

    //rotateY(yAngle);
    //rotateX(xAngle);


    //blendMode(BURN);

    colorMode(RGB);
    noFill();
    strokeWeight(2);

    if (document.getElementById("halo").checked || true) {

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
          var rNoise = (complexity+expansion*0.0)*(noise(3 + time/3*speed - 3*i + 5*cos(t*PI*2), 3 + time/3*speed - 3*i + 5*sin(t*PI*2), i*5*complexity - expansion2*0.0)-0.5);
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

  

  pulseRadius += (1.0-pulseRadius)*0.1;
  pulseBrightness *= 0.93;
  
      expansion *= pow(0.2, delta/50.0);
  
      expansion2 += de;
  
      de *= pow(0.8, delta/50.0);
      radius = w2*5/height;



    stressDelta *= 0.995;
    
}
    //Draw FX
    

    //translate(-center.x, -center.y, 200);

    
    
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
    return color;
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