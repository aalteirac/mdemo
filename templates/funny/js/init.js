/**
 * Created by aai on 15/04/2015.
 */
var delta = [ 0, 0 ];
var stage = [ window.screenX, window.screenY, window.innerWidth, window.innerHeight ];
getBrowserDimensions();

var isMouseDown = false;

var worldAABB;
var world;
var iterations = 1;
var timeStep = 1 / 25;

var walls = [];
var wall_thickness = 20;
var wallsSetted = false;

var mouseJoint;
var mouse = { x: 0, y: 0 };

var mouseOnClick = [];

var elements = [];
var bodies = [];
var properties = [];

var query, page = 0;

var gravity = { x: 0, y: 0.1 };

init();
setInterval( loop, 10 );

function init() {
    window.onresize=function(){
        //init();
    };
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    document.addEventListener( 'keyup', onDocumentKeyUp, false );

    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    document.addEventListener( 'touchend', onDocumentTouchEnd, false );

    // init box2d

    worldAABB = new b2AABB();
    worldAABB.minVertex.Set( - 200, - 200 );
    worldAABB.maxVertex.Set( window.innerWidth + 200, window.innerHeight + 200 );

    world = new b2World( worldAABB, new b2Vec2( 0, 0 ), true );

    // walls
    setWalls();

    // Get box2d elements

    elements = getElementsByClass("box2d");

    for ( var i = 0; i < elements.length; i ++ ) {

        properties[i] = getElementProperties( elements[i] );

    }

    for ( var i = 0; i < elements.length; i ++ ) {

        var element = elements[ i ];
        element.style.position = 'absolute';
        element.style.left = properties[i][0] + 'px';
        element.style.top = properties[i][1] + 'px';
        element.style.width = properties[i][2] + 'px';
        element.addEventListener( 'mousedown', onElementMouseDown, false );
        element.addEventListener( 'mouseup', onElementMouseUp, false );
        element.addEventListener( 'click', onElementClick, false );

        bodies[i] = createBox( world, properties[i][0] + (properties[i][2] >> 1), properties[i][1] + (properties[i][3] >> 1), properties[i][2] / 2, properties[i][3] / 2, false );

        // Clean position dependencies

        while ( element.offsetParent ) {

            element = element.offsetParent;
            element.style.position = 'static';

        }

    }

}

//

function onDocumentMouseDown( event ) {

    isMouseDown = true;

}

function onDocumentMouseUp( event ) {

    isMouseDown = false;

}

function onDocumentMouseMove( event ) {

    mouse.x = event.clientX;
    mouse.y = event.clientY;

}

function onDocumentKeyUp( event ) {

    if ( event.keyCode == 13 ) search();

}

function onDocumentTouchStart( event ) {

    if ( event.touches.length == 1 ) {

        mouse.x = event.touches[0].pageX;
        mouse.y = event.touches[0].pageY;
        isMouseDown = true;
    }
}

function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouse.x = event.touches[0].pageX;
        mouse.y = event.touches[0].pageY;

    }

}

function onDocumentTouchEnd( event ) {

    if ( event.touches.length == 0 ) {

        isMouseDown = false;
    }

}

//

function onElementMouseDown( event ) {

    event.preventDefault();

    mouseOnClick[0] = event.clientX;
    mouseOnClick[1] = event.clientY;

}

function onElementMouseUp( event ) {

    event.preventDefault();

}

function onElementClick( event ) {

    var range = 5;

    if ( mouseOnClick[0] > event.clientX + range || mouseOnClick[0] < event.clientX - range &&
        mouseOnClick[1] > event.clientY + range || mouseOnClick[1] < event.clientY - range ) {

        event.preventDefault();

    }


}

function loop() {

    if (getBrowserDimensions())
        setWalls();

    delta[0] += (0 - delta[0]) * .5;
    delta[1] += (0 - delta[1]) * .5;

//        world.m_gravity.x = gravity.x * 350 + delta[0];
//        world.m_gravity.y = gravity.y * 350 + delta[1];
    world.m_gravity.x = 0;
    world.m_gravity.y = 10;
    mouseDrag();
    world.Step(timeStep, iterations);

    for ( var i = 0; i < elements.length; i++ ) {

        var body = bodies[i];
        var element = elements[i];

        element.style.left = (body.m_position0.x - (properties[i][2] >> 1)) + 'px';
        element.style.top = (body.m_position0.y - (properties[i][3] >> 1)) + 'px';

        var style = 'rotate(' + (body.m_rotation0 * 57.2957795) + 'deg)';

        element.style.transform = style;
        element.style.WebkitTransform = style + ' translateZ(0)'; // Force HW Acceleration
        element.style.MozTransform = style;
        element.style.OTransform = style;
        element.style.msTransform = style;
    }
}


