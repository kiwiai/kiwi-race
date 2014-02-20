function Server() {
    this.clients = {};
}

(function() {
    this.addClient = function(client) {
        this.clients[client.sessionId] = client;
        console.log("client connected: ", client.sessionId);
        var _self = this;
        client.on("message", function(data) {
            _self.onClientMessage(data, client);
        });
        client.on("disconnect", function() {
            _self.onClientDisconnect(client);
        });
    };
    
    this.onClientMessage = function(data, client) {
        data = JSON.parse(data);
        data.sessionId = client.sessionId;

        switch (data.type) {
            case "playerJoin":
            case "playerMove":
            case "playerCount":
            case "reset":
                //console.log("broadcasting type", data.type);
                this.broadcast(data, client.sessionId);
                break;
            case "playerMapSelect":
                this.broadcast(data, client.sessionId);
                this.startGame();
                break;
        }
    };
    
    this.onClientDisconnect = function(client) {
        var sid = client.sessionId;
        for (var id in this.clients) {
            if (id == sid) {
                delete this.clients[id];
                break;
            }
        }
        this.broadcast({
            type: "playerLeave",
            sessionId: client.sessionId
        });
    };
    
    this.startGame = function() {
        var _self = this;
        setTimeout(function() {
            _self.broadcast({type: "startRace"});
        }, 2000);
    };
    
    this.broadcast = function(msg, exclude) {
        if (typeof msg != "string")
            msg = JSON.stringify(msg);
        var _self = this;
        Object.keys(this.clients).forEach(function(id) {
            if (id !== exclude)
                _self.clients[id].send(msg);
        });
    };
}).call(Server.prototype);

module.exports = Server;
