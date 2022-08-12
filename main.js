const Subject = document.getElementById('subject');    //タグのidからノードを取得し、定数に代入する('Subject');   
const SubjectD = document.getElementById('subject_done');  //問題や判定を表示させる <h1>のノード
const Timer = document.getElementById('timer');  //制限時間を表示させる <p>のノード
const Form = document.forms.typing;   //name属性がtypingの<form>内の要素にアクセス
const Shot = document.getElementById('shot');
const MissShot = document.getElementById('miss_shot');
const ConsecutiveSuccess = document.getElementById('consecutive_success');
const SuccessRate = document.getElementById('success_rate');
const MaxSuccess = document.getElementById('max-success');
const StartKey = document.getElementById('start_key');


//文字列配列で問題のリストを用意
const Q_list = [    
  'hello',
  'good',
  'love',
  'this',
  'welcome',
  'art',
  'beet',
  'cute',
  'die',
  'enderman',
  'qqqqq',
  'wwwww',
];

let q_select;       //ランダムに選ばれた問題を格納する
let q_length = 0;   //選ばれた問題の文字数
let q_index;    //入力している問題文の文字位置を表す

let time;      //制限時間を設定
let count = 0;      //単語の正解数をカウント
let shot_count;     //総入力数
let miss_count;     //入力ミスをカウント
let consecutive_success;  //連続入力成功数
let max_success;

/*ボタンのクリックイベントの可不可を制御するための変数
true で*/
let state = false;   
let countdown;



//Gameスタートメソッド
window.addEventListener('keydown', start);
function start(event){
  if(state == true){
    return;
  }else if(state == false && event.key === ' '){
    state = true;

    reset();    //全てのカウントの値と表示をリセット
    init();     //問題文を初期化
    console.log('miss_count0=' + miss_count);
    console.log('shot_count0=' + shot_count);

    /*カウントダウン開始
    setInterval()の第1引数は繰り返し実行する関数、第2引数は繰り返し実行の待ち時間(1秒)*/
    countdown = setInterval(function() {
      Timer.textContent =  --time ; //タイマーのテキストに制限時間をセットしてデクリメントする
      if(time <= 0) {
        finish(); //繰り返しデクリメントの結果timeが0になったらfinish()関数を実行
      }  
    }, 1000);  
  }
}


/* 問題文を１字ずつ赤色に変更する処理
キーが押された時に実行 */
  window.addEventListener('keydown', push_key);
  function push_key(e){
    let key_code = e.key.toLowerCase();
    if(!state){
      return;
    }
    console.log('miss_count1=' + miss_count);
    console.log('shot_count1=' + shot_count);

    shot_count++ ;
    Shot.textContent = '入力総数：' + shot_count ;
    console.log('miss_count2=' + miss_count);
    console.log('shot_count2=' + shot_count);

    //押したキーがあっていれば実行
    if(q_select.charAt(q_index) == key_code){
      //キーボードの色を戻す
      document.getElementById(q_select.charAt(q_index)).classList.remove("push_me");
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
    //押したキーが間違っていた場合
    }else {
      miss_count++ ;
      MissShot.textContent = '入力ミス数：' + miss_count ;
      console.log('miss_count3=' + miss_count);
      console.log('shot_count3=' + shot_count);
      //最大連続成功数を更新する
      if(max_success < consecutive_success){
        max_success = consecutive_success;
      }
      //連続入力成功数を０にする
      consecutive_success = 0;  
      ConsecutiveSuccess.textContent = '連続成功数：' + consecutive_success ;
    }
    //入力を始めたら成功率を表示させる
    if(shot_count > 0){
      SuccessRate.textContent = '成功率：' + Math.round(100-(miss_count / shot_count * 100)) + '％';
      console.log('miss_count4=' + miss_count);
      console.log('shot_count4=' + shot_count);
    }
    //単語を全部入力したら問題を初期化する
    if(q_length - q_index === 0 ){
      count++;
      init();   
    }else{
      document.getElementById(q_select.charAt(q_index)).classList.add("push_me");
    }
  }


//入力したキーの色変更メソッド
// キーを押すと色が変わる
window.addEventListener('keydown', e => {
    let key_code = e.key.toLowerCase();
    document.getElementById(key_code).classList.add("pressing");
});
//キーを離すと色が戻る
window.addEventListener('keyup', e => {
    let key_code = e.key.toLowerCase();
    document.getElementById(key_code).classList.remove("pressing");
});


//リセットメソッドを定義
function reset(){
  time = 10;          //制限時間をセット
  count = 0;          //入力成功した単語数のカウントを０に
  shot_count = -1;    //入力総数を０に
  miss_count = -1;    //ミス入力数を０に
  consecutive_success = 0;
  max_success = 0;
  SuccessRate.textContent = '';   //入力成功率の表示を消す
  StartKey.textContent = '';      //スペースキーを押せの表示を消す
}


//問題の初期化
function init() {
  //問題の選出（ランダム）
  const rnd = Math.floor(Math.random() * Q_list.length);  //0〜4をランダムに生成し代入 //floor関数で切捨て調整
  q_select = Q_list[rnd];       //選ばれた問題を格納
  q_length = q_select.length;   //選ばれた問題の文字数を格納
  q_index = 0;
  //<h1>のテキスト要素に問題をセット
  Subject.textContent = q_select;  //問題リスト配列の要素番号にランダム整数を指定して呼び出し


  document.getElementById(q_select.charAt(q_index)).classList.add("push_me");
  SubjectD.textContent = '';
  //フォーカスを入力欄にセット
  Form.input.focus(); 
  //入力欄を空にする
  Form.input.value = '';              //<form>のname属性がinputの要素のvalueに空文字を代入
}


//タイマー終了メソッド
function finish() {
  //clearInterval関数はカウントタイマーのセットされた変数を引数とし、その繰り返しを終わらせる
  clearInterval(countdown);
  state = false;  //stateをfalseにする(ボタンを押しても何も起こらなくなる)
  Timer.textContent = 'タイムアップ!!';
  //subjectに文字列をセットし表示させる
  setTimeout(function(){ SubjectD.textContent = ''; },500);
  setTimeout(function(){ Subject.textContent = '終わり！' }, 500);  
  setTimeout(function(){ MaxSuccess.textContent = '最大成功数：' + max_success});
  setTimeout(function(){ StartKey.textContent = ' SPACEでもういちど '; },3000);
  //次に入力しないといけないキーボードの色を戻す
  document.getElementById(q_select.charAt(q_index)).classList.remove("push_me");

}







