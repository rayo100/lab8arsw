var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    //var stompClient = null;
    let connection = null;
    const vertices = 4;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    const addStrokesToCanvas = (x0, y0, x1, y1) => {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }

    const drawPolygon = (poly) => {
        for (let indice = 0; indice < vertices - 1; indice++) {
            let punto1 = poly[indice];
            let punto2 = poly[indice+1];
            addStrokesToCanvas(punto1.x, punto1.y, punto2.x, punto2.y);
        }
        addStrokesToCanvas(poly[0].x, poly[0].y, poly[vertices - 1].x, poly[vertices - 1].y)
    }
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var drawPoints = function () {
        let canvas = document.getElementById("canvas");
        elemLeft = canvas.offsetLeft + canvas.clientLeft,
                elemTop = canvas.offsetTop + canvas.clientTop,
                canvas.addEventListener('click', function (event) {
                    var px = event.pageX - elemLeft;
                    var py = event.pageY - elemTop;
                    var pt = new Point(px, py);
                    stompClient.send(`/app/newpoint.${connection}`, {}, JSON.stringify(pt));
                });
    };


    var connectAndSubscribe = function (draw) {
        connection = draw;
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(`/topic/newpoint.${connection}`, function (eventbody) {
                var object = JSON.parse(eventbody.body);
                console.log(object)
                var point = new Point(object.x, object.y);
                addPointToCanvas(point);
            });
            stompClient.subscribe(`/topic/newpolygon.${connection}`, function (eventbody) {
                var object = JSON.parse(eventbody.body);
                console.log("Polygon: " + object)
                drawPolygon(object);
            });
        });
    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            //websocket connection
            //connectAndSubscribe();
            drawPoints();
        },

        subscribe: function () {
            let draw = document.getElementById("draw").value;
            connectAndSubscribe(draw);
        },

        publishPoint: function (px,py) {
            var pt = new Point(px, py);
            console.info("publishing point at (" + pt.x + ", " + pt.y + ")");
            addPointToCanvas(pt);

            //publicar el evento
            //stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
            stompClient.send(`/app/newpoint.${connection}`, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();