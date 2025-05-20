const vm = require('vm') // vm is a built-in Node.js module that provides a way to execute JavaScript code in a sandboxed environment, read the README for more info
const Blockly = require('blockly'); // Blockly is a library for creating visual programming environments, read the README for more info
const { log } = require('console');
const frameRate = 60; // The number of frames per second for the game
// The Pathpoints are the points that the enemies will follow, they are in the format of { y: <y>, x: <x> } where y is the vertical position and x is the horizontal position
const pathPoint = [{ y: 2, x: 0 }, { y: 2, x: 8 }, { y: 12, x: 8 }, { y: 12, x: 16 }, { y: 2, x: 16 }, { y: 2, x: 24 }, { y: 18, x: 24 }, { y: 18, x: 31 }];
const pathPoint2 = [{ y: 2, x: 0 }, { y: 2, x: 25 }, { y: 6, x: 25 }, { y: 6, x: 8 }, { y: 10, x: 8 }, { y: 10, x: 16 }, { y: 14, x: 16 }, { y: 14, x: 24 }, { y: 18, x: 24 }, { y: 18, x: 31 }];
const pathPoint3 = [{ y: 2, x: 0 }, { y: 2, x: 3 }, { y: 6, x: 3 }, { y: 6, x: 5 }, { y: 10, x: 5 }, { y: 10, x: 7 }, { y: 6, x: 7 }, { y: 6, x: 9 }, { y: 10, x: 9 }, { y: 10, x: 11 }, { y: 6, x: 11 }, { y: 6, x: 13 }, { y: 10, x: 13 }, { y: 10, x: 15 }, { y: 6, x: 15 }, { y: 6, x: 17 }, { y: 10, x: 17 }, { y: 10, x: 19 }, { y: 6, x: 19 }, { y: 6, x: 21 }, { y: 10, x: 21 }, { y: 10, x: 23 }, { y: 6, x: 23 }, { y: 6, x: 25 }, { y: 10, x: 25 }, { y: 10, x: 27 }, { y: 6, x: 27 }, { y: 6, x: 29 }, { y: 10, x: 29 }, { y: 10, x: 31 }, { y: 18, x: 31 }];
const pathPoint4 = [{ y: 2, x: 0 }, { y: 2, x: 15 }, { y: 10, x: 15 }, { y: 10, x: 11 }, { y: 6, x: 11 }, { y: 6, x: 19 }, { y: 10, x: 19 }, { y: 10, x: 15 }, { y: 18, x: 15 }, { y: 18, x: 31 }];
const pathPoint5 = [{ y: 2, x: 0 }, { y: 2, x: 15 }, { y: 10, x: 15 }, { y: 10, x: 11 }, { y: 6, x: 11 }, { y: 6, x: 19 }, { y: 2, x: 19 }, { y: 2, x: 15 }, { y: 18, x: 15 }, { y: 18, x: 31 }];
const users = new Map(); // Map to store user data, including enemies and towers
var ticks = 0; // Variable to keep track of the game ticks

// use the format of { enemyType: '<enemy name>', amount: <integer>, spawnInterval: <integer in game ticks, use framrate to determine frames per second>, wait: <integer in game ticks, use framrate to determine frames per second> } inside of a list inside the waves list to make a section of a wave
waves = [
    {
        enemies: [
            { enemyType: 'skeleton', amount: 10, spawnInterval: 5, wait: 0 },
            { enemyType: 'trickster', amount: 3, spawnInterval: 30, wait: 0 }
        ],
        tip: "Use towers strategically to cover the path effectively."
    },
    {
        enemies: [
            { enemyType: 'sprinter', amount: 5, spawnInterval: 60, wait: 0 }
        ],
        tip: "Upgrade your towers to handle stronger enemies."
    },
    {
        enemies: [
            { enemyType: 'normal', amount: 5, spawnInterval: 60, wait: 0 },
            { enemyType: 'fast', amount: 3, spawnInterval: 30, wait: 300 }
        ],
        tip: "Focus on slowing down fast enemies to give your towers more time to attack."
    },
    {
        enemies: [
            { enemyType: 'normal', amount: 10, spawnInterval: 48, wait: 0 },
            { enemyType: 'fast', amount: 5, spawnInterval: 24, wait: 300 }
        ],
        tip: "Save money for powerful upgrades or new towers."
    },
    {
        enemies: [
            { enemyType: 'normal', amount: 15, spawnInterval: 42, wait: 0 },
            { enemyType: 'normal', amount: 10, spawnInterval: 30, wait: 300 },
            { enemyType: 'normal', amount: 5, spawnInterval: 18, wait: 600 }
        ],
        tip: "Plan ahead for boss waves by upgrading damage-dealing towers."
    },
    {
        enemies: [
            { enemyType: 'normal', amount: 10, spawnInterval: 48, wait: 0 },
            { enemyType: 'fast', amount: 5, spawnInterval: 24, wait: 300 },
            { enemyType: 'normal', amount: 10, spawnInterval: 48, wait: 600 }
        ],
        tip: "Use a mix of tower types to handle different enemy types."
    },
    {
        enemies: [
            { enemyType: 'normal', amount: 10, spawnInterval: 48, wait: 0 },
            { enemyType: 'slow', amount: 5, spawnInterval: 72, wait: 300 }
        ],
        tip: "Place towers near corners to maximize their attack range."
    },
    {
        enemies: [
            { enemyType: 'fast', amount: 10, spawnInterval: 30, wait: 0 },
            { enemyType: 'slow', amount: 5, spawnInterval: 60, wait: 300 }
        ],
        tip: "Don't forget to use status-effect towers like SlowTower or PoisonTower."
    },
    {
        enemies: [
            { enemyType: 'normal', amount: 10, spawnInterval: 48, wait: 0 },
            { enemyType: 'fast', amount: 5, spawnInterval: 24, wait: 300 },
            { enemyType: 'slow', amount: 3, spawnInterval: 72, wait: 600 }
        ],
        tip: "Keep an eye on your health and prioritize defense if needed."
    },
    {
        enemies: [
            { enemyType: 'normal', amount: 10, spawnInterval: 48, wait: 0 },
            { enemyType: 'boss', amount: 1, spawnInterval: 0, wait: 528 }
        ],
        tip: "Boss enemies are tough—make sure you're prepared!"
    }
];


