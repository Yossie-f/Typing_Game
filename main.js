import Q_list from "./q_list.js" 
import Q_list2 from "./q_list2.js"
import r2h from './roma-hira.js'
// メイン部分
const StartKey = document.getElementById('start_key');  //スタートの表示
const Timer = document.getElementById('timer');  //制限時間
const ImageContainer = document.getElementById('image_container');
const Kana = document.getElementById('kana');//カナ
const Subject = document.getElementById('subject'); //問題(入力前)
const SubjectD = document.getElementById('subject_done'); //問題(入力済み)
const Meter = document.getElementById('meter'); //制限時間メーター
// 入力ステータス
const Shot = document.getElementById('shot'); //総入力数
const MissShot = document.getElementById('miss_shot');//ミス入力数
const ConsecutiveSuccess = document.getElementById('consecutive_success'); //連続入力成功数
const SuccessRate = document.getElementById('success_rate'); //成功率
const MaxSuccess = document.getElementById('max-success'); //最大連続成功数
const Mode = document.getElementById('mode'); //入力モード
const QMode = document.getElementById('q_mode');//難易度
const TimeSet = document.getElementById('time_set');  //制限時間設定欄
// 音声
const MusicItem = document.getElementById('music_item');  
const MusicState = document.getElementById('music_state');
const SoundItem = document.getElementById('sound_item');
const SoundState = document.getElementById('sound_state');
//ランク判定
const RankContainer = document.getElementById('rank_container');  
const rankImage = document.querySelector('#image'); //ランク判定の背景画像
const Next = document.getElementById('next'); //次に進む処理
const RankName = document.getElementById('rank_name');  //判定ランク名
const RankData = document.getElementById('rank_data');  //ランク関連情報


let q_select;       //ランダムに選ばれた問題を格納する
let q_length = 0;   //選ばれた問題の文字数
let q_index;        //入力している問題文の文字位置を表す
let q_mode = 1;

let set_time = 20;        //制限時間
let count = 0;            //単語の正解数をカウント
let shot_count;           //総入力数        
let miss_count;           //入力ミスをカウント
let consecutive_success;  //連続入力成功数
let max_success = 0;
let success_rate;
let accuracy_rank;  
let ave;                  //1分間入力文字数


let game_state = false;  //Game全体のステート(タイムアップ〜再開可能までの間をとるために設定している)
let state = false;     //入力判定の実行可否のステート
let p_state = false;   //キープッシュ状態のステート 押したらtrue
let char_state = true; //大文字か小文字の状態 trueで大文字
let m_state = false;   //音声のステート falseで鳴らさない
let s_state = false;   //効果音のステート falseで鳴らさない
let countdown;
let msct = 0; //nで間違えた時の判定用カウント
let back_music, back_music2, miss_sound;  //音声オブジェクト


TimeSet.focus();
for(var i = 0; i < 10; i++){
  document.getElementById(i).classList.add("push_me");
}
document.getElementById(' ').classList.add("push_me");

/* クリックして難易度設定 */
$('#q_mode').click(function () {
  q_mode++;
  if (q_mode > 2) {
    q_mode = 1;
  }
  switch (q_mode) {
    case 1:
      $(function () {
        $('#q_mode').text('かんたん モード');
        $('#q_mode').css({'background-color':'violet'});
      });
      break;
    case 2:
      $('#q_mode').text('ふつう モード');
      $('#q_mode').css({ 'background-color': 'yellow'});
      break;
  }
});

//バックミュージック再生メソッド
function backMusic(url){
  back_music = new Audio(url);
  if(m_state == false){
    back_music.muted = true;  //ミュートする
  }
  back_music.play();          //再生する
  return back_music;
}


