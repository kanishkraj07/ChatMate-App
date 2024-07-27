const ConvertTime = (date: Date): string => {
    let hours: number = date.getHours();
    let minutes: number = date.getMinutes();
    let merdian: string = hours === 24 || (hours >=1 && hours < 12) ? 'AM' : 'PM' ;
   const convertedHours: string = `${hours > 0 && hours < 10 ? '0' : ''}${hours}`;
   const convertedMinutes: string = `${minutes >= 0  && minutes < 10 ? '0' : ''}${minutes}`;
    return `${convertedHours}:${convertedMinutes} ${merdian}`;
}

export default ConvertTime;