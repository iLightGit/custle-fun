$(document).ready(function () {

    // Вынести в он старт
    vkBridge.send("VKWebAppInit");


    console.log('v0.1.4');

    //TODO Если 2 одинаковая картинка до конца не раскрылась и нажать на 3-ю, очки начисляются, но картинки закрываются обратно

    var m = [], n = [], area = 4, timeToOne = 5,//время на 1 ход
        box = $('.m_content ul'), boxLi, selectSize = $('.size'), timer_timeout;
    const position_1 = ['top', 'center', 'bottom'];
    const position_2 = ['right', 'center', 'left'];

    Array.prototype.random = function () {
        return this[Math.floor((Math.random() * this.length))];
    }


    function start(area) {
        box.html('');
        m = [];
        let icount = area * area;
        for (i = 0; i < icount / 2; i++) {
            n = m.push(i + 1);
            n = m.push(i + 1);
        }

        let newcount = icount - 2;
        let newMass = [];

        for (let i = 0; i < icount; i++) {
            let newm = m, rand = Math.floor((Math.random() * newcount) + 1), removed = newm.splice(rand, 1);
            n = newm.shift();
            var t = newm.push(n);
            n = newMass.push(removed[0]);
            box.append('<li><div class="li"><div class="bg"></div><div class="block" style="background-image: url(./img/pet/' + removed[0] + '.png)">' + removed[0] + '</div></div></li>');
            newcount--;
        }

        boxLi = $('.m_content li');

        box.css('width', boxLi.outerWidth() * area);
        box.css('background-position', position_1.random() + ' ' + position_2.random());

        viewElements();
        addBonusPoints();

    }


    selectSize.change(function () {
        opt = $(this).val();
        val = $(this).find('option').eq(opt - 1).text();
        start(val);

    });

    var firstEL, lastEL;

    $('.m_content ').on('click', '.li', function (e) {
        e.preventDefault();
        el = $(this);
        parent = el.closest('.m_content');
        if (!(el.hasClass('clear'))) {
            if (!(parent.hasClass('locked'))) {
                el.addClass('active');
                if (boxLi.find('.active').size() == 2) {
                    firstEL = $('.li.active:first');
                    lastEL = $('.li.active:last');
                    firstEL.addClass('first');
                    lastEL.addClass('last');
                    setTimeout(function () {
                        check(firstEL, lastEL);

                        let bonusPoints = parseInt($('.bonusScoreCounter').text());
                        if (bonusPoints) {
                            $('.bonusScoreCounter').html(bonusPoints - 1);
                        }


                    }, 500);

                }
                if (boxLi.find('.active').size() == 3) {
                    $('.li.first, .li.last').removeClass('active first last');
                }
            }
        }
    });

    function check(firstEL, lastEL) {
        if (firstEL.text() == lastEL.text()) {
            $('.li.first, .li.last').addClass('clear').animate({
                fontSize: "0em"
            }, 500);
            getScore(firstEL);
        }
        setTimeout(function () {
            $('.li.first, .li.last').removeClass('active first last');
        }, 600);
        checkCompleate();
    };

    // Проверка на завершение игры
    function checkCompleate() {
        if (($('.li.clear').size() == $('.li').size())) {
            boxLi.animate({
                opacity: 0
            }, 700);

            $('.gameBox').append('<div class="btnRestart"></div>');
            $('.m_content').find('.btnRestart').on('click', function () {
                document.location.reload();
            });

            // Вынести в событие
            // Ипользуется только для мобилок
            // Выводить только для первого раза или при установлении рекорда
            // vkBridge.send("VKWebAppShowLeaderBoardBox", {user_result:parseInt($('.playerScoreCounter').text())})
            //     .then(data => console.log(data.success))
            //     .catch(error => console.log(error));
            console.log('end game 123');

            // Получаем токен приложения
            vkBridge.send("VKWebAppGetAuthToken", {"app_id": 8158397, "scope": ""})
                .then(data => {

                    console.log(data);
                    var requestURL = 'https://api.vk.com/method/secure.getUserLevel?v=5.5131&access_token='+data;
                    request.open('GET', requestURL);
                    request.responseType = 'json';
                    request.send();
                    request.onload = function() {
                        var vkAPIresponse = request.response;
                      console.log(777,vkAPIresponse);
                    }

                }).catch(error => console.log(error));
        }
    };

    function viewElements() {
        isize = $('.m_content li').size();

        var i = 0;


        setInterval(function () {

            asd(i);
            i++
        }, 300);

        function asd(i) {
            $('.m_content li').eq(i).find('.li').addClass('active');
            setTimeout(function () {
                $('.m_content li').eq(i).find('.li').removeClass('active');
            }, 700);
        }
    }

// Верия без анимации открытия плиток
    // function viewElements() {
    //
    //     $('.counter ').append('<span class="timer"></span>');
    //     isize = boxLi.size();
    //     var i = 0;
    //
    //     function showallel() {
    //         showelem = setTimeout(function () {
    //             showel(i);
    //             i++;
    //
    //             setTimeout(function () {
    //                 showallel();
    //             }, 100);
    //         }, 200);
    //     }
    //
    //     showallel();
    //
    // }

    function showel(i) {
        boxLi.eq(i).find('.li').addClass('showElement');
        setTimeout(function () {
            boxLi.eq(i).find('.li').removeClass('showElement');
        }, 700);
    }


    function getScore(el) {
        iScore = $('.playerScoreCounter');
        // bonusVal = parseInt(el.find('.block').text()); // Очки каждой клетки
        bonusScore = parseInt($('.bonusScoreCounter').text());

        newval = bonusScore;

        oldval = parseInt(iScore.text());
        newScore = $('.NewPlayerScore');
        newScore.text(newval).show();
        newScore.animate({
            right: "+=150", top: "+=300", fontSize: "20px"
        }, 1000);

        if (parseInt($('.bonusScoreCounter').text()) > 0) {
            setTimeout(function () {
                newScore.hide();
                iScore.text(newval + oldval);
                newScore.css({'top': '-290px', 'right': '-100px', 'font-size': '50px'});
            }, 1000);
        }

    }

    function addBonusPoints() {
        $('.m_content').prepend('<div class="bonusScoreBox"><div class="bonusScore"><div class="bonusScoreFill">Бонусные ходы: <span class="bonusScoreCounter">' + $('.m_content li').size() + '</div></span></div></div>');
    }

    (function addPlayerScore() {
        $('.m_content').append('<div class="playerScoreBox"><div class="playerScore"><div class="playerScoreFill">Player Score: <span class="playerScoreCounter">0</span><span class="NewPlayerScore">0</span></div></div></div>');
    }());


    $(window).load(function () {
        start(area);
    });

});