// This is a list of upgrade paths for each tower type. Each path contains a list of upgrades, each with its own properties such as range, damage, fire rate, and price.
const upgradePaths = {
    Basic: {
        path1: [
            { name: 'Rapid Reload', range: 0, damage: 1, fireRate: 1, price: 15, description: 'Increases fire rate slightly for faster attacks.' },
            { name: 'Focused Fire', range: 0, damage: 2, fireRate: 1.5, price: 30, description: 'Enhances fire rate and damage for more precise attacks.' },
            { name: 'Overdrive', range: 0, damage: 3, fireRate: 2, price: 50, description: 'Maximizes fire rate and damage for rapid destruction.' }
        ],
        path2: [
            { name: 'Extended Barrel', range: 2, damage: 0, fireRate: 0, price: 20, description: 'Increases range to target enemies from farther away.' },
            { name: 'Precision Targeting', range: 3, damage: 1, fireRate: 0, price: 40, description: 'Improves range and adds slight damage boost.' },
            { name: 'Eagle Eye', range: 4, damage: 2, fireRate: 0, price: 60, description: 'Maximizes range and damage for long-distance precision.' }
        ],
        path3: [
            { name: 'Armor Piercing', range: 0, damage: 2, fireRate: 0, price: 25, description: 'Increases damage to penetrate enemy armor.' },
            { name: 'Heavy Rounds', range: 0, damage: 4, fireRate: 0, price: 50, description: 'Boosts damage significantly for tougher enemies.' },
            { name: 'Penetrating Shots', range: 0, damage: 6, fireRate: 0, price: 75, description: 'Maximizes damage to deal with heavily armored foes.' }
        ],
        path4: [
            { name: 'Quick Calibration', range: 0, damage: 0, fireRate: 1, price: 20, description: 'Improves fire rate for quicker attacks.' },
            { name: 'Advanced Mechanics', range: 0, damage: 1, fireRate: 1.5, price: 40, description: 'Enhances fire rate and damage for better efficiency.' },
            { name: 'Precision Engineering', range: 0, damage: 2, fireRate: 2, price: 60, description: 'Maximizes fire rate and damage for optimal performance.' }
        ]
    },
    Sniper: {
        path1: [
            { name: 'Deadly Precision', range: 2, damage: 5, fireRate: -0.5, price: 50, description: 'Increases range and damage for precise long-range shots.' },
            { name: 'Lethal Aim', range: 3, damage: 10, fireRate: -1, price: 100, description: 'Boosts range and damage significantly for lethal accuracy.' },
            { name: 'One Shot, One Kill', range: 4, damage: 20, fireRate: -1.5, price: 200, description: 'Maximizes range and damage for devastating single shots.' }
        ],
        path2: [
            { name: 'Extended Scope', range: 3, damage: 0, fireRate: 0, price: 40, description: 'Increases range to target enemies from farther away.' },
            { name: 'High-Powered Lens', range: 5, damage: 2, fireRate: 0, price: 80, description: 'Improves range and adds slight damage boost.' },
            { name: 'Eagle Vision', range: 7, damage: 5, fireRate: 0, price: 150, description: 'Maximizes range and damage for unparalleled precision.' }
        ],
        path3: [
            { name: 'Armor Piercing Rounds', range: 0, damage: 3, fireRate: 0, price: 60, description: 'Increases damage to penetrate enemy armor.' },
            { name: 'Explosive Rounds', range: 0, damage: 6, fireRate: -0.5, price: 120, description: 'Boosts damage with explosive effects for area impact.' },
            { name: 'Devastating Impact', range: 0, damage: 10, fireRate: -1, price: 250, description: 'Maximizes damage for catastrophic effects on enemies.' }
        ],
        path4: [
            { name: 'Quick Reload', range: 0, damage: 0, fireRate: 1, price: 30, description: 'Improves fire rate for quicker attacks.' },
            { name: 'Advanced Mechanics', range: 0, damage: 1, fireRate: 2, price: 70, description: 'Enhances fire rate and damage for better efficiency.' },
            { name: 'Rapid Fire', range: 0, damage: 2, fireRate: 3, price: 150, description: 'Maximizes fire rate and damage for rapid destruction.' }
        ]
    },
    MachineGun: {
        path1: [
            { name: 'Increased Firepower', range: 0, damage: 1, fireRate: 0, price: 20, description: 'Boosts damage for more effective attacks.' },
            { name: 'Enhanced Ammunition', range: 0, damage: 2, fireRate: 0, price: 40, description: 'Further increases damage for tougher enemies.' },
            { name: 'Devastating Barrage', range: 0, damage: 3, fireRate: 0, price: 60, description: 'Maximizes damage for overwhelming firepower.' }
        ],
        path2: [
            { name: 'Extended Range', range: 2, damage: 0, fireRate: 0, price: 15, description: 'Increases range to target enemies from farther away.' },
            { name: 'Precision Targeting', range: 3, damage: 1, fireRate: 0, price: 30, description: 'Improves range and adds slight damage boost.' },
            { name: 'Sniper Precision', range: 4, damage: 2, fireRate: 0, price: 50, description: 'Maximizes range and damage for long-distance precision.' }
        ],
        path3: [
            { name: 'Rapid Fire', range: 0, damage: 0, fireRate: 1, price: 25, description: 'Increases fire rate for faster attacks.' },
            { name: 'Overclocked Mechanism', range: 0, damage: 0, fireRate: 2, price: 50, description: 'Further enhances fire rate for rapid attacks.' },
            { name: 'Machine Fury', range: 0, damage: 0, fireRate: 3, price: 75, description: 'Maximizes fire rate for relentless firepower.' }
        ],
        path4: [
            { name: 'Armor Piercing Rounds', range: 0, damage: 2, fireRate: 0, price: 30, description: 'Increases damage to penetrate enemy armor.' },
            { name: 'Explosive Rounds', range: 0, damage: 4, fireRate: -0.5, price: 60, description: 'Boosts damage with explosive effects for area impact.' },
            { name: 'Shrapnel Storm', range: 0, damage: 6, fireRate: -1, price: 90, description: 'Maximizes damage for devastating area effects.' }
        ]
    },
    SlowTower: {
        path1: [
            { name: 'Frostbite', range: 0, damage: 0, fireRate: 0, price: 20, description: 'Slows down enemies significantly.' },
            { name: 'Chilling Aura', range: 0, damage: 0, fireRate: 0, price: 40, description: 'Further slows down enemies in a larger area.' },
            { name: 'Absolute Zero', range: 0, damage: 0, fireRate: 0, price: 60, description: 'Maximizes slow effect for all enemies in range.' }
        ],
        path2: [
            { name: 'Extended Range', range: 2, damage: 0, fireRate: 0, price: 15, description: 'Increases range to target enemies from farther away.' },
            { name: 'Precision Targeting', range: 3, damage: 1, fireRate: 0, price: 30, description: 'Improves range and adds slight damage boost.' },
            { name: 'Sniper Precision', range: 4, damage: 2, fireRate: 0, price: 50, description: 'Maximizes range and damage for long-distance precision.' }
        ],
        path3: [
            { name: 'Rapid Fire', range: 0, damage: 0, fireRate: 1, price: 25, description: 'Increases fire ratefor faster attacks.' },
            { name: 'Overclocked Mechanism', range: 0, damage: 0, fireRate: 2, price: 50, description: 'Further enhances fire rate for rapid attacks.' },
            { name: 'Machine Fury', range: 0, damage: 0, fireRate: 3, price: 75, description: 'Maximizes fire rate for relentless firepower.' }
        ],
        path4: [
            { name: 'Armor Piercing Rounds', range: 0, damage: 2, fireRate: 0, price: 30, description: 'Increases damage to penetrate enemy armor.' },
            { name: 'Explosive Rounds', range: 0, damage: 4, fireRate: -0.5, price: 60, description: 'Boosts damage with explosive effects for area impact.' },
            { name: 'Shrapnel Storm', range: 0, damage: 6, fireRate: -1, price: 90, description: 'Maximizes damage for devastating area effects.' }
        ]
    },
    PoisonTower: {
        path1: [
            { name: 'Toxic Cloud', range: 0, damage: 0, fireRate: 0, price: 20, description: 'Inflicts poison damage over time to enemies.' },
            { name: 'Venomous Mist', range: 0, damage: 0, fireRate: 0, price: 40, description: 'Further increases poison damage and area of effect.' },
            { name: 'Noxious Gas', range: 0, damage: 0, fireRate: 0, price: 60, description: 'Maximizes poison damage for all enemies in range.' }
        ],
        path2: [
            { name: 'Extended Range', range: 2, damage: 0, fireRate: 0, price: 15, description: 'Increases range to target enemies from farther away.' },
            { name: 'Precision Targeting', range: 3, damage: 1, fireRate: 0, price: 30, description: 'Improves range and adds slight damage boost.' },
            { name: 'Sniper Precision', range: 4, damage: 2, fireRate: 0, price: 50, description: 'Maximizes range and damage for long-distance precision.' }
        ],
        path3: [
            { name: 'Rapid Fire', range: 0, damage: 0, fireRate: 1, price: 25, description: 'Increases fire rate for faster attacks.' },
            { name: 'Overclocked Mechanism', range: 0, damage: 0, fireRate: 2, price: 50, description: 'Further enhances fire rate for rapid attacks.' },
            { name: 'Machine Fury', range: 0, damage: 0, fireRate: 3, price: 75, description: 'Maximizes fire rate for relentless firepower.' }
        ],
        path4: [
            { name: 'Armor Piercing Rounds', range: 0, damage: 2, fireRate: 0, price: 30, description: 'Increases damage to penetrate enemy armor.' },
            { name: 'Explosive Rounds', range: 0, damage: 4, fireRate: -0.5, price: 60, description: 'Boosts damage with explosive effects for area impact.' },
            { name: 'Shrapnel Storm', range: 0, damage: 6, fireRate: -1, price: 90, description: 'Maximizes damage for devastating area effects.' }
        ]
    }
};


// EEEEE   NN  NN   EEEEE   MM   MM   YY   YY
// EE      NNN NN   EE      MMM MMM    YY YY
// EEEEE   NNNNNN   EEEEE   MM M MM     YYY
// EE      NN NNN   EE      MM   MM     YYY
// EEEEE   NN  NN   EEEEE   MM   MM     YYY
// This class is for the enemies, it contains all of the properties and methods for the enemies within the game
class Enemy {
    constructor(enemyType, userIndex, options) {
        this.initialize(enemyType, userIndex, options);
    }

    // This function initializes the enemy with the given type, user index, and options
    initialize(enemyType, userId, options) {
        this.x = 0;
        this.y = 2;
        this.userId = userId; // The userId is used to identify the user that the enemy belongs to in the users Map
        this.enemyType = enemyType;
        this.distanceFromStart = 0; // This is used to determine how far the enemy is from the start of the path, this value increases as the enemy moves along the path using the enemy's speed
        this.statuses = []; // Array to store active statuses, Statuses are used to apply effects to the enemy, such as slowing it down or poisoning it
        this.size = 32;
        this.currentIndex = 0;
        this.nextX = undefined;
        this.nextY = undefined;

        // Initialize original stats and effective stats, effective stats are the stats that are used to determine the enemy's speed, health, and armor while the original stats are the base stats of the enemy
        this.updateStats();
        this.effectiveStats = {
            speed: this.speed,
            armor: 0 // Armor is currently not used, but it can be used to reduce damage taken by the enemy or act as a shield to prevent the enemy's health from being reduced
        };

        const user = users.get(this.userId); // Get the user object from the users Map using the userId
        if (user) { //confirms that the user exists
            user.enemies.push(this); // Add the enemy to the user's enemies array
        }
        this.updatePosition(); // Update the enemy's position in the user's enemies array
    }

    // This function is used to reset the enemy's properties to their default values so it can be returned to the enemy pool to be reused later
    reset() {
        // Reset all properties to default values
        this.x = 0;
        this.y = 2;
        this.userId = null; // Replace userIndex with userId
        this.enemyType = null;
        this.healthBorder = false;
        this.distanceFromStart = 0;
        this.statuses = [];
        this.size = 32;
        this.effectiveStats = {
            speed: 0,
            armor: 0
        };
    }


