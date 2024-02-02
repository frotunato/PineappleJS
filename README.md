# PineappleJS
An utility that allows you to generate Minecraft command blocks from code.

## Installation

PineappleJS requires [Node.js](https://nodejs.org/) v10+ to run.
```sh
cd PineappleJS
npm i
node app
```

## How to use it?
- Start the web server and access the gui
- Write some code
- Download the generated .schematic file
- Use MCedit 0.13 to open it

## An input example

- Declare variables using the 'var' keyword.
- Use if/else statements. 
- Prefix a command with '::' to only execute it once.

```
var playerInGeneralArea = @a[18,3,-14,dx=-19,dy=5,dz=-10]
var playerInAltar = @a[1,6,-18,dx=-1,dy=1,dz=-1]
var playerInResArea = @a[17,4,-15,dx=-5,dy=1,dz=-8]
var playerInSlowArea = @a[5,4,-15,dx=-5,dy=2,dz=-8]
var playerInSuperArea = @a[3,4,-15,dx=-5,dy=3,dz=-8]

var isBossAlive = @e[type=Zombie,name=Moyo]
var playerInPhase0 = @a[score_moyoPhase0_min=1]
var playerInPhase1 = @a[score_moyoPhase1_min=1]

if (/testfor @a) {
	::/scoreboard objectives add moyoPhase0 dummy
	::/scoreboard objectives add moyoPhase1 dummy
	::/scoreboard objectives add moyoTimer dummy
	if (/testfor playerInGeneralArea) {
		if (/testfor playerInAltar) {
			if (!/testfor isBossAlive) {
				::/scoreboard players add playerInAltar moyoPhase0 1
				::/summon Zombie 1 5 -18 {CustomName:"Moyo",Invulnerable:1,NoAI:1,Silent:1}
				::/spreadplayers 14 -18 0 3 false playerInPhase0
			} 
		} else if (/testfor isBossAlive) {
			if (/testfor playerInPhase0) {
				::/say you are in phase 0...
				if (!/testfor playerInCombatArea) {
					::/spreadqplayers 14 -18 0 3 false playerInPhase0
					::/say you cannot run
				}
				::/execute @e[type=ArmorStand] ~ ~ ~ detect 15 7 -22 minecraft:air -1 /say block 1
				::/execute @e[type=ArmorStand] ~ ~ ~ detect 17 7 -16 minecraft:air -1 /say block 4
				if (/testforblocks 12 7 -15 17 7 -23 12 8 -15 all) {
					::/say all are broke, starting counter
					::/scoreboard players set playerInPhase0 moyoPhase1 1
					::/scoreboard players set playerInPhase0 moyoPhase0 0
					::/scoreboard players set playerInPhase1 moyoCounter 1
				}
			} else if (/testfor playerInPhase1) {
				::/say phase1 fired, counting down...
				if (!/scoreboard players test f0rtunato moyoTimer 200 205) {
					/scoreboard players add @a[score_moyoTimer] moyoTimer 1				
				} else if (/scoreboard players test f0rtunato moyoTimer 200 205) {
					::/say ended counting, resetting...
					::scoreboard players set playerInPhase1 moyoPhase0 1
					::scoreboard players set playerInPhase0 moyoPhase1 0
					::scoreboard players set playerInPhase0 moyoTimer 0
				}
			}
		}
	}
}
```

## The output

You get a .schematic file. Import it using MCedit, and you'll get something that looks like this:

This is the amount of blocks that the code from above generates:

![image](https://github.com/frotunato/PineappleJS/assets/5445756/9c4161c3-8c7f-495e-b8b4-7bf41a36f63e)

This other cube is from an input with 3k lines of code:

![image](https://github.com/frotunato/PineappleJS/assets/5445756/158622da-b8a9-479b-bb15-a20b92f8d8bb)


## About the project

### What is this for?

Back in 2014, mapmaking was a popular thing for Minecraft. It wasn't only about creating pretty environments; usually they were heavily scripted to achieve custom gameplay.

The process of implementing such logic was painful, the reason being is that each "line of code" had to be represented by at least one block inside the game. The blocks also had to be located (and oriented!) in a specific way. Keeping track of all of those blocks was a nightmare. Performance was an issue too for many reasons. A few of them:

- The game didn't run the "lines of code" sequentially, but rather simultaneously. Going the 'naive way' was a garanteed disaster, specially when nesting conditions.
- Such blocks should be preferrebly located in the same "chunk" (a 16x16x256 space). Having to cram things is no bueno for readability, and horrible to debug.
- Some statements were executed in the game's main loop, which runned at 20hz. Once you go big, this is a problem.


### What does this solve?
Pretty much all of the above. The main idea is that such logic shouldn't be written inside the game as blocks, but outside as code. This is piece of software takes a bunch of lines of code and gives the user a .schematic file which contains the necessary blocks. Not only that, but it arranges them in the optimal space (a chunk), and does some mumbo jumbo to improve code execution.

### The good
It works, and it's relatively simple to use. I learned a lot of stuff about programming languages and 3D spatial positioning. Also, this was an original idea. To this day, no such tool like this exist!. 

### The not so good
After the core functionality was implemented, I got too ambitious trying to develop a web code editor (autocompleting, syntax highlighting, code linting...). It got way too complex and I gave out. Oh well. Providing the code in a .txt file is an option anyways.

### Why so few commits?
Originally this project was hosted in a private repository. A few years ago I decided to publish the source code.

## License

MIT
