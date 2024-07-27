export const extractName = (userDetails: any): string => {
    if(userDetails.firstName && userDetails.lastName) {
        return `${userDetails.firstName} ${userDetails.lastName}`
    }
    if(userDetails.userName) {
        return userDetails.userName;
    }

    if(userDetails.firstName) {
        return `${userDetails.firstName}`
    }
    return userDetails.email;
}