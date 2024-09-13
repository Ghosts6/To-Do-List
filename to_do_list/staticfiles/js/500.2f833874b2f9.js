document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function(){
    document.body.classList.remove('loading');
  }, 1000);
});

setTimeout(function() {
    window.location.href = '../home';
}, 120000);
