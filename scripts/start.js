start = document.querySelector('.start');
all = document.querySelector('.all')


let open = () => {
    all.hidden = true
};

let close = () => {
    all.hidden = false
    start.hidden = true
};

window.onload = open;
start.onclick = close;