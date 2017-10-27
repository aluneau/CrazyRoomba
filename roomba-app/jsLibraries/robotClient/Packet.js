
class Packet {
    constructor(id, name, size, range, unit) {
        this._id = id;
        this._name = name;
        this._dataSize = size;
        this._dataRange = range;
        this._dataUnit = unit;
    }
    getId() {
        return this._id;
    }
    getName() {
        return this._name;
    }
    getDataSize() {
        return this._dataSize;
    }
    getDataRange() {
        return this._dataRange;
    }
    getDataUnit() {
        return this._dataUnit;
    }
    parse(...bytes) {
        var data = 0;
        bytes.forEach((byte, index, array) => {
            data |= (byte << array.length - index - 1);
        });
        return data;
    }
    validate(data) {
        if(Array.isArray(data)) { data = this.parse(data); }
        return data >= this._dataRange[0] && data <= this._dataRange[1];
    }
    toJSON() {
        return {
            id: this._id,
            name: this._name
        };
    }
};