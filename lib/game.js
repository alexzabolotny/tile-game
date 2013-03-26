/**
 * This file is a part of Tile game project.
 *
 * @author Oleksandr Zabolotnyi - http://www.zabolotny.com
 * @license LGPL - http://www.gnu.org/licenses/lgpl.html
 * @url http://www.zabolotny.com/project/tile
 */

jaws.assets.add(["media/bg-256.png"]);

function TileGameState() {
    var runtime;
    var m = {x: 0, y: 0};
    var ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var MAX_OPEN_TILES = 2;
    var startScore = 100;
    var bg = new BG();
    var toolbar = new Toolbar();

    function Tile(letter, x, y, w, h) {
        var openState = false;
        var highlightState = false;
        this.rect = jaws.Rect(x, y, w, h);
        this.active = true;

        this.letter = function () {
            return letter;
        };
        this.height = function () {
            return h;
        };
        this.width = function () {
            return w;
        };
        this.open = function (makeOpen) {
            if (typeof makeOpen == 'undefined' || !this.active)
                return openState;
            else
                openState = makeOpen;
        };
        this.highlight = function (on) {
            if (typeof highlightState == 'undefined' || !this.active)
                return highlightState;
            else
                highlightState = on;
        };
        this.draw = function () {
            if (this.active) {
                jaws.context.fillStyle = "#000";
                jaws.context.strokeStyle = highlightState ? "#fff" : "#333";
                jaws.context.lineWidth = 1;
                jaws.context.fillRect(x, y, w, h);
                jaws.context.strokeRect(x, y, w, h);
                if (openState) {
                    var size = Math.floor(h / 2);
                    jaws.context.font = size + "px Tahoma";
                    jaws.context.fillStyle = "#fff";
                    jaws.context.fillText(letter, x + w / 2 - size / 4, y + h - size / 2);
                }
            }
        };
        this.equals = function(that) {
            if (typeof that != typeof this ) return false;
            if (this.letter() == that.letter()) return true;
        };
        this.deactivate = function() {
            this.open(false);
            this.active = false;
        };
        this.toString = function() {
            return letter;
        }
    }

    function BG() {
        var sprites = new Array();
        var ref = new jaws.Sprite({image: 'media/bg-256.png'});
        var i = Math.ceil(jaws.width / ref.width);
        var j = Math.ceil(jaws.height / ref.height);
        while (i >= 0) {
            k = j;
            while (k >= 0) {
                var bg = new jaws.Sprite({image: 'media/bg-256.png', x: ref.width * i, y: ref.height * k});
                sprites.push(bg);
                k--;
            }
            i--;
        }

        this.draw = function() {
            for (var q in sprites) {
                sprites[q].draw();
            }
        }
    }

    function Toolbar() {
        var height = jaws.height * 0.04;
        var pauseRect;

        this.height = function() {
            return height;
        }
        this.rect = function() {
            return pauseRect;
        }

        this.draw = function() {
            jaws.context.fillStyle = "Grey";
            jaws.context.fillRect(0, 0, jaws.width, height);

            jaws.context.fillStyle = "White";
            jaws.context.font = Math.floor(height / 2) + "pt Tahoma";

            var baseline = Math.floor(height / 2) + Math.floor(height / 4);
            jaws.context.fillText("SCORE " + runtime.score, Math.floor(height / 2), baseline);
            var pauseX = jaws.width - Math.floor(jaws.width / 8);
            jaws.context.fillText("Pause", pauseX, baseline);
            pauseRect = new jaws.Rect(pauseX, 0, jaws.width - pauseX, height);
        }
    }

    this.setup = function (runtimeSnapshot) {
        runtime = runtimeSnapshot || {
            score: startScore,
            openCount: 0,
            tileSet: tileSet(4)
        };

        jaws.on_keyup(["p", "P"], function () {
            jaws.switchGameState(PauseMenuState, {}, runtime);
        });
        jaws.on_keydown(["left_mouse_button"], function () {
            if (toolbar.rect().collidePoint(jaws.mouse_x, jaws.mouse_y)) {
                jaws.switchGameState(PauseMenuState, {}, runtime);
            } else if (runtime.openCount < MAX_OPEN_TILES) {
                var capturedTile = null;
                for (var i in runtime.tileSet) {
                    if (runtime.tileSet[i].rect.collidePoint(jaws.mouse_x, jaws.mouse_y)) {
                        capturedTile = i;
                        break;
                    }
                }

                if (capturedTile != null && !runtime.tileSet[capturedTile].open()) {
                    runtime.tileSet[capturedTile].open(true);
                    runtime.openCount++;
                }
            }
        });
        //jaws.switchGameState(MenuLevelEndState, {}, runtime);
    };

    this.update = function () {
        for (var q = 0; q < runtime.tileSet.length; q++) {
            runtime.tileSet[q].highlight(false);
            if (runtime.tileSet[q].rect.collidePoint(jaws.mouse_x, jaws.mouse_y)) {
                runtime.tileSet[q].highlight(true);
            }
        }

        if (runtime.openCount == MAX_OPEN_TILES) {
            setTimeout(removeEqualOpenTiles, 500);
            jaws.game_loop.pause();
        }
    };

    this.draw = function () {
        jaws.context.fillStyle = "Black";
        jaws.context.fillRect(0, 0, jaws.width, jaws.height);
        bg.draw();
        toolbar.draw();
        drawTiles();
    };

    /**
     * Return NxN array of tiles
     * @param N - size of array
     */
    function tileSet(N) {
        var topOffset = toolbar.height();
        var tileWidth = jaws.width / N; // 640 - canvas width;
        var tileHeight = (jaws.height - topOffset) / N; // 880 - canvas height = 920 - titleBar height;

        var letters = new Array();
        for (var q = 0; q < N * N / 2; q++) {
            letters[q * 2]   = ABC[q];
            letters[q * 2 + 1] = ABC[q];
        }

        // shuffling
        for (var p = 0; p < N * N; p++) {
            var k = p + Math.round(Math.random() * (N - p + 1));
            var t = letters[p];
            letters[p] = letters[k];
            letters[k] = t;
        }

        var tiles = new Array();
        for (var i = 0; i < N; i++) {
            for (var j = 0; j < N; j++) {
                var l = letters[N * j + i];
                tiles[N * i + j] = new Tile(l, i * tileWidth, j * tileHeight + topOffset, tileWidth, tileHeight);
            }
        }

        return tiles;
    }

    function drawTiles() {
        for (var i = 0; i < runtime.tileSet.length; i++) {
            runtime.tileSet[i].draw();
        }
    }

    function removeEqualOpenTiles() {
        var openTilesId = new Array();
        for (var i = 0; i < runtime.tileSet.length; i++) {
            if (runtime.tileSet[i].open()) openTilesId.push(i);
        }
        var ch = openTilesId[0];
        var equal = true;
        for (var j = 1; j < openTilesId.length; j++) {
            var id = openTilesId[j];
            if (!runtime.tileSet[id].equals(runtime.tileSet[ch])) {
                equal = false;
                break;
            }
        }
        if (equal) {
            for (var k = 0; k < openTilesId.length; k++) {
                runtime.tileSet[openTilesId[k]].deactivate();
            }
        }
        closeOpenTiles();
        finishTurn();
        jaws.game_loop.unpause();
    }

    function closeOpenTiles() {
        for (var l = 0; l < runtime.tileSet.length; l++) {
            runtime.tileSet[l].open(false);
        }
        runtime.openCount = 0;
    }

    function finishTurn() {
        runtime.score--;
        if (runtime.score <= 0) {
            runtime.success = false;
            jaws.switchGameState(MenuLevelEndState, {fps: 15}, runtime);
        } else {
            var haveActive = false;
            for (var i in runtime.tileSet) {
                if (runtime.tileSet[i].active) {
                    haveActive = true;
                    break;
                }
            }
            if (!haveActive) {
                runtime.success = true;
                jaws.switchGameState(MenuLevelEndState, {fps: 15}, runtime);
            }
        }
    }
}