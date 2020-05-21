const fill = document.querySelector(".fill");
const empties = document.querySelectorAll(".empty");

fill.addEventListener('dragstart', dragStart);
fill.addEventListener('dragend', dragEnd);

empties.forEach(empty => {
    empty.addEventListener('dragover', dragOver)
    empty.addEventListener('dragenter', dragEnter)
    empty.addEventListener('dragleave', dragLeave)
    empty.addEventListener('drop', dragDrop)
})

function dragStart() {
    // console.log(this.className)
    this.className += " hold"
    setTimeout(() => {
        this.className = "invisible"
    }, 0)
}

function dragEnd() {
    this.className = "fill"
    console.log("end")
}

function dragOver(e) {
    e.preventDefault();
    console.log("dragOver")
}

function dragEnter(e) {
    e.preventDefault();
    console.log("dragEnter")
    this.className += " hovered";
}

function dragLeave() {
    console.log("dragLeave")
    this.className = "empty";
}

function dragDrop() {
    console.log("dragDrop")
    this.className = "empty";
    this.append(fill)
}