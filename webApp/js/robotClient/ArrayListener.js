class ArrayListener extends DataBinding{
	constructor(){
		super();

		this.on("datas", function(datas){
			let html = "<table class=\"table table-striped\">";

			for (var [key, value] of datas) {
				html+="<tr><td>" + key + "</td><td>" + value + "</td></tr>"
			}

			html+="</table>"
			$("#table").html(html);
		});
	}

}