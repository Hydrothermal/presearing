var WIDTH = 1498,
    HEIGHT = 1122,
    ctx;

var mx, my, locked;

function shade(color, ratio) {   
    var f=parseInt(color.slice(1),16),t=ratio<0?0:255,p=ratio<0?ratio*-1:ratio,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function generateQuest(q) {
    var obj = q.objectives,
        giv = $("<div class='circle giv' id='g" + q.id + "' hover='" + q.name.replace(/'/g, "&#39;") + "'></div>");

    if(q.reverse) {
        giv.addClass("reverse");
    }

    giv.css({
        left: q.x - 7,
        top: q.y - 7,
        backgroundColor: q.color,
        border: "2px solid " + shade(q.color, -0.7)
    }).appendTo("body");

    // visible quest IDs
    // $("<div class='number'>" + q.id + "</div>").css("color", q.color).appendTo(giv);

    for(var i = 0; i < obj.length; i++) {
        $("<div class='circle obj o" + q.id + "'></div>").css({
            left: obj[i][0] - 4,
            top: obj[i][1] - 4,
            backgroundColor: q.color
        }).appendTo("body");
    }
}

$(function() {
    var hovertag = $("<div id='hovertag' class='tag'><div class='lip lip1'></div><div class='lip lip2'></div><div class='content'></div></div>").appendTo("body"),
        canvas = $("#canvas")[0];

    ctx = canvas.getContext("2d");

    for(var i = 0; i < quests.length; i++) {
        generateQuest(quests[i]);
    }
    
    $(".giv:not(#follow)").hover(function() {
        var id = this.id.substr(1),
            objectives = $(".o" + id),
            giver = $(this).offset();
        
        $("body, #screen").toggleClass("show");
        objectives.toggleClass("show");
        ctx.strokeStyle = shade(quests[id].color, 0.25);

        objectives.each(function() {
            var offset = $(this).offset();

            ctx.beginPath();
            ctx.moveTo(giver.left + 7, giver.top + 7);
            ctx.lineTo(offset.left + 5, offset.top + 5);
            ctx.stroke();
        });
    });

    $(document)
        .on("mouseenter", "[hover]", function() {
            var $this = $(this).addClass("hover"),
                text = "<b>" + $this.attr("hover") + "</b>",
                offset = $this.offset(),
                timeout = hovertag.css("opacity") * 100;

            if($this.hasClass("clicked")) {
                return;
            }

            setTimeout(function() {
                // Check if the circle is still hovered in case mouse left before the timeout started
                if($this.hasClass("hover")) {
                    hovertag.find(".content").html(text);
                    hovertag.attr("class", "tag show").css({
                        top: "initial",
                        bottom: $(window).innerHeight() - offset.top + 8,
                        left: offset.left + ($this.outerWidth() / 2) - (hovertag.outerWidth() / 2)
                    });

                    if($this.hasClass("reverse")) {
                       hovertag.addClass("reverse").css({
                            bottom: "initial",
                            top: offset.top + $this.height() + 2
                        });
                    }
                }
            }, timeout);
        })
        .on("mouseleave", "[hover]", function() {
            hovertag.removeClass("show");
            $(this).removeClass("hover");
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
        })
        .on("click", ".giv", function() {
            $(this).addClass("clicked");
        })

        // Testing
        .on("mousemove", "canvas, .giv", function(e) {
            var x = mx = e.pageX - 10;
            var y = my = e.pageY - 10;

            $("#follow").css({
                left: mx,
                top: my
            });

            if(locked) {
                x = locked[0]; y = locked[1];
            }

            $("#coords").html(`x: ${x}, y: ${y},<br><br>`);

            var objs = $("#xxx .obj:not(#follow)");

            if(objs.length > 0) {
                $("#coords").append(`[${objs.map(function() {
                    var o = $(this).offset();
                    return `[${o.left}, ${o.top}]`;
                }).toArray().join(", ")}]`);
            }
        })
        .on("click", "canvas", function() {
            $("#follow").clone().removeAttr("id").appendTo("#xxx");
            if($("#follow").hasClass("giv")) {
                locked = [mx, my];
                $("#follow").removeClass("giv").addClass("obj");
            }
        });

    if(document.URL.indexOf("?test") === -1) {
        $("#coords, #follow").hide();
    }
});