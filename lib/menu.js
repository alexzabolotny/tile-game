/**
 * This file is a part of Tile game project.
 *
 * @author Oleksandr Zabolotnyi - http://www.zabolotny.com
 * @license LGPL - http://www.gnu.org/licenses/lgpl.html
 * @url http://www.zabolotny.com/project/tile
 */

function MainMenuState() {
    this.setup = function() {
        jaws.on_keyup(["space", "enter", "left_mouse_button"], function() {
            jaws.switchGameState(TileGameState);
        });
    };

    this.draw = function() {
        jaws.context.fillStyle = "Black";
        jaws.context.fillRect(0, 0, jaws.width, jaws.height);
        jaws.context.font = "50pt Tahoma";
        jaws.context.lineWidth = 10;
        jaws.context.fillStyle = "White";
        jaws.context.strokeStyle = "rgba(200, 200, 200, 0.0)";
        var text = "Start";
        var m = jaws.context.measureText(text);
        var left = jaws.width / 2 - m.width / 2;
        var top = jaws.height / 2;
        jaws.context.fillText(text, left, top);

        jaws.context.font = '10pt Tahoma';
        jaws.context.fillStyle = "#999";
        var text = "By Oleksandr Zabolotnyi";
        var m = jaws.context.measureText(text);
        jaws.context.fillText(text, jaws.width / 2 - m.width / 2, jaws.height - jaws.height / 10);
    }
}

function PauseMenuState() {
    var menu = [{text: "Resume"}, {text: "Exit"}];
    var index = 0;
    var savedRuntime;

    this.update = function() {
        for (var i in menu) {
            if (menu[i].rect && menu[i].rect.collidePoint(jaws.mouse_x, jaws.mouse_y)) {
                index = i;
            }
        }
    }

    this.setup = function(runtimeSnapshot) {
        savedRuntime = runtimeSnapshot;
        index = 0;
        jaws.on_keyup(["down", "s"], function(){index++; if (index >= menu.length){index = menu.length - 1;}});
        jaws.on_keyup(["up", "w"], function(){index--; if (index < 0){index = 0;}});
        jaws.on_keyup(["space", "enter"], function(){
            pushMenuButton(index);
        });
        jaws.on_keyup(["left_mouse_button"], function(){
            for (var i in menu) {
                if (menu[i].rect && menu[i].rect.collidePoint(jaws.mouse_x, jaws.mouse_y)) {
                    pushMenuButton(index);
                }
            }
        });
    }

    this.draw = function() {
        jaws.context.fillStyle = "Black";
        jaws.context.fillRect(0, 0, jaws.width, jaws.height);
        var fontSize = 50;
        var marginTop = 20;
        for (var i in menu) {
            jaws.context.font = fontSize + "pt Tahoma";
            jaws.context.lineWidth = 10;
            jaws.context.fillStyle = i == index ? "White" : "Grey";
            var measure = jaws.context.measureText(menu[i].text);
            var left = jaws.width / 2 - measure.width / 2;
            var top = jaws.height / 2 + (fontSize + marginTop) * i;
            jaws.context.fillText(menu[i].text, left, top);
            var rect = new jaws.Rect(left, top - fontSize, measure.width, fontSize);
            menu[i].rect = rect;
            //rect.draw();
        }
    }

    function pushMenuButton(index) {
        switch(menu[index].text) {
            case "Resume":
                // restore game state
                jaws.switchGameState(TileGameState, {}, savedRuntime);
                break;
            case "Exit":
                // clear saved game state
                jaws.switchGameState(MainMenuState);
                break;
        }
    }
}

function MenuLevelEndState() {
    var menu = [{text: "Restart"}, {text: "Exit"}];
    var index = 0;
    var score = 0;

    this.update = function() {
        for (var i in menu) {
            if (menu[i].rect && menu[i].rect.collidePoint(jaws.mouse_x, jaws.mouse_y)) {
                index = i;
            }
        }
    }

    this.setup = function(runtime) {
        saveScore(runtime);

        index = 0;
        jaws.on_keyup(["down", "s"], function(){index++; if (index >= menu.length){index = menu.length - 1;}});
        jaws.on_keyup(["up", "w"], function(){index--; if (index < 0){index = 0;}});
        jaws.on_keyup(["space", "enter"], function(){
            pushMenuButton(index);
        });
        jaws.on_keyup(["left_mouse_button"], function(){
            for (var i in menu) {
                if (menu[i].rect && menu[i].rect.collidePoint(jaws.mouse_x, jaws.mouse_y)) {
                    pushMenuButton(i);
                }
            }
        });
    }

    this.draw = function() {
        jaws.context.fillStyle = "Black";
        jaws.context.fillRect(0, 0, jaws.width, jaws.height);
        var fontSize = 50;
        var marginTop = 20;
        for (var i in menu) {
            jaws.context.font = fontSize + "pt Tahoma";
            jaws.context.lineWidth = 10;
            jaws.context.fillStyle = i == index ? "White" : "Grey";
            var measure = jaws.context.measureText(menu[i].text);
            var left = jaws.width / 2 - measure.width / 2;
            var top = jaws.height / 1.5 + (fontSize + marginTop) * i;
            jaws.context.fillText(menu[i].text, left, top);
            var rect = new jaws.Rect(left, top - fontSize, measure.width, fontSize);
            menu[i].rect = rect;
            //rect.draw();
        }
        jaws.context.fillStyle = "Grey";
        var scoreCaptionMetrics = jaws.context.measureText("Score");
        jaws.context.fillText("Score", jaws.width / 2 - scoreCaptionMetrics.width / 2, jaws.height / 4);
        jaws.context.fillStyle = "White";
        var scoreMetrics = jaws.context.measureText(score);
        jaws.context.fillText(score, jaws.width / 2 - scoreMetrics.width / 2, jaws.height / 4 + fontSize + marginTop);
    }

    function saveScore(runtime) {
        score = runtime.score;
        // something will happen here with DB or what not
    }

    function pushMenuButton(index) {
        switch(menu[index].text) {
            case "Restart":
                jaws.switchGameState(TileGameState);
                break;
            case "Exit":
                jaws.switchGameState(MainMenuState);
                break;
        }
    }
}