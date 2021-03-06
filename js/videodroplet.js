var VideoDroplet = function(id, callback, opts) {
	var that = this;
	var opts = opts || {};
	that.id = id;
	that.extension = opts.extension || false;
	that.callback = callback;
	that.vsize = opts.vsize || {};
	that.vsize.width = that.vsize.width || 720;
	that.vsize.height = that.vsize.height || that.vsize.width*(9./16.);
	
	
	
	that.insertVideo = function(vid, metadata) {
		var name = metadata.name;
		var type = metadata.type;
		//<video id="video" controls="" preload="auto" name="media"><source src="data/1/clip-2013-01-17 09;03;57.m4v" ></video>					
		$("#" +that.id).append(
			$("<video>")
				.attr("controls","")
				.attr("class","video-js vjs-default-skin")
				.attr("filename",name )
				.attr("preload","auto")
				.attr("id","video")
				.attr("name","media")
				.attr("src",vid)
				.attr("type",type)
		);
		$("#" +that.id).css("width","auto");
		$("#" +that.id).css("height","auto");
		_V_("video").ready(function(){
			var player = this;
			player.size(that.vsize.width,that.vsize.height);
			that.callback(player);
		});
	};
	
	that.dropzone = new Dropzone(that.id,
		function (file) {
			 var reader = new FileReader();
			  that.file = file;
			  
			  if(file.name.endsWith("." + that.extension) || (that.extension == false)){
			  	that.insertVideo(window.webkitURL.createObjectURL(file), file);
			  	
		      }
		      else {
		      	var bgoriginal = $("#"+that.id).find(".dropzone").css("background-color");
		      	var borderoriginal = $("#"+that.id).find(".dropzone").css("border-color");
		      	$("#"+that.id).find(".dropzone").animate({"background-color":"#f2dede", "border-color":"#b94a48"}, 1000, function() {
		      		$(this).animate({"background-color":bgoriginal, "border-color":borderoriginal}, 1000);
		      	
		      	});
		      }
			  return false;
		}, {"label":"Drop video file here to view"});
	


}