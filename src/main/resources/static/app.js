var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var drawPoints = function () {
        let elements = [];
        let canvas = document.getElementById("canvas");
        elemLeft = canvas.offsetLeft + canvas.clientLeft,
        elemTop = canvas.offsetTop + canvas.clientTop,
        canvas.addEventListener('click', function(event) {
                  var px = event.pageX - elemLeft;
                  var py = event.pageY - elemTop;

                  elements.forEach(function(element) {
                            if (y > element.top && y < element.top + element.height
                                      && x > element.left && x < element.left + element.width) {
                                      alert('clicked an element');
                            }
                  });

                  var pt=new Point(px,py);
                  stompClient.send("/topic/newpoint", {}, JSON.stringify(pt)); ;
        });
  };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                //alert(eventbody.body);
                let point = JSON.parse(eventbody.body);
                var pt=new Point(point.x, point.y);
                addPointToCanvas(pt);
            });
        });
    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(x,y){
            var pt = new Point(x, y);
            console.info("publishing point at ("+ pt.x + ", " + pt.y + ")");

            //publicar el evento
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
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