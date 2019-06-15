import "bootstrap/dist/css/bootstrap.min.css";

window.onload = function () {
	console.log("hello  to1");

	let list = document.getElementById("zoneList");

	let coolZone = {
		name: "Cool Zone",
		nodesNumber: 12,
		lastHeight: 6546,
		binaryLink: "#"
	};
	list.innerHTML += zoneElement("cool zone", coolZone, true);

	let iris = {
		name: "Iris",
		nodesNumber: 57,
		lastHeight: 12567,
		binaryLink: "#"
	};
	list.innerHTML += zoneElement("iris", iris, true);



	let nameService = {
		name: "Name Service",
		nodesNumber: 4,
		lastHeight: 2566,
		binaryLink: "#"
	};
	list.innerHTML += zoneElement("name service", nameService, false);
};

/*
<div class="row border border-dark">
                    Iris, 50 nodes, last height 12023
                    <a href="#">Binary link</a>

                    <div class="col-12">
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">Height: 2543</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: 100%; height: 100px;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                <div class="row">
                    <div class="progress">
                        <div class="progress-bar progress-error" role="progressbar" style="width: 100%; height: 100px;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
 */

function zoneElement(id, info, statusOk) {
	let barStatus;
	if (statusOk) {
		barStatus = "progress-bar"
	} else {
		barStatus = "progress-bar progress-error"
	}
	console.log("hi " + id);
	return `<div class="row border border-dark" id="${id}">
                    <div class="row"><div class="col-12">${info.name}, ${info.nodesNumber} nodes, ${info.lastHeight}</div></div>
                    <div class="row"><div class="col-12"><a href="${info.binaryLink}">Binary link</a></div></div>                   
                    <div class="col-12">
                        <div class="progress">
                            <div class="${barStatus}" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">Height: 2543</div>
                        </div>
                    </div>
                </div>`
}

let socket = new WebSocket("ws://ip:port");

socket.onopen = function(e) {
	console.log("Waa   ebsocket was opened: " + JSON.stringify(e));

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