    // This function is used to add a status to the enemy, it checks if the status already exists and compares the strength and duration of the new status with the existing one
    addStatus(status, customDuration = null, strength = 1) {
        // Check if the status already exists
        const existingStatusIndex = this.statuses.findIndex(s => s.type === status.type);
    
        if (existingStatusIndex !== -1) {
            const existingStatus = this.statuses[existingStatusIndex];
    
            // Compare strengths
            if (strength > existingStatus.strength) {
                // Replace the existing status with the new one
                this.statuses[existingStatusIndex] = new Status(
                    status.type,
                    customDuration !== null ? customDuration : status.duration,
                    status.effect,
                    strength,
                    status.tickEffect, // Pass tickEffect
                    status.tickInterval // Pass tickInterval
                );
            } else if (strength === existingStatus.strength) {
                // Compare durations if strengths are equal
                const newDuration = customDuration !== null ? customDuration : status.duration;
                if (newDuration > existingStatus.duration) {
                    // Replace the existing status with the new one
                    this.statuses[existingStatusIndex] = new Status(
                        status.type,
                        newDuration,
                        status.effect,
                        strength,
                        status.tickEffect, // Pass tickEffect
                        status.tickInterval // Pass tickInterval
                    );
                }
            }
            return;
        }
    
        // If the status doesn't exist, add it
        const clonedStatus = new Status(
            status.type,
            customDuration !== null ? customDuration : status.duration,
            status.effect,
            strength,
            status.tickEffect, // Pass tickEffect
            status.tickInterval // Pass tickInterval
        );
        this.statuses.push(clonedStatus);
    }

    // This function is used to update the enemy's statuses, it applies the status effects and decrements their duration
    updateStatuses(currentTick) {
        // Reset effective stats to original stats before applying statuses
        this.effectiveStats.speed = this.speed;
        this.effectiveStats.health = this.health;
        this.effectiveStats.armor = 0; // Reset armor or other stats
    
        this.statuses = this.statuses.filter(status => {
            status.apply(this); // Apply the instant effect
            status.applyTick(this, currentTick); // Apply the tick effect (DoT)
            status.decrementDuration(); // Decrease the duration
            return !status.isExpired(); // Keep only active statuses
        });
        
        if (this.health <= 0) {
            const user = users.get(this.userId);
            if (user) {
                user.money += this.maxHealth; // Reward money
                user.enemies.splice(user.enemies.indexOf(this), 1); // Remove enemy
                enemyPool.releaseEnemy(this); // Return to pool
            }
        }
    }


    // This function is used to update the enemy's original stats based on the enemy type, it sets the health, max health, speed, and color of the enemy
    updateStats() {
        // Set original stats based on enemy type
        switch (this.enemyType) {
            case 'normal':
                this.health = 10;
                this.maxHealth = this.health;
                this.speed = 40;
                this.color = 'white';
                break;
            case 'fast':
                this.health = 5;
                this.maxHealth = 5;
                this.speed = 60;
                this.color = 'dodgerblue';
                break;
            case 'slow':
                this.health = 20;
                this.maxHealth = 20;
                this.speed = 30;
                this.color = 'green';
                break;
            case 'boss':
                this.health = 100;
                this.maxHealth = 100;
                this.speed = 10;
                this.color = 'neonred';
                break;
            case 'camo':
                this.health = 50;
                this.maxHealth = 100;
                this.speed = 30;
                this.color = 'purple';
                break;
            case 'pop-up':
                this.health = 50;
                this.maxHealth = 50;
                this.speed = 30;
                this.color = 'red';
                break;
            case 'sprinter':
                this.health = 50;
                this.maxHealth = 50;
                this.speed = 25;
                this.color = 'pink';
                this.addStatus(boostStatus, 180, 4);
                break;
            case 'trickster':
                this.health = 1;
                this.maxHealth = 1;
                this.speed = 70;
                this.color = 'orange';
                this.addStatus(slowStatus, 180, 4);
                break;
            case 'skeleton':
                this.health = 3;
                this.maxHealth = 3;
                this.speed = 40;
                this.color = 'white';
                break;

        }

        // this.updateHealthBorder(); //This is no longer being used
    }

    // updateHealthBorder() {
    //     this.healthPercentage = this.health / this.maxHealth;
    //     const green = Math.min(255, Math.max(0, 255 * (this.healthPercentage * 2)));
    //     const red = Math.min(255, Math.max(0, 255 * (2 - this.healthPercentage * 3)));
    //     this.borderColor = `rgb(${red}, ${green}, 0)`;
    // }


    // This function is used to update the enemy's position in the user's enemies array, it finds the enemy in the user's enemies array and updates its position
    updatePosition() {
        const user = users.get(this.userId);
        if (user) {
            const enemyIndex = user.enemies.findIndex(e => e === this);
            if (enemyIndex !== -1) {
                user.enemies[enemyIndex] = this;
            }
        }
    }


    // This function is used to move the enemy along the path, it checks if the enemy has reached the next point and updates its position accordingly
    move() {

        // Check if the enemy has reached the current target point
        if (this.nextX === undefined || this.nextY === undefined || (this.x === this.nextX && this.y === this.nextY)) {
            if (this.currentIndex < pathPoint.length - 1) {
                this.currentIndex++;
                const nextPoint = pathPoint[this.currentIndex];
                this.nextX = nextPoint.x;
                this.nextY = nextPoint.y;
            } else {
                // Handle reaching the end of the path
                const user = users.get(this.userId);
                if (user) {
                    user.health -= this.effectiveStats.health;
                    user.enemies.splice(user.enemies.indexOf(this), 1);
                    if (user.health <= 0) {
                        user.health = 0;
                        user.gameOver = true;
                        user.gameIsRunning = false;
                    }
                }
                return;
            }
        }

        // Calculate movement
        const speed = this.effectiveStats.speed / 1000;
        const dx = this.nextX - this.x;
        const dy = this.nextY - this.y;

        if (dx !== 0) {
            this.x += Math.sign(dx) * Math.min(speed, Math.abs(dx));
            this.x = Math.round(this.x * 1000) / 1000;
        } else if (dy !== 0) {
            this.y += Math.sign(dy) * Math.min(speed, Math.abs(dy));
            this.y = Math.round(this.y * 1000) / 1000;
        }

        this.distanceFromStart += speed;
        this.updatePosition();
    }
}

// This class is to create the enemy pool, it is used to create a pool of enemies that can be reused instead of creating new enemies every time which will help prevent memory leaks and improve performance
class EnemyPool {
    constructor(size) {
        this.pool = [];
        this.activeEnemies = new Set(); // Track active enemies for debugging or reuse

        for (let i = 0; i < size; i++) {
            this.pool.push(new Enemy(null, null, {})); // Pre-allocate Enemy objects
        }
    }

    getEnemy(enemyType, userIndex, options) {
        if (this.pool.length > 0) {
            const enemy = this.pool.pop();
            enemy.initialize(enemyType, userIndex, options); // Reinitialize the enemy
            this.activeEnemies.add(enemy); // Track the active enemy
            return enemy;
        } else {
            console.warn('Enemy pool is empty! Consider increasing the pool size.');
            return null; // Return null instead of creating a new enemy
        }
    }

    releaseEnemy(enemy) {
        if (this.activeEnemies.has(enemy)) {
            this.activeEnemies.delete(enemy); // Remove from active enemies
            enemy.reset(); // Reset the enemy to its default state
            this.pool.push(enemy); // Return the enemy to the pool
        } else {
            console.warn('Attempted to release an enemy that is not active.');
        }
    }

    expand(amount) {
        for (let i = 0; i < amount; i++) {
            this.pool.push(new Enemy(null, null, {})); // Add new Enemy objects to the pool
        }
    }

    shrink(amount) {
        if (amount > this.pool.length) {
            console.warn('Cannot shrink the pool by more than its current size.');
            amount = this.pool.length; // Limit the shrink amount to the current pool size
        }
        this.pool.splice(0, amount); // Remove the specified number of enemies from the pool
    }
}

//   TTTTTTT    OOOOO    WW   WW   EEEEE   RRRR     SSS 
//   TTTTTTT   OOO OOO   WW W WW   EE      R   R   S    
//     TTT     OO   OO   WW W WW   EEEE    RRRR     SSS 
//     TTT     OOO OOO   WW W WW   EE      R   R       S
//     TTT      OOOOO     WW WW    EEEEE   R   R    SSS 
// This class is for the towers, it contains all of the properties and methods for the towers within the game
class Tower {
    constructor(presetTower, user, options, y, x, range, damage, fireRate, targetingType, projectileType) {
        this.x = x;
        this.y = y;
        this.index = users.get(user).towers.length;
        this.userId = user;
        this.userCode = null;
        this.statuses = []; // Array to store active statuses
        this.inflictStatuses = [];
        this.upgradePath = [0, 0, 0, 0];
        this.upgradeLevel = 0; // Start at level 0

        // Initialize original stats and effective stats
        this.updateStats(presetTower);
        this.effectiveStats = {
            range: this.range,
            damage: this.damage,
            fireRate: this.fireRate,
            moneyRate: this.moneyRate
        };

        this.shootLocation = null;
        this.damageCount = 0;
        this.targetingType = 'first';
    }

