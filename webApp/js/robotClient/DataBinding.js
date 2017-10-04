class DataBinding extends EventEmitter{
	constructor(){
		super();
		this.roomba = null;
		this.datas = new Map();

		this.on("binded", function(){

		})
		this.on("data", function(data){
			if(data.packet.name == "BumpsAndWheelDrops"){
				console.log("update");
			}
			this.datas.set(data.packet.name, data.data);
			this.emit("datas", this.datas);
		});
	}

}