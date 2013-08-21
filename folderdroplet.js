var FolderDroplet = function(id, callback, opts) {
	var that = this;
	var opts = opts || {};
	that.id = id;
	that.extension = opts.extension || "eda";
	that.callback = callback;
	that.vsize = opts.vsize || {};
	that.vsize.width = that.vsize.width || 640;
	that.vsize.height = that.vsize.height || 320;
	that.graphs = [];
	that.videoFiles = [];
	
	//<link href="http://vjs.zencdn.net/c/video-js.css" rel="stylesheet">
	//<script src="http://vjs.zencdn.net/c/video.js"></script>
	$(document).append($("<script>").attr("src","http://vjs.zencdn.net/c/video.js"));
	$(document).append($("<link>").attr("href","http://vjs.zencdn.net/c/video-js.css").attr("rel","stylesheet"));
	
	that.handleError = function(f) {
		var bgoriginal = $(".dropzone").css("background-color");
		var borderoriginal = $(".dropzone").css("border-color");
		$(".dropzone").animate({"background-color":"#f2dede", "border-color":"#b94a48"}, 1000, function() {
			$(this).animate({"background-color":bgoriginal, "border-color":borderoriginal}, 1000);
		
		});
		
	
	};
	that.handleEDA = function(file) {
		console.log("Loading file...");
		var reader = new FileReader();
		
		reader.onload = function (event) {
		  console.log(event.target);
		  var edaDivId = "EDA" + ($("div.edaGraph").length + 1);
		  $("#" + that.id).append($("<div>").attr("id",edaDivId).addClass("edaGraph"));
		  var edaFile = new qLogFile();
		  edaFile.progress = "progress-indicator-" + parseInt(Math.random()*10000, 10) ;	
		  var loader = new Loader("#" + edaDivId, edaFile.progress);
		  that.fileContents = event.target.result;
		  edaFile.loadText(event.target.result, 
		  function() {
		  	var edaFile = this;
		  	console.log("Preparing to graph");
		  	var grapher = new Grapher( document.getElementById(edaDivId) );
		  	$("#"+edaDivId).find(".loader").remove();
		  	grapher.plot(edaFile);
		  	
		  	that.graphs.push(grapher);
		  	that.callback(that.graphs);
		  	
		  	
		  
		  }
		  , file.name);
		  return false;
		};
		
		reader.readAsBinaryString(file);
		
	
	};
	
			
	that.setupHandlers = function(vplayer) {
		console.log("Video Width: " + $("video").width());
		$("video").attr("height", 320);
		$("video").attr("width", "auto");
		for (var i = 0; i < that.videoFiles.length; i++) {
			var player = that.videoFiles[i];
			$("#" + player.id).css("margin-left", ($("#" + that.id).width() - $("#" + player.id).width())/2);
			
			player.addEvent("timeupdate", function(e) {
	
				if($("#" + this.id).attr("data-start-time")){
					var videoStart = new Date($("#" + this.id).attr("data-start-time"));
				}
				else {
	
					var startTime = $("#" + this.id).find("video").attr("filename");
					//01-17-2013 09:03:45.mp4
					var date = startTime.split(" ")[0].split("-").map(parseInt);
					var time = startTime.split(" ")[1].split(".m")[0].split("_").map(parseInt);
					console.log(date + " " + time);
					var videoStart = new Date(date[0], date[1]-1, date[2], time[0], time[1], time[2] );
					$("#" + this.id).attr("data-start-time", videoStart);
				}
	
				console.log("Current Time: " + this.currentTime());
				var delta = new TimeDelta(this.currentTime()*1000);
				for (var n = 0; n < that.graphs.length; n++) {
					var g = that.graphs[n];
					try {
						g.updateCursor(videoStart.add(delta));
					}
					catch (error) {
						console.log(error);
					}
					
				}
	
			});
			
		}
		if (that.bookmark) {
			var t = that.bookmark.split("-").map(parseInt);
			var time = t[0]*60*60 + t[1]*60 + t[0];
			for (var i = 0; i < that.videoFiles.length; i++) {
				that.videoFiles[i].currentTime(time);
				console.log("Current time for video: " + that.videoFiles[i].id + " is " + that.videoFiles[i].currentTime());
				that.videoFiles[i].play();
				that.videoFiles[i].pause();
				setTimeout(function() {
				that.videoFiles[i].play();
				that.videoFiles[i].pause();
				
				
				}, 400);
			}
		}
		
		
	
	};
		
	
	that.handleVideo = function(file) {
	
		
		console.log("Got video file: " + file.name);
		var metadata = file;
		var vid = window.webkitURL.createObjectURL(file);
		
		var name = metadata.name;
		var type = metadata.type;
		var vidid = "video" + parseInt(Math.random()*1000+"",10);
		//<video id="video" controls="" preload="auto" name="media"><source src="data/1/clip-2013-01-17 09;03;57.m4v" ></video>					
		$("#" +that.id).prepend(
			$("<video>")
				.attr("controls","")
				.attr("class","video-js vjs-default-skin video")
				.attr("filename",name )
				.attr("preload","auto")
				.attr("id",vidid)
				.attr("name","media")
				.attr("src",vid)
				.attr("type",type)
		);
		$("#" +that.id).css("width","auto");
		$("#" +that.id).css("height","auto");
		_V_(vidid).ready(function(){
			var player = this;
			console.log("Video loaded!");
			player.size(that.vsize.width,that.vsize.height);
			
//			$("#"+vidid).append("<div><input id='timepicker' type='text' class='input-small'><span class='add-on'><i class='glyphicon glyphicon-time'></i></span></div>");		
			that.videoFiles.push(player);
		});
	
	
	
	};
	
	that.dropzone = new Dropzone(that.id,
		function (file, isDone) {
			  if(isDone){
			  	setTimeout(that.setupHandlers, 200);
			  	that.callback(that.graphs);
			  	return;
			  }
			  console.log(file);
			  var extension = file.name.split(".")[file.name.split(".").length-1].toLowerCase();
			  switch (extension) {
			  	case "eda":
			  		that.handleEDA(file);
			  		break;
			  	case "reda":
			  		that.handleEDA(file);
			  		break;
			  	case "avi":
			  		that.handleVideo(file);
			  		break;
			  	case "mp4":
			  		that.handleVideo(file);
			  		break;
				case "bookmark":
					that.bookmark = file.name.split(".")[0];
					break;

			  	default:
			  		that.handleError(file);
			  }
			  
			  
			  return false;
		}, {"label":"Drop folder here to view", "allowFolders":true});
	


}

var Loader = function(id, progressId) {
	
	$(id).append(
		$("<div>").addClass("loader")
			.append($("<h2>").text("Loading..."))
			.append($("<div>").attr("id", progressId).attr("class","progress progress-striped active")
				.append($("<div>").addClass("progress-bar").attr("role","progressbar").attr("style", "width: 0%;"))
			)
	);
	//  <div class="progress-bar"  role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 45%">
	
	var offset = ($(id).height() - $(id).find(".loader").height()  - $(id).find("h2").height())/2.0;
	$(id).find(".loader").css("margin-top",offset);
};