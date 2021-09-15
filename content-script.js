let selectedNode;
let selectedRect;
let stickyId;
let clientPort = browser.runtime.connect({name: "client_port"});
console.log(clientPort);

function onSelected() {
    let selection = window.getSelection();
    if (selection.toString().trim()) {
        console.log(selection);
        selectedNode = selection.anchorNode;
        selectedRect = selection.getRangeAt(0).getBoundingClientRect();
    }   
}

function createSticky(x, y, content) {
    let d = new Date();
    let idPrefix = d.getTime();
    let contentElement = "";
    let sticky = document.createElement("div");
    let actionBar = document.createElement("div");
    let closeButton = document.createElement("div");
    let stickyNotes = document.createElement("div");

    content.forEach(i => {
        contentElement += `<p>${i}</p>`;
    });

    sticky.setAttribute("id", `ext-sticky-${idPrefix}`);
    stickyNotes.setAttribute("id", `ext-sticky-notes-${idPrefix}`);
    actionBar.setAttribute("id", `ext-action-${idPrefix}`);
    closeButton.setAttribute("id", `ext-action-close-${idPrefix}`);

    closeButton.innerHTML = "x";
    stickyNotes.innerHTML = contentElement;

    sticky.style.position = "fixed";
    sticky.style.left = `${x}px`;
    sticky.style.top = `${y}px`;
    sticky.style.zIndex = "100";
    sticky.style.opacity = "0.8";
    sticky.style.backgroundColor = "#eeee00";
    sticky.style.border = "thin dotted black";

    actionBar.appendChild(closeButton);
    sticky.appendChild(actionBar);
    sticky.appendChild(stickyNotes);

    closeButton.addEventListener("click", evt => {
        sticky.remove();
    });

    return [idPrefix, sticky];
}

clientPort.onMessage.addListener((data, sender) => {
    console.log(data);
    console.log(sender);
    if (selectedNode) {
        console.log(selectedNode);
        console.log(selectedRect);
        let sticky = createSticky(selectedRect.right, selectedRect.bottom, data.result);
        if (stickyId) {
            let lastSticky = document.getElementById(stickyId);
            if (lastSticky) {
                lastSticky.remove();
            }
        }
        stickyId = `ext-sticky-${sticky[0]}`;
        selectedNode.parentNode.appendChild(sticky[1]);
    }
});


document.addEventListener("mouseup",  onSelected);