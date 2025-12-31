//                            HOUR SCRIPT
// ----------------------------------------------------------------
window.onload = function() {
  clock();  
    function clock() {
    let now = new Date();
    let TwentyFourHour = now.getHours();
    let hour = now.getHours();
    let min = now.getMinutes();
    let sec = now.getSeconds();
    let mid = 'PM';
    if(sec < 10) { 
      sec = "0" + sec; 
    }
    if (min < 10) {
      min = "0" + min;
    }
    if (hour > 12) {
      hour = hour - 12;
    }   
    if (hour < 10 ) {
      hour = "0" + hour;
    }   
    if(hour==0){ 
      hour=12;
    }
    if(TwentyFourHour < 12) {
       mid = 'AM';
    }
  document.getElementById('currentTime').innerHTML = hour+':'+min+' '+mid ;
    setTimeout(clock, 1000);
    }
}
// ----------------------------------------------------------------

//                START MENU HIDE AND SHOW SCRIPT 
// ----------------------------------------------------------------
let startMenuDiv = document.getElementById('start-menu')
let startMenudisplay = 0;

function hideShow()
{
  if(startMenudisplay==1)
  {
    startMenuDiv.style.display="none";
    startMenudisplay = 0;
  }
  else
  {
    startMenuDiv.style.display="flex";
    startMenudisplay = 1;
  }

}
// ----------------------------------------------------------------
//                SHUT DOWN HIDE AND SHOW SCRIPT 
// ----------------------------------------------------------------

let shutDownDiv = document.getElementById('shut-down-tab-parent')
let shutDowndisplay = 0;

function shutDown()
{
  if(shutDowndisplay==1)
  {
    shutDownDiv.style.display="none";
    shutDowndisplay = 0;
  }
  else
  {
    shutDownDiv.style.display="flex";
    shutDowndisplay = 1;
  }
}

// ----------------------------------------------------------------

