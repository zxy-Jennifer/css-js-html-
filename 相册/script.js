const wrap = document.querySelector('.wrap')
const imgs = document.querySelectorAll('img')
var len = imgs.length
var Deg = 360 / len
imgs.forEach((item, index) => {
    // console.log(item, index)
    item.style.transform = "rotateY(" + Deg * index + "deg) translateZ(350px)"
    // 最前面的最后执行
    item.style.transition = "1s " + (index - 1 - index) * 0.1 + "s"
})

// 鼠标按下事件（按下、移动、抬起）拖拽旋转
var lastX, lastY, nowX, nowY, minX, minY, roX = 0,
    roY = 0
let timer
document.onmousedown = function (ev) {
    clearInterval(timer)
    var ev = ev || window.event
    // 获取鼠标按下去的坐标位置
    lastX = ev.clientX;
    lastY = ev.clientY;
    this.onmousemove = function (ev) {
        var ev = ev || window.event
        // 移动过程中鼠标的坐标位置
        nowX = ev.clientX
        nowY = ev.clientY
        // 计算出鼠标坐标的位置
        minX = (nowX - lastX) * 0.2
        minY = (nowY - lastY) * 0.1
        roX += minX
        roY -= minY
        wrap.style.transform = "rotateX(" + roY + "deg) rotateY(" + roX + "deg)"
        lastY = nowY
        lastX = nowX
    }
    this.onmouseup = function (ev) {
        this.onmousemove = null
        this.onmouseup = null
        // 转动惯性
        timer = setInterval(() => {
            // minX逐渐减小
            minX *= 0.95
            minY *= 0.95
            roX += minX * 0.2
            roY -= minY * 0.1
            wrap.style.transform = "rotateX(" + roY + "deg) rotateY(" + roX + "deg)"
            // 当minX足够小时清除定时器
            if (Math.abs(minX) < 0.1 && Math.abs(minY) < 0.1) {
                clearInterval(timer)
            }
        }, 1000 / 60)
    }
    return false; //阻止默认行为-拖拽
}