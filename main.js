const Kana = document.getElementById('kana');//カナ
const Subject = document.getElementById('subject'); //問題(入力前)
const SubjectD = document.getElementById('subject_done'); //問題(入力済み)
const Timer = document.getElementById('timer');  //制限時間
const Shot = document.getElementById('shot'); //総入力数
const MissShot = document.getElementById('miss_shot');//ミス入力数
const ConsecutiveSuccess = document.getElementById('consecutive_success'); //連続入力成功数
const SuccessRate = document.getElementById('success_rate'); //成功率
const MaxSuccess = document.getElementById('max-success'); //最大連続成功数
const StartKey = document.getElementById('start_key');  //スタートの表示

const RankContainer = document.getElementById('rank_container');  //ランク判定
const Image = document.getElementById('image'); //ランク判定の背景画像
const Next = document.getElementById('next'); //次に進む処理
const RankName = document.getElementById('rank_name');  //判定ランク名
const RankData = document.getElementById('rank_data');  //ランク関連情報



//文字列配列で問題のリストを用意
const Q_list = [    
  'kuroooari',
  'kendama',
  'samuraiari',
  'rakko',
  'shachi',
  'keitaidenwa',
  'ameiroari',
  'akayamaari',
  'amimeari',
  'kuroooari',
  'muneakaooari',
];

let q_select;       //ランダムに選ばれた問題を格納する
let q_length = 0;   //選ばれた問題の文字数
let q_index;    //入力している問題文の文字位置を表す

let set_time = 10;  //制限時間
let count = 0;      //単語の正解数をカウント
let shot_count;     //総入力数
let miss_count;     //入力ミスをカウント
let consecutive_success;  //連続入力成功数
let max_success = 0;
let success_rate;
let accuracy_rank;

let game_state = false;   //Game全体のステート(タイムアップ〜再開可能までの間をとるために設定している)
let state = false;    //入力判定の実行可否のステート
let p_state = false;  //キープッシュ状態のステート 押したらtrue
let countdown;
let msct = 0; //nで間違えた時の判定用カウント




//Gameスタートメソッド
window.addEventListener('keydown', start);
function start(event){
  if(state == true || game_state == true) {
    return;
  //スペースキーが押された時にだけスタートする
  }else if(state == false && event.key === ' '){
    game_state = true;
    reset();    //全てのカウントの値と表示をリセット
    let time = set_time //デクリメント用の制限時間を用意

    //カウント用非同期メソッド
    function countDown(sec, CD) {
      return new Promise(resolve => {
        CD = setInterval(function(){
          Timer.textContent = --sec;
          if(sec <= 0){
            clearInterval(CD);
            console.log('非同期処理終わり');
            resolve();
          }
        }, 1000);
      });
    };

    let st_countdown;
    console.log('miss_count1');

    // バックグラウンドの非同期処理（タイム管理）メソッド
    async function timeManage () {
      await countDown(4, st_countdown); //スタートまでのカウント
      Timer.textContent = 'スタート！！';
      init();     //問題文を初期化
      state = true;
      await countDown(time, countdown); //スタート〜終了までのカウント
      finish();   //終了メソッド実行
      }  

      //タイム管理の非同期処理を実行
      timeManage(); 
    };
}


/* キーが押された時に毎回実行 */
window.addEventListener('keydown', push_key);
function push_key(e){
  let key_code = e.key.toLowerCase();
  if(!state && !p_state){
    return;
  } 
  //stateがtrueかつp_stateがtrueの時に以下が実行される
  shot_count++ ;
  Shot.textContent = '入力総数：' + shot_count ;

  //押したキーが正解で実行
  if(q_select.charAt(q_index) == key_code){
    //キーボードの色を戻す
    document.getElementById(q_select.charAt(q_index)).classList.remove("push_me");
    //金色にする
    document.getElementById(key_code).classList.add("sc_pressing");
    q_index++;
    consecutive_success++;
    ConsecutiveSuccess.textContent = '連続成功数：' + consecutive_success ;
    if(max_success < consecutive_success){
      max_success = consecutive_success;
    }
    //押した文字より後ろの文字列だけ切り出して表示
    Subject.textContent = q_select.slice(q_index);
    if(q_index > 0){
      //押した文字はdone側で表示させる(cssで色を変える) 
      SubjectD.textContent = q_select.substring(0, q_index);
    }
    p_state = true;

  //押したキーが間違っていた場合
  // }else {
  //   if(key_code == 'n' && msct < 1){
  //     if(q_select[q_index]){

  //     }
  }else {
    if(document.getElementById(key_code) != null){ 
      document.getElementById(key_code).classList.add("pressing");
    }
    miss();
    p_state = true;
  }

  //入力を始めたら成功率を表示させる
  if(shot_count > 0){
    success_rate = Math.round(100-(miss_count / shot_count * 100)) ;
    SuccessRate.textContent = '成功率：' + success_rate + '％';
  }
  //単語を全部入力したら問題を初期化する
  if(q_length - q_index === 0 ){
    count++;
    init();   
  }else{
    // 次に押すべきキーの色を変える
    document.getElementById(q_select.charAt(q_index)).classList.add("push_me");
  }
}

//キーを離すと色が戻る
window.addEventListener('keyup', e => {
    let key_code = e.key.toLowerCase();
    if(document.getElementById(key_code) != null){
      document.getElementById(key_code).classList.remove("pressing");
      document.getElementById(key_code).classList.remove("sc_pressing");
    }
    p_state = false;
});