    // This function is used to update the tower's original stats based on the preset tower type, it sets the size, color, range, damage, fire rate, and name of the tower
    updateStats(presetTower) {
        // Start with default stats for the base tower
        switch (presetTower) {
            case 'Basic':
                this.size = 10;
                this.color = 'lightblue';
                this.range = 4;
                this.damage = 2;
                this.fireRate = 2;
                this.name = 'Basic';
                this.price = 100;
                break;
            case 'Sniper':
                this.size = 10;
                this.color = 'lightcoral';
                this.range = 8;
                this.damage = 10;
                this.fireRate = 0.5;
                this.name = 'Sniper';
                this.price = 200;
                break;
            case 'MachineGun':
                this.size = 10;
                this.color = 'lightgreen';
                this.range = 3;
                this.damage = 1;
                this.fireRate = 10;
                this.name = 'MachineGun';
                this.price = 150;
                break;
            case 'SlowTower':
                this.size = 10;
                this.color = 'lightyellow';
                this.range = 4;
                this.damage = 0;
                this.fireRate = 2;
                this.name = 'SlowTower';
                this.inflictStatuses.push(slowStatus);
                this.price = 150;
                break;
            case 'PoisonTower':
                this.size = 10;
                this.color = 'limegreen';
                this.range = 4;
                this.damage = 0;
                this.fireRate = 0.5;
                this.name = 'PoisonTower';
                this.inflictStatuses.push(poisonStatus);
                this.price = 20;
                break;
            // CANNON IS A WORK IN PROGRESS
            case 'CannonTower':
                this.size = 10;
                this.color = 'black';
                this.range = 5;
                this.damage = 5;
                this.fireRate = 1;
                this.name = 'CannonTower';
                this.price = 200;
                break;
            case 'MoneyTree':
                this.size = 10;
                this.color = 'gold';
                this.range = 0;
                this.damage = 0;
                this.fireRate = 0;
                this.moneyRate = 1;
                this.name = 'MoneyTree';
                this.price = 2500;
                break;
        }

        // This section apllies upgrades, from the upgradePaths object, to the tower based on the chosen upgrade path and tower type
        for (const [pathKey, pathArray] of Object.entries(upgradePaths[presetTower])) {
            const pathIndex = parseInt(pathKey.replace('path', '')) - 1;
            const level = this.upgradePath[pathIndex];
            if (level > 0) {
                for (let i = 0; i < level; i++) {
                    const upgrade = pathArray[i];
                    this.range += upgrade.range || 0;
                    this.damage += upgrade.damage || 0;
                    this.fireRate += upgrade.fireRate || 0;
                    this.moneyRate += upgrade.moneyRate || 0;
                    this.price += upgrade.price || 0;
                }
            }
        }


        this.shootLocation = null; //Not used anymore, but it was used to determine the location of the projectile when it was shot
        this.damageCount = 0;
        this.lastShotTime = 0; //Used to determine when the tower can shoot again
        this.lastMoneyTime = 0;
        this.sellPrice = Math.floor(this.price * 0.8); // Sell price is 80% of the original price
    }

    // This function is used to handle when a user chooses an upgrade path, it checks if the path has already been chosen and allows the user to choose the path if it hasn't been chosen yet
    chooseUpgradePath(pathIndex) {
        if (upgradePath[pathIndex] === 0) {
            // If the path has not been chosen yet, allow the user to choose this path
            console.log(`Upgrade path ${pathIndex + 1} chosen.`);
        } else {
            console.log(`Upgrade path ${pathIndex + 1} already in use.`);
        }
    }

    // This function is used to handle when a user upgrades the tower, it checks if the user has enough money to upgrade the tower and applies the upgrade if they do, it allows for two paths to be picked, however only one path can be upgraded to level 3 and the other path will be limited to level 2
    upgrade(pathIndex) {
        const user = users.get(this.userId);
        if (user) {
            const primaryMaxUpgradeLevel = 3; // Maximum upgrade level for the primary path
            const secondaryMaxUpgradeLevel = 2; // Maximum upgrade level for secondary paths

            if (upgradePath[pathIndex] === 0) {
                // Automatically choose the path if it's the first upgrade
                console.log(`Automatically choosing path ${pathIndex + 1}.`);
            }

            const currentLevel = upgradePath[pathIndex];
            if (currentLevel < primaryMaxUpgradeLevel) {
                const upgradeCost = this.price;
                if (user.money >= upgradeCost) {
                    user.money -= upgradeCost;
                    upgradePath[pathIndex]++;
                    this.upgradeLevel++;
                    this.updateStats(this.name.toLowerCase());
                    console.log(`Tower upgraded to level ${upgradePath[pathIndex]} on path ${pathIndex + 1}`);

                    // If the tower reaches tier 3 on this path, lock other paths to tier 2
                    if (upgradePath[pathIndex] === primaryMaxUpgradeLevel) {
                        upgradePath.forEach((level, index) => {
                            if (index !== pathIndex && level > secondaryMaxUpgradeLevel) {
                                upgradePath[index] = secondaryMaxUpgradeLevel;
                                console.log(`Path ${index + 1} limited to tier ${secondaryMaxUpgradeLevel}`);
                            }
                        });
                    }
                } else {
                    console.log('Not enough money to upgrade.');
                }
            } else {
                console.log(`Path ${pathIndex + 1} is already at max level.`);
            }
        }
    }

    // This function is used to add statuses to the tower, it checks if the status already exists and compares the strength and duration of the new status with the existing one
    addStatus(status, customDuration = null, strength = 1) {
        // Clone the status before adding it
        const clonedStatus = new Status(
            status.type,
            customDuration !== null ? customDuration : status.duration, // Use custom duration if provided
            status.effect,
            strength // Pass the strength to the cloned status
        );
        this.statuses.push(clonedStatus);
    }

    // This function is used to update the tower's statuses, it applies the status effects and decrements their duration
    updateStatuses() {
        // Reset effective stats to original stats before applying statuses
        this.effectiveStats.range = this.range;
        this.effectiveStats.damage = this.damage;
        this.effectiveStats.fireRate = this.fireRate;

        this.statuses = this.statuses.filter(status => {
            status.apply(this); // Apply the status effect
            status.decrementDuration(); // Decrease the duration
            return !status.isExpired(); // Keep only active statuses
        });
    }

    // This function is used to handle the code given by the user to find a target, it uses the vm module to run the code in a sandboxed environment, it also sanitizes the data to prevent infinite recursion
    findTarget(ticks) {
        this.updateStatuses(); // Update statuses before finding a target

        this.currentTime = ticks;

        // Check if the user has a code to run and gets the user's enemies array
        this.getEnemies = () => {
            const user = users.get(this.userId);
            return user ? user.enemies : [];
        };

        // Find the first enemy in range
        this.findFirst = () => {
            let farthestEnemy = null;
            let maxDistance = -Infinity;

            for (const enemy of this.getEnemiesInRange()) {
                const distanceFromStart = enemy.distanceFromStart;
                if (distanceFromStart > maxDistance) {
                    maxDistance = distanceFromStart;
                    farthestEnemy = enemy;
                }
            }

            return farthestEnemy;
        };

        // Find all the enemies in range
        this.getEnemiesInRange = () => {
            const enemies = this.getEnemies();
            const enemiesInRange = [];
            for (const enemy of enemies) {
                if (this.inRange(enemy)) {
                    enemiesInRange.push(enemy);
                }
            }

            return enemiesInRange;
        };

        // Check if the enemy is in range
        this.inRange = (enemy) => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.effectiveStats.range;
        };

        // Check if the tower can shoot
        this.canShoot = () => {
            return this.currentTime - this.lastShotTime >= (frameRate / this.effectiveStats.fireRate);
        };


        //Runs the user code if it exists and the script is not already running
        if (this.userCode && !this.scriptIsRunning) {
            this.scriptIsRunning = true;

            let script = new vm.Script(this.userCode.program); // Create a new script instance
            let context = vm.createContext(this.userCode.sandbox); // Create a new context for the script

            //attempts to sanitize the data to prevent infinite recursion
            try {
                const sanitizeData = (data, seen = new WeakSet()) => {
                    if (typeof data !== 'object' || data === null) {
                        return data;
                    }

                    if (seen.has(data)) {
                        return; // Prevent infinite recursion
                    }
                    seen.add(data);

                    if (Array.isArray(data)) {
                        return data.map(item => sanitizeData(item, seen));
                    }

                    const sanitized = {};
                    for (const key in data) {
                        try {
                            if (typeof data[key] === 'function') {
                                sanitized[key] = data[key];
                            } else {
                                sanitized[key] = sanitizeData(data[key], seen);
                            }
                        } catch (err) {
                            console.warn(`Failed to sanitize key "${key}":`, err.message);
                        }
                    }
                    return sanitized;
                };

                this.userCode.sandbox = sanitizeData(this.userCode.sandbox);

                script.runInContext(context, { timeout: 50 }); // runs the user's code in a sandboxed environment using a timeout to prevent infinite loops
            } catch (err) {
                console.error('Error running script:', err);
            } finally {
                script = null;
            }
            this.scriptIsRunning = false;
        }
    }

    // This function is used to make the tower shoot a projectile at the target, it checks if the target is valid and if the tower can shoot, it creates a new projectile and adds it to the user's projectiles array
    shoot(target, currentTime) {
        const enemyInstance = target;

        if (!enemyInstance) {
            this.shootLocation = null;
            return;
        }

        this.lastShotTime = currentTime;
        this.shootLocation = { x: enemyInstance.x, y: enemyInstance.y };

        const user = users.get(this.userId);
        // Check if the user exists and creates a new projectile moving towards the target
        if (user) {
            const projectile = projectilePool.getProjectile(
                this.x,
                this.y,
                enemyInstance.x,
                enemyInstance.y,
                0.1, // Speed of the projectile
                this.effectiveStats.damage, // Damage of the projectile
                'AoE', // Type of the projectile
                'yellow', // Color of the projectile
                this.userId, // User ID associated with the projectile
                this.pierce || 1, // Pierce value of the projectile
                10, // Size of the projectile
                this.inflictStatuses // Statuses to be applied by the projectile
            );

            if (projectile) {
                user.projectiles.push(projectile);
            }
        }
    }
}

