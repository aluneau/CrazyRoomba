class Data {
    constructor(packet, data) {
        if(Array.isArray(data)) { data = packet.parse(data); }
        //if(!packet.validate(data)) { throw new Error(`Data is not valid : ${data}, ${packet.getName()}`); }

        if(!packet.validate(data)) { //console.log("paquet invalide"); 
        }
        this._packet = packet;
        this._data = data;
        this._timestamp = Date.now();
    }
    getData() {
        return this._data;
    }
    getPacket() {
        return this._packet;
    }
    getTimestamp() {
        return this._timestamp;
    }
    toString() {
        return `${this.getData()} from packet #${this.getPacket().getId()} (${this.getPacket().getName()}) at time ${new Date(this.getTimestamp())} (${this.getTimestamp()})`;
    }
    toJSON() {
        return {
            data: this._data,
            packet: this._packet.toJSON(),
            timestamp: this._timestamp
        };
    }
};


module.exports = Data;