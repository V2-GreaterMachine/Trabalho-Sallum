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
    // Try login against server, but if not available, validate against localStorage users map
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
            // If server responds but indicates login failed, try local fallback
            console.log('Login failed (server):', data);
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const name = username.value;
            const pass = password.value;
            if (users[name] && users[name] === pass){
                localStorage.setItem('username', name);
                localStorage.setItem('logged-in?', 1);
                textbox.innerHTML = 'Login efetuado localmente (offline)!';
                updateProfile();
            } else {
                textbox.innerHTML = data.message || 'Falha no login';
            }
        }
    })
    .catch(err => {
        // Fallback to localStorage validation instead of showing a network error
        console.warn('Network/login error; falling back to local login:', err);
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const name = username.value;
        const pass = password.value;
        if (users[name] && users[name] === pass){
            localStorage.setItem('username', name);
            localStorage.setItem('logged-in?', 1);
            textbox.innerHTML = 'Login efetuado localmente (offline)!';
            updateProfile();
        } else if (!users[name]){
            textbox.innerHTML = 'Conta não encontrada localmente. Se estiver offline, cadastre uma conta primeiro.';
        } else {
            textbox.innerHTML = 'Senha incorreta.';
        }
    });
}

if (loginButton) loginButton.addEventListener('click', doLogin);

username.addEventListener('keydown', function(e){ if (e.key == 'Enter') password.focus(); });
password.addEventListener('keydown', function(e){ if (e.key == 'Enter') doLogin(); });

function doLogout(){
    localStorage.removeItem('username');
    localStorage.removeItem('logged-in?');
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
            // also remove local copy if any
            const name = username.value;
            let users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[name]){
                delete users[name];
                localStorage.setItem('users', JSON.stringify(users));
            }
            if (Object.keys(users).length === 0){
                localStorage.removeItem('local-account-exists?');
            }
            doLogout();
        } else {
            textbox.innerHTML = data.message || 'Falha ao deletar conta.';
        }
    })
    .catch(err => {
        // If network fails, attempt to delete the account from localStorage
        console.warn('Error deleting account (server). Attempting to delete local account:', err);
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const name = username.value;
        const pass = password.value;
        if (users[name] && users[name] === pass){
            delete users[name];
            localStorage.setItem('users', JSON.stringify(users));
            // if no more users, clear the marker
            if (Object.keys(users).length === 0){
                localStorage.removeItem('local-account-exists?');
            }
            textbox.innerHTML = 'Conta deletada localmente.';
            doLogout();
        } else if (!users[name]){
            textbox.innerHTML = 'Conta não encontrada localmente.';
        } else {
            textbox.innerHTML = 'Senha incorreta.';
        }
    });
}

if (logoutButton) logoutButton.addEventListener('click', doLogout);
if (deleteButton) deleteButton.addEventListener('click', doDeleteAccount);

if (profileLogout) profileLogout.addEventListener('click', function(e){ e.preventDefault(); doLogout(); });

// initialize
updateProfile();
