const username = document.querySelector("#username");
const password = document.querySelector("#password");
const textbox = document.querySelector("#text-box");
const signupButton = document.querySelector('#signup-button');
const profileWidget = document.querySelector('#profile-widget');
const profileUsername = document.querySelector('#profile-username');
const profileLogout = document.querySelector('#profile-logout');

function doSignup(){
    if (localStorage.getItem("logged-in?") == 1){
        console.log("Attempted signup error. Already logged in.");
        textbox.innerHTML = "Você já está logado. Saia da sua conta para criar uma nova conta";
        return;
    }
    if (localStorage.getItem("local-account-exists?") == 1){
        console.log("Attempted signup error. Local account already exists.");
        textbox.innerHTML = "Você já tem uma conta, tente fazer login";
        return;
    }

    fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value })
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.ok){
            console.log("Signup successful (server). Username:", username.value);
            localStorage.setItem('username', username.value);
            localStorage.setItem('local-account-exists?', 1);
            textbox.innerHTML = "Conta criada com sucesso!";
            updateProfile();
        } else if (data && data.message){
            console.log("Signup failed:", data.message);
            textbox.innerHTML = data.message;
        } else {
            console.log("Signup failed: unknown response", data);
            textbox.innerHTML = "Erro ao criar conta";
        }
    })
    .catch(err => {
        console.error("Network or server error during signup:", err);
        textbox.innerHTML = "Erro de rede — tente novamente mais tarde";
    });
}

username.addEventListener("keydown", function(event){
    if (event.key == 'Enter'){
        password.focus();
    }
})

password.addEventListener("keydown", function(event){
    if (event.key == 'Enter'){
        doSignup();
    }
})

if (signupButton) signupButton.addEventListener('click', doSignup);

function doLogout(){
    localStorage.removeItem('username');
    localStorage.removeItem('logged-in?');
    localStorage.removeItem('local-account-exists?');
    textbox.innerHTML = 'Você saiu da conta.';
    updateProfile();
}

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

if (profileLogout) profileLogout.addEventListener('click', function(e){ e.preventDefault(); doLogout(); });

// Initialize profile widget on load
updateProfile();
