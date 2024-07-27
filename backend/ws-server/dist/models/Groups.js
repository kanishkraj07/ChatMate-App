"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupPublishSubType = exports.UserGroupStatus = exports.GroupSubType = void 0;
var GroupSubType;
(function (GroupSubType) {
    GroupSubType["CREATE"] = "create";
    GroupSubType["ADD_MEMBERS"] = "addMembers";
    GroupSubType["MESSAGE"] = "message";
    GroupSubType["SEEN_MESSAGES"] = "seenMessages";
    GroupSubType["LEFT"] = "left";
})(GroupSubType || (exports.GroupSubType = GroupSubType = {}));
var UserGroupStatus;
(function (UserGroupStatus) {
    UserGroupStatus["JOINED"] = "joined";
    UserGroupStatus["LEFT"] = "left";
})(UserGroupStatus || (exports.UserGroupStatus = UserGroupStatus = {}));
var GroupPublishSubType;
(function (GroupPublishSubType) {
    GroupPublishSubType["MEMBER_ADDED"] = "memberAdded";
    GroupPublishSubType["LEFT"] = "left";
    GroupPublishSubType["MESSAGE"] = "message";
    GroupPublishSubType["CREATED"] = "created";
})(GroupPublishSubType || (exports.GroupPublishSubType = GroupPublishSubType = {}));
