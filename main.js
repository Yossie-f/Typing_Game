const Subject = document.getElementById('subject');    //タグのidからノードを取得し、定数に代入する('Subject');   
//問題や判定を表示させる <h1>のノード
const Timer = document.getElementById('timer');       //制限時間を表示させる <p>のノード
const Form = document.forms.typing;          //name属性がtypingの<form>内の要素にアクセス


//文字列配列で問題のリストを用意
const Q_list = [    
  'Hello World',
  'Good',
  'I love JavaScript',
  'This is MyApp',
  'Welcome'
];

//変数で制限時間を設定
let time = 20;      //制限時間をカウントする変数
let count = 0;      //正解数をカウントする変数
//ボタンのクリックイベントの可不可を制御するための変数
let state = true;   //初期値はtrue


//定数countdownにタイマーを設定
  //setInterval()の第1引数は繰り返し実行する関数、第2引数は繰り返し実行の待ち時間(1秒)
const Countdown = setInterval(function() {
  Timer.textContent = '制限時間：' + time-- + '秒'; //タイマーのテキストに制限時間をセットしてデクリメントする
  if(time < 0) finish();   //繰り返しデクリメントの結果timeが0になったらfinish()関数を実行
}, 1000);

//終了関数
function finish() {
  //clearInterval関数はカウントタイマーのセットされた変数を引数とし、その繰り返しを終わらせる
  clearInterval(Countdown);
  Subject.textContent = '正解数は' + count + '個でした！';  //subjectに文字列をセットし表示させる
  state = false;  //stateをfalseにする(ボタンを押しても何も起こらなくなる)
}




//初期化関数
function init() {
  //0〜4をランダムに生成し代入
  const rnd = Math.floor(Math.random() * Q_list.length);  //floor関数で切捨て調整
  //<h1>のテキスト要素に問題を代入
  Subject.textContent = Q_list[rnd];  //問題リスト配列の要素番号にランダム整数を指定して呼び出し
  Form.input.value = '';                //<form>のname属性がinputの要素のvalueに空文字を代入
  Form.input.focus();       //デフォルトでinput要素にキーボード入力できるようフォーカスを設定
}

//ボタンを押すと実行する設定
//<Form>のname属性btnに、イベントリスナーをセット
  //第1引数にイベント, 第2引数に実行する関数を渡す
Form.btn.addEventListener('click', function(e) {
  if(!state) return;  //stateがもしfalseならreturnで関数処理を終わらせる(ボタンを押しても何も起こらない)
  //inputに入力されたvalueとsubjectに代入されているテキストが一致(正解)すれば
  if(Form.input.value === Subject.textContent) {
    count++;  //countをインクリメント
    init();   //初期化関数を実行
  } else {    //入力に間違いがあれば
    Subject.textContent = '間違いです！';   //subjectのテキストに間違いと表示させる
    setTimeout(function(){ init(); },1000)   //第2引数の秒数待って第1引数の関数(初期化)を実行
  }
});

init();   //初期化実行






