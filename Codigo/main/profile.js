(function(){
  const widget = document.getElementById('profile-widget');
  const usernameSpan = document.getElementById('profile-username');
  const logoutLink = document.getElementById('profile-logout');

  function updateProfile(){
    if (!widget || !usernameSpan) return;
    const u = localStorage.getItem('username');
    if (u && localStorage.getItem('logged-in?') == 1){
      usernameSpan.textContent = u;
      widget.style.display = 'flex';
    } else {
      widget.style.display = 'none';
    }
  }

  function doLogout(e){
    if (e) e.preventDefault();
    localStorage.removeItem('username');
    localStorage.removeItem('logged-in?');
    updateProfile();
    showBanner('Saindo...');
    setTimeout(()=> location.reload(), 600);
  }

  if (logoutLink) logoutLink.addEventListener('click', doLogout);


  updateProfile();

  let buffer = '';
  const target = 'awesome';
  const maxLen = target.length;

  function normalizeKey(k){
    if (!k) return '';
    // only letters; ignore modifiers
    if (k.length === 1) return k.toLowerCase();
    return '';
  }

  window.addEventListener('keydown', function(e){
    const k = normalizeKey(e.key);
    if (!k) return;
    buffer += k;
    if (buffer.length > maxLen) buffer = buffer.slice(-maxLen);
    if (buffer === target){

      location.replace('../credits/credits.html');

      const header = document.querySelector('header');
      if (header){
        header.style.transform = 'scale(1.02)';
        setTimeout(()=> header.style.transform = '', 300);
      }
      buffer = '';
    }
  });

})();
