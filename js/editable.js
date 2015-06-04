var addEvent = (function () {
    if (document.addEventListener) {
        return function (el, type, fn) {
            if (el && el.nodeName || el === window) {
                el.addEventListener(type, fn, false);
            } else if (el && el.length) {
                for (var i = 0; i < el.length; i++) {
                    addEvent(el[i], type, fn);
                }
            }
        };
    } else {
        return function (el, type, fn) {
            if (el && el.nodeName || el === window) {
                el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
            } else if (el && el.length) {
                for (var i = 0; i < el.length; i++) {
                    addEvent(el[i], type, fn);
                }
            }
        };
    }
})();

var editable = document.getElementsByClassName('editable');

addEvent(editable, 'blur', function (e) {
    // lame that we're hooking the blur event
    localStorage.setItem(e.currentTarget.id, this.innerHTML);
    document.designMode = 'off';
});

addEvent(editable, 'mouseleave', function (e) {
    e.currentTarget.setAttribute("contentEditable", "false");
});
addEvent(editable, 'click', function (e) {
    if(sideCollapsed==false)
        e.currentTarget.setAttribute("contentEditable", "true");
});

addEvent(document.getElementById('clear'), 'click', function () {
    localStorage.clear();
    window.location = window.location; // refresh
});
for (var i = 0; i < editable.length; i++) {
    if (localStorage.getItem(editable[i].id))
        editable[i].innerHTML = localStorage.getItem(editable[i].id);
}