function makeEdit() {
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
                    el.attachEvent('on' + type, function () {
                        return fn.call(el, window.event);
                    });
                } else if (el && el.length) {
                    for (var i = 0; i < el.length; i++) {
                        addEvent(el[i], type, fn);
                    }
                }
            };
        }
    })();

    var editable = document.getElementsByClassName('editable');
    for (i = 0; i < editable.length; i++) {
        if($(editable[i]).attr('setEdit')){}else {
            addEvent(editable[i], 'blur', function (e) {
                // lame that we're hooking the blur event
                localStorage.setItem(e.currentTarget.id, this.innerHTML);
                document.designMode = 'off';
            });


            addEvent(editable[i], 'contextmenu', function (e) {
                e.preventDefault();
                if (e.currentTarget.getAttribute("contentEditable") == "true") {
                    $(e.currentTarget).css('color', '');
                    e.currentTarget.setAttribute("contentEditable", "false");
                    document.selection ? document.selection.empty()
                        : window.getSelection().removeAllRanges()
                } else {

                    e.preventDefault();
                    $(e.currentTarget).css('color', "rgb(252, 12, 12)" + "!important");
                    e.currentTarget.setAttribute("contentEditable", "true");
                    selectText(e.currentTarget);
                }
            });
            $(editable[i]).attr('setEdit','yep');
        }

    }
    for (var i = 0; i < editable.length; i++) {
        if (localStorage.getItem(editable[i].id))
            editable[i].innerHTML = localStorage.getItem(editable[i].id);
    }

    function selectText(element) {
        var doc = document;
        var text = element;

        if (doc.body.createTextRange) { // ms
            var range = doc.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) { // moz, opera, webkit
            var selection = window.getSelection();
            var range = doc.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}
makeEdit();