// PPPPPPPP    RRRRRRRR     OOOOOOO    JJJJJJJJJJJ   EEEEEEEEEE    CCCCCCC    TTTTTTTTT   IIIIIIIII   LLL          EEEEEEEEEE    SSSSSSSS
// PPP   PPP   RRR   RRR   OOO   OOO   JJJJJJJJJJJ   EEEEEEEEEE   CCC   CCC   TTTTTTTTT      III      LLL          EEEEEEEEEE   SSSSSSSS 
// PPP   PPP   RRR   RRR   OOO   OOO        JJJ      EEE          CCC   CCC      TTT         III      LLL          EEE          SSS      
// PPPPPPPP    RRRRRRRR    OOO   OOO        JJJ      EEEEEEE      CCC            TTT         III      LLL          EEEEEEE       SSSSSSS 
// PPP         RRR   RRR   OOO   OOO   JJJ  JJJ      EEE          CCC   CCC      TTT         III      LLL          EEE                SSS
// PPP         RRR   RRR   OOO   OOO   JJJ  JJJ      EEE          CCC   CCC      TTT         III      LLLLLLLLL    EEE           SSSSSSSS
// PPP         RRR   RRR    OOOOOOO     JJJJJJ       EEEEEEEEEE    CCCCCCC       TTT      IIIIIIIII   LLLLLLLLL    EEEEEEEEEE   SSSSSSSS 


// Projectile class
// This class represents a projectile that can be fired by towers
class Projectile {
    constructor(userId, x, y, targetX, targetY, speed, damage, projectileType, color, size, pierce) {
        this.initialize(x, y, targetX, targetY, speed, damage, projectileType, color, userId, size, pierce);
    }

    // This function initializes the projectile with the given parameters and updates its stats based on the projectile type
    initialize(x, y, targetX, targetY, speed, damage, projectileType, color, userId, size, pierce, statuses) {
        this.x = x;
        this.y = y;
        this.lastX = x; // Store the last X position
        this.lastY = y; // Store the last Y position
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        this.size = size || 100; // Default size if not provided
        this.damage = damage;
        this.pierce = pierce || 1; // Default pierce if not provided
        this.projectileType = projectileType; // Type of projectile (e.g., 'normal', 'explosive')
        this.color = color; // Color of the projectile
        this.userId = userId; // User ID associated with the projectile
        this.lifeTime = 6; // Reset lifetime to default value
        this.directionX = null; // Reset direction vector for movement
        this.directionY = null; // Reset direction vector for movement
        this.noHitList = []; // Reset the list of enemies that the projectile has already hit

        // Update stats based on projectile type
        switch (this.projectileType) {
            case 'normal':
                this.special = 'none';
                break;
            case 'AoE':
                this.special = 'AoE';
                break;
            case 'piercing':
                this.special = 'none';
                break;
            case 'poison':
                this.special = 'none';
                break;
            case 'slow':
                this.special = 'none';
                break;
            case 'fast':
                this.special = 'none';
                break;
            default:
                this.special = 'none'; // Default to 'none' if no valid type is provided
                break;
        }
        this.statuses = statuses;
    }

    // This function is used to reset the projectile's properties to their default values so it can be returned to the projectile pool to be reused later
    reset() {
        users.get(this.userId).projectiles.splice(users.get(this.userId).projectiles.indexOf(this), 1); // Remove from user's projectiles
        projectilePool.pool.push(this);
        projectilePool.activeProjectiles.delete(this); // Remove from active projectiles
    }

    // This function is used to move the projectile towards its target, it calculates the direction vector and updates the projectile's position
    move() {
        if (!this.directionX && !this.directionY) { // confirms there is no direction vector already
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance === 0) { // If the target is reached, reset the projectile
                this.reset();
                return;
            }

            this.directionX = dx / distance;
            this.directionY = dy / distance;
        }

        // Calculate new position
        const newX = this.x + this.directionX * this.speed;
        const newY = this.y + this.directionY * this.speed;

        // Find the closest enemy to the projectile
        const user = users.get(this.userId);
        let closestEnemy = null;
        let minDistance = Infinity;

        if (user) {
            for (const enemy of user.enemies) {
                const distanceToEnemy = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                if (distanceToEnemy < minDistance) {
                    minDistance = distanceToEnemy;
                    closestEnemy = enemy;
                }
            }
        }

        // Check for collisions along the path with the closest enemy
        if (closestEnemy) {
            const distanceToPath = this.distanceToLineSegment(
                this.x, this.y, newX, newY, closestEnemy.x, closestEnemy.y
            ); // Calculate distance from the closest enemy to the raycast line

            if (distanceToPath <= 1) {
                if (this.special === 'AoE') {
                    this.AoESize = this.size * 2; // AoE radius
                    const enemiesInRange = user.enemies.filter(enemy => {
                        const distanceToEnemy = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                        return distanceToEnemy <= this.AoESize;
                    });
                    enemiesInRange.forEach(enemy => {
                        if (!this.noHitList.includes(enemy)) {
                            this.noHitList.push(enemy); // Prevent multiple hits
                            enemy.health -= this.damage; // Deal damage
                            this.statuses.forEach(status => {
                                enemy.addStatus(status); // Apply statuses to the enemy
                            });
    
                            if (enemy.health <= 0) {
                                user.money += enemy.maxHealth; // Reward money
                                user.enemies.splice(user.enemies.indexOf(enemy), 1); // Remove enemy
                                enemyPool.releaseEnemy(enemy); // Return to pool
                            }
                        }
                    });
                } else {
                    if (!this.noHitList.includes(closestEnemy)) {
                        this.noHitList.push(closestEnemy); // Prevent multiple hits
                        closestEnemy.health -= this.damage; // Deal damage
                        this.statuses.forEach(status => {
                            closestEnemy.addStatus(status); // Apply statuses to the enemy
                        });
    
                        if (closestEnemy.health <= 0) {
                            user.money += closestEnemy.maxHealth; // Reward money
                            user.enemies.splice(user.enemies.indexOf(closestEnemy), 1); // Remove enemy
                            enemyPool.releaseEnemy(closestEnemy); // Return to pool
                        }
    
                        // Handle piercing
                        this.pierce--;
                        if (this.pierce <= 0) {
                            this.reset();
                            return;
                        }
                    }
                }
            }
        }

        // Update position
        this.x = newX;
        this.y = newY;

        // Reduce lifetime and reset if expired
        this.lifeTime -= this.speed;
        if (this.lifeTime <= 0) {
            this.reset();
        }
    }

    // Helper function to calculate the distance from a point to a line segment
    distanceToLineSegment(x1, y1, x2, y2, px, py) {
        const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;
        if (lengthSquared === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);

        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lengthSquared;
        t = Math.max(0, Math.min(1, t));

        const closestX = x1 + t * (x2 - x1);
        const closestY = y1 + t * (y2 - y1);

        return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
    }
}

// Projectile Pool class
// This class creates a list of projectiles that can be reused to reduce memory usage
class ProjectilePool {
    constructor(size) {
        this.pool = [];
        this.activeProjectiles = new Set(); // Track active projectiles for debugging or reuse

        for (let i = 0; i < size; i++) {
            this.pool.push(new Projectile(0, 0, 0, 0, 0, 0, '', '')); // Pre-allocate Projectile objects
        }
    }

    // This function is used to get a projectile from the pool, it checks if there are any projectiles available in the pool and returns one if there is, otherwise it returns null
    getProjectile(x, y, targetX, targetY, speed, damage, type, color, userId, pierce, size, statuses) {
        if (this.pool.length > 0) {
            const projectile = this.pool.pop();
            projectile.x = x;
            projectile.y = y;
            projectile.targetX = targetX;
            projectile.targetY = targetY;
            projectile.speed = speed;
            projectile.damage = damage;
            projectile.type = type;
            projectile.color = color;
            projectile.userId = userId;
            projectile.pierce = pierce || 5; // Default pierce if not provided
            projectile.size = size || 100; // Default size if not provided
            this.activeProjectiles.add(projectile); // Track the active projectile
            projectile.initialize(x, y, targetX, targetY, speed, damage, type, color, userId, size, 5, statuses); // Reinitialize the projectile
            return projectile;
        } else {
            console.warn('Projectile pool is empty! Consider increasing the pool size.');
            return null; // Return null instead of creating a new projectile
        }
    }

    expand(amount) {
        for (let i = 0; i < amount; i++) {
            this.pool.push(new Projectile(0, 0, 0, 0, 0, 0, '', '')); // Add new Projectile objects to the pool
        }
    }

    shrink(amount) {
        if (amount > this.pool.length) {
            console.warn('Cannot shrink the pool by more than its current size.');
            amount = this.pool.length; // Limit the shrink amount to the current pool size
        }
        this.pool.splice(0, amount); // Remove the specified number of projectiles from the pool
    }
}

