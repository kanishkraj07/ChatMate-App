interface CountAlertProps {
    count: number
}

const CountAlert = ({count}: CountAlertProps) => {
    return <div className="size-6 rounded-full bg-primary-red text-primary-slate text-center font-medium text-sm flex justify-center items-center">
        <span className="mt-1">{count}</span></div>
}

export default CountAlert;