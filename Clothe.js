window.addEventListener("load", function(){
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        ResetButton = this.document.getElementById("ResetCanvas"),
        width = canvas.width = 600, //will be resized later
        height = canvas.height = 600; //will be resized later

    var points,
        sticks,
        bounce,
        gravity,
        friction,
        LineNumber,
        ColonneNumber,
        CutRadius = 10,
        stifness = 1.7,
        offset,
        GridWidth,
        GridHeight,
        SquareWidth,
        Clicking = false,
        ClickLocation = {x : 0, y : 0},
        SquareHeight;

    function distance(p0, p1){
        var dx = p1.x - p0.x,
            dy = p1.y - p0.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function InitialiseScene(){
        var canvasDim = 300;
        if (window.innerHeight - 20 > window.innerWidth) {
            canvasDim = window.innerWidth;
        } else {
            canvasDim = window.innerHeight - 20;
        }
        height = canvas.height = width = canvas.width = canvasDim;

        points = [];
        sticks = [];
        bounce = 0.3;
        gravity = 0.3;
        friction = 0.999;
        offset = - width * 0.2;
        GridWidth = width * 0.8;
        GridHeight = height * 0.5;
        LineNumber = 60;
        ColonneNumber = LineNumber * GridWidth/GridHeight;
        SquareWidth = GridWidth/ColonneNumber;
        SquareHeight = GridHeight/LineNumber;

        for (let i = 0; i <= LineNumber; i++) {
            for (let j = 0; j <= ColonneNumber; j++) {
                points.push({
                    x: SquareWidth * j - offset/2,
                    y: SquareHeight * i,
                    oldx: SquareWidth * j - offset/2,
                    oldy: SquareHeight * i,
                    pinned: i==0
                });
                if (i!=0) {
                    sticks.push({
                        p0: points[i*(ColonneNumber+1) + j],
                        p1: points[(i-1)*(ColonneNumber+1) + j],
                        length: distance(points[i*(ColonneNumber+1) + j], points[(i-1)*(ColonneNumber+1) + j])
                    });
                }
                if (j!=0) {
                    sticks.push({
                        p0: points[i*(ColonneNumber+1) + j],
                        p1: points[i*(ColonneNumber+1) + j-1],
                        length: distance(points[i*(ColonneNumber+1) + j], points[i*(ColonneNumber+1) + j-1])
                    });
                }
            }
        }
        console.log("Init complete");
    }

    InitialiseScene();

    update();

    function update(){
        updatePoints();
        for(var i = 0; i < 6; i++){
            updateSticks();
            constainPoints();
        }
        context.clearRect(0,0,width,height);
        renderSticks();
        requestAnimationFrame(update);
    }

    function updatePoints(){
        for(var i = 0; i < points.length; i++){
            var p = points[i];
            if(!p.pinned){
                var vx = (p.x - p.oldx) * friction,
                    vy = (p.y - p.oldy) * friction;

                p.oldx = p.x;
                p.oldy = p.y;
                p.x += vx;
                p.y += vy;
                p.y += gravity;
            }
        }
    }

    function constainPoints(){
        for(var i = 0; i < points.length; i++){
            var p = points[i];
            if(!p.pinned){
                var vx = (p.x - p.oldx) * friction,
                    vy = (p.y - p.oldy) * friction;
                if(p.x > width){
                    p.x = width;
                    p.oldx = p.x + vx * bounce;
                }
                else if(p.x < 0){
                    p.x = 0;
                    p.x = p.x + vx * bounce;
                }
                if(p.y > height){
                    p.y = height;
                    p.oldy = p.y + vy * bounce;
                }
                else if(p.y < 0){
                    p.y = 0;
                    p.y = p.y + vy * bounce;
                }
            }
        }
    }

    function updateSticks(){
        for(var i = 0; i < sticks.length; i++){
            var s = sticks[i],
                dx = s.p1.x - s.p0.x,
                dy = s.p1.y - s.p0.y,
                distance = Math.sqrt(dx * dx + dy * dy),
                difference = stifness * (s.length - distance),
                percent = difference / distance / 2,
                offsetX = dx * percent,
                offsetY = dy * percent;
            
            if(!s.p0.pinned){
                s.p0.x -= offsetX;
                s.p0.y -= offsetY;
            }
            if(!s.p1.pinned){
                s.p1.x += offsetX;
                s.p1.y += offsetY;
            }
        }
    }

    function renderSticks(){
        context.beginPath();
        for (var i = 0; i < sticks.length; i++){
            var s = sticks[i];
            if(!s.hidden){
                context.moveTo(s.p0.x, s.p0.y);
                context.lineTo(s.p1.x, s.p1.y);
            }
        }
        context.stroke();
    }

    function BreakSticks(){
        sticks.forEach(element => {
            if (distance(element.p0,ClickLocation) < CutRadius || distance(element.p1,ClickLocation) < CutRadius) {
                sticks.splice(sticks.indexOf(element), 1);
            }
        });
    }

    function UpdateClickPosition(event){
        if (Clicking) {
            let rect = canvas.getBoundingClientRect();
            let x0 = event.clientX - rect.left;
            let y0 = event.clientY - rect.top;
            ClickLocation = {x : x0, y : y0};
            BreakSticks();
        }
    }

    function EngageClick(){
        Clicking = true;
    }

    function ClickRelease(){
        Clicking = false;
    }

    canvas.onmousemove = UpdateClickPosition;

    canvas.addEventListener("mousedown", function(e){
        EngageClick();
    });

    document.addEventListener('mouseup', function(event) {
        ClickRelease();
    });

    ResetButton.addEventListener("click", InitialiseScene);

});
