import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import './LoginWebPage.css';
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { handleLoginService, checkPhonenumberEmail, createNewUser } from '../../services/userService';
import Otp from "./Otp";
import { authentication } from "../../utils/firebase";
import { signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth'
const LoginWebPage = () => {

    const [inputValues, setInputValues] = useState({
        email: '', password: 'passwordsecrect', firstName: '', lastName: '', phonenumber: '', isOpen: false, dataUser: {}
    });
    const [isSignup, setIsSignup] = useState(false); // false = login form, true = signup form
    
    const handleOnChange = event => {
        const { name, value } = event.target;
        setInputValues(prev => ({ ...prev, [name]: value }));

    };
    const handleSwitchClick = event => {
        event.preventDefault();
        setIsSignup(prev => !prev);
    };
    let handleLogin = async (event) => {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }
        let res = await handleLoginService({
            email: inputValues.email,
            password: inputValues.password
        })


        if (res && res.errCode === 0) {


            localStorage.setItem("userData", JSON.stringify(res.user))
            localStorage.setItem("token", JSON.stringify(res.accessToken))
            if (res.user.roleId === "R1" || res.user.roleId === "R4") {
                window.location.href = "/admin"

            }
            else {
                window.location.href = "/"
            }
        }
        else {
            toast.error(res.errMessage)
        }
    }
    let handleLoginSocial = async (email) => {
        let res = await handleLoginService({
            email: email,
            password: inputValues.password
        })


        if (res && res.errCode === 0) {


            localStorage.setItem("userData", JSON.stringify(res.user))
            localStorage.setItem("token", JSON.stringify(res.accessToken))
            if (res.user.roleId === "R1" || res.user.roleId === "R4") {
                window.location.href = "/admin"

            }
            else {
                window.location.href = "/"
            }
        }
        else {
            toast.error(res.errMessage)
        }
    }

    let handleSaveUser = async (event) => {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        // Normalize full name: signup form uses a single input (name="firstName") for full name.
        // If user provided only fullName in firstName, split into firstName + lastName for backend.
        const fullName = (inputValues.firstName || '').trim();
        let firstNameVal = inputValues.firstName || '';
        let lastNameVal = inputValues.lastName || '';
        if (fullName && !lastNameVal) {
            const parts = fullName.split(/\s+/);
            if (parts.length === 1) {
                firstNameVal = parts[0];
                lastNameVal = '';
            } else {
                lastNameVal = parts.pop();
                firstNameVal = parts.join(' ');
            }
        }

        let res = await checkPhonenumberEmail({
            phonenumber: inputValues.phonenumber,
            email: inputValues.email
        })
        if (res.isCheck === true) {
            toast.error(res.errMessage)
        } else {
            setInputValues(prev => ({
                ...prev,
                firstName: firstNameVal,
                lastName: lastNameVal,
                dataUser: {
                    email: prev.email,
                    firstName: firstNameVal,
                    lastName: lastNameVal,
                    phonenumber: prev.phonenumber,
                    password: prev.password,
                    roleId: 'R2',
                },
                isOpen: true
            }))
        }

    }
    const getBase64FromUrl = async (url) => {

        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve(base64data);
            }
        });
    }
    let signInwithFacebook = () => {
        const provider = new FacebookAuthProvider()
        signInWithPopup(authentication, provider)
            .then((re) => {

                LoginWithSocial(re)

            })
            .catch((err) => {
                console.log(err.message)
            })
    }
    let LoginWithSocial = async (re) => {
        let res = await checkPhonenumberEmail({
            phonenumber: re.user.providerData[0].phoneNumber,
            email: re.user.providerData[0].email
        })

        if (res.isCheck === true) {
            setInputValues(prev => ({
                ...prev,
                email: re.user.providerData[0].email,


            }))
            handleLoginSocial(re.user.providerData[0].email)

        } else {
            getBase64FromUrl(re.user.providerData[0].photoURL).then(async (value) => {

                let res = await createNewUser({


                    email: re.user.providerData[0].email,
                    lastName: re.user.providerData[0].displayName,
                    phonenumber: re.user.providerData[0].phoneNumber,
                    avatar: value,
                    roleId: "R2",
                    password: inputValues.password
                })
                if (res && res.errCode === 0) {
                    toast.success("Tạo tài khoản thành công")
                    handleLoginSocial(re.user.providerData[0].email)


                } else {
                    toast.error(res.errMessage)
                }
            })


        }
    }
    let signInwithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        signInWithPopup(authentication, provider)
            .then(async (re) => {

                LoginWithSocial(re)

            })
            .catch((err) => {
                console.log(err.message)
            })
    }

    useEffect(() => {
        const groups = Array.from(document.querySelectorAll('.form .form-group'));
        const handlers = groups.map(group => {
            const input = group.querySelector('input');
            const label = group.querySelector('label');
            if (!input || !label) return null;
            const onFocus = () => label.classList.add('active');
            const onBlur = () => { if (!input.value) label.classList.remove('active'); };
            const onInput = () => { if (input.value && input.value.toString().trim() !== '') label.classList.add('active'); else label.classList.remove('active'); };
            input.addEventListener('focus', onFocus);
            input.addEventListener('blur', onBlur);
            input.addEventListener('input', onInput);
            if (input.value && input.value.toString().trim() !== '') label.classList.add('active');
            return { input, onFocus, onBlur, onInput };
        });
        return () => {
            handlers.forEach(h => {
                if (!h) return;
                h.input.removeEventListener('focus', h.onFocus);
                h.input.removeEventListener('blur', h.onBlur);
                h.input.removeEventListener('input', h.onInput);
            });
        };
    }, [inputValues.isOpen, isSignup]);

    return (
        <>
            {inputValues.isOpen === false &&
                <div className="box-login">
                    <div className="login-container">
                        <section id="formHolder">
                            <div className="row">
                                {/* Brand Box */}
                                <div className="col-sm-6 brand">
                                    <a href="/" className="logo">MR <span>.</span></a>
                                    <div className="heading">
                                        <h2>Esier</h2>
                                        <p>Sự lựa chọn của bạn</p>
                                    </div>

                                </div>
                                {/* Form Box */}
                                <div className="col-sm-6 form">
                                    {/* Login Form */}
                                    <div className={`login form-peice ${isSignup ? 'switched' : ''}`}>
                                        <form className="login-form" onSubmit={handleLogin}>
                                            <div className="form-group">
                                                <label htmlFor="loginemail">Địa chỉ email</label>
                                                <input name="email" onChange={(event) => handleOnChange(event)} type="email" id="loginemail" required />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="loginPassword">Mật khẩu</label>
                                                <input name="password" onChange={(event) => handleOnChange(event)} type="password" id="loginPassword" required />
                                            </div>
                                            <div className="CTA">
                                                <input type="submit" value="Đăng nhập" />
                                                <a href="/" onClick={handleSwitchClick} style={{ cursor: 'pointer' }} className="switch">Tài khoản mới</a>
                                            </div>
                                            <FacebookLoginButton text="Đăng nhập với Facebook" iconSize="25px" style={{ width: "300px", height: "40px", fontSize: "16px", marginTop: "40px", marginBottom: "10px" }} onClick={() => signInwithFacebook()} />
                                            <GoogleLoginButton text="Đăng nhập với Google" iconSize="25px" style={{ width: "300px", height: "40px", fontSize: "16px" }} onClick={() => signInwithGoogle()} />
                                        </form>
                                    </div>{/* End Login Form */}
                                    {/* Signup Form */}
                                    <div className={`signup form-peice ${isSignup ? '' : 'switched'}`}>
                                        <form className="signup-form" onSubmit={handleSaveUser}>
                                            <div className="form-group">
                                                <label htmlFor="fullName">Họ và tên</label>
                                                <input type="text" name="firstName" onChange={(event) => handleOnChange(event)} id="fullName" className="name" />
                                                <span className="error" />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="email">Địa chỉ email</label>
                                                <input type="email" name="email" onChange={(event) => handleOnChange(event)} id="email" className="email" />
                                                <span className="error" />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="phone">Số điện thoại</label>
                                                <input type="text" name="phonenumber" onChange={(event) => handleOnChange(event)} id="phone" />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="password">Mật khẩu</label>
                                                <input type="password" name="password" onChange={(event) => handleOnChange(event)} id="password" className="pass" />
                                                <span className="error" />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="passwordCon">Xác nhận mật khẩu</label>
                                                <input type="password" name="passwordCon" id="passwordCon" className="passConfirm" />
                                                <span className="error" />
                                            </div>
                                            <div className="CTA">
                                                <input type="submit" value="Lưu" id="submit" />
                                                <a href="/" onClick={handleSwitchClick} style={{ cursor: 'pointer' }} className="switch">Tôi có tài khoản</a>
                                            </div>
                                        </form>
                                    </div>{/* End Signup Form */}
                                </div>
                            </div>
                        </section>

                    </div>


                </div>
            }


            {inputValues.isOpen === true &&
                <Otp
                    dataUser={inputValues.dataUser}
                    onGoBack={() => {
                        setInputValues(prev => ({ ...prev, isOpen: false }));
                        setIsSignup(true);
                    }}
                />
            }
        </>
    )

}
export default LoginWebPage;
