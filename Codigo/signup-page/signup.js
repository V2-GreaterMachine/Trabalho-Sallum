const username = document.querySelector("#username");
const password = document.querySelector("#password");

username.addEventListener("keydown", function(){
    if (event.key == 'Enter'){
        password.focus();
    }
})

password.addEventListener("keydown", function(){
    if (event.key == 'Enter'){
        if (localStorage.getItem("logged-in?") == 1){
            console.log("Attempted signup error. Already logged in.");
        }   else if(localStorage.getItem("local-account-exists?") == 1){
            console.log("Attempted signup error. Local account already exists.");
        }   else {
            console.log("Attempted signup sucessful. Username: ", username.value, " Password: ", password.value);
        localStorage.setItem('username', username.value);
        localStorage.setItem('password', password.value);
        localStorage.setItem('local-account-exists?', 1);
        }
    }
})
