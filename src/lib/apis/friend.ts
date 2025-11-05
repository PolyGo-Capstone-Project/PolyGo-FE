import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  FriendRequestBodyType,
  GetFriendRequestsResType,
  GetFriendsQueryType,
  GetFriendsResType,
  GetSentFriendRequestsResType,
  MessageResType,
  SendFriendRequestBodyType,
} from "@/models";

const prefix = "/friends";

const friendApiRequest = {
  // Danh sách bạn bè
  getFriends: createGetAll<GetFriendsResType, GetFriendsQueryType>(prefix),
  // Danh sách lời mời kết bạn đến user - received
  getFriendRequests: createGetAll<
    GetFriendRequestsResType,
    GetFriendsQueryType
  >(`${prefix}/request/received`),
  // Danh sách gửi lời mời kết bạn từ user - sent
  getSentFriendRequests: createGetAll<
    GetSentFriendRequestsResType,
    GetFriendsQueryType
  >(`${prefix}/request/sent`),
  // Gửi lời mời kết bạn
  sendFriendRequest: (body: SendFriendRequestBodyType) =>
    http.post<MessageResType>(`${prefix}/request`, body),
  // Chấp nhận/ từ chối lời mời kết bạn
  acceptFriendRequest: (body: FriendRequestBodyType) =>
    http.post<MessageResType>(`${prefix}/request/accept`, body),
  rejectFriendRequest: (body: FriendRequestBodyType) =>
    http.post<MessageResType>(`${prefix}/request/reject`, body),
  // Hủy kết bạn
  removeFriend: (friendId: string) =>
    http.delete<MessageResType>(`${prefix}/${friendId}`),
  //hủy lời mời kết bạn đã gửi
  cancelFriendRequest: (receiverId: string) =>
    http.delete<MessageResType>(`${prefix}/request/${receiverId}`),
};

export default friendApiRequest;
