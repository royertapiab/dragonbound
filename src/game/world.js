//Player fall and die
var Types = require('./gametypes');
var Logger = require('./lib/logger');
var Message = require('./lib/message');
var Shoot = require('./lib/shoot');
/*============[BUNGE]*============*/
/*============[BUNGE]*============*/


/*============[BUNGE]*============*/
var Box = require('./lib/box');
var Vector = require('./lib/vect');
const { json } = require('body-parser');
const { isArray } = require('underscore');
/*============[BUNGE]*============*/
require('setimmediate');

// World
module.exports = class World {
    constructor(game, gameserver) {
        var self = this;
        let my_gold = 0;
        gameserver.forEachAccount(function (account) {
            if (account !== null) {
                if (account.player.check_my_ava === 1)
                    my_gold = account.player.avaGold;
            }
        });
        this.game = game;
        this.gameserver = gameserver;

        this.work = false;
        this.shoots = {};
        this.shoots_count = 0;
        this.shoots_complete = 0;
        this.shoots_data = [];
        this.map = game.map;
        this.chat = [];
        this.shoot_complete = null;

        this.chat_complete = false;

        this.gp_kill			= 2;
		this.gold_kill			= 300;
		
        this.gpDoubleKill		= 3;
		this.goldDoubleKill		= 200;
		
        this.gpTripleKill		= 4;
        this.goldTripleKill		= 300;

		this.gpTeamKill			= -2;
		this.goldTeamKill		= -500;
        
        this.gold_good			= 30;
        this.gold_excellent		= 60;

        this.gp_lose			= 1;
        this.gold_lose			= 100;
           
        this.gold_penalty		= -100;
        this.gp_penalty			= -1;
        
        this.gp_bunge_bonus		= 2;
        this.gold_bunge_bonus	= 300;
        
        this.gp_bunge_penalty	= -2;
		this.gold_bunge_penalty	= -100;

		this.gpHighAngle		= 0;
		this.goldHighAngle		= 50;

		this.gpUltraHighAngle	= 0;
		this.goldUltraHighAngle	= 100;

		this.gpDamage1000		= 1;
		this.goldDamage1000		= 150;

		this.gpDamage2000		= 2;
		this.goldDamage2000		= 300;

		this.gpDamage3000		= 3;
		this.goldDamage3000		= 500;

		this.recetBonos();
        
        if (gameserver.evento200 === true) {
            this.gp_kill = 4;
            this.gold_kill = 600;
            this.gold_good = 50;
            this.gold_excellent = 100;
            this.gp_lose = 2;
            this.gold_lose = 200;
            this.gold_penalty = -200;
            this.gp_penalty = -1;
            this.gp_bunge_bonus = 3;
            this.gold_bunge_bonus = 600;
            this.gp_bunge_penalty = -2;
            this.gold_bunge_penalty = -200;
        }

        if (this.game.room.game_mode === Types.GAME_MODE.BOSS) {
            this.gp_kill = 2;
            this.gold_kill = 300;
            this.gold_good = 30;
            this.gold_excellent = 60;
            this.gp_lose = 1;
            this.gold_lose = 100;
            this.gold_penalty = -100;
            this.gp_penalty = -1;
            this.gp_bunge_bonus = 2;
            this.gold_bunge_bonus = 300;
            this.gp_bunge_penalty = -2;
            this.gold_bunge_penalty = -100;
        }
        
        if (gameserver.evento500 === true) {
            this.gp_kill = 8;
            this.gold_kill = 1200;
            this.gold_good = 100;
            this.gold_excellent = 200;
            this.gp_lose = 3;
            this.gold_lose = 300;
            this.gold_penalty = -200;
            this.gp_penalty = -2;
            this.gp_bunge_bonus = 6;
            this.gold_bunge_bonus = 1200;
            this.gp_bunge_penalty = -4;
            this.gold_bunge_penalty = -300;
        }
    }

    start() {
        this.work = true;
        this.run();
    }
/*
    shoot(noholea = false) {
        this.chat_complete = false;
        this.nohole = noholea;
        for (var id in this.shoots) {
            this.shoots_data.push({
                s: [],
                tele: [],
                exp: null,
                thor: null,
                img: null,
                time: null,
                /*tr: null,
                change: null,
                hole: [],
                damages: [],
                wave: [],
                orbit:[],
jumps:[],
                is_lightning: [],
                no_rotate: null,
                camera: null,
                /*start : {
                    t: [30],
                    ang: [302],
                    x: [30],
                    y: [30]
                },
                ss: null
            });
        }
    }
*/
	shoot(noholea = false) {
		this.chat_complete = false;
		this.nohole = noholea;
		for (var id in this.shoots) {
			this.shootPushData();
		}
	}
	
    run() {
        var self = this;
        setImmediate(function () {
            self.update();
        });
    }

	update() {
		var self = this;
		if (this.shoots_count > 0) {
			var good_shot_message = false;
			for (var id in this.shoots) {
				var shoot = this.shoots[id];
				if (shoot && !shoot.isComplete) {
					//console.log("Shoot not complete\n");
					shoot.update();
					// ForceController.cast(shoot, self.game.weather.client.active);
					////console.log(self.shoots[id]);
					//var ang = shoot.GetAngleAtTime();
					
					/* |<-========================= [Stats Avatars] ===========================->| */
					var scratch_my_ava = shoot.account.player.avaScratch;
					if (shoot.account.player.check_my_ava === 0)
						scratch_my_ava = 0;
					//Logger.log('Scratch: ' + scratch_my_ava);
					/* |<-========================= [Stats Avatars] ===========================->| */
					shoot.move(shoot.a.x, shoot.a.y, 0);
					shoot.bunge_jc = [
						parseInt(Math.round(parseInt(scratch_my_ava / 5) + shoot.pala_bunge[0])),
						parseInt(Math.round(parseInt(scratch_my_ava / 5) + shoot.pala_bunge[1]))
					];
					this.checkCollision(shoot);
					this.checkWeatersCast(shoot);

					if (!shoot.damageComplete) {
						self.game.room.forPlayers(function (account) {
							let player = account.player;
						   // //console.log({id:player.user_id,position:player.position,alive:player.is_alive});
							account.update();
							// console.log(self.game.weather.client.active);
							if (player.is_alive === 1) {
								if (!shoot.canCollide) {
									/** @WTF is this */
									var p2 = (20 * 20);
									var xxdx = shoot.x0 - shoot.a.x;
									var xxdy = shoot.y0 - shoot.a.y;
									var p3 = ((xxdx * xxdx) + (xxdy * xxdy));
									if (p2 < p3) {
										shoot.canCollide = true;
										//Logger.log('canCollide ' + shoot.canCollide);
									}
									/** @end WTF do this */
								} else if (shoot.isComplete) {
									shoot.canCollide = true;
								}
								var penalty = false;
							   
								let timxx = shoot.time * 2;
								let fullcollide = false;
								let areacollide = false;
								let x11		= player.box.isColliding(shoot.box);
								let distf	= {
									x: Math.sqrt(Math.pow(player.x - shoot.a.x, 2) + 0),
									y: Math.sqrt(0 + Math.pow(player.y - shoot.a.y, 2)),
									t: Math.sqrt(Math.pow(player.x - shoot.a.x, 2) + Math.pow(player.y - shoot.a.y, 2))
								};
								let dm		= shoot.damage;
								let heal	= shoot.heal;
								let shdm	= 0;
								
								if (shoot.canCollide && x11 === 0)
									fullcollide = true;
								

								if (shoot.groundCollide || fullcollide || shoot.isComplete) {
									if (shoot.account.player.TELEPORT==1&&(self.map.w < shoot.a.x || self.map.h < shoot.a.y || self.map.GetUnder(player.x, player.y,0) === 0)){
										 shoot.cancelTele = true;
									}
									/*
									console.log({
										is:"teleport",
										tamañoMapa		: {
											h:self.map.h,
											w:self.map.w,
										},
										pocicionDisparo	: shoot.a,
										condicionA		: self.map.w < shoot.a.x,
										condicionB		: self.map.h < shoot.a.y
									});*/
									if (shoot.bonos&&(shoot.account.player.team === player.team && self.game.room.event_game_room === 0)) {
										penalty = true;
									}
									
									if (self.game.room.no_bonus_user)
										self.gp_kill = 0;
									if ((distf.t <= 60)&&shoot.heal) { //distancia
										heal -= distf.t/2;
										areacollide = true;
									}else if (shoot.damage == null&&shoot.canPlayerCollide) {
										shoot.isComplete = true;
										shoot.damageComplete = true;
									} else if (distf.x <= shoot.bunge_jc[0] && distf.y <= shoot.bunge_jc[1]){
										dm -= distf.t/2;
										areacollide = true;
									}
									if (fullcollide || areacollide) {
										/** @Begin add Shoots */
										if(!shoot.canPlayerCollide){
											if (shoot._wait > 50 || !shoot._wait){
												self.addAtCollide(shoot);
												shoot._wait = 0;
												shoot._wait++;
											}
											else shoot._wait++;
										}
										if (areacollide&&shoot.area) {
											shoot.a = {
												x: player.x,
												y: player.y
											};
											self.addShootQueue(shoot);
										} 
										if (!self.map.IsPixel(shoot.a.x, shoot.a.y ) && shoot.is == "digger" ) shoot.canPlayerCollide = true;
										/** @End add Shoots */
										if(shoot.canPlayerCollide){
											if (player.shield > 0&&!shoot.heal) {
												//Logger.cyan("#1 Shield: "+player.shield+" - DameShot: "+dm+" - User: "+player.game_id);
												shdm = player.shield - dm;
												if (shdm === 0) {
													player.setShield(0);
													if (shoot.image === Types.BULLETS.JD2) {
														self.shoots_data[self.shoots_complete].damages.push({
															n: player.game_position,
															movex: shoot.a.x,
															hp: player.hp,
															damage: 0,
															shield: player.shield
														});
													} else {
														self.shoots_data[self.shoots_complete].damages.push({
															n: player.game_position,
															hp: player.hp,
															damage: 0,
															shield: player.shield
														}); 
													}

												} else if (shdm < 0) {
													player.setShield(0);
													player.disHpShield(Math.floor(Math.abs(shdm)), 0);
													if (shoot.image === Types.BULLETS.JD2) {
														self.shoots_data[self.shoots_complete].damages.push({
															n: player.game_position,
															movex: shoot.a.x,
															hp: player.hp,
															damage: 0,
															shield: player.shield
														});
													} else {
														self.shoots_data[self.shoots_complete].damages.push({
															n: player.game_position,
															hp: player.hp,
															damage: 0,
															shield: player.shield
														}); 
													}
												} else {
													player.setShield(Math.floor(Math.abs(shdm)));
													if (shoot.image === Types.BULLETS.JD2) {
														self.shoots_data[self.shoots_complete].damages.push({
															n: player.game_position,
															movex: shoot.a.x,
															hp: player.hp,
															damage: +shdm,
															shield: player.shield
														});
													} else {
														self.shoots_data[self.shoots_complete].damages.push({
															n: player.game_position,
															hp: player.hp,
															damage: +shdm,
															shield: player.shield
														}); 
													}
												}
											} else {
												if (shoot.heal > 0)
													player.disHpShield(Math.floor(-Math.abs(heal)), 0);
												else
													player.disHpShield(Math.floor(Math.abs(dm)), 0);
												if (shoot.teleport&&shoot.type == 1) {
													player.x = shoot.a.x;
													self.shoots_data[self.shoots_complete].damages.push({
														n: player.game_position,
														movex: shoot.a.x,
														hp: player.hp,
														damage: dm,
														shield: player.shield
													});
												} else if (shoot.teleport&&shoot.type == 2) {
													if (player.x>shoot.a.x)
														player.x = shoot.a.x + 100;
													else
														player.x = shoot.a.x - 100;
													self.shoots_data[self.shoots_complete].damages.push({
														n: player.game_position,
														movex:player.x,
														hp: player.hp,
														damage: dm,
														shield: player.shield
													});
												} else if (heal > 0) {
													self.shoots_data[self.shoots_complete].damages.push({
														n: player.game_position,
														heal: heal,
														hp: player.hp
													}); 
												} else {
													self.shoots_data[self.shoots_complete].damages.push({
														n: player.game_position,
														damage: dm,
														hp: player.hp
													});
												}
											}
											
											if (penalty) {
												self.bonos.teamDamage = [Types.GAMEMSG.team_damage_penalty, self.gold_penalty, self.gp_penalty];
											} else  {
												self.bonos.damage = [Types.GAMEMSG.good_shot, self.gold_good, 0];
												if (shoot.isMirror) {
													self.bonos.mirror_bonus = [Types.GAMEMSG.mirror_bonus, 50, 2];
												}
												if (shoot.isTornado) {
													self.bonos.hurricane_bonus = [Types.GAMEMSG.hurricane_bonus, 50, 2];
												}
											}
											
											if (player.hp <= 0) {
												player.setAlive(0);
												self.bonos.kills.push([player.game_position,true,penalty])
											}
											if (heal > 0) self.bonos.totaldamage += shdm>0?shdm:dm
											
											shoot.isComplete = true;
											shoot.damageComplete = true;
											if (!shoot.groundCollide) {
												self.addGroundHole(shoot);
												account.update();
											}
										}
									}

									/*============[BUNGE]*============*/
									if (player.is_alive) {
										player.falling = false;
										if (typeof (player.y) === 'undefined' || player.y === 2000) {
											Logger.info("BUNGE CODE #1");
											//Logger.info("Player ["+player.game_id+"] fall and die");
											player.falling = true;
											shoot.chat_complete = true;
											player.is_alive = 0;
											player.setAlive(0);
											player.cause_by = shoot.account.player.game_id;
											self.chat.push(Types.GAMEMSG.bunge_bonus);
											self.chat.push(Types.GAMEMSG.x_bunge_y);
											self.chat.push(player.game_position);
											self.bonos.kills.push([player.game_position,false,penalty])
											shoot.account.player.addWinGoldWinGp(self.gold_bunge_bonus, self.gp_bunge_bonus);
											self.chat.push(Types.GAMEMSG.bbp_fantastic_shot);
											if (penalty&&!self.bonos.suicideBunge) {
												//Logger.data("BUNGE CODE #1.1");
												self.bonos.suicideBunge = true;
												self.chat.push(Types.GAMEMSG.suicide_penalty_bunge);
												shoot.account.player.addWinGoldWinGp(self.gold_bunge_penalty, self.gp_bunge_penalty);
											}
											//Logger.log("Status: "+player.is_alive+" -  Player: "+player.game_id);
											account.update();
										} else {
											//Logger.info("BUNGE CODE #2");
											//Logger.debug("Player ["+player.game_id+"] fall and not die");
											var yf = self.map.GetUnder(player.x, player.y,0);
											if (yf === 0 && player.is_alive) {
												//Logger.data("BUNGE CODE #2.1");
												var tmp_y = 0;
												var tmp_c = 1;
												var tmp_under = 0;
												do {
													//Logger.data("BUNGE CODE #2.2");
													tmp_y = self.map.GetUnder(player.x, player.y + tmp_c);
													if ((player.y + tmp_c) > self.map.h) {
														//Logger.data("BUNGE CODE #2.3");
														player.falling = true;
														player.y = self.map.h;
														tmp_y = -1;
														self.chat.push(Types.GAMEMSG.bbp_fantastic_shot);
														//Logger.debug("World player falling 1");
														self.chat.push(Types.GAMEMSG.x_bunge_y);
														self.chat.push(shoot.account.player.game_position);
														self.bonos.kills.push([player.game_position,false,penalty])
														//Logger.data("BUNGE CODE #2.4");
													}
													tmp_c++;
												} while (tmp_y == 0);
												if (tmp_y !== 0){
													//Logger.data("BUNGE CODE #2.5");
													player.y = tmp_y;
													if (player.box === null) {
														//Logger.data("BUNGE CODE #2.6");
														player.box = new Box(new Vector(player.x, player.y), 36, 40, 0);
													} else {
														//Logger.data("BUNGE CODE #2.7");
														player.box.setp(new Vector(player.x, player.y));
													}
													//Logger.data("BUNGE CODE #2.8");
												}
												//Logger.data("BUNGE CODE #2.9");
											} else  {
												//Logger.data("BUNGE CODE #2.10");
												player.y = yf;
												if (player.box === null) {
													//Logger.data("BUNGE CODE #2.11");
													player.box = new Box(new Vector(player.x, player.y), 36, 40, 0);//36, 40
												} else {
													//Logger.data("BUNGE CODE #2.12");
													player.box.setp(new Vector(player.x, player.y));
													//Logger.cyan("Mis Datos ["+player.game_id+"] de posicion: x: "+player.x+" - y: "+player.y);
												}
												//Logger.data("BUNGE CODE #2.13");
											}
											//Logger.data("BUNGE CODE #2.14");
										}
									}
									/*============[BUNGE]*============*/
								}
							}
						});
					}
					if (shoot.isComplete) {
						this.shoots_data[this.shoots_complete].s.push(shoot.x0);
						this.shoots_data[this.shoots_complete].s.push(shoot.y0);
						this.shoots_data[this.shoots_complete].s.push(shoot.ang);
						this.shoots_data[this.shoots_complete].s.push(shoot.power);
						this.shoots_data[this.shoots_complete].s.push(shoot.ax?shoot.ax:shoot.friccion);
						this.shoots_data[this.shoots_complete].s.push(shoot.ay?shoot.ay:shoot.weight);
						this.shoots_data[this.shoots_complete].s.push(shoot.stime);
						this.shoots_data[this.shoots_complete].exp = shoot.account.player.TELEPORT == 1 ? 7 :shoot.explode;//EXPLODE
						this.shoots_data[this.shoots_complete].thor = shoot.isthor;
						this.shoots_data[this.shoots_complete].img = shoot.account.player.TELEPORT == 1 ? 10 :shoot.image;//BULLETS
						if (shoot.account.player.TELEPORT == 1) {
							if (!shoot.cancelTele) {
								this.shoots_data[this.shoots_complete].tele.push(shoot.account.player.game_position);
								this.shoots_data[this.shoots_complete].tele.push(shoot.a.x);
								this.shoots_data[this.shoots_complete].tele.push(shoot.a.y);
								this.shoots_data[this.shoots_complete].tele.push(shoot.a.x);
								this.shoots_data[this.shoots_complete].tele.push(shoot.a.y);
							}
							shoot.account.player.TELEPORT = 0;
						}
						this.shoots_data[ this.shoots_complete ].orbit = shoot.orbit;
						this.shoots_data[ this.shoots_complete ].wave = shoot.wave;
						/*this.shoots_data[ this.shoots_complete ].change.at = shoot.at;
						this.shoots_data[ this.shoots_complete ].change.exp = shoot.explodeC;
						this.shoots_data[ this.shoots_complete ].change.img = shoot.imageC;*/
						this.shoots_data[ this.shoots_complete ].is_lightning = shoot.isLightning;
						this.shoots_data[ this.shoots_complete ].no_rotate = shoot.no_rotate;
						this.shoots_data[ this.shoots_complete ].camera = shoot.camera;
						this.shoots_data[this.shoots_complete].s.push(shoot.image);
						this.shoots_data[this.shoots_complete].time = shoot.isthor ? 0 : shoot.time * 2;
						this.shoots_data[this.shoots_complete].ss = shoot.ss;
						
						self.addAtMaxT(shoot);
						self.addAtEnd(shoot);
						self.addAtTime(shoot);
						self.addWeatherDamage(shoot);
						
					//	console.log("====================== Final Shoot ============================")
					//	console.log(`Shoot`, this.shoots_data[this.shoots_complete])
					//	console.log("===============================================================")
						this.shoots_complete++;
					}
				}
			}
			if (this.shoots_count <= this.shoots_complete) {
				this.shoots_count	= 0;
				this.shoots_complete= 0;
				this.procesBonos({account:self.shoots[0].account,shoots_data:self.shoots_data.slice(0), chat:this.chat, bonos:this.bonos})
				.then((data)=>{
				//	console.log({is:"world shoot compleate", data:data});
					this.shoot_complete(data.account, data.shoots_data, data.chat);
					this.chat		= [];
					this.shoots_data= [];
					this.recetBonos();
				})
				//.catch((error)=>console.log({is:"world shoot compleate",error:error}))
			}
			setImmediate(function () {
				self.update();
			});
		}
	}

    onShootComplete(callback) {
        this.shoot_complete = callback;
	}
	procesBonos(data){
	//	console.log({is:"proces bonos in ",data:data});
		return this.addKillsBonus(data)
		.then((data)=>{
			//console.log({is:"add kills bonus", data:data});
			return this.addMultiKillBonus(data)
		})
		.then((data)=>{
			return this.addAngleBonus(data)
		})
		.then((data)=>{
			//console.log({is:"set dead bonus",data:data});
			return this.addGeneralBonus(data)
		})/*
		.then((data)=>{
			//console.log({is:"add general bonus", data:data});
			return data
		})*/
		.catch((error)=>{
			//console.log({is:"world shoot Error",error:error})
			return false;
		})
	}
	addKillsBonus(data) {
		let self = this
		let kills= data.bonos.kills
		return new Promise((resolve) => {
			data.bonos.ValidKills = 0
			for (let i = 0; i < kills.length; i++) {
			//	console.log({is:"kill bonus",data: kills[i]});
				if (kills[i][1]) {
					data.chat.push(Types.GAMEMSG.bbp_great_shot,Types.GAMEMSG.x_killed_y,kills[i][0])
					data.account.player.addWinGoldWinGp(self.gold_kill, self.gp_kill)
				}
				if(!kills[i][2]) data.bonos.ValidKills +=1
			}
			resolve(data)
		});
	}
	addMultiKillBonus(data){
		if(data.bonos.ValidKills > 1) {
			let bono;
			if(data.bonos.ValidKills == 2) bono = [Types.GAMEMSG.double_kill,this.goldDoubleKill,this.gpDoubleKill]
			else bono = [Types.GAMEMSG.triple_kill,this.goldTripleKill,this.gpTripleKill]
			data.chat.push(bono[0])
			data.account.player.addWinGoldWinGp(bono[1],bono[2]);
		}
		return data
	}
	addAngleBonus(data) {
		if (data.bonos.damage && !data.bonos.teamDamage) {
			if (
					(Math.abs(data.shoots_data[0].s[2]) >= 70 && Math.abs(data.shoots_data[0].s[2]) < 80) ||
					(Math.abs(data.shoots_data[0].s[2]) <= 110 && Math.abs(data.shoots_data[0].s[2]) > 100)
				) {
				data.chat.push(Types.GAMEMSG.high_ang)
				data.account.player.addWinGoldWinGp(this.goldHighAngle,this.gpHighAngle);
			}
			else if(Math.abs(data.shoots_data[0].s[2]) >= 80&&Math.abs(data.shoots_data[0].s[2]) <= 100){
				data.chat.push(Types.GAMEMSG.ultra_high_ang)
				data.account.player.addWinGoldWinGp(this.goldUltraHighAngle,this.gpUltraHighAngle);
			}
		}
		return data
	}
	addGeneralBonus(data){
		return new Promise((resolve) => {
			Object.keys(data.bonos).forEach((value, index, array) => {
				if (data.bonos[value].length == 3){
					data.chat.push(data.bonos[value][0])
					data.account.player.addWinGoldWinGp(data.bonos[value][1], data.bonos[value][2]);
				}
				if (index === array.length -1) {
					//console.log({is:"return",data:data});
					resolve(data);
				}
			});
		})
	}
	checkCollision(shoot){
		let self = this;
	//	console.log({isCollider:self.map.IsPixel(shoot.a.x, shoot.a.y)})
		if (
			(self.map.IsPixel(shoot.a.x, shoot.a.y) && !shoot.groundCollide && shoot.canMapCollide && shoot.is != "digger") ||
			(!self.map.IsPixel(shoot.a.x, shoot.a.y ) && shoot.is == "digger" ) 
		) {
		/*	console.log({
				is:"check collision",
				condicionA	: (self.map.IsPixel(shoot.a.x, shoot.a.y) && !shoot.groundCollide && shoot.canMapCollide && shoot.is != "digger"),
				condicionB	: (!self.map.IsPixel(shoot.a.x, shoot.a.y ) && shoot.is == "digger" ) ,
				condicionC	: (self.map.w < shoot.a.x || self.map.h < shoot.a.y),
				condicionD	: (shoot.time>shoot.killAt),
			})*/
			shoot.isComplete = true;
			self.addGroundHole(shoot);
			shoot.groundCollide = true;
		}
		else if (
			(self.map.w < shoot.a.x || self.map.h < shoot.a.y) ||
			(shoot.time>shoot.killAt)
		) {
			shoot.isComplete = true;
		/*	console.log({
				is:"check collision",
				condicionA	: (self.map.IsPixel(shoot.a.x, shoot.a.y) && !shoot.groundCollide && shoot.canMapCollide && shoot.is != "digger"),
				condicionB	: (!self.map.IsPixel(shoot.a.x, shoot.a.y ) && shoot.is == "digger" ) ,
				condicionC	: (self.map.w < shoot.a.x || self.map.h < shoot.a.y),
				condicionD	: (shoot.time>shoot.killAt),
			})*/
		}
	}
	
	//Aqui empieza las balas de weathers
	
	checkWeatersCast(shoot){
		this.game.weather.active.forEach(force => {
			if (force.isCollide(shoot.a.x)){
				for (const cast in force.cast) {
					if (Array.isArray(force.cast[cast])) this["_castWeather"+force.cast[cast][0]](shoot,force,force.cast[cast][1])
					else this["_castWeather"+force.cast[cast]](shoot,force)
				}
			} else if (shoot.lastMirror === force.px) {
				shoot.lastMirror = null;
			}
		});
	}
	_castWeatherTornado(shoot, force, config) {
		shoot.lastTornado = shoot.lastTornado ? shoot.lastTornado : null;
		if (shoot.lastTornado !== force.px) {
			shoot.lastTornado = force.px;
			shoot.isComplete = true;

			// Instantaneous velocity calculation at entering the vortex:
			let a = shoot.time / 485;
			let vx = shoot.v.x + (shoot.friccion * a);
			let vy = shoot.v.y + (shoot.weight * a);

			let dir = vx >= 0 ? 1 : -1;
			let newVx = (Math.abs(vx) < 50 ? dir * 150 : vx * 1.15);
			let newVy = vy - 120; // Upward draft lift

			let newPower = Math.sqrt(newVx * newVx + newVy * newVy);
			let newAng = Math.atan2(-newVy, newVx) * 180 / Math.PI;
			if (newAng < 0) newAng += 360;

			let halfW = 25;
			if (force.power) halfW = Math.max(25, (force.power / 2) + 5);
			let startX = force.px + (dir * halfW);
			let startY = shoot.a.y - 15;

			shoot.config = {
				...config,
				x0: startX,
				y0: startY,
				ang: Math.round(newAng * 100) / 100,
				power: Math.round(newPower * 100) / 100,
				damage: shoot.damage ? Math.round(shoot.damage * 1.25) : null,
				pala_bunge: shoot.pala_bunge,
				image: shoot.image,
				explode: shoot.explode,
				weight: shoot.weight,
				friccion: shoot.friccion,
				wind_power: 0,
				lastTornado: force.px,
				stime: shoot.stime + (shoot.time * 2),
				isTornado: true
			};
			shoot.damage = null;
			shoot.explode = null;

			this.addbulets(shoot);
		}
	}
	_castWeatherMirror(shoot, force, config) {
		shoot.lastMirror = shoot.lastMirror ? shoot.lastMirror : null;
		shoot.countMirror = shoot.countMirror ? shoot.countMirror : 0;

		const mirrorId = force.px;

		if (shoot.lastMirror !== mirrorId) {
			shoot.isComplete = true;

			// Instantaneous velocity calculation at impact:
			let a = shoot.time / 485;
			let vx = shoot.v.x + (shoot.friccion * a);
			let vy = shoot.v.y + (shoot.weight * a);

			// Invert horizontal velocity for vertical reflection plane
			let newVx = -vx;
			let newVy = vy;

			let newPower = Math.sqrt(newVx * newVx + newVy * newVy);
			let newAng = Math.atan2(-newVy, newVx) * 180 / Math.PI;
			if (newAng < 0) newAng += 360;

			// Nudge start position away from barrier outside 10px collision zone
			let startX = shoot.a.x + (newVx < 0 ? -15 : 15);
			let startY = shoot.a.y;

			shoot.config = {
				...config,
				x0: startX,
				y0: startY,
				ang: Math.round(newAng * 100) / 100,
				power: Math.round(newPower * 100) / 100,
				damage: shoot.damage ? Math.round(shoot.damage * 1.2) : null,
				pala_bunge: shoot.pala_bunge,
				image: shoot.image,
				explode: shoot.explode,
				weight: shoot.weight,
				friccion: shoot.friccion,
				wind_power: 0,
				lastMirror: mirrorId,
				countMirror: shoot.countMirror + 1,
				stime: shoot.stime + (shoot.time * 2),
				isMirror: true
			};
			shoot.damage = null;
			shoot.explode = null;

			if (shoot.config.countMirror < 10) {
				this.addbulets(shoot);
			} else {
				this.addGroundHole(shoot);
				shoot.groundCollide = true;
			}
		}
	}
	_castWeatherLightning(shoot,force,config) {
		if(shoot.is !== "weatherLightning"){
		//	console.log({shoot:shoot,include:shoot.addAtEnd.includes("lightning")})
			shoot.is		= "weatherLightning"
			shoot.addAtEnd	= shoot.addAtEnd.includes("lightning")?shoot.addAtEnd:shoot.addAtEnd.concat(["lightning"])
			shoot.lightning	= [config]
			this.shoots_data[this.shoots_complete].tr = [50, 0, shoot.time * 2, 200];
		}
	}
	_castWeatherSun(shoot,force,config) {
		if(shoot.is !== "weatherSun"){
			const { time } = shoot;
			shoot.is		= "weatherSun"
			// shoot.addAtEnd	= shoot.addAtEnd.includes("sun")?shoot.addAtEnd:shoot.addAtEnd.concat(["sun"])
			let shot_step = [];
		    const max_step = 10;
		    let pointer_step = 0;
		    for (pointer_step; pointer_step < max_step; pointer_step++) {
		      const time_lapse = time * 2;
		      const sum_step = pointer_step === 0 ? 0 : pointer_step === 1 ? 40 : 50;
		      shot_step.push(time_lapse + sum_step);
		    }
			this.shoots_data[this.shoots_complete].tr = [51, 3, time * 2, 50, shot_step];

			// Increase damage by 50%
			shoot.damage = shoot.damage * 1.5;
		}
	}
	_castWeatherBlack(shoot,force,config) {
		if(shoot.is !== "weatherBlack"){
			const { time } = shoot;
			shoot.is		= "weatherBlack"
			// shoot.addAtEnd	= shoot.addAtEnd.includes("black")?shoot.addAtEnd:shoot.addAtEnd.concat(["black"])
			this.shoots_data[this.shoots_complete].black_at = time * 2

        	// Reduce damage by 50%
			shoot.damage = shoot.damage * 0.5;
		}
	}

	addGroundHole(shoot){
		let self = this;
		self.shoots_data[self.shoots_complete].hole.push(shoot.a.x);
		self.shoots_data[self.shoots_complete].hole.push(shoot.a.y);
		self.shoots_data[self.shoots_complete].hole.push(self.nohole ? 0 : shoot.bunge_jc[0]);
		self.shoots_data[self.shoots_complete].hole.push(self.nohole ? 0 : shoot.bunge_jc[1]);
		self.map.AddGroundHole(shoot.a.x, shoot.a.y, shoot.bunge_jc[0], shoot.bunge_jc[1]);
	}
	addAtMaxT(data){
		let self = this;
		if (data.addAtMaxT)
			for (const add of data.addAtMaxT) {
				for (let i = 0; i < data[add].length; i++) {
			//		console.log(`add ${add} id: ${i} at MaxT`)
					data.config	= data[add][i]
					data.config.stime =  data.stime*2 + data.getMaxT();
					data.config.iD 	= i;
					self["add"+add](data);
				}
			};
	}

	addAtTime(data){
		let self = this;
		if (data.addAtTime)
			for (const add of data.addAtTime) {
				for (let i = 0; i < data[add[0]].length; i++) {
			//		console.log(`add ${add[0]} id: ${i} at time ${add[1]}`)
					data.config	= data[add[0]][i]
					data.config.stime = add[1];
					data.config.iD 	= i;
					self["add"+add[0]](data);
				}
			};
	}

	addAtEnd(data){
		let self = this;
		if (data.addAtEnd) 
			for (const add of data.addAtEnd) {
				for (let i = 0; i < data[add].length; i++) {
			//		console.log(`add ${add} id: ${i} at End`)
					data.config	= data[add][i]
					data.config.stime = data.config.addtime == "maxt"?data.stime + data.getMaxT():(data.config.addtime?(i+1)*data.config.addtime:0) + data.stime + data.time*2;
					data.config.iD 	= i;
					self["add"+add](data);
				}
			};
	}

	addAtCollide(data){
		let self = this;
		if (data.addAtCollide) {
			for (const add of data.addAtCollide) {
				for (let i = 0; i < data[add].length; i++) {
			//		console.log(`add ${add} id: ${i} at collide`)
					data.config	= data[add][i]
					data.config.stime = (data.config.addtime?(i+1)*data.config.addtime:0) + data.stime + data.time*2;
					data.config.iD 	= i;
					self["add"+add](data);
				}
			}}
	}
	addWeatherDamage(data) {
		let self = this;
		if (!self.shoots_data[self.shoots_complete].isStage&&self.game.thor.active&&!data.isthor){
			data.config	= {pala_bunge:[25,25],explode:Types.EXPLODE.ADUKA1_THOR}
			data.config.stime = 200 + data.stime + data.time*2;
			data.config.iD 	=  0;
			self["addthor"](data);
		};
		if(self.game.weather.current==4) self._addWeatherLightning(data)
		//console.log("[add Weather]",{current:self.game.weather.current});
	}
	addthor(data){
		var self = this;
		self.game.thor.angle = -Math.atan2((data.a.y - self.game.thor.y),(data.a.x - self.game.thor.x)) * 180 / Math.PI;
		if (self.game.thor.angle < 0)
			self.game.thor.angle += 360;
		let shootConfig = {x0:self.game.thor.x, y0:self.game.thor.y, ang:self.game.thor.angle, power:999, type:data.type, stime:data.config.stime, account:data.account, shootId:data.shootId, thorId:data.config.iD, isthor:true, damage:self.game.thor.damage/2};
		self.shoots[self.shoots_count] = new Shoot({...shootConfig,...data.config});
		self.shoots_data[self.shoots_complete].isStage = true;
		self.shoots_count++
		self.shootPushData();
	}

	addion(data){
		let self = this; 
		let x = self.game.ion.x + data.account.player.x;
		let y = self.game.ion.y0 + data.account.player.y;
		let a = {x:data.a.x,y:data.a.y}
		switch (data.type) {
			case 1:
				y = self.game.ion.y1 + data.account.player.y;
				a.x += data.config.addToObX? data.config.addToObX[(data.ang > 90 && data.ang < 270)? 0 : 1] : 0;
				break;
			case 2:
				x = data.config.addToX? data.a.x + data.config.addToX : data.a.x ;
				y = data.config.addToY? self.game.ion.y1 + data.account.player.y + data.config.addToY: self.game.ion.y1 + data.account.player.y;
				break;
		}
		self.game.ion.angle = -Math.atan2((a.y - y),(a.x - x)) * 180 / Math.PI;
		//console.log({is:"addIon",origin:{x:x,y:y},objetive:{x:a.x,y:a.y}});
		if (self.game.ion.angle < 0)
			self.game.ion.angle += 360;
		let shootConfig = {x0:x, y0:y, ang:self.game.ion.angle, power:999, type:data.type, stime:data.config.stime, account:data.account, shootId:data.shootId, ionId:data.config.iD};
		self.shoots[self.shoots_count] = new Shoot({...shootConfig,...data.config});
	//	console.log({soy:"addBulet",data:{...shootConfig,...data.config}});	
		self.shoots_data[self.shoots_complete].isStage = true;
		self.shoots_count++
		self.shootPushData();
	}

	addlightning(data){
		var self = this;
		var x =  data.config.addx0? data.a.x + data.config.addx0 : data.a.x;
		var y = -1000;
		self.game.Lightning.angle = -Math.atan2((data.a.y - y),(data.a.x - x)) * 180 / Math.PI;
		if (self.game.Lightning.angle < 0)
			self.game.Lightning.angle += 360;
		let shootConfig = {x0:x, y0:y, ang:self.game.Lightning.angle, power:9999, type:data.type, stime:data.config.stime, account:data.account, shootId:data.shootId, lightningId:data.config.iD,isLightning:1}
		self.shoots[self.shoots_count] = new Shoot({...shootConfig,...data.config});
	//	console.log({soy:"ligt",data:{...shootConfig,...data.config}});
		self.shoots_data[self.shoots_complete].isStage = true;
		self.shoots_count++
		self.shootPushData();
	}

	adddigger(data){
		let self = this;
		data.a = data.getPosAtTime(data.time+5);
		let shootConfig = {x0:data.a.x, y0:data.a.y,ang:-data.GetAngleAtTime(data.time) , type:data.type, stime:data.config.stime, account:data.account, shootId:data.shootId,is:"digger"};
		shootConfig = {...shootConfig,...data.config};
		if (shootConfig.power = "parent") shootConfig.power = data.power;
		self.shoots[self.shoots_count] = new Shoot(shootConfig);
		self.shoots_count++
		self.shootPushData();
		shootConfig.account = "";
		
		self.shoots_data[self.shoots_complete].isStage = true;
//		console.log({soy:" digger",data:{...shootConfig,...data.config}});
	}

	addbulets(data){
		let self	= this;
		let pos;
		if (data.config && data.config.x0 !== undefined && data.config.y0 !== undefined) {
			pos = { x: data.config.x0, y: data.config.y0 };
		} else {
			switch (data.config.position) {
				case "parent":
					pos	= data.a;
					break;
				case "time": 
					pos	= data.getPosAtTime(data.config.stime/2);
					break;
				default:
					pos	= data.config.posicion || data.a;
					break;
			}
		}
	//	const ftime = (data.time+data.stime)-data.config.stime> 200?(data.time+data.stime)-data.config.stime:200;
		const fang	= data.GetAngleAtTime(data.config.stime/2);
		const power	= data.power;
		data.config.objetive =  data.objetive?data.objetive : data.a;
	//	console.log({ftime:ftime,fang:fang,power:power});
	//	data.config.finalTime = data.config.stime? data.config.stime : ((data.config.id+1)*data.config.time*100) + data.stime + data.time*2;
	//	let shootConfig = {x0:pos.x, y0:pos.y, ang:fang, power:power, type:data.type, account:data.account, shootId:data.shootId,isUnderGround:true,is:"addBulet"};
		let shootConfig = {x0:pos.x, y0:pos.y,x1:data.config.objetive.x,y1:data.config.objetive.y, power:power, ang:fang, stime:data.config.stime, type:data.type, account:data.account, shootId:data.shootId,is:"addBulet"};

		shootConfig = {...shootConfig,...data.config}
		if (Array.isArray(shootConfig.ang)){
			shootConfig.ang = shootConfig.ang[(data.ang > 90 && data.ang < 270)? 0 : 1]  
		}
		if (Array.isArray(shootConfig.orbit)&&Array.isArray(shootConfig.orbit[1])){
			shootConfig.orbit	= [
				shootConfig.addOrbit[0],
				shootConfig.addOrbit[1][(data.ang > 90 && data.ang < 270)? 0 : 1],
				shootConfig.addOrbit[2],
				shootConfig.addOrbit[3]
			] 
		}
		if (data.config.power =="parent"){
		//	shootConfig.v = {x:data.v.x,y:0};
			shootConfig.ang		-= shootConfig.addAng[(data.ang > 90 && data.ang < 270)? 0 : 1]
			shootConfig.power	= data.v.x / Math.cos(shootConfig.ang * Math.PI / 180);
		//	console.log({is:"shoot",ang:shootConfig.ang});
		//	shootConfig.power = Math.sqrt((data.v.x*data.v.x + 0),2)
		}

		self.shoots[self.shoots_count] = new Shoot(shootConfig);
	/*	console.log("===============================================================================");
		console.log({is:"addbulets",data:shootConfig})
		console.log("===============================================================================");*/
	
		self.shoots_data[self.shoots_complete].isStage = true;
		self.shoots_count++
		self.shootPushData();
	}

	addchange(shoot){
		let self = this;
		if (shoot.config) {
			self.shoots_data[self.shoots_complete].change = {
				at: shoot.config.stime|| null,
				exp: shoot.config.explode || null,
				img: shoot.config.image || null
			};
	//		console.log({is:"change",time:shoot.time,print:self.shoots_data[self.shoots_complete].change,data:shoot.config});
		}
	}

	addset(shoot){
		let self = this;
		if (shoot.time > shoot.config.stime){
			for (let key in shoot.config) {
				self.shoots_data[self.shoots_complete][key] = shoot.config[key];
			}
		}
	}

	addwalker(){
		let self = this;
	//	self.shoots_data[self.shoots_complete].walker = 1;
		self.shoots_data[self.shoots_complete].path	= [600,800,0,1000,-1000,0];
	}
	
	addmine(){
		let self	= this;
		let shootConfig = {x0:data.a.x, y0:data.a.y,x1:data.a.x,y1:data.a.y, ang:180, type:data.type, account:data.account, shootId:data.shootId,isUnderGround:true,is:"addmine"};

		self.shoots[self.shoots_count] = new Shoot({...shootConfig,...data.config});
		self.shoots_count++
		self.shootPushData();
	//	console.log({soy:"addBulet",data:{...shootConfig,...data.config}});
	}

	shootPushData() {
		this.shoots_data.push({
			s: [],
			tele: [],
			exp: null,
			thor: null,
			img: null,
			time: null,
			change: null,
			hole: [],
			damages: [],
			wave: [],
			orbit:[],
			jumps:[],
			is_lightning: [],
			no_rotate: null,
			camera: null,
			show: null,
			ss: null
		});
	}

	recetBonos() {
		this.bonos		= {
			kills		: [],
			totaldamage	: 0
		}
	}
};