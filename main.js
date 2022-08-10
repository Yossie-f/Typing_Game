const Subject = document.getElementById('subject');    //タグのidからノードを取得し、定数に代入する('Subject');   
const SubjectD = document.getElementById('subject_done');
//問題や判定を表示させる <h1>のノード
const Timer = document.getElementById('timer');       //制限時間を表示させる <p>のノード
const Form = document.forms.typing;          //name属性がtypingの<form>内の要素にアクセス
const Shot = document.getElementById('shot');
const MissShot = document.getElementById('miss_shot');
const SuccessRate = document.getElementById('success_rate');
const StartKey = document.getElementById('start_key');



//文字列配列で問題のリストを用意
const Q_list = [    
  // 'Hello World',
  // 'Good',
  // 'I love JavaScript',
  // 'This is MyApp',
  // 'Welcome',
  // 'art',
  // 'beet',
  // 'cute',
  // 'die',
  // 'enderman',
  // 'foolcool',
  'qqqqq',
  'wwwww',
];

let q_select;       //ランダムに選ばれた問題を格納する
let q_length = 0;   //選ばれた問題の文字数
let q_index;    //入力している問題文の文字位置を表す

let time;      //制限時間を設定
let count = 0;      //単語の正解数をカウント
let shot_count;
let miss_count;       //入力ミスをカウント

//ボタンのクリックイベントの可不可を制御するための変数
let state = false;   //
let countdown;

let key_code;


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
      Timer.textContent = 'のこりじかん：' + --time ; //タイマーのテキストに制限時間をセットしてデクリメントする
      if(time <= 0) {
        finish(); //繰り返しデクリメントの結果timeが0になったらfinish()関数を実行
      }  
    }, 1000);  
  }
}


/*
問題文を１字ずつ赤色に変更する処理
キーが押された時に実行
*/

  window.addEventListener('keydown', push_key);
  function push_key(e){
    key_code = e.key;
    if(!state){
      return;
    }
    console.log('miss_count1=' + miss_count);
    console.log('shot_count1=' + shot_count);

    shot_count++ ;
    Shot.textContent = 'できたかず：' + shot_count ;
    console.log('miss_count2=' + miss_count);
    console.log('shot_count2=' + shot_count);

    

    if(q_select.charAt(q_index) == key_code){
      q_index++;
      Subject.textContent = q_select.slice(q_index);
      if(q_index > 0){
        SubjectD.textContent = q_select.substring(0, q_index);
      }
    }else {
      miss_count++ ;
      MissShot.textContent = 'ミス：' + miss_count ;
      console.log('miss_count3=' + miss_count);
      console.log('shot_count3=' + shot_count);
    }
    if(shot_count > 0){
      SuccessRate.textContent = 'せいこうりつ：' + Math.round(100-(miss_count / shot_count * 100)) + '％';
      console.log('miss_count4=' + miss_count);
      console.log('shot_count4=' + shot_count);
    }

    //入力したキーの色変更メソッド
    document.getElementById(key_code).classList.add("pressing");

    if(q_length - q_index === 0 ){
      count++;
      init();   //全部入力したら問題を初期化
    }
  }



function changeColor(){
  
}


//リセットメソッドを定義
function reset(){
  time = 10;          //制限時間をセット
  count = 0;          //入力成功した単語数のカウントを０に
  shot_count = -1;    //入力総数を０に
  miss_count = -1;    //ミス入力数を０に
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
  SubjectD.textContent = '';
  //フォーカスを入力欄に
  Form.input.focus();       //デフォルトでinput要素にキーボード入力できようフォーカスを設定
  //入力欄を空にする
  // Form.input.value = '';              //<form>のname属性がinputの要素のvalueに空文字を代入
}


//タイマー終了メソッド
function finish() {
  //clearInterval関数はカウントタイマーのセットされた変数を引数とし、その繰り返しを終わらせる
  clearInterval(countdown);
  state = false;  //stateをfalseにする(ボタンを押しても何も起こらなくなる)
  Timer.textContent = 'じかんぎれです';
  setTimeout(function(){ SubjectD.textContent = ''; },1500);
  setTimeout(function(){ Subject.textContent = 'しゅうりょう！' }, 1500);  //subjectに文字列をセットし表示させる
  setTimeout(function(){ StartKey.textContent = ' SPACEでもういちど '; },3000);
  
}







