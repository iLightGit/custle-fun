$(document).ready(function () {

    //TODO иногда зачисляется 0 в Очки
    //TODO Если 2 одинаковая картинка до конца не раскрылась и нажать на 3-ю, очки начисляются, но картинки закрываются обратно
    //TODO можно начать переворачивать во время анимации старта

    // Вынести в он старт
    vkBridge.send("VKWebAppInit");


    const gameVersion = 'v0.1.37';

    console.log(gameVersion);

    // console.log('request №1');
    // var request = new XMLHttpRequest();
    // var requestURL = 'https://api.vk.com/method/secure.getUserLevel?v=5.5131&user_ids=85182172';
    // request.open('GET', requestURL, true);
    // request.responseType = 'jsonp';
    // request.withCredentials = true;
    // request.send();
    // request.onload = function() {
    //     var vkAPIresponse = request.response;
    //     console.log(777,vkAPIresponse);
    // }

    console.log('request №1');

    var m_httpVars = window.location.search.substring(1).split("&");
    var m_urlvars = {};

    for (var i in m_httpVars) {
        var s = String(m_httpVars[i]).split("=");
        var key = String(s[0]);
        var value = String(s[1]);
        m_urlvars[key] = value;
    }

    console.log('m_httpVars', m_httpVars);
    console.log('m_urlvars', m_urlvars);
    console.log('typeof  viewer_id:', typeof m_urlvars.viewer_id, typeof m_urlvars.access_token);

    const serv_key = 'e7af1849e7af1849e7af184943e7d364f4ee7afe7af184985dcbeaa5682280d1a948f9e';
    // TODO если делать монетизацию - перегенерировать, и положить на сервер

    if (typeof m_urlvars.viewer_id !== 'undefined' && typeof m_urlvars.access_token !== 'undefined') {


        // !!!!!! Для тестов только на странице Сергей Ясвет
        if (m_urlvars.viewer_id === '85182172') { // Этот код выполнится только для меня

            console.log(555, m_urlvars.viewer_id, serv_key);

            //Получаем токен приложения
            vkBridge.send("VKWebAppGetAuthToken", {
                "app_id": 8158397,
                "scope": "friends,photos,video,stories,pages,status,notes,wall,docs,groups,stats,market,ads,notifications"
            })
                .then(data => {
                    console.log(777, data);


                    vkBridge.send("VKWebAppCallAPIMethod", {
                        "method": "secure.addAppEvent",
                        "request_id": gameVersion,
                        "params": {
                            "user_id": m_urlvars.viewer_id,
                            "v": "5.5131",
                            "access_token": serv_key,
                            "value": "83",
                            "activity_id": "2"
                        }
                    })
                        .then(data => {
                            console.log(3333, data);
                        }).catch(error => console.log(error));
                    ;

                    $.ajax({
                        /* TODO Этот запрос нужно делать на сервере, на котором должен храниться Сервисный ключ доступа */
                        url: 'https://api.vk.com/method/secure.addAppEvent?' +
                            'v=5.5131' +
                            '&user_id=' + m_urlvars.viewer_id +
                            '&activity_id=1' +
                            '&value=83' +
                            '&access_token=' + serv_key,
                        type: 'GET',
                        dataType: 'jsonp', //чтобы небыло проблем с крос-доменами необходим jsonp
                        crossDomain: true,
                        success: function (data) {
                            console.log(888, data);
                        }
                    })

                }).catch(error => console.log(error));
        }  // !!!!!! Для тестов только на странице Сергей Ясвет


        // $.ajax({
        //     /* TODO Этот запрос нужно делать на сервере, на котором должен храниться Сервисный ключ доступа */
        //     url: 'https://api.vk.com/method/secure.getUserLevel?v=5.5131&user_ids='+m_urlvars.viewer_id+'&access_token='+serv_key,
        //     type: 'GET',
        //     dataType: 'jsonp', //чтобы небыло проблем с крос-доменами необходим jsonp
        //     crossDomain: true,
        //     success: function(data){
        //         console.log(888, data);
        //     }
        // })

    }


    function VKajaxFN(url) {
        $.ajax({
            /* TODO Этот запрос нужно делать на сервере, на котором должен храниться Сервисный ключ доступа */
            url: 'https://api.vk.com/method/' + url + m_urlvars.viewer_id + '&v=5.5131&access_token=' + serv_key,
            type: 'GET',
            dataType: 'jsonp', //чтобы небыло проблем с крос-доменами необходим jsonp
            crossDomain: true,
            success: function (data) {
                console.log(888, data);
                return data;
            }
        })
    }

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
            let gameResult = parseInt($('.playerScoreCounter').text());


            // оспользуем уровня для очков, т.к. очки нифига не работают
            let getUserLevel = VKajaxFN('secure.getUserLevel?user_ids=');
            getUserLevel.then((res) => {
                let gameMaxPoints = res[0]?.level;

                console.log('здесь будем записывать рекорд222', res);
                console.log('здесь будем записывать рекорд123', gameMaxPoints);

                if (gameMaxPoints < gameResult) {
                    console.log('оно работает???', gameResult);
                    let setUserLevel = VKajaxFN('secure.setUserLevel?&level=' + gameResult + '&user_id=');
                } else {
                    $('.bonusScoreFill').html('Лучший результат: ' + gameMaxPoints);
                }
            })





            // Получаем токен приложения
            // vkBridge.send("VKWebAppGetAuthToken", {"app_id": 8158397, "scope": ""})
            //     .then(data => {
            //         console.log(data);
            //     }).catch(error => console.log(error));


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
        $('.m_content').append('<div class="playerScoreBox"><div class="playerScore"><div class="playerScoreFill">Очки: <span class="playerScoreCounter">0</span><span class="NewPlayerScore">0</span></div></div></div>');
    }());

    $('.m_content').append('<div class="gameVersion" style="position: absolute;left: 10px;bottom: 2px">' + gameVersion + '</div>')

    $(window).load(function () {
        start(area);
    });

});