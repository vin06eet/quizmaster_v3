const validateEmail = (email)=>{
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
    return email.match(emailRegex)
}

const validatePassword = (password)=>{
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return password.match(passwordRegex)
}

export {validateEmail, validatePassword}  