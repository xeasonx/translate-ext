let selectedNode;
let selectedRect;
let clientPort = browser.runtime.connect({name: "client_port"});
let isHold = false;
let sticky;
let isStickyExists = false;
let stickyPosition = [];
let mousePosition = [];
let dx;
let dy;

// console.log(clientPort);

/**
 * Event listener function for tracking text selection.
 */
function onSelected() {
    let selection = window.getSelection();
    if (selection.toString().trim()) {
        // console.log(selection);
        selectedNode = selection.anchorNode;
        selectedRect = selection.getRangeAt(0).getBoundingClientRect();
    }   
}

/**
 * Create an sticky note element.
 * This element is build up by 4 divs, the outer most is a container, inside the container there are 2 divs,
 * one for holding 'action buttons', it now comes with a div which acts a 'close button'. The other for 
 * holding text contents.
 * @param {*} x left start point of the sticky note element
 * @param {*} y top start point of the sticky note element
 * @param {*} content text content
 * @returns the sticky note element
 */
function createSticky(x, y, content) {
    let d = new Date();
    let idSuffix = d.getTime();
    let sticky = document.createElement("div");
    let actionBar = document.createElement("div");
    let closeButton = document.createElement("div");
    let stickyNotes = document.createElement("div");

    sticky.setAttribute("id", `ext-sticky-${idSuffix}`);
    stickyNotes.setAttribute("id", `ext-sticky-notes-${idSuffix}`);
    actionBar.setAttribute("id", `ext-action-${idSuffix}`);
    closeButton.setAttribute("id", `ext-action-close-${idSuffix}`);

    closeButton.innerHTML = "x";
    stickyNotes.innerHTML = content;

    sticky.style.position = "fixed";
    sticky.style.left = `${x}px`;
    sticky.style.top = `${y}px`;
    sticky.style.zIndex = "100";
    sticky.style.opacity = "0.8";
    sticky.style.backgroundColor = "#eeee00";
    sticky.style.border = "thin dotted black";
    sticky.style.font = "normal normal small arial,sans-serif";
    sticky.style.color = "black";
    sticky.style.textAlign = "left";

    actionBar.style.borderBottom = "thin dotted black";
    closeButton.style.width = "20px";
    closeButton.style.height = "20px";
    closeButton.style.border = "thin dotted black";
    closeButton.style.textAlign = "center";

    actionBar.appendChild(closeButton);
    sticky.appendChild(actionBar);
    sticky.appendChild(stickyNotes);

    closeButton.addEventListener("click", evt => {
        sticky.remove();
        isStickyExists = false;
    });

    closeButton.addEventListener("mouseover", (evt) => {
        closeButton.style.fontWeight = "bold";
    });

    closeButton.addEventListener("mouseleave", (evt) => {
        closeButton.style.fontWeight = "normal";
    });

    actionBar.addEventListener("mouseleave", (evt) => {
        sticky.style.cursor = "default";
    });   

    sticky.addEventListener("mouseover", (evt) => {
        sticky.style.opacity = "1.0";
    });

    sticky.addEventListener("mouseleave", (evt) => {
        sticky.style.opacity = "0.8";
        isHold = false;
        sticky.style.cursor = "default";
    });

    sticky.addEventListener("mousedown", (ev) => {
        mousePosition = [ev.clientX, ev.clientY];
        isHold = true;
        dx = mousePosition[0] - parseInt(sticky.style.left);
        dy = mousePosition[1] - parseInt(sticky.style.top);
        // console.log(dx, dy);
        // console.log(mousePosition);
        // console.log(isHold);
    });
    sticky.addEventListener("mouseup", (ev) => {
        isHold = false;
        sticky.style.cursor = "default";
    });

    sticky.addEventListener("mousemove", (ev) => {
        if (isHold) {
            sticky.style.cursor = "move";
            stickyPosition[0] = ev.clientX - dx;
            stickyPosition[1] = ev.clientY - dy;
            // console.log(stickyPosition);
            sticky.style.left = `${stickyPosition[0]}px`;
            sticky.style.top = `${stickyPosition[1]}px`;
        }
    });

    return sticky;
}


/**
 * After translation result is received by background script, create a sticky not to show the result.
 */
clientPort.onMessage.addListener((data, sender) => {
    // console.log(data);
    // console.log(sender);
    if (selectedNode) {
        // console.log(selectedNode);
        // console.log(selectedRect);
        let contentElement = "";
        data.result.forEach(i => {
            contentElement += `<p>${i}</p>`;
        });
        // console.log(contentElement);        
        if (isStickyExists == false) {
            sticky = createSticky(selectedRect.right, selectedRect.bottom, contentElement);
            selectedNode.parentNode.appendChild(sticky);
            isStickyExists = true;
        } else {
            let tmpIdArr = sticky.id.split("-");
            // console.log(tmpIdArr);
            let stickyContentId = `ext-sticky-notes-${tmpIdArr[tmpIdArr.length - 1]}`;
            // console.log(stickyContentId);
            let stickyContent = document.getElementById(stickyContentId);
            // console.log(stickyContent);
            stickyContent.innerHTML = contentElement;
        }
    }
});

document.addEventListener("mouseup",  onSelected);