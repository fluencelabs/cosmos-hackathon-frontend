import "bootstrap/dist/css/bootstrap.min.css";

let state = {};

let url = "http://salmon.fluence.one:8080/";
let wsUrl = "ws://salmon.fluence.one:8080/";

window.onload = function () {
    getApps();
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
	// appendNewZone("cool-zone", coolZone, coolStatus);

	let iris = {
		name: "Iris",
		nodesNumber: 57,
		lastHeight: 12567,
		binaryLink: "#"
	};
	let irisStatus = {
		status: "success"
	};
	// appendNewZone("iris", iris, irisStatus);

	let badZone = {
		name: "Bad Zone",
		nodesNumber: 4,
		lastHeight: 2566,
		binaryLink: "#"
	};
	let nameStatus = {
		status: "error"
	};
	let bzId = "bad-zone";
    state[bzId] = {};
	state[bzId].errorInfo = JSON.parse(`{
      "height": "10",
      "txs": null,
      "signatures": [
        {
          "validator_address": "7869301611744D2F6A5578EB001DB18BCC0AC705",
          "signature": "ruuvN8mPiKXniLc0JkblK4ol1oUHx3RuLDykik/DN8aiWXnWzPOPiLZrOLE0XbranEJpdErGalZnzShblUixAw=="
        }
      ]
    }`);

	// appendNewZone(bzId, badZone, nameStatus);

	let buttonEl = document.getElementById("start-check");
	buttonEl.addEventListener("click", function() {
        startCheckEvent()
    });

	document.getElementById("name-service-hlp").onclick = function() {
        document.getElementById("node-ip").value = "207.154.210.117";
        document.getElementById("node-port").value = "26657";
        document.getElementById("binary-url").value = "QmQ69JoPDaKFpPSbWvvUGRGG5E83u6nTP2hRegmCoa6aW5";
        document.getElementById("node-name").value = "nameservice";
    };

    document.getElementById("commercio-hlp").onclick = function() {
        document.getElementById("node-ip").value = "188.166.71.251 ";
        document.getElementById("node-port").value = "26657";
        document.getElementById("binary-url").value = "QmepV645qHM9XR97KiK7Bvd2jjK3MiKTGbq8cYm7izRyQK";
        document.getElementById("node-name").value = "commercionetwork";
    };
};

function startCheckEvent() {
	let nodeIp = document.getElementById("node-ip").value;
    let port = document.getElementById("node-port").value;
    let binaryUrl = document.getElementById("binary-url").value;
	let name = document.getElementById("node-name").value;

	let params = {
	    nodeIp: nodeIp,
        port: port,
        binaryUrl: binaryUrl,
        name: name
    };

	let app = state.apps.find((r) => {
	    return r.name === name
    });

    let someInfo;
	if (app) {
        someInfo = {
            name: name,
            nodesNumber: 13,
            lastHeight: app.consensusHeight,
            binaryLink: app.binaryHash
        };
    } else {
	    // mock
        someInfo = {
            name: name,
            nodesNumber: 34,
            lastHeight: 48,
            binaryLink: "#"
        };
    }


    startCheck(params, someInfo.name, someInfo);
}

function appendNewZone(id, info, status) {
    if (state[id]) {
        state[id].info = info;
        state[id].status = status;
    } else {
        state[id] = {
            info: info,
            status: status
        };
    }
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
        setError(id, status.height)
    }
}

function setHeightAndWidth(el, currentHeight, lastHeight) {
	let percent = currentHeight / lastHeight * 100;
	el.style.width = `${percent}%`;
	el.innerHTML = `Height: ${currentHeight}`;
}

function changeHeight(el, currentHeight) {
	el.innerHTML = `Height: ${currentHeight}`;
}

function getInfo(id) {
    let el = document.getElementById(id);
    return el.getElementsByClassName("error-info")[0];
}

