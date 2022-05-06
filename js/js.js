
$(document).ready(function() {

let m=[],
    n=[];
let area=4;
const position_1 = ['top', 'center', 'bottom'];
const position_2 = ['right', 'center', 'left'];

    Array.prototype.random = function () {
        return this[Math.floor((Math.random()*this.length))];
    }

    function start(area){
        $('.m_content ul').html('');

        icount=area*area;
        for(i=0;i<icount/2;i++){
            n = m.push(i+1);
            n = m.push(i+1);
        }

        var newcount = icount-2;
        var newMass = [];
        for(i=0;i<icount;i++){
            newm = m;
            rand=Math.floor((Math.random()*newcount)+1);
            removed = newm.splice(rand,1);
            n = newm.shift();
            t = newm.push(n);
            n = newMass.push(removed[0]);
            $('.m_content ul').append('<li><div class="li"><div class="bg"></div><div class="block" style="background-image: url(./img/pet/'+removed[0]+'.png)">'+removed[0]+'</div></div></li>');
            newcount--;
        }

        $('.m_content ul').css('width', $('.m_content ul li').outerWidth()*area);


        $('.m_content ul').css('background-position', position_1.random()+' '+position_2.random());

    }


    $('.size').change(function(){
        opt = $(this).val();
        val = $(this).find('option').eq(opt-1).text();
        start(val);
        viewElements();
    });

    $('.m_content ').on('click', '.li', function(e){
        e.preventDefault();
        ithis = $(this);
        parent = ithis.closest('.m_content');
        if(!(ithis.hasClass('clear') )){
            if( !( parent.hasClass('locked') )){
                ithis.addClass('active');

                if( $('.m_content .li.active').size() == 2 ){
                    $('.li.active:first').addClass('first');
                    $('.li.active:last').addClass('last');
                    setTimeout(function(){ check(); }, 500);
                }
                if( $('.m_content .li.active').size() == 3 ){
                    $('.li.first, .li.last').removeClass('active first last');
                }
            }
        }
    });

    function check(){
        if($('.li.active.first').text()==$('.li.active.last').text()){
            $('.li.first, .li.last').addClass('clear').animate({
                fontSize: "0em"
            }, 500);
        }
        setTimeout(function(){
            $('.li.first, .li.last').removeClass('active first last');
        }, 600);
        checkCompleate();
    };

    function checkCompleate(){
        if(($('.li.clear').size()==$('.li').size())){
            $('.m_content li').animate({
                opacity:0
            }, 700);
        }
    };

    function viewElements(){
        isize =  $('.m_content li').size();

        var i=0;


        setInterval(function(){

            asd(i);
            i++
        }, 300);

        function asd(i){
            $('.m_content li').eq(i).find('.li').addClass('active');
            setTimeout(function(){
                $('.m_content li').eq(i).find('.li').removeClass('active');
            }, 700);
        }




    }
    $(window).load(function(){
        start(area);
        viewElements();
    });

})