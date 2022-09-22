$(document).ready(function () {

    // Вынести в он старт
    vkBridge.send("VKWebAppInit");

    const gameVersion = 'v0.13.4';

    const imgDir = './img/pet/';
    const imgExt = '.png';

    let vkInit = false;
    let musicController = true;
    let startMusicController = true;
    let viewElementsInterval;

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

    const jsMusic = document.getElementById("js-main_music");

    function playAudio() {
        jsMusic.play();
    }

    function pauseAudio() {
        jsMusic.pause();
    }

    console.log('request №1');

    const m_httpVars = window.location.search.substring(1).split("&");
    const m_urlVars = {};
    let i;
    for (i in m_httpVars) {
        const s = String(m_httpVars[i]).split("=");
        const key = String(s[0]);
        m_urlVars[key] = String(s[1]);
    }

    console.log('m_httpVars', m_httpVars);
    console.log('m_urlVars', m_urlVars);
    console.log('typeof  viewer_id:', typeof m_urlVars.viewer_id, typeof m_urlVars.access_token);

    const serv_key = 'e7af1849e7af1849e7af184943e7d364f4ee7afe7af184985dcbeaa5682280d1a948f9e';
    // TODO если делать монетизацию - перегенерировать, и положить на сервер

    if (typeof m_urlVars.viewer_id !== 'undefined' && typeof m_urlVars.access_token !== 'undefined') {

        vkInit = true;

        const MSB = $('.js-mainStarBox')


        for (let i = 0; i < MSB.length; i++) {

            let storageKey = 'HCF_level_' + (i + 1);
            console.log('msb', storageKey)

            vkBridge.send("VKWebAppStorageGet", {"keys": [storageKey]})
                .then(result => {
                    let storageValue = result?.keys[0].value;

                    console.log('VKWebAppStorageGet0', result);
                    console.log('VKWebAppStorageGet1', storageValue);

                    if (storageValue !== "") {
                        storageValue = parseInt(storageValue);
                        if (storageValue === 1 || storageValue === 2 || storageValue === 3) {
                            MSB.eq(i).addClass('menuLevel_complete');
                            MSB.eq(i).data('star', storageValue);
                            MSB.eq(i + 1).addClass('menuLevel_open');
                            addStarFN(MSB.eq(i).find('.menuStar'), storageValue);
                        } else {
                            console.log('storageValue error', storageValue);
                        }
                    }


                }).finally(() => console.log("Промис Start VKWebAppStorageGet завершён"));

        }


        // !!!!!! Для тестов только на странице Сергей Ясвет
        if (m_urlVars.viewer_id === '85182172') { // Этот код выполнится только для меня

            console.log(555, m_urlVars.viewer_id, serv_key);

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
                            "user_id": m_urlVars.viewer_id,
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
                            '&user_id=' + m_urlVars.viewer_id +
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


    }


    function vkAjaxFN(url) {
        return new Promise((succeed, fail) => {
            $.ajax({
                /* TODO Этот запрос нужно делать на сервере, на котором должен храниться Сервисный ключ доступа */
                url: 'https://api.vk.com/method/' + url + m_urlVars.viewer_id + '&v=5.5131&access_token=' + serv_key,
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

    let box = $('.m_content ul'), boxLi;
    const position_1 = ['top', 'center', 'bottom'];
    const position_2 = ['right', 'center', 'left'];

    Array.prototype.random = function () {
        return this[Math.floor((Math.random() * this.length))];
    }


    function start(areaY, areaX, level = 1) {

        gameLevel = parseInt(level);
        box.html('');
        let m = [];
        let number = areaX * areaY;
        for (i = 0; i < number / 2; i++) {
            m.push(i + 1);
            m.push(i + 1);
        }

        let newCount = number - 2;
        
        for (let i = 0; i < number; i++) {
            let m1 = m, rand = Math.floor((Math.random() * newCount) + 1), removed = m1.splice(rand, 1);
            m.push(m.shift());

            box.append('<li><div class="li"><div class="bg"></div><div class="block" style="background-image: url(' + imgDir + removed[0] + imgExt + ')">' + removed[0] + '</div></div></li>');
            newCount--;
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

        musicPlay('./music/open_card.mp3')

        let el = $(this);
        parent = el.closest('.m_content');
        if (!(el.hasClass('clear'))) {
            if (!(parent.hasClass('locked'))) {
                el.addClass('active');
                if (boxLi.find('.active').size() === 2) {

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

            musicPlay('./music/open_success.mp3');
        } else {
            musicPlay('./music/open_wrong.mp3');
        }
        setTimeout(function () {
            $('.li.first, .li.last').removeClass('active first last');
        }, 600);
        checkComplete();
    }

    // Проверка на завершение игры
    function checkComplete() {
        if (($('.li.clear').size() === $('.li').size())) {

            setTimeout(function () {


                boxLi.animate({
                    opacity: 0
                }, 700);

                $('body').append('<div class="btnMenuBox"><div class="menuStarBox mod--levelSB js-menuOneLevelBox"><i class="menuStar"></i><i class="menuStar"></i><i class="menuStar"></i></div><div class="btnMenuContent"><div class="btnMenu btnRestart" data-size-x="' + dataSizeX + '" data-size-y="' + dataSizeY + '"></div><div class="btnMenu btnHome" data-level="' + gameLevel + '"></div></div></div>');

                $('body').find('.btnRestart').on('click', function () {
                    removeLevel();
                    start($(this).data('size-x'), $(this).data('size-y'), gameLevel);
                    // musicPlay('./music/bnt_click.mp3');
                    musicPlay('./music/level_new.mp3');
                });

                $('body').find('.btnHome').on('click', function () {
                    let completeLvl = $(this).data('level');

                    $('.menuLevel').eq(completeLvl - 1).addClass('menuLevel_complete');
                    $('.menuLevel').eq(completeLvl).addClass('menuLevel_open');
                    $('.js-gameBox').hide();
                    removeLevel();
                    $('.js-menuMainLevelBox').show();
                    $('.js-btnHomeSmall').hide();
                    musicPlay('./music/level_new.mp3');
                });


                let stLegend = starLegend[parseInt(gameLevel) - 1];
                let sScore = parseInt($('.playerScoreCounter').text());
                let sCount = 1; // По дефолту всегда 1 звезда


                if (sScore >= stLegend[0]) { // 3 звезды
                    sCount = 3;
                    musicPlay('./music/level_end_3.mp3');
                } else if (sScore >= stLegend[1]) { // 2 звезды
                    sCount = 2;
                    musicPlay('./music/level_end_2.mp3');
                } else {
                    musicPlay('./music/level_end_1.mp3');
                }

                let mainStarBox = $('.js-mainStarBox').eq(gameLevel - 1);
                let mainStarBoxDataStar = mainStarBox.data('star');

                console.log(999, sCount, mainStarBoxDataStar, 999, mainStarBox.find('.menuStar'));

                if (sCount > mainStarBoxDataStar) {
                    addStarFN(mainStarBox.find('.menuStar'), sCount);
                    mainStarBox.data('star', sCount)
                }

                addStarFN($('.js-menuOneLevelBox .menuStar'), sCount);


                // Вынести в событие ???
                // Ипользуется только для мобилок
                // Выводим, если больше 7 очков (не для 1 уровня)
                if (sScore > 7) {
                    vkBridge.send("VKWebAppShowLeaderBoardBox", {user_result: sScore})
                        .then(data => console.log(data.success))
                        .catch(error => console.log(error));
                }

                if (vkInit) {

                    // + Запись звезд в StorageVK
                    let storageKey = 'HCF_level_' + gameLevel;

                    vkBridge.send("VKWebAppStorageGet", {"keys": [storageKey]})
                        .then(result => {
                            let storageValue = result?.keys[0].value;
                            console.log('VKWebAppStorageGet1', storageValue);
                            if (storageValue === "" || parseInt(storageValue) < sCount) {
                                storageSetFN(storageKey, sCount)
                            }
                        }).finally(() => console.log("Промис VKWebAppStorageGet завершён"));
                    // - Запись звезд в StorageVK


                    let gameResult = parseInt($('.playerScoreCounter').text());

                    // используем уровни для очков, т.к. очки нифига не работают
                    vkAjaxFN('secure.getUserLevel?user_ids=')
                        .finally(() => console.log("Промис завершён"))
                        .then(result => {

                            let gameMaxPoints = result?.response[0]?.level;

                            console.log('здесь будем записывать рекорд222', result);
                            console.log('здесь будем записывать рекорд123', gameMaxPoints);
                            console.log('оно работает???', gameResult);
                            if (gameResult > 100) {
                                if (gameResult > gameMaxPoints) {
                                    //На мобилке вызовет дополнительное окно
                                    vkAjaxFN('secure.setUserLevel?&level=' + gameResult + '&user_id=');

                                    //Алект имеет смысл, если не на мобилке
                                    //alert('Ура, новый личный рекорд! ' + gameResult);
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

    function storageSetFN(storageKey, storageValue){
        vkBridge.send("VKWebAppStorageSet", {
            key: `${storageKey}`, // Должны быть строкой в любом случае
            value: `${storageValue}`, // Должны быть строкой в любом случае
        }).then(result => {
            console.log('VKWebAppStorageSet', result, `${storageKey}`, `${storageValue}`, 123, storageKey, storageValue)
        }).finally(() => console.log("Промис VKWebAppStorageSet завершён"));
    }

    // Добавление звезд
    function addStarFN(el, sCount) {
        for (let i = 0; i < sCount; i++) {
            el.eq(i).addClass('active');
        }
    }

    // Анимированное отрытие всего поля
    function viewElements() {
        clearInterval(viewElementsInterval);
        $('.m_content').addClass('locked');
        
        let iSize = $('.m_content li').size();
        let i = 0;


        viewElementsInterval = setInterval(function () {

            asd(i);
            i++

            if (i > iSize) {
                clearInterval(viewElementsInterval);
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
    //     iSize = boxLi.size();
    //     var i = 0;
    //
    //     function showAllEl() {
    //         showElem = setTimeout(function () {
    //             showEl(i);
    //             i++;
    //
    //             setTimeout(function () {
    //                 showAllEl();
    //             }, 100);
    //         }, 200);
    //     }
    //
    //     showAllEl();
    //
    // }

    // function showEl(i) {
    //     boxLi.eq(i).find('.li').addClass('showElement');
    //     setTimeout(function () {
    //         boxLi.eq(i).find('.li').removeClass('showElement');
    //     }, 700);
    // }


    function getScore() {
        let iScore = $('.playerScoreCounter');
        let newVal = parseInt($('.bonusScoreCounter').text());

        let oldVal = parseInt(iScore.text());
        let newScore = $('.NewPlayerScore');
        newScore.text(newVal).show();
        newScore.css({'top': '-290px', 'right': '-100px', 'font-size': '50px'});
        newScore.animate({
            right: "+=150", top: "+=300", fontSize: "20px"
        }, 1000);

        if (parseInt($('.bonusScoreCounter').text()) > 0) {
            setTimeout(function () {
                newScore.hide();
                iScore.text(newVal + oldVal);
            }, 1000);
        }

    }

    function addBonusPoints() {
        $('.btnSmallContent').after('<div class="bonusScoreBox">' +
                '<div class="bonusScore"><div class="bonusScoreFill">Ходы: <span class="bonusScoreCounter">' + $('.m_content li').size() + '</div></span></div>' +
                '<div class="playerScore"><div class="playerScoreFill">Очки: <span class="playerScoreCounter">0</span><span class="NewPlayerScore">0</span></div></div>' +
            '</div>');
    }

    $('.m_content').append('<div class="gameVersion" style="position: absolute;left: 10px;bottom: 2px">' + gameVersion + '</div>')

    function removeLevel() {
        $('.bonusScoreBox').remove();
        $('.btnMenuBox').remove();
        $('.playerScoreCounter').text(0);
    }

    function musicPlay(musicFile){
        if(musicController){
            new Audio(musicFile).play()
        }
    }

    $('.menuLevel').on('click', function () {
        if ($(this).hasClass('menuLevel_open')) {
            dataSizeX = $(this).data('size-x');
            dataSizeY = $(this).data('size-y');

            gameLevel = $(this).index() + 1;

            $('.js-gameBox').show();
            $('.menuLevelBox').hide();
            start(dataSizeX, dataSizeY, gameLevel);
            $('.js-btnHomeSmall').show();
            musicPlay('./music/level_new.mp3')
        }
    });

    //Пригласить друга
    $('.js-inviteFriend').on('click', function () {
        vkBridge.send("VKWebAppShowInviteBox", {})
            .then(data => console.log(data.success))
            .catch(error => console.log(error));
    });

    $('.js-btnSound').on('click', function () {
        if(musicController){
            $(this).addClass('mod--deactivated');
            musicController = false;
            pauseAudio();
            storageSetFN('HCF_music', '0')
        } else {
            $(this).removeClass('mod--deactivated');
            musicController = true;
            playAudio();
            storageSetFN('HCF_music', '1')
        }

    });

    function startMusic(){
        if(musicController && startMusicController){
            startMusicController = false;
            playAudio();
        }
    }


    $(function() {
        $(window).bind('focus', function() {
            if(musicController){
                playAudio();
            }
        });

        $(window).bind('blur', function() {
            if(musicController){
                pauseAudio();
            }
        });
    });

    $(window).load(function () {
        start(2, 2, 1);

        // + Достать из StorageVK состояние музыки

        vkBridge.send("VKWebAppStorageGet", {"keys": ['HCF_music']})
            .then(result => {
                let storageValue = result?.keys[0].value;
                console.log('VKWebAppStorageGet HCF_music', storageValue, result);
                musicController = !!(storageValue || storageValue === "");
                if(!musicController){
                    $('.js-btnSound').addClass('mod--deactivated');
                }
            }).finally(() => console.log("Промис VKWebAppStorageGet HCF_music завершён"));


        document.onclick = startMusic;
    });

});