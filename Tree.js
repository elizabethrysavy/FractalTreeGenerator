//Image Variables
var ground,
	initGround,
	winterGround,
	autumnGround,
	summerGround,
	springGround;

//Sound Variables
var sound,
	initSound,
	winterSound,
	autumnSound,
	summerSound,
	springSound;

var leaf; //Leaf Object

//Slider Variables
var rslide,
	pslide,
	aslide;

//Buttons
var randButton;

//Option to choose a season
var selSeason;
var season;

//Label Variables
var rslide_label,
	pslide_label,
	aslide_label,
	season_label;
	
//Customizable Variables
var numRecursion,
	branchProb,
	branchAngle;

var s = 0.5;
var prog = 1;
var randSeed = 80;

var plColor = [255, 255, 255];
var lColors = [[255, 215, 0], 
				[205, 133, 63], 
				[210, 105, 30],
				[255, 140, 0],
				[255, 69, 0],
				[255, 0, 0],
				[107, 142, 35]];
	
var mX,
	mY,
	rX = 0,
	rY = 0,
	zoom = 2; 

function preload() {
	initGround = loadImage("assets/init_floor.jpg");
	ground = initGround;
	winterGround = loadImage("assets/winter_floor.jpg");
	springGround = loadImage("assets/spring_floor.jpg");
	summerGround = loadImage("assets/summer_floor.jpg");
	autumnGround = loadImage("assets/autumn_floor.jpg");
	initSound = null;
	sound = initSound;
	winterSound = loadSound("assets/winter_audio.mp3");
	springSound = loadSound("assets/spring_audio.mp3");
	summerSound = loadSound("assets/summer_audio.mp3");
	autumnSound = loadSound("assets/autumn_audio.mp3");
	leaf = loadModel("assets/leaf.obj")

}
	
function setup()
{	
	//create canvas
	createCanvas(window.innerWidth, window.innerHeight, WEBGL);
	
	var f = 60 / 180 * PI;
	var camZ = (height / 2) / tan(f / 2);
	perspective(60 / 180 * PI, width / height, camZ * 0.001, camZ * 100);
	
	rX = PI/8; 


	//# of recursions slider
	rslide = createSlider(1, 15, 10, 1); 
	rslide.position(10,10);
	rslide.input(function() {readInputs(true)});
	rslide_label = createSpan('Number of Recursions');
	rslide_label.position(150,10);

	//offshoot probability slider
	pslide = createSlider(1, 100, 100, 1);
	pslide.position(10, 40);
	pslide.input(function() {readInputs(true)});
	pslide_label = createSpan('Offshoot Probability');
	pslide_label.position(150, 40);

	//branch angle slider
	aslide = createSlider(0, 1, 0.125, 0.01);
	aslide.position(10,70);
	aslide.input(function() {readInputs(true)});
	aslide_label = createSpan('Branch Angle');
	aslide_label.position(150,70);

	//randomization button
	randButton = createButton('Randomize');
	randButton.position(10, 110);
	randButton.mousePressed(function(){
		rslide.value(getRandomInt(1, 15));
		pslide.value(getRandomInt(1, 100));
		aslide.value(getRandomInt(0, 100)/100.0);
		
		readInputs();
	});

	//season selection list
	season_label = createSpan("Season");
	season_label.position(10, 140)
	selSeason = createSelect();
	selSeason.position(10, 160);
	selSeason.option('');
	selSeason.option('Winter');
	selSeason.option('Spring');
	selSeason.option('Summer');
	selSeason.option('Autumn');
	selSeason.changed(selectEvent);
	
	div_inputs = createDiv('');
	
	mX = mouseX;
	mY = mouseY; 
	
	readInputs();
}

function selectEvent() { //if season is selected
	season = selSeason.value();
	if(season == "Winter") {
		ground = winterGround;
		if (sound != null) sound.stop();
		sound = winterSound;
		plColor = [173, 216, 230];
	}
	else if (season == "Summer") {
		ground = summerGround;
		if (sound != null) sound.stop();
		sound = summerSound;
		plColor = [224, 255, 255];
	}
	else if (season == "Spring") {
		ground = springGround;
		if (sound != null) sound.stop();
		sound = springSound;
		plColor = [255, 255, 224];
	}
	else if (season == "Autumn") {
		ground = autumnGround;
		if (sound != null) sound.stop();
		sound = autumnSound;
		plColor = [238, 221, 130];
	}
	else {
		ground = initGround;
		if (sound != null) sound.stop();
		sound = null;
		plColor = [255, 255, 255];
	}
	loop();
}


//mouse rotation functions
function mouseDragged()
{
	if ( mouseX < 330 && mouseY < 400 )
		return true;
	
	rX += (mouseY - mY) / 500;
	rY += (mouseX - mX) / 500;
	
	mX = mouseX;
	mY = mouseY;
	
	loop();
	
	return false;
}