function showError(id, btn) {
    let infoDiv = getInfo(id);
    let jsonInfo;
    console.log("ID === " + state[id].errorInfo);
    if (state[id].errorInfo) {
        jsonInfo = state[id].errorInfo;
    } else {
        let block = state[id].block;
        let signatures = block.last_commit.precommits.map((p) => {
            return {
                validator_address: p.validator_address,
                signature: p.signature
            }
        });
        jsonInfo = {
            height: block.header.height,
            txs: block.data.txs,
            signatures: signatures
        };
    }

    infoDiv.innerHTML = `<pre>${JSON.stringify(jsonInfo, null, 2)}</pre>`;
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
    newBtn.style.width = "20%";
    newBtn.classList.add("btn", "btn-block", "btn-danger");
    newBtn.innerHTML = "Get Error Info";
    return newBtn;
}

function setError(id, erroredHeight) {
    let el = getProgressBar(id);
	console.log("ERROR!!!!!!!!!!! " + erroredHeight);
	getBlock(id, erroredHeight).then((resp) => {
        return resp.text()
    }).then((r) => {
        console.log(JSON.parse(r));
        state[id].block = JSON.parse(r).result.block;
    });
	el.classList.add("progress-error");

	let claimBtn = document.getElementById(id).getElementsByClassName("claim-btn")[0];
	claimBtn.style.display = "block";

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
	}

	let valNumber = 4;
	if (id === "nameservice") {
	    valNumber = 1;
    }

    return `<div class="row border border-dark p-2" id="${id}">
                    <div class="col-9 list-info">
                        <p>Name: ${info.name}</p><p>Validator Number: ${valNumber}</p><p>Consensus Height: ${info.lastHeight}</p><p>Binary in IPFS: ${info.binaryLink}</p>
                    </div>
                    <div class="text-right col-3"><button type="button" class="btn btn-info btn-block claim-btn pull-right" style="display: none;">Send Fraud Proof</button></div>
                    <div class="col-12">
                    
                        <div class="progress">
                            <div class="${barStatus}" role="progressbar" style="width: ${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">Height: ${currentHeight}</div>                        
                        </div>
                        <div class="bg-white error-info"></div>
                    </div>
                </div>`;
}

function getProgressBar(id) {
    return document.getElementById(id).getElementsByClassName("progress-bar")[0];
}

function startCheck(params, zoneId, info) {

    if (state[zoneId]) {
        return;
    }

	createCheck(params).then((sa) => {
        let socket = new WebSocket(wsUrl + "websocket/" + params.name);

        socket.onopen = function(e) {

            console.log(e);
            state[zoneId] = {
                info: info
            };
            appendNewZone(zoneId, info);
        };

        let k = 0;

        socket.onmessage = function(event) {
            let st = state[zoneId];
            let data = JSON.parse(event.data);
            if (data.height) {
                state[zoneId].currentHeight = data.height
            }
            let el = getProgressBar(zoneId);
            k++;
            if (data.correct) {
                if (st.info.lastHeight < 1000 || k % 100 === 0) {
                    setHeightAndWidth(el, data.height, st.info.lastHeight);
                } else {
                    changeHeight(el, data.height)
                }
            } else {
                setHeightAndWidth(el, st.info.lastHeight, st.info.lastHeight);
                changeHeight(el, data.height - 1);
                let erroredHeight = state[zoneId].currentHeight;
                setError(zoneId, erroredHeight - 1);
                socket.close()
            }
        };

        socket.onclose = function(event) {
            console.log("Websocket was closed. Cause: " + JSON.stringify(event))
        };

        socket.onerror = function(error) {
            console.log("Error: " + JSON.stringify(error))
        };
    });
}

async function getApps() {
    fetch(`${url}apps`).then((r) => {
        return r.text()
    }).then((r) => {
        state.apps = JSON.parse(r)
    })
}

async function getBlock(id, height) {
    return fetch(`${url}block/${id}/${height}`)
}

async function createCheck(params) {
    let createUrl = `${url}create/${params.name}/${params.nodeIp}/${params.port}/${params.binaryUrl}`;
    fetch(createUrl);
    return Promise.resolve()
}