/* 音楽, 鳴き声, 文字表示を切り替えるメソッド */
function switch_btn(e){ //引数eは入力されたキーの値
  //Shiftキーで音楽を制御
  switch (e.key) {
    case 'Shift':
      if (back_music.muted) {
        back_music.muted = false;   //音楽のミュートを解除
        back_music.play();
        MusicItem.style.backgroundColor = 'crimson';
        MusicState.textContent = 'きく';
        m_state = true;   //音楽の再生状態を表すための変数
      } else {
        back_music.muted = true;  //ミュートする
        MusicItem.style.backgroundColor = 'gray';
        MusicState.textContent = 'きかない';
        m_state = false;          //falseで再生されていない状態を表す
      }
      break;
    //Ctrlキーで効果音を制御
    case 'Control':
      if (s_state == false) {
        s_state = true;
        miss_sound.muted = false;
        SoundItem.style.backgroundColor = 'dodgerblue';
        SoundState.textContent = 'きく';
      } else {
        s_state = false;
        miss_sound.muted = true;
        SoundItem.style.backgroundColor = 'gray';
        SoundState.textContent = 'きかない';
      }
      break;
    //Altが押されたら文字モード切り替え
    case 'Alt':
      char_state = !char_state;
      if (char_state == true) {
        Mode.textContent = 'おおもじ モード';
        Mode.style.backgroundColor = "rgb(71, 200, 49)";
      } else {
        Mode.textContent = 'こもじ モード';
        Mode.style.backgroundColor = "rgb(49, 132, 200)";
      }
      //問題が生成されていない時や、ゲームが終了したならば、問題の表示は行わない
      if (typeof q_select !== 'undefined' && state == true) {
        //文字の大小をを切り替えて表示する
        SubjectD.textContent = char_state == true ? q_select.substring(0, q_index).toUpperCase() : q_select.substring(0, q_index);
        Subject.textContent = char_state == true ? q_select.substring(q_index).toUpperCase() : q_select.substring(q_index);
      }
      break;
  }
}


/*最初になる音楽を設定
（デフォルトで再生する設定だとエラーになるので、再生メソッドは使わない）*/
back_music = new Audio('./sounds/back_music/涼風薫る宵.mp3');
back_music.loop = true;
miss_sound = new Audio('./sounds/Cannon01-mp3/Motion-Fracture01-2.mp3');//鳴き声


//Gameスタートメソッド
window.addEventListener('keydown', start);
function start(event){
  //2つのステートはゲームスタート時にfalse、終了時にtrueとなる
  if(game_state == true ) { 
    return;
  //スペースキーが押された時にだけスタートする
  }else if(state == false && event.key === ' '){
    if(TimeSet.value < 10){
      resetA();
      backMusic('./sounds/back_music/涼風薫る宵.mp3');
      back_music.loop = true;

      swal("タイムは１０よりおおきくしてね。 ６０ でいい？", {
        buttons: {
          cancel: "いやだ",
          music: {
            text: "おんがく ききたい",
            value: "music",
          },
          defeat: "うん",
        },
      })
      .then((value) => {
        switch (value) {
          case "defeat":
            swal("６０ にしました。SPACE で はじめてね！");
            TimeSet.value = 60;
            break;
          case "music":
            swal("SHIFT と かいてある キー を おしてみて！");
            TimeSet.value = 60;
            break;
          default:
            swal("タイム をきめてね。 マウスでえらんで、↑ か ↓のキーを おすと かわるよ。");
            TimeSet.value = 60;
            TimeSet.focus();
        }
      });
      return;
    }
    for(var i = 0; i < 10; i++){
      document.getElementById(i).classList.remove("push_me");
    }
    document.getElementById(' ').classList.remove("push_me");
    game_state = true;
    resetA();
    resetB();    //全てのカウントの値と表示をリセット
    set_time = TimeSet.value;
    let time = set_time //デクリメント用に制限時間をコピー

    /* カウント用非同期処理
       sec:設定時間, count:カウントダウン開始時間 */ 
    function countDown(sec, CD, count, url) { 
      return new Promise(resolve => {
        let bool = true;  //カウントダウンの再生を繰り返さないための変数
        // タイムメーターを起動（メーターのwidthが変化していく）
        if(state == false){
          $(function(){
            $("#meter").css({
              'transition' : 'all ' + sec +  's linear 0ms',
              'width' : '100%' , 'background-color' : 'yellow',
            });
          });
        }else if(state == true){
          $(function(){
            $("#meter").css({
              'transition' : 'all ' + sec +  's linear 0ms',
              'width' : '0%' , 'background-color' : 'crimson',
            });
          });
        }
        //カウントダウン開始
        CD = setInterval(function(){
          Timer.textContent = --sec;          
          //設定タイミングで１度だけカウント音を再生する
          if(sec <= count && bool == true){
            backMusic(url);
            bool = false;
          }
          if(sec <= 0){
            clearInterval(CD);
            resolve();
          }
        }, 1000);
      });
    };

    // バックグラウンドの非同期処理（タイム管理）メソッド
    let st_countdown;
    async function timeManage () {
      // back_music.pause();
      await countDown(4, st_countdown, 4, './sounds/back_music/Countdown03-2.mp3'); //スタートまでのカウント
      Timer.textContent = 'スタート！！';
      initQ();        //問題文を初期化
      state = true;   //入力可能となる
      back_music2 = backMusic('/sounds/back_music/Chirping_Insect-Real_Ambi01-1.mp3');
      back_music2.loop = true;
      // タイミング調整用の待機時間
      await new Promise(resolve => setTimeout(resolve, 500));
      // 制限時間カウント開始
      await countDown(time, countdown, 5, './sounds/back_music/Countdown05-2.mp3'); //スタート〜終了までのカウント
      Timer.textContent = 'タイムアップ!!';
      finish();   //終了メソッド実行
    }  

    //タイム管理の非同期処理を実行
    timeManage(); 
    const meter = new Promise(resolve => setTimeout(resolve, 4000));
    meter.then();
  };
}


