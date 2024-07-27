import { faGithub, faGoogle, IconDefinition } from "@fortawesome/free-brands-svg-icons";

export interface UserRegisterInputs {
    userName: string;
    email: string;
    password: string
}

export interface UserLoginInputs {
    email: string;
    password: string
}

export interface AuthOption {
    code: string;
    icon: IconDefinition;
    text: string;
}

export const AUTH_FIRST_STEP: number = 0;
export const AUTH_SECOND_STEP: number = 1;

export const authOptions: AuthOption[] = [{code: 'Google', icon: faGoogle, text: 'Continue with Google'}, {code: 'Github', icon: faGithub, text: 'Continue with Github'} ]
