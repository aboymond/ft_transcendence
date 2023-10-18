var myPixi;

$(document).ready(function(){
    initPixi();
    $(window).on('resize', resizePixi);
});

function initPixi(){
    var gameWindowWidth = $('#game_window').width();
    var gameWindowHeight = $('#game_window').height();

    myPixi = new PIXI.Application({
        width: gameWindowWidth,
        height: gameWindowHeight
    });

    $('#game_window').append(myPixi.view);
}

function resizePixi() {

    var gameWindowWidth = $('#game_window').width();
    var gameWindowHeight = $('#game_window').height();

    myPixi.renderer.resize(gameWindowWidth, gameWindowHeight);
}

