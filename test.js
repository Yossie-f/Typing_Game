const timeManage = async () => {
  await new Promise(resolve => st_countdown = setInterval(function() {
    Timer.textContent = --sec;
    if(sec <= 0){
      Timer.textContent = 'スタート！！';
      clearInterval(st_countdown);
    }
  }, 1000)).then(()=>{
  await new Promise(resolve => countdown = setInterval(function() {
    Timer.textContent =  --time ; 
    if(time <= 0) {
      finish(); 
    }  
  }, 1000));
});
};