//   SSSSSSSSS   TTTTTTTTT    AAAAAAA    TTTTTTTTT   UUU   UUU    SSSSSSSSS   EEEEEEEEEE    SSSSSSSSS
//  SSSSSSSSS    TTTTTTTTT   AAA   AAA   TTTTTTTTT   UUU   UUU   SSSSSSSSS    EEEEEEEEEE   SSSSSSSSS 
//  SSS             TTT      AAA   AAA      TTT      UUU   UUU   SSS          EEE          SSS       
//   SSSSSSSS       TTT      AAAAAAAAA      TTT      UUU   UUU    SSSSSSSS    EEEEEE        SSSSSSSS 
//         SSS      TTT      AAA   AAA      TTT      UUU   UUU          SSS   EEE                 SSS
//   SSSSSSSSS      TTT      AAA   AAA      TTT      UUU   UUU    SSSSSSSSS   EEE           SSSSSSSSS
//  SSSSSSSSS       TTT      AAA   AAA      TTT       UUUUUUU    SSSSSSSSS    EEEEEEEEEE   SSSSSSSSS 
// The Status class is used to create the status effects that can be applied to enemies and towers, it contains the properties and methods for the status effects
class Status {
    constructor(type, duration, effect, strength = 1, tickEffect, tickInterval) {
        // console.log(type, duration, effect, strength, tickEffect, tickInterval);
        
        this.type = type; // e.g., 'slow', 'boost', 'poison'
        this.duration = duration; // Duration in ticks
        this.effect = effect; // Function to apply the effect instantly
        this.strength = strength; // Strength of the effect
        this.tickEffect = tickEffect; // Function to apply the effect over time (DoT)
        this.tickInterval = tickInterval || 1; // Interval in ticks for applying the tickEffect
        this.lastTick = 0; // Tracks the last tick when the tickEffect was applied
    }

    // This function is used to apply the status effect to the target instantly
    apply(target) {
        if (this.effect) {
            this.effect(target.effectiveStats, this.strength);
        }
    }

    // This function is used to apply the tick effect (DoT) to the target
    applyTick(target, currentTick) {
        if (this.tickEffect && currentTick - this.lastTick >= this.tickInterval) {
            this.tickEffect(target, this.strength);
            
            this.lastTick = currentTick; // Update the last tick when the effect was applied
        }
    }

    // This function is used to decrement the duration of the status effect
    decrementDuration() {
        this.duration--; // Reduce the duration by 1 tick
    }

    // This function is used to check if the status effect has expired
    isExpired() {
        return this.duration <= 0; // Check if the status has expired
    }
}
// This section creates the status effects that can be applied to enemies and towers, it creates the slow, boost, and poison status effects
// To create a new status effect, create a new instance of the Status class and pass in the type, duration, effect function, and strength
// const <statusName> = new Status(<type>, <duration>, <effect>, <strength>);
const slowStatus = new Status(
    'slow',
    100, // Default duration in ticks
    (effectiveStats, strength) => {
        effectiveStats.speed *= (0.5 / strength);
    },
    1

);
const boostStatus = new Status(
    'boost',
    100, // Default duration in ticks
    (effectiveStats, strength) => {
        effectiveStats.speed *= strength / 0.5;
    }
);
const poisonStatus = new Status(
    'poison',
    100, // Default duration in ticks
    null,
    1, // Strength of the poison effect
    (effectiveStats, strength) => {
        effectiveStats.health -= strength; // Apply poison damage over time
    },
    10 // Tick interval in ticks
);

//   GGGGGGG     RRRRRRRRR    IIIIIIIIII   DDDDDDDDD
//  GGG   GGG    RRR    RRR      III       DDD    DDD 
// GGG     GGG   RRR    RRR      III       DDD    DDD
// GGG           RRRRRRRRR       III       DDD    DDD
// GGG  GGGGGG   RRR  RRR        III       DDD    DDD
//  GGG   GGG    RRR   RRR       III       DDD    DDD       
//   GGGGGGG     RRR   RRR       III       DDDDDDDDD
// This function initializes the grid with the given number of rows and columns, it creates a 2D array of objects with properties for each cell
function initializeGrid(rows, cols) {
    const grid = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push({ hasPath: false, isStart: false, isEnd: false });
        }
        grid.push(row);
    }
    return grid;
}

// This function calculates the path for the grid, it sets the start and end points and marks the path between them
function calculatePath(grid) {
    grid[2][0].isStart = true;
    grid[18][31].isEnd = true;

    // This logic uses the pathpoints to create the path, it creates a list of points that the path will go through
    for (let i = 0; i < pathPoint.length - 1; i++) {
        const start = pathPoint[i];
        const end = pathPoint[i + 1];
        const xDiff = end.x - start.x;
        const yDiff = end.y - start.y;
        const xDirection = xDiff > 0 ? 1 : -1;
        const yDirection = yDiff > 0 ? 1 : -1;

        if (xDiff !== 0) {
            for (let j = 0; j <= Math.abs(xDiff); j++) {
                grid[start.y][start.x + j * xDirection].hasPath = true;
            }
        } else {
            for (let j = 0; j <= Math.abs(yDiff); j++) {
                grid[start.y + j * yDirection][start.x].hasPath = true;
            }
        }
    }
    return grid;
}