// .. BOX2D UTILS

function createBox(world, x, y, width, height, fixed, element) {

    var boxSd = new b2BoxDef();

    if ( fixed === undefined ) fixed = true;
    if ( fixed === false  ) boxSd.density = 1.0;

    boxSd.extents.Set(width, height);

    var boxBd = new b2BodyDef();
    boxBd.AddShape(boxSd);
    boxBd.position.Set(x,y);
    boxBd.linearVelocity.Set( Math.random() * 20 - 10, Math.random() * 20 - 10 );
    boxBd.angularVelocity = Math.random() * 0.1 - 0.05;
    //boxBd.linearVelocity.Set( 10, 10 );
    //boxBd.angularVelocity = 10;
    boxBd.userData = {element: element};

    return world.CreateBody(boxBd)
}

function mouseDrag() {

    // mouse press
    if (isMouseDown && !mouseJoint) {

        var body = getBodyAtMouse();

        if (body) {
            var md = new b2MouseJointDef();
            md.body1 = world.m_groundBody;
            md.body2 = body;
            md.target.Set(mouse.x, mouse.y);
            md.maxForce = 30000.0 * body.m_mass;
            md.timeStep = timeStep;
            mouseJoint = world.CreateJoint(md);
            body.WakeUp();
        }
    }

    // mouse release
    if (!isMouseDown) {

        if (mouseJoint) {

            world.DestroyJoint(mouseJoint);
            mouseJoint = null;
        }
    }

    // mouse move
    if (mouseJoint) {

        var p2 = new b2Vec2(mouse.x, mouse.y);
        mouseJoint.SetTarget(p2);
    }
}

function getBodyAtMouse() {

    // Make a small box.
    var mousePVec = new b2Vec2();
    mousePVec.Set(mouse.x, mouse.y);

    var aabb = new b2AABB();
    aabb.minVertex.Set(mouse.x - 1, mouse.y - 1);
    aabb.maxVertex.Set(mouse.x + 1, mouse.y + 1);

    // Query the world for overlapping shapes.
    var k_maxCount = 10;
    var shapes = [];
    var count = world.Query(aabb, shapes, k_maxCount);
    var body = null;

    for ( var i = 0; i < count; i ++ ) {

        if (shapes[i].m_body.IsStatic() == false) {

            if ( shapes[i].TestPoint(mousePVec) ) {

                body = shapes[i].m_body;
                break;
            }
        }
    }

    return body;
}

function setWalls() {

    if (wallsSetted) {

        world.DestroyBody(walls[0]);
        world.DestroyBody(walls[1]);
        world.DestroyBody(walls[2]);
        world.DestroyBody(walls[3]);

        walls[0] = null;
        walls[1] = null;
        walls[2] = null;
        walls[3] = null;
    }

    walls[0] = createBox(world, stage[2] / 2, - wall_thickness, stage[2], wall_thickness);
    walls[1] = createBox(world, stage[2] / 2, stage[3] + wall_thickness, stage[2], wall_thickness);
    walls[2] = createBox(world, - wall_thickness, stage[3] / 2, wall_thickness, stage[3]);
    walls[3] = createBox(world, stage[2] + wall_thickness, stage[3] / 2, wall_thickness, stage[3]);

    wallsSetted = true;

}

// .. UTILS

function getElementsByClass( searchClass ) {

    var classElements = [];
    var els = document.getElementsByTagName('*');
    var elsLen = els.length

    for (i = 0, j = 0; i < elsLen; i++) {

        var classes = els[i].className.split(' ');
        for (k = 0; k < classes.length; k++)
            if ( classes[k] == searchClass )
                classElements[j++] = els[i];
    }

    return classElements;
}

function getElementProperties( element ) {

    var x = 0;
    var y = 0;
    var width = element.offsetWidth;
    var height = element.offsetHeight;

    do {

        x += element.offsetLeft;
        y += element.offsetTop;

    } while ( element = element.offsetParent );

    return [ x, y, width, height ];
}

function getBrowserDimensions() {

    var changed = false;

    if ( stage[0] != window.screenX ) {

        delta[0] = (window.screenX - stage[0]) * 50;
        stage[0] = window.screenX;
        changed = true;
    }

    if ( stage[1] != window.screenY ) {

        delta[1] = (window.screenY - stage[1]) * 50;
        stage[1] = window.screenY;
        changed = true;
    }

    if ( stage[2] != window.innerWidth ) {

        stage[2] = window.innerWidth;
        changed = true;
    }

    if ( stage[3] != window.innerHeight ) {

        stage[3] = window.innerHeight;
        changed = true;
    }
    //console.log(changed);
    return changed;
}