//リセットメソッドを定義
function reset(){
  RankContainer.classList.remove("appear");
  count = 0;          //入力成功した単語数のカウントを０に
  shot_count = 0;    //入力総数を０に
  Shot.textContent = '入力総数：' + shot_count;
  miss_count = 0;    //ミス入力数を０に
  MissShot.textContent = '入力ミス数：0'
  consecutive_success = 0;  //連続成功数
  ConsecutiveSuccess.textContent = '連続成功数：' + consecutive_success ;
  max_success = 0;
  MaxSuccess.textContent = '最高連続成功：0';
  SuccessRate.textContent = '成功率：0%';   //入力成功率の表示を消す
  SubjectD.textContent = 'ここに問題が出ます';
  Subject.textContent = '';
  Kana.textContent = 'Ready?';
  StartKey.textContent = '';      //スペースキーを押せの表示を消す
}


//問題の初期化
function init() {
  const rnd = Math.floor(Math.random() * Q_list.length);  //問題の選出（ランダム）
  q_select = Q_list[rnd];       //選ばれた問題を格納
  q_length = q_select.length;   //選ばれた問題の文字数を格納
  q_index = 0;
  Subject.textContent = q_select;   //問題を表示
  Kana.textContent = r2h(q_select); //問題のカナを表示
  document.getElementById(q_select.charAt(q_index)).classList.add("push_me");   //次に押すキーの色を変える
  SubjectD.textContent = '';  //入力済み欄の表示を消す
  // Form.input.focus();   //フォーカスを入力欄にセット
  // Form.input.value = '';  //入力欄を空にする
}


// 入力ミスした時の処理
function miss(){
  miss_count++ ;
  MissShot.textContent = '入力ミス数：' + miss_count ;
  //最大連続成功数を更新する
  if(max_success < consecutive_success){
    max_success = consecutive_success;
    MaxSuccess.textContent = '最高連続成功：' + max_success;
  }
  //連続入力成功数を０にする
  consecutive_success = 0;  
  ConsecutiveSuccess.textContent = '連続成功数：' + consecutive_success ;
}


//タイマー終了メソッド
function finish() {
  //clearInterval関数はカウントタイマーのセットされた変数を引数とし、その繰り返しを終わらせる
  // clearInterval(countdown);
  state = false;  //stateをfalseにする(ボタンを押しても何も起こらなくなる)
  Timer.textContent = 'タイムアップ!!';
  MaxSuccess.textContent = '最高連続成功：' + max_success;
  
  let speed_rank;
  speed_rank = rankJudge(shot_count, miss_count, set_time);
  
  //subjectに文字列をセットし表示させる
  setTimeout(function(){Kana.textContent = '判定します・・・'; }, 1000);
  //ランク判定を表示させる
  setTimeout(function(){RankContainer.classList.add("appear");}, 2000);
  RankName.textContent = speed_rank[0] + ' ' + '級';
  RankData.textContent = speed_rank[0] + 'の' + speed_rank[1];
  StartKey.textContent = ' SPACEでもういちど';
  //game_stateをfalseにすることで再びスタートメソッドが実行できる
  setTimeout(function(){ game_state = false},3500);
  //次に入力しないといけないキーボードの色を戻す
  document.getElementById(q_select.charAt(q_index)).classList.remove("push_me");
}

//母音か判定するメソッド
function boinJudge(char){
  let boin = ['a','i','u','e','o']
  for(var x in boin){
    if(char == x){
      return true;
    }
  }
  return false;
}



function rankJudge(sht, ms, stm){
  let ave = (sht - ms) / stm * 60 * (success_rate/100);
  let spd;
  if(ave >= 400){
    spd = ['グンカンドリ', '滑空速度：400km']
  }else if(ave >= 320){
    spd = ['アマツバメ', '滑空速度：320km']
  }else if(ave >= 300){
    spd = ['ハヤブサ', '滑空速度：300km']
  }else if(ave >= 250){
    spd = ['クマタカ', '滑空速度：250km']
  }else if(ave >= 240){
    spd = ['イヌワシ', '滑空速度：240km']
  }else if(ave >= 200){
    spd = ['メキシコオヒキコウモリ', '最高速度：160km']
  }else if(ave >= 180){
    spd = ['チーター', '最高速度：120km']
  }else if(ave >= 150){
    spd = ['スプリングボック', '最高速度：100km']
  }else if(ave >= 130){
    spd = ['クォーターホース', '最高速度：88km']
  }else if(ave >= 110){
    spd = ['ライオン', '最高速度：80km']
  }else if(ave >= 100){
    spd = ['ジャックウサギ', '最高速度：72km']
  }else if(ave >= 90){
    spd = ['ダチョウ', '走る速さ：70km']
  }else if(ave >= 75){
    spd = ['トムソンガゼル', '走る速さ：68km'] 
  }else if(ave >= 70){
    spd = ['ラクダ', '走る速さ：65km']
  }else if(ave >= 65){
    spd = ['トラ', '走る速さ：60km']
  }else if(ave >= 60){
    spd = ['グリズリー', '走る速さ：56km']
  }else if(ave >= 55){
    spd = ['キリン', '走る速さ：51km']
  }else if(ave >= 50){
    spd = ['アフリカゾウ', '走る速さ：40km']
  }else if(ave >= 45){
    spd = ['ブラックマンバ', '走る速さ：25km']
  }else if(ave >= 35){
    spd = ['スズメバチ', '飛ぶ速さ：22km']
  }else if(ave >= 25){
    spd = ['ニワトリ', '走る速さ：14km']
  }else if(ave >= 15){
    spd = ['ジェンツーペンギン', '歩く速さ：10km']
  }else{
    spd = ['ハンミョウ', '走る速さ：8km']
  }
  return spd;
}






