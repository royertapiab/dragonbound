require('dotenv').config();
var fs = require('fs');
var ws = require('./game/lib/ws');
var DataBase = require('./game/database');
var Logger = require('./game/lib/logger');
var GameServer = require('./game/gameserver');
var Account = require('./game/account');
var MapController = require('./game/lib/mapController');

var loadx = true;
var self = this;
Logger.Init("game.txt");
this.db = new DataBase();
mapControll = new MapController(loadx);
server = new ws(9001);
ip_actions = {};
this.pending_messages = {};
this.last_account_info = {};
this.multiworld = {};
this.multiworld[1] = new GameServer(1, [86, "Normal", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[2] = new GameServer(2, [86, "Bunge", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[3] = new GameServer(3, [86, "Battle", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[4] = new GameServer(4, [86, "Holiday", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[5] = new GameServer(5, [86, "Prix", 1, 3], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[6] = new GameServer(6, [86, "Beginners", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[7] = new GameServer(7, [86, "Avatar On", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[8] = new GameServer(8, [86, "Guilds", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[9] = new GameServer(9, [86, "Aduka", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[10] = new GameServer(10, [86, "Fast Lobby", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[11] = new GameServer(11, [86, "VIP", 0, 0], 900, server, this, this.pending_messages, this.last_account_info);
this.multiworld[12] = new GameServer(12, [86, "Prix Pro", 1, 3], 900, server, this, this.pending_messages, this.last_account_info);

for (var i in this.multiworld) {
    this.multiworld[i].db = this.db;
    this.multiworld[i].mapControl = mapControll;
    Logger.info("Server:"+this.multiworld[i].id+" Map And DB loaded");
}

server.onConnect(function (connection) {
    for (var i in self.multiworld) {
        if (server.server_qid == self.multiworld[i].id) {
            //Logger.info("enter intro server:"+server.server_qid);}
            const ip = connection._connection._socket.remoteAddress;
            //console.log(ip);
            if(ip_actions[ip]==undefined)
                ip_actions[ip] = {baned:false,actions:[]};

            /*ip_actions[ip].actions.push(Date.now());
            var instant_action = 0;
            for(var i=0;i<ip_actions[ip].actions.length;i++){
                if(ip_actions[ip].actions[i+1]!=undefined){
                    var time_elapsed = ip_actions[ip].actions[i+1]-ip_actions[ip].actions[i];
                    if(time_elapsed<900){
                        instant_action++;
                        if(instant_action>4){
                            ip_actions[ip].baned = true;
                            console.log("banned ip:"+ip);

                            connection._connection.close();
                            break;
                        }
                    }
                }
            }*/

            if (ip_actions[ip].baned){
                connection._connection.close();
                return false;
            }
            
            self.multiworld[i].connect_callback(new Account(connection, self.multiworld[i],ip_actions));
        }
    }
});
for (var i in this.multiworld) {
    this.multiworld[i].run();
}

server.onError(function () {
    Logger.log('Error Server');
});

process.on('uncaughtException', function (e) {
    console.log(e);
    //Logger.error('uncaughtException: ' + e.stack);
});

function keepAlive() {
    self.db.connection.getConnection().then(conn => {
        conn.query('SELECT 1', [])
            .then(rows => {
                conn.release();
            });
    });
}
setInterval(keepAlive, 28000);