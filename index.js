import "bootstrap/dist/css/bootstrap.min.css";

let state = {};

window.onload = function () {
	let list = document.getElementById("zoneList");

	let coolZone = {
		name: "Cool Zone",
		nodesNumber: 12,
		lastHeight: 49771,
		binaryLink: "#"
	};
	let coolStatus = {
		status: "in-progress",
		height: 3545
	};
	appendNewZone("cool-zone", coolZone, coolStatus);

	let iris = {
		name: "Iris",
		nodesNumber: 57,
		lastHeight: 12567,
		binaryLink: "#"
	};
	let irisStatus = {
		status: "success"
	};
	appendNewZone("iris", iris, irisStatus);

	let nameService = {
		name: "Name Service",
		nodesNumber: 4,
		lastHeight: 2566,
		binaryLink: "#"
	};
	let nameStatus = {
		status: "error"
	};
	appendNewZone("name service", nameService, nameStatus);

	let buttonEl = document.getElementById("start-check");
	buttonEl.addEventListener("click", function() {
        startCheckEvent()
    });
};

function startCheckEvent() {
	let nodeIpEl = document.getElementById("node-ip");
	let binaryUrlEl = document.getElementById("binary-url");

    let someInfo = {
        name: nodeIpEl.value,
        nodesNumber: 34,
        lastHeight: 13,
        binaryLink: "#"
    };

    startCheck(someInfo.name, someInfo);
}

function appendNewZone(id, info, status) {
    state[id] = {
        info: info,
        status: status
    };
	let list = document.getElementById("zoneList");
	if (!status) {
        status = {
            status: "in-progress",
            height: 0
        };
    }
	let zoneInfo = zoneElement(id, info, status);
	list.innerHTML = zoneInfo + list.innerHTML;
    if (status.status === "error") {
        setError(id)
    }
}

function setHeightAndWidth(el, currentHeight, lastHeight) {
	let percent = currentHeight / lastHeight * 100;
	console.log("hey = " + percent);
	el.style.width = `${percent}%`;
	el.innerHTML = `Height: ${currentHeight}`;
}

function changeHeight(el, currentHeight) {
	el.innerHTML = `Height: ${currentHeight}`;
}

function getInfo(id) {
    let el = document.getElementById(id);
    return el.getElementsByClassName("bg-white")[0];
}

function showError(id, btn) {
    let infoDiv = getInfo(id);
    infoDiv.innerHTML = "some error about";
    btn.innerHTML = "Hide Error";
}

function hideError(id, btn) {
    let infoDiv = getInfo(id);
    infoDiv.innerHTML = "";
    btn.innerHTML = "Show Error";
}

function errorAction(btn, id) {
    showError(id, btn);
}

function unerrorAction(btn, id) {
    hideError(id, btn);
}

function genErrorButton(id) {
    let newBtn = document.createElement("button");
    newBtn.type = "button";
    newBtn.id = id + "-btn";
    newBtn.style.width = "60%";
    newBtn.classList.add("btn", "btn-block", "btn-danger");
    newBtn.innerHTML = "Get Error Info";
    return newBtn;
}

function setError(id) {
    let el = getProgressBar(id);
	console.log("ERROR!!!!!!!!!!! ");
	el.classList.add("progress-error");
	let btn = genErrorButton(id);
	state[id].swap = false;
	state[id].errorButton = btn;
	state[id].errorFunc = function(e) {
        console.log("error button clicked = " + id);
        if (state[id].swap) {
            unerrorAction(btn, id);
            state[id].swap = false;
        } else {
            errorAction(btn, id);
            state[id].swap = true;
        }
    };
    el.parentElement.appendChild(btn);
    // to avoid `onclick` erasure for some reasons
    Object.keys(state).forEach(function(key) {
        if (state[key].errorButton) {
            document.getElementById(key).onclick = state[key].errorFunc
        }
    });
}

function zoneElement(id, info, status) {
	let barStatus;
	let percent = "100";
	let currentHeight = info.lastHeight;
	if (status.status === "success") {
		barStatus = "progress-bar"
	} else if (status.status === "error") {
		barStatus = "progress-bar progress-error"
	} else if (status.status === "in-progress") {
		barStatus = "progress-bar";
		currentHeight = status.height;
		percent = currentHeight / info.lastHeight * 100;
		console.log("last height: " + info.lastHeight);
		console.log("cur height: " + currentHeight);
		console.log("percent: " + percent);
	}
	console.log("hi " + id);

    return `<div class="row border border-dark" id="${id}">
                    <div class="row"><div class="col-12">${info.name}, ${info.nodesNumber} nodes, ${info.lastHeight}</div></div>
                    <div class="row"><div class="col-12"><a href="${info.binaryLink}">Binary link</a></div></div>                   
                    <div class="col-12">
                        <div class="progress">
                            <div class="${barStatus}" role="progressbar" style="width: ${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">Height: ${currentHeight}</div>                        
                        </div>
                        <div class="bg-white"></div>
                    </div>
                </div>`;
}

function getProgressBar(id) {
    return document.getElementById(id).getElementsByClassName("progress-bar")[0];
}

function startCheck(zoneId, info) {

    if (state[zoneId]) {
        return;
    }

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "http://localhost:8090/create/" + zoneId, false ); // false for synchronous request
	xmlHttp.send( null );

	let socket = new WebSocket("ws://127.0.0.1:8090/websocket/start/file/" + zoneId);

	socket.onopen = function(e) {

        state[zoneId] = {
            info: info
        };
		appendNewZone(zoneId, info);
		console.log("Websocket was opened: " + JSON.stringify(e));
	};

	let k = 0;

	socket.onmessage = function(event) {
		let st = state[zoneId];
		let data = JSON.parse(event.data);
		let el = getProgressBar(zoneId);
		k++;
		if (data.height) {
			if (st.info.lastHeight < 1000 || k % 100 === 0) {
				setHeightAndWidth(el, data.height, st.info.lastHeight);
			} else {
				changeHeight(el, data.height)
			}
		} else {
			setError(zoneId);
			socket.close()
		}
	};

	socket.onclose = function(event) {
		console.log("Websocket was closed. Cause: " + JSON.stringify(event))
	};

	socket.onerror = function(error) {
		console.log("Error: " + JSON.stringify(error))
	};
}
