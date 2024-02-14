import React from "react";
import $ from 'jquery';
import bridge from "@vkontakte/vk-bridge";

bridge.send("VKWebAppInit");


document.addEventListener('DOMContentLoaded', function () {


    const gameVersion = 'v0.24.5';

    const imgDir = './img/pet/';
    const imgExt = '.png';
    const HCF_HREF = 'https://vk.com/app8158397';

    // Максимальная энергия и длительность восстановления
    const ENERGY_MAX = 5;
    const ENERGY_DURATION = 20;

    let vkInit = false;
    let musicController = false;
    let startMusicController = true;
    let viewElementsInterval;
    let g_friend_stars = 0;

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
    let scoreEL;
    let scoreVAL = 0;
    let payerScoreEL;
    let payerScoreVAL = 0;

    function playAudio() {
        jsMusic.play();
    }

    function pauseAudio() {
        jsMusic.pause();
    }

    const m_httpVars = window.location.search.substring(1).split("&");
    const m_urlVars = {};
    let i;
    for (i in m_httpVars) {
        const s = String(m_httpVars[i]).split("=");
        const key = String(s[0]);
        m_urlVars[key] = String(s[1]);
    }

    const serv_key = 'e7af1849e7af1849e7af184943e7d364f4ee7afe7af184985dcbeaa5682280d1a948f9e';

    // TODO если делать монетизацию - перегенерировать, и положить на сервер


    function getRequestKey(url) {

        let appStartRequestKeyPart = url.split('referrer=request&')[1];

        if (appStartRequestKeyPart !== undefined) {
            // Здесь храниться request_id - порядковый номер отправленного запроса и request_key - поле "requestKey" которое формируется при создании запроса

            let appStartRequestKeyPart2 = appStartRequestKeyPart.split('request_key=')[1];

            if (appStartRequestKeyPart2 !== undefined) {
                let appStartRequestKeyPart3 = appStartRequestKeyPart2.split('&')[0];

                // "Ключ", переданный при старте запроса
                console.log(1001, appStartRequestKeyPart3);

                return appStartRequestKeyPart3;
                // Далее надо как-то передать информацию об успешном выполнении запроса "просящему"
            }

        }
    }

    // Проверка действие из запроса


    function getRequestSender(url) {

        let RequestSenderPart1 = url.split('&user_id=')[1];

        if (RequestSenderPart1 !== undefined) {

            let RequestSenderPart2 = RequestSenderPart1.split('&')[0];

            console.log(4001, RequestSenderPart2);

            return RequestSenderPart2
        }
    }

    function requestController() {
        let requestKey = getRequestKey(window.location.search.slice(1));

        console.log(6001, requestKey, window.location.search.slice(1))

        if (requestKey === 'gcrown_request_001') {
            let requestSenderID = getRequestSender(window.location.search.slice(1));

            sendRequest(requestSenderID, 'Я отправил тебе корону, возвращайся в игру!', 'send_gcrown_key_001')
        }

        if (requestKey === 'send_gcrown_key_001') {
            console.log(5001, 'Будем начислять корону!')
        }
    }

    requestController();

    function sendRequest(requestFriendID, requestMessage, requestKey) {

        bridge.send("VKWebAppShowRequestBox", {
            uid: requestFriendID,
            message: requestMessage,
            requestKey: requestKey
        }).then(data => {
            console.log('sendRequest', data);
        }).catch(error => console.log(error));
    }


    if (typeof m_urlVars.viewer_id !== 'undefined' && typeof m_urlVars.access_token !== 'undefined') {

        vkInit = true;

        const MSB = $('.js-mainStarBox')


        for (let i = 0; i < MSB.length; i++) {

            let storageKey = 'HCF_level_' + (i + 1);

            bridge.send("VKWebAppStorageGet", {"keys": [storageKey]})
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
            bridge.send("VKWebAppGetAuthToken", {
                "app_id": 8158397,
                "scope": "friends,photos,video,stories,pages,status,notes,wall,docs,groups,stats,market,ads,notifications,notify"
            })
                .then(data => {
                    console.log(777, data);
                    console.log(789, data['access_token']);


                    // bridge.send("VKWebAppCallAPIMethod", {
                    //     "method": "secure.addAppEvent",
                    //     "request_id": gameVersion,
                    //     "params": {
                    //         "user_id": m_urlVars.viewer_id,
                    //         "v": "5.5131",
                    //         "access_token": serv_key,
                    //         "value": "83",
                    //         "activity_id": "2"
                    //     }
                    // })
                    //     .then(data => {
                    //         console.log(3333, data);
                    //     }).catch(error => console.log(error));

                    $('.share').on('click', function () {
                        bridge.send("VKWebAppShowWallPostBox", {
                            "message": "Рекомендую",
                            "attachments": HCF_HREF
                        }).then(data => {
                            console.log(4444, data);
                        }).catch(error => console.log(error));
                    });


                    // $.ajax({
                    //     /* TODO Этот запрос нужно делать на сервере, на котором должен храниться Сервисный ключ доступа */
                    //     url: 'https://api.vk.com/method/secure.addAppEvent?' +
                    //         'v=5.5131' +
                    //         '&user_id=' + m_urlVars.viewer_id +
                    //         '&activity_id=1' +
                    //         '&value=83' +
                    //         '&access_token=' + serv_key,
                    //     type: 'GET',
                    //     dataType: 'jsonp', //чтобы небыло проблем с крос-доменами необходим jsonp
                    //     crossDomain: true,
                    //     success: function (data) {
                    //         console.log(888, data);
                    //     }
                    // })

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


    $('.m_content ').on('click', '.li', function (e) {

        e.preventDefault();
        let el = $(this);
        let parent = el.closest('.m_content');

        if (!(parent.hasClass('locked')) && !(el.hasClass('clear')) && !el.hasClass('active')) {
            el.addClass('active');
            musicPlay('./music/open_card.mp3');

            if (boxLi.find('.active').length === 2) {
                let firstEL, lastEL;
                parent.addClass('locked');
                firstEL = $('.li.active:first');
                lastEL = $('.li.active:last');
                firstEL.addClass('first');
                lastEL.addClass('last');

                // setTimeout нужен, чтобы клетки НЕ закрывались моментально после открытия второй клетки
                setTimeout(function () {
                    checkSame(firstEL, lastEL);

                    if (scoreVAL) {
                        scoreEL.html(--scoreVAL);
                    }
                    parent.removeClass('locked');

                }, 500);

            }

            // Если открывалась 3-я, то закрывались 2 другие
            if (boxLi.find('.active').length === 3) {
                $('.li.first, .li.last').removeClass('active first last');
            }
        }
    });

    function checkSame(firstEL, lastEL) {

        firstEL.add(lastEL).removeClass('active first last');
        if (firstEL.text() === lastEL.text()) {
            firstEL.add(lastEL).addClass('clear').animate({
                fontSize: "0em"
            }, 500);

            if (scoreVAL) {
                getScore();
            }

            musicPlay('./music/open_success.mp3');
            checkComplete();
        } else {
            musicPlay('./music/open_wrong.mp3');
        }

    }

    function getRandomNumber(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    // Проверка на завершение игры
    function checkComplete() {
        if (($('.li.clear').length === $('.li').length)) {

            setTimeout(function () {

                let puzzleBackground = getRandomNumber(1, 6);
                let storageKey = 'puzzleBg_' + puzzleBackground;

                // + Запись пазлов в стор
                bridge.send("VKWebAppStorageGet", {"keys": [storageKey]})
                    .then(result => {
                        let storageValue = result?.keys[0].value;

                        if (storageValue === "") {
                            storageValue = "0";
                        }
                        let newStorageValue = parseInt(storageValue) + payerScoreVAL;
                        console.log('puzzleBg_' + puzzleBackground, newStorageValue, payerScoreVAL, parseInt(storageValue));

                        storageSetFN(storageKey, newStorageValue)

                    }).finally(() => console.log("Промис 'puzzleBg_' завершён"));
                // - Запись пазлов в стор


                $('body').append('<div class="btnMenuBox">' +
                    '<div class="menuStarBox mod--levelSB js-menuOneLevelBox"><i class="menuStar"></i><i class="menuStar"></i><i class="menuStar"></i></div>' +
                    '<div class="levelRewardBox"><div class="levelReward" data-bg="' + puzzleBackground + '"><div class="levelRewardCount">' + payerScoreVAL + '</div></div></div>' +
                    '<div class="btnMenuContent"><div class="btnMenu btnRestart" data-size-x="' + dataSizeX + '" data-size-y="' + dataSizeY + '"></div>' +
                    '<div class="btnMenu btnHome js-btnHome js-btnHomeBig" data-level="' + gameLevel + '"></div>' +
                    '</div></div>');

                $('body').find('.btnRestart').on('click', function () {
                    removeLevel();
                    start($(this).data('size-x'), $(this).data('size-y'), gameLevel);
                    // musicPlay('./music/bnt_click.mp3');
                    musicPlay('./music/level_new.mp3');
                });

                $('body').find('.js-btnHomeBig').on('click', function () {
                    let completeLvl = $(this).data('level');

                    $('.js-menuLevel').eq(completeLvl - 1).addClass('menuLevel_complete');
                    $('.js-menuLevel').eq(completeLvl).addClass('menuLevel_open');
                    $('.js-gameBox').hide();
                    removeLevel();
                    $('.js-menuMainLevelBox').show();
                    $('.js-btnHomeSmall').hide();
                    $('.js-btnGallery').show();
                    musicPlay('./music/level_new.mp3');
                    $('.js-mainBox').addClass('is--menuLevel-open');
                });

                let stLegend = starLegend[parseInt(gameLevel) - 1];
                let sCount = 1; // По дефолту всегда 1 звезда


                if (payerScoreVAL >= stLegend[0]) { // 3 звезды
                    sCount = 3;
                    musicPlay('./music/level_end_3.mp3');
                } else if (payerScoreVAL >= stLegend[1]) { // 2 звезды
                    sCount = 2;
                    musicPlay('./music/level_end_2.mp3');
                } else {
                    musicPlay('./music/level_end_1.mp3');
                }

                let mainStarBox = $('.js-mainStarBox').eq(gameLevel - 1);
                let mainStarBoxDataStar = mainStarBox.data('star');

                if (sCount > mainStarBoxDataStar) {
                    addStarFN(mainStarBox.find('.menuStar'), sCount);
                    mainStarBox.data('star', sCount)
                }

                addStarFN($('.js-menuOneLevelBox .menuStar'), sCount);


                // Вынести в событие ???
                // Теперь используется везде
                // Выводим, если больше 7 очков (не для 1 уровня)
                if (payerScoreVAL > 7) {
                    bridge.send("VKWebAppShowLeaderBoardBox", {user_result: payerScoreVAL})
                        .then(data => console.log(data.success))
                        .catch(error => console.log(error));
                }

                if (vkInit) {

                    // + Запись звезд в StorageVK
                    let storageKey = 'HCF_level_' + gameLevel;

                    bridge.send("VKWebAppStorageGet", {"keys": [storageKey]})
                        .then(result => {
                            let storageValue = result?.keys[0].value;
                            console.log('VKWebAppStorageGet1', storageValue);
                            if (storageValue === "" || parseInt(storageValue) < sCount) {
                                storageSetFN(storageKey, sCount)
                            }
                        }).finally(() => console.log("Промис VKWebAppStorageGet завершён"));
                    // - Запись звезд в StorageVK


                    let gameResult = payerScoreVAL;

                    // используем уровни для очков, т.к. очки нифига не работают
                    vkAjaxFN('secure.getUserLevel?user_ids=')
                        .finally(() => console.log("Промис завершён"))
                        .then(result => {

                            let gameMaxPoints = result?.response[0]?.level;

                            if (gameResult > 100) {
                                if (gameResult > gameMaxPoints) {
                                    //На мобилке вызовет дополнительное окно
                                    vkAjaxFN('secure.setUserLevel?&level=' + gameResult + '&user_id=');

                                    //Алерт имеет смысл, если не на мобилке
                                    //alert('Ура, новый личный рекорд! ' + gameResult);
                                } else {
                                    $('.bonusScoreFill').html('Лучший результат: ' + gameMaxPoints);
                                }
                            }


                        });

                }

            }, 1050);

        }
    }

    function storageSetFN(storageKey, storageValue) {
        bridge.send("VKWebAppStorageSet", {
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

        let iSize = $('.m_content li').length;
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
    //     iSize = boxLi.length;
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

        let newVal = scoreVAL;
        let oldVal = payerScoreVAL;
        let newScore = $('.NewPlayerScore');

        newScore.text(newVal).show();
        newScore.css({'top': '-290px', 'right': '-100px', 'font-size': '50px'});
        newScore.animate({
            right: "+=115", top: "+=290", fontSize: "20px"
        }, 1000);

        if (scoreVAL) {
            payerScoreVAL = newVal + oldVal;
            setTimeout(function () {
                newScore.hide();
                payerScoreEL.text(payerScoreVAL);
            }, 1000);
        }

    }

    function addBonusPoints() {
        scoreVAL = $('.m_content li').length;

        $('.btnSmallContent').after('<div class="bonusScoreBox">' +
            '<div class="bonusScore"><div class="bonusScoreFill">Ходы: <span class="bonusScoreCounter">' + scoreVAL + '</div></span></div>' +
            '<div class="playerScore"><div class="playerScoreFill">Очки: <span class="playerScoreCounter">0</span><span class="NewPlayerScore">0</span></div></div>' +
            '</div>');

        scoreEL = $('.bonusScoreCounter');
        payerScoreEL = $('.playerScoreCounter');
    }

    $('.m_content').append('<div class="gameVersion" style="position: absolute;left: 10px;bottom: 2px">' + gameVersion + '</div>');

    $('.gameVersion').on('click', function () {

        console.log('gameVersion click');

        // Выбор списка друзей
        bridge.send("VKWebAppGetFriends", {}).then(data => {

            sendRequest(data?.users[0].id, "Присоединяйся к игре HCF, это весело", "gcrown_request_001");

        }).catch(error => console.log(error));

        $(document).on('VKWebAppGetFriendsResult', function () {
            console.log(3456, $(this));
        });


    });

    function removeLevel() {
        $('.bonusScoreBox').remove();
        $('.btnMenuBox').remove();
        $('.playerScoreCounter').text(0);
        payerScoreVAL = 0;
    }

    function musicPlay(musicFile) {
        if (musicController) {
            new Audio(musicFile).play()
        }
    }

    function currentEnergyFN() {

        let currentEnergy = parseInt($('.js-energy_count').text());

        // Энергия попыток в секундах
        let attemptsSeconds = currentEnergy * ENERGY_DURATION * 60;
        let timerWork = 0;
        let timerIs;

        // Когда энергия не полная нужно учитывать время работы таймера
        // Энергия отнимается перед запуском таймера, поэтому "-1"
        if (currentEnergy < ENERGY_MAX - 1) {
            let timerSplit = $('.js-energyTimer').text().split(':');
            let timerMinutes = parseInt(timerSplit[0]);
            let timerSeconds = parseInt(timerSplit[1]);

            // Сколько секунд осталось на таймере
            timerIs = timerMinutes * 60 + timerSeconds;

            // Но нам надо время, которое таймер отработал
            timerWork = ENERGY_DURATION * 60 - timerIs;
        }

        return currentTime() - attemptsSeconds - timerWork;
    }

    $('.js-menuLevel').on('click', function () {
        // Если уровень доступен

        if ($(this).hasClass('menuLevel_open')) {

            let currentEnergy = parseInt($('.js-energy_count').text())
            if (currentEnergy > 0) {
                $('.js-energy_count').text(currentEnergy - 1);

                // Запускаем таймер, только если он еще не запущен
                if (gTimer === 0) {
                    let display = document.querySelector('#time');
                    startTimer(ENERGY_DURATION * 60, display);
                }

                storageSetFN('HCF_energy', currentEnergyFN());

                dataSizeX = $(this).data('size-x');
                dataSizeY = $(this).data('size-y');

                gameLevel = $(this).index() + 1;

                $('.js-gameBox').show();
                $('.menuLevelBox').hide();
                start(dataSizeX, dataSizeY, gameLevel);
                $('.js-btnGallery').hide();
                musicPlay('./music/level_new.mp3');
                $('.js-mainBox').removeClass('is--menuLevel-open');
            } else {
                alert('Нет энергии');
            }


        }
    });


    // Добавить игру на экран (мобильная версия)
    // Проверка
    bridge.send("VKWebAppAddToHomeScreenInfo", {})
        .then(data => {
            // Если поддерживается и еще не добавлена - тогда показываем
            if (data.is_feature_supported && !data.is_added_to_home_screen) {
                $('.js-addHomeScreen').show().on('click', function () {
                    addToHomeScreen();
                });
            }
        })
        .catch(error => console.log(error));

    // Добавление
    function addToHomeScreen() {
        bridge.send("VKWebAppAddToHomeScreen", {})
            .then(data => {
                if (data.result) {
                    // После добавления - прячем кнопку
                    $('.js-addHomeScreen').hide();
                }
            })
            .catch(error => console.log(error));
    }

    // Добавление игры в избранное (десктопная версия)
    // Событие само проверяет себя и не вызывает окно добавления, если уже добавлено
    function addGameToFavorite() {
        bridge.send("VKWebAppAddToFavorites", {})
            .then(data => {

                if (data.result) {
                    // Этот код нужен если надо скрыть кнопку
                }
            })
            .catch(error => console.log(error));
    }

    addGameToFavorite();

    //Пригласить друга
    $('.js-inviteFriend').on('click', function () {
        bridge.send("VKWebAppShowInviteBox", {})
            .then(data => console.log(data.success))
            .catch(error => console.log(error));
    });

    $('.js-btnSound').on('click', function () {
        if (musicController) {
            $(this).addClass('mod--deactivated');
            musicController = false;
            pauseAudio();
            storageSetFN('HCF_music', 0)
        } else {
            $(this).removeClass('mod--deactivated');
            musicController = true;
            playAudio();
            storageSetFN('HCF_music', 1)
        }

    });

    function startMusic() {
        if (musicController && startMusicController) {
            startMusicController = false;
            playAudio();
        }
    }


    document.addEventListener("visibilitychange", () => {
        if (musicController && !startMusicController) {
            if (document.visibilityState === "visible") {
                playAudio();
            } else {
                pauseAudio();
            }

        }
    })


    // + Достать из StorageVK состояние музыки
    bridge.send("VKWebAppStorageGet", {"keys": ['HCF_music']})
        .then(result => {
            if (result?.keys[0].value === "0") {
                musicController = false;
                $('.js-btnSound').addClass('mod--deactivated');
            } else {
                musicController = true;
            }
        }).finally(() => console.log("Промис VKWebAppStorageGet HCF_music завершён"));


    // + Достать бонусные звезды (полученные от друзей)
    bridge.send("VKWebAppStorageGet", {"keys": ['HCF_friend_stars']})
        .then(result => {
            if (result?.keys[0].value !== "") {
                g_friend_stars = parseInt(result?.keys[0].value);
            }
        }).finally(() => console.log("Промис VKWebAppStorageGet HCF_friend_stars завершён"));


    $('.js-galleryItem').on('click', function () {
        if ($(this).hasClass('galleryItem_open') && !$(this).hasClass('galleryItem_active')) {
            $('.galleryItem_active').removeClass('galleryItem_active');
            $(this).addClass('galleryItem_active');
            $('body').attr('data-bg', $(this).find('.galleryItem__cont').data('bg'));
        }
    });

    $('.js-btnHomeSmall').on('click', function () {
        $('.js-menuMainLevelBox').show();
        $('.js-btnHomeSmall').hide();
        $('.js-btnGallery').show();
        $('.js-galleryBox').hide();
    });

    $('.js-btnGallery').on('click', function () {
        $('.js-btnGallery').hide();
        $('.js-btnHomeSmall').show();
        $('.menuLevelBox').hide();
        $('.js-galleryBox').show();

        FN_check_gallery();
    });

    function FN_check_gallery() {
        let item = $('.js-galleryItem[data-points]');
        let stars = $('.menuStar').length + g_friend_stars;
        stars = 7; // + должно браться и стора (то что поделились друзья)

        $('.galleryNeed').remove();

        for (let i = 0; i < item.length; i++) {
            let needStar = parseInt(item.eq(i).attr('data-points'));

            let puzzleBackground = i + 1;
            let storageKey = 'puzzleBg_' + puzzleBackground;

            // +  пазлов в стор
            bridge.send("VKWebAppStorageGet", {"keys": [storageKey]})
                .then(result => {
                    let storageValue = result?.keys[0].value;

                    if (storageValue === "") {
                        storageValue = "0";
                    }

                    console.log('puzzleBg_' + puzzleBackground, parseInt(storageValue));
                    stars = parseInt(storageValue);
                    if (needStar <= stars) {
                        item.eq(i).addClass('galleryItem_open')
                    } else {
                        console.log(needStar, stars, item.eq(i));
                        item.eq(i).append('<div class="galleryNeed">Ещё ' + (needStar - stars) + '<span class="galleryPuzzle"></span></div>');
                    }
                }).finally(() => console.log("Промис 'puzzleBg_' завершён"));
            // -  пазлов в стор
        }
    }

    $(window).on('load', function () {
        document.onclick = startMusic;
        $('.js-mainBox').addClass('is--menuLevel-open');
        $('.js-menuMainLevelBox').show();
    });

    function currentTime() {
        return Date.now() / 1000 | 0;
    }

    function setCurrentEnergy(energyCount) {
        $('.js-energy_count').text(energyCount);
    }

    function energyCalculator(bonusEnergy) {

        bridge.send("VKWebAppStorageGet", {"keys": ['HCF_energy']})
            .then(result => {
                let energyStorageVal = parseInt(result?.keys[0].value);
                let energyVal;

                if (!isNaN(energyStorageVal)) {

                    // Получаем значение секунд накопленной энергии
                    let maxEnergy = ENERGY_MAX * ENERGY_DURATION * 60;
                    energyVal = (currentTime() - energyStorageVal);

                    if (energyVal >= maxEnergy) {
                        energyVal = 5;
                    } else {

                        // Имеющаяся энергия в виде дробного числа
                        let energyFullNumber = (energyVal / 60) / ENERGY_DURATION;
                        // Целое значение имеющейся энергии
                        energyVal = Math.floor(energyFullNumber);
                        // Вычисляем остаток секунд для таймера
                        let timerVal = Math.round((1 - (energyFullNumber - energyVal)) * ENERGY_DURATION * 60);

                        // Запускаем таймер, только если он еще не запущен
                        if (gTimer === 0) {
                            let display = document.querySelector('#time');
                            startTimer(timerVal, display);
                        }
                    }
                } else {
                    energyVal = 5;
                }
                if (bonusEnergy !== undefined) {
                    energyVal += bonusEnergy
                }
                setCurrentEnergy(energyVal);
            }).finally(() => console.log("Промис VKWebAppStorageGet HCF_energy завершён"));
    }

    energyCalculator();

    let gTimer = 0;

    function startTimer(duration, display) {

        $('.energy_timer').show();
        clearInterval(gTimer);

        let timer = duration;
        let minutes;
        let seconds;
        let currentEnergy;

        gTimer = setInterval(function () {

            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (--timer < 0) {

                // Перезагружаем таймер, но отнимаем 1с
                timer = ENERGY_DURATION * 60 - 1;
                currentEnergy = parseInt($('.js-energy_count').text());

                $('.js-energy_count').text(++currentEnergy);

                if (currentEnergy >= 5) {
                    removeTimer();
                }
            }
        }, 1000);
    }

    let removeTimer = () => {
        $('.energy_timer').hide();
        clearInterval(gTimer);
        gTimer = 0;
    }

    // Проверка видимости документа
    document.addEventListener('visibilitychange', function (event) {
        // not visible
        if (document.hidden) {
            removeTimer();
        } else {
            energyCalculator();
        }
    });


    // Проверка готовности рекламы
    bridge.send('VKWebAppCheckNativeAds', {ad_format: 'reward'})
        .then((data) => {
            if (data.result) {
                // Предзагруженная реклама есть.

                // Теперь можно создать кнопку
                // "Прокачать героя за рекламу".
                // ...
                $('.js-energy_add').show();
            } else {
                console.log('Рекламные материалы не найдены.');
                // Запрос на загрузку рекламных материалов может быть не выполнен. Обычно это происходит из-за низкой скорости интернет-соединения или кратковременных сбоев в работе сети.
            }
            // Чтобы обойти эту проблему, ваша игра может вызывать VKWebAppCheckNativeAds периодически, по таймеру, во время своей работы, чтобы гарантированно получить материалы ко времени показа.
        })
        .catch((error) => {
            console.log(error); /* Ошибка */
        });

    // Обработчик нажатия кнопки "Посмотрите рекламу, чтобы прокачать героя"
    function fooButtonClick() {
        // Показать рекламу
        bridge.send('VKWebAppShowNativeAds', {ad_format: 'reward'})
            .then((data) => {
                if (data.result) {
                    console.log('Реклама показана');
                    energyCalculator(1);
                    storageSetFN('HCF_energy', currentEnergyFN());
                } // Успех


                else // Ошибка
                    console.log('Ошибка при показе');
            })
            .catch((error) => {
                console.log(error); /* Ошибка */
            });
    }

    $('.js-energy_add').on('click', function () {
        fooButtonClick();
    })
});