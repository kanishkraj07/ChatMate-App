import { useState } from "react";
import { InputBox } from "../../ui/InputBox"
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button";
import { IconButton } from "../../ui/IconButton";
import axios from "axios";
import { AuthOption, authOptions, UserLoginInputs } from "../../models/UserAuthDetails";

export const Signin = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const doLogin = async () => {
        setLoading(true);
       const response = await axios.post('http://localhost:3000/api/v1/auth/signin', {
            email,
            password
        } as UserLoginInputs);
        localStorage.setItem('token', response.data.token);
        navigate('/');
        setLoading(false);
    }

    return <>
    <main className="w-full grid grid-cols-2">
        <div className="w-full bg-primary-bg-50 h-screen">

        </div>
        <div className="w-full bg-primary-bg-30 h-screen flex flex-col justify-center items-center gap-5">
            <div className="w-2/5 flex flex-col justify-center items-center gap-5">
                <div className="text-primary-slate text-2xl font-semibold w-full text-center">Login Account</div>
                <InputBox type="text" placeholder="Email" setValue={setEmail}/>
                <InputBox type="password" placeholder="Password" setValue={setPassword}/>
                <Button label="Login" varient="green" onClick={doLogin}/>
                <div className="text-sm text-primary-slate">Don't have an account? <Link to="/" className="text-primary-blue font-semibold">Sign up</Link></div>
            </div>
            <div className="border-t border-primary-slate w-1/2"></div>

            <div className="flex flex-col w-2/5">
               {authOptions.map((option: AuthOption) => <IconButton key={option.code} text={option.text} icon={option.icon} onClick={() => {
                window.open(`http://localhost:3000/api/v1/auth/provider/${option.code.toLowerCase()}`)
               }} />)}
            </div>
        </div>
    </main>
    </>
}