/* キーが押された時に毎回実行 */
window.addEventListener('keydown', push_key);
function push_key(e){
  switch_btn(e);
  let key_code = e.key.toLowerCase();
  //押されたキーが'Alt', 'Shift', 'Control'のいずれかなら処理を切り上げる（入力判定を行わない）
  if(!state || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Control'){
    return;
  } 
  //stateがtrueかつp_stateがfalseの時に以下が実行される
  shot_count++ ;
  Shot.textContent = 'おしたかず：' + shot_count ;

  //押したキーが正解で実行
  if(q_select.charAt(q_index) == key_code){
    //キーボードの色を戻す
    document.getElementById(q_select.charAt(q_index)).classList.remove("push_me");
    //金色にする
    document.getElementById(key_code).classList.add("sc_pressing");
    q_index++;
    consecutive_success++;
    // ConsecutiveSuccess.textContent = '連続成功数：' + consecutive_success ;
    if(max_success < consecutive_success){
      max_success = consecutive_success;
    }
    //押した文字より後ろの文字列だけ切り出して表示
    let sub = q_select.slice(q_index);
    Subject.textContent = char_state == true ? sub.toUpperCase() : sub;
    if(q_index > 0){
      //押した文字はdone側で表示させる(cssで色を変える) 
      let subD = q_select.substring(0, q_index);
      SubjectD.textContent = char_state == true ? subD.toUpperCase() : subD;
    }
    msct = 0;
    // p_state = true;
  

  //押したキーが間違っていた場合
  }else {
    //母音かyかを判定するメソッド
    function nJudge(char){
      let boin = ['a','i','u','e','o','y']
      for(var i=0; i < boin.length; i++){
        if(char == boin[i]){
          return true;
        }
      }
      return false;
    }
    //押したキーがn & msctが0以下 & 正解のキーが母音やyでない場合
    if(q_index != 0 && key_code == 'n' && msct <= 0 && !nJudge(q_select[q_index]))
    {
      //前のキーがnの場合ミスカウントしない
      if( q_select[q_index-1] == 'n'){
        msct++;
        //問題文にnを追加して表示させる
        let a = q_select.slice(0, q_index);
        let b = q_select.slice(q_index);
        q_select = a + 'n' + b;
        q_index++; 
        q_length++;
        consecutive_success++;
        let subD = q_select.substring(0, q_index);
        SubjectD.textContent = char_state == true ? subD.toUpperCase() : subD;
      }else{
        miss(key_code);
      }
    // 'ti' => 'chi' に変換
    }else if(key_code == 'c' && q_select[q_index] == 't' && q_select[q_index+1] == 'i'){
      let a = q_select.slice(0, q_index);
      let b = q_select.slice(q_index+1);
      q_select = a + 'ch' + b;
      q_index++;
      q_length++;
      consecutive_success++;
      let subD = q_select.substring(0, q_index);
      SubjectD.textContent = char_state == true ? subD.toUpperCase() : subD; 
      let sub = q_select.substring(q_index);
      Subject.textContent = char_state == true ? sub.toUpperCase() : sub; 
    // 'si' => 'shi' に変換
    }else if(key_code == 'h' && q_select[q_index] == 'i' && q_select[q_index-1] == 's'){
      let a = q_select.slice(0, q_index);
      let b = q_select.slice(q_index);
      q_select = a + 'h' + b;
      q_index++;
      q_length++;
      consecutive_success++;
      let subD = q_select.substring(0, q_index);
      SubjectD.textContent = char_state == true ? subD.toUpperCase() : subD; 
      let sub = q_select.substring(q_index);
      Subject.textContent = char_state == true ? sub.toUpperCase() : sub; 
    }else {
      miss(key_code);
    }
    // ConsecutiveSuccess.textContent = '連続成功数：' + consecutive_success ;
  }

  //入力を始めたら成功率を表示させる
  if(shot_count > 0){
    success_rate = Math.round(100-(miss_count / shot_count * 100)) ;
    SuccessRate.textContent = 'じょうずさ：' + success_rate + '％';
  }
  //単語を全部入力したら問題を初期化する
  if(q_length - q_index === 0 ){
    count++;
    initQ();   
  }else{
    // 次に押すべきキーの色を変える
    document.getElementById(q_select.charAt(q_index)).classList.add("push_me");
  }
}