//  OOO    TTTTT   H   H    EEEEE    RRRR
// O   O     T     H   H    EE       R   R
// O   O     T     HHHHH    EEEE     RRRR
// O   O     T     H   H    EE       R  R
//  OOO      T     H   H    EEEEE    R   R
// This section handles anything not related to the above sections
// This function handles the connection of a user to the server, it creates a new user object if the user doesn't exist and initializes their grid
function connection(socket, io) {
    global.socket = socket;
    global.io = io;
    socket.id = socket.request.session.user;

    if (!socket.id) {
        console.log('User connection rejected: No session user ID.');
        socket.emit('redirectToSignIn'); // Notify the client to redirect to sign in
        socket.disconnect(); // Disconnect the user
        return; // Stop further execution
    }
    console.log('A user connected,', socket.id);
    const userId = socket.id;

    if (!users.has(userId)) {
        users.set(userId, {
            id: userId,
            enemies: [],
            towers: [],
            projectiles: [],
            waveQueue: [],
            sectionQueue: [],
            health: 100,
            money: 150,
            currentWave: -1,
            gameIsRunning: true,
            gameOver: false,
            settings: { programBlocks: false, showTips: true },
            socket: socket
        });
    } else {
        users.get(userId).socket = socket;
    }
    const rows = 20;
    const cols = 32;
    let grid = initializeGrid(rows, cols);
    global.rows = rows;
    global.cols = cols;
    global.grid = calculatePath(grid);
    let user = users.get(userId);
    if (user) {
        socket.emit('gameData', {
            grid,
            rows,
            cols,
            enemies: user.enemies.map(({ x, y, health }) => ({ x, y, health })),
            towers: user.towers.map(({ x, y, range }) => ({ x, y, range }))
        });
    }

    // This function handles the placement of a tower, it checks if the placement is valid and adds the tower to the user's towers array
    socket.on('towerPlace', placementInformation => {
        let user = users.get(socket.id);
        let towerPrice = new Tower(placementInformation.tower, user.id, {}, 0, 0).price;
        if (user) {
            if (user.money >= towerPrice) {
                user.money -= towerPrice; // Deduct the cost of the tower from the user's money
                let x = Math.floor(placementInformation.x);
                let y = Math.floor(placementInformation.y);
                if (!grid[y][x].hasPath && !user.towers.find(tower => tower.x === x && tower.y === y)) {
                    user.towers.push(new Tower(placementInformation.tower, user.id, {}, y, x));

                    socket.emit('towerSelected', {
                        tower: user.towers[user.towers.length - 1],
                        upgrades: upgradePaths[user.towers[user.towers.length - 1].name],
                        settings: user.settings,
                        functions: 'test'
                    });
                }
            }
        }
    });

    // This function handles the selection of a tower, it checks if the tower exists and emits the tower's data to the client
    socket.on('towerSelect', towerSelect => {
        let user = users.get(socket.id);
        if (user) {
            let x = towerSelect.x;
            let y = towerSelect.y;
            const tower = user.towers.find(tower => tower.x === x && tower.y === y);

            socket.emit('towerSelected', {
                tower: tower || null,
                upgrades: tower ? upgradePaths[tower.name] : null,
                settings: user.settings,
                functions: 'test'
            });
        }
    });

    const acorn = require('acorn'); // the acorn library is used to parse the user's code into an AST, read the README for more information
    const { simple: walkSimple } = require('acorn-walk'); // the acorn-walk library is used to walk through the AST and check for prohibited patterns, read the README for more information

    // This function handles the execution of the user's program, it checks if the program is valid and executes it in a sandboxed environment
    socket.on('userProgram', (program, tower) => {
        let user = users.get(socket.id);
        if (user) {
            const towerIndex = tower;
            //Creates a list of allowed functions that the user can use in their code
            const allowedFunctions = {
                getEnemies: () => user.towers[towerIndex].getEnemies(),
                inRange: enemy => user.towers[towerIndex].inRange(enemy),
                findFirst: () => user.towers[towerIndex].findFirst(),
                canShoot: () => user.towers[towerIndex].canShoot(),
                shoot: target => user.towers[towerIndex].shoot(target, ticks),
            };

            // Creates a list of prohibited keywords that the user cannot use in their code
            const prohibitedKeywords = [
                'String', 'fromCharCode', 'eval', 'Function', 'constructor', 'global', 'process',
                'Buffer', 'require', 'setTimeout', 'setInterval', 'Reflect', 'Proxy', 'vm',
                'child_process', 'console', 'this'
            ];

            //Attempts to execute the user's code, if it fails it sends an error message to the client
            try {
                let codeToExecute = program;

                // Check if the user is using block-based code
                if (user.settings.programBlocks) { //Checks if the user is using block-based code
                    console.log('Processing block-based code...');

                    // Convert block-based code (XML or JSON) to JavaScript
                    const workspace = new Blockly.Workspace();
                    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(program), workspace);
                    codeToExecute = Blockly.JavaScript.workspaceToCode(workspace);

                    console.log('Converted block-based code to JavaScript:', codeToExecute);
                } else {
                    console.log('Processing normal code...');
                }

                // Check for prohibited keywords
                for (const keyword of prohibitedKeywords) {
                    if (codeToExecute.includes(keyword)) {
                        throw new Error(`Prohibited keyword detected: "${keyword}"`);
                    }
                }

                // Parse the program into an AST
                const ast = acorn.parse(codeToExecute, { ecmaVersion: 2020 });

                // Walk through the AST to detect prohibited patterns
                walkSimple(ast, {
                    WithStatement(node) {
                        throw new Error('Prohibited statement: "with" is not allowed.');
                    },
                    WhileStatement(node) {
                        if (node.test.type === 'Literal' && node.test.value === true) {
                            throw new Error('Prohibited statement: Infinite loop detected.');
                        }
                    },
                    CallExpression(node) {
                        if (
                            node.callee.type === 'MemberExpression' &&
                            node.callee.object.type === 'Identifier' &&
                            node.callee.object.name === 'String' &&
                            node.callee.property.type === 'Identifier' &&
                            node.callee.property.name === 'fromCharCode'
                        ) {
                            throw new Error('Prohibited statement: Use of "String.fromCharCode" is not allowed.');
                        }
                    },
                    MemberExpression(node) {
                        if (
                            node.object.type === 'Identifier' &&
                            node.object.name === 'String' &&
                            node.property.type === 'Identifier' &&
                            node.property.name === 'fromCharCode'
                        ) {
                            throw new Error('Prohibited statement: Use of "String.fromCharCode" is not allowed.');
                        }
                    },
                    BinaryExpression(node) {
                        if (
                            node.operator === '+' &&
                            (node.left.type === 'Literal' && typeof node.left.value === 'string' ||
                                node.right.type === 'Literal' && typeof node.right.value === 'string')
                        ) {
                            throw new Error('Prohibited statement: String concatenation is not allowed.');
                        }
                    },
                    AssignmentExpression(node) {
                        if (
                            node.operator === '+=' &&
                            node.left.type === 'Identifier' &&
                            node.right.type === 'Literal' &&
                            typeof node.right.value === 'string'
                        ) {
                            throw new Error('Prohibited statement: String concatenation using "+=" is not allowed.');
                        }
                    },
                    TemplateLiteral(node) {
                        throw new Error('Prohibited statement: Template literals are not allowed.');
                    },
                    Identifier(node) {
                        if (prohibitedKeywords.includes(node.name)) {
                            throw new Error(`Prohibited statement: Use of "${node.name}" is not allowed.`);
                        }
                    },
                    Literal(node) {
                        if (typeof node.value === 'string') {
                            throw new Error('Prohibited statement: String literals are not allowed.');
                        }
                    }
                });

                // Create a sandbox for execution
                const sandbox = {
                    ...allowedFunctions,
                    tower: user.towers[tower],
                    global: undefined,
                    process: undefined,
                    constructor: undefined,
                    this: undefined,
                    Function: undefined,
                    eval: undefined,
                    setTimeout: undefined,
                    setInterval: undefined,
                    Reflect: undefined,
                    Proxy: undefined,
                    Buffer: undefined,
                    console: undefined,
                    vm: undefined,
                    require: undefined,
                    child_process: undefined,
                };

                // Save the program to the tower to be executed later
                user.towers[tower].userCode = { program: codeToExecute, sandbox };
                console.log('Program executed successfully:', codeToExecute);
            } catch (error) {
                if (error.message.includes('Script execution timed out')) {
                    console.error('Error: Script execution timed out.');
                    socket.emit('errorMessage', 'Your program took too long to execute.');
                } else {
                    console.error('Error executing user program:', error.message);
                    socket.emit('errorMessage', `An error occurred: ${error.message}`);
                }
            }
        }
    });

    // This handles sending the client a list of towers that can be placed, it sends the list of towers to the client
    socket.on('getTowerList', () => {
        let sampleBasic = new Tower('Basic', socket.id, {}, 0, 0);
        let sampleSniper = new Tower('Sniper', socket.id, {}, 0, 0);
        let sampleMachineGun = new Tower('MachineGun', socket.id, {}, 0, 0);
        let sampleSlowTower = new Tower('SlowTower', socket.id, {}, 0, 0);
        // let sampleCannonTower = new Tower('CannonTower', socket.id, {}, 0, 0);
        let samplePoisonTower = new Tower('PoisonTower', socket.id, {}, 0, 0);
        // let sampleMoneyTree = new Tower('MoneyTree', socket.id, {}, 0, 0);

        const towerTypes = [
            { name: 'Basic', price: sampleBasic.price, range: sampleBasic.range, damage: sampleBasic.damage, fireRate: sampleBasic.fireRate },
            { name: 'Sniper', price: sampleSniper.price, range: sampleSniper.range, damage: sampleSniper.damage, fireRate: sampleSniper.fireRate },
            { name: 'MachineGun', price: sampleMachineGun.price, range: sampleMachineGun.range, damage: sampleMachineGun.damage, fireRate: sampleMachineGun.fireRate },
            { name: 'SlowTower', price: sampleSlowTower.price, range: sampleSlowTower.range, damage: sampleSlowTower.damage, fireRate: sampleSlowTower.fireRate },
            // { name: 'CannonTower', price: sampleCannonTower.price, range: sampleCannonTower.range, damage: sampleCannonTower.damage, fireRate: sampleCannonTower.fireRate },
            { name: 'PoisonTower', price: samplePoisonTower.price, range: samplePoisonTower.range, damage: samplePoisonTower.damage, fireRate: samplePoisonTower.fireRate }
            // { name: 'MoneyTree', price: sampleMoneyTree.price, range: sampleMoneyTree.range, damage: sampleMoneyTree.damage, fireRate: sampleMoneyTree.fireRate, moneyRate: sampleMoneyTree.moneyRate }
        ];
        socket.emit('towerList', towerTypes);
    });

    // This function handles the placement of a tower, it checks if the placement is valid and adds the tower to the user's towers array
    socket.on('placingTower', (tower) => {
        const towerName = tower.name;
        const towerSwitch = Tower.toString().match(/switch\s*\(presetTower\)\s*{([\s\S]*?)}/);
        if (towerSwitch && towerSwitch[1]) {
            const cases = towerSwitch[1].match(/case\s*'([^']+)'[\s\S]*?this\.color\s*=\s*'([^']+)'/g);
            if (cases) {
                const towerCase = cases.find(caseStatement => caseStatement.includes(`case '${towerName}'`));
                if (towerCase) {
                    const color = towerCase.match(/this\.color\s*=\s*'([^']+)'/)[1];
                    const rgbaColor = color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, 'rgba($1, $2, $3, 0.25)');
                    socket.emit('placingTower', { x: tower.x, y: tower.y, rgbaColor });
                }
            }
        }
    })

    // This function handles the upgrade of a tower, it checks if the upgrade is valid and upgrades the tower's stats
    socket.on('upgradeTower', ({ towerIndex, pathIndex }) => {
        let user = users.get(socket.id);
        if (user) {
            const tower = user.towers[towerIndex];
            if (tower) {
                const maxUpgradeLevel = 3; // Maximum level for any path
    
                // Ensure the path index is valid (only 0 or 1 for two paths)
                if (pathIndex < 0 || pathIndex > 1) {
                    socket.emit('errorMessage', `Invalid path index: ${pathIndex}`);
                    return;
                }
    
                // Check if the selected path is already at max level
                if (tower.upgradePath[pathIndex] >= maxUpgradeLevel) {
                    socket.emit('errorMessage', `Path ${pathIndex + 1} is already at max level.`);
                    return;
                }
    
                // Calculate the upgrade cost
                const upgradeCost = upgradePaths[tower.name][`path${pathIndex + 1}`][tower.upgradePath[pathIndex]].price;
                if (user.money >= upgradeCost) {
                    user.money -= upgradeCost; // Deduct the cost
                    tower.upgradePath[pathIndex]++; // Increment the level for the selected path
                    tower.upgradeLevel++; // Increment the overall upgrade level
                    tower.updateStats(tower.name); // Update the tower's stats
                    console.log(`Tower upgraded to level ${tower.upgradePath[pathIndex]} on path ${pathIndex + 1}`);
    
                    socket.emit('towerUpgraded', tower); // Notify the client
                } else {
                    console.log('Not enough money to upgrade the tower.');
                    socket.emit('errorMessage', 'Not enough money to upgrade.');
                }
            }
        }
    });

    // This function handles the selling of a tower, it checks if the tower exists and removes it from the user's towers array
    socket.on('sellTower', (towerIndex) => {
        let user = users.get(socket.id);
        if (user) {
            const tower = user.towers[towerIndex];
            if (tower) {
                user.money += tower.sellPrice;
                user.towers.splice(towerIndex, 1);
            }
            user.towers.forEach((tower, index) => {
                tower.index = index;
            });
        }
    });

    // This handles the retrival of settings, it checks if the user exists and sends the settings to the client
    socket.on('getSettings', () => {
        let user = users.get(socket.id);
        if (user) {
            socket.emit('settingsData', user.settings);
        }
    });

    socket.on('pauseGame', () => {
        let user = users.get(socket.id);
        if (user) {
            user.gameIsRunning = false;
        }
    });

    socket.on('resumeGame', () => {
        let user = users.get(socket.id);
        if (user) {
            user.gameIsRunning = true;
        }
    });

    // This handles the update of settings, it checks if the user exists and updates the settings
    socket.on('updateSettings', (settings) => {
        let user = users.get(socket.id);
        if (user) {
            console.log('Updating settings:', settings);
            user.settings = settings;
            console.log(user.settings);

        }
    });

    socket.on('getLogBook', () => {
        let user = users.get(socket.id);
        if (user) {
            const targetingFunctions = [
                {
                    name: 'getEnemies',
                    description: 'Returns a list of all enemies currently on the map. Example return value: [enemy1, enemy2] Ex: getEnemies()'
                },
                {
                    name: 'inRange',
                    description: 'Checks if a given enemy is within the tower\'s range. Example return value: true/false Ex: inRange(enemy1)'
                },
                {
                    name: 'findFirst',
                    description: 'Finds the enemy farthest along the track within range. Example return value: enemy1 Ex: findFirst()'
                },
                {
                    name: 'canShoot',
                    description: 'Determines if the tower is ready to shoot based on its fire rate. Example return value: true/false Ex: canShoot()'
                },
                {
                    name: 'shoot',
                    description: 'Fires a projectile at the specified target. Ex: shoot(enemy1)'
                }
            ];
            const logBook = { functions: targetingFunctions };
            socket.emit('logBookData', logBook);
        }
    });

    // This handles the start of a wave, it checks if the user exists and starts the wave given
    socket.on('startWave', waveIndex => {
        let user = users.get(socket.id);
        if (user && (waveIndex || waveIndex === 0)) {
            const waveCopy = JSON.parse(JSON.stringify(waves[waveIndex].enemies));
            user.waveQueue.push({ wave: waveCopy, userId: socket.id });
            if (waves[waveIndex].tip) {
                socket.emit('waveTip', waves[waveIndex].tip);
            }
        }
    });

    // This handles the sending of a wave, it checks if the user exists and sends the wave to the user
    socket.on('sendWave', () => {
        const user = users.get(userId);
        if (user) {
            if (user.gameOver || !user.gameIsRunning || user.currentWave >= waves.length - 1 || user.waveQueue.length > 0 || user.sectionQueue.length > 0 || user.enemies.length > 0) return;
            user.currentWave++;
            const waveCopy = JSON.parse(JSON.stringify(waves[user.currentWave].enemies));
            user.waveQueue.push({ wave: waveCopy, userId });
            if (waves[user.currentWave].tip && user.settings.showTips) {
                socket.emit('tipData', waves[user.currentWave].tip);
            }
        }
    })

    // This handles restarting the game, it checks if the user exists and resets the game state
    socket.on('restartGame', () => {
        let user = users.get(socket.id);
        if (user) {
            user.gameIsRunning = true;
            user.gameOver = false;
            user.enemies = [];
            user.towers = [];
            user.waveQueue = [];
            user.sectionQueue = [];
            user.health = 100;
            user.money = 0;
            user.currentWave = -1;
        }
    });

    // This handles spawning enemies, it checks if the user exists and spawns the enemies given
    socket.on('spawnEnemies', (enemyType, amount, spawnInterval, wait) => {
        let user = users.get(socket.id);
        if (user) {
            user.sectionQueue.push({ section: { enemyType, amount, spawnInterval, wait }, userId: socket.id, timeAfterLastSpawn: 0 });
        }
    });

    // this handles the disconnection of a user
    socket.on('disconnect', () => {
        console.log('A user disconnected,', socket.id);
    });
};

