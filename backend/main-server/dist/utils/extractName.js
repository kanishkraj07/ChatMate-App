"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractName = void 0;
const extractName = (userDetails) => {
    if (userDetails.firstName && userDetails.lastName) {
        return `${userDetails.firstName} ${userDetails.lastName}`;
    }
    if (userDetails.userName) {
        return userDetails.userName;
    }
    if (userDetails.firstName) {
        return `${userDetails.firstName}`;
    }
    return userDetails.email;
};
exports.extractName = extractName;
