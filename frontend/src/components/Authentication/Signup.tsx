import { useEffect, useState } from "react"
import { InputBox } from "../../ui/InputBox"
import { Button } from "../../ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { IconButton } from "../../ui/IconButton";
import axios from "axios";
import { AUTH_FIRST_STEP, AUTH_SECOND_STEP, AuthOption, authOptions } from "../../models/UserAuthDetails";
import ProfilePhoto from "../../ui/ProfilePhoto";
import { LineInputBox } from "../../ui/LineInput";
import { ArrowLeft } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowLeftLong, faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import UploadPic from "../../ui/UploadPic";


export const Signup = () => {
    const [email, setEmail] = useState<string>('');
    const [userName, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword]  = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastname] = useState<string>('');
    const [profilePicFile, setProfilePicFile] = useState<File>();
    const [isDoSignUp, setIsDoSignUp]  = useState<boolean>(false);

    const [currentStep, setCurrentStep] = useState<number>(AUTH_FIRST_STEP);
    const navigate = useNavigate();


    useEffect(() => {
        if(isDoSignUp && userName && email && password) {
            (async() => {
                const formData = new FormData();
    
                    formData.append('userName', userName);
                    formData.append('email', email)
                    formData.append('password', password)
                    formData.append('firstName', firstName)
                    formData.append('lastName', lastName)
                    formData.append('profileDp', profilePicFile || '')
                
                    try {
                        const response: any = await axios.post('http://localhost:3000/api/v1/auth/signup', formData, {
                            headers: {
                                "Content-Type": 'multipart/form-data'
                            }
                         });
                            localStorage.setItem('token', response.data.token);
                            navigate('/');
                    }catch(e) {
                        setIsDoSignUp(false);
                    }
              
            })()
        }
    }, [isDoSignUp])
       

    const continueToNextStep = () => {
        setCurrentStep(currentStep + 1);
    }

    return <>
    <main className="w-full grid grid-cols-2">
        <div className="w-full bg-primary-bg-50 h-screen">

        </div>
        <div className="w-full bg-primary-bg-30 h-screen flex flex-col justify-center items-center gap-5">
          <div className="w-2/5">
          { currentStep === AUTH_FIRST_STEP &&  <AuthFirstStepLayout setEmail={setEmail} setPassword={setPassword} setUsername={setUsername} setConfirmPassword={setConfirmPassword} continueToNextStep={continueToNextStep}  />}
        {
            currentStep === AUTH_SECOND_STEP && <AuthSecondStepLayout setFirstName={setFirstName} setLastName={setLastname} setIsDoSignup={setIsDoSignUp} setProfilePicFile={setProfilePicFile} setCurrentStep={setCurrentStep} />
        }
        </div>
        </div>
    </main>
    </>
}



export interface AuthFirstStepLayoutProps {
    setEmail: (T: string) => void;
    setUsername: (T: string) => void;
    setPassword: (T: string) => void;
    setConfirmPassword: (T: string) => void;
    continueToNextStep:() => void
}

export interface AuthSecondStepLayoutProps {
    setIsDoSignup: (T: boolean) => void;
    setFirstName: (T: string) => void;
    setLastName: (T: string) => void;
    setProfilePicFile: (T: File) => void;
    setCurrentStep: (T: (T: number) => number) => void;

}

const AuthFirstStepLayout = ({setEmail, setUsername, setPassword, setConfirmPassword, continueToNextStep}: AuthFirstStepLayoutProps) => {

    return <div className="w-full flex flex-col justify-center items-center gap-7">
    <div className="text-primary-slate text-2xl font-semibold w-full text-center">Create Account</div>
    <InputBox type="text" placeholder="Username" setValue={setUsername}/>
    <InputBox type="text" placeholder="Email" setValue={setEmail}/>
    <InputBox type="password" placeholder="Password" setValue={setPassword}/>
    <InputBox type="password" placeholder="Confirm Password" setValue={setConfirmPassword}/>
    <Button label="Continue" icon={faArrowRightLong} varient="blue" onClick={continueToNextStep}/>
    <div className="text-sm text-primary-slate">Already have an account? <Link to="/signin" className="text-primary-blue font-semibold">Login</Link></div>
    <div className="border-t border-primary-slate w-full"></div>
    <div className="w-full flex flex-col">
        {authOptions.map((option: AuthOption) => <IconButton key={option.code} text={option.text} icon={option.icon} onClick={() => {
            window.open(`http://localhost:3000/api/v1/auth/provider/${option.code.toLowerCase()}`)}} />)}
    </div> 
</div>
}

const AuthSecondStepLayout = ({setIsDoSignup, setFirstName, setLastName, setCurrentStep, setProfilePicFile}: AuthSecondStepLayoutProps) => {
    
    return <div className="w-full flex flex-col justify-center items-center gap-7 py-5 relative">
        <UploadPic setFileData={setProfilePicFile}/>
        <LineInputBox type="text" placeholder="First Name" setValue={setFirstName} />
        <LineInputBox type="text" placeholder="Last Name" setValue={setLastName} />
        <label className="text-light-slate text-base">
        <input className="mr-2" type="checkbox"></input>
        By creating an account, I agree to the <Link to="/" className="text-primary-blue">Terms of Service</Link> and <Link to="/" className="text-primary-blue">our Privacy Policy</Link>
        </label>
        <Button label="Create Account" varient="green" onClick={() => setIsDoSignup(true)}/>
        <button className="absolute right-full top-0 text-xl" onClick={() => setCurrentStep((currentStep: number) => currentStep - 1)}>
            <FontAwesomeIcon icon={faArrowLeftLong}  color="#e5e7eb"/>
        </button>    
    </div>
}