// Create global enemy and projectile pools
let enemyPoolSize = 2500; // Initial size
let projectilePoolSize = 1000; // Initial size
const enemyPool = new EnemyPool(enemyPoolSize);
const projectilePool = new ProjectilePool(projectilePoolSize);

// Function to adjust pool sizes dynamically
function adjustPoolSizes() {
    const activeUsers = users.size; // Get the number of active users
    const enemiesPerUser = 500; // Number of enemies per user
    const projectilesPerUser = 500; // Number of projectiles per user

    // Calculate new pool sizes
    const newEnemyPoolSize = activeUsers * enemiesPerUser;
    const newProjectilePoolSize = activeUsers * projectilesPerUser;

    // Adjust enemy pool size
    if (newEnemyPoolSize > enemyPoolSize) {
        enemyPool.expand(newEnemyPoolSize - enemyPoolSize); // Add more enemies
    } else if (newEnemyPoolSize < enemyPoolSize) {
        enemyPool.shrink(enemyPoolSize - newEnemyPoolSize); // Remove excess enemies
    }
    enemyPoolSize = newEnemyPoolSize;

    // Adjust projectile pool size
    if (newProjectilePoolSize > projectilePoolSize) {
        projectilePool.expand(newProjectilePoolSize - projectilePoolSize); // Add more projectiles
    } else if (newProjectilePoolSize < projectilePoolSize) {
        projectilePool.shrink(projectilePoolSize - newProjectilePoolSize); // Remove excess projectiles
    }
    projectilePoolSize = newProjectilePoolSize;
}

//    GGGGGGG     AAAAAAA    MMM      MMM   EEEEEEEEE      LLL          OOOOOOO     OOOOOOO    PPPPPPPP 
//   GGG   GGG   AAA   AAA   MMMM    MMMM   EEEEEEEEE      LLL         OOO   OOO   OOO   OOO   PPP    PP
//   GGG         AAA   AAA   MMMMMMMMMMMM   EEE            LLL         OOO   OOO   OOO   OOO   PPP    PP
//   GGG  GGGG   AAAAAAAAA   MMM MMMM MMM   EEEEEE         LLL         OOO   OOO   OOO   OOO   PPPPPPPP 
//   GGG   GGG   AAA   AAA   MMM  MM  MMM   EEE            LLL         OOO   OOO   OOO   OOO   PPP      
//   GGG   GGG   AAA   AAA   MMM      MMM   EEE            LLLLLLLLL   OOO   OOO   OOO   OOO   PPP      
//    GGGGGGG    AAA   AAA   MMM      MMM   EEEEEEEEE      LLLLLLLLL    OOOOOOO     OOOOOOO    PPP      
let gameLoop = setInterval(() => {
    ticks++;

    adjustPoolSizes(); // Adjust pool sizes based on active users


    for (var [userId, userMap] of users) {
        let user = userMap

        if (user.gameOver || !user.gameIsRunning) continue;

        // Cache user data
        const { enemies, towers, waveQueue, sectionQueue } = user;

        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].updateStatuses(ticks); // Update statuses for each enemy
            if (enemies[i]) {
                enemies[i].move();
            }
        }

        // Update towers
        for (const tower of towers) {
            this.currentTime = ticks;

            if (tower.name == 'MoneyTree') {
                // Ensure moneyRate and lastMoneyTime are initialized for each MoneyTree tower
                if (!tower.lastMoneyTime) tower.lastMoneyTime = 0; // Initialize to 0 if not set
                if (!tower.moneyRate) tower.moneyRate = 1; // Default to 1 if not set

                // Check if enemies are currently spawning
                if (waveQueue.length > 0 || sectionQueue.length > 0) {
                    // Generate money for this MoneyTree tower
                    if (this.currentTime - tower.lastMoneyTime >= (frameRate / tower.moneyRate)) {
                        tower.lastMoneyTime = this.currentTime;
                        user.money += tower.effectiveStats.moneyRate; // Add money from this tower
                        user.money = Math.round(user.money * 10) / 10; // Round to 1 decimal place
                        console.log(`MoneyTree generated money: ${tower.effectiveStats.moneyRate}`);
                    }
                }
            } else {
                tower.findTarget(ticks);
                if (ticks - tower.lastShotTime >= 30) {
                    tower.shootLocation = null;
                }
            }
        }

        // Update projectiles
        for (let i = user.projectiles.length - 1; i >= 0; i--) {
            let projectile = user.projectiles[i];
            if (projectile) {
                if (projectile.lifeTime > 0) {
                    if (projectile.AoESize > 0) {
                        projectile.AoESize--;
                    }
                    projectile.move();
                } else {
                    projectile.reset();
                }
            }
        }

        // Process wave queue
        if (waveQueue.length > 0) {
            const request = waveQueue[0];
            const currentSection = request.wave[0];

            if (currentSection.wait <= 0) {
                sectionQueue.push({ section: currentSection, userId, timeAfterLastSpawn: 0 });
                request.wave.shift();
                if (request.wave.length === 0) waveQueue.shift();
            } else {
                currentSection.wait--;
            }
        }

        // Process section queue
        if (sectionQueue.length > 0) {
            const request = sectionQueue[0];
            const { section } = request;

            if (request.timeAfterLastSpawn >= section.spawnInterval) {
                const enemy = enemyPool.getEnemy(section.enemyType, userId, { healthBorder: true });
                if (enemy) {
                    request.timeAfterLastSpawn = 0;
                    section.amount--;

                    if (section.amount <= 0) sectionQueue.shift();
                }
            } else {
                request.timeAfterLastSpawn++;
            }
        }

        // Release enemies when they are defeated
        for (let i = user.enemies.length - 1; i >= 0; i--) {
            const enemy = user.enemies[i];
            if (enemy.health <= 0) {
                user.money += enemy.maxHealth; // Reward money for defeating the enemy
                user.enemies.splice(i, 1); // Remove from active enemies
                enemyPool.releaseEnemy(enemy); // Return the enemy to the pool
            }
        }

        // Send minimal game data to the client
        if (user) {
            let socket = user.socket;
            socket.emit('gameData', {
                gridData: { grid, rows, cols },
                enemyData: user.enemies,
                towerData: user.towers,
                projectileData: user.projectiles,
                health: user.health,
                money: user.money,
                wave: user.currentWave,
                gameOverStatus: user.gameOver,
                gameRunningStatus: user.gameIsRunning,
            });
        }
    }
}, 1000 / frameRate);

module.exports = {
    connection
};