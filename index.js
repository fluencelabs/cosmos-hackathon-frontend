import "bootstrap/dist/css/bootstrap.min.css";

window.onload = function () {
	console.log("hello to1")
};

let socket = new WebSocket("ws://ip:port");

socket.onopen = function(e) {
	console.log("Waaaa ebsocket was opened: " + JSON.stringify(e));

};

socket.onmessage = function(event) {
	console.log("Message was received: " + JSON.stringify(event))
};

socket.onclose = function(event) {
	console.log("Websocket was closed. Cause: " + JSON.stringify(event))
};

socket.onerror = function(error) {
	console.log("Error: " + JSON.stringify(error))
};