function mouseMoved()
{
	mX = mouseX;
	mY = mouseY;
	
	if ( mouseX > 330 || mouseY > 400 )
		return false;
}

function mouseClicked()
{
	if ( mouseX > 330 || mouseY > 400 )
		return false;
}

function mouseWheel(event)
{
	zoom *= (event.delta > 0 ? 1.1 : 1 / 1.1);
	loop();
	
	return false;
} 


function readInputs() //read slider inputs
{
	numRecursion = rslide.value();
	branchProb = pslide.value();
	branchAngle = aslide.value();
	startGrow();
}

//if window size changes
function windowResized()
{
	resizeCanvas(windowWidth, windowHeight);
	
	var f = 60 / 180 * PI;
	var camZ = (height / 2) / tan(f / 2);
	perspective(60 / 180 * PI, width / height, camZ * 0.1, camZ * 10);
	
	loop();
}

function draw()
{
	background(135, 206, 250); //Light sky blue
	
	if (sound != null){ //sounds
		sound.setVolume(1.0);
		sound.play();
		sound.loop();
	}

	pointLight(plColor[0], plColor[1], plColor[2], 1000, 1000, 1000);
	
	scale(1, -1);
	
	
	translate(0, -height * (s+0.25), -zoom * height * s);
	
	
	rotate(-rX, [1, 0, 0]);
	rotate(rY, [0, 1, 0]);
	
	push();
	rotate(-PI/2, [1, 0, 0]);
	texture(ground); //Green
	plane(1000, -1000); //give tree a base
	pop();
	
	ambientLight(20);
	
	branch(1, randSeed); //branches
	
	noLoop();
}

function branch(level, seed) //recursive branch function
{
	if ( prog < level )
		return;

	randomSeed(seed);
	seed1 = random(1000);
	seed2 = random(1000);

	var growthLevel = (prog - level > 1) || (prog >= numRecursion + 1) ? 1 : (prog - level);
	
	var width = 50 * s * Math.pow((numRecursion - level + 1) / numRecursion, 2);
	var len = growthLevel * s * height;
	
	translate(0, (len / level) / 2, 0);

	if ( (season == "Winter" && doBranch1 == false && doBranch2 == false) || (season == "Winter" && level >= numRecursion)){ //winter branches
		ambientMaterial(255, 255, 255); //white
	}
	else {
		ambientMaterial(160, 82, 45); //brown
	}
	
	box(width, len / level, width);
	
	translate(0, (len / level) / 2, 0);
		
	if ( level < numRecursion )
	{
		//draw branches
		var doBranch1 = rand() <= (branchProb/100);
		var doBranch2 = rand() <= (branchProb/100);
		if (level == 1) {
			doBranch1 = true;
			doBranch2 = true;
		}
		var r = branchAngle * PI;
		if (doBranch1) {
			push();
			rotate(PI/2 + r, [0, 1, 0]);
			rotate(r, [1, 0, 0]);
			branch(level + 1, seed1);
			pop(); 
		}
		if (doBranch2) {
			push();
			rotate(PI/2 + r, [0, 1, 0]);
			rotate(-r, [1, 0, 0]);
			branch(level + 1, seed2);
			pop(); 
		}
	}
	
	if ( (season == "Spring" && doBranch1 == false && doBranch2 == false) || (season == "Spring" && level >= numRecursion)) //spring flowers
	{
		ambientMaterial(255, 0, 0);
		var flowerSize = growthLevel * size * 50 * rand();
		for ( var i=0 ; i<4 ; i++ )
		{
			rotate(PI/4, [1, 0, 0]);
			rotate(2 * PI * i/4, [0, 0, 1]);
			
			box(2, 10, 2);
		}
	}

	if ( (season == "Summer" && doBranch1 == false && doBranch2 == false) || (season == "Summer" && level >= numRecursion)) //summer leaves
	{
			rotate(PI/2, [0, 0, 1]);
			scale(0.1);
			fill(50, 205, 50);
			model(leaf);
	}

	if ( (season == "Autumn" && doBranch1 == false && doBranch2 == false) || (season == "Autumn" && level >= numRecursion)) //autumn leaves
	{
			rotate(PI/2, [0, 0, 1]);
			scale(0.1);
			var c = getRandomInt(0, 6);
			fill(lColors[c][0], lColors[c][1], lColors[c][2]);
			model(leaf);
	}
}

function startGrow() //start tree growth
{
	growing = true;
	prog = 1;
	grow();
}

function grow() //show the tree growing
{
	prog = numRecursion + 3;
	loop();
	growing = false;
	return;
}

//random number functions
function rand()
{
	return random(1000) / 1000;
}

function rand2()
{
	return random(2000) / 1000 - 1;
}


function getRandomInt(max, min){
	return floor(random(min, max+1));
}