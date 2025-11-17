const username = document.querySelector('#username');
const password = document.querySelector('#password');
const loginButton = document.querySelector('#login-button');
const textbox = document.querySelector('#text-box');
const logoutButton = document.querySelector('#logout-button');
const deleteButton = document.querySelector('#delete-button');
const profileWidget = document.querySelector('#profile-widget');
const profileUsername = document.querySelector('#profile-username');
const profileLogout = document.querySelector('#profile-logout');

function updateProfile(){
    if (!profileWidget || !profileUsername) return;
    const u = localStorage.getItem('username');
    if (u && localStorage.getItem('logged-in?') == 1){
        profileUsername.textContent = u;
        profileWidget.style.display = 'block';
    } else {
        profileWidget.style.display = 'none';
    }
}

function doLogin(){
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value })
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.ok){
            localStorage.setItem('username', username.value);
            localStorage.setItem('logged-in?', 1);
            textbox.innerHTML = 'Login efetuado com sucesso!';
            console.log('Login successful for', username.value);
            updateProfile();
        } else {
            textbox.innerHTML = data.message || 'Falha no login';
            console.log('Login failed', data);
        }
    })
    .catch(err => {
        console.error('Network/login error', err);
        textbox.innerHTML = 'Erro de rede — tente novamente mais tarde';
    });
}

if (loginButton) loginButton.addEventListener('click', doLogin);

username.addEventListener('keydown', function(e){ if (e.key == 'Enter') password.focus(); });
password.addEventListener('keydown', function(e){ if (e.key == 'Enter') doLogin(); });

function doLogout(){
    localStorage.removeItem('username');
    localStorage.removeItem('logged-in?');
    localStorage.removeItem('local-account-exists?');
    textbox.innerHTML = 'Você saiu da conta.';
    updateProfile();
}

function doDeleteAccount(){
    const storedUser = localStorage.getItem('username');
    if (!storedUser || localStorage.getItem('logged-in?') != 1){
        textbox.innerHTML = 'Você precisa estar logado para deletar a conta.';
        return;
    }
    if (username.value !== storedUser){
        textbox.innerHTML = 'Confirme seu nome de usuário atual antes de deletar.';
        return;
    }
    if (!password.value){
        textbox.innerHTML = 'Digite sua senha para confirmar a deleção.';
        return;
    }
    if (!confirm('Deseja realmente deletar sua conta? Esta ação é irreversível.')) return;

    fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value })
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.ok){
            textbox.innerHTML = 'Conta deletada com sucesso.';
            doLogout();
        } else {
            textbox.innerHTML = data.message || 'Falha ao deletar conta.';
        }
    })
    .catch(err => {
        console.error('Error deleting account', err);
        textbox.innerHTML = 'Erro de rede — tente novamente mais tarde';
    });
}

if (logoutButton) logoutButton.addEventListener('click', doLogout);
if (deleteButton) deleteButton.addEventListener('click', doDeleteAccount);

if (profileLogout) profileLogout.addEventListener('click', function(e){ e.preventDefault(); doLogout(); });

// initialize
updateProfile();
