
interface InputBoxProps {
    placeholder: string,
    type: string,
    setValue: (value: string) => void
}

export const InputBox = ({placeholder, type, setValue}: InputBoxProps) => {
    return <>
    <input onChange={(e) => setValue(e.target.value)} className="w-full flex justify-end outline-0 text-[#f0f9ff] bg-primary-bg p-2 px-3 text-lg font-lg rounded-md focus:ring-2 focus:ring-inset" placeholder={placeholder} type={type}></input>
    </>
}