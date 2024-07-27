
interface LineInputBoxProps {
    placeholder: string,
    type: string,
    setValue: (value: string) => void
}

export const LineInputBox = ({placeholder, type, setValue}: LineInputBoxProps) => {
    return <>
    <input onChange={(e) => setValue(e.target.value)} className="w-full flex justify-end outline-0 placeholder:font-semibold placeholder:text-base text-[#f0f9ff] bg-transparent p-2 px-3 mb-3 text-lg border-0 border-b border-b-gray-600 focus:outline-none focus:border-b-primary-green focus:ring-0  transition-colors duration-100 ease-out" placeholder={placeholder} type={type}></input>
    </>
}