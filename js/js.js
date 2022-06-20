$(document).ready(function () {

    // Вынести в он старт
    vkBridge.send("VKWebAppInit");

    const gameVersion = 'v0.611';

    const imgDir = './img/pet/';
    const imgExt = '.png';

    let vkInit = false;

    let gameLevel = 1;
    let dataSizeX = 2;
    let dataSizeY = 2;
    const starLegend = [
        [7, 5],
        [50, 40],
        [70, 50],
        [110, 70],
        [180, 150],
        [220, 180]
    ];

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

    const m_httpVars = window.location.search.substring(1).split("&");
    const m_urlvars = {};
    let i;
    for (i in m_httpVars) {
        const s = String(m_httpVars[i]).split("=");
        const key = String(s[0]);
        m_urlvars[key] = String(s[1]);
    }

    console.log('m_httpVars', m_httpVars);
    console.log('m_urlvars', m_urlvars);
    console.log('typeof  viewer_id:', typeof m_urlvars.viewer_id, typeof m_urlvars.access_token);

    const serv_key = 'e7af1849e7af1849e7af184943e7d364f4ee7afe7af184985dcbeaa5682280d1a948f9e';
    // TODO если делать монетизацию - перегенерировать, и положить на сервер

    if (typeof m_urlvars.viewer_id !== 'undefined' && typeof m_urlvars.access_token !== 'undefined') {

        vkInit = true;

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
        return new Promise((succeed, fail) => {
            $.ajax({
                /* TODO Этот запрос нужно делать на сервере, на котором должен храниться Сервисный ключ доступа */
                url: 'https://api.vk.com/method/' + url + m_urlvars.viewer_id + '&v=5.5131&access_token=' + serv_key,
                type: 'GET',
                dataType: 'jsonp', //чтобы небыло проблем с крос-доменами необходим jsonp
                crossDomain: true,
                success: function (data) {
                    console.log(888, data);
                    succeed(data);
                },
                error: function (xhr, status, error) {
                    fail(error);
                }
            })
        })
    }

    let m = [],
        n = [],
        box = $('.m_content ul'), boxLi;
    const position_1 = ['top', 'center', 'bottom'];
    const position_2 = ['right', 'center', 'left'];

    Array.prototype.random = function () {
        return this[Math.floor((Math.random() * this.length))];
    }


    function start(areaY, areaX, level = 1) {

        gameLevel = parseInt(level);
        box.html('');
        m = [];
        let number = areaX * areaY;
        for (i = 0; i < number / 2; i++) {
            n = m.push(i + 1);
            n = m.push(i + 1);
        }

        let newcount = number - 2;
        let newMass = [];

        for (let i = 0; i < number; i++) {
            let m1 = m, rand = Math.floor((Math.random() * newcount) + 1), removed = m1.splice(rand, 1);
            n = m1.push(m1.shift());
            n = newMass.push(removed[0]);
            box.append('<li><div class="li"><div class="bg"></div><div class="block" style="background-image: url(' + imgDir + removed[0] + imgExt + ')">' + removed[0] + '</div></div></li>');
            newcount--;
        }

        boxLi = $('.m_content li');

        box.css('width', boxLi.outerWidth() * areaY);
        box.css('background-position', position_1.random() + ' ' + position_2.random());

        viewElements();
        addBonusPoints();

    }

    let firstEL, lastEL;


    $('.m_content ').on('click', '.li', function (e) {
        e.preventDefault();
        let el = $(this);
        parent = el.closest('.m_content');
        if (!(el.hasClass('clear'))) {
            if (!(parent.hasClass('locked'))) {
                el.addClass('active');
                if (boxLi.find('.active').size() === 2) {
                    console.log('active 2');
                    parent.addClass('locked');
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
                        parent.removeClass('locked');

                    }, 500);

                }

                // Если открывалась 3-я, то закрывались 2 другие
                if (boxLi.find('.active').size() === 3) {
                    $('.li.first, .li.last').removeClass('active first last');
                }
            }
        }
    });

    function check(firstEL, lastEL) {
        if (firstEL.text() === lastEL.text()) {
            $('.li.first, .li.last').addClass('clear').animate({
                fontSize: "0em"
            }, 500);
            if (parseInt($('.bonusScoreCounter').text()) > 0) {
                getScore();
            }
        }
        setTimeout(function () {
            $('.li.first, .li.last').removeClass('active first last');
        }, 600);
        checkCompleate();
    }

    // Проверка на завершение игры
    function checkCompleate() {
        if (($('.li.clear').size() === $('.li').size())) {

            setTimeout(function () {


                boxLi.animate({
                    opacity: 0
                }, 700);

                $('body').append('<div class="btnMenuBox"><div class="menuStarBox mod--levelSB js-menuOneLevelBox"><i class="menuStar"></i><i class="menuStar"></i><i class="menuStar"></i></div><div class="btnMenuContent"><div class="btnMenu btnRestart" data-size-x="' + dataSizeX + '" data-size-y="' + dataSizeY + '"></div><div class="btnMenu btnHome" data-level="' + gameLevel + '"></div></div></div>');

                $('body').find('.btnRestart').on('click', function () {
                    removeLevel();
                    start($(this).data('size-x'), $(this).data('size-y'), gameLevel);
                });

                $('body').find('.btnHome').on('click', function () {
                    console.log('возможно этот клик множится');
                    let completeLvl = $(this).data('level');

                    $('.menuLevel').eq(completeLvl - 1).addClass('menuLevel_complete');
                    $('.menuLevel').eq(completeLvl).addClass('menuLevel_open');
                    $('.gameBox').hide();
                    removeLevel();
                    $('.js-menuMainLevelBox').show();
                });


                let stLegend = starLegend[parseInt(gameLevel) - 1];
                let sScore = parseInt($('.playerScoreCounter').text());
                let sCount = 1; // По дефолту всегда 1 звезда


                if (sScore >= stLegend[0]) { // 3 звезды
                    sCount = 3;
                } else if (sScore >= stLegend[1]) { // 2 звезды
                    sCount = 2;
                }

                let mainStarBox = $('.js-mainStarBox').eq(gameLevel - 1);
                let mainStarBoxDataStar = mainStarBox.data('star');

                console.log(999, sCount, mainStarBoxDataStar, 999, mainStarBox.find('.menuStar'));

                if (sCount > mainStarBoxDataStar) {
                    addStarFN(mainStarBox.find('.menuStar'));
                    mainStarBox.data('star', sCount)
                }

                addStarFN($('.js-menuOneLevelBox .menuStar'));

                function addStarFN(el) {
                    for (let i = 0; i < sCount; i++) {
                        el.eq(i).addClass('active');
                    }
                }


                // Вынести в событие
                // Ипользуется только для мобилок
                // Выводить только для первого раза или при установлении рекорда
                // vkBridge.send("VKWebAppShowLeaderBoardBox", {user_result:parseInt($('.playerScoreCounter').text())})
                //     .then(data => console.log(data.success))
                //     .catch(error => console.log(error));
                console.log('end game 123');


                if (vkInit) {
                    let storageKey = 'HCF_level'+gameLevel;
                    vkBridge.send("VKWebAppStorageSet", {
                        key: storageKey,
                        value: 1
                    }).then(result => {
                        console.log('VKWebAppStorageSet', result)
                    }).finally(() => console.log("Промис VKWebAppStorageSet завершён"));

                    vkBridge.send("VKWebAppStorageGet", {"keys": [storageKey]})
                        .then(result => {
                            console.log('VKWebAppStorageGet', result);
                            console.log('VKWebAppStorageGet1',  result?.keys[0]);
                            console.log('VKWebAppStorageGet1',  result?.keys[0].value);
                        }).finally(() => console.log("Промис VKWebAppStorageGet завершён"));



                    let gameResult = parseInt($('.playerScoreCounter').text());

                    // используем уровни для очков, т.к. очки нифига не работают
                    VKajaxFN('secure.getUserLevel?user_ids=')
                        .finally(() => console.log("Промис завершён"))
                        .then(result => {

                            let gameMaxPoints = result?.response[0]?.level;

                            console.log('здесь будем записывать рекорд222', result);
                            console.log('здесь будем записывать рекорд123', gameMaxPoints);
                            console.log('оно работает???', gameResult);
                            if (gameResult > 100) {
                                if (gameResult > gameMaxPoints) {
                                    VKajaxFN('secure.setUserLevel?&level=' + gameResult + '&user_id=');
                                    alert('Ура, новый личный рекорд! ' + gameResult);
                                } else {
                                    $('.bonusScoreFill').html('Лучший результат: ' + gameMaxPoints);
                                }
                            }


                        });

                }

                // Получаем токен приложения
                // vkBridge.send("VKWebAppGetAuthToken", {"app_id": 8158397, "scope": ""})
                //     .then(data => {
                //         console.log(data);
                //     }).catch(error => console.log(error));
            }, 1050);

        }
    }

    // Анимированное отрытие всего поля
    function viewElements() {
        $('.m_content').addClass('locked');
        isize = $('.m_content li').size();

        let i = 0;


        let viewElementsIntervel = setInterval(function () {

            asd(i);
            i++

            if (i > isize) {
                clearInterval(viewElementsIntervel);
                setTimeout(function () {
                    $('.m_content').removeClass('locked');
                }, 400)
            }

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

    // function showel(i) {
    //     boxLi.eq(i).find('.li').addClass('showElement');
    //     setTimeout(function () {
    //         boxLi.eq(i).find('.li').removeClass('showElement');
    //     }, 700);
    // }


    function getScore() {
        iScore = $('.playerScoreCounter');
        // bonusVal = parseInt(el.find('.block').text()); // Очки каждой клетки
        bonusScore = parseInt($('.bonusScoreCounter').text());

        newval = bonusScore;

        oldval = parseInt(iScore.text());
        let newScore = $('.NewPlayerScore');
        newScore.text(newval).show();
        newScore.css({'top': '-290px', 'right': '-100px', 'font-size': '50px'});
        newScore.animate({
            right: "+=150", top: "+=300", fontSize: "20px"
        }, 1000);

        if (parseInt($('.bonusScoreCounter').text()) > 0) {
            setTimeout(function () {
                newScore.hide();
                iScore.text(newval + oldval);
            }, 1000);
        }

    }

    function addBonusPoints() {
        $('.gameContainer').prepend('<div class="bonusScoreBox"><div class="bonusScore"><div class="bonusScoreFill">Бонусные ходы: <span class="bonusScoreCounter">' + $('.m_content li').size() + '</div></span></div></div>');
    }

    (function addPlayerScore() {
        $('.gameContainer').append('<div class="playerScoreBox"><div class="playerScore"><div class="playerScoreFill">Очки: <span class="playerScoreCounter">0</span><span class="NewPlayerScore">0</span></div></div></div>');
    }());

    $('.m_content').append('<div class="gameVersion" style="position: absolute;left: 10px;bottom: 2px">' + gameVersion + '</div>')

    function removeLevel() {
        $('.bonusScoreBox').remove();
        $('.btnMenuBox').remove();
        $('.playerScoreCounter').text(0);
    }

    $('.menuLevel').on('click', function () {
        if ($(this).hasClass('menuLevel_open')) {
            dataSizeX = $(this).data('size-x');
            dataSizeY = $(this).data('size-y');

            gameLevel = $(this).index() + 1;

            $('.gameBox').show();
            $('.menuLevelBox').hide();
            start(dataSizeX, dataSizeY, gameLevel);
        }
    });


    $(window).load(function () {
        start(2, 2, 1);
    });

});