//キーを離すと色が戻る
window.addEventListener('keyup', e => {
  // p_state = false;
    let key_code = e.key.toLowerCase();
    if(document.getElementById(key_code) != null){
      document.getElementById(key_code).classList.remove("pressing");
      document.getElementById(key_code).classList.remove("sc_pressing");
    }
});


function resetA(){
  RankContainer.classList.remove("appear");
  back_music.pause();
  // backMusic('./sounds/back_music/涼風薫る宵.mp3');
  Timer.textContent = '--';
  Subject.textContent = '';
  SubjectD.textContent = '';
  Kana.textContent = ''
  ImageContainer.style.backgroundImage = 'url(./image/back_image/top_image.jpg)';
  StartKey.textContent = 'タイムをきめたらSPACEをおしてね';
}
//リセットメソッドを定義
function resetB(){
  back_music.pause();
  backMusic('./sounds/back_music/Onoma-Inspiration08-3(Low-Delay).mp3');
  TimeSet.blur(); //フォーカスを外す
  Timer.textContent = '4';
  msct = 0;          
  count = 0;         //入力成功した単語数のカウントを０に
  shot_count = 0;    //入力総数を０に
  Shot.textContent = 'おしたかず：' + shot_count;
  miss_count = 0;    //ミス入力数を０に
  // MissShot.textContent = '入力ミス数：0'
  consecutive_success = 0;  //連続成功数
  // ConsecutiveSuccess.textContent = '連続成功数：' + consecutive_success ;
  max_success = 0;
  // MaxSuccess.textContent = '最高連続成功：0';
  SuccessRate.textContent = 'じょうずさ：0%';   //入力成功率の表示を消す
  SubjectD.textContent = 'はじまるよ！';
  Subject.textContent = '';
  Kana.textContent = 'READY?'
  StartKey.textContent = '';      //スペースキーを押せの表示を消す
}


//問題の初期化
function initQ() {
  const rnd = Math.floor(Math.random() * (q_mode == 1 ? Q_list.length : Q_list2.length));  //問題の選出（ランダム）
  // console.log(rnd);
  q_select = q_mode==1 ? Q_list[rnd] : Q_list2[rnd];       //選ばれた問題を格納
  // console.log(q_select);
  q_length = q_select.length;   //選ばれた問題の文字数を格納
  q_index = 0;
  SubjectD.textContent = '';  //入力済み欄の表示を消す
  Subject.textContent = char_state == true ? q_select.toUpperCase() : q_select;   //問題を表示
  Kana.textContent = r2h(q_select); //問題のカナを表示
  if (q_mode == 1) { 
    ImageContainer.style.backgroundImage = 'url(./image/easy-mode/' + q_select + '.jpg)';
  } else {
    ImageContainer.style.backgroundImage = 'url(./image/' + q_select + '.jpg)';
  }
  document.getElementById(q_select.charAt(q_index)).classList.add("push_me");   //次に押すキーの色を変える
  // Form.input.focus();   //フォーカスを入力欄にセット
  // Form.input.value = '';  //入力欄を空にする
}


// 入力ミスメソッド
function miss(key_code){
  //間違えて押したキーの色を変更
  if(document.getElementById(key_code) != null){ 
    document.getElementById(key_code).classList.add("pressing");
  }
  //ミス音を鳴らす
  let rand = Math.floor(Math.random() * 40);
  miss_sound = new Audio('sounds/miss_sounds/' + rand + '.mp3');
  if(s_state == false){
    miss_sound.muted = true;
  }
  miss_sound.play();
  //カウントと表示を変更
  miss_count++ ;
  // MissShot.textContent = '入力ミス数：' + miss_count ;
  if(max_success < consecutive_success){
    max_success = consecutive_success;
    // MaxSuccess.textContent = '最高連続成功：' + max_success;
  }
  consecutive_success = 0;  
  // ConsecutiveSuccess.textContent = '連続成功数：' + consecutive_success ;
}


//終了判定メソッド
function finish() {
  //clearInterval関数はカウントタイマーのセットされた変数を引数とし、その繰り返しを終わらせる
  // clearInterval(countdown);
  state = false;  //stateをfalseにする(ボタンを押しても何も起こらなくなる)
  // MaxSuccess.textContent = '最高連続成功：' + max_success;
  //次に入力しないといけないキーボードの色を戻す
  document.getElementById(q_select.charAt(q_index)).classList.remove("push_me");
  let speed_rank;   //ランク判定格納用
  speed_rank = rankJudge(shot_count, miss_count, set_time);
  rankImage.style.backgroundImage = 'url(./image/rank_image/' + speed_rank[0] + '.jpg)';
  document.getElementById('average').textContent =  Math.round(ave/60*10)/10;
  RankName.textContent = r2h(speed_rank[0]) ;
  RankData.textContent = r2h(speed_rank[0]) + 'の' + speed_rank[1];
  //文字表示させる
  setTimeout(function(){Kana.textContent = 'はんてい します・・・'; }, 1000);
  setTimeout(function(){Subject.textContent = 'よくできました!!'; }, 1000);
  setTimeout(function(){SubjectD.textContent = ''; }, 1000);
  //ランク判定を表示させる
  setTimeout(function(){
    RankContainer.classList.add("appear");
    back_music2.pause();
    backMusic('./sounds/back_music/bo-tto hidamari.mp3');
    back_music.loop = true;
  }, 2500);
  // StartKey.textContent = ' SPACEでもういちど';
  //game_stateをfalseにすることで再びスタートメソッドが実行できる
  setTimeout(function () {
    TimeSet.focus();
    game_state = false;
  },3500);
}


/* ランク判定メソッド */
function rankJudge(sht, ms, stm){
  if(sht <= 0){
    ave = 0;
  }else{
    ave = Math.round((sht - ms) / stm * 60 * (success_rate/100));
  }
  let spd;
  if(ave >= 450){
    spd = ['gunkandori', '滑空速度：400km']
  }else if(ave >= 360){
    spd = ['amatubame', '滑空速度：320km']
  }else if(ave >= 300){
    spd = ['hayabusa', '滑空速度：300km']
  }else if(ave >= 270){
    spd = ['kumataka', '滑空速度：250km']
  }else if(ave >= 240){
    spd = ['inuwashi', '滑空速度：240km']
  }else if(ave >= 220){
    spd = ['mekishikoohikikoumori', '最高飛行速度：160km']
  }else if(ave >= 200){
    spd = ['chi-ta-', '最高速度：120km']
  }else if(ave >= 170){
    spd = ['supuringubokku', '最高速度：100km']
  }else if(ave >= 155){
    spd = ['kulo-ta-ho-su', '最高速度：88km']
  }else if(ave >= 140){
    spd = ['raionn', '最高速度：80km']
  }else if(ave >= 130){
    spd = ['jakkuusagi', '最高速度：72km']
  }else if(ave >= 120){
    spd = ['dachou', '走る 速さ：70km']
  }else if(ave >= 110){
    spd = ['tomusongazeru', '走る 速さ：68km'] 
  }else if(ave >= 100){
    spd = ['rakuda', '走る 速さ：65km']
  }else if(ave >= 90){
    spd = ['tora', '走る 速さ：60km']
  }else if(ave >= 80){
    spd = ['gurizuri-', '走る 速さ：56km']
  }else if(ave >= 70){
    spd = ['kirinn', '走る はやさ：51km']
  }else if(ave >= 60){
    spd = ['afurikazou', '走る はやさ：40km']
  }else if(ave >= 50){
    spd = ['burakkumanba', '走る はやさ：25km']
  }else if(ave >= 40){
    spd = ['suzumebachi', 'とぶ はやさ：22km']
  }else if(ave >= 35){
    spd = ['komodoootokage', 'はしる はやさ：20km']
  }else if(ave >= 30){
    spd = ['niwatori', 'はしる はやさ：14km']
  }else if(ave >= 25){
    spd = ['jentu-penginn', 'はしる はやさ：10km']
  }else if(ave >= 20){
    spd = ['hanmyou', 'はしる はやさ：8km']
  }else if(ave >= 15){
    spd = ['zougame', 'あるく はやさ：3km']
  }else if(ave >= 10){
    spd = ['namakemono', 'あるく はやさ：0.2km']
  }else{
    spd = ['ryuuguusakurahitode', 'うごく はやさ：0.05km']
  }
  return